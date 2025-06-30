import express from "npm:express@4.18.2";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  getAnalyticsData,
  getDailySalesData,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAnalyticsData);
router.get("/daily", protectRoute, adminRoute, getDailySalesData);

export default router;
