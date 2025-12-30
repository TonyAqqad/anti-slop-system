# Skills Recommendation for Capture Client

This document outlines which skills to use from existing sources and which to create custom for your agency's website generation system.

---

## Part 1: Official Anthropic Skills to USE

These are available in Claude.ai and Claude Code via the marketplace:

### Install via Claude Code:
```bash
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

### Relevant Official Skills:

| Skill | Location | Use Case |
|-------|----------|----------|
| **docx** | `anthropics/skills/docx` | Generate client proposals, contracts, reports |
| **pdf** | `anthropics/skills/pdf` | Fill intake forms, generate invoices |
| **pptx** | `anthropics/skills/pptx` | Create pitch decks, client presentations |
| **xlsx** | `anthropics/skills/xlsx` | Analytics reports, pricing sheets |
| **mcp-builder** | `anthropics/skills/mcp-builder` | Build MCP servers for GoHighLevel, Sanity |
| **webapp-testing** | `anthropics/skills/webapp-testing` | Playwright testing for generated sites |
| **web-artifacts-builder** | `anthropics/skills/web-artifacts-builder` | Complex React artifacts |
| **brand-guidelines** | `anthropics/skills/brand-guidelines` | Apply consistent branding |
| **skill-creator** | `anthropics/skills/skill-creator` | Create new skills |

---

## Part 2: Community Skills to CONSIDER

From `github.com/alirezarezvani/claude-skills`:

| Skill | Use Case |
|-------|----------|
| **marketing-skill/content-creator** | SEO optimization, brand voice analysis |
| **fullstack-engineer** | Next.js + GraphQL scaffolding |
| **qa-engineer** | Test automation |
| **devops-engineer** | CI/CD, deployment automation |

From `fastmcp.me/Skills`:

| Skill | Use Case |
|-------|----------|
| **nextjs-developer** | Next.js 14+ with App Router, SSR, SEO |
| **seo-specialist** | Schema markup, meta tags, sitemaps |

---

## Part 3: Custom Skills to CREATE for Capture Client

These are specific to your agency's workflow and should be created as custom skills:

### 1. `gohighlevel-integration` (Priority: HIGH)
```yaml
name: gohighlevel-integration
description: Integrate GoHighLevel CRM with generated websites. Handles form submissions, 
  lead capture, webhook configuration, and voice AI triggers. Use when building sites 
  that need CRM integration, lead forms, or automated follow-up sequences.
```

**What it should include:**
- GHL API authentication patterns
- Form → GHL pipeline mapping
- Webhook endpoint generation
- Voice AI trigger configuration
- Lead source tracking setup

### 2. `local-seo-optimizer` (Priority: HIGH)
```yaml
name: local-seo-optimizer
description: Optimize websites for local search rankings. Generates LocalBusiness schema,
  Google Business Profile optimization guidance, citation consistency checks, and 
  location-specific landing pages. Use for any local business website.
```

**What it should include:**
- LocalBusiness schema generation by industry
- NAP (Name, Address, Phone) consistency checker
- Service area page templates
- Google Business Profile JSON-LD
- Review schema integration

### 3. `sanity-website-generator` (Priority: HIGH)
```yaml
name: sanity-website-generator
description: Generate complete Sanity.io schemas and Next.js integration for marketing 
  websites. Includes page builder blocks, SEO fields, form configurations, and 
  GROQ query patterns. Use when scaffolding new Sanity + Next.js projects.
```

**What it should include:**
- Industry-specific schema templates
- Page builder block library
- SEO object type
- Form submission handling
- Preview configuration
- ISR/revalidation patterns

### 4. `industry-templates` (Priority: MEDIUM)
```yaml
name: industry-templates
description: Pre-configured website templates for specific industries. Includes 
  fitness studios (F45, martial arts), restaurants (with menu/ordering), law firms,
  and home services. Provides industry-specific schemas, components, and copy patterns.
