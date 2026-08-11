import axios, { type AxiosError } from "axios";

import type {
  Claim,
  Item,
  ItemFilters,
  Message,
  Notification,
  Paginated,
  User,
} from "@/types";
import {
  MOCK_ADMIN,
  MOCK_CATEGORY_SPLIT,
  MOCK_CLAIMS,
  MOCK_ITEMS,
  MOCK_MESSAGES,
  MOCK_NOTIFICATIONS,
  MOCK_STATS,
  MOCK_TRENDS,
  MOCK_USER,
  MOCK_USERS,
  delay,
  filterMockItems,
} from "./mock";

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:5000/api";

export const TOKEN_KEY = "lostfound.token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 800,
});

/** Attach the JWT to every outgoing request. */
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Normalise errors and clear the session on 401. */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("lostfound.user");
    }
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  },
);

/**
 * Executes API request with a tight abort deadline, then falls back to local
 * mock data instantly if the server is unreachable or slow.
 */
async function withFallback<T>(request: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  try {
    const result = await request();
    return result;
  } catch {
    // Return mock data immediately — no delay, no retry.
    return fallback();
  }
}

/* ------------------------------- auth ---------------------------------- */

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    withFallback(
      async () => (await api.post<AuthResponse>("/auth/login", payload)).data,
      () => ({
        token: "mock.jwt.token",
        user: payload.email.startsWith("admin")
          ? MOCK_ADMIN
          : { ...MOCK_USER, email: payload.email },
      }),
    ),
  register: (payload: { name: string; email: string; password: string }) =>
    withFallback(
      async () => (await api.post<AuthResponse>("/auth/register", payload)).data,
      () => ({
        token: "mock.jwt.token",
        user: { ...MOCK_USER, name: payload.name, email: payload.email },
      }),
    ),
  me: () => withFallback(async () => (await api.get<User>("/auth/me")).data, () => MOCK_USER),
  updateProfile: (payload: Partial<User>) =>
    withFallback(
      async () => (await api.put<User>("/users/me", payload)).data,
      () => ({ ...MOCK_USER, ...payload }) as User,
    ),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    withFallback(
      async () => (await api.put<{ ok: boolean }>("/users/me/password", payload)).data,
      () => ({ ok: true }),
    ),
};

/* ------------------------------- items --------------------------------- */

export const itemsApi = {
  list: (filters: ItemFilters = {}) =>
    withFallback(
      async () => (await api.get<Paginated<Item>>("/items", { params: filters })).data,
      () => filterMockItems(filters),
    ),
  get: (id: string) =>
    withFallback(
      async () => (await api.get<Item>(`/items/${id}`)).data,
      () => MOCK_ITEMS.find((i) => i._id === id) ?? MOCK_ITEMS[0]!,
    ),
  create: (payload: FormData) =>
    withFallback(
      async () =>
        (
          await api.post<Item>("/items", payload, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        ).data,
      () => ({ ...MOCK_ITEMS[0]!, _id: `itm_${Date.now()}`, status: "pending" as const }),
    ),
  update: (id: string, payload: Partial<Item>) =>
    withFallback(
      async () => (await api.put<Item>(`/items/${id}`, payload)).data,
      () => ({ ...MOCK_ITEMS[0]!, ...payload, _id: id }) as Item,
    ),
  remove: (id: string) =>
    withFallback(
      async () => (await api.delete<{ ok: boolean }>(`/items/${id}`)).data,
      () => ({ ok: true }),
    ),
  myReports: () =>
    withFallback(
      async () => (await api.get<Item[]>("/items/mine")).data,
      () => MOCK_ITEMS.slice(0, 5),
    ),
  stats: () =>
    withFallback(
      async () => (await api.get<typeof MOCK_STATS>("/items/stats")).data,
      () => MOCK_STATS,
    ),
};

/* ------------------------------- claims -------------------------------- */

export const claimsApi = {
  create: (itemId: string, message: string) =>
    withFallback(
      async () => (await api.post<Claim>(`/items/${itemId}/claims`, { message })).data,
      () => ({ ...MOCK_CLAIMS[0]!, _id: `clm_${Date.now()}`, message, status: "pending" as const }),
    ),
  mine: () =>
    withFallback(async () => (await api.get<Claim[]>("/claims/mine")).data, () => MOCK_CLAIMS),
};

/* ---------------------------- messaging -------------------------------- */

export const messagesApi = {
  thread: (itemId: string) =>
    withFallback(
      async () => (await api.get<Message[]>(`/items/${itemId}/messages`)).data,
      () => MOCK_MESSAGES,
    ),
  send: (itemId: string, body: string) =>
    withFallback(
      async () => (await api.post<Message>(`/items/${itemId}/messages`, { body })).data,
      () => ({
        _id: `msg_${Date.now()}`,
        author: "You",
        body,
        mine: true,
        createdAt: new Date().toISOString(),
      }),
    ),
};

/* -------------------------- notifications ------------------------------ */

export const notificationsApi = {
  list: () =>
    withFallback(
      async () => (await api.get<Notification[]>("/notifications")).data,
      () => MOCK_NOTIFICATIONS,
    ),
  markRead: (id: string) =>
    withFallback(
      async () => (await api.put<{ ok: boolean }>(`/notifications/${id}/read`, {})).data,
      () => ({ ok: true }),
    ),
  markAllRead: () =>
    withFallback(
      async () => (await api.put<{ ok: boolean }>("/notifications/read-all", {})).data,
      () => ({ ok: true }),
    ),
};

/* ------------------------------- admin --------------------------------- */

export const adminApi = {
  items: (filters: ItemFilters = {}) =>
    withFallback(
      async () => (await api.get<Paginated<Item>>("/admin/items", { params: filters })).data,
      () => filterMockItems({ ...filters, limit: 50 }),
    ),
  moderate: (id: string, action: "approve" | "reject" | "resolve") =>
    withFallback(
      async () => (await api.put<Item>(`/admin/items/${id}/${action}`, {})).data,
      () => MOCK_ITEMS.find((i) => i._id === id)!,
    ),
  users: () =>
    withFallback(async () => (await api.get<User[]>("/admin/users")).data, () => MOCK_USERS),
  setUserRole: (id: string, role: User["role"]) =>
    withFallback(
      async () => (await api.put<User>(`/admin/users/${id}/role`, { role })).data,
      () => ({ ...MOCK_USERS[0]!, _id: id, role }),
    ),
  analytics: () =>
    withFallback(
      async () =>
        (
          await api.get<{
            stats: typeof MOCK_STATS;
            trends: typeof MOCK_TRENDS;
            categories: typeof MOCK_CATEGORY_SPLIT;
          }>("/admin/analytics")
        ).data,
      () => ({ stats: MOCK_STATS, trends: MOCK_TRENDS, categories: MOCK_CATEGORY_SPLIT }),
    ),
};
