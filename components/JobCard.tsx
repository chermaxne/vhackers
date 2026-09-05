import { formatSalaryRange, type JobCard as JobCardData } from "@/lib/jobs";

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
  if (items.length === 0) return null;
  const chip =
    tone === "amber"
      ? "bg-accent-amber-pale text-amber-900 border-accent-amber/40"
      : "bg-primary-pale text-primary-dark border-primary-light";
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const isMatched = matchedItems && matchedItems.includes(item);
          return (
            <span 
              key={item} 
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${chip} ${
                isMatched ? "font-bold ring-2 ring-offset-1" : ""
              } ${isMatched && tone === "amber" ? "ring-accent-amber" : isMatched && tone === "primary" ? "ring-primary" : ""}`}
            >
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
  return (
    <div className="flex h-full w-full select-none flex-col overflow-hidden rounded-[2rem] border border-primary-pale bg-surface shadow-xl">
      <div className="shrink-0 bg-gradient-to-br from-primary to-primary-dark p-5 text-white">
        <h2 className="line-clamp-2 font-display text-xl font-extrabold leading-tight" title={job.title}>
          {job.title}
        </h2>
        <p className="mt-1 line-clamp-1 text-sm text-white/80" title={job.company}>
          {job.company}
        </p>
        <p className="mt-2.5 inline-block rounded-xl bg-white/15 px-3 py-1.5 text-sm font-semibold leading-snug">
          {formatSalaryRange(job)}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
        {matchedSkills && job.skillsRequired.length > 0 && (
          <div className="rounded-xl bg-primary-pale/40 px-3 py-2 text-xs font-bold text-primary-dark">
            vs. your profile: {matchedSkills.matchedSkillsRequired.length} of {job.skillsRequired.length} required skills already yours
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">Day to day</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{job.dayToDay}</p>
        </div>

        <TagList 
          label="Transferable skills" 
          items={job.transferableSkills} 
          tone="amber"
          matchedItems={matchedSkills?.matchedTransferableSkills}
        />
        <TagList label="Skills required" items={job.skillsRequired} tone="primary" />

        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">Role details</p>
          <p className="text-sm leading-relaxed text-ink">{job.careerProgression}</p>
        </div>

        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-bold text-primary underline underline-offset-2"
            onPointerDown={(e) => e.stopPropagation()}
          >
            View original posting on MyCareersFuture ↗
          </a>
        )}
      </div>
    </div>
  );
}
