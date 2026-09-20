"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/clientApi";

type Mode = "guest" | "login" | "register";

export default function SignIn({
  user
}: {
  user: { id: string; name: string; color: string } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("guest");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setBusy(true);
    setErr("");
    try {
      const payload =
        mode === "guest"
          ? { mode, name }
          : mode === "login"
          ? { mode, email, password }
          : { mode, name, email, password };
      await api("/api/auth", "POST", payload);
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
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

  const TabBtn = ({ m, label }: { m: Mode; label: string }) => (
    <button
      onClick={() => {
        setMode(m);
        setErr("");
      }}
      className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${
        mode === m ? "bg-brand-500 text-white" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
      >
        Sign in
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex gap-1 rounded-xl bg-gray-50 p-1">
            <TabBtn m="guest" label="Guest" />
            <TabBtn m="login" label="Log in" />
            <TabBtn m="register" label="Sign up" />
          </div>

          {mode !== "login" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          )}
          {mode !== "guest" && (
            <>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                type="password"
                placeholder="Password (min 6 chars)"
                className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </>
          )}

          {err && <p className="mb-2 text-xs text-brand-600">{err}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? "…" : mode === "guest" ? "Continue as guest" : mode === "login" ? "Log in" : "Create account"}
          </button>
          <p className="mt-2 text-xs text-gray-400">
            {mode === "guest"
              ? "Quick demo access — no password."
              : "Passwords are hashed with scrypt and stored locally."}
          </p>
        </div>
      )}
    </div>
  );
}
