import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Testing getCustomers...");
    const customers = await prisma.customer.findMany({
      include: { orders: { select: { totalAmount: true } } },
      orderBy: { name: "asc" },
    });
    console.log("getCustomers OK");

    console.log("Testing getCustomerStats...");
    const totalCustomers = await prisma.customer.count();
    const vipCustomers = await prisma.customer.count({ where: { isVip: true } });
    const totalLoyaltyPoints = await prisma.customer.aggregate({ _sum: { loyaltyPoints: true } });
    const totalRevenue = await prisma.order.aggregate({ _sum: { totalAmount: true } });
    console.log("getCustomerStats OK", { totalCustomers, vipCustomers });
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
