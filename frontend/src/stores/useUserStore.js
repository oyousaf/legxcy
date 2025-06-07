import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      set({ loading: false });
      return toast.error(error.message || "An error occurred");
    }

    const user = data?.user || data?.session?.user;
    if (user) {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert([{ id: user.id, name, role: "customer" }]);
      if (upsertError) {
        set({ loading: false });
        return toast.error(upsertError.message || "Profile creation failed");
      }
      await get().fetchProfile(user.id);
      set({ user, loading: false });
      toast.success(
        "Sign up successful! Please check your email to verify your account."
      );
    } else {
      set({ loading: false });
      toast.error("No user returned from sign up");
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ loading: false });
      return toast.error(error.message || "An error occurred");
    }

    const user = data.user || data.session?.user;
    set({ user, loading: false });
    if (user) await get().fetchProfile(user.id);
    toast.success("Welcome back!");
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message || "An error occurred during logout");
    set({ user: null, profile: null });
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const user = data.user || data.session?.user;
      set({ user, profile: null });

      if (user) {
        await get().fetchProfile(user.id);
      }
    } catch (error) {
      set({ user: null, profile: null });
    } finally {
      set({ checkingAuth: false });
    }
  },

  fetchProfile: async (userId) => {
    if (!userId) return set({ profile: null });
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    set({ profile: error ? null : data });
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (error) toast.error(error.message || "Profile update failed");
    else {
      toast.success("Profile updated!");
      await get().fetchProfile(user.id);
    }
  },
}));
