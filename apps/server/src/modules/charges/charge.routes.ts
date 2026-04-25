import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { getAuthenticatedUser } from "../../http/get-authenticated-user.js";
import { validateParams } from "../../http/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { chargeParamsSchema } from "./charge.schemas.js";
import * as expenseService from "../expenses/expense.service.js";

export const chargeRoutes = Router();

chargeRoutes.use(authenticate);

chargeRoutes.get(
  "/",
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await expenseService.listMyCharges(user.id);

    response.status(200).json(result);
  }),
);

chargeRoutes.get(
  "/:id",
  validateParams(chargeParamsSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await expenseService.getMyCharge(user.id, request.params.id);

    response.status(200).json(result);
  }),
);

chargeRoutes.post(
  "/:id/pix",
  validateParams(chargeParamsSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await expenseService.generatePixForCharge(user.id, request.params.id);

    response.status(201).json(result);
  }),
);
