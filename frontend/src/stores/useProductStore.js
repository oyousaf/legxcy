import { create } from "zustand";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

const getErrorMsg = (error) =>
  error?.message || error?.description || "Something went wrong";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),
  resetProducts: () => set({ products: [] }),

  // CREATE PRODUCT (Admin)
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      let imageUrl = productData.image;
      if (productData.image && productData.image.startsWith("data:")) {
        const { uploadImageToSupabase } = await import("../lib/supabaseStorage");
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
      toast.success("Product created!");
      await get().fetchAllProducts();
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      set({ loading: false });
    }
  },

  // UPDATE PRODUCT (Admin) - NEW!
  updateProduct: async (productId, updateFields) => {
    set({ loading: true });
    try {
      // Optionally handle image update here as well, if needed
      const { error } = await supabase
        .from("products")
        .update(updateFields)
        .eq("id", productId);

      if (error) throw error;
      toast.success("Product updated!");
      await get().fetchAllProducts();
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      set({ loading: false });
    }
  },

  // FETCH ALL PRODUCTS
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      set({ products: data });
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      set({ loading: false });
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
      set({ products: data });
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      set({ loading: false });
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
      toast.success("Product deleted!");
      await get().fetchAllProducts();
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      set({ loading: false });
    }
  },

  // TOGGLE FEATURED (Admin)
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const product = get().products.find((p) => p.id === productId);
      if (!product) throw new Error("Product not found");
      const { error } = await supabase
        .from("products")
        .update({ isFeatured: !product.isFeatured })
        .eq("id", productId);

      if (error) throw error;
      toast.success("Product updated!");
      await get().fetchAllProducts();
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      set({ loading: false });
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
      set({ products: data });
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      set({ loading: false });
    }
  },
}));
