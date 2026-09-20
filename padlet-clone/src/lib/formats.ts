export type FormatId =
  | "wall"
  | "columns"
  | "grid"
  | "table"
  | "freeform"
  | "rows"
  | "timeline"
  | "stream"
  | "map";

export type FormatMeta = {
  id: FormatId;
  name: string;
  icon: string;
  blurb: string;
  hasSections: boolean;
};

export const FORMATS: FormatMeta[] = [
  { id: "wall", name: "Wall", icon: "🧱", blurb: "Pack posts in a brick-like masonry layout.", hasSections: false },
  { id: "columns", name: "Columns", icon: "🗂️", blurb: "Organize posts into stacked sections.", hasSections: true },
  { id: "grid", name: "Grid", icon: "🔲", blurb: "Arrange posts in neat equal rows.", hasSections: false },
  { id: "table", name: "Table", icon: "📊", blurb: "A row per post, fields as columns.", hasSections: false },
  { id: "freeform", name: "Freeform", icon: "🎨", blurb: "Drag posts anywhere and connect them.", hasSections: false },
  { id: "rows", name: "Rows", icon: "📃", blurb: "Stack posts on top of one another.", hasSections: false },
  { id: "timeline", name: "Timeline", icon: "🕒", blurb: "Lay content out in chronological order.", hasSections: false },
  { id: "stream", name: "Stream", icon: "📰", blurb: "A vertical feed of full-width posts.", hasSections: false },
  { id: "map", name: "Map", icon: "🗺️", blurb: "Pin posts to locations on a map.", hasSections: false }
];

export function formatMeta(id: string): FormatMeta {
  return FORMATS.find((f) => f.id === id) ?? FORMATS[0];
}

export const REACTIONS: Record<string, { label: string; icon: string }> = {
  like: { label: "Like", icon: "❤️" },
  vote: { label: "Vote", icon: "👍" },
  star: { label: "Star", icon: "⭐" },
  grade: { label: "Grade", icon: "💯" }
};

export const POST_COLORS = [
  "#ffffff",
  "#ffe3e3",
  "#ffec99",
  "#d3f9d8",
  "#d0ebff",
  "#e5dbff",
  "#ffd8a8",
  "#f1f3f5"
];
