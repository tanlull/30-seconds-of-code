"use client";

import { useRef } from "react";
import type { ClientBoard, ClientPost } from "@/lib/boardTypes";
import PostCard from "./PostCard";

export type LayoutProps = {
  board: ClientBoard;
  reactionIcon: string;
  onOpen: (post: ClientPost) => void;
  onReact: (id: string) => void;
  onAdd: (sectionId?: string | null) => void;
  onMove: (id: string, patch: Partial<ClientPost>) => void;
  onAddSection: () => void;
  isOwner: boolean;
};

function sortByPos(a: ClientPost, b: ClientPost) {
  return a.position - b.position || a.createdAt.localeCompare(b.createdAt);
}

export function WallLayout(p: LayoutProps) {
  const posts = [...p.board.posts].sort(sortByPos);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          reactionIcon={p.reactionIcon}
          allowReactions={p.board.allowReactions}
          onOpen={() => p.onOpen(post)}
          onReact={() => p.onReact(post.id)}
        />
      ))}
    </div>
  );
}

export function GridLayout(p: LayoutProps) {
  const posts = [...p.board.posts].sort(sortByPos);
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          reactionIcon={p.reactionIcon}
          allowReactions={p.board.allowReactions}
          onOpen={() => p.onOpen(post)}
          onReact={() => p.onReact(post.id)}
          compact
        />
      ))}
    </div>
  );
}

export function RowsLayout(p: LayoutProps) {
  const posts = [...p.board.posts].sort(sortByPos);
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          reactionIcon={p.reactionIcon}
          allowReactions={p.board.allowReactions}
          onOpen={() => p.onOpen(post)}
          onReact={() => p.onReact(post.id)}
        />
      ))}
    </div>
  );
}

export function StreamLayout(p: LayoutProps) {
  const posts = [...p.board.posts].sort(sortByPos);
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          reactionIcon={p.reactionIcon}
          allowReactions={p.board.allowReactions}
          onOpen={() => p.onOpen(post)}
          onReact={() => p.onReact(post.id)}
        />
      ))}
    </div>
  );
}

