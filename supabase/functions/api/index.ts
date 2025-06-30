// Setup type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Express and middleware (npm specifiers for Deno/Supabase Edge)
import express from "npm:express@4.18.2";
import dotenv from "npm:dotenv";
import cookieParser from "npm:cookie-parser";
import cors from "npm:cors";

// Load env variables
dotenv.config();

const app = express();

// CORS origins
const allowedOrigins = [
  "https://legxcy.uk",
  "https://www.legxcy.uk",
  "http://localhost:5173",
];

// Stripe webhook (must come before JSON parsing!)
import { stripeWebhook } from "./controllers/payment.controller.js";
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Middleware
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
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

// Route usage (all routes will have /api prefix)
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payments", paymentRoutes);

// Direct payment endpoint aliases for compatibility
import {
  createCheckoutSession,
  checkoutSuccess,
} from "./controllers/payment.controller.js";

app.post("/api/payments/create-checkout-session", createCheckoutSession);
app.post("/api/payments/checkout-success", checkoutSuccess);

// Debug: 404 handler (optional but recommended for troubleshooting)
app.all("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Edge functions auto-listen on port 8000
app.listen(8000);

