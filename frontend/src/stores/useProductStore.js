import { create } from "zustand";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

// Helper: convert Supabase error to readable message
const getErrorMsg = (error) =>
  error?.message || error?.description || "Something went wrong";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  // CREATE PRODUCT (Admin)
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      // Handle image: If base64, upload to Supabase storage and get the public URL
      let imageUrl = productData.image;
      if (productData.image && productData.image.startsWith("data:")) {
        const { uploadImageToSupabase } = await import(
          "../lib/supabaseStorage"
        );
        const { publicUrl, error } = await uploadImageToSupabase(
          productData.image,
          "products"
        );
        if (error) throw new Error("Image upload failed");
        imageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from("products")
        .insert([{ ...productData, image: imageUrl }])
        .select("*")
        .single();

      if (error) throw error;
      set((prevState) => ({
        products: [...prevState.products, data],
        loading: false,
      }));
      toast.success("Product created!");
    } catch (error) {
      toast.error(getErrorMsg(error));
      set({ loading: false });
    }
  },

  // FETCH ALL PRODUCTS
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      set({ products: data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(getErrorMsg(error));
    }
  },

  // FETCH PRODUCTS BY CATEGORY
  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category);
      if (error) throw error;
      set({ products: data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(getErrorMsg(error));
    }
  },

  // DELETE PRODUCT (Admin)
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) throw error;
      set((prev) => ({
        products: prev.products.filter((product) => product.id !== productId),
        loading: false,
      }));
      toast.success("Product deleted!");
    } catch (error) {
      set({ loading: false });
      toast.error(getErrorMsg(error));
    }
  },

  // TOGGLE FEATURED (Admin)
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      // Get current state
      const product = get().products.find((p) => p.id === productId);
      if (!product) throw new Error("Product not found");

      const { data, error } = await supabase
        .from("products")
        .update({ isFeatured: !product.isFeatured })
        .eq("id", productId)
        .select("*")
        .single();

      if (error) throw error;

      set((prev) => ({
        products: prev.products.map((p) =>
          p.id === productId ? { ...p, isFeatured: data.isFeatured } : p
        ),
        loading: false,
      }));
      toast.success("Product updated!");
    } catch (error) {
      set({ loading: false });
      toast.error(getErrorMsg(error));
    }
  },

  // FETCH FEATURED PRODUCTS ONLY
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("isFeatured", true);
      if (error) throw error;
      set({ products: data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(getErrorMsg(error));
    }
  },
}));
