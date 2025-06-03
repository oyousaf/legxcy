import { supabase } from "../lib/supabase.js";

/**
 * Signup controller: Registers a user and creates their profile.
 */
export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  // Register user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // If signup is successful, create user profile in 'profiles' table
  if (data.user) {
    // Use upsert to avoid duplicates if retried
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert([{ id: data.user.id, email, name, role: "customer" }]);

    if (profileError) {
      // If profile creation fails, return error
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

/**
 * Login controller: Authenticates user with email & password.
 */
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

  return res.json({
    id: data.user.id,
    email: data.user.email,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
};

/**
 * Logout controller: Signs the user out.
 */
export const logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "No token" });
  }
  // Note: Supabase signOut does not invalidate tokens server-side
  await supabase.auth.signOut();
  return res.json({ message: "Logged out" });
};

/**
 * GetProfile controller: Fetches the authenticated user's profile.
 */
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
