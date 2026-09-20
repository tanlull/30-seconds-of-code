import { FORMATS, type FormatId } from "./formats";
import { WALLPAPERS } from "./wallpapers";
import type { TemplatePost } from "./templates";

export type GeneratedBoard = {
  title: string;
  format: FormatId;
  wallpaper: string;
  sections?: string[];
  posts: TemplatePost[];
};

const VALID_FORMATS = new Set(FORMATS.map((f) => f.id));
const VALID_WALLPAPERS = new Set(WALLPAPERS.map((w) => w.id));

const CITY_COORDS: Record<string, [number, number]> = {
  bangkok: [13.7563, 100.5018],
  tokyo: [35.6762, 139.6503],
  paris: [48.8566, 2.3522],
  london: [51.5074, -0.1278],
  "new york": [40.7128, -74.006],
  "san francisco": [37.7749, -122.4194],
  sydney: [-33.8688, 151.2093],
  rome: [41.9028, 12.4964],
  berlin: [52.52, 13.405],
  singapore: [1.3521, 103.8198],
  dubai: [25.2048, 55.2708],
  "hong kong": [22.3193, 114.1694]
};

const POST_COLORS = ["#ffec99", "#d0ebff", "#d3f9d8", "#e5dbff", "#ffd8a8", "#ffe3e3"];

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanTitle(prompt: string) {
  const t = prompt
    .replace(/^\s*(create|make|generate|build)\s+(me\s+)?(a|an)?\s*(board|padlet)?\s*(about|for|on|of)?\s*/i, "")
    .trim();
  const short = t.split(/[.!?\n]/)[0].slice(0, 60).trim();
  return titleCase(short || "New AI board");
}

function pickFormat(p: string): FormatId {
  if (/\b(trip|travel|map|location|places|countr(y|ies)|cities|city|itinerary|vacation)\b/.test(p)) return "map";
  if (/\b(timeline|history|historical|events?|roadmap|milestones?|schedule|chronolog)/.test(p)) return "timeline";
  if (/\b(plan|kanban|to-?do|tasks?|project|workflow|stages?|sprint|backlog|pipeline)\b/.test(p)) return "columns";
  if (/\b(photos?|gallery|images?|mood-?board|portfolio|inspiration)\b/.test(p)) return "grid";
  if (/\b(table|inventory|tracker|compare|comparison|rubric|catalog|spreadsheet)\b/.test(p)) return "table";
  if (/\b(announce|updates?|feed|blog|stream|news)\b/.test(p)) return "stream";
  return "wall";
}

function pickWallpaper(format: FormatId): string {
  const map: Partial<Record<FormatId, string>> = {
    map: "ocean",
    timeline: "sunset",
    columns: "sand",
    grid: "ocean",
    stream: "night",
    table: "sand"
  };
  return map[format] || "aurora";
}

function keywords(prompt: string): string[] {
  const stop = new Set([
    "the", "a", "an", "for", "of", "to", "and", "or", "with", "about", "board",
    "padlet", "create", "make", "my", "our", "on", "in", "into", "some", "ideas"
  ]);
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s,]/g, " ")
    .split(/[\s,]+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  return Array.from(new Set(words)).slice(0, 8);
}

/**
 * Turn a natural-language prompt into a board spec.
 * Offline heuristic generator — deterministic and dependency-free.
 * (Plug a real LLM into generateBoard() by setting the LLM path there.)
 */
export function generateBoardSpec(prompt: string): GeneratedBoard {
  const p = prompt.toLowerCase();
  const format = pickFormat(p);
  const title = cleanTitle(prompt);
  const wallpaper = pickWallpaper(format);
  const kw = keywords(prompt);
  const topic = kw[0] ? titleCase(kw[0]) : title;

  const color = (i: number) => POST_COLORS[i % POST_COLORS.length];

  if (format === "columns") {
    const sections = ["To do", "Doing", "Done"];
    const seeds = [
      { section: "To do", subject: "Define goals", body: `Clarify what "${title}" should achieve.` },
      { section: "To do", subject: "Research", body: `Gather info about ${topic}.` },
      { section: "Doing", subject: "First draft", body: `Start working on ${topic}.` },
      { section: "Done", subject: "Kickoff", body: "Project created 🎉" }
    ];
    return { title, format, wallpaper, sections, posts: seeds.map((s, i) => ({ ...s, color: color(i) })) };
  }

  if (format === "map") {
    const found = Object.keys(CITY_COORDS).filter((c) => p.includes(c));
    const chosen = (found.length ? found : ["bangkok", "tokyo", "paris"]).slice(0, 5);
    return {
      title,
      format,
      wallpaper,
      posts: chosen.map((c, i) => ({
        subject: titleCase(c),
        body: `A place for "${title}".`,
        lat: CITY_COORDS[c][0],
        lng: CITY_COORDS[c][1],
        color: color(i)
      }))
    };
  }

  if (format === "timeline") {
    const steps = ["Phase 1", "Phase 2", "Phase 3", "Phase 4"];
    return {
      title,
      format,
      wallpaper,
      posts: steps.map((s, i) => ({ subject: s, body: `${topic}: milestone ${i + 1}.`, color: color(i) }))
    };
  }

  // wall / grid / table / stream / rows
  const prompts = [
    { subject: `What is ${topic}?`, body: "Add the key definition or goal here." },
    { subject: "Key idea", body: `An important point about ${topic}.` },
    { subject: "Example", body: `A concrete example related to ${topic}.` },
    { subject: "Resource", body: "Drop a helpful link or note here." },
    { subject: "Question", body: `What do we still need to learn about ${topic}?` }
  ];
  const extra = kw.slice(1, 4).map((k) => ({ subject: titleCase(k), body: `Notes on ${titleCase(k)}.` }));
  const posts = [...prompts, ...extra].map((s, i) => ({ ...s, color: color(i) }));

  return { title, format, wallpaper, posts };
}

