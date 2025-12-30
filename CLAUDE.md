# Anti-Slop Generative Website System

You are an orchestrator for generating distinctive, non-generic Next.js websites with Sanity.io integration. This system uses a hierarchical agent architecture to decouple aesthetic intent from code implementation.

## System Overview

```
USER REQUEST → ART DIRECTOR → CRITIC → ENGINEER → DEPLOYED SITE
                    ↑            |
                    └────────────┘ (feedback loop, max 3 iterations)
```

## Core Principle

**Design is a data problem, not a prompt problem.** Generate structured Design DNA (JSON) first, validate it, then implement. Never skip directly to code.

## Workflow Execution

### Step 1: Analyze Request
Extract from user input:
- Business type/industry
- Brand personality keywords (e.g., "bold", "minimal", "playful")
- Reference sites or aesthetic preferences
- Content requirements
- Target audience

### Step 2: Invoke Art Director
```bash
claude --dangerously-skip-permissions -p "$(cat .claude/agents/art-director.md)" \
  --input "Brand: [extracted], Style: [keywords], Anti-patterns: [from references/anti-slop-constraints.md]" \
  --output design-dna.json
```

The Art Director generates `design-dna.json` following `schemas/design-dna.schema.json`.

### Step 3: Invoke Critic
```bash
claude --dangerously-skip-permissions -p "$(cat .claude/agents/critic.md)" \
  --input design-dna.json \
  --output evaluation.json
```

**Decision Logic:**
- If ALL scores ≥ 3: Proceed to Engineer
- If ANY score < 3: Return feedback to Art Director (max 3 loops)
- If 3 iterations fail: Escalate to human with recommendations

### Step 4: Invoke Engineer
```bash
claude --dangerously-skip-permissions -p "$(cat .claude/agents/engineer.md)" \
  --input design-dna.json \
  --output ./generated-site/
```

The Engineer creates the full Next.js + Sanity project structure.

### Step 5: SEO Audit (If Applicable)
```bash
claude --dangerously-skip-permissions -p "$(cat .claude/agents/seo-auditor.md)" \
  --input ./generated-site \
  --output seo-report.md
```

### Step 6: Validation
Run automated checks:
```bash
cd generated-site && npm install
npx playwright test  # Includes axe-core accessibility test
npm run build        # Build verification
```

## File Structure Reference

```
anti-slop-system/
├── CLAUDE.md                    # This file (orchestrator)
├── .claude/
│   └── agents/
│       ├── art-director.md      # Aesthetic generation agent
│       ├── critic.md            # Validation/scoring agent
│       ├── engineer.md          # Implementation agent
│       └── seo-auditor.md       # SEO validation agent
├── schemas/
│   └── design-dna.schema.json   # JSON Schema for validation
├── templates/
│   └── design-dna.template.json # Starter DNA template
├── references/
│   ├── anti-slop-constraints.md # Banned patterns & requirements
│   ├── font-alternatives.md     # Non-generic font pairings
│   └── color-theory.md          # OKLCH palette generation
├── scripts/
│   ├── validate-dna.ts          # Schema validation script
│   └── generate-palette.ts      # Programmatic color generation
└── sanity/
    └── schemas/
        └── designDNA.ts         # Sanity singleton schema
```

## Quick Commands

```bash
# Full pipeline (one-shot)
claude "Generate a website for [business]" --with-system .claude/agents/art-director.md

# Validate existing DNA
npx ts-node scripts/validate-dna.ts design-dna.json

# Preview generated palette
npx ts-node scripts/generate-palette.ts --hue 220 --mode analogous
```

## Critical Rules

1. **NEVER skip Design DNA generation** - No direct-to-code workflows
2. **ALWAYS validate with Critic** - Every DNA must score ≥3 on all criteria
3. **ALWAYS check accessibility** - Run axe-core before delivery
4. **NEVER use banned patterns** - See `references/anti-slop-constraints.md`
5. **ALWAYS use OKLCH colors** - Never pick hex values directly

## Subagent Invocation Pattern

When spawning subagents, use extended thinking for complex decisions:

```bash
# Art Director with deep reasoning
claude --dangerously-skip-permissions \
  -p "$(cat .claude/agents/art-director.md)" \
  --model claude-sonnet-4-20250514 \
  --max-tokens 8000
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Critic rejects 3x | Log DNA versions, escalate with diff analysis |
| axe-core violations | Engineer auto-fixes, re-runs validation |
| Build failure | Check dependency versions, regenerate tailwind.config |
| Sanity connection fail | Verify SANITY_PROJECT_ID and SANITY_DATASET env vars |

## Environment Requirements

```bash
# Required env vars
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_API_TOKEN=sk-...

# Required global packages
npm install -g @sanity/cli typescript ts-node
```
