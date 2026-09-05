export interface MarketPosting {
  title: string;
  company: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryType: string | null;
  skills: string[];
  postedDate: string | null;
  url: string | null;
}

export interface MarketSkillCount {
  skill: string;
  count: number;
}

export interface MarketSnapshot {
  role: string;
  queriedRoles: string[];
  postings: MarketPosting[];
  topSkills: MarketSkillCount[];
}

const MCF_SEARCH_URL = "https://api.mycareersfuture.gov.sg/v2/search";
const MCF_JOB_URL = "https://api.mycareersfuture.gov.sg/v2/jobs";

// MyCareersFuture's own official "Job Function" filter values — scraped
// live from the react-select options on mycareersfuture.gov.sg/search
// (2026-09-05), confirmed to work as the `categories` field on /v2/search
// (e.g. {search:"", categories:["Engineering"]} returned 7,314 real
// postings). This is MCF's real taxonomy, not a curated guess — using it
// directly means every industry pull is a genuine category-filtered slice
// of the live board, not a merge of a handful of seed-role text searches.
export const MCF_CATEGORIES = [
  "Accounting / Auditing / Taxation",
  "Admin / Secretarial",
  "Advertising / Media",
  "Architecture / Interior Design",
  "Banking and Finance",
  "Building and Construction",
  "Consulting",
  "Customer Service",
  "Design",
  "Education and Training",
  "Engineering",
  "Entertainment",
  "Environment / Health",
  "Events / Promotions",
  "F&B",
  "General Management",
  "General Work",
  "Healthcare / Pharmaceutical",
  "Hospitality",
  "Human Resources",
  "Information Technology",
  "Insurance",
  "Legal",
  "Logistics / Supply Chain",
  "Manufacturing",
  "Marketing / Public Relations",
  "Medical / Therapy Services",
  "Others",
  "Personal Care / Beauty",
  "Precision Engineering",
  "Professional Services",
  "Public / Civil Service",
  "Purchasing / Merchandising",
  "Real Estate / Property Management",
  "Repair and Maintenance",
  "Risk Management",
  "Sales / Retail",
  "Sciences / Laboratory / R&D",
  "Security and Investigation",
  "Social Services",
  "Telecommunications",
  "Travel / Tourism",
  "Wholesale Trade",
] as const;

export type McfCategory = (typeof MCF_CATEGORIES)[number];

// Adjacent-role suggestions for the roles this demo has skills data for
// (lib/jobs.ts) — a free-text role outside this list just queries
// MyCareersFuture for itself, with no adjacent-role expansion.
const ADJACENT_ROLES: Record<string, string[]> = {
  "data analyst": ["Business Analyst", "Data Engineer"],
  "customer success executive": ["Account Manager", "Client Relations Executive"],
  "junior ux designer": ["Product Designer", "UI Designer"],
  "logistics coordinator": ["Supply Chain Executive", "Operations Executive"],
  "community health educator": ["Programme Coordinator", "Health Promotion Officer"],
  "junior financial analyst": ["Business Analyst", "Investment Analyst"],
};

export function adjacentRolesFor(role: string): string[] {
  return ADJACENT_ROLES[role.trim().toLowerCase()] ?? [];
}

interface RawSearchResult {
  title?: string;
  postedCompany?: { name?: string } | null;
  hiringCompany?: { name?: string } | null;
  salary?: { minimum?: number; maximum?: number; type?: { salaryType?: string } } | null;
  skills?: { skill?: string }[];
  metadata?: { newPostingDate?: string; jobDetailsUrl?: string } | null;
}

// v2/search results don't carry a uuid in the shape we map to MarketPosting
// (see RawSearchResult) — this variant keeps it, since the industry-roles
// pipeline needs the uuid to fetch each posting's full detail afterward.
interface RawSearchResultWithUuid extends RawSearchResult {
  uuid?: string;
}

export interface CategoryPosting extends MarketPosting {
  uuid: string;
}

/**
 * Filters live postings by MyCareersFuture's own official job-category
 * taxonomy (see MCF_CATEGORIES) instead of a free-text search — an empty
 * `search` string with a category returns the full, real category slice of
 * the board (thousands of postings), not just titles matching a keyword.
 */
