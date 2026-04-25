import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { getAuthenticatedUser } from "../../http/get-authenticated-user.js";
import { validateBody, validateParams } from "../../http/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  createFriendInvitationSchema,
  friendParamsSchema,
  friendshipParamsSchema,
} from "./friend.schemas.js";
import * as friendService from "./friend.service.js";

export const friendRoutes = Router();

friendRoutes.use(authenticate);

friendRoutes.get(
  "/",
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await friendService.listFriends(user.id);

    response.status(200).json(result);
  }),
);

friendRoutes.post(
  "/invitations",
  validateBody(createFriendInvitationSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await friendService.createInvitation(user.id, request.body);

    response.status(201).json(result);
  }),
);

friendRoutes.get(
  "/invitations",
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await friendService.listInvitations(user.id);

    response.status(200).json(result);
  }),
);

friendRoutes.post(
  "/invitations/:id/accept",
  validateParams(friendshipParamsSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await friendService.acceptInvitation(user.id, request.params.id);

    response.status(200).json(result);
  }),
);

friendRoutes.post(
  "/invitations/:id/reject",
  validateParams(friendshipParamsSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    const result = await friendService.rejectInvitation(user.id, request.params.id);

    response.status(200).json(result);
  }),
);

friendRoutes.delete(
  "/:friendId",
  validateParams(friendParamsSchema),
  asyncHandler(async (request, response) => {
    const user = getAuthenticatedUser(request);
    await friendService.removeFriend(user.id, request.params.friendId);

    response.status(204).send();
  }),
);
