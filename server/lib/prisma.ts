import pkg from "../generated/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

const { PrismaClient } = pkg;

// This is required for @neondatabase/serverless to work in Node.js
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
    
    if (!connectionString) {
        throw new Error(
            "DATABASE_URL or NETLIFY_DATABASE_URL is not set. " +
            "Please ensure you have configured your environment variables in the Netlify Dashboard."
        );
    }
    
    // If we have a Neon connection string, use the specialized adapter
    if (connectionString.includes('neon.tech')) {
        const pool = new Pool({ connectionString });
        const adapter = new PrismaNeon(pool);
        return new PrismaClient({ adapter });
    }
    
    // Fallback for non-Neon databases
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

