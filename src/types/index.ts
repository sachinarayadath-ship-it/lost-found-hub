/**
 * Domain types shared across the app.
 * These mirror the expected Express/MongoDB API payloads.
 */

export type ItemKind = "lost" | "found";
export type ItemStatus = "pending" | "open" | "matched" | "resolved" | "rejected" | "claimed";
export type ClaimStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt: string;
}

export interface Item {
  _id: string;
  kind: ItemKind;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  imageUrl?: string;
  status: ItemStatus;
  reporter: Pick<User, "_id" | "name">;
  claimCount: number;
  createdAt: string;
}

export interface Claim {
  _id: string;
  item: Pick<Item, "_id" | "title" | "kind" | "imageUrl" | "location" | "status">;
  status: ClaimStatus;
  message: string;
  claimedBy?: User;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  body: string;
  type: "match" | "claim" | "status" | "message" | "system";
  read: boolean;
  relatedItem?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  author: string;
  body: string;
  mine: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

export interface ItemFilters {
  q?: string;
  kind?: ItemKind;
  category?: string;
  location?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const CATEGORIES = [
  "Electronics",
  "Wallets & IDs",
  "Keys",
  "Bags & Luggage",
  "Clothing",
  "Jewellery",
  "Books & Stationery",
  "Pets",
  "Documents",
  "Other",
] as const;

export const LOCATIONS = [
  "Main Library",
  "Central Campus",
  "Metro Station",
  "Community Park",
  "Sports Complex",
  "Cafeteria",
  "Bus Terminal",
  "Admin Block",
] as const;

/** Filter patch that allows explicitly clearing a value with `undefined`. */
export type FilterPatch = { [K in keyof ItemFilters]?: ItemFilters[K] | undefined };
