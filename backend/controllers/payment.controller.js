import { supabase } from "../lib/supabase.js";
import { stripe } from "../lib/stripe.js";

// CREATE CHECKOUT SESSION
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

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
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("userId", userId)
        .eq("isActive", true)
        .single();

      if (coupon && coupon.discount_percentage) {
        const stripeCoupon = await stripe.coupons.create({
          percent_off: coupon.discount_percentage,
          duration: "once",
        });
        stripeCouponId = stripeCoupon.id;
      }
    }

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

// CHECKOUT SUCCESS
export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed." });
    }

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

    // Insert or update order
    const { data: order, error } = await supabase
      .from("orders")
      .upsert(
        [
          {
            userId: session.metadata.userId,
            products: JSON.stringify(products),
            totalAmount: session.amount_total / 100,
            stripeSessionId: sessionId,
            createdAt: new Date().toISOString(),
          },
        ],
        { onConflict: "stripeSessionId" }
      )
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message:
        "Payment successful, order created (upserted), and coupon deactivated if used.",
      orderId: order.id,
    });
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message,
    });
  }
};
