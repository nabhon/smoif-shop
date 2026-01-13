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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
