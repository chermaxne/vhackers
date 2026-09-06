"use client";

import { formatSalaryRange, type JobCard as JobCardData } from "@/lib/jobs";

// Sanitizes messy job descriptions into 3-4 clean, bite-sized bullet points
function formatResponsibilities(rawText: string): string[] {
  if (!rawText) return [];

  const cleaned = rawText
    .split(/\n+|•|\*|(?:\d+\.\s+)/)
    .map((line) => line.replace(/^[-–—•*]\s*/, "").trim())
    .filter((line) => line.length > 15 && !line.toLowerCase().startsWith("responsibilities"));

  if (cleaned.length >= 2) {
    return cleaned.slice(0, 4);
  }

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
  accentColor = "#6C72B9",
}: { 
  label: string; 
  items: string[]; 
  tone: "amber" | "primary";
  matchedItems?: string[];
  accentColor?: string;
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
                  ? "border-current bg-slate-100 text-slate-900 ring-2 ring-offset-1"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
              style={isMatched && tone === "primary" ? { borderColor: accentColor, color: accentColor } : undefined}
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

const THEME_VARIANTS = [
  {
    gradient: "from-[#6C72B9] to-[#4F5494]", // Signature Periwinkle / Indigo
    accent: "#6C72B9",
    highlightBg: "bg-[#F4F5FC]",
    badgeBg: "bg-white/20",
  },
  {
    gradient: "from-[#10B981] to-[#047857]", // Emerald
    accent: "#10B981",
    highlightBg: "bg-emerald-50",
    badgeBg: "bg-white/20",
  },
  {
    gradient: "from-[#F59E0B] to-[#D97706]", // Amber
    accent: "#D97706",
    highlightBg: "bg-amber-50",
    badgeBg: "bg-white/20",
  },
  {
    gradient: "from-[#0EA5E9] to-[#0284C7]", // Sky Blue
    accent: "#0284C7",
    highlightBg: "bg-sky-50",
    badgeBg: "bg-white/20",
  },
  {
    gradient: "from-[#8B5CF6] to-[#6D28D9]", // Purple
    accent: "#7C3AED",
    highlightBg: "bg-purple-50",
    badgeBg: "bg-white/20",
  },
];

export default function JobCard({ 
  job, 
  matchedSkills,
  themeIndex = 0,
}: { 
  job: JobCardData; 
  matchedSkills?: {
    matchedTransferableSkills: string[];
    matchedSkillsRequired: string[];
  };
  themeIndex?: number;
}) {
  const responsibilities = formatResponsibilities(job.dayToDay);
  const matchedCount = matchedSkills?.matchedSkillsRequired.length ?? 0;
  const totalRequired = job.skillsRequired?.length ?? 0;

  // Cycle through the theme variants dynamically
  const theme = THEME_VARIANTS[Math.abs(themeIndex) % THEME_VARIANTS.length];

  return (
    <div className="flex h-full w-full select-none flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xl">
      {/* Alternating Header Banner */}
      <div className={`shrink-0 bg-gradient-to-br ${theme.gradient} p-5 text-white transition-colors duration-300`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight" title={job.title}>
              {job.title}
            </h2>
            <p className="mt-0.5 line-clamp-1 text-xs font-medium text-white/80" title={job.company}>
              {job.company}
            </p>
          </div>
          <span className={`shrink-0 rounded-full ${theme.badgeBg} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm`}>
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
          <div className={`flex items-center justify-between rounded-xl border border-slate-100 ${theme.highlightBg} px-3.5 py-2`}>
            <span className="text-xs font-semibold text-slate-700">Profile Overlap:</span>
            <span className="text-xs font-bold" style={{ color: theme.accent }}>
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
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: theme.accent }} />
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
          accentColor={theme.accent}
        />

        {/* Core Skills Required */}
        <TagList 
          label="Target Technical Competencies" 
          items={job.skillsRequired} 
          tone="primary" 
          matchedItems={matchedSkills?.matchedSkillsRequired}
          accentColor={theme.accent}
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
              className="inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4 hover:opacity-80"
              style={{ color: theme.accent }}
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