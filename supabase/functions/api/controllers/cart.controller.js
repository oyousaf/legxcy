import { supabase } from "../lib/supabase.js";
import { v4 as uuidv4 } from "npm:uuid";

export const getCartProducts = async (req, res) => {
  try {
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select("id, quantity, product:products(*)")
      .eq("userId", req.user.id);

    if (error) throw error;

    const result = cartItems.map((item) => ({
      ...item.product,
      quantity: item.quantity,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const { data: existing, error: findErr } = await supabase
      .from("cart_items")
      .select("*")
      .eq("userId", req.user.id)
      .eq("productId", productId)
      .single();

    if (findErr && findErr.code !== "PGRST116") throw findErr;

    if (existing) {
      const { error: updateErr } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase.from("cart_items").insert([
        {
          id: uuidv4(),
          userId: req.user.id,
          productId,
          quantity: 1,
        },
      ]);
      if (insertErr) throw insertErr;
    }

    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("id, quantity, product:products(*)")
      .eq("userId", req.user.id);

    const result = cartItems.map((item) => ({
      ...item.product,
      quantity: item.quantity,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("userId", req.user.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("userId", req.user.id)
        .eq("productId", productId);
      if (error) throw error;
    }

    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("id, quantity, product:products(*)")
      .eq("userId", req.user.id);

    const result = cartItems.map((item) => ({
      ...item.product,
      quantity: item.quantity,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;

    const { data: cartItem, error: findErr } = await supabase
      .from("cart_items")
      .select("*")
      .eq("userId", req.user.id)
      .eq("productId", productId)
      .single();

    if (findErr && findErr.code !== "PGRST116") throw findErr;
    if (!cartItem) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity === 0) {
      const { error: delErr } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItem.id);
      if (delErr) throw delErr;
    } else {
      const { error: updateErr } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItem.id);
      if (updateErr) throw updateErr;
    }

    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("id, quantity, product:products(*)")
      .eq("userId", req.user.id);

    const result = cartItems.map((item) => ({
      ...item.product,
      quantity: item.quantity,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
