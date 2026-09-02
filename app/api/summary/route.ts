import { NextResponse } from "next/server";
import { summarizeInterestPattern } from "@/lib/llm/summarizeInterests";
import { aggregateSkillGaps } from "@/lib/roadmap";
import type { JobCard } from "@/lib/jobs";

export async function POST(request: Request) {
  let likedJobs: JobCard[];
  try {
    ({ likedJobs } = await request.json());
  } catch {
    return NextResponse.json({ status: "error", error: "Invalid JSON body" }, { status: 400 });
  }
  if (!Array.isArray(likedJobs)) {
    return NextResponse.json({ status: "error", error: "likedJobs must be an array" }, { status: 400 });
  }

  const skillGaps = aggregateSkillGaps(likedJobs);
  const topGaps = skillGaps.slice(0, 3);
  const unlockedRoles =
    topGaps.length > 0
      ? likedJobs.filter((job) => topGaps.some((gap) => job.skillsRequired.includes(gap.skill))).map((j) => j.title)
      : [];

  const summary = await summarizeInterestPattern(likedJobs, skillGaps, unlockedRoles);
  return NextResponse.json({ status: "ok", data: summary });
}
