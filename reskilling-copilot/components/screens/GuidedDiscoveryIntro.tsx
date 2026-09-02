"use client";

import { useState } from "react";
import ScreenShell from "../ScreenShell";

const OPTIONS = ["Remote only", "Hybrid", "On-site is fine", "No preference"] as const;

export default function GuidedDiscoveryIntro({
  onSubmit,
  onBack,
}: {
  onSubmit: (remotePreference: string) => void;
  onBack?: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ScreenShell
      title="One quick question"
      subtitle="Just this one constraint before we show you roles — everything else you tell us by swiping."
      onBack={onBack}
    >
      <div className="space-y-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => setSelected(option)}
            className={`w-full rounded-full border-2 px-5 py-3.5 text-left text-sm font-bold transition ${
              selected === option
                ? "border-primary bg-primary text-white"
                : "border-primary-pale bg-primary-pale/30 text-ink hover:bg-primary-pale/60"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        onClick={() => selected && onSubmit(selected)}
        disabled={!selected}
        className="mt-6 w-full rounded-full bg-primary px-4 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        Show me roles
      </button>
    </ScreenShell>
  );
}
