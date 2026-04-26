export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  pixKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  pixKey?: string;
}

export interface UpdateMeInput {
  name?: string;
  phone?: string | null;
  pixKey?: string | null;
}

export interface Friend {
  id: string;
  status: string;
  friend: PublicUser;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  status: string;
  requester: PublicUser;
  addressee: PublicUser;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationList {
  incoming: Invitation[];
  outgoing: Invitation[];
}

export interface ExpenseDocument {
  id: string;
  imageUrl: string;
  extractedAmountCents: number | null;
  extractedText: string | null;
  confidence: number | null;
  ocrStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface PixPayment {
  id: string;
  provider: string;
  pixCode: string;
  amountCents: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseParticipant {
  id: string;
  amountCents: number;
  status: string;
  user: PublicUser;
  pixPayments: PixPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  originalAmountCents: number;
  participantCount: number;
  status: string;
  dueDate: string | null;
  owner: PublicUser;
  document: ExpenseDocument | null;
  participants: ExpenseParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface Charge {
  id: string;
  amountCents: number;
  status: string;
  expense: {
    id: string;
    title: string;
    description: string | null;
    originalAmountCents: number;
    status: string;
    dueDate: string | null;
    owner: PublicUser;
    document: ExpenseDocument | null;
    createdAt: string;
    updatedAt: string;
  };
  pixPayments: PixPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  title: string;
  description?: string;
  originalAmountCents: number;
  participantUserIds: string[];
}
