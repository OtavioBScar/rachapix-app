import { z } from "zod";

export const createFriendInvitationSchema = z.object({
  email: z.string().trim().email(),
});

export const friendshipParamsSchema = z.object({
  id: z.string().min(1),
});

export const friendParamsSchema = z.object({
  friendId: z.string().min(1),
});

export type CreateFriendInvitationInput = z.infer<typeof createFriendInvitationSchema>;
