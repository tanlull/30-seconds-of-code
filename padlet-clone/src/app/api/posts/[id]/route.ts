import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/events";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id }, include: { board: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("subject" in body) data.subject = (body.subject || "").toString().slice(0, 120);
  if ("body" in body) data.body = (body.body || "").toString().slice(0, 4000);
  if ("color" in body) data.color = body.color;
  if ("imageUrl" in body) data.imageUrl = body.imageUrl || null;
  if ("linkUrl" in body) data.linkUrl = body.linkUrl || null;
  if ("sectionId" in body) data.sectionId = body.sectionId || null;
  if (typeof body.x === "number") data.x = body.x;
  if (typeof body.y === "number") data.y = body.y;
  if (typeof body.lat === "number") data.lat = body.lat;
  if (typeof body.lng === "number") data.lng = body.lng;
  if (typeof body.position === "number") data.position = body.position;

  await prisma.post.update({ where: { id: post.id }, data });
  publish(post.board.slug, "post-updated");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id }, include: { board: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.post.delete({ where: { id: post.id } });
  publish(post.board.slug, "post-deleted");
  return NextResponse.json({ ok: true });
}
