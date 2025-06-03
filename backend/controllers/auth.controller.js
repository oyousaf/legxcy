import { supabase } from "../lib/supabase.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ message: error.message });

  if (data.user) {
    await supabase
      .from("profiles")
      .insert([{ id: data.user.id, email, name, role: "customer" }]);
  }

  res.status(201).json({
    id: data.user.id,
    email: data.user.email,
    message: "Sign up successful. Please verify your email.",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ message: error.message });

  res.json({
    id: data.user.id,
    email: data.user.email,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
};

export const logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "No token" });
  await supabase.auth.signOut();
  res.json({ message: "Logged out" });
};

export const getProfile = async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data)
    return res.status(404).json({ message: "Profile not found" });

  res.json(data);
};
