"use client";

import { useState } from "react";
import type { ClientPost, ClientSection } from "@/lib/boardTypes";

export default function PostDetailModal({
  post,
  reactionIcon,
  allowReactions,
  allowComments,
  canManage,
  sections,
  onClose,
  onReact,
  onAddComment,
  onEdit,
  onDelete,
  onMoveSection
}: {
  post: ClientPost;
  reactionIcon: string;
  allowReactions: boolean;
  allowComments: boolean;
  canManage: boolean;
  sections?: ClientSection[];
  onClose: () => void;
  onReact: () => void;
  onAddComment: (text: string) => Promise<void> | void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveSection?: (sectionId: string | null) => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await onAddComment(text.trim());
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5" style={{ background: post.color }}>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-600">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/70 text-[10px]">
              {post.authorName.slice(0, 1).toUpperCase()}
            </span>
            {post.authorName}
          </div>
          {post.subject && <h3 className="font-display text-xl font-bold text-gray-900">{post.subject}</h3>}
          {post.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.imageUrl} alt="" className="mt-3 max-h-72 w-full rounded-lg object-cover" />
          )}
          {post.body && <p className="mt-2 whitespace-pre-wrap text-gray-800">{post.body}</p>}
          {post.linkUrl && (
            <a href={post.linkUrl} target="_blank" rel="noreferrer" className="mt-2 block truncate text-sm font-medium text-brand-700 hover:underline">
              🔗 {post.linkUrl}
            </a>
          )}
        </div>

        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3 text-sm">
          {allowReactions && (
            <button
              onClick={onReact}
              className={`flex items-center gap-1 rounded-full px-3 py-1 transition hover:bg-gray-100 ${
                post.reacted ? "font-bold text-brand-600" : "text-gray-600"
              }`}
            >
              {reactionIcon} {post.reactionCount}
            </button>
          )}
          <span className="text-gray-500">💬 {post.comments.length} comments</span>
          <div className="ml-auto flex gap-2">
            {canManage && (
              <>
                <button onClick={onEdit} className="rounded-full px-3 py-1 text-gray-600 hover:bg-gray-100">
                  Edit
                </button>
                <button onClick={onDelete} className="rounded-full px-3 py-1 text-brand-600 hover:bg-brand-50">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {sections && sections.length > 0 && onMoveSection && (
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 text-sm">
            <span className="text-gray-500">Section</span>
            <select
              value={post.sectionId ?? ""}
              onChange={(e) => onMoveSection(e.target.value || null)}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="">Unsorted</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="px-5 py-4">
          {post.comments.length === 0 && <p className="text-sm text-gray-400">No comments yet.</p>}
          <ul className="space-y-3">
            {post.comments.map((c) => (
              <li key={c.id} className="text-sm">
                <span className="font-semibold text-gray-800">{c.authorName}</span>{" "}
                <span className="text-gray-700">{c.body}</span>
              </li>
            ))}
          </ul>

          {allowComments && (
            <div className="mt-4 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Add a comment…"
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-400"
              />
              <button
                onClick={submit}
                disabled={busy}
                className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
              >
                Post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
