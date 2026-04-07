import { PrismaClient, Role, OrderStatus, MovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started: PURGING NON-VEG DATA...');

    // 1. Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    // Primary Admin (matches UI demo)
    await prisma.user.upsert({
        where: { email: 'admin@restaurant.com' },
        update: { password: adminPassword },
        create: {
            email: 'admin@restaurant.com',
            name: 'Venzo Admin',
            password: adminPassword,
            role: Role.ADMIN,
        },
    });

    // Backup Admin
    await prisma.user.upsert({
        where: { email: 'admin@venjo.com' },
        update: { password: adminPassword },
        create: {
            email: 'admin@venjo.com',
            name: 'Venjo Support',
            password: adminPassword,
            role: Role.ADMIN,
        },
    });

    // Demo Customer
    await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: { password: customerPassword },
        create: {
            email: 'customer@example.com',
            name: 'Valued Customer',
            password: customerPassword,
            role: Role.CUSTOMER,
        },
    });

    // 2. Ingredients & Suppliers
    const supplier = await (prisma.supplier as any).upsert({
        where: { name: 'Fresh Organic Farms' }, // Use name for upsert
        update: {},
        create: {
            name: 'Fresh Organic Farms',
            contact: '9800000000',
            email: 'orders@freshorganic.com',
            address: 'Radhe Radhe, Bhaktapur',
        },
    });

    // 2. Clear dummy ingredients if any (optional, but requested by user to have clean start)
    // We already have upserts, so we can just empty the arrays if we want a clean slate for new users
    const ingredientsData: any[] = []; 
    const menuItemsData: any[] = [];

    console.log('Seed finished: ADMIN USERS READY.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
