"use client";

export default function PrintRoadmapButton() {
  return (
    <button
      onClick={() => window.print()}
      className="shrink-0 rounded-full border-2 border-primary-pale bg-white px-3 py-2 text-xs font-bold text-primary-dark transition hover:bg-primary-pale/40"
    >
      Print / Save as PDF
    </button>
  );
}
