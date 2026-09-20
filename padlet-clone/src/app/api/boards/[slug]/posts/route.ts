import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const board = await prisma.board.findUnique({ where: { slug: params.slug } });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await getSessionUser();
  const body = await req.json();

  const count = await prisma.post.count({ where: { boardId: board.id } });

  const post = await prisma.post.create({
    data: {
      boardId: board.id,
      sectionId: body.sectionId || null,
      authorId: user?.id || null,
      authorName: user?.name || body.authorName || "Anonymous",
      subject: (body.subject || "").toString().slice(0, 120),
      body: (body.body || "").toString().slice(0, 4000),
      color: body.color || board.postColor || "#ffffff",
      imageUrl: body.imageUrl || null,
      linkUrl: body.linkUrl || null,
      x: typeof body.x === "number" ? body.x : 40 + Math.random() * 200,
      y: typeof body.y === "number" ? body.y : 40 + Math.random() * 120,
      lat: typeof body.lat === "number" ? body.lat : null,
      lng: typeof body.lng === "number" ? body.lng : null,
      position: count
    }
  });

  return NextResponse.json({ id: post.id });
}
