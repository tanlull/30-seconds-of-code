import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { uniqueSlug } from "@/lib/slug";
import { generateBoard } from "@/lib/aiGenerate";

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
    return NextResponse.json({ error: "Describe what you want to create." }, { status: 400 });
  }

  const { spec, source } = await generateBoard(prompt.trim());
  const slug = await uniqueSlug(spec.title);

  const board = await prisma.board.create({
    data: {
      slug,
      title: spec.title,
      description: `Generated with AI from: "${prompt.trim().slice(0, 120)}"`,
      format: spec.format,
      wallpaper: spec.wallpaper,
      ownerId: user.id
    }
  });

  const sectionMap = new Map<string, string>();
  if (spec.sections?.length) {
    for (let i = 0; i < spec.sections.length; i++) {
      const s = await prisma.section.create({
        data: { boardId: board.id, title: spec.sections[i], position: i }
      });
      sectionMap.set(spec.sections[i], s.id);
    }
  }

  for (let i = 0; i < spec.posts.length; i++) {
    const p = spec.posts[i];
    await prisma.post.create({
      data: {
        boardId: board.id,
        sectionId: p.section ? sectionMap.get(p.section) ?? null : null,
        authorId: user.id,
        authorName: user.name,
        subject: p.subject || "",
        body: p.body || "",
        color: p.color || "#ffffff",
        imageUrl: p.imageUrl || null,
        linkUrl: p.linkUrl || null,
        x: p.x ?? 40 + (i % 4) * 70,
        y: p.y ?? 40 + Math.floor(i / 4) * 90,
        lat: p.lat ?? null,
        lng: p.lng ?? null,
        position: i
      }
    });
  }

  return NextResponse.json({ slug: board.slug, format: board.format, source });
}
