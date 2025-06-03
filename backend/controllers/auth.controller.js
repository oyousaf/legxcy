import { supabase } from "../lib/supabase.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert([{ id: data.user.id, email, name, role: "customer" }]);

    if (profileError) {
      return res.status(500).json({
        message: `User created but profile not saved: ${profileError.message}`,
      });
    }
  }

  return res.status(201).json({
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
  if (error) {
    let msg = error.message;
    if (msg.toLowerCase().includes("email not confirmed")) {
      msg = "Please verify your email address. Check your inbox.";
    }
    return res.status(401).json({ message: msg });
  }
  const user = data.user || data.session?.user;
  const access_token = data.session?.access_token;
  const refresh_token = data.session?.refresh_token;

  if (!user || !access_token) {
    return res.status(500).json({ message: "Login failed." });
  }

  return res.json({
    id: user.id,
    email: user.email,
    access_token,
    refresh_token,
  });
};

export const logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "No token" });
  }

  await supabase.auth.signOut();
  return res.json({ message: "Logged out" });
};

export const getProfile = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return res.status(404).json({ message: "Profile not found" });
  }

  return res.json(data);
};