// --------------------------------------------------------------------------
// Real LLM path (OpenAI-compatible Chat Completions API)
// --------------------------------------------------------------------------

export type AiSource = "llm" | "offline";

function llmConfig() {
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "";
  const baseUrl = (process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/+$/,
    ""
  );
  const model = process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
  return { apiKey, baseUrl, model, enabled: !!apiKey };
}

export function isLlmEnabled(): boolean {
  return llmConfig().enabled;
}

const SYSTEM_PROMPT = `You design collaborative "board" specs for a Padlet-style app.
Return ONLY a JSON object (no prose) with this exact shape:
{
  "title": string,                       // short board title
  "format": one of ["wall","columns","grid","table","freeform","rows","timeline","stream","map"],
  "wallpaper": one of ["aurora","bubblegum","sunset","mint","ocean","grape","sand","night","dots"],
  "sections": string[],                  // ONLY for "columns" format, else []
  "posts": [                             // 3-10 starter posts
    {
      "subject": string,
      "body": string,
      "color": optional hex like "#ffec99",
      "section": optional section title (must match one in sections, columns only),
      "lat": optional number (ONLY for map),
      "lng": optional number (ONLY for map)
    }
  ]
}
Choose the format that best fits the request (map for places/trips, columns for plans/tasks,
timeline for chronology, grid for galleries, table for structured lists, else wall).
For "map" posts you MUST include real lat/lng for each place.`;

function sanitizeSpec(raw: any, prompt: string): GeneratedBoard {
  const fallback = generateBoardSpec(prompt);
  if (!raw || typeof raw !== "object") return fallback;

  const format: FormatId = VALID_FORMATS.has(raw.format) ? raw.format : fallback.format;
  const wallpaper = VALID_WALLPAPERS.has(raw.wallpaper) ? raw.wallpaper : fallback.wallpaper;
  const title =
    typeof raw.title === "string" && raw.title.trim() ? raw.title.trim().slice(0, 80) : fallback.title;

  const sections =
    format === "columns" && Array.isArray(raw.sections)
      ? raw.sections.filter((s: any) => typeof s === "string").slice(0, 6).map((s: string) => s.slice(0, 60))
      : undefined;
  const sectionSet = new Set(sections || []);

  const rawPosts = Array.isArray(raw.posts) ? raw.posts.slice(0, 12) : [];
  const posts: TemplatePost[] = rawPosts.map((p: any): TemplatePost => {
    const post: TemplatePost = {
      subject: typeof p?.subject === "string" ? p.subject.slice(0, 120) : "",
      body: typeof p?.body === "string" ? p.body.slice(0, 2000) : ""
    };
    if (typeof p?.color === "string" && /^#[0-9a-fA-F]{6}$/.test(p.color)) post.color = p.color;
    if (typeof p?.linkUrl === "string") post.linkUrl = p.linkUrl.slice(0, 500);
    if (typeof p?.imageUrl === "string") post.imageUrl = p.imageUrl.slice(0, 500);
    if (sections && typeof p?.section === "string" && sectionSet.has(p.section)) post.section = p.section;
    if (format === "map" && typeof p?.lat === "number" && typeof p?.lng === "number") {
      post.lat = p.lat;
      post.lng = p.lng;
    }
    return post;
  });

  if (posts.length === 0) return fallback;
  return { title, format, wallpaper, sections, posts };
}

async function callLLM(prompt: string): Promise<GeneratedBoard | null> {
  const { apiKey, baseUrl, model } = llmConfig();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ]
      }),
      signal: controller.signal
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    return sanitizeSpec(parsed, prompt);
  } catch {
    return null; // network/parse/timeout -> caller falls back to offline
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Unified entrypoint: use the configured OpenAI-compatible LLM when available,
 * otherwise fall back to the offline heuristic generator.
 */
export async function generateBoard(prompt: string): Promise<{ spec: GeneratedBoard; source: AiSource }> {
  if (isLlmEnabled()) {
    const spec = await callLLM(prompt);
    if (spec) return { spec, source: "llm" };
  }
  return { spec: generateBoardSpec(prompt), source: "offline" };
}
