import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  checkoutSuccess,
  createCheckoutSession,
  stripeWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
