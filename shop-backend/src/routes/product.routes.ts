import { Router } from "express";
import {
  getPublicProducts,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controllers/product.controller";
import { authenticateAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getPublicProducts);
router.get("/admin", authenticateAdmin, getAllProductsAdmin);
router.get("/:id", getProductById);
router.post("/", authenticateAdmin, createProduct);
router.put("/:id", authenticateAdmin, updateProduct);
router.delete("/:id", authenticateAdmin, deleteProduct);

export default router;
