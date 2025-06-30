// Setup type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Express + Middleware (Deno npm imports)
import express from "npm:express@4.18.2";
import dotenv from "npm:dotenv";
import cookieParser from "npm:cookie-parser";
import cors from "npm:cors";

// Load .env variables (mainly for local dev)
dotenv.config();

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "https://legxcy.uk",
  "https://www.legxcy.uk",
  "http://localhost:5173",
];

// Stripe Webhook route (MUST come before express.json middleware!)
import { stripeWebhook } from "./controllers/payment.controller.js";
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Middleware stack
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// Import routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import paymentRoutes from "./routes/payment.route.js";

// Mount route groups
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payments", paymentRoutes);

// Direct route aliases (optional, for flexibility)
import {
  createCheckoutSession,
  checkoutSuccess,
} from "./controllers/payment.controller.js";

app.post("/api/payments/create-checkout-session", createCheckoutSession);
app.post("/api/payments/checkout-success", checkoutSuccess);

// Catch-all fallback for debugging
app.all("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.path,
  });
});

// Supabase Edge binds automatically on port 8000
app.listen(8000, () => {
  console.log("✅ Supabase Edge Function app is running on port 8000");
});
