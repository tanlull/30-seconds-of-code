import { NextRequest } from "next/server";
import { subscribe } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const encoder = new TextEncoder();
  const slug = params.slug;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string) => {
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      };
      // Initial hello + retry hint
      controller.enqueue(encoder.encode("retry: 3000\n\n"));
      send("connected");

      const unsubscribe = subscribe(slug, send);

      // Heartbeat keeps the connection alive through proxies.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          /* closed */
        }
      }, 25000);

      const close = () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      req.signal.addEventListener("abort", close);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
