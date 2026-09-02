import { formatSalaryRange, type JobCard as JobCardData } from "@/lib/jobs";

function TagList({ label, items, tone }: { label: string; items: string[]; tone: "amber" | "primary" }) {
  if (items.length === 0) return null;
  const chip =
    tone === "amber"
      ? "bg-accent-amber-pale text-amber-900 border-accent-amber/40"
      : "bg-primary-pale text-primary-dark border-primary-light";
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${chip}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function JobCard({ job }: { job: JobCardData }) {
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
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">Day to day</p>
          <p className="text-sm leading-relaxed text-ink">{job.dayToDay}</p>
        </div>

        <TagList label="Transferable skills" items={job.transferableSkills} tone="amber" />
        <TagList label="Skills required" items={job.skillsRequired} tone="primary" />

        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">Career progression</p>
          <p className="text-sm leading-relaxed text-ink">{job.careerProgression}</p>
        </div>
      </div>
    </div>
  );
}
