import { customAlphabet } from "nanoid";
import { prisma } from "./prisma";

const nano = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);

export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "board"
  );
}

export async function uniqueSlug(title: string) {
  const base = slugify(title);
  let slug = `${base}-${nano()}`;
  // extremely unlikely collision, but guard anyway
  while (await prisma.board.findUnique({ where: { slug } })) {
    slug = `${base}-${nano()}`;
  }
  return slug;
}
