import { Prisma } from "@prisma/client";

import {
  DOCUMENT_OCR_STATUS,
  EXPENSE_STATUS,
  FRIENDSHIP_STATUS,
  PARTICIPANT_STATUS,
  PIX_PAYMENT_STATUS,
} from "../../domain/status.js";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { toPublicUser } from "../users/user.presenter.js";
import type { CreateExpenseInput, UpsertExpenseDocumentInput } from "./expense.schemas.js";

const expenseInclude = {
  owner: true,
  document: true,
  participants: {
    include: {
      user: true,
      pixPayments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.ExpenseInclude;

type ExpenseWithRelations = Prisma.ExpenseGetPayload<{
  include: typeof expenseInclude;
}>;

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids));
}

function splitAmount(totalAmountCents: number, participantCount: number) {
  const baseAmount = Math.floor(totalAmountCents / participantCount);
  const remainder = totalAmountCents % participantCount;

  return Array.from({ length: participantCount }, (_value, index) => baseAmount + (index < remainder ? 1 : 0));
}

function toExpenseResponse(expense: ExpenseWithRelations) {
  return {
    id: expense.id,
    title: expense.title,
    description: expense.description,
    originalAmountCents: expense.originalAmountCents,
    participantCount: expense.participantCount,
    status: expense.status,
    dueDate: expense.dueDate,
    owner: toPublicUser(expense.owner),
    document: expense.document,
    participants: expense.participants.map((participant) => ({
      id: participant.id,
      amountCents: participant.amountCents,
      status: participant.status,
      user: toPublicUser(participant.user),
      pixPayments: participant.pixPayments,
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
    })),
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

async function assertAcceptedFriends(ownerId: string, participantUserIds: string[]) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: FRIENDSHIP_STATUS.ACCEPTED,
      OR: participantUserIds.flatMap((participantUserId) => [
        { requesterId: ownerId, addresseeId: participantUserId },
        { requesterId: participantUserId, addresseeId: ownerId },
      ]),
    },
  });

  const acceptedFriendIds = new Set(
    friendships.map((friendship) =>
      friendship.requesterId === ownerId ? friendship.addresseeId : friendship.requesterId,
    ),
  );

  const invalidParticipantIds = participantUserIds.filter((participantUserId) => !acceptedFriendIds.has(participantUserId));

  if (invalidParticipantIds.length > 0) {
    throw new AppError("All participants must be accepted friends", 400, {
      invalidParticipantIds,
    });
  }
}

export async function createExpense(ownerId: string, input: CreateExpenseInput) {
  const participantUserIds = uniqueIds(input.participantUserIds);

  if (participantUserIds.includes(ownerId)) {
    throw new AppError("Expense owner cannot be a participant", 400);
  }

  await assertAcceptedFriends(ownerId, participantUserIds);

  const splitAmounts = splitAmount(input.originalAmountCents, participantUserIds.length);

  const expense = await prisma.$transaction(async (tx) => {
    const createdExpense = await tx.expense.create({
      data: {
        ownerId,
        title: input.title,
        description: input.description,
        originalAmountCents: input.originalAmountCents,
        participantCount: participantUserIds.length,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        participants: {
          create: participantUserIds.map((participantUserId, index) => ({
            userId: participantUserId,
            amountCents: splitAmounts[index],
          })),
        },
      },
      include: expenseInclude,
    });

    return createdExpense;
  });

  return toExpenseResponse(expense);
}

