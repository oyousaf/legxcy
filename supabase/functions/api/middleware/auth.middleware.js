import { supabase } from "../lib/supabase.js";

/**
 * Middleware to protect authenticated routes
 */
export async function protectRoute(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No Bearer token provided" });
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(
      token
    );
    if (authError || !userData?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = userData.user;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      return res.status(500).json({ error: "Failed to load user profile" });
    }

    req.user.role = profile?.role || "customer";
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(500).json({ error: "Auth middleware exception" });
  }
}

/**
 * Middleware to restrict access to admin-only routes
 */
export async function adminRoute(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }
  next();
}
