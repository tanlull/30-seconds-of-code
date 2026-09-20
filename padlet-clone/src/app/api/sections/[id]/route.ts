import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

async function ownsSection(id: string, userId?: string) {
  const section = await prisma.section.findUnique({ where: { id }, include: { board: true } });
  if (!section) return null;
  if (!userId || section.board.ownerId !== userId) return false;
  return section;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  const section = await ownsSection(params.id, user?.id);
  if (section === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (section === false) return NextResponse.json({ error: "Owner only" }, { status: 403 });
  const body = await req.json();
  await prisma.section.update({
    where: { id: params.id },
    data: { title: (body.title || "Section").toString().slice(0, 60) }
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  const section = await ownsSection(params.id, user?.id);
  if (section === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (section === false) return NextResponse.json({ error: "Owner only" }, { status: 403 });
  await prisma.section.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
