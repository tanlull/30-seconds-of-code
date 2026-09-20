import { notFound } from "next/navigation";
import BoardView from "@/components/board/BoardView";
import { getBoardBySlug, serializeBoard } from "@/lib/serialize";
import { getSessionUser, getVisitorKey } from "@/lib/session";
import type { ClientBoard } from "@/lib/boardTypes";

export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: { params: { slug: string } }) {
  const board = await getBoardBySlug(params.slug);
  if (!board) notFound();

  const user = await getSessionUser();
  if (board.visibility === "private" && (!user || user.id !== board.ownerId)) {
    notFound();
  }

  const visitorKey = getVisitorKey();
  const serialized = JSON.parse(JSON.stringify(serializeBoard(board, visitorKey))) as ClientBoard;

  return <BoardView initialBoard={serialized} user={user} />;
}
