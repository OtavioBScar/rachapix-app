import type { Request } from "express";

import { AppError } from "../errors/app-error.js";

export function getAuthenticatedUser(request: Request) {
  if (!request.user) {
    throw new AppError("Authentication token is required", 401);
  }

  return request.user;
}
