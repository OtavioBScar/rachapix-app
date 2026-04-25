import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { toPublicUser } from "../users/user.presenter.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function signToken(user: { id: string; email: string }) {
  return jwt.sign(
    {
      email: user.email,
    },
    env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
}

export async function register(input: RegisterInput) {
  const email = normalizeEmail(input.email);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email is already in use", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
      phone: input.phone,
      pixKey: input.pixKey,
    },
  });

  return {
    user: toPublicUser(user),
    token: signToken(user),
  };
}

export async function login(input: LoginInput) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    user: toPublicUser(user),
    token: signToken(user),
  };
}