export function TimelineLayout(p: LayoutProps) {
  const posts = [...p.board.posts].sort(sortByPos);
  return (
    <div className="scrollbar-thin overflow-x-auto pb-4">
      <div className="relative flex min-w-max items-center gap-8 px-8 py-10">
        <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-white/70" />
        {posts.map((post, i) => (
          <div key={post.id} className="relative flex w-64 flex-col items-center">
            <div className={`${i % 2 === 0 ? "order-1 mb-6" : "order-3 mt-6"} w-64`}>
              <PostCard
                post={post}
                reactionIcon={p.reactionIcon}
                allowReactions={p.board.allowReactions}
                onOpen={() => p.onOpen(post)}
                onReact={() => p.onReact(post.id)}
                compact
              />
            </div>
            <div className="order-2 z-10 h-4 w-4 rounded-full border-2 border-brand-500 bg-white" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableLayout(p: LayoutProps) {
  const posts = [...p.board.posts].sort(sortByPos);
  return (
    <div className="overflow-x-auto rounded-xl border border-white/50 bg-white/90 shadow">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="p-3">Author</th>
            <th className="p-3">Subject</th>
            <th className="p-3">Body</th>
            <th className="p-3">Link</th>
            <th className="p-3 text-center">{p.reactionIcon}</th>
            <th className="p-3 text-center">💬</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post.id}
              className="cursor-pointer border-t border-gray-100 hover:bg-brand-50/60"
              onClick={() => p.onOpen(post)}
            >
              <td className="p-3 font-medium text-gray-700">{post.authorName}</td>
              <td className="p-3">
                <span className="inline-block h-3 w-3 rounded-full align-middle" style={{ background: post.color }} />{" "}
                <span className="font-semibold text-gray-900">{post.subject || "—"}</span>
              </td>
              <td className="max-w-xs truncate p-3 text-gray-600">{post.body || "—"}</td>
              <td className="p-3 text-brand-600">
                {post.linkUrl ? (
                  <a href={post.linkUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="hover:underline">
                    link
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="p-3 text-center">{post.reactionCount}</td>
              <td className="p-3 text-center">{post.comments.length}</td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-400">
                No rows yet — add a post.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ColumnsLayout(p: LayoutProps) {
  const sections = [...p.board.sections].sort((a, b) => a.position - b.position);
  const bySection = (id: string | null) =>
    p.board.posts.filter((post) => post.sectionId === id).sort(sortByPos);
  const orphans = bySection(null);

  return (
    <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-4">
      {sections.map((s) => (
        <div
          key={s.id}
          className="flex w-72 shrink-0 flex-col rounded-2xl bg-white/75 p-3 shadow-sm"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const id = e.dataTransfer.getData("text/post");
            if (id) p.onMove(id, { sectionId: s.id });
          }}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="font-semibold text-gray-800">{s.title}</h3>
            <span className="text-xs text-gray-400">{bySection(s.id).length}</span>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            {bySection(s.id).map((post) => (
              <div key={post.id} className="flex items-start gap-1">
                <span
                  draggable
                  title="Drag to another column"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/post", post.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="mt-3 shrink-0 cursor-grab select-none px-0.5 text-sm leading-none text-gray-400 active:cursor-grabbing"
                >
                  ⋮⋮
                </span>
                <div className="min-w-0 flex-1">
                  <PostCard
                    post={post}
                    reactionIcon={p.reactionIcon}
                    allowReactions={p.board.allowReactions}
                    onOpen={() => p.onOpen(post)}
                    onReact={() => p.onReact(post.id)}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => p.onAdd(s.id)}
            className="mt-3 rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 hover:border-brand-300 hover:text-brand-600"
          >
            + Add post
          </button>
        </div>
      ))}

      {orphans.length > 0 && (
        <div
          className="flex w-72 shrink-0 flex-col rounded-2xl bg-white/60 p-3 shadow-sm"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const id = e.dataTransfer.getData("text/post");
            if (id) p.onMove(id, { sectionId: null });
          }}
        >
          <h3 className="mb-2 px-1 font-semibold text-gray-500">Unsorted</h3>
          <div className="flex flex-1 flex-col gap-3">
            {orphans.map((post) => (
              <div key={post.id} className="flex items-start gap-1">
                <span
                  draggable
                  title="Drag to another column"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/post", post.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="mt-3 shrink-0 cursor-grab select-none px-0.5 text-sm leading-none text-gray-400 active:cursor-grabbing"
                >
                  ⋮⋮
                </span>
                <div className="min-w-0 flex-1">
                  <PostCard
                    post={post}
                    reactionIcon={p.reactionIcon}
                    allowReactions={p.board.allowReactions}
                    onOpen={() => p.onOpen(post)}
                    onReact={() => p.onReact(post.id)}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {p.isOwner && (
        <button
          onClick={p.onAddSection}
          className="h-12 w-40 shrink-0 rounded-2xl border-2 border-dashed border-white/70 text-sm font-semibold text-white/90 hover:bg-white/20"
        >
          + Add section
        </button>
      )}
    </div>
  );
}

export function FreeformLayout(p: LayoutProps) {
  const dragRef = useRef<{
    id: string;
    dx: number;
    dy: number;
    x0: number;
    y0: number;
    moved: boolean;
    post: ClientPost;
  } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  function onPointerDown(e: React.PointerEvent, post: ClientPost) {
    if ((e.target as HTMLElement).closest("button, a, input, textarea")) return;
    const area = areaRef.current!.getBoundingClientRect();
    dragRef.current = {
      id: post.id,
      dx: e.clientX - area.left - post.x,
      dy: e.clientY - area.top - post.y,
      x0: e.clientX,
      y0: e.clientY,
      moved: false,
      post
    };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 8) return;
      d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    const area = areaRef.current!.getBoundingClientRect();
    const x = Math.max(0, e.clientX - area.left - d.dx);
    const y = Math.max(0, e.clientY - area.top - d.dy);
    p.onMove(d.id, { x, y });
  }
  function onPointerUp() {
    const d = dragRef.current;
    dragRef.current = null;
    if (d && !d.moved) p.onOpen(d.post);
  }

  return (
    <div
      ref={areaRef}
      className="relative h-[70vh] w-full overflow-hidden rounded-xl"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {p.board.posts.map((post) => (
        <div
          key={post.id}
          className="absolute w-56"
          style={{ left: post.x, top: post.y }}
          onPointerDown={(e) => onPointerDown(e, post)}
        >
          <PostCard
            post={post}
            reactionIcon={p.reactionIcon}
            allowReactions={p.board.allowReactions}
            onOpen={() => p.onOpen(post)}
            onReact={() => p.onReact(post.id)}
            compact
          />
        </div>
      ))}
      <div className="pointer-events-none absolute bottom-3 right-4 rounded-full bg-white/70 px-3 py-1 text-xs text-gray-500">
        Drag posts to arrange · double-click empty space to add
      </div>
    </div>
  );
}
