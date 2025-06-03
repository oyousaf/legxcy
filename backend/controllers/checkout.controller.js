const supabase = require("../lib/supabase");
const { stripe } = require("../lib/stripe");

// Create checkout session with Stripe
exports.createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100);
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: "gbp",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    let coupon = null;
    if (couponCode) {
      const { data: couponData, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("userId", req.user.id)
        .eq("isActive", true)
        .single();
      if (couponError) {
        // Coupon not found, just skip
      } else if (couponData) {
        coupon = couponData;
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user.id,
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

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user.id);
    }
    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res
      .status(500)
      .json({ message: "Error processing checkout", error: error.message });
  }
};

// Handle checkout success and create order in Supabase
exports.checkoutSuccess = async (req, res) => {
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

      // Create Order
      const products = JSON.parse(session.metadata.products);
      // Insert into orders table
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            userId: session.metadata.userId,
            totalAmount: session.amount_total / 100,
            stripeSessionId: sessionId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (orderError) throw orderError;

      // Insert order line items (order_products)
      const orderProductRows = products.map((product) => ({
        orderId: order.id,
        productId: product.id,
        quantity: product.quantity,
        price: product.price,
      }));

      const { error: opError } = await supabase
        .from("order_products")
        .insert(orderProductRows);
      if (opError) throw opError;

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

// Helper: create Stripe coupon
async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

// Helper: create and assign new coupon in Supabase
async function createNewCoupon(userId) {
  // Delete any existing coupon for this user
  await supabase.from("coupons").delete().eq("userId", userId);

  // Generate new coupon code
  const newCoupon = {
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    userId: userId,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const { error } = await supabase.from("coupons").insert([newCoupon]);
  if (error) throw error;
  return newCoupon;
}
