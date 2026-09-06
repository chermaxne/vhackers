# Lattice — Reskilling Copilot

A mobile-first PWA that turns "I want to change careers" into a concrete,
budget-aware upskilling plan: upload a resume, explore real live job postings
by swiping, and get a phased course roadmap scored against actual market
demand.

## The flow, end to end

```
Welcome
  └─ Profile Creation — upload resume (PDF/DOCX)
       LLM extracts current role, years experience, skills
       "Do you know your target role/industry?"
       │
       ├─ Yes → Direct Role Entry
       │          type a role → live market snapshot + skill-gap roadmap,
       │          built immediately (no swiping)
       │
       └─ No  → Guided Discovery
                  industries (multi-select) + work setup (multi-select) +
                  study hours/week + urgency + budget + SkillsFuture Credit +
                  accommodations
                    │
                    ▼
                  Swipe Deck — up to 8 live roles pulled from MyCareersFuture
                  for the chosen industries, cards show salary, real
                  employer-written responsibilities, and a skill-overlap
                  match against your resume
                    │
                    ▼
                  AI Summary → Skill Gap ranking → "What this unlocks"
                    │
                    ▼
Roadmap Unlocked  (both paths land here)
  - candidacy score (0–100, banded) vs. live posting demand, with a
    one-line LLM rationale
  - phased course roadmap (Foundation / Building / Specializing) with a
    per-step checklist and a self-reported SkillsFuture Credit tracker
  - first-study-block export to Google Calendar / .ics
  - shareable roadmap link (state lives in the URL, nothing server-side)
  - "Prepare for interviews" → role-specific interview prep
  - Direct Role Entry only: "Explore other roles too?" loops back into
    the swipe deck
```

A persistent **Profile** tab sits alongside the journey at all times — edit
your skills or constraints there and it re-runs the roadmap without losing
your place.

## Setup

```bash
npm install
npm run dev
```