export async function listOwnedExpenses(ownerId: string) {
  const expenses = await prisma.expense.findMany({
    where: {
      ownerId,
    },
    include: expenseInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return expenses.map(toExpenseResponse);
}

export async function getExpense(userId: string, expenseId: string) {
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      OR: [
        { ownerId: userId },
        {
          participants: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: expenseInclude,
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  return toExpenseResponse(expense);
}

export async function cancelExpense(ownerId: string, expenseId: string) {
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      ownerId,
    },
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  const updatedExpense = await prisma.$transaction(async (tx) => {
    await tx.expenseParticipant.updateMany({
      where: {
        expenseId,
        status: {
          not: PARTICIPANT_STATUS.PAID,
        },
      },
      data: {
        status: PARTICIPANT_STATUS.CANCELED,
      },
    });

    return tx.expense.update({
      where: {
        id: expenseId,
      },
      data: {
        status: EXPENSE_STATUS.CANCELED,
      },
      include: expenseInclude,
    });
  });

  return toExpenseResponse(updatedExpense);
}

export async function upsertDocument(ownerId: string, expenseId: string, input: UpsertExpenseDocumentInput) {
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      ownerId,
    },
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  const document = await prisma.expenseDocument.upsert({
    where: {
      expenseId,
    },
    create: {
      expenseId,
      imageUrl: input.imageUrl,
      extractedAmountCents: input.extractedAmountCents,
      extractedText: input.extractedText,
      confidence: input.confidence,
      ocrStatus:
        input.extractedAmountCents || input.extractedText ? DOCUMENT_OCR_STATUS.COMPLETED : DOCUMENT_OCR_STATUS.PENDING,
    },
    update: {
      imageUrl: input.imageUrl,
      extractedAmountCents: input.extractedAmountCents,
      extractedText: input.extractedText,
      confidence: input.confidence,
      ocrStatus:
        input.extractedAmountCents || input.extractedText ? DOCUMENT_OCR_STATUS.COMPLETED : DOCUMENT_OCR_STATUS.PENDING,
    },
  });

  return document;
}

export async function listMyCharges(userId: string) {
  const charges = await prisma.expenseParticipant.findMany({
    where: {
      userId,
    },
    include: {
      expense: {
        include: {
          owner: true,
          document: true,
        },
      },
      pixPayments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return charges.map((charge) => ({
    id: charge.id,
    amountCents: charge.amountCents,
    status: charge.status,
    expense: {
      id: charge.expense.id,
      title: charge.expense.title,
      description: charge.expense.description,
      originalAmountCents: charge.expense.originalAmountCents,
      status: charge.expense.status,
      dueDate: charge.expense.dueDate,
      owner: toPublicUser(charge.expense.owner),
      document: charge.expense.document,
      createdAt: charge.expense.createdAt,
      updatedAt: charge.expense.updatedAt,
    },
    pixPayments: charge.pixPayments,
    createdAt: charge.createdAt,
    updatedAt: charge.updatedAt,
  }));
}

export async function getMyCharge(userId: string, chargeId: string) {
  const charge = await prisma.expenseParticipant.findFirst({
    where: {
      id: chargeId,
      userId,
    },
    include: {
      expense: {
        include: {
          owner: true,
          document: true,
        },
      },
      pixPayments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!charge) {
    throw new AppError("Charge not found", 404);
  }

  return {
    id: charge.id,
    amountCents: charge.amountCents,
    status: charge.status,
    expense: {
      id: charge.expense.id,
      title: charge.expense.title,
      description: charge.expense.description,
      originalAmountCents: charge.expense.originalAmountCents,
      status: charge.expense.status,
      dueDate: charge.expense.dueDate,
      owner: toPublicUser(charge.expense.owner),
      document: charge.expense.document,
      createdAt: charge.expense.createdAt,
      updatedAt: charge.expense.updatedAt,
    },
    pixPayments: charge.pixPayments,
    createdAt: charge.createdAt,
    updatedAt: charge.updatedAt,
  };
}

export async function generatePixForCharge(userId: string, chargeId: string) {
  const charge = await prisma.expenseParticipant.findFirst({
    where: {
      id: chargeId,
      userId,
    },
    include: {
      expense: {
        include: {
          owner: true,
        },
      },
      pixPayments: {
        where: {
          status: PIX_PAYMENT_STATUS.CREATED,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!charge) {
    throw new AppError("Charge not found", 404);
  }

  if (charge.status === PARTICIPANT_STATUS.PAID || charge.status === PARTICIPANT_STATUS.CANCELED) {
    throw new AppError("Charge cannot generate Pix in its current status", 409);
  }

  if (!charge.expense.owner.pixKey) {
    throw new AppError("Expense owner does not have a Pix key configured", 409);
  }

  const existingPayment = charge.pixPayments[0];

  if (existingPayment) {
    return existingPayment;
  }

  const pixCode = [
    "PIX-MOCK",
    `to=${charge.expense.owner.pixKey}`,
    `amountCents=${charge.amountCents}`,
    `chargeId=${charge.id}`,
  ].join("|");

  const payment = await prisma.$transaction(async (tx) => {
    const createdPayment = await tx.pixPayment.create({
      data: {
        expenseParticipantId: charge.id,
        provider: "mock",
        amountCents: charge.amountCents,
        pixCode,
      },
    });

    await tx.expenseParticipant.update({
      where: {
        id: charge.id,
      },
      data: {
        status: PARTICIPANT_STATUS.PIX_GENERATED,
      },
    });

    return createdPayment;
  });

  return payment;
}
