import express from "npm:express@4.18.2";
import {
  signup,
  login,
  logout,
  getProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.get("/profile", protectRoute, getProfile);

export default router;
