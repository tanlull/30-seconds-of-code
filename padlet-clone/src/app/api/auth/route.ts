import { NextRequest, NextResponse } from "next/server";
import { signIn, signOut, getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const user = await signIn(name);
  return NextResponse.json({ user });
}

export async function DELETE() {
  signOut();
  return NextResponse.json({ ok: true });
}
