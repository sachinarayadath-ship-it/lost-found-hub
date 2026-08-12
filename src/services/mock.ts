import {
  CATEGORIES,
  LOCATIONS,
  type Claim,
  type Item,
  type ItemFilters,
  type Message,
  type Notification,
  type Paginated,
  type User,
} from "@/types";

import backpack from "@/assets/item-backpack.jpg";
import keys from "@/assets/item-keys.jpg";
import phone from "@/assets/item-phone.jpg";
import wallet from "@/assets/item-wallet.jpg";

/**
 * MOCK DATA LAYER — placeholder for the Express/MongoDB backend.
 * Every function here mirrors a REST endpoint in services/api.ts.
 * Delete this file once the real API is wired up.
 */

const photos = [phone, wallet, keys, backpack];

export const delay = (ms = 0) => new Promise((r) => setTimeout(r, ms));

const titles: [string, string, number][] = [
  ["Black iPhone 14 with cracked case", "Electronics", 0],
  ["Brown leather wallet with student ID", "Wallets & IDs", 1],
  ["Set of 3 keys with blue keyring", "Keys", 2],
  ["Navy Jansport backpack", "Bags & Luggage", 3],
  ["Silver bracelet with initials A.M.", "Jewellery", 1],
  ["Prescription glasses, tortoise frame", "Other", 0],
  ["Grey hoodie, size M", "Clothing", 3],
  ["Blue water bottle with stickers", "Other", 2],
  ["Passport holder with boarding pass", "Documents", 1],
  ["Bluetooth earbuds case", "Electronics", 0],
  ["Ginger tabby cat, red collar", "Pets", 3],
  ["Calculus textbook, 4th edition", "Books & Stationery", 2],
  ["Car key fob, Honda", "Keys", 2],
  ["Pink umbrella", "Other", 3],
  ["Gold-rimmed reading glasses", "Other", 1],
  ["Laptop charger, 65W USB-C", "Electronics", 0],
];

const statuses = ["open", "pending", "matched", "resolved", "rejected"] as const;

export const MOCK_ITEMS: Item[] = titles.map(([title, category, photoIdx], i) => {
  const date = new Date(Date.UTC(2026, 6, 28 - i, 9, 0));
  return {
    _id: `itm_${100 + i}`,
    kind: i % 2 === 0 ? "lost" : "found",
    title,
    category,
    description:
      "Reported through the community LostFound+ desk. If this looks like yours, open a claim and answer the verification question so a moderator can confirm ownership before handover.",
    location: LOCATIONS[i % LOCATIONS.length]!,
    date: date.toISOString(),
    imageUrl: photos[photoIdx]!,
    status: statuses[i % statuses.length]!,
    reporter: { _id: `usr_${i}`, name: ["Aarav S.", "Meera K.", "Daniel O.", "Priya R."][i % 4]! },
    claimCount: i % 4,
    createdAt: date.toISOString(),
  };
});

export const MOCK_USER: User = {
  _id: "usr_me",
  name: "Sachin A.",
  email: "sachin@community.org",
  role: "user",
  phone: "+91 98765 43210",
  location: "Central Campus",
  bio: "Volunteer at the campus help desk. Happy to reunite people with their things.",
  createdAt: "2025-11-04T10:00:00.000Z",
};

export const MOCK_ADMIN: User = {
  ...MOCK_USER,
  _id: "usr_admin",
  name: "System Admin",
  email: "admin@lostfound.com",
  role: "admin",
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: "ntf_1",
    title: "Possible match found",
    body: "A found item at Main Library looks like your reported “Black iPhone 14”.",
    type: "match",
    read: false,
    createdAt: "2026-08-11T09:12:00.000Z",
  },
  {
    _id: "ntf_2",
    title: "Claim approved",
    body: "Your claim on “Brown leather wallet” was approved. Collect it from the Admin Block desk.",
    type: "claim",
    read: false,
    createdAt: "2026-08-10T17:40:00.000Z",
  },
  {
    _id: "ntf_3",
    title: "New message",
    body: "Meera K. replied about the set of keys you reported.",
    type: "message",
    read: false,
    createdAt: "2026-08-10T08:05:00.000Z",
  },
  {
    _id: "ntf_4",
    title: "Report published",
    body: "Your report “Navy Jansport backpack” passed review and is now public.",
    type: "status",
    read: true,
    createdAt: "2026-08-08T12:30:00.000Z",
  },
];

export const MOCK_CLAIMS: Claim[] = MOCK_ITEMS.slice(1, 4).map((item, i) => ({
  _id: `clm_${i}`,
  item: {
    _id: item._id,
    title: item.title,
    kind: item.kind,
    imageUrl: item.imageUrl!,
    location: item.location,
    status: item.status,
  },
  status: (["pending", "approved", "rejected"] as const)[i]!,
  message: "This matches the item I lost — I can describe the contents for verification.",
  createdAt: item.createdAt,
}));

export const MOCK_MESSAGES: Message[] = [
  {
    _id: "msg_1",
    author: "You",
    body: "Hi! I think this is mine — it has a photo of my dog as the lock screen.",
    mine: true,
    createdAt: "2026-08-10T10:02:00.000Z",
  },
  {
    _id: "msg_2",
    author: "Meera K.",
    body: "That matches. A moderator will verify and arrange handover at the Admin Block.",
    mine: false,
    createdAt: "2026-08-10T10:18:00.000Z",
  },
];

export const MOCK_USERS: User[] = [
  MOCK_USER,
  MOCK_ADMIN,
  ...["Aarav S.", "Meera K.", "Daniel O.", "Priya R.", "Noah T."].map((name, i) => ({
    _id: `usr_${i}`,
    name,
    email: `${name.split(" ")[0]!.toLowerCase()}@community.org`,
    role: "user" as const,
    location: LOCATIONS[i % LOCATIONS.length]!,
    createdAt: new Date(Date.UTC(2026, 2 + i, 3)).toISOString(),
  })),
];

export const MOCK_TRENDS = [
  { month: "Feb", reported: 42, recovered: 19 },
  { month: "Mar", reported: 55, recovered: 28 },
  { month: "Apr", reported: 61, recovered: 34 },
  { month: "May", reported: 58, recovered: 37 },
  { month: "Jun", reported: 73, recovered: 48 },
  { month: "Jul", reported: 81, recovered: 59 },
  { month: "Aug", reported: 64, recovered: 46 },
];

export function filterMockItems(filters: ItemFilters = {}): Paginated<Item> {
  const { q, kind, category, location, status, from, to } = filters;
  const limit = filters.limit ?? 9;
  const page = filters.page ?? 1;

  const filtered = MOCK_ITEMS.filter((item) => {
    if (kind && item.kind !== kind) return false;
    if (category && category !== "all" && item.category !== category) return false;
    if (location && location !== "all" && item.location !== location) return false;
    if (status && status !== "all" && item.status !== status) return false;
    if (from && new Date(item.date) < new Date(from)) return false;
    if (to && new Date(item.date) > new Date(to)) return false;
    if (q) {
      const hay = `${item.title} ${item.description} ${item.category} ${item.location}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    page,
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  };
}

export const MOCK_STATS = {
  reported: 1284,
  recovered: 869,
  activeMembers: 3120,
  pendingReviews: MOCK_ITEMS.filter((i) => i.status === "pending").length,
  get resolutionRate() {
    return Math.round((this.recovered / this.reported) * 100);
  },
};

export const MOCK_CATEGORY_SPLIT = CATEGORIES.slice(0, 6).map((name, i) => ({
  name,
  count: [128, 96, 84, 61, 47, 33][i]!,
}));
