# Anti-Slop Generative Website System

A Claude Code orchestration system for generating distinctive, non-generic Next.js websites with Sanity.io integration.

## Quick Start

```bash
# Install dependencies
npm install

# Validate the example Design DNA
npm run check:example

# Generate a new color palette
npm run palette -- --hue 180 --mode analogous

# Validate your own Design DNA
npm run validate -- path/to/your/design-dna.json
```

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  ART DIRECTOR   │ ──▶ │     CRITIC      │ ──▶ │    ENGINEER     │
│  (Aesthetics)   │     │  (Validation)   │     │ (Implementation)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   design-dna.json        evaluation.json         Next.js Project
```

## File Structure

```
anti-slop-system/
├── CLAUDE.md                    # Main orchestrator instructions
├── .claude/
│   └── agents/
│       ├── art-director.md      # Generates Design DNA
│       ├── critic.md            # Validates quality
│       ├── engineer.md          # Implements code
│       └── seo-auditor.md       # SEO validation agent
├── schemas/
│   └── design-dna.schema.json   # JSON Schema
├── templates/
│   └── design-dna.template.json # Starter template
├── references/
│   ├── anti-slop-constraints.md # What to avoid
│   ├── font-alternatives.md     # Non-generic fonts
│   └── color-theory.md          # OKLCH color guide
├── scripts/
│   ├── validate-dna.ts          # Validation tool
│   └── generate-palette.ts      # Palette generator
├── sanity/schemas/
│   └── designDNA.ts             # Sanity CMS schema
└── examples/
    └── ceramics-studio.design-dna.json
```

## Usage with Claude Code

### Generate a Website

```bash
# In Claude Code, with this system in your project:
claude "Generate a website for a ceramics studio. 
Use .claude/agents/art-director.md first, validate with .claude/agents/critic.md, 
then implement with .claude/agents/engineer.md"
```

### Invoke Subagents Directly

```bash
# Art Director only
claude --print "$(cat .claude/agents/art-director.md)" \
  "Create Design DNA for a brutalist architecture firm"

# Validate existing DNA
npm run validate -- my-project/design-dna.json
```

## Key Concepts

### Design DNA
A JSON specification that encodes design intent:
- **Color**: OKLCH palette with contrast ratios
- **Typography**: Font families + modular scale
- **Motion**: Spring physics configurations
- **Geometry**: Border radius + spacing system
- **Generative**: Noise seed for controlled variation

### Anti-Slop Constraints
The system explicitly bans:
- Overused fonts (Inter, Roboto, Poppins...)
- Generic color patterns (blue-purple gradients)
- Template layouts (floating 3D mockups)
- Default shadows and effects

### OKLCH Color Model
Uses perceptually uniform colors:
- **L**: Lightness (0-1)
- **C**: Chroma/saturation (0-0.4)
- **H**: Hue (0-360°)

## Scripts

### Validate Design DNA
```bash
npx ts-node scripts/validate-dna.ts <file>

# Example output:
# ✅ colorSystem: 4/4
# ✅ typographySystem: 3/4
# ✅ motionSystem: 4/4
# ⚠️ uniqueness: 3/4 (warnings about generic personality)
# Verdict: PASS
```

### Generate Palette
```bash
npx ts-node scripts/generate-palette.ts --hue 45 --mode analogous

# Options:
#   --hue <0-360>     Base hue
#   --mode <mode>     monochromatic|analogous|split-complementary|triadic
#   --dark            Dark mode palette
#   --json            Output Design DNA fragment
#   --css             Output CSS variables
```

## Sanity Integration

1. Copy `sanity/schemas/designDNA.ts` to your Sanity studio
2. Add to schema index:
   ```ts
   import designDNA from './designDNA'
   export const schemaTypes = [designDNA, ...]
   ```
3. Query in Next.js:
   ```ts
   const dna = await client.fetch(groq`*[_type == "designDNA"][0]`)
   ```

## License

MIT
