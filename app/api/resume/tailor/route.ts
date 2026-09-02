import { NextResponse } from "next/server";
import { tailorResumeForRole } from "@/lib/llm/tailorResume";

export async function POST(request: Request) {
  let body: { resumeText?: string; targetRole?: string; emphasizeSkills?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error", error: "Invalid JSON body" }, { status: 400 });
  }

  const { resumeText, targetRole, emphasizeSkills } = body;
  if (!resumeText?.trim()) {
    return NextResponse.json({ status: "error", error: "resumeText is required" }, { status: 400 });
  }
  if (!targetRole?.trim()) {
    return NextResponse.json({ status: "error", error: "targetRole is required" }, { status: 400 });
  }

  const tailored = await tailorResumeForRole(resumeText, targetRole, emphasizeSkills ?? []);
  return NextResponse.json({ status: "ok", data: tailored });
}
