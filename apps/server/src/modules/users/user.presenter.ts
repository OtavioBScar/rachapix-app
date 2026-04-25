import type { User } from "@prisma/client";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  pixKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    pixKey: user.pixKey,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
