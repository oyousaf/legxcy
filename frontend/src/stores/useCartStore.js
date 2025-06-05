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
  loading: false,

  // Fetch the currently applied coupon for the user
  getMyCoupon: async () => {
    set({ loading: true });
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
    } finally {
      set({ loading: false });
    }
  },

  // Apply a coupon by code, unique per user
  applyCoupon: async (code) => {
    set({ loading: true });
    try {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("isActive", true)
        .single();
      if (error || !coupon) throw new Error("Invalid or inactive coupon");
      const { user } = useUserStore.getState();
      if (!user) throw new Error("User not logged in");

      // Remove previous coupon
      await supabase
        .from("coupons")
        .update({ userId: null })
        .eq("userId", user.id);

      // Assign coupon to user
      const { error: updateError } = await supabase
        .from("coupons")
        .update({ userId: user.id })
        .eq("id", coupon.id);
      if (updateError) throw updateError;

      set({ coupon, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      set({ coupon: null, isCouponApplied: false });
      toast.error(error.message || "Failed to apply coupon");
    } finally {
      set({ loading: false });
    }
  },

  // Remove the applied coupon
  removeCoupon: async () => {
    set({ loading: true });
    try {
      const { user } = useUserStore.getState();
      if (user) {
        await supabase
          .from("coupons")
          .update({ userId: null })
          .eq("userId", user.id);
      }
      set({ coupon: null, isCouponApplied: false });
      get().calculateTotals();
      toast.success("Coupon removed");
    } catch (error) {
      toast.error(error.message || "Failed to remove coupon");
    } finally {
      set({ loading: false });
    }
  },

  // Fetch cart items for the logged-in user
  getCartItems: async () => {
    set({ loading: true });
    try {
      const { user } = useUserStore.getState();
      if (!user) {
        set({ cart: [] });
        return;
      }
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
      toast.error(error.message || "Could not fetch cart");
    } finally {
      set({ loading: false });
    }
  },

  // Clear the entire cart
  clearCart: async () => {
    set({ loading: true });
    try {
      const { user } = useUserStore.getState();
      if (user) {
        await supabase.from("cart_items").delete().eq("userId", user.id);
      }
      set({ cart: [], coupon: null, total: 0, subtotal: 0 });
    } catch (error) {
      toast.error(error.message || "Could not clear cart");
    } finally {
      set({ loading: false });
    }
  },

  // Add a product to cart (upsert or increment locally)
  addToCart: async (product) => {
    set({ loading: true });
    try {
      const { user } = useUserStore.getState();
      if (user) {
        // 1. Check if item exists
        const { data: existing, error: fetchError } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("userId", user.id)
          .eq("productId", product.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

        if (existing) {
          // 2. Exists: increment quantity
          const { error } = await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + 1 })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          // 3. Not exists: insert
          const { error } = await supabase.from("cart_items").insert({
            userId: user.id,
            productId: product.id,
            quantity: 1,
          });
          if (error) throw error;
        }

        // Refetch cart for accuracy
        await get().getCartItems();
        toast.success("Product added to cart");
      }
    } catch (error) {
      toast.error(error.message || "Could not add to cart");
    } finally {
      set({ loading: false });
    }
  },

  // Remove a product from cart
  removeFromCart: async (productId) => {
    set({ loading: true });
    try {
      const { user } = useUserStore.getState();
      if (user) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("userId", user.id)
          .eq("productId", productId);
        // Refetch cart for accuracy
        await get().getCartItems();
      }
    } catch (error) {
      toast.error(error.message || "Could not remove from cart");
    } finally {
      set({ loading: false });
    }
  },

  // Update quantity for a product in the cart
  updateQuantity: async (productId, quantity) => {
    set({ loading: true });
    try {
      const { user } = useUserStore.getState();
      if (!user) return;
      if (quantity === 0) {
        await get().removeFromCart(productId);
        return;
      }
      await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("userId", user.id)
        .eq("productId", productId);
      // Refetch cart for accuracy
      await get().getCartItems();
    } catch (error) {
      toast.error(error.message || "Could not update quantity");
    } finally {
      set({ loading: false });
    }
  },

  // Calculate subtotal and total with coupon if any
  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
      0
    );
    let total = subtotal;
    if (coupon && coupon.discountPercentage) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }
    set({ subtotal, total });
  },
}));
