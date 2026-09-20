"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/clientApi";

export default function SignIn({
  user
}: {
  user: { id: string; name: string; color: string } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api("/api/auth", "POST", { name });
      setOpen(false);
      setName("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await api("/api/auth", "DELETE");
    router.refresh();
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: user.color }}
          title={user.name}
        >
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden text-sm font-medium text-gray-700 sm:inline">{user.name}</span>
        <button
          onClick={signOut}
          className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
      >
        Sign in
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          <p className="mb-2 text-sm font-semibold text-gray-800">What should we call you?</p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Your display name"
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <button
            onClick={submit}
            disabled={busy}
            className="w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? "…" : "Continue"}
          </button>
          <p className="mt-2 text-xs text-gray-400">No password needed — this is a demo sign-in.</p>
        </div>
      )}
    </div>
  );
}
