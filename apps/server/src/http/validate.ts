import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import { AppError } from "../errors/app-error.js";

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      throw new AppError("Invalid request body", 400, result.error.issues);
    }

    request.body = result.data;
    next();
  };
}

export function validateParams<T>(schema: ZodType<T>): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.params);

    if (!result.success) {
      throw new AppError("Invalid route params", 400, result.error.issues);
    }

    request.params = result.data as typeof request.params;
    next();
  };
}