```

**What it should include:**
- F45/fitness studio template (MindBody integration hints)
- Restaurant template (menu schema, hours, ordering)
- Law firm template (practice areas, attorney bios)
- Home services template (service areas, booking)
- Martial arts template (class schedules, belt systems)

### 5. `viral-video-marketing` (Priority: MEDIUM)
```yaml
name: viral-video-marketing
description: Generate video marketing campaign assets. Creates scripts, shot lists,
  caption variations, and platform-specific formatting for TikTok, Instagram Reels,
  and YouTube Shorts. Use for creating video ad campaigns.
```

**What it should include:**
- Hook formula templates
- Script structure patterns
- Caption variations (A/B testing)
- Platform-specific aspect ratios
- CTA optimization

### 6. `accessibility-validator` (Priority: MEDIUM)
```yaml
name: accessibility-validator
description: Validate generated websites for WCAG 2.1 AA compliance. Runs axe-core 
  audits, checks color contrast, validates form labels, and ensures keyboard 
  navigation. Use after site generation to ensure accessibility.
```

**What it should include:**
- axe-core integration script
- Color contrast checker (uses Design DNA)
- ARIA attribute validation
- Keyboard navigation testing
- Screen reader compatibility checks

---

## Part 4: Recommended Skill Architecture

```
/skills/
├── anthropic/                    # Installed from marketplace
│   ├── docx/
│   ├── pdf/
│   ├── pptx/
│   ├── xlsx/
│   ├── mcp-builder/
│   └── webapp-testing/
│
├── capture-client/               # Your custom agency skills
│   ├── gohighlevel-integration/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   ├── create-webhook.ts
│   │   │   └── sync-contacts.ts
│   │   └── references/
│   │       └── ghl-api-patterns.md
│   │
│   ├── local-seo-optimizer/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   └── generate-schema.ts
│   │   └── references/
│   │       ├── schema-by-industry.md
│   │       └── local-seo-checklist.md
│   │
│   ├── sanity-website-generator/
│   │   ├── SKILL.md
│   │   ├── assets/
│   │   │   └── sanity-starter/     # Template project
│   │   └── references/
│   │       └── block-library.md
│   │
│   ├── industry-templates/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── fitness-studio.md
│   │       ├── restaurant.md
│   │       ├── law-firm.md
│   │       └── home-services.md
│   │
│   └── anti-slop-system/          # The system we just built
│       ├── CLAUDE.md
│       ├── .claude/agents/
│       ├── schemas/
│       └── ...
```

---

## Part 5: Integration Priority Order

1. **Immediate (This Week)**
   - Install official Anthropic skills via marketplace
   - Deploy anti-slop-system as-is
   - Create `gohighlevel-integration` skill

2. **Short-term (Next 2 Weeks)**
   - Create `local-seo-optimizer` skill
   - Create `sanity-website-generator` skill
   - Integrate SEO Auditor agent into pipeline

3. **Medium-term (Next Month)**
   - Create `industry-templates` skill
   - Create `accessibility-validator` skill
   - Build MCP server for GoHighLevel (using mcp-builder skill)

4. **Long-term**
   - Create `viral-video-marketing` skill
   - Build client-specific skill variations
   - Contribute skills back to community

---

## Part 6: Skill Creation Command

Use the official skill-creator from Anthropic:

```bash
# In Claude Code
claude "Use the skill-creator skill to create a new skill called 
gohighlevel-integration for CRM integration with marketing websites"
```

Or manually:
```bash
mkdir -p skills/capture-client/gohighlevel-integration
cat > skills/capture-client/gohighlevel-integration/SKILL.md << 'EOF'
---
name: gohighlevel-integration
description: [your description]
---

# GoHighLevel Integration

[Instructions here]
EOF
```

---

## Resources

- **Official Skills Repo**: https://github.com/anthropics/skills
- **Skills Documentation**: https://support.claude.com/en/articles/12512176-what-are-skills
- **Community Skills**: https://github.com/travisvn/awesome-claude-skills
- **FastMCP Skills**: https://fastmcp.me/Skills
- **Sanity SEO Course**: https://www.sanity.io/learn/course/seo-optimization