export async function searchByCategory(category: McfCategory, limit = 15, page = 0): Promise<CategoryPosting[]> {
  const res = await fetch(MCF_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ search: "", categories: [category], limit, page }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`MyCareersFuture category search failed (${res.status}) for "${category}"`);
  }
  const data: { results?: RawSearchResultWithUuid[] } = await res.json();
  const results = data.results ?? [];
  return results
    .filter((r): r is RawSearchResultWithUuid & { uuid: string } => Boolean(r.uuid))
    .map((r) => ({
      uuid: r.uuid,
      title: r.title ?? "Untitled role",
      company: r.postedCompany?.name ?? r.hiringCompany?.name ?? null,
      salaryMin: r.salary?.minimum ?? null,
      salaryMax: r.salary?.maximum ?? null,
      salaryType: r.salary?.type?.salaryType ?? null,
      skills: (r.skills ?? []).map((s) => s.skill).filter((s): s is string => Boolean(s)),
      postedDate: r.metadata?.newPostingDate ?? null,
      url: r.metadata?.jobDetailsUrl ?? null,
    }));
}

export interface JobDetail {
  uuid: string;
  description: string | null;
  minimumYearsExperience: number | null;
  numberOfVacancies: number | null;
  positionLevel: string | null;
  employmentType: string | null;
}

interface RawJobDetail {
  uuid: string;
  description?: string | null;
  minimumYearsExperience?: number | null;
  numberOfVacancies?: number | null;
  positionLevels?: { position?: string }[];
  employmentTypes?: { employmentType?: string }[];
}

/** Strips MyCareersFuture's job-description HTML down to plain, readable text. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<li>/gi, "\n• ")
    .replace(/<\/(p|ul|ol|div)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Fetches a single posting's full, real, employer-written detail — the actual job description text, not a summary. */
export async function fetchJobDetail(uuid: string): Promise<JobDetail> {
  const res = await fetch(`${MCF_JOB_URL}/${uuid}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    throw new Error(`MyCareersFuture job detail fetch failed (${res.status}) for "${uuid}"`);
  }
  const r: RawJobDetail = await res.json();
  return {
    uuid: r.uuid,
    description: r.description ? htmlToPlainText(r.description) : null,
    minimumYearsExperience: r.minimumYearsExperience ?? null,
    numberOfVacancies: r.numberOfVacancies ?? null,
    positionLevel: r.positionLevels?.[0]?.position ?? null,
    employmentType: r.employmentTypes?.[0]?.employmentType ?? null,
  };
}

export async function searchMarketPostings(query: string, limit = 8): Promise<MarketPosting[]> {
  const res = await fetch(MCF_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ search: query, limit, page: 0 }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`MyCareersFuture search failed (${res.status}) for "${query}"`);
  }
  const data: { results?: RawSearchResult[] } = await res.json();
  const results = data.results ?? [];
  return results.map((r) => ({
    title: r.title ?? "Untitled role",
    company: r.postedCompany?.name ?? r.hiringCompany?.name ?? null,
    salaryMin: r.salary?.minimum ?? null,
    salaryMax: r.salary?.maximum ?? null,
    salaryType: r.salary?.type?.salaryType ?? null,
    skills: (r.skills ?? []).map((s) => s.skill).filter((s): s is string => Boolean(s)),
    postedDate: r.metadata?.newPostingDate ?? null,
    url: r.metadata?.jobDetailsUrl ?? null,
  }));
}

/**
 * Pulls live postings for a target role plus its adjacent roles and ranks
 * skills by how often they're listed across all of them — today's demand,
 * not the static lib/jobs.ts snapshot.
 */
export async function fetchMarketSnapshot(role: string): Promise<MarketSnapshot> {
  const adjacent = adjacentRolesFor(role);
  const queriedRoles = [role, ...adjacent];

  const settled = await Promise.allSettled(queriedRoles.map((r) => searchMarketPostings(r, 6)));
  const postings = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  const skillCounts = new Map<string, number>();
  for (const posting of postings) {
    for (const skill of posting.skills) {
      skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
    }
  }
  const topSkills = [...skillCounts.entries()]
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return { role, queriedRoles, postings, topSkills };
}
