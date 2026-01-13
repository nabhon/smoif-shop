import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const getPublicProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        basePrice: true,
      },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { variants: true },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const getAllProductsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: { variants: true },
      orderBy: { updatedAt: "desc" },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, basePrice, isActive, variants } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        basePrice,
        isActive: isActive ?? true,
        variants: {
          create: variants
            ? variants.map((v: any) => ({
                price: v.price,
                stockQuantity: v.stockQuantity,
                combinationJson: JSON.stringify(
                  v.combination || v.combinationJson
                ),
              }))
            : [],
        },
      },
      include: { variants: true },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, basePrice, isActive, variants } = req.body;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        basePrice,
        isActive,
      },
    });

    // Handle variants update (simple replacement strategy or upsert)
    // For simplicity, we can delete existing and recreate, OR update in place.
    // Recreating is easiest for variant matrix reset.
    if (variants) {
      await prisma.productVariant.deleteMany({
        where: { productId: Number(id) },
      });

      await prisma.productVariant.createMany({
        data: variants.map((v: any) => ({
          productId: Number(id),
          price: v.price,
          stockQuantity: v.stockQuantity,
          combinationJson:
            typeof v.combinationJson === "string"
              ? v.combinationJson
              : JSON.stringify(v.combination || v.combinationJson),
        })),
      });
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { variants: true },
    });

    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
