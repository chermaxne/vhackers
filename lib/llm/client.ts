import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

// This project's LLM credentials are AWS SSO (see docs/AWS_SETUP.md). The
// hackathon sandbox account's service control policy explicitly denies
// bedrock:InvokeModel for every anthropic.* model (confirmed live
// 2026-09-05, both legacy and current Claude model IDs) — only Amazon's
// own Nova models are allowed. So this goes through the plain AWS Bedrock
// Converse API with Nova, not the Anthropic SDK. Default is Nova Lite —
// bumped up from Nova Micro after Micro gave noticeably weaker semantic
// judgment on matchSkills.ts's fuzzy skill-matching task. Both Micro and
// Lite are text-only (no image/document input) — see extractResume.ts's
// comment on what that means for PDF parsing.
let client: BedrockRuntimeClient | null = null;

/** Lazy singleton so importing this module never throws when credentials are unset/expired. */
function getBedrockClient(): BedrockRuntimeClient {
  if (!client) {
    client = new BedrockRuntimeClient({ region: process.env.AWS_DEFAULT_REGION || "us-east-1" });
  }
  return client;
}

export const BEDROCK_MODEL = {
  novaMicro: "amazon.nova-micro-v1:0",
  novaLite: "amazon.nova-lite-v1:0",
} as const;

interface ConverseOptions {
  model?: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

/** Plain free-text generation (rationale sentences, narrative summaries, tailored resume prose). */
export async function converseText(prompt: string, opts: ConverseOptions = {}): Promise<string> {
  const res = await getBedrockClient().send(
    new ConverseCommand({
      modelId: opts.model ?? BEDROCK_MODEL.novaLite,
      system: opts.system ? [{ text: opts.system }] : undefined,
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: opts.maxTokens ?? 1000, temperature: opts.temperature ?? 0.4 },
    })
  );
  const block = res.output?.message?.content?.find((c) => c.text !== undefined);
  if (!block?.text) throw new Error("No text content in Bedrock response");
  return block.text.trim();
}

/**
 * Structured JSON output via Converse's tool-use. Nova has no native
 * json-schema response mode (unlike Anthropic's Messages API), but forcing
 * a single-tool call with the desired schema as its input gets the same
 * result — Bedrock parses and validates the arguments for us, no manual
 * JSON.parse or markdown-fence-stripping needed. Verified live against
 * Nova Micro and Nova Lite 2026-09-05.
 */
export async function converseJson<T>(
  prompt: string,
  schema: Record<string, unknown>,
  opts: ConverseOptions = {}
): Promise<T> {
  const TOOL_NAME = "return_result";
  const res = await getBedrockClient().send(
    new ConverseCommand({
      modelId: opts.model ?? BEDROCK_MODEL.novaLite,
      system: opts.system ? [{ text: opts.system }] : undefined,
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: opts.maxTokens ?? 1500, temperature: opts.temperature ?? 0.2 },
      toolConfig: {
        // Bedrock's DocumentType union doesn't structurally match a plain JSON-schema object type; the runtime shape is correct.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [{ toolSpec: { name: TOOL_NAME, inputSchema: { json: schema as any } } }],
        toolChoice: { any: {} },
      },
    })
  );
  const block = res.output?.message?.content?.find((c) => c.toolUse?.name === TOOL_NAME);
  if (!block?.toolUse?.input) throw new Error("No tool-use content in Bedrock response");
  return block.toolUse.input as T;
}
