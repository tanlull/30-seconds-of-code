import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, getVisitorKey } from "@/lib/session";
import { getBoardBySlug, serializeBoard } from "@/lib/serialize";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const board = await getBoardBySlug(params.slug);
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const visitorKey = getVisitorKey();
  return NextResponse.json({ board: serializeBoard(board, visitorKey) });
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getSessionUser();
  const board = await prisma.board.findUnique({ where: { slug: params.slug } });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!user || board.ownerId !== user.id) {
    return NextResponse.json({ error: "Only the owner can change settings" }, { status: 403 });
  }
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of [
    "title",
    "description",
    "format",
    "wallpaper",
    "visibility",
    "postColor",
    "allowComments",
    "allowReactions",
    "reactionType"
  ]) {
    if (key in body) data[key] = body[key];
  }
  const updated = await prisma.board.update({ where: { id: board.id }, data });
  return NextResponse.json({ ok: true, board: { slug: updated.slug, format: updated.format } });
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getSessionUser();
  const board = await prisma.board.findUnique({ where: { slug: params.slug } });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!user || board.ownerId !== user.id) {
    return NextResponse.json({ error: "Only the owner can delete" }, { status: 403 });
  }
  await prisma.board.delete({ where: { id: board.id } });
  return NextResponse.json({ ok: true });
}
