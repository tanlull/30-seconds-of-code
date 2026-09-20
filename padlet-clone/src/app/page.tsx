import Link from "next/link";
import TopBar from "@/components/TopBar";
import { FORMATS } from "@/lib/formats";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <TopBar />
      <main className="mx-auto max-w-6xl px-4">
        <section className="grid items-center gap-8 py-16 md:grid-cols-2">
          <div>
            <h1 className="font-display text-5xl font-extrabold leading-tight text-gray-900">
              Visual collaboration for <span className="text-brand-600">creative work</span> and
              learning
            </h1>
            <p className="mt-5 text-lg text-gray-600">
              Boardly is a digital canvas where your ideas come together. Make a wall, a timeline, a
              map or a mind-map — then post, react and collaborate in real time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-brand-600"
              >
                Make a board — it's free
              </Link>
              <Link
                href="/gallery"
                className="rounded-full border border-brand-200 bg-white px-6 py-3 text-base font-semibold text-brand-600 hover:bg-brand-50"
              >
                Browse templates
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-400">Loved by makers, teams and classrooms.</p>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              {["#ffec99", "#d0ebff", "#e5dbff", "#d3f9d8"].map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white p-4 shadow-post"
                  style={{ transform: `rotate(${(i % 2 ? 1 : -1) * (2 + i)}deg)` }}
                >
                  <div className="mb-2 h-2 w-10 rounded-full" style={{ background: c }} />
                  <div className="mb-1 h-3 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                  <div className="mt-3 h-16 rounded-lg" style={{ background: c }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-gray-800">
            Nine ways to lay out your ideas
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3">
            {FORMATS.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-post"
              >
                <div className="text-3xl">{f.icon}</div>
                <div className="mt-2 font-semibold text-gray-800">{f.name}</div>
                <div className="mt-1 text-sm text-gray-500">{f.blurb}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        Boardly — a Padlet-style visual collaboration demo. Built with Next.js.
      </footer>
    </div>
  );
}
