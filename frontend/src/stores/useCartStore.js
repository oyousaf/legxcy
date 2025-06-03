import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import { useUserStore } from "./useUserStore";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  // Get my user's applied coupon (from user_coupons, or similar)
  getMyCoupon: async () => {
    try {
      // Assuming only one coupon per user
      const { user } = useUserStore.getState();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_coupons")
        .select("coupon:coupon_id(*)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      set({ coupon: data?.coupon || null, isCouponApplied: !!data?.coupon });
    } catch (error) {
      set({ coupon: null, isCouponApplied: false });
    }
  },

  applyCoupon: async (code) => {
    try {
      // Validate the coupon code
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("isActive", true)
        .single();

      if (error || !coupon) throw new Error("Invalid or inactive coupon");

      // Save coupon to user's account (optional, can be just in-memory)
      const { user } = useUserStore.getState();
      if (user) {
        // Upsert user's coupon (one per user)
        await supabase
          .from("user_coupons")
          .upsert({ user_id: user.id, coupon_id: coupon.id });
      }

      set({ coupon, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.message || "Failed to apply coupon");
    }
  },

  removeCoupon: async () => {
    const { user } = useUserStore.getState();
    if (user) {
      // Remove coupon from user_coupons table
      await supabase.from("user_coupons").delete().eq("user_id", user.id);
    }
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },

  // Fetch cart items for logged-in user from Supabase
  getCartItems: async () => {
    const { user } = useUserStore.getState();
    if (!user) {
      set({ cart: [] });
      return;
    }
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, product:product_id(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      const cart = (data || []).map((item) => ({
        ...item.product,
        id: item.product_id,
        quantity: item.quantity,
      }));

      set({ cart });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.message || "An error occurred");
    }
  },

  clearCart: async () => {
    const { user } = useUserStore.getState();
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    }
    set({ cart: [], coupon: null, total: 0, subtotal: 0 });
  },

  // Add product to cart (logged-in user: Supabase; guest: local only)
  addToCart: async (product) => {
    const { user } = useUserStore.getState();

    if (user) {
      // Upsert cart item in DB
      const { error } = await supabase
        .from("cart_items")
        .upsert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        })
        .eq("user_id", user.id)
        .eq("product_id", product.id);

      if (error) {
        toast.error(error.message || "An error occurred");
        return;
      }
    }

    set((prevState) => {
      const existingItem = prevState.cart.find(
        (item) => item.id === product.id
      );
      const newCart = existingItem
        ? prevState.cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevState.cart, { ...product, quantity: 1 }];
      return { cart: newCart };
    });
    get().calculateTotals();
    toast.success("Product added to cart");
  },

  removeFromCart: async (productId) => {
    const { user } = useUserStore.getState();
    if (user) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    }
    set((prevState) => ({
      cart: prevState.cart.filter((item) => item.id !== productId),
    }));
    get().calculateTotals();
  },

  updateQuantity: async (productId, quantity) => {
    const { user } = useUserStore.getState();

    if (quantity === 0) {
      get().removeFromCart(productId);
      return;
    }

    if (user) {
      await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("user_id", user.id)
        .eq("product_id", productId);
    }
    set((prevState) => ({
      cart: prevState.cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
    get().calculateTotals();
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subtotal;

    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    set({ subtotal, total });
  },
}));
