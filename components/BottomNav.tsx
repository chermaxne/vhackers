"use client";

import { IconProfile, IconStackedCards } from "./icons/LatticeIcons";

export type AppTab = "journey" | "profile";

export default function BottomNav({ active, onChange }: { active: AppTab; onChange: (tab: AppTab) => void }) {
  return (
    <nav className="sticky bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 mx-auto flex w-fit gap-2 rounded-full border border-primary-pale bg-surface p-1.5 shadow-[0_12px_30px_-16px_rgba(91,101,168,0.5)]">
      <button
        type="button"
        aria-label="Journey"
        onClick={() => onChange("journey")}
        className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
          active === "journey" ? "bg-primary-dark text-white" : "bg-background text-primary"
        }`}
      >
        <IconStackedCards className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Profile"
        onClick={() => onChange("profile")}
        className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
          active === "profile" ? "bg-primary-dark text-white" : "bg-background text-primary"
        }`}
      >
        <IconProfile className="h-5 w-5" />
      </button>
    </nav>
  );
}
