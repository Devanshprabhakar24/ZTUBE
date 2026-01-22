import { defineConfig } from '@prisma/client';

export default defineConfig({
  datasource: {
    adapter: process.env.DATABASE_URL,
  },
});
