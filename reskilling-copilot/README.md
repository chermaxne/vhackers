# Reskilling Copilot

The core user flow from the shared flow doc, end to end:

```
Profile Creation (resume upload + fork)
├── Yes → Direct Role Entry → Roadmap (immediate) → optional "explore other roles" → Swipe Deck
└── No  → Guided Discovery (remote pref) → Swipe Deck → AI Summary → Skill Gaps → What This Unlocks → Roadmap
```

## Setup

```bash
npm install
npm run dev
```

Runs on **[http://localhost:3001](http://localhost:3001)** — pinned off the
Next.js default of 3000 so it doesn't fight the Passion To Serve app (the
project one level up in this repo) for the port when both are running.

No API keys needed. Everything is static/deterministic — see below.

## How it fits together

```
app/page.tsx                 flow orchestrator — owns which screen is showing
                              and the state collected along the way

components/screens/
  ProfileCreation.tsx         resume upload (filename only, no parsing) + fork
  DirectRoleEntry.tsx         "I know my role" path — matches input against
                               lib/jobs.ts by title, builds a roadmap immediately
  GuidedDiscoveryIntro.tsx    "I don't know yet" path — one remote-work question
  AiSummary.tsx                summarizes liked roles (most common transferable
                               skills across picks)
  SkillGapScreen.tsx           ranks skill gaps by how many liked roles need them
  WhatThisUnlocks.tsx          reframes the top gaps as "closing these unlocks N roles"
  RoadmapUnlocked.tsx          phases the gaps into Foundation/Building/Specializing

components/SwipeDeck.tsx      pointer-drag swipe deck, hands `liked` back to
                               the orchestrator via onComplete
components/JobCard.tsx        card layout (title, salary, skills, progression)

lib/jobs.ts                   JobCard type + SAMPLE_JOBS (6 hardcoded roles)
lib/roadmap.ts                skill-gap aggregation + phasing logic
```

## Deterministic, not AI-generated — and why

The flow doc calls for Claude to do resume parsing, the AI Summary, and the
skill-gap analysis. That path needs Anthropic API credits, which this
account didn't have when this was built (see git history / conversation —
`/api/jobs` originally called Claude per-batch and hit
`credit balance is too low`). Rather than block the whole flow on billing,
every "AI" step here is a plain deterministic function instead:

- **AI Summary** — counts the most frequent `transferableSkills` across your
  liked roles.
- **Skill Gaps** — counts how many liked roles list each `skillsRequired`
  entry, ranked descending.
- **Roadmap phases** — chunks the ranked gap list into three even groups.
- **Resume upload** — captures the filename only. No parsing.

`lib/roadmap.ts` is the swap-in point once credits exist — replace
`aggregateSkillGaps` / `phaseSkillGaps` with a Claude call that takes the
same inputs and returns the same shape (`SkillGap[]` / `RoadmapPhase[]`),
and every screen downstream keeps working unchanged.

## Known limits

- `lib/jobs.ts` has skills data for exactly 6 roles. Direct Role Entry does
  a substring match against those titles — anything else gets an honest
  "we don't have data on that yet" message rather than fabricated content.
- No persistence — refreshing mid-flow loses your place (state lives in
  `app/page.tsx`, not a store or URL).
- Remote-work preference is captured in Guided Discovery but not yet used
  to filter the deck (the sample dataset is too small to filter meaningfully).
