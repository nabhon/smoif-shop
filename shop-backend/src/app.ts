import express from "express";
import cors from "cors";
import path from "path";
import { json } from "body-parser";
import { errorHandler } from "./middlewares/error.middleware";

// Import Routes
import adminRoutes from "./routes/admin.routes";
import paymentConfigRoutes from "./routes/payment-config.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

app.use(cors());
app.use(json());
app.use("/public", express.static(path.join(process.cwd(), "public")));

// Routes Placeholder
app.get("/", (req, res) => {
  res.send("QuickOrder Backend API is running");
});

app.use("/api/admin", adminRoutes);
app.use("/api/payment-config", paymentConfigRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use(errorHandler);

export default app;
