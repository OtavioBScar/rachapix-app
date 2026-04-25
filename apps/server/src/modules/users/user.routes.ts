import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { getAuthenticatedUser } from "../../http/get-authenticated-user.js";
import { validateBody } from "../../http/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { updateMeSchema } from "./user.schemas.js";
import * as userService from "./user.service.js";

export const userRoutes = Router();

userRoutes.get(
  "/me",
  authenticate,
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await userService.getMe(user.id);

    response.status(200).json(result);
  }),
);

userRoutes.patch(
  "/me",
  authenticate,
  validateBody(updateMeSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await userService.updateMe(user.id, request.body);

    response.status(200).json(result);
  }),
);
