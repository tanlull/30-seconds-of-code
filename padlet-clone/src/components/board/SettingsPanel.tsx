"use client";

import { useState } from "react";
import { FORMATS, REACTIONS } from "@/lib/formats";
import { WALLPAPERS } from "@/lib/wallpapers";
import type { ClientBoard } from "@/lib/boardTypes";

export default function SettingsPanel({
  board,
  onClose,
  onSave
}: {
  board: ClientBoard;
  onClose: () => void;
  onSave: (patch: Partial<ClientBoard>) => Promise<void> | void;
}) {
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description);
  const [format, setFormat] = useState(board.format);
  const [wallpaper, setWallpaper] = useState(board.wallpaper);
  const [visibility, setVisibility] = useState(board.visibility);
  const [reactionType, setReactionType] = useState(board.reactionType);
  const [allowComments, setAllowComments] = useState(board.allowComments);
  const [allowReactions, setAllowReactions] = useState(board.allowReactions);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await onSave({ title, description, format, wallpaper, visibility, reactionType, allowComments, allowReactions });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-sm overflow-auto bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-gray-800">Board settings</h2>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-gray-400 hover:bg-gray-100">
            ✕
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-600">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-400" />

        <label className="mb-1 block text-sm font-medium text-gray-600">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mb-3 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-400" />

        <label className="mb-2 block text-sm font-medium text-gray-600">Format</label>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`rounded-lg border p-2 text-center text-xs transition ${
                format === f.id ? "border-brand-400 bg-brand-50 ring-2 ring-brand-200" : "border-gray-200 hover:border-brand-200"
              }`}
            >
              <div className="text-lg">{f.icon}</div>
              {f.name}
            </button>
          ))}
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-600">Wallpaper</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              onClick={() => setWallpaper(w.id)}
              title={w.name}
              className={`h-8 w-8 rounded-full border-2 ${wallpaper === w.id ? "border-brand-500" : "border-white"} shadow`}
              style={{ background: w.css }}
            />
          ))}
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-600">Reactions</label>
        <div className="mb-3 flex gap-2">
          {Object.entries(REACTIONS).map(([id, r]) => (
            <button
              key={id}
              onClick={() => setReactionType(id)}
              className={`rounded-full px-3 py-1.5 text-sm ${reactionType === id ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">Allow reactions</span>
          <input type="checkbox" checked={allowReactions} onChange={(e) => setAllowReactions(e.target.checked)} className="h-4 w-4 accent-brand-500" />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">Allow comments</span>
          <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} className="h-4 w-4 accent-brand-500" />
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-600">Visibility</label>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="mb-5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="public">Public — anyone with the link</option>
          <option value="secret">Secret — hidden from explore</option>
          <option value="private">Private — only me</option>
        </select>

        <button
          onClick={save}
          disabled={busy}
          className="w-full rounded-full bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
