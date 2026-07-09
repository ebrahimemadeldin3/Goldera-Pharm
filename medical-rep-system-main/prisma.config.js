import { defineConfig } from "@prisma/config";
const { DATABASE_URL } = require("./config/index.js");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
