import { NextRequest, NextResponse } from "next/server";
import { findIndustry } from "@/lib/industries";
import { searchByCategory, fetchJobDetail, type CategoryPosting, type JobDetail } from "@/lib/mycareersfuture";
import { SAMPLE_JOBS, type JobCard } from "@/lib/jobs";

export interface IndustryRolesRequest {
  industryId: string;
  /** Caller-supplied cap (e.g. splitting a total deck-size target across several selected industries) — falls back to MAX_CARDS. */
  limit?: number;
}

const MIN_LIVE_POSTINGS = 3;
const MAX_CARDS = 10;
const DESCRIPTION_PREVIEW_CHARS = 600;

function toJobCard(posting: CategoryPosting, detail: JobDetail | null): JobCard {
  const facts = [detail?.positionLevel, detail?.employmentType, detail?.minimumYearsExperience != null ? `${detail.minimumYearsExperience}+ yrs experience` : null]
    .filter((f): f is string => Boolean(f))
    .join(" · ");

  const description = detail?.description
    ? detail.description.length > DESCRIPTION_PREVIEW_CHARS
      ? `${detail.description.slice(0, DESCRIPTION_PREVIEW_CHARS).trim()}…`
      : detail.description
    : `${posting.title}${posting.company ? ` at ${posting.company}` : ""} — full description unavailable for this posting.`;

  return {
    uuid: posting.uuid,
    title: posting.title,
    company: posting.company ?? "Company withheld",
    salaryMin: posting.salaryMin,
    salaryMax: posting.salaryMax,
    salaryType: posting.salaryType,
    jobUrl: posting.url ?? "",
    // No LLM invention here — MyCareersFuture doesn't publish a
    // "transferable skills" judgment, so this stays empty for live cards
    // rather than fabricating one (JobCard's TagList hides empty lists).
    transferableSkills: [],
    skillsRequired: posting.skills,
    dayToDay: description,
    careerProgression: facts || "Not specified by the employer.",
  };
}

/**
 * POST /api/industry-roles
 * Filters live postings by MyCareersFuture's own official job-category
 * taxonomy (lib/industries.ts, sourced from MCF_CATEGORIES), then fetches
 * each posting's real, employer-written detail (full description, position
 * level, experience, employment type) to build the swipe deck — no LLM
 * invention anywhere in this path. Falls back to the static sample deck
 * only if the category search itself is too sparse or errors outright.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { industryId, limit } = (await request.json()) as IndustryRolesRequest;
    const industry = findIndustry(industryId);
    if (!industry) {
      return NextResponse.json({ error: `Unknown industry: "${industryId}"` }, { status: 400 });
    }
    const cardLimit = limit && limit > 0 ? Math.min(limit, MAX_CARDS) : MAX_CARDS;

    let cards: JobCard[];
    let source: "live" | "sample";
    try {
      // MyCareersFuture's `limit` param isn't honored by /v2/search (it
      // always returns a fixed ~20-result page) — slice client-side.
      const allPostings = await searchByCategory(industry.category, MAX_CARDS, 0);
      const postings = allPostings.slice(0, cardLimit);
      if (postings.length < MIN_LIVE_POSTINGS) {
        cards = SAMPLE_JOBS;
        source = "sample";
      } else {
        const details = await Promise.allSettled(postings.map((p) => fetchJobDetail(p.uuid)));
        cards = postings.map((p, i) => toJobCard(p, details[i].status === "fulfilled" ? details[i].value : null));
        source = "live";
      }
    } catch (fetchError) {
      console.error("Live industry role fetch failed, falling back to sample deck:", fetchError);
      cards = SAMPLE_JOBS;
      source = "sample";
    }

    return NextResponse.json({ cards, source }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/industry-roles:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
