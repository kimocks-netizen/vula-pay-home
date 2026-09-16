// ---------------------------------------------------------------------------
// Data-service layer.
//
// This home page only has sign-up/login. The actual dashboard and backend
// functionality lives in scan2pay-web (Next.js).
// ---------------------------------------------------------------------------

import type { PublicUser, User } from "./types";

// Mock user data for development/demo sign-in
const users: User[] = [
  {
    id: "usr_001",
    fullName: "Demo User",
    phone: "+27800000000",
    email: "demo@example.com",
    password: "password",
    userType: "vendor",
    merchantId: "mch_001",
    avatarInitials: "DU",
    createdAt: new Date().toISOString(),
    phoneVerified: true,
    emailVerified: false,
  },
];

/** Simulated network latency so loading states are real. */
const latency = (ms = 260) => new Promise((r) => setTimeout(r, ms));





const strip = (u: User): PublicUser => {
  const { password: _password, ...rest } = u;
  return rest;
};

export const normalisePhone = (raw: string) => {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0")) return `+27${digits.slice(1)}`;
  if (digits.startsWith("27")) return `+${digits}`;
  return digits;
};

export const api = {
  async login(identifier: string, password: string): Promise<PublicUser> {
    await latency();
    const phone = normalisePhone(identifier);
    const email = identifier.trim().toLowerCase();
    const found = users.find((u) => u.phone === phone || u.email.toLowerCase() === email);
    if (!found) throw new Error("No Vula Pay account found for those details.");
    if (found.password !== password) throw new Error("That password is incorrect.");
    return strip(found);
  },

  async register(input: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    userType: User["userType"];
    businessName: string;
  }): Promise<PublicUser> {
    await latency(420);
    const phone = normalisePhone(input.phone);
    if (users.some((u) => u.phone === phone)) {
      throw new Error("That mobile number is already registered.");
    }
    const id = `usr_${String(users.length + 1).padStart(3, "0")}`;
    const merchantId = `mch_${String(users.length + 1).padStart(3, "0")}`;
    const user: User = {
      id,
      fullName: input.fullName,
      phone,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      userType: input.userType,
      merchantId,
      avatarInitials: input.fullName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      createdAt: new Date().toISOString(),
      phoneVerified: true,
      emailVerified: false,
    };
    users.push(user);
    return strip(user);
  },

  async getUser(id: string): Promise<PublicUser | null> {
    await latency(80);
    const u = users.find((x) => x.id === id);
    return u ? strip(u) : null;
  },
};
