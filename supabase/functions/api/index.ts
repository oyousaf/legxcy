// Setup type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Express + Middleware (via npm specifiers)
import express from "npm:express@4.18.2";
import dotenv from "npm:dotenv";
import cookieParser from "npm:cookie-parser";
import cors from "npm:cors";

// Load environment variables
dotenv.config();

const app = express();

// Define allowed CORS origins
const allowedOrigins = [
  "https://legxcy.uk",
  "https://www.legxcy.uk",
  "http://localhost:5173",
];

// Raw body middleware for Stripe webhook must come first
import { stripeWebhook } from "./controllers/payment.controller.js";
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Global middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// Route groups
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

// Optionally: keep these wired via controller if skipping payment.route.js
import {
  createCheckoutSession,
  checkoutSuccess,
} from "./controllers/payment.controller.js";

// Route usage
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics", analyticsRoutes);

// Direct payment endpoints (skip separate route file if desired)
app.post("/api/payments/checkout", createCheckoutSession);
app.post("/api/payments/success", checkoutSuccess);

// Trigger Express inside Supabase Edge Runtime
app.listen(8000);
