import { AnthropicBedrock } from "@anthropic-ai/bedrock-sdk";

// This project's LLM credentials are AWS SSO (see docs/AWS_SETUP.md), not a
// direct ANTHROPIC_API_KEY — so this goes through Bedrock, not the
// first-party Anthropic() client.
//
// Uses the legacy AnthropicBedrock (bedrock-runtime InvokeModel) client,
// not AnthropicBedrockMantle — this workshop account's org has an explicit
// service-control-policy deny on the newer bedrock-mantle:CreateInference
// action, confirmed live 2026-09-03. Model IDs are "global." cross-region
// inference profiles (see BEDROCK_MODEL below) — this account has no
// on-demand throughput for bare model IDs, confirmed live the same day.
// Region matches docs/AWS_SETUP.md's ap-southeast-1.
let client: AnthropicBedrock | null = null;

/** Lazy singleton so importing this module never throws when credentials are unset/expired. */
export function getAnthropicClient(): AnthropicBedrock {
  if (!client) {
    client = new AnthropicBedrock({ awsRegion: process.env.AWS_DEFAULT_REGION || "ap-southeast-1" });
  }
  return client;
}

export const BEDROCK_MODEL = {
  opus5: "global.anthropic.claude-opus-5",
  sonnet5: "global.anthropic.claude-sonnet-5",
  haiku45: "global.anthropic.claude-haiku-4-5-20251001-v1:0",
} as const;
