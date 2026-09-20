"use client";

import type { ClientPost } from "@/lib/boardTypes";

export default function PostCard({
  post,
  reactionIcon,
  allowReactions,
  onOpen,
  onReact,
  compact
}: {
  post: ClientPost;
  reactionIcon: string;
  allowReactions: boolean;
  onOpen: () => void;
  onReact: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-post transition hover:shadow-lg"
      style={{ background: post.color }}
      onClick={onOpen}
    >
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt={post.subject || "post image"}
          className={`w-full object-cover ${compact ? "h-28" : "h-40"}`}
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
      )}
      <div className="p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[9px]">
            {post.authorName.slice(0, 1).toUpperCase()}
          </span>
          {post.authorName}
        </div>
        {post.subject && <div className="font-semibold text-gray-900">{post.subject}</div>}
        {post.body && (
          <p className={`mt-0.5 whitespace-pre-wrap text-sm text-gray-700 ${compact ? "line-clamp-3" : ""}`}>
            {post.body}
          </p>
        )}
        {post.linkUrl && (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2 block truncate text-xs font-medium text-brand-600 hover:underline"
          >
            🔗 {post.linkUrl}
          </a>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          {allowReactions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReact();
              }}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 transition hover:bg-black/5 ${
                post.reacted ? "font-bold text-brand-600" : ""
              }`}
            >
              <span>{reactionIcon}</span>
              <span>{post.reactionCount}</span>
            </button>
          )}
          <span className="flex items-center gap-1">💬 {post.comments.length}</span>
        </div>
      </div>
    </div>
  );
}
