import Link from "next/link";
import TopBar from "@/components/TopBar";
import CreateBoard from "@/components/CreateBoard";
import BoardCard from "@/components/BoardCard";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getSessionUser();

  const mine = user
    ? await prisma.board.findMany({
        where: { ownerId: user.id },
        orderBy: { updatedAt: "desc" },
        include: { owner: true, _count: { select: { posts: true } } }
      })
    : [];

  const explore = await prisma.board.findMany({
    where: { visibility: "public", ...(user ? { NOT: { ownerId: user.id } } : {}) },
    orderBy: { updatedAt: "desc" },
    take: 12,
    include: { owner: true, _count: { select: { posts: true } } }
  });

  const toCard = (b: (typeof explore)[number]) => ({
    slug: b.slug,
    title: b.title,
    format: b.format,
    wallpaper: b.wallpaper,
    postCount: b._count.posts,
    ownerName: b.owner.name
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-gray-900">
              {user ? `Hi, ${user.name} 👋` : "Your dashboard"}
            </h1>
            <p className="mt-1 text-gray-500">Make boards, browse templates, and collaborate.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/gallery" className="rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
              Templates
            </Link>
            <CreateBoard canCreate={!!user} />
          </div>
        </div>

        {user && (
          <section className="mb-10">
            <h2 className="mb-3 text-lg font-bold text-gray-800">My boards</h2>
            {mine.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                No boards yet. Click <span className="font-semibold text-brand-600">+ Make a board</span> to start.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {mine.map((b) => (
                  <BoardCard key={b.id} board={toCard(b)} owned />
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-800">Explore public boards</h2>
          {explore.length === 0 ? (
            <p className="text-gray-500">Nothing here yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {explore.map((b) => (
                <BoardCard key={b.id} board={toCard(b)} owned={false} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
