import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const board = await prisma.board.findUnique({ where: { slug: params.slug } });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const body = await req.json();
  const count = await prisma.section.count({ where: { boardId: board.id } });
  const section = await prisma.section.create({
    data: { boardId: board.id, title: (body.title || "New section").toString().slice(0, 60), position: count }
  });
  return NextResponse.json({ id: section.id });
}
