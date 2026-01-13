import { Router } from "express";
import {
  createOrder,
  uploadSlip,
  getOrders,
  verifyOrder,
  rejectOrder,
} from "../controllers/order.controller";
import { authenticateAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Guest
router.post("/", createOrder);
router.post("/:id/pay", uploadSlip);

// Admin
router.get("/", authenticateAdmin, getOrders);
router.post("/:id/verify", authenticateAdmin, verifyOrder);
router.post("/:id/reject", authenticateAdmin, rejectOrder);

export default router;
