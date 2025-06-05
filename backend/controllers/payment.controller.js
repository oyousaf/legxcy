import { supabase } from "../lib/supabase.js";
import { stripe } from "../lib/stripe.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    // Prepare Stripe line items
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity || 1,
    }));

    // Coupon logic
    let stripeCouponId = null;
    if (couponCode) {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (coupon && coupon.discount_percentage) {
        const stripeCoupon = await stripe.coupons.create({
          percent_off: coupon.discount_percentage,
          duration: "once",
        });
        stripeCouponId = stripeCoupon.id;
      }
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : [],
      metadata: {
        userId,
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p.id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res
      .status(500)
      .json({ message: "Error processing checkout", error: error.message });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, couponCode, products } = session.metadata;

    // Deactivate coupon if used
    if (couponCode) {
      await supabase
        .from("coupons")
        .update({ is_active: false })
        .eq("code", couponCode)
        .eq("user_id", userId);
    }

    // Create order in Supabase
    const { error: orderError } = await supabase.from("orders").insert([
      {
        user_id: userId,
        products,
        total_amount: session.amount_total / 100,
        stripe_session_id: session.id,
        created_at: new Date(),
      },
    ]);
    if (orderError) {
      console.error("Error creating order:", orderError.message);
    }
  }

  res.status(200).json({ received: true });
};

// Optionally, a legacy/manual purchase success endpoint (not needed if using webhook)
export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Deactivate coupon if used
      if (session.metadata.couponCode) {
        await supabase
          .from("coupons")
          .update({ isActive: false })
          .eq("code", session.metadata.couponCode)
          .eq("userId", session.metadata.userId);
      }

      // Parse products from metadata
      const products = JSON.parse(session.metadata.products);

      // Insert order into orders table ONLY (products as JSON)
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            userId: session.metadata.userId,
            products: JSON.stringify(products),
            totalAmount: session.amount_total / 100,
            stripeSessionId: sessionId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (orderError) throw orderError;

      res.status(200).json({
        success: true,
        message:
          "Payment successful, order created, and coupon deactivated if used.",
        orderId: order.id,
      });
    }
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message,
    });
  }
};

