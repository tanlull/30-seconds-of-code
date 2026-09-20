import { prisma } from "./prisma";

export async function getBoardBySlug(slug: string) {
  const board = await prisma.board.findUnique({
    where: { slug },
    include: {
      owner: true,
      sections: { orderBy: { position: "asc" } },
      posts: {
        orderBy: { position: "asc" },
        include: {
          comments: { orderBy: { createdAt: "asc" } },
          reactions: true
        }
      }
    }
  });
  return board;
}

export type BoardData = NonNullable<Awaited<ReturnType<typeof getBoardBySlug>>>;

export function serializeBoard(board: BoardData, visitorKey: string) {
  return {
    id: board.id,
    slug: board.slug,
    title: board.title,
    description: board.description,
    format: board.format,
    wallpaper: board.wallpaper,
    visibility: board.visibility,
    postColor: board.postColor,
    allowComments: board.allowComments,
    allowReactions: board.allowReactions,
    reactionType: board.reactionType,
    owner: { id: board.owner.id, name: board.owner.name, color: board.owner.color },
    updatedAt: board.updatedAt,
    sections: board.sections.map((s) => ({ id: s.id, title: s.title, position: s.position })),
    posts: board.posts.map((p) => ({
      id: p.id,
      sectionId: p.sectionId,
      authorId: p.authorId,
      authorName: p.authorName,
      subject: p.subject,
      body: p.body,
      color: p.color,
      imageUrl: p.imageUrl,
      linkUrl: p.linkUrl,
      x: p.x,
      y: p.y,
      lat: p.lat,
      lng: p.lng,
      position: p.position,
      dateField: p.dateField,
      createdAt: p.createdAt,
      reactionCount: p.reactions.length,
      reacted: p.reactions.some((r) => r.userKey === visitorKey),
      comments: p.comments.map((c) => ({ id: c.id, authorName: c.authorName, body: c.body, createdAt: c.createdAt }))
    }))
  };
}

export type SerializedBoard = ReturnType<typeof serializeBoard>;
export type SerializedPost = SerializedBoard["posts"][number];
