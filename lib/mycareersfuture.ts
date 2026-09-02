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
