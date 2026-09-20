import { NextRequest, NextResponse } from "next/server";
import { signIn, signOut, getSessionUser, registerWithPassword, loginWithPassword } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const mode = body.mode || "guest";

  try {
    let user;
    if (mode === "register") {
      user = await registerWithPassword(body.name || "", body.email || "", body.password || "");
    } else if (mode === "login") {
      user = await loginWithPassword(body.email || "", body.password || "");
    } else {
      if (!body.name || typeof body.name !== "string") {
        return NextResponse.json({ error: "Name required" }, { status: 400 });
      }
      user = await signIn(body.name);
    }
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Sign-in failed" }, { status: 400 });
  }
}

export async function DELETE() {
  signOut();
  return NextResponse.json({ ok: true });
}
