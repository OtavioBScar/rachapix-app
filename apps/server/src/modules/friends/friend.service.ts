import type { Friendship, User } from "@prisma/client";

import { FRIENDSHIP_STATUS } from "../../domain/status.js";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { toPublicUser } from "../users/user.presenter.js";
import type { CreateFriendInvitationInput } from "./friend.schemas.js";

type FriendshipWithUsers = Friendship & {
  requester: User;
  addressee: User;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getOtherUser(friendship: FriendshipWithUsers, userId: string) {
  return friendship.requesterId === userId ? friendship.addressee : friendship.requester;
}

function toFriendResponse(friendship: FriendshipWithUsers, userId: string) {
  return {
    id: friendship.id,
    status: friendship.status,
    friend: toPublicUser(getOtherUser(friendship, userId)),
    createdAt: friendship.createdAt,
    updatedAt: friendship.updatedAt,
  };
}

function toInvitationResponse(friendship: FriendshipWithUsers) {
  return {
    id: friendship.id,
    status: friendship.status,
    requester: toPublicUser(friendship.requester),
    addressee: toPublicUser(friendship.addressee),
    createdAt: friendship.createdAt,
    updatedAt: friendship.updatedAt,
  };
}

export async function listFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: FRIENDSHIP_STATUS.ACCEPTED,
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: {
      requester: true,
      addressee: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return friendships.map((friendship) => toFriendResponse(friendship, userId));
}

export async function listInvitations(userId: string) {
  const [incoming, outgoing] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: FRIENDSHIP_STATUS.PENDING,
      },
      include: {
        requester: true,
        addressee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: FRIENDSHIP_STATUS.PENDING,
      },
      include: {
        requester: true,
        addressee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    incoming: incoming.map(toInvitationResponse),
    outgoing: outgoing.map(toInvitationResponse),
  };
}

export async function createInvitation(requesterId: string, input: CreateFriendInvitationInput) {
  const addressee = await prisma.user.findUnique({
    where: {
      email: normalizeEmail(input.email),
    },
  });

  if (!addressee) {
    throw new AppError("User not found for this email", 404);
  }

  if (addressee.id === requesterId) {
    throw new AppError("You cannot invite yourself", 400);
  }

  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId: addressee.id },
        { requesterId: addressee.id, addresseeId: requesterId },
      ],
    },
  });

  if (existingFriendship?.status === FRIENDSHIP_STATUS.ACCEPTED) {
    throw new AppError("Users are already friends", 409);
  }

  if (existingFriendship?.status === FRIENDSHIP_STATUS.PENDING) {
    throw new AppError("There is already a pending invitation", 409);
  }

  const friendship = await prisma.friendship.create({
    data: {
      requesterId,
      addresseeId: addressee.id,
    },
    include: {
      requester: true,
      addressee: true,
    },
  });

  return toInvitationResponse(friendship);
}

export async function acceptInvitation(userId: string, friendshipId: string) {
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship || friendship.addresseeId !== userId) {
    throw new AppError("Invitation not found", 404);
  }

  if (friendship.status !== FRIENDSHIP_STATUS.PENDING) {
    throw new AppError("Invitation is not pending", 409);
  }

  const updatedFriendship = await prisma.friendship.update({
    where: { id: friendshipId },
    data: {
      status: FRIENDSHIP_STATUS.ACCEPTED,
    },
    include: {
      requester: true,
      addressee: true,
    },
  });

  return toFriendResponse(updatedFriendship, userId);
}

export async function rejectInvitation(userId: string, friendshipId: string) {
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship || friendship.addresseeId !== userId) {
    throw new AppError("Invitation not found", 404);
  }

  if (friendship.status !== FRIENDSHIP_STATUS.PENDING) {
    throw new AppError("Invitation is not pending", 409);
  }

  const updatedFriendship = await prisma.friendship.update({
    where: { id: friendshipId },
    data: {
      status: FRIENDSHIP_STATUS.REJECTED,
    },
    include: {
      requester: true,
      addressee: true,
    },
  });

  return toInvitationResponse(updatedFriendship);
}

export async function removeFriend(userId: string, friendId: string) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: FRIENDSHIP_STATUS.ACCEPTED,
      OR: [
        { requesterId: userId, addresseeId: friendId },
        { requesterId: friendId, addresseeId: userId },
      ],
    },
  });

  if (!friendship) {
    throw new AppError("Friendship not found", 404);
  }

  await prisma.friendship.delete({
    where: {
      id: friendship.id,
    },
  });
}
