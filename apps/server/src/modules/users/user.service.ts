import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { toPublicUser } from "./user.presenter.js";
import type { UpdateMeInput } from "./user.schemas.js";

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toPublicUser(user);
}

export async function updateMe(userId: string, input: UpdateMeInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
  });

  return toPublicUser(user);
}
