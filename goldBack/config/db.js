import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { DATABASE_URL } from "./index.js";

const connectionString = `${DATABASE_URL}`;

// Honor Prisma's schema URL parameter so disposable QA schemas stay isolated.
const schema = new URL(connectionString).searchParams.get("schema") || "public";
const adapter = new PrismaPg({ connectionString }, { schema });
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };
