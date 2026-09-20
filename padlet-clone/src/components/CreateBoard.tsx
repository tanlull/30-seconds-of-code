"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/clientApi";
import { FORMATS } from "@/lib/formats";
import { WALLPAPERS } from "@/lib/wallpapers";

export default function CreateBoard({ canCreate }: { canCreate: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("wall");
  const [wallpaper, setWallpaper] = useState("aurora");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function create() {
    setBusy(true);
    setErr("");
    try {
      const { slug } = await api<{ slug: string }>("/api/boards", "POST", {
        title: title || "Untitled board",
        format,
        wallpaper
      });
      router.push(`/board/${slug}`);
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => (canCreate ? setOpen(true) : setErr("Sign in first (top right) to make a board."))}
        className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
      >
        + Make a board
      </button>
      {err && !open && <p className="mt-2 text-sm text-brand-600">{err}</p>}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-display text-xl font-bold text-gray-800">Make a new board</h2>
            <label className="mb-1 block text-sm font-medium text-gray-600">Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My awesome board"
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />

            <label className="mb-2 block text-sm font-medium text-gray-600">Format</label>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    format === f.id
                      ? "border-brand-400 bg-brand-50 ring-2 ring-brand-200"
                      : "border-gray-200 hover:border-brand-200"
                  }`}
                >
                  <div className="text-xl">{f.icon}</div>
                  <div className="font-semibold text-gray-800">{f.name}</div>
                </button>
              ))}
            </div>

            <label className="mb-2 block text-sm font-medium text-gray-600">Wallpaper</label>
            <div className="mb-5 flex flex-wrap gap-2">
              {WALLPAPERS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWallpaper(w.id)}
                  title={w.name}
                  className={`h-9 w-9 rounded-full border-2 ${
                    wallpaper === w.id ? "border-brand-500" : "border-white"
                  } shadow`}
                  style={{ background: w.css }}
                />
              ))}
            </div>

            {err && <p className="mb-3 text-sm text-brand-600">{err}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={create}
                disabled={busy}
                className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {busy ? "Creating…" : "Create board"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
