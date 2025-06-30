// Setup type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Express + Middleware (Deno npm imports)
import express from "npm:express@4.18.2";
import dotenv from "npm:dotenv";
import cookieParser from "npm:cookie-parser";
import cors from "npm:cors";

// Load environment variables
dotenv.config();

const app = express();

const allowedOrigins = [
  "https://legxcy.uk",
  "https://www.legxcy.uk",
  "http://localhost:5173",
];

// Stripe webhook comes BEFORE JSON body middleware
import { stripeWebhook } from "./controllers/payment.controller.js";
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Global Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// Route imports
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import paymentRoutes from "./routes/payment.route.js";

// Route mounts
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payments", paymentRoutes);

// Aliases for direct controller calls
import {
  createCheckoutSession,
  checkoutSuccess,
} from "./controllers/payment.controller.js";

app.post("/api/payments/create-checkout-session", createCheckoutSession);
app.post("/api/payments/checkout-success", checkoutSuccess);

// 404 handler
app.all("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Supabase Edge auto-binds to port 8000
app.listen(8000);
