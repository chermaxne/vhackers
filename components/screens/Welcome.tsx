"use client";

import Image from "next/image";
import { IconList, IconStackedCards, IconUploadDocument } from "../icons/LatticeIcons";

const VALUE_PROPS = [
  { icon: IconStackedCards, text: "Swipe through real roles, matched to your skills" },
  { icon: IconList, text: "See exactly which skills stand between you and them" },
  { icon: IconUploadDocument, text: "Get a roadmap, courses, and a tailored resume" },
];

export default function Welcome({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-primary-pale bg-surface px-6 pb-10 pt-5 text-center shadow-[0_20px_45px_-25px_rgba(91,101,168,0.45)]">
      {/* Enlarged Logo Graphic */}
      <div className="relative flex justify-center">
        <Image
          src="/lattice-logo.png"
          alt="Lattice Logo"
          width={180}
          height={180}
          className="h-36 w-36 object-contain"
          priority
        />
      </div>

      {/* Dark Slate-Blue Wordmark */}
      <h1 className="-mt-2 font-sans text-3xl font-black tracking-[0.2em] text-[#4B5296] pl-[0.2em]">
        LATTICE
      </h1>

      {/* Subtitle */}
      <p className="mt-2 max-w-xs text-xs font-medium leading-relaxed text-ink-muted">
        Your path from where you are to where you want to be — built from real job data, not generic advice.
      </p>

      {/* Feature Value Cards */}
      <div className="mt-7 w-full space-y-3 text-left">
        {VALUE_PROPS.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-3 rounded-2xl bg-primary-pale/40 px-4 py-3 transition hover:bg-primary-pale/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-ink">{text}</p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={onGetStarted}
        className="mt-7 w-full rounded-full bg-[#6C72B9] px-4 py-3.5 font-display text-sm font-bold text-white shadow-md shadow-[#6C72B9]/20 transition hover:bg-[#5b61a3] active:scale-[0.99]"
      >
        Get started
      </button>

      <p className="mt-3 text-xs text-ink-muted">Takes about 2 minutes — resume optional.</p>
    </div>
  );
}