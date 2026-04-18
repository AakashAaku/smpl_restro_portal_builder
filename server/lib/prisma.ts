import "dotenv/config";
import pkg from "../generated/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

const { PrismaClient } = pkg;

// This is required for @neondatabase/serverless to work in Node.js
neonConfig.webSocketConstructor = ws;

// We completely bypass @neondatabase/serverless adapter since the user provided a "pooler" URL
// Neon's PgBouncer pooler URL supports native TCP via Prisma rust engine which is vastly more stable.

const prismaClientSingleton = () => {
    // Definitive URL provided by user
    const targetUrl = "postgres://neondb_owner:npg_U7dh6JuHAkyq@ep-lively-thunder-ankua0j1-pooler.c-6.us-east-1.aws.neon.tech/neondb";
    
    // Explicitly guarantee the environment variable is set for Prisma engine to pick it up internally if needed
    process.env.DATABASE_URL = targetUrl;
    
    // Force the datasource URL directly
    return new PrismaClient({
        datasources: {
            db: {
                url: targetUrl
            }
        }
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

