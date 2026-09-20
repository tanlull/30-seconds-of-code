import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import SignIn from "./SignIn";

export default async function TopBar() {
  const user = await getSessionUser();
  return (
    <header className="pointer-events-none sticky top-0 z-30 border-b border-gray-200 bg-white/90">
      <div className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-brand-600">
            ✦ Boardly
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-gray-600 md:flex">
            <Link href="/dashboard" className="hover:text-brand-600">
              Dashboard
            </Link>
            <Link href="/gallery" className="hover:text-brand-600">
              Templates
            </Link>
          </nav>
        </div>
        <SignIn user={user} />
      </div>
    </header>
  );
}
