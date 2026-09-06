import { headers } from "next/headers";
import { decodeRoadmapExport } from "@/lib/roadmapExport";
import PrintRoadmapButton from "@/components/PrintRoadmapButton";

const BAND_STYLES: Record<string, string> = {
  strong: "bg-accent-green-pale text-green-900",
  building: "bg-accent-olive-pale text-ink",
  early: "bg-accent-coral-pale text-red-900",
};

/**
 * Shareable, read-only roadmap view — no database. The whole payload travels
 * base64-encoded in the `data` query param (see lib/roadmapExport.ts), so
 * this link works for anyone who opens it, on any device, with zero backend.
 * "Export to PDF" is the browser's own Print dialog (see print: variants
 * below) rather than a generated-PDF pipeline.
 */
export default async function RoadmapViewPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data } = await searchParams;
  const payload = data ? decodeRoadmapExport(data) : null;

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <p className="text-sm text-ink-muted">This roadmap link looks broken or incomplete.</p>
      </div>
    );
  }

  const bandClass = payload.candidacy ? (BAND_STYLES[payload.candidacy.band] ?? "bg-primary-pale text-primary-dark") : "";

  const headersList = await headers();
  const host = headersList.get("host");
  const origin = host ? `${host.startsWith("localhost") ? "http" : "https"}://${host}` : "";
  const shareUrl = data && origin ? `${origin}/roadmap/view?data=${data}` : undefined;
  const linkedInShareUrl = shareUrl
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    : undefined;

  return (
    <div className="min-h-screen bg-background px-4 py-10 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-primary-pale bg-surface p-8 shadow-[0_20px_45px_-25px_rgba(91,101,168,0.45)] print:border-0 print:shadow-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xs font-extrabold uppercase tracking-wide text-primary">Lattice roadmap</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">Toward: {payload.targetRole}</h1>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <PrintRoadmapButton />
          </div>
        </div>

        {payload.candidacy && (
          <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${bandClass}`}>
            <span>{payload.candidacy.score}/100</span>
            <span>·</span>
            <span>{payload.candidacy.bandLabel}</span>
          </div>
        )}

        <p className="mt-4 text-sm leading-relaxed text-ink">{payload.introCopy}</p>

        {payload.skillGapList.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Skill gaps</p>
            <div className="flex flex-wrap gap-1.5">
              {payload.skillGapList.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-primary-light bg-primary-pale px-2.5 py-1 text-xs font-semibold text-primary-dark"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {payload.roadmapSteps.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Roadmap</p>
            <ul className="space-y-1.5">
              {payload.roadmapSteps.map((step) => (
                <li
                  key={step.skill}
                  className="flex items-center justify-between gap-3 rounded-2xl border-2 border-primary-pale px-3.5 py-2.5 text-sm"
                >
                  <span className="font-semibold text-ink">{step.skill}</span>
                  <a
                    href={step.courseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-semibold text-primary-dark underline print:text-ink"
                  >
                    Find a course ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {linkedInShareUrl && (
          <a
            href={linkedInShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block w-full rounded-full bg-[#0A66C2] px-4 py-3 text-center font-display text-sm font-bold text-white transition hover:brightness-95 print:hidden"
          >
            Share to LinkedIn
          </a>
        )}

        <p className="mt-8 text-center text-[11px] text-ink-muted print:hidden">
          Shared from Lattice — a personalized reskilling roadmap.
        </p>
      </div>
    </div>
  );
}
