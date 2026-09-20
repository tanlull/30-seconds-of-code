"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/clientApi";

const EXAMPLES = [
  "A travel map of my trip to Tokyo, Paris and Bangkok",
  "A project plan for launching a podcast",
  "A history timeline of space exploration",
  "Brainstorm ideas for a birthday party"
];

export default function AiCreate({ canCreate }: { canCreate: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function generate() {
    if (prompt.trim().length < 3) {
      setErr("Describe what you want to create.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const { slug } = await api<{ slug: string }>("/api/ai/generate", "POST", { prompt });
      router.push(`/board/${slug}`);
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => (canCreate ? setOpen(true) : setErr("Sign in first (top right) to use AI."))}
        className="rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-600 shadow-sm hover:bg-brand-50"
      >
        ✨ Create with AI
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 font-display text-xl font-bold text-gray-800">✨ Create with AI</h2>
            <p className="mb-3 text-sm text-gray-500">
              Describe what you want. Boardly picks a format and fills in starter posts.
            </p>
            <textarea
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. A project plan for launching a podcast"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                >
                  {ex}
                </button>
              ))}
            </div>
            {err && <p className="mt-3 text-sm text-brand-600">{err}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={generate}
                disabled={busy}
                className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {busy ? "Generating…" : "Generate board"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
