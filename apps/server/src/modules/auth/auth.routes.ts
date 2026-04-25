import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { validateBody } from "../../http/validate.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import * as authService from "./auth.service.js";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(async (request, response) => {
    const result = await authService.register(request.body);

    response.status(201).json(result);
  }),
);

authRoutes.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (request, response) => {
    const result = await authService.login(request.body);

    response.status(200).json(result);
  }),
);
