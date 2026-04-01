import { defineConfig } from '@prisma/config';
import { config as loadEnv } from 'dotenv';

// Load environment variables from .env file
loadEnv();

export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
        