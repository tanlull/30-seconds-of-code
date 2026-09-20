"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api } from "@/lib/clientApi";
import { wallpaperById } from "@/lib/wallpapers";
import { REACTIONS, formatMeta } from "@/lib/formats";
import type { ClientBoard, ClientPost, SessionUserLite } from "@/lib/boardTypes";
import PostEditorModal, { EditorValue } from "./PostEditorModal";
import PostDetailModal from "./PostDetailModal";
import SettingsPanel from "./SettingsPanel";
import {
  WallLayout,
  GridLayout,
  RowsLayout,
  StreamLayout,
  TimelineLayout,
  TableLayout,
  ColumnsLayout,
  FreeformLayout,
  LayoutProps
} from "./BoardLayouts";

const MapLayout = dynamic(() => import("./MapLayout"), { ssr: false });

export default function BoardView({
  initialBoard,
  user
}: {
  initialBoard: ClientBoard;
  user: SessionUserLite;
}) {
  const [board, setBoard] = useState<ClientBoard>(initialBoard);
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; post?: ClientPost; sectionId?: string | null } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState("");

  const interactingRef = useRef(0);
  const moveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const modalOpenRef = useRef(false);
  modalOpenRef.current = !!editor || !!detailId || showSettings;

  const isOwner = !!user && user.id === board.owner.id;
  const wp = wallpaperById(board.wallpaper);
  const reactionIcon = REACTIONS[board.reactionType]?.icon || "❤️";
  const fm = formatMeta(board.format);

  const refresh = useCallback(async () => {
    try {
      const { board: fresh } = await api<{ board: ClientBoard }>(`/api/boards/${board.slug}`, "GET");
      setBoard(fresh);
    } catch {
      /* ignore transient errors */
    }
  }, [board.slug]);

  // Live polling (paused during modals / active dragging)
  useEffect(() => {
    const t = setInterval(() => {
      if (modalOpenRef.current) return;
      if (Date.now() - interactingRef.current < 1500) return;
      refresh();
    }, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  const onReact = useCallback(
    async (id: string) => {
      setBoard((b) => ({
        ...b,
        posts: b.posts.map((p) =>
          p.id === id ? { ...p, reacted: !p.reacted, reactionCount: p.reactionCount + (p.reacted ? -1 : 1) } : p
        )
      }));
      try {
        const res = await api<{ count: number; reacted: boolean }>(`/api/posts/${id}/react`, "POST");
        setBoard((b) => ({
          ...b,
          posts: b.posts.map((p) => (p.id === id ? { ...p, reacted: res.reacted, reactionCount: res.count } : p))
        }));
      } catch {
        refresh();
      }
    },
    [refresh]
  );

  const onMove = useCallback((id: string, patch: Partial<ClientPost>) => {
    interactingRef.current = Date.now();
    setBoard((b) => ({ ...b, posts: b.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
    clearTimeout(moveTimers.current[id]);
    moveTimers.current[id] = setTimeout(() => {
      api(`/api/posts/${id}`, "PATCH", patch).catch(() => {});
    }, 350);
  }, []);

  async function createPost(v: EditorValue, sectionId?: string | null, extra?: Partial<ClientPost>) {
    await api(`/api/boards/${board.slug}/posts`, "POST", {
      ...v,
      sectionId: sectionId ?? null,
      lat: extra?.lat,
      lng: extra?.lng,
      x: extra?.x,
      y: extra?.y
    });
    await refresh();
  }

  async function saveEdit(v: EditorValue, id: string) {
    await api(`/api/posts/${id}`, "PATCH", v);
    await refresh();
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    await api(`/api/posts/${id}`, "DELETE");
    setDetailId(null);
    await refresh();
  }

  async function addComment(id: string, text: string) {
    await api(`/api/posts/${id}/comments`, "POST", { body: text });
    await refresh();
  }

  async function addSection() {
    const title = prompt("Section title", "New section");
    if (title == null) return;
    await api(`/api/boards/${board.slug}/sections`, "POST", { title });
    await refresh();
  }

  async function saveSettings(patch: Partial<ClientBoard>) {
    await api(`/api/boards/${board.slug}`, "PATCH", patch);
    setShowSettings(false);
    await refresh();
  }

  async function addPinAt(lat: number, lng: number) {
    await api(`/api/boards/${board.slug}/posts`, "POST", {
      subject: "New pin",
      body: "",
      color: "#ffffff",
      lat,
      lng
    });
    flash("Pin added");
    await refresh();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${board.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function share() {
    navigator.clipboard?.writeText(window.location.href).then(
      () => flash("Board link copied!"),
      () => flash(window.location.href)
    );
  }

  const detailPost = detailId ? board.posts.find((p) => p.id === detailId) || null : null;

  const layoutProps: LayoutProps = {
    board,
    reactionIcon,
    onOpen: (post) => setDetailId(post.id),
    onReact,
    onAdd: (sectionId) => setEditor({ mode: "create", sectionId }),
    onMove,
    onAddSection: addSection,
    isOwner
  };

  function renderLayout() {
    switch (board.format) {
      case "grid":
        return <GridLayout {...layoutProps} />;
      case "rows":
        return <RowsLayout {...layoutProps} />;
      case "stream":
        return <StreamLayout {...layoutProps} />;
      case "timeline":
        return <TimelineLayout {...layoutProps} />;
      case "table":
        return <TableLayout {...layoutProps} />;
      case "columns":
        return <ColumnsLayout {...layoutProps} />;
      case "freeform":
        return <FreeformLayout {...layoutProps} />;
      case "map":
        return <MapLayout board={board} onOpen={(p) => setDetailId(p.id)} onAddAt={addPinAt} />;
      default:
        return <WallLayout {...layoutProps} />;
    }
  }

  return (
    <div className="min-h-screen" style={{ background: wp.css }}>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/40 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="font-display font-extrabold text-brand-600">
            ✦ Boardly
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold text-gray-900">{board.title}</h1>
            {board.description && <p className="truncate text-xs text-gray-600">{board.description}</p>}
          </div>
          <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-gray-600">
            {fm.icon} {fm.name}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={share} className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white">
              Share
            </button>
            <button onClick={exportJson} className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white">
              Export
            </button>
            {isOwner && (
              <button onClick={() => setShowSettings(true)} className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white">
                ⚙ Settings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        className="mx-auto max-w-7xl px-4 py-6"
        onDoubleClick={(e) => {
          if (e.target === e.currentTarget && board.format === "freeform") setEditor({ mode: "create" });
        }}
      >
        {board.posts.length === 0 && board.format !== "map" && board.format !== "columns" && (
          <div className="rounded-2xl border-2 border-dashed border-white/70 bg-white/40 p-12 text-center text-gray-600">
            No posts yet. Tap the pink <b>+</b> button to add the first one!
          </div>
        )}
        {renderLayout()}
      </div>

      {/* Floating add button */}
      {board.format !== "map" && (
        <button
          onClick={() => setEditor({ mode: "create" })}
          className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-3xl text-white shadow-xl transition hover:scale-105 hover:bg-brand-600"
          aria-label="Add post"
        >
          +
        </button>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900/90 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      {editor && (
        <PostEditorModal
          title={editor.mode === "create" ? "New post" : "Edit post"}
          defaultColor={board.postColor}
          initial={editor.post}
          onCancel={() => setEditor(null)}
          onSave={async (v) => {
            if (editor.mode === "edit" && editor.post) await saveEdit(v, editor.post.id);
            else await createPost(v, editor.sectionId);
            setEditor(null);
          }}
        />
      )}

      {detailPost && (
        <PostDetailModal
          post={detailPost}
          reactionIcon={reactionIcon}
          allowReactions={board.allowReactions}
          allowComments={board.allowComments}
          canManage={isOwner}
          sections={board.format === "columns" ? board.sections : undefined}
          onMoveSection={(sectionId) => onMove(detailPost.id, { sectionId })}
          onClose={() => setDetailId(null)}
          onReact={() => onReact(detailPost.id)}
          onAddComment={(t) => addComment(detailPost.id, t)}
          onEdit={() => {
            setEditor({ mode: "edit", post: detailPost });
            setDetailId(null);
          }}
          onDelete={() => deletePost(detailPost.id)}
        />
      )}

      {showSettings && <SettingsPanel board={board} onClose={() => setShowSettings(false)} onSave={saveSettings} />}
    </div>
  );
}
