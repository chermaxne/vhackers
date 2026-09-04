import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";

// AWS Region and Model Configuration
const REGION = process.env.AWS_REGION || "ap-southeast-1";
const MODEL_ID = "anthropic.claude-3-5-sonnet-20241022";

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ region: REGION });

/**
 * Extract text from base64-encoded file content.
 * Handles plain text, attempting minimal parsing.
 * For production, integrate pdf-parse, mammoth, etc.
 */
async function extractTextFromFile(fileContent: string, fileName: string): Promise<string> {
  try {
    // Decode base64
    const buffer = Buffer.from(fileContent, "base64");

    // For now, assume text or basic parsing
    // In production, use pdf-parse for PDF and mammoth for DOCX
    let text = "";

    if (fileName.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else if (fileName.endsWith(".pdf")) {
      // Placeholder: in production, use pdf-parse
      // For now, attempt UTF-8 decode (will be garbled for binary PDF)
      text = buffer.toString("utf-8", 0, Math.min(buffer.length, 50000));
      text = text.replace(/[^\x20-\x7E\n\r\t]/g, "");
    } else if (fileName.endsWith(".docx")) {
      // Placeholder: in production, use mammoth
      text = buffer.toString("utf-8", 0, Math.min(buffer.length, 50000));
      text = text.replace(/[^\x20-\x7E\n\r\t]/g, "");
    } else {
      // Default: treat as text
      text = buffer.toString("utf-8");
    }

    return text;
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error("Failed to extract text from file");
  }
}

/**
 * Call AWS Bedrock Claude to extract skills from resume text.
 */
async function extractSkillsWithClaude(resumeText: string): Promise<string[]> {
  const prompt = `You are a career skills expert. Extract a list of professional and transferable skills from the following resume text. Return ONLY a JSON array of skill strings, nothing else.

Resume:
${resumeText}

Return ONLY this format:
["skill1", "skill2", "skill3"]`;

  try {
    const response = await bedrockClient.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-06-01",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      })
    );

    // Parse response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const responseText =
      responseBody.content?.[0]?.text || responseBody.completion || "";

    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Could not parse skills from Claude response:", responseText);
      return [];
    }

    const skills = JSON.parse(jsonMatch[0]);
    return Array.isArray(skills) ? skills.filter((s) => typeof s === "string") : [];
  } catch (error) {
    console.error("Error calling Bedrock Claude:", error);
    throw new Error("Failed to extract skills from resume");
  }
}

/**
 * POST /api/extract-skills
 * Extract skills from an uploaded resume file.
 *
 * Request body (multipart/form-data):
 * - file: File object (PDF, DOCX, or TXT)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString("base64");

    // Extract text from file
    const resumeText = await extractTextFromFile(base64Content, file.name);

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from file" },
        { status: 400 }
      );
    }

    // Extract skills using Claude
    const skills = await extractSkillsWithClaude(resumeText);

    return NextResponse.json({ skills }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/extract-skills:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
