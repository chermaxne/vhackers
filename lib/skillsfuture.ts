/**
 * Deep link into MySkillsFuture's course search, filtered by skill keyword.
 * Verified live pattern: courses.myskillsfuture.gov.sg/search?q=<keyword>.
 * There's no public course-directory search API (only a bulk dataset
 * export via data.gov.sg), so this links out rather than rendering
 * results in-app.
 */
export function buildSkillsFutureSearchUrl(skill: string): string {
  return `https://courses.myskillsfuture.gov.sg/search?q=${encodeURIComponent(skill)}`;
}
