export type Wallpaper = {
  id: string;
  name: string;
  css: string; // background CSS value
  text: string; // suggested text color for headers over wallpaper
};

export const WALLPAPERS: Wallpaper[] = [
  { id: "aurora", name: "Aurora", css: "linear-gradient(135deg,#f6d5f7 0%,#fbe9d7 100%)", text: "#3b2f3a" },
  { id: "bubblegum", name: "Bubblegum", css: "linear-gradient(135deg,#ffdee9 0%,#b5fffc 100%)", text: "#3a2f36" },
  { id: "sunset", name: "Sunset", css: "linear-gradient(135deg,#ff9a9e 0%,#fecfef 100%)", text: "#3a2f36" },
  { id: "mint", name: "Mint", css: "linear-gradient(135deg,#d4fc79 0%,#96e6a1 100%)", text: "#22331f" },
  { id: "ocean", name: "Ocean", css: "linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 100%)", text: "#1f2d3a" },
  { id: "grape", name: "Grape", css: "linear-gradient(135deg,#c471f5 0%,#fa71cd 100%)", text: "#ffffff" },
  { id: "sand", name: "Sand", css: "linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)", text: "#2a2f3a" },
  { id: "night", name: "Night", css: "linear-gradient(135deg,#232526 0%,#414345 100%)", text: "#f5f5f5" },
  { id: "dots", name: "Confetti", css: "radial-gradient(#ffd6e7 2px, transparent 2px) 0 0/24px 24px, #fff7fb", text: "#3a2f36" }
];

export function wallpaperById(id: string): Wallpaper {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}