Runs on **[http://localhost:3001](http://localhost:3001)** — pinned off the
Next.js default of 3000 so it doesn't collide with the Passion To Serve app
(the sibling project one level up in this repo) when both are running.

### AWS credentials (required for the AI features)

The LLM features call **Amazon Bedrock** directly via `@aws-sdk/client-bedrock-runtime`
(not the Anthropic SDK — this hackathon sandbox's account explicitly blocks
`bedrock:InvokeModel` for every `anthropic.*` model, so everything runs on
**Amazon Nova Lite** instead). Put temporary credentials in `.env`:

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
AWS_DEFAULT_REGION=
```

See `docs/AWS_SETUP.md` for how to get these. If they're missing or expired,
every AI feature below **falls back to a deterministic heuristic** instead of
failing — the app stays fully demoable either way, just with less nuanced
output (each result is tagged `source: "model" | "heuristic"` internally).

## AI features (Amazon Nova Lite via Bedrock Converse)

| Feature | File | What it does |
| --- | --- | --- |
| Resume extraction | `lib/llm/extractResume.ts` | Pulls current role, years of experience, and a skills list out of an uploaded PDF/DOCX |
| Skill matching | `lib/llm/matchSkills.ts` | Fuzzy-matches your resume skills against each job card's required/transferable skills for the "profile overlap" strip |
| Interest summary | `lib/llm/summarizeInterests.ts` | Summarizes what your liked roles have in common |
| Candidacy rationale | `lib/llm/candidacyRationale.ts` | One-line plain-English explanation of your candidacy score |
| Interview prep | `lib/llm/interviewPrep.ts` | Role-specific interview questions and talking points from your skills + the target role's skill gaps |

Structured output goes through Bedrock Converse's **tool-use** mode (Nova has
no native JSON-schema mode like Anthropic's Messages API).

The **roadmap phasing itself** (`lib/roadmap.ts`) is deliberately plain
frequency-counting + chunking, not an LLM call — it's cheap, fast, and fully
deterministic given the skill-gap list, so there's no reason to spend a model
call on it.

## Live data, not fabricated data

- **`lib/mycareersfuture.ts`** — MyCareersFuture's real 42-category filter and
  per-job detail endpoint. Guided Discovery and Direct Role Entry both pull
  actual open postings (title, salary, employer-written description) —
  nothing here is LLM-invented or hardcoded.
- **`lib/skillsfuture.ts`** — builds SkillsFuture course-search deep links per
  skill. `courses.myskillsfuture.gov.sg` returns 403 to scripted requests, so
  course pricing/eligibility in the roadmap is **self-reported** by the user,
  not live-fetched — flagged honestly rather than faked.
- **`lib/jobs.ts`** — a small static sample deck, used only as a fallback if a
  live MyCareersFuture pull fails or returns too little.

## How it fits together

```
app/page.tsx                     top-level shell — two persistent tabs
                                  (Journey / Profile) over one lifted FlowState

components/JourneyFlow.tsx       the actual orchestrator — owns the screen
                                  union, history stack, and navigate()/goBack().
                                  Only 2 real Next.js routes exist ("/" and
                                  "/roadmap/view"); everything else here is a
                                  hand-rolled SPA, not file-based routing.

components/screens/
  Welcome.tsx                    landing screen
  ProfileCreation.tsx            resume upload + LLM extraction + fork
  DirectRoleEntry.tsx            "I know my role" path
  GuidedDiscoveryIntro.tsx       "I don't know yet" path — full constraints form
  AiSummary.tsx                  summarizes liked roles
  SkillGapScreen.tsx             ranks skill gaps by frequency across likes
  WhatThisUnlocks.tsx            reframes top gaps as roles unlocked
  RoadmapUnlocked.tsx            candidacy score, course roadmap, calendar
                                  export, share link, interview-prep entry
  CourseRoadmap.tsx              phased course list — checklist + SFC tracker
  InterviewPrep.tsx              LLM-generated interview prep
  ProfilePage.tsx                persistent second tab — edit skills/constraints

components/SwipeDeck.tsx         pointer-drag swipe deck over live job cards
components/JobCard.tsx           card layout — salary, responsibilities,
                                  transferable/required skills, profile overlap

app/api/                         route handlers backing the screens above
  industry-roles/                live MyCareersFuture pull, scoped by industry
  resume/parse/                  resume upload → LLM extraction
  match-skills/                  skill-overlap matching for the swipe deck
  summary/                       AI Summary
  candidacy-rationale/           one-line candidacy explanation
  interview-prep/                interview prep generation
  market/                        live posting snapshot for a target role

lib/
  roadmap.ts                     skill-gap aggregation + phasing + market snapshot
  candidacyScore.ts              skill-coverage score vs. live demand
  constraints.ts                 Constraints type + study-hours/urgency options
  flowState.ts                   the single FlowState shape lifted in app/page.tsx
  roadmapExport.ts                URL-only shareable roadmap encoding (base64url)
  roadmapProgress.ts             localStorage checklist completion, per roadmap
  roadmapBudget.ts               localStorage self-reported SFC budget tracker
  calendar.ts                    Google Calendar link + .ics export
  industries.ts                  the trimmed industry picker list
  llm/client.ts                  shared Bedrock Converse client (Nova Lite)
```

## Known limits

- No server-side persistence — mid-flow state lives in `app/page.tsx`
  (lost on refresh); only the **roadmap checklist** and **SFC budget tracker**
  survive a refresh, via `localStorage`, keyed by role + skill list.
- The shared roadmap link (`/roadmap/view`) carries only what's explicitly
  encoded into the URL (candidacy score, skill gaps, course links, headline)
  — no checklist/budget state leaks into a shared link.
- SkillsFuture course pricing/eligibility is self-reported, not live-fetched
  (see above) — treat the budget tracker as a planning aid, not a source of truth.
- AI features silently degrade to heuristics without valid AWS credentials —
  correct behavior for a hackathon demo, but not something to rely on in
  production without surfacing that fallback to the user.
