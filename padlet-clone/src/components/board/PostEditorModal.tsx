"use client";

import { useState } from "react";
import { POST_COLORS } from "@/lib/formats";
import type { ClientPost } from "@/lib/boardTypes";

export type EditorValue = {
  subject: string;
  body: string;
  color: string;
  imageUrl: string;
  linkUrl: string;
};

export default function PostEditorModal({
  initial,
  title,
  defaultColor,
  onCancel,
  onSave
}: {
  initial?: Partial<ClientPost>;
  title: string;
  defaultColor: string;
  onCancel: () => void;
  onSave: (v: EditorValue) => Promise<void> | void;
}) {
  const [subject, setSubject] = useState(initial?.subject || "");
  const [body, setBody] = useState(initial?.body || "");
  const [color, setColor] = useState(initial?.color || defaultColor || "#ffffff");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl || "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await onSave({ subject, body, color, imageUrl, linkUrl });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-3 font-display text-lg font-bold text-gray-800">{title}</h3>
        <div className="rounded-xl p-3" style={{ background: color }}>
          <input
            autoFocus
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full bg-transparent text-base font-semibold text-gray-900 outline-none placeholder:text-gray-500"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write something…"
            rows={4}
            className="mt-1 w-full resize-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
          />
        </div>

        <label className="mt-3 block text-xs font-medium text-gray-500">Image URL (optional)</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…/photo.jpg"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
        />
        <label className="mt-2 block text-xs font-medium text-gray-500">Link URL (optional)</label>
        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://…"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
        />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {POST_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border-2 ${color === c ? "border-brand-500" : "border-gray-200"}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
