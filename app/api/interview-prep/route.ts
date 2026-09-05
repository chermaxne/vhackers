import { NextResponse } from "next/server";
import { generateInterviewQuestions, type InterviewPrepInput } from "@/lib/llm/interviewPrep";

export async function POST(request: Request) {
  let body: Partial<InterviewPrepInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error", error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.targetRole?.trim()) {
    return NextResponse.json({ status: "error", error: "targetRole is required" }, { status: 400 });
  }

  const input: InterviewPrepInput = {
    currentRole: body.currentRole ?? null,
    yearsExperience: body.yearsExperience ?? null,
    skills: body.skills ?? [],
    targetRole: body.targetRole,
    jdRequiredSkills: body.jdRequiredSkills ?? [],
    skillGaps: body.skillGaps ?? [],
    transferableSkills: body.transferableSkills ?? [],
  };

  const result = await generateInterviewQuestions(input);
  return NextResponse.json({ status: "ok", data: result });
}
