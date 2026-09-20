import type { FormatId } from "./formats";

export type TemplatePost = {
  subject?: string;
  body?: string;
  color?: string;
  imageUrl?: string;
  linkUrl?: string;
  x?: number;
  y?: number;
  lat?: number;
  lng?: number;
  section?: string; // section title for columns
};

export type Template = {
  id: string;
  name: string;
  category: "Education" | "Business" | "General";
  emoji: string;
  description: string;
  format: FormatId;
  wallpaper: string;
  sections?: string[];
  posts: TemplatePost[];
};

export const TEMPLATES: Template[] = [
  {
    id: "blank-wall",
    name: "Blank Wall",
    category: "General",
    emoji: "🧱",
    description: "Start from scratch with a free-for-all wall.",
    format: "wall",
    wallpaper: "aurora",
    posts: []
  },
  {
    id: "brainstorm",
    name: "Brainstorm Board",
    category: "General",
    emoji: "💡",
    description: "Collect ideas quickly on a colorful wall.",
    format: "wall",
    wallpaper: "bubblegum",
    posts: [
      { subject: "Idea", body: "What problem are we solving?", color: "#ffec99" },
      { subject: "Idea", body: "Who is it for?", color: "#d0ebff" },
      { subject: "Idea", body: "What's the wildest version?", color: "#e5dbff" }
    ]
  },
  {
    id: "kanban",
    name: "Project Board",
    category: "Business",
    emoji: "🗂️",
    description: "Track work across To do, Doing and Done.",
    format: "columns",
    wallpaper: "sand",
    sections: ["To do", "Doing", "Done"],
    posts: [
      { subject: "Kickoff", body: "Define project scope", section: "To do", color: "#ffd8a8" },
      { subject: "Design", body: "Draft wireframes", section: "Doing", color: "#d0ebff" },
      { subject: "Setup", body: "Repo created", section: "Done", color: "#d3f9d8" }
    ]
  },
  {
    id: "lesson-plan",
    name: "Lesson Plan",
    category: "Education",
    emoji: "📚",
    description: "Plan a class across learning stages.",
    format: "columns",
    wallpaper: "mint",
    sections: ["Objectives", "Activities", "Assessment", "Homework"],
    posts: [
      { subject: "Goal", body: "Students can explain photosynthesis", section: "Objectives", color: "#d3f9d8" },
      { subject: "Warm-up", body: "Group discussion (10 min)", section: "Activities", color: "#ffec99" },
      { subject: "Quiz", body: "5-question exit ticket", section: "Assessment", color: "#ffe3e3" }
    ]
  },
  {
    id: "gallery",
    name: "Photo Gallery",
    category: "General",
    emoji: "🖼️",
    description: "Show off images in a tidy grid.",
    format: "grid",
    wallpaper: "ocean",
    posts: [
      { subject: "Mountains", imageUrl: "https://picsum.photos/seed/mountain/600/400" },
      { subject: "Beach", imageUrl: "https://picsum.photos/seed/beach/600/400" },
      { subject: "Forest", imageUrl: "https://picsum.photos/seed/forest/600/400" }
    ]
  },
  {
    id: "reading-list",
    name: "Reading List",
    category: "Education",
    emoji: "📖",
    description: "A structured table of books to read.",
    format: "table",
    wallpaper: "sand",
    posts: [
      { subject: "The Pragmatic Programmer", body: "Software craftsmanship", linkUrl: "https://example.com" },
      { subject: "Sapiens", body: "History of humankind" }
    ]
  },
  {
    id: "mind-map",
    name: "Mind Map",
    category: "General",
    emoji: "🧠",
    description: "Freeform canvas for connected ideas.",
    format: "freeform",
    wallpaper: "grape",
    posts: [
      { subject: "Core idea", body: "Central topic", x: 320, y: 60, color: "#ffec99" },
      { subject: "Branch A", body: "Supporting point", x: 120, y: 220, color: "#d0ebff" },
      { subject: "Branch B", body: "Another point", x: 520, y: 220, color: "#d3f9d8" }
    ]
  },
  {
    id: "history-timeline",
    name: "History Timeline",
    category: "Education",
    emoji: "🕒",
    description: "Key events laid out over time.",
    format: "timeline",
    wallpaper: "sunset",
    posts: [
      { subject: "1969", body: "Moon landing", color: "#ffe3e3" },
      { subject: "1989", body: "World Wide Web proposed", color: "#d0ebff" },
      { subject: "2007", body: "First iPhone", color: "#e5dbff" }
    ]
  },
  {
    id: "announcements",
    name: "Announcements",
    category: "Business",
    emoji: "📰",
    description: "A vertical stream of updates.",
    format: "stream",
    wallpaper: "night",
    posts: [
      { subject: "Welcome!", body: "This is our team stream. Post updates here." }
    ]
  },
  {
    id: "trip-map",
    name: "Travel Map",
    category: "General",
    emoji: "🗺️",
    description: "Pin memories and places on a map.",
    format: "map",
    wallpaper: "ocean",
    posts: [
      { subject: "Bangkok", body: "Street food heaven", lat: 13.7563, lng: 100.5018 },
      { subject: "Paris", body: "Eiffel Tower", lat: 48.8584, lng: 2.2945 },
      { subject: "Tokyo", body: "Shibuya crossing", lat: 35.6595, lng: 139.7005 }
    ]
  }
];

export function templateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
