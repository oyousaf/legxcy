import { supabase } from "../lib/supabase.js";
import {
  uploadImageToSupabase,
  deleteImageFromSupabase,
} from "../lib/supabaseStorage.js";

let featuredProductsCache = null;
let featuredProductsCacheTimestamp = 0;
const FEATURED_CACHE_TTL = 60 * 5 * 1000;

export const getAllProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*");
    if (error) throw error;
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    if (
      featuredProductsCache &&
      Date.now() - featuredProductsCacheTimestamp < FEATURED_CACHE_TTL
    ) {
      return res.json(featuredProductsCache);
    }
    const { data: featuredProducts, error } = await supabase
      .from("products")
      .select("*")
      .eq("isFeatured", true);

    if (error) throw error;
    if (!featuredProducts || featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
    }
    featuredProductsCache = featuredProducts;
    featuredProductsCacheTimestamp = Date.now();
    res.json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let imageUrl = "";
    if (image) {
      const uploadRes = await uploadImageToSupabase(image, "products");
      if (uploadRes.error) throw new Error(uploadRes.error.message);
      imageUrl = uploadRes.publicUrl;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert([{ name, description, price, image: imageUrl, category }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { data: product, error: getError } = await supabase
      .from("products")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (getError || !product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      await deleteImageFromSupabase(product.image);
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", req.params.id);

    if (deleteError) throw deleteError;
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase.rpc(
      "get_random_products",
      { sample_size: 4 }
    );
    if (error) throw error;
    res.json(products);
  } catch (error) {
    const { data: products, error: e2 } = await supabase
      .from("products")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(4);
    if (e2) {
      return res
        .status(500)
        .json({ message: "Server error", error: e2.message });
    }
    res.json(products);
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category);
    if (error) throw error;
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const { data: product, error: getError } = await supabase
      .from("products")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (getError || !product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const updatedProduct = { ...product, isFeatured: !product.isFeatured };
    const { data: result, error: updateError } = await supabase
      .from("products")
      .update({ isFeatured: updatedProduct.isFeatured })
      .eq("id", req.params.id)
      .select()
      .single();
    if (updateError) throw updateError;
    featuredProductsCache = null;
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
