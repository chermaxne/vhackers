import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";

const REGION = process.env.AWS_REGION || "ap-southeast-1";
const MODEL_ID = "anthropic.claude-3-5-sonnet-20241022";

const bedrockClient = new BedrockRuntimeClient({ region: REGION });

export interface SkillMatchRequest {
  userSkills: string[];
  jobs: Array<{
    uuid: string;
    title: string;
    transferableSkills: string[];
    skillsRequired: string[];
  }>;
}

export interface SkillMatchResponse {
  matches: Record<
    string,
    {
      matchedTransferableSkills: string[];
      matchedSkillsRequired: string[];
    }
  >;
}

/**
 * Use Claude to intelligently match user skills to job requirements
 */
async function matchSkillsWithClaude(
  userSkills: string[],
  jobs: SkillMatchRequest["jobs"]
): Promise<SkillMatchResponse["matches"]> {
  const jobsJson = jobs
    .map(
      (job) =>
        `- Job: "${job.title}" (ID: ${job.uuid})\n  Transferable Skills: [${job.transferableSkills.join(", ")}]\n  Required Skills: [${job.skillsRequired.join(", ")}]`
    )
    .join("\n");

  const prompt = `You are a career skills matching expert. Given a user's skills and a list of job requirements, determine which user skills match each job's transferable and required skills.

User Skills: [${userSkills.join(", ")}]

Jobs:
${jobsJson}

For each job, identify which user skills are relevant to the job's transferable skills or required skills. Match skills based on semantic similarity and career relevance, not just exact string matching.

Return ONLY a valid JSON object in this exact format (no extra text):
{
  "uuid1": {
    "matchedTransferableSkills": ["skill1", "skill2"],
    "matchedSkillsRequired": ["skill3"]
  },
  "uuid2": {
    "matchedTransferableSkills": ["skill4"],
    "matchedSkillsRequired": ["skill5", "skill6"]
  }
}`;

  try {
    const response = await bedrockClient.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-06-01",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const responseText =
      responseBody.content?.[0]?.text || responseBody.completion || "";

    // Extract JSON object from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse skill matches from Claude response:", responseText);
      return {};
    }

    const matches = JSON.parse(jsonMatch[0]);
    return matches;
  } catch (error) {
    console.error("Error calling Bedrock Claude for skill matching:", error);
    throw new Error("Failed to match skills using AI");
  }
}

/**
 * POST /api/match-skills
 * Match user skills to job requirements using Claude
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
      return NextResponse.json(
        { error: "userSkills must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "jobs must be a non-empty array" }, { status: 400 });
    }

    const matches = await matchSkillsWithClaude(userSkills, jobs);

    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/match-skills:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
