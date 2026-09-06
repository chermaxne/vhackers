const STORAGE_PREFIX = "lattice-roadmap-progress:";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * No user-account system exists, so the key is derived from the roadmap's
 * own content (target role + its exact step list) — stable across reloads
 * of the same roadmap, distinct across different ones. Purely client-side
 * (localStorage), never sent to the server or included in a shared link —
 * completion is personal to whoever's viewing their own roadmap.
 */
export function getRoadmapProgressKey(targetLabel: string, stepIds: string[]): string {
  return `${STORAGE_PREFIX}${slugify(targetLabel)}:${[...stepIds].sort().join(",")}`;
}

export function loadRoadmapProgress(key: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function saveRoadmapProgress(key: string, progress: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(progress));
  } catch {
    // Storage full or unavailable (private browsing) — completion tracking is a nice-to-have, fail silently.
  }
}
