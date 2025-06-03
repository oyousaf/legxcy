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

  // Get the coupon applied by the current user
  getMyCoupon: async () => {
    try {
      const { user } = useUserStore.getState();
      if (!user) return;

      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("userId", user.id)
        .maybeSingle();

      if (error) throw error;
      set({ coupon: data || null, isCouponApplied: !!data });
    } catch (error) {
      set({ coupon: null, isCouponApplied: false });
    }
  },

  // Apply a coupon by code; only one coupon per user
  applyCoupon: async (code) => {
    try {
      // 1. Find the coupon with this code that is active
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("isActive", true)
        .single();

      if (error || !coupon) throw new Error("Invalid or inactive coupon");

      const { user } = useUserStore.getState();
      if (!user) throw new Error("User not logged in");

      // 2. Remove any previously applied coupon for this user
      await supabase
        .from("coupons")
        .update({ userId: null })
        .eq("userId", user.id);

      // 3. Assign this coupon to the user (set its userId)
      const { error: updateError } = await supabase
        .from("coupons")
        .update({ userId: user.id })
        .eq("id", coupon.id);

      if (updateError) throw updateError;

      set({ coupon, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.message || "Failed to apply coupon");
    }
  },

  // Remove the applied coupon (unset userId)
  removeCoupon: async () => {
    const { user } = useUserStore.getState();
    if (user) {
      // Set userId to null for the user's currently applied coupon
      await supabase
        .from("coupons")
        .update({ userId: null })
        .eq("userId", user.id);
    }
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },

  // Fetch cart items for the logged-in user
  getCartItems: async () => {
    const { user } = useUserStore.getState();
    if (!user) {
      set({ cart: [] });
      return;
    }
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, product:productId(*)")
        .eq("userId", user.id);

      if (error) throw error;

      const cart = (data || []).map((item) => ({
        ...item.product,
        id: item.productId,
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
      await supabase.from("cart_items").delete().eq("userId", user.id);
    }
    set({ cart: [], coupon: null, total: 0, subtotal: 0 });
  },

  addToCart: async (product) => {
    const { user } = useUserStore.getState();

    if (user) {
      const { error } = await supabase
        .from("cart_items")
        .upsert({
          userId: user.id,
          productId: product.id,
          quantity: 1,
        })
        .eq("userId", user.id)
        .eq("productId", product.id);

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
        .eq("userId", user.id)
        .eq("productId", productId);
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
        .eq("userId", user.id)
        .eq("productId", productId);
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
