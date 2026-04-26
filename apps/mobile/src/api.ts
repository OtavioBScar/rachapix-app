import type {
  AuthResponse,
  Charge,
  CreateExpenseInput,
  Expense,
  Friend,
  InvitationList,
  PixPayment,
  PublicUser,
  RegisterInput,
  UpdateMeInput,
} from "./types";

declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
  };
};
declare const __DEV__: boolean;

const DEFAULT_API_URL = "http://10.0.2.2:3333/api";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

interface ApiErrorResponse {
  error?: {
    message?: string;
    details?: unknown;
  };
}

const sensitiveFields = new Set(["authorization", "password", "token"]);

function redactSensitiveData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveData);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      sensitiveFields.has(key.toLowerCase()) ? "[redacted]" : redactSensitiveData(item),
    ]),
  );
}

function parseBodyForLog(body: BodyInit | null | undefined) {
  if (typeof body !== "string") {
    return body ?? null;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function parseResponseText(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function logApi(label: string, payload: unknown) {
  if (__DEV__) {
    console.log(label, redactSensitiveData(payload));
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const method = options.method ?? "GET";
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  logApi("[api:request]", {
    method,
    url,
    body: parseBodyForLog(options.body),
  });

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    logApi("[api:network-error]", {
      method,
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  const text = await response.text();
  const data = parseResponseText(text);

  logApi("[api:response]", {
    method,
    url,
    status: response.status,
    body: data,
  });

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;
    throw new Error(errorData?.error?.message ?? "Erro ao chamar a API.");
  }

  return data as T;
}

function jsonBody(body: unknown) {
  return JSON.stringify(body);
}

export function login(input: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: jsonBody(input),
  });
}

export function register(input: RegisterInput) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: jsonBody(input),
  });
}

export async function getDashboard(token: string) {
  const [user, charges, expenses, friends, invitations] = await Promise.all([
    request<PublicUser>("/me", {}, token),
    request<Charge[]>("/me/charges", {}, token),
    request<Expense[]>("/expenses", {}, token),
    request<Friend[]>("/friends", {}, token),
    request<InvitationList>("/friends/invitations", {}, token),
  ]);

  return {
    user,
    charges,
    expenses,
    friends,
    invitations,
  };
}

export function createExpense(token: string, input: CreateExpenseInput) {
  return request<Expense>(
    "/expenses",
    {
      method: "POST",
      body: jsonBody(input),
    },
    token,
  );
}

export function createFriendInvitation(token: string, email: string) {
  return request(
    "/friends/invitations",
    {
      method: "POST",
      body: jsonBody({ email }),
    },
    token,
  );
}

export function acceptFriendInvitation(token: string, id: string) {
  return request(`/friends/invitations/${id}/accept`, { method: "POST" }, token);
}

export function rejectFriendInvitation(token: string, id: string) {
  return request(`/friends/invitations/${id}/reject`, { method: "POST" }, token);
}

export function generatePixForCharge(token: string, id: string) {
  return request<PixPayment>(`/me/charges/${id}/pix`, { method: "POST" }, token);
}

export function updateMe(token: string, input: UpdateMeInput) {
  return request<PublicUser>(
    "/me",
    {
      method: "PATCH",
      body: jsonBody(input),
    },
    token,
  );
}
