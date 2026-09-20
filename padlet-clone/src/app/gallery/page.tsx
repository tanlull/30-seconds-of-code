import TopBar from "@/components/TopBar";
import GalleryClient from "@/components/GalleryClient";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Gallery() {
  const user = await getSessionUser();
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-extrabold text-gray-900">Template gallery</h1>
          <p className="mt-1 text-gray-500">
            Pick a ready-made recipe to jump-start your board. Filter by who it's for.
          </p>
        </div>
        <GalleryClient canCreate={!!user} />
      </main>
    </div>
  );
}
