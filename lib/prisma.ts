import { PrismaClient } from "@prisma/client";

/**
 * Creates a new PrismaClient instance.
 * This function is part of the singleton pattern to ensure only one instance is created.
 * @returns A new PrismaClient instance.
 */
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Augment the NodeJS Global type with the prisma instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * The singleton PrismaClient instance for the application.
 * 
 * This pattern prevents exhausting database connections during development 
 * due to Next.js hot-reloading creating multiple instances.
 * It checks if an instance exists on the global scope, reuses it if found,
 * otherwise creates a new one. In production, it always creates a new instance.
 * 
 * @see https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */
export const prisma = globalThis.prisma ?? prismaClientSingleton();

// In development, store the instance on the global scope to reuse across hot reloads.
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
