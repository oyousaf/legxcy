import { supabase } from "../lib/supabase.js";
import { verifyStripeSignature } from "../lib/stripe-verify.js";
import { getRawBody } from "../lib/getRawBody.js";

const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const CLIENT_URL = Deno.env.get("CLIENT_URL");

export const createCheckoutSession = async (req, res) => {
  try {
    console.log("↪️ Incoming createCheckoutSession");

    const { products, couponCode } = req.body || {};
    const userId = req.user?.id;

    if (!STRIPE_KEY || !CLIENT_URL) {
      console.error("❌ Missing Stripe ENV vars");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    if (!userId) {
      console.warn("❌ No user ID found in request");
      return res.status(401).json({ error: "Unauthorized." });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    const line_items = products.reduce((acc, product, i) => {
      acc[`line_items[${i}][price_data][currency]`] = "gbp";
      acc[`line_items[${i}][price_data][product_data][name]`] = product.name;
      acc[`line_items[${i}][price_data][product_data][images][0]`] =
        product.image;
      acc[`line_items[${i}][price_data][unit_amount]`] = Math.round(
        product.price * 100
      );
      acc[`line_items[${i}][quantity]`] = product.quantity || 1;
      return acc;
    }, {});

    let couponParams = {};
    if (couponCode) {
      const { data: coupon, error: couponErr } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("userId", userId)
        .eq("isActive", true)
        .single();

      if (couponErr) {
        console.warn("⚠️ No valid coupon found");
      }

      if (coupon?.discountPercentage) {
        const couponRes = await fetch("https://api.stripe.com/v1/coupons", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STRIPE_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            percent_off: coupon.discountPercentage.toString(),
            duration: "once",
          }),
        });

        const stripeCoupon = await couponRes.json();
        if (stripeCoupon?.id) {
          couponParams["discounts[0][coupon]"] = stripeCoupon.id;
        } else {
          console.warn("⚠️ Failed to create Stripe coupon");
        }
      }
    }

    const body = new URLSearchParams({
      payment_method_types[]: "card",
      mode: "payment",
      success_url: `${CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/purchase-cancel`,
      "metadata[userId]": userId,
      "metadata[couponCode]": couponCode || "",
      "metadata[products]": JSON.stringify(
        products.map((p) => ({
          id: p.id,
          quantity: p.quantity,
          price: p.price,
        }))
      ),
      ...line_items,
      ...couponParams,
    });

    const sessionRes = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const session = await sessionRes.json();

    if (session.error || !session.id) {
      console.error("❌ Stripe session error:", session.error);
      return res.status(500).json({ error: "Failed to create Stripe session" });
    }

    console.log("✅ Checkout session created:", session.id);
    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("❌ Fatal error creating checkout session:", error);
    return res.status(500).json({ error: "Checkout session failed" });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    const sessionRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${STRIPE_KEY}`,
        },
      }
    );

    const session = await sessionRes.json();

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed." });
    }

    const { userId, couponCode } = session.metadata || {};
    if (!userId)
      return res
        .status(400)
        .json({ message: "Missing userId in session metadata." });

    if (couponCode) {
      await supabase
        .from("coupons")
        .update({ isActive: false })
        .eq("code", couponCode)
        .eq("userId", userId);
    }

    const products = JSON.parse(session.metadata.products || "[]");

    const { data: order, error } = await supabase
      .from("orders")
      .upsert(
        [
          {
            userId,
            products: JSON.stringify(products),
            totalAmount: session.amount_total / 100,
            stripeSessionId: session.id,
            createdAt: new Date().toISOString(),
          },
        ],
        { onConflict: "stripeSessionId" }
      )
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("❌ Checkout success error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const rawBody = await getRawBody(req);
    const event = await verifyStripeSignature(rawBody, sig, WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { userId, couponCode } = session.metadata || {};

      if (couponCode) {
        await supabase
          .from("coupons")
          .update({ isActive: false })
          .eq("code", couponCode)
          .eq("userId", userId);
      }

      if (userId && session.amount_total) {
        const products = JSON.parse(session.metadata.products || "[]");

        await supabase.from("orders").upsert(
          [
            {
              userId,
              products: JSON.stringify(products),
              totalAmount: session.amount_total / 100,
              stripeSessionId: session.id,
              createdAt: new Date().toISOString(),
            },
          ],
          { onConflict: "stripeSessionId" }
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Stripe webhook error:", error);
    return res.status(400).json({ error: "Webhook error" });
  }
};
