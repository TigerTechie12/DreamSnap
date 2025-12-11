import 'dotenv/config';

const env = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic" as const,
  datasource: {
    url: process.env.DATABASE_URL || env("DATABASE_URL"),
  },
};
