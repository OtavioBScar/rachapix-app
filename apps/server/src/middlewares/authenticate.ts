import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";

import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

interface JwtPayload {
  sub: string;
  email: string;
}

export const authenticate: RequestHandler = (request, _response, next) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required", 401);
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded.email !== "string") {
      throw new AppError("Invalid authentication token", 401);
    }

    const payload = decoded as JwtPayload;
    request.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid authentication token", 401);
  }
};
