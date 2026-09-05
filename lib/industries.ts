import { MCF_CATEGORIES, type McfCategory } from "./mycareersfuture";

export interface Industry {
  id: string;
  label: string;
  // The exact string MyCareersFuture's own "Job Function" filter expects —
  // identical to `label` today since these ids are derived straight from
  // MCF_CATEGORIES, kept as a separate field so a display label could
  // diverge from the API value later without touching every call site.
  category: McfCategory;
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// MyCareersFuture's own 42 categories are all real, but not all of them lead
// anywhere on a *reskilling* app — some are catch-alls with no coherent
// skills-course story ("Others", "General Work", "Public / Civil Service"),
// or sectors thin on structured SkillsFuture-style courses ("Wholesale
// Trade", "Repair and Maintenance", "Entertainment", "Events / Promotions",
// "Professional Services", "Legal"). Cut per-category to keep the picker
// down from 42 chips. courses.myskillsfuture.gov.sg blocks scripted
// requests (403), so this couldn't be verified against live course counts —
// it's an editorial judgment call, not a measured one; flag if any of these
// should come back.
const EXCLUDED_CATEGORIES: ReadonlySet<McfCategory> = new Set([
  "Entertainment",
  "Events / Promotions",
  "General Work",
  "Legal",
  "Others",
  "Professional Services",
  "Public / Civil Service",
  "Repair and Maintenance",
  "Wholesale Trade",
]);

export const INDUSTRIES: Industry[] = MCF_CATEGORIES.filter((category) => !EXCLUDED_CATEGORIES.has(category)).map(
  (category) => ({
    id: slugify(category),
    label: category,
    category,
  })
);

export function findIndustry(id: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.id === id);
}
