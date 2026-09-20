import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { publish } from "@/lib/events";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id }, include: { board: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!post.board.allowComments) {
    return NextResponse.json({ error: "Comments are disabled" }, { status: 403 });
  }

  const user = await getSessionUser();
  const body = await req.json();
  const text = (body.body || "").toString().trim().slice(0, 1000);
  if (!text) return NextResponse.json({ error: "Empty comment" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      postId: post.id,
      authorId: user?.id || null,
      authorName: user?.name || body.authorName || "Anonymous",
      body: text
    }
  });
  publish(post.board.slug, "comment");
  return NextResponse.json({ id: comment.id });
}
