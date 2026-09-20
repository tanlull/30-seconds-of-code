import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, getVisitorKey } from "@/lib/session";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await getSessionUser();
  const key = getVisitorKey();

  const existing = await prisma.reaction.findUnique({
    where: { postId_userKey: { postId: post.id, userKey: key } }
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({
      data: { postId: post.id, userKey: key, userId: user?.id || null, value: 1 }
    });
  }

  const count = await prisma.reaction.count({ where: { postId: post.id } });
  return NextResponse.json({ count, reacted: !existing });
}
