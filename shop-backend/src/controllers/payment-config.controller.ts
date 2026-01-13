import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const getPaymentConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await prisma.paymentConfig.findFirst({
      where: { isActive: true },
    });
    res.json(config || {});
  } catch (error) {
    next(error);
  }
};

export const updatePaymentConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      bankName,
      accountName,
      accountNumber,
      qrImageUrl,
      qrImageKey,
      isActive,
    } = req.body;

    // Check if config exists, if not create, else update first one found (assuming single config logic for simplicity)
    const existing = await prisma.paymentConfig.findFirst();

    if (existing) {
      const updated = await prisma.paymentConfig.update({
        where: { id: existing.id },
        data: {
          bankName,
          accountName,
          accountNumber,
          qrImageUrl,
          qrImageKey,
          isActive: isActive ?? true,
        },
      });
      res.json(updated);
    } else {
      const created = await prisma.paymentConfig.create({
        data: {
          bankName,
          accountName,
          accountNumber,
          qrImageUrl,
          qrImageKey,
          isActive: isActive ?? true,
        },
      });
      res.json(created);
    }
  } catch (error) {
    next(error);
  }
};
