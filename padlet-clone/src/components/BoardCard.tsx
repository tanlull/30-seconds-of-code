"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/clientApi";
import { wallpaperById } from "@/lib/wallpapers";
import { formatMeta } from "@/lib/formats";

export default function BoardCard({
  board,
  owned
}: {
  board: { slug: string; title: string; format: string; wallpaper: string; postCount: number; ownerName: string };
  owned: boolean;
}) {
  const router = useRouter();
  const wp = wallpaperById(board.wallpaper);
  const fm = formatMeta(board.format);

  async function remove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${board.title}"?`)) return;
    await api(`/api/boards/${board.slug}`, "DELETE");
    router.refresh();
  }

  return (
    <Link
      href={`/board/${board.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-post"
    >
      <div className="h-24 w-full" style={{ background: wp.css }} />
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <span>{fm.icon}</span>
          <span>{fm.name}</span>
          <span>·</span>
          <span>{board.postCount} posts</span>
        </div>
        <div className="mt-1 truncate font-semibold text-gray-800">{board.title}</div>
        <div className="mt-0.5 text-xs text-gray-400">by {board.ownerName}</div>
      </div>
      {owned && (
        <button
          onClick={remove}
          className="absolute right-2 top-2 hidden rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-brand-600 shadow group-hover:block"
        >
          Delete
        </button>
      )}
    </Link>
  );
}
