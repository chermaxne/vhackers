import { NextResponse } from "next/server";
import { generateCandidacyRationale } from "@/lib/llm/candidacyRationale";
import type { CandidacyScore } from "@/lib/candidacyScore";

export async function POST(request: Request) {
  let body: { candidacy?: CandidacyScore; targetRole?: string; postingsCount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error", error: "Invalid JSON body" }, { status: 400 });
  }

  const { candidacy, targetRole, postingsCount } = body;
  if (!candidacy || !targetRole) {
    return NextResponse.json({ status: "error", error: "candidacy and targetRole are required" }, { status: 400 });
  }

  const rationale = await generateCandidacyRationale(candidacy, targetRole, postingsCount ?? 0);
  return NextResponse.json({ status: "ok", data: rationale });
}
