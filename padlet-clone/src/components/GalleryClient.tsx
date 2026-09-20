"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/clientApi";
import { TEMPLATES } from "@/lib/templates";
import { wallpaperById } from "@/lib/wallpapers";
import { formatMeta } from "@/lib/formats";

const CATEGORIES = ["All", "General", "Education", "Business"] as const;

export default function GalleryClient({ canCreate }: { canCreate: boolean }) {
  const router = useRouter();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const list = TEMPLATES.filter((t) => cat === "All" || t.category === cat);

  async function use(id: string) {
    if (!canCreate) {
      setErr("Sign in first (top right) to use a template.");
      return;
    }
    setBusy(id);
    setErr("");
    try {
      const { slug } = await api<{ slug: string }>("/api/boards", "POST", { templateId: id });
      router.push(`/board/${slug}`);
    } catch (e: any) {
      setErr(e.message);
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              cat === c ? "bg-brand-500 text-white" : "bg-white text-gray-600 hover:bg-brand-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {err && <p className="mb-4 text-sm text-brand-600">{err}</p>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => {
          const wp = wallpaperById(t.wallpaper);
          const fm = formatMeta(t.format);
          return (
            <div key={t.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="relative flex h-28 items-center justify-center" style={{ background: wp.css }}>
                <span className="text-5xl drop-shadow">{t.emoji}</span>
                <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2 py-1 text-xs font-semibold text-gray-600">
                  {fm.icon} {fm.name}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{t.name}</h3>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{t.category}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{t.description}</p>
                <button
                  onClick={() => use(t.id)}
                  disabled={busy === t.id}
                  className="mt-3 w-full rounded-full bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  {busy === t.id ? "Creating…" : "Use template"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
