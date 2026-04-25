import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { getAuthenticatedUser } from "../../http/get-authenticated-user.js";
import { validateBody, validateParams } from "../../http/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  createExpenseSchema,
  expenseParamsSchema,
  upsertExpenseDocumentSchema,
} from "./expense.schemas.js";
import * as expenseService from "./expense.service.js";

export const expenseRoutes = Router();

expenseRoutes.use(authenticate);

expenseRoutes.post(
  "/",
  validateBody(createExpenseSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await expenseService.createExpense(user.id, request.body);

    response.status(201).json(result);
  }),
);

expenseRoutes.get(
  "/",
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await expenseService.listOwnedExpenses(user.id);

    response.status(200).json(result);
  }),
);

expenseRoutes.get(
  "/:id",
  validateParams(expenseParamsSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await expenseService.getExpense(user.id, request.params.id);

    response.status(200).json(result);
  }),
);

expenseRoutes.delete(
  "/:id",
  validateParams(expenseParamsSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await expenseService.cancelExpense(user.id, request.params.id);

    response.status(200).json(result);
  }),
);

expenseRoutes.post(
  "/:id/document",
  validateParams(expenseParamsSchema),
  validateBody(upsertExpenseDocumentSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await expenseService.upsertDocument(user.id, request.params.id, request.body);

    response.status(200).json(result);
  }),
);
