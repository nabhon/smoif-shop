import { Router } from "express";
import {
  getPaymentConfig,
  updatePaymentConfig,
} from "../controllers/payment-config.controller";
import { authenticateAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getPaymentConfig);
router.put("/", authenticateAdmin, updatePaymentConfig);

export default router;
