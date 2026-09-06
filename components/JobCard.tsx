"use client";

import { formatSalaryRange, type JobCard as JobCardData } from "@/lib/jobs";

// Sanitizes messy job descriptions into 3-4 clean, bite-sized bullet points
function formatResponsibilities(rawText: string): string[] {
  if (!rawText) return [];

  // Split by common bullet points, newlines, or numbered lists
  const cleaned = rawText
    .split(/\n+|•|\*|(?:\d+\.\s+)/)
    .map((line) => line.replace(/^[-–—•*]\s*/, "").trim())
    .filter((line) => line.length > 15 && !line.toLowerCase().startsWith("responsibilities"));

  if (cleaned.length >= 2) {
    return cleaned.slice(0, 4);
  }

  // Fallback: split by sentences if raw text was a continuous paragraph block
  return rawText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 3);
}

function TagList({ 
  label, 
  items, 
  tone,
  matchedItems,
}: { 
  label: string; 
  items: string[]; 
  tone: "amber" | "primary";
  matchedItems?: string[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <span className="text-[10px] text-slate-400">{items.length} skills</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const isMatched = matchedItems && matchedItems.includes(item);

          return (
            <span 
              key={item} 
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold transition ${
                tone === "amber"
                  ? isMatched
                    ? "border-amber-400 bg-amber-100/90 text-amber-950 ring-2 ring-amber-300 ring-offset-1"
                    : "border-amber-200/80 bg-amber-50/70 text-amber-900"
                  : isMatched
                  ? "border-[#6C72B9] bg-[#6C72B9]/20 text-[#4c518b] ring-2 ring-[#6C72B9]/30 ring-offset-1"
                  : "border-indigo-100 bg-indigo-50/60 text-slate-700"
              }`}
            >
              {isMatched && <span className="text-[11px] font-bold">✓</span>}
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function JobCard({ 
  job, 
  matchedSkills,
}: { 
  job: JobCardData; 
  matchedSkills?: {
    matchedTransferableSkills: string[];
    matchedSkillsRequired: string[];
  };
}) {
  const responsibilities = formatResponsibilities(job.dayToDay);
  const matchedCount = matchedSkills?.matchedSkillsRequired.length ?? 0;
  const totalRequired = job.skillsRequired?.length ?? 0;

  return (
    <div className="flex h-full w-full select-none flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xl">
      {/* Header Banner */}
      <div className="shrink-0 bg-gradient-to-br from-[#6C72B9] to-[#515797] p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight" title={job.title}>
              {job.title}
            </h2>
            <p className="mt-0.5 line-clamp-1 text-xs font-medium text-white/80" title={job.company}>
              {job.company}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            Live Role
          </span>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          <span>💰</span>
          <span>{formatSalaryRange(job)}</span>
        </div>
      </div>

      {/* Scrollable Structured Content */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 text-slate-700">
        {/* Profile Overlap Signal */}
        {totalRequired > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-[#F4F6FC] px-3.5 py-2">
            <span className="text-xs font-semibold text-slate-700">Profile Overlap:</span>
            <span className="text-xs font-bold text-[#6C72B9]">
              {matchedCount} of {totalRequired} skills matched
            </span>
          </div>
        )}

        {/* Structured Responsibilities */}
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Key Responsibilities
          </p>
          {responsibilities.length > 0 ? (
            <ul className="space-y-1.5">
              {responsibilities.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6C72B9]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">Refer to the original posting for detailed duties.</p>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Transferable Skills */}
        <TagList 
          label="Your Transferable Strengths" 
          items={job.transferableSkills} 
          tone="amber"
          matchedItems={matchedSkills?.matchedTransferableSkills}
        />

        {/* Core Skills Required */}
        <TagList 
          label="Target Technical Competencies" 
          items={job.skillsRequired} 
          tone="primary" 
          matchedItems={matchedSkills?.matchedSkillsRequired}
        />

        {/* Career Progression Pathway */}
        {job.careerProgression && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Career Trajectory</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">{job.careerProgression}</p>
          </div>
        )}

        {/* External Link */}
        {job.jobUrl && (
          <div className="pt-1 text-center">
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C72B9] underline underline-offset-4 hover:text-[#555ba3]"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <span>View verified listing on MyCareersFuture</span>
              <span>↗</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}