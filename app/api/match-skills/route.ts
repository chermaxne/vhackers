import { NextRequest, NextResponse } from "next/server";
import { matchSkillsToJobs, type SkillMatchJob } from "@/lib/llm/matchSkills";

export interface SkillMatchRequest {
  userSkills: string[];
  jobs: SkillMatchJob[];
}

/**
 * POST /api/match-skills
 * Match user skills to job requirements. Tries Claude via Bedrock first;
 * falls back to substring matching if that fails (no credentials, no
 * model access, etc.) — see lib/llm/matchSkills.ts.
 *
 * Request body:
 * {
 *   "userSkills": ["SQL", "Python", "Communication"],
 *   "jobs": [
 *     {
 *       "uuid": "job-1",
 *       "title": "Data Analyst",
 *       "transferableSkills": ["Problem-solving", "Reporting"],
 *       "skillsRequired": ["SQL", "Excel", "Statistics"]
 *     }
 *   ]
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userSkills, jobs } = body as SkillMatchRequest;

    if (!userSkills || !Array.isArray(userSkills) || userSkills.length === 0) {
      return NextResponse.json({ error: "userSkills must be a non-empty array" }, { status: 400 });
    }
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "jobs must be a non-empty array" }, { status: 400 });
    }

    const matches = await matchSkillsToJobs(userSkills, jobs);
    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/match-skills:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
