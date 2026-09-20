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

export async function signIn(name: string): Promise<SessionUser> {
  const clean = name.trim().slice(0, 40) || "Guest";
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const user = await prisma.user.create({ data: { name: clean, color } });
  cookies().set(COOKIE, sign(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
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
