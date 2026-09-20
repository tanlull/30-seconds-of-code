// Simple in-process pub/sub for real-time board updates over SSE.
// Works for a single Node instance (dev / next start), which is our target.

type Subscriber = (event: string) => void;

const channels = new Map<string, Set<Subscriber>>();

const globalForEvents = globalThis as unknown as { __boardChannels?: typeof channels };
const store = globalForEvents.__boardChannels ?? channels;
if (!globalForEvents.__boardChannels) globalForEvents.__boardChannels = store;

export function subscribe(slug: string, fn: Subscriber): () => void {
  let set = store.get(slug);
  if (!set) {
    set = new Set();
    store.set(slug, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) store.delete(slug);
  };
}

/** Notify all subscribers of a board that its contents changed. */
export function publish(slug: string, reason = "update") {
  const set = store.get(slug);
  if (!set) return;
  for (const fn of set) {
    try {
      fn(reason);
    } catch {
      /* ignore individual subscriber errors */
    }
  }
}

export function subscriberCount(slug: string): number {
  return store.get(slug)?.size ?? 0;
}
