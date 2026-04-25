import "dotenv/config";

type NodeEnv = "development" | "test" | "production";

interface Env {
  NODE_ENV: NodeEnv;
  PORT: number;
  CORS_ORIGIN: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

function readNodeEnv(value: string | undefined): NodeEnv {
  if (value === "test" || value === "production") {
    return value;
  }

  return "development";
}

function readPort(value: string | undefined): number {
  const port = Number(value ?? 3333);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
}

export const env: Env = {
  NODE_ENV: readNodeEnv(process.env.NODE_ENV),
  PORT: readPort(process.env.PORT),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:8081",
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
  JWT_SECRET: process.env.JWT_SECRET ?? "change-this-secret-in-development",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
};
