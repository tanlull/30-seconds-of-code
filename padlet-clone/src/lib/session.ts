import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "./prisma";

const SECRET = process.env.SESSION_SECRET || "boardly-dev-secret-change-me";
const COOKIE = "boardly_session";

function sign(value: string) {
  const mac = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${mac}`;
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return value;
}

export type SessionUser = { id: string; name: string; color: string };

export async function getSessionUser(): Promise<SessionUser | null> {
  const c = cookies().get(COOKIE)?.value;
  if (!c) return null;
  const userId = verify(c);
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return { id: user.id, name: user.name, color: user.color };
}

/** Read the visitor key without mutating cookies (safe in Server Components). */
export function readVisitorKey(): string {
  return cookies().get("boardly_visitor")?.value || "";
}

/**
 * Stable per-visitor key used to dedupe anonymous reactions.
 * Sets the cookie if missing — only call from Route Handlers / Server Actions.
 */
export function getVisitorKey(): string {
  const jar = cookies();
  let key = jar.get("boardly_visitor")?.value;
  if (!key) {
    key = crypto.randomUUID();
    jar.set("boardly_visitor", key, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }
  return key;
}

const COLORS = ["#f0508c", "#7048e8", "#1098ad", "#f76707", "#37b24d", "#e8590c", "#1c7ed6", "#d6336c"];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(hash);
  const b = Buffer.from(derived);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function setSessionCookie(userId: string) {
  cookies().set(COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

/** Quick guest sign-in with just a display name (no password). */
export async function signIn(name: string): Promise<SessionUser> {
  const clean = name.trim().slice(0, 40) || "Guest";
  const user = await prisma.user.create({ data: { name: clean, color: randomColor() } });
  setSessionCookie(user.id);
  return { id: user.id, name: user.name, color: user.color };
}

export async function registerWithPassword(name: string, email: string, password: string): Promise<SessionUser> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim().slice(0, 40) || cleanEmail.split("@")[0] || "User";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) throw new Error("Enter a valid email");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) throw new Error("An account with that email already exists");

  const user = await prisma.user.create({
    data: { name: cleanName, email: cleanEmail, passwordHash: hashPassword(password), color: randomColor() }
  });
  setSessionCookie(user.id);
  return { id: user.id, name: user.name, color: user.color };
}

export async function loginWithPassword(email: string, password: string): Promise<SessionUser> {
  const cleanEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password");
  }
  setSessionCookie(user.id);
  return { id: user.id, name: user.name, color: user.color };
}

export function signOut() {
  cookies().delete(COOKIE);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
