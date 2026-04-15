import pkg from "../generated/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

const { PrismaClient } = pkg;

// This is required for @neondatabase/serverless to work in Node.js
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;
    
    // If we have a DATABASE_URL, use the Neon adapter for better performance on serverless
    if (connectionString && connectionString.includes('neon.tech')) {
        const pool = new Pool({ connectionString });
        const adapter = new PrismaNeon(pool);
        return new PrismaClient({ adapter });
    }
    
    // Fallback to default behavior for local or other databases
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

