/**
 * Fuzzy skill matching utility
 * Matches user's extracted skills against job requirement skills
 */

/**
 * Simple string similarity using Levenshtein-like distance
 * Returns a score from 0 to 1, where 1 is exact match
 */
function getStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1;

  // Check if one contains the other (partial match)
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  // Levenshtein distance-based similarity
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1;

  const editDistance = getLevenshteinDistance(longer, shorter);
  return 1 - editDistance / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function getLevenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let k = 0; k <= s1.length; k++) {
    let lastValue = k;
    for (let i = 0; i <= s2.length; i++) {
      if (k === 0) {
        costs[i] = i;
      } else if (i > 0) {
        let newValue = costs[i - 1];
        if (s1.charAt(k - 1) !== s2.charAt(i - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[i]) + 1;
        }
        costs[i - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (k > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * Semantic skill categories for better matching
 * Groups similar skill names together
 */
const SKILL_CATEGORIES: Record<string, string[]> = {
  data: ["sql", "python", "r", "tableau", "power bi", "analytics", "database", "data visualization", "excel", "spreadsheet"],
  frontend: ["react", "vue", "angular", "javascript", "typescript", "html", "css", "ui", "ux", "figma", "design"],
  backend: ["node", "java", "python", "go", "rust", "c#", ".net", "aws", "gcp", "azure", "microservices"],
  communication: ["communication", "presentation", "writing", "public speaking", "stakeholder"],
  management: ["leadership", "management", "project management", "agile", "scrum", "planning"],
  finance: ["accounting", "finance", "excel", "financial modeling", "budgeting"],
  marketing: ["marketing", "seo", "seo", "content", "social media", "analytics"],
};

/**
 * Get semantic category for a skill
 */
function getSkillCategory(skill: string): string | null {
  const skillLower = skill.toLowerCase();
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.some((s) => skillLower.includes(s) || s.includes(skillLower))) {
      return category;
    }
  }
  return null;
}

/**
 * Find matching user skills for a given job skill
 * @param jobSkill The skill required by the job
 * @param userSkills Array of user's extracted skills
 * @param threshold Similarity threshold (0-1, default 0.7)
 * @returns The matching user skill if found, null otherwise
 */
export function findMatchingSkill(
  jobSkill: string,
  userSkills: string[],
  threshold: number = 0.7
): string | null {
  if (!userSkills || userSkills.length === 0) return null;

  let bestMatch: { skill: string; score: number } | null = null;

  for (const userSkill of userSkills) {
    // Try direct string similarity
    const similarity = getStringSimilarity(jobSkill, userSkill);

    if (similarity >= threshold && (!bestMatch || similarity > bestMatch.score)) {
      bestMatch = { skill: userSkill, score: similarity };
    }

    // Try semantic category matching (only if different skills)
    if (userSkill !== jobSkill) {
      const jobCategory = getSkillCategory(jobSkill);
      const userCategory = getSkillCategory(userSkill);

      if (jobCategory && userCategory && jobCategory === userCategory && similarity >= 0.6) {
        if (!bestMatch || similarity > bestMatch.score) {
          bestMatch = { skill: userSkill, score: similarity };
        }
      }
    }
  }

  return bestMatch ? bestMatch.skill : null;
}

/**
 * Get all matching skills from user's skills that match job requirements
 * @param jobSkills Array of skills required by the job
 * @param userSkills Array of user's extracted skills
 * @returns Array of job skills that have user matches
 */
export function getMatchingSkillsForJob(
  jobSkills: string[],
  userSkills: string[]
): string[] {
  if (!userSkills || userSkills.length === 0) return [];

  return jobSkills.filter((jobSkill) => findMatchingSkill(jobSkill, userSkills) !== null);
}

/**
 * Check if a specific job skill matches any user skill
 */
export function skillMatches(jobSkill: string, userSkills: string[]): boolean {
  return findMatchingSkill(jobSkill, userSkills) !== null;
}
