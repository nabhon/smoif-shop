import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { upload } from "../utils/multer";
import { sendEmail } from "../utils/mailer";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { guestName, guestSurname, guestEmail, cartItems } = req.body;

    // Calculate total from DB to prevent frontend manipulation
    // NOTE: This assumes cartItems contains { productId, variantId, amount }
    let total = 0;
    const itemsSnapshot = [];

    for (const item of cartItems) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });
      if (!variant) continue;

      // Check stock if needed (omitted for speed/mvp)
      const lineTotal = Number(variant.price) * item.amount;
      total += lineTotal;

      itemsSnapshot.push({
        ...item,
        name: variant.product.name,
        price: Number(variant.price),
        options: JSON.parse(variant.combinationJson),
      });
    }

    const order = await prisma.order.create({
      data: {
        guestName,
        guestSurname,
        guestEmail,
        totalAmount: total,
        status: "WAITING_FOR_PAYMENT",
        orderItemsSnapshot: JSON.stringify(itemsSnapshot),
      },
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const uploadSlip = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  upload.single("slip")(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const { id } = req.params;
      const slipUrl = `/public/uploads/slips/${req.file.filename}`;

      const order = await prisma.order.update({
        where: { id: Number(id) },
        data: {
          slipImageUrl: slipUrl,
          status: "VERIFYING_SLIP",
        },
      });
      res.json(order);
    } catch (error) {
      next(error);
    }
  });
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;
    const where = status ? { status: String(status) } : {};

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const verifyOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    // Send Email
    await sendEmail(
      order.guestEmail,
      `Order #${order.id} Confirmed`,
      `<p>Hi ${order.guestName},</p><p>Your order #${order.id} has been verified and confirmed!</p>`
    );

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const rejectOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Reset to waiting for payment so they can upload again? or Cancelled?
    // Plan says: "Reject slip. Status -> WAITING_FOR_PAYMENT"
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        status: "WAITING_FOR_PAYMENT",
        // Maybe clear slip?
        // slipImageUrl: null
      },
    });

    // Notify?

    res.json(order);
  } catch (error) {
    next(error);
  }
};
