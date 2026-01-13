import { prisma } from "./lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
    },
  });
  console.log("Admin created:", admin.username);

  const config = await prisma.paymentConfig.create({
    data: {
      bankName: "Test Bank",
      accountName: "Test Shop",
      accountNumber: "123-456",
      isActive: true,
    },
  });
  console.log("Payment Config created");

  // Create Products
  const products = [
    {
      name: "Classic T-Shirt",
      basePrice: 299,
      status: "PREORDER",
      variants: [
        {
          price: 299,
          stockQuantity: 50,
          combinationJson: JSON.stringify({ color: "Red", size: "S" }),
        },
        {
          price: 299,
          stockQuantity: 45,
          combinationJson: JSON.stringify({ color: "Red", size: "M" }),
        },
        {
          price: 319,
          stockQuantity: 30,
          combinationJson: JSON.stringify({ color: "Blue", size: "L" }),
        },
      ],
    },
    {
      name: "Cool Cap",
      basePrice: 150,
      status: "SALE",
      variants: [
        {
          price: 150,
          stockQuantity: 20,
          combinationJson: JSON.stringify({ color: "Black" }),
        },
        {
          price: 150,
          stockQuantity: 15,
          combinationJson: JSON.stringify({ color: "White" }),
        },
      ],
    },
    {
      name: "Ceramic Mug",
      basePrice: 120,
      status: "SALE",
      variants: [
        {
          price: 120,
          stockQuantity: 100,
          combinationJson: JSON.stringify({ style: "Standard" }),
        },
      ],
    },
  ];

  for (const p of products) {
    const createdProduct = await prisma.product.create({
      data: {
        name: p.name,
        basePrice: p.basePrice,
        status: p.status,
        variants: {
          create: p.variants,
        },
      },
      include: {
        variants: true,
      },
    });
    console.log(
      `Product created: ${createdProduct.name} with ${createdProduct.variants.length} variants`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
