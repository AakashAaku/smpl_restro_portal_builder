import { PrismaClient, Role, OrderStatus, MovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started...');

    // 1. Admin Users
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Existing admin
    await prisma.user.upsert({
        where: { email: 'admin@venjo.com' },
        update: { password: adminPassword },
        create: {
            email: 'admin@venjo.com',
            name: 'System Admin',
            password: adminPassword,
            role: Role.ADMIN,
        },
    });

    // Demo admin mentioned in Login.tsx
    await prisma.user.upsert({
        where: { email: 'admin@restaurant.com' },
        update: { password: adminPassword },
        create: {
            email: 'admin@restaurant.com',
            name: 'Demo Admin',
            password: adminPassword,
            role: Role.ADMIN,
        },
    });

    // 2. Demo Customer
    const customerPassword = await bcrypt.hash('customer123', 10);
    await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: { password: customerPassword },
        create: {
            email: 'customer@example.com',
            name: 'Demo Customer',
            password: customerPassword,
            role: Role.CUSTOMER,
        },
    });

    // Create/Upsert Customer record for ordering
    const customer = await prisma.customer.upsert({
        where: { email: 'customer@example.com' },
        update: { name: 'Demo Customer', phone: '1234567890' },
        create: {
            email: 'customer@example.com',
            name: 'Demo Customer',
            phone: '1234567890',
        }
    });

    console.log('Users and Customers created/updated');

    // 3. Ingredients & Suppliers
    const supplier = await prisma.supplier.upsert({
        where: { id: 1 },
        update: { name: 'Fresh Harvest Co.' },
        create: {
            id: 1,
            name: 'Fresh Harvest Co.',
            contact: '9876543210',
            email: 'sales@freshharvest.com',
            address: '123 Market St, City',
        },
    });

    const paneer = await prisma.ingredient.upsert({
        where: { id: 1 },
        update: { name: 'Paneer' },
        create: {
            id: 1,
            name: 'Paneer',
            unit: 'kg',
            currentStock: 10,
            minStock: 2,
            unitPrice: 300,
        },
    });

    const chicken = await prisma.ingredient.upsert({
        where: { id: 2 },
        update: { name: 'Chicken Breast' },
        create: {
            id: 2,
            name: 'Chicken Breast',
            unit: 'kg',
            currentStock: 15,
            minStock: 5,
            unitPrice: 250,
        },
    });

    console.log('Ingredients and Suppliers created/updated');

    // 4. Menu Items
    await prisma.menuItem.upsert({
        where: { id: 1 },
        update: { name: 'Butter Chicken' },
        create: {
            id: 1,
            name: 'Butter Chicken',
            category: 'Main Course',
            price: 450,
            description: 'Classic creamy butter chicken',
            prepTime: 20,
            recipes: {
                create: [
                    { ingredientId: chicken.id, quantity: 0.25 },
                ],
            },
        },
    });

    await prisma.menuItem.upsert({
        where: { id: 2 },
        update: { name: 'Paneer Tikka' },
        create: {
            id: 2,
            name: 'Paneer Tikka',
            category: 'Starters',
            price: 320,
            description: 'Grilled paneer with spices',
            prepTime: 15,
            recipes: {
                create: [
                    { ingredientId: paneer.id, quantity: 0.2 },
                ],
            },
        },
    });

    console.log('Menu items created/updated');

    // 5. Tables
    for (let i = 1; i <= 10; i++) {
        await prisma.table.upsert({
            where: { number: `T${i}` },
            update: { number: `T${i}` },
            create: {
                number: `T${i}`,
                capacity: i % 2 === 0 ? 4 : 2,
                status: 'AVAILABLE',
                qrCode: `QR-T${i}`,
            },
        });
    }
    console.log('Tables created/updated');

    console.log('Seed finished successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
