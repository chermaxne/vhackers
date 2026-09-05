import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lattice — Reskilling Copilot",
    short_name: "Lattice",
    description: "Swipe to explore roles, build a skills roadmap, and see what it unlocks.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f8ff",
    theme_color: "#7684c0",
    icons: [
      {
        src: "/icon.jpg",
        sizes: "1024x1024",
        type: "image/jpeg",
      },
    ],
  };
}
