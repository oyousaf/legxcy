import { supabase } from "../lib/supabase.js";

export const getCoupon = async (req, res) => {
  try {
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("userId", req.user.id)
      .eq("isActive", true)
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    res.json(coupon || null);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("userId", req.user.id)
      .eq("isActive", true)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    if (new Date(coupon.expirationDate) < new Date()) {
      await supabase
        .from("coupons")
        .update({ isActive: false, updatedAt: new Date().toISOString() })
        .eq("id", coupon.id);
      return res.status(404).json({ message: "Coupon expired" });
    }

    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
