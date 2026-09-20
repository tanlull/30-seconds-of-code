import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { uniqueSlug } from "@/lib/slug";
import { templateById } from "@/lib/templates";
import { FORMATS } from "@/lib/formats";

const validFormats = new Set(FORMATS.map((f) => f.id));

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const body = await req.json();
  const templateId: string | undefined = body.templateId;
  const template = templateId ? templateById(templateId) : undefined;

  const title: string = (body.title || template?.name || "Untitled board").toString().slice(0, 80);
  const format: string = validFormats.has(body.format) ? body.format : template?.format || "wall";
  const wallpaper: string = body.wallpaper || template?.wallpaper || "aurora";

  const slug = await uniqueSlug(title);

  const board = await prisma.board.create({
    data: {
      slug,
      title,
      description: template?.description || "",
      format,
      wallpaper,
      ownerId: user.id
    }
  });

  if (template) {
    const sectionMap = new Map<string, string>();
    if (template.sections?.length) {
      for (let i = 0; i < template.sections.length; i++) {
        const s = await prisma.section.create({
          data: { boardId: board.id, title: template.sections[i], position: i }
        });
        sectionMap.set(template.sections[i], s.id);
      }
    }
    for (let i = 0; i < template.posts.length; i++) {
      const p = template.posts[i];
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
          x: p.x ?? 40 + (i % 4) * 60,
          y: p.y ?? 40 + i * 40,
          lat: p.lat ?? null,
          lng: p.lng ?? null,
          position: i
        }
      });
    }
  }

  return NextResponse.json({ slug: board.slug });
}
