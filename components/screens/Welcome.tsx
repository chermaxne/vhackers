"use client";

import { IconLatticeMark, IconList, IconStackedCards, IconUploadDocument } from "../icons/LatticeIcons";

const VALUE_PROPS = [
  { icon: IconStackedCards, text: "Swipe through real roles, matched to your skills" },
  { icon: IconList, text: "See exactly which skills stand between you and them" },
  { icon: IconUploadDocument, text: "Get a roadmap, courses, and a tailored resume" },
];

export default function Welcome({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div
      data-watermark="LATTICE"
      className="watermark-bg mx-auto flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-primary-pale bg-surface px-6 py-10 text-center shadow-[0_20px_45px_-25px_rgba(91,101,168,0.45)]"
    >
      <IconLatticeMark className="h-24 w-24" />

      <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink">Lattice</h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
        Your path from where you are to where you want to be — built from real job data, not generic advice.
      </p>

      <div className="mt-8 w-full space-y-3 text-left">
        {VALUE_PROPS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 rounded-2xl bg-primary-pale/40 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-ink">{text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onGetStarted}
        className="mt-8 w-full rounded-full bg-primary px-4 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-dark"
      >
        Get started
      </button>
      <p className="mt-3 text-xs text-ink-muted">Takes about 2 minutes — resume optional.</p>
    </div>
  );
}
