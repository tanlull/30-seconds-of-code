import type { FormatId } from "./formats";
import type { TemplatePost } from "./templates";

export type GeneratedBoard = {
  title: string;
  format: FormatId;
  wallpaper: string;
  sections?: string[];
  posts: TemplatePost[];
};

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
