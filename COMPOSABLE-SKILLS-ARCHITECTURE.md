# Anti-Slop System: Composable Skills Architecture

## Executive Summary

This document describes a **layered skill architecture** for the Anti-Slop Generative Website System that maximizes code reuse, minimizes context window bloat, and serves both the Anti-Slop agents AND standalone agency workflows (Capture Client).

**Key Insight**: The current system has knowledge embedded inline in agents (Art Director references `color-theory.md`, SEO Auditor contains schema patterns, etc.). This knowledge should be extracted into **foundation skills** that multiple higher-level skills can invoke on-demand.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW LAYER (Orchestrators)                       │
│                                                                              │
│   CLAUDE.md — Invokes skills, coordinates pipeline, contains NO knowledge    │
│                                                                              │
│   Example: "Run anti-slop-design, then local-seo-optimizer, then            │
│            sanity-website-generator, then gohighlevel-integration"           │
├─────────────────────────────────────────────────────────────────────────────┤
│                      COMPOSITION LAYER (Domain Skills)                       │
│                                                                              │
│   ┌─────────────────┐  ┌───────────────────┐  ┌────────────────────────┐    │
│   │ anti-slop-design│  │local-seo-optimizer│  │sanity-website-generator│    │
│   │                 │  │                   │  │                        │    │
│   │ Invokes:        │  │ Invokes:          │  │ Invokes:               │    │
│   │ - color-theory  │  │ - schema-markup   │  │ - anti-slop-design     │    │
│   │ - typography    │  │ - accessibility   │  │ - schema-markup        │    │
│   │ - anti-slop-    │  │                   │  │                        │    │
│   │   constraints   │  │ Adds:             │  │ Adds:                  │    │
│   │                 │  │ - Local business  │  │ - Sanity schemas       │    │
│   │ Outputs:        │  │   specifics       │  │ - GROQ patterns        │    │
│   │ - design-dna.json│ │ - NAP consistency │  │ - Next.js scaffold     │    │
│   └─────────────────┘  └───────────────────┘  └────────────────────────┘    │
│                                                                              │
│   ┌─────────────────────────┐  ┌─────────────────────┐                      │
│   │gohighlevel-integration  │  │ industry-templates  │                      │
│   │                         │  │                     │                      │
│   │ Standalone (no deps)    │  │ Invokes:            │                      │
│   │ - GHL API patterns      │  │ - anti-slop-design  │                      │
│   │ - Webhook setup         │  │ - schema-markup     │                      │
│   │ - Voice AI triggers     │  │                     │                      │
│   └─────────────────────────┘  └─────────────────────┘                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                      FOUNDATION LAYER (Atomic Skills)                        │
│                                                                              │
│   ┌─────────────┐ ┌────────────┐ ┌───────────────────┐ ┌──────────────┐     │
│   │color-theory │ │ typography │ │anti-slop-constraints│ │schema-markup│     │
│   │             │ │            │ │                   │ │              │     │
│   │ - OKLCH     │ │ - Font     │ │ - Banned patterns │ │ - JSON-LD    │     │
│   │   model     │ │   pairings │ │ - Required rules  │ │ - LocalBiz   │     │
│   │ - Palette   │ │ - Market   │ │ - Verification    │ │ - Article    │     │
│   │   generation│ │   share    │ │   checklist       │ │ - Product    │     │
│   │ - Contrast  │ │ - Modular  │ │                   │ │ - FAQ        │     │
│   │   checking  │ │   scales   │ │                   │ │ - Breadcrumb │     │
│   └─────────────┘ └────────────┘ └───────────────────┘ └──────────────┘     │
│                                                                              │
│   ┌─────────────────┐  ┌─────────────────┐                                  │
│   │  accessibility  │  │  motion-physics │                                  │
│   │                 │  │                 │                                  │
│   │ - WCAG 2.1 AA   │  │ - Spring configs│                                  │
│   │ - Contrast      │  │ - Reduced motion│                                  │
│   │ - Focus states  │  │ - Easing curves │                                  │
│   │ - Touch targets │  │                 │                                  │
│   └─────────────────┘  └─────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Why This Architecture?

### Problem 1: Context Window Bloat
**Current State**: Art Director agent loads `color-theory.md` (8KB), `font-alternatives.md` (5KB), and `anti-slop-constraints.md` (7KB) into context for EVERY invocation — even if the task only needs typography help.

**Solution**: Foundation skills load **only when invoked**. A simple color question loads only `color-theory` (~2KB as a skill).

### Problem 2: Knowledge Duplication
**Current State**: 
- SEO Auditor contains LocalBusiness schema patterns
- `local-seo-optimizer` (planned) would need the same patterns
- If we update schema patterns, we update in two places

**Solution**: Both invoke the shared `schema-markup` foundation skill.

### Problem 3: Tight Coupling
**Current State**: To use the color generation logic, you must invoke the full Art Director agent.

**Solution**: `color-theory` skill is standalone. A designer can invoke it directly without the Anti-Slop workflow.

### Problem 4: Testing Difficulty
**Current State**: Testing the Critic's typography validation requires running the full pipeline.

**Solution**: `typography` skill can be tested in isolation. Composition skills can be tested against foundation skills.

---

## Directory Structure

```
skills/
├── foundation/                          # Atomic, reusable knowledge
│   ├── color-theory/
│   │   ├── SKILL.md                     # Main skill file
│   │   └── scripts/
│   │       └── generate-palette.ts      # CLI tool (moved from anti-slop-system)
│   │
│   ├── typography/
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── font-pairings.md         # Detailed pairing tables
│   │
│   ├── anti-slop-constraints/
│   │   └── SKILL.md                     # Banned patterns, verification checklist
│   │
│   ├── schema-markup/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── local-business.md        # LocalBusiness, Restaurant, etc.
│   │       ├── article.md               # BlogPosting, NewsArticle
│   │       └── product.md               # Product, Offer, Review
│   │
│   ├── accessibility/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── contrast-checker.ts
│   │
│   └── motion-physics/
│       └── SKILL.md                     # Spring configs, reduced motion
│
├── composition/                         # Domain-specific, invoke foundation
│   ├── anti-slop-design/
│   │   ├── SKILL.md                     # Combines color + typography + constraints
│   │   ├── schemas/
│   │   │   └── design-dna.schema.json   # Moved from anti-slop-system
│   │   └── templates/
│   │       └── design-dna.template.json
│   │
│   ├── local-seo-optimizer/
│   │   └── SKILL.md                     # Invokes schema-markup + local specifics
│   │
│   ├── sanity-website-generator/
│   │   ├── SKILL.md
│   │   └── assets/
│   │       └── sanity-starter/          # Template Sanity + Next.js project
│   │
│   ├── gohighlevel-integration/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   ├── create-webhook.ts
│   │   │   └── sync-contacts.ts
│   │   └── references/
│   │       └── ghl-api-patterns.md
│   │
│   ├── industry-templates/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── fitness-studio.md        # F45, martial arts
│   │       ├── restaurant.md            # Menus, hours, ordering
│   │       ├── law-firm.md              # Practice areas, attorneys
│   │       └── home-services.md         # Service areas, booking
│   │
│   └── viral-video-marketing/
│       └── SKILL.md
│
└── workflows/                           # Orchestrators only
    └── anti-slop-website/
        ├── SKILL.md                     # Replaces CLAUDE.md, orchestrates composition skills
        └── examples/
            └── ceramics-studio.design-dna.json
```

---

## Phase 1: Foundation Skills

### 1.1 color-theory

**Source**: `references/color-theory.md` + `scripts/generate-palette.ts`

```markdown
---
name: color-theory
description: Generate accessible color palettes using OKLCH color space. Provides 
  palette generation strategies (monochromatic, analogous, split-complementary, triadic),
  contrast ratio calculation, and dark mode transformation. Use when creating color 
  systems, checking accessibility, or generating design tokens.
---

# Color Theory

## OKLCH Color Model

OKLCH (Oklab Lightness, Chroma, Hue) is perceptually uniform:
- L (Lightness): 0 to 1 — 0 = black, 1 = white
- C (Chroma): 0 to ~0.4 — 0 = gray, 0.15 = typical saturated
- H (Hue): 0 to 360 degrees

## Palette Generation Strategies

### Monochromatic with Accent
Single hue at varying L/C + one complementary accent.
Best for: Professional services, luxury, editorial.

[Include generation logic]

### Analogous Harmony
Three adjacent hues (30-60° apart).
Best for: Nature brands, wellness, organic products.

[Include generation logic]

### Split-Complementary
Base hue + two hues adjacent to complement.
Best for: Creative agencies, tech with personality.

[Include generation logic]

### Triadic
Three hues 120° apart.
Best for: Playful brands, children's products, entertainment.

[Include generation logic]

## Contrast Calculation

WCAG Requirements:
- Normal text: 4.5:1 minimum
- Large text (18px+ or 14px+ bold): 3:1 minimum
- UI components: 3:1 minimum
- AAA compliance: 7:1 for normal text

[Include contrast checking logic]

## Scripts

Run palette generation:
```bash
npx ts-node scripts/generate-palette.ts --hue 220 --mode split-complementary
```

## Integration

This skill is invoked by:
- `anti-slop-design` — for Design DNA color generation
- `accessibility` — for contrast validation
```

---

### 1.2 typography

**Source**: `references/font-alternatives.md`

```markdown
---
name: typography
description: Select distinctive, non-generic font pairings with proper hierarchy.
  Provides market share data, pairing strategies by industry, and modular scale
  configuration. Use when choosing fonts, setting up typography systems, or 
  validating font choices against overuse thresholds.
---

# Typography

## Banned Fonts (>5% Market Share)

NEVER use as primary font:
- Inter (3%)
- Roboto (28%)
- Open Sans (18%)
- Poppins (5%)
- Montserrat (6%)
- Lato (7%)
- Nunito
- Source Sans Pro (3%)
- Raleway (3%)
- Oswald (4%)

## Approved Font Categories

### Elegant Serif (Heading)
| Font | Market Share | Pairs With |
|------|--------------|------------|
| Fraunces | 0.1% | Space Grotesk, Satoshi |
| Instrument Serif | 0.2% | General Sans, Inter (body only) |
| Cormorant Garamond | 0.4% | Outfit, Karla |
| Libre Baskerville | 0.3% | Karla, Source Sans 3 |

### Modern Sans (Body)
| Font | Market Share | Pairs With |
|------|--------------|------------|
| Satoshi | Fontshare | Fraunces, Clash Display |
| General Sans | Fontshare | Instrument Serif, Syne |
| Space Grotesk | 0.4% | Fraunces, DM Serif Display |
| Outfit | 0.2% | Cormorant Garamond, Bodoni Moda |

[Continue with other categories]

## Pairing Strategies

### By Industry
| Industry | Heading | Body | Rationale |
|----------|---------|------|-----------|
| Legal/Finance | Libre Baskerville | Karla | Traditional authority + modern readability |
| Tech/SaaS | Space Grotesk | IBM Plex Sans | Technical but warm |
| Creative/Agency | Clash Display | Satoshi | Bold statement + clean body |
| Healthcare | Manrope | Lexend | Accessible, trustworthy |
| Food/Hospitality | Gloock | Figtree | Characterful + friendly |

## Modular Scale

| Ratio Name | Value | Feel |
|------------|-------|------|
| Minor Second | 1.067 | Subtle |
| Major Second | 1.125 | Readable |
| Minor Third | 1.2 | Comfortable |
| Major Third | 1.25 | Balanced |
| Perfect Fourth | 1.333 | Classic |
| Golden Ratio | 1.618 | Dramatic |

## Validation

Check font choice:
1. Is market share <5%? ✓/✗
2. Does pairing have contrast (serif/sans, display/body)? ✓/✗
3. Are fallbacks defined? ✓/✗
4. Is scale ratio appropriate for content density? ✓/✗

## Integration

This skill is invoked by:
- `anti-slop-design` — for Design DNA typography selection
- `industry-templates` — for industry-specific defaults
```

---

### 1.3 anti-slop-constraints

**Source**: `references/anti-slop-constraints.md`

```markdown
---
name: anti-slop-constraints
description: Validation rules for detecting and preventing generic AI-generated 
  aesthetics. Contains banned patterns (colors, layouts, fonts, shadows), required
  patterns (accessibility, spring physics), and verification checklists. Use when 
  validating design decisions or auditing existing designs for AI-slop.
---

# Anti-Slop Constraints

## Absolute Bans (Auto-Fail)

### Banned Color Patterns
```
# The "SaaS Gradient"
#667eea → #764ba2  (blue-purple)
#6366f1 → #8b5cf6  (indigo-violet)

# Generic grays
#808080 (exact 50% gray)

# Pure black/white
#000000 on #ffffff (add slight hue tint)
```

### Banned Layouts
- ❌ Centered headline + subhead + CTA + floating 3D mockup
- ❌ Three equal-width cards with icons above headlines
- ❌ Testimonial carousel with avatar + quote + name/title
- ❌ Pricing table with "Most Popular" badge
- ❌ Alternating image-left/image-right sections

### Banned CTA Copy
- "Get Started"
- "Sign Up Free"
- "Start Your Free Trial"
- "Book a Demo"
- "Learn More"

### Banned Shadows
```css
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);    /* Default */
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);  /* Medium default */
box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25); /* Large default */
```

### Banned Motion
- ❌ `ease-in-out` for everything
- ❌ `transition: all 0.3s`
- ❌ Ignoring `prefers-reduced-motion`

## Required Patterns

### Accessibility (Non-Negotiable)
- Text contrast ≥ 4.5:1
- UI components ≥ 3:1
- Touch targets ≥ 44x44px
- Focus indicators visible
- `prefers-reduced-motion` respected

### Motion (Spring Physics Required)
```json
{
  "springs": {
    "snappy": { "stiffness": 400, "damping": 30, "mass": 1 },
    "gentle": { "stiffness": 120, "damping": 14, "mass": 1 }
  }
}
```

### Typography (Scale Required)
Must use modular scale ratio between 1.1 and 1.618.

## Verification Checklist

Before approving any design:

### Visual Distinction
- [ ] Primary font has <5% market share
- [ ] Color palette not achievable with Tailwind defaults
- [ ] At least one "unexpected" design choice
- [ ] Border-radius varies by component type

### Technical Validity
- [ ] All contrast ratios calculated and passing
- [ ] Spring physics defined (not just easing)
- [ ] Reduced motion handling specified
- [ ] Generative seed is unique

### Personality Check
- [ ] Personality keywords are specific (not "modern", "clean")
- [ ] Anti-patterns list is populated
- [ ] Design choices support stated personality

## Integration

This skill is invoked by:
- `anti-slop-design` — for validation during Design DNA generation
- Standalone — for auditing existing designs
```

---

### 1.4 schema-markup

**Source**: Extracted from `agents/seo-auditor.md`

```markdown
---
name: schema-markup
description: Generate JSON-LD structured data for SEO. Provides schema patterns for
  LocalBusiness (by industry), Article, Product, FAQ, Breadcrumb, and Organization.
  Includes Next.js integration patterns. Use when adding schema markup to pages or
  validating existing structured data.
---

# Schema Markup (JSON-LD)

## LocalBusiness Schemas

### Base LocalBusiness
```typescript
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness', // Or specific subtype
  name: business.name,
  description: business.description,
  url: business.url,
  telephone: business.phone,
  email: business.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    addressRegion: business.address.state,
    postalCode: business.address.zip,
    addressCountry: business.address.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: business.coordinates.lat,
    longitude: business.coordinates.lng,
  },
  openingHoursSpecification: business.hours.map(h => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.day,
    opens: h.open,
    closes: h.close,
  })),
  priceRange: business.priceRange,
  image: business.images,
  sameAs: business.socialLinks,
};
```

### Industry-Specific Types

| Industry | @type | Additional Fields |
|----------|-------|-------------------|
| Restaurant | Restaurant | servesCuisine, menu, acceptsReservations |
| Law Firm | LegalService | Attorney (nested), practiceArea |
| Fitness Studio | SportsActivityLocation | Event, Course |
| Home Services | HomeAndConstructionBusiness | areaServed, hasOfferCatalog |
| Martial Arts | SportsActivityLocation | sport, Course |

### Restaurant Schema
```typescript
const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  // ...base fields
  servesCuisine: ['Italian', 'Mediterranean'],
  menu: 'https://example.com/menu',
  acceptsReservations: true,
  hasMenu: {
    '@type': 'Menu',
    hasMenuSection: [
      {
        '@type': 'MenuSection',
        name: 'Appetizers',
        hasMenuItem: [
          {
            '@type': 'MenuItem',
            name: 'Bruschetta',
            description: 'Toasted bread with tomatoes',
            offers: {
              '@type': 'Offer',
              price: '12.00',
              priceCurrency: 'USD',
            },
          },
        ],
      },
    ],
  },
};
```

[Continue with LegalService, SportsActivityLocation, etc.]

## Article Schema

```typescript
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article', // or BlogPosting, NewsArticle
  headline: article.title,
  description: article.excerpt,
  image: article.featuredImage,
  datePublished: article.publishedAt,
  dateModified: article.updatedAt,
  author: {
    '@type': 'Person',
    name: article.author.name,
    url: article.author.url,
  },
  publisher: {
    '@type': 'Organization',
    name: site.name,
    logo: {
      '@type': 'ImageObject',
      url: site.logo,
    },
  },
};
```

## Breadcrumb Schema

```typescript
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
};
```

## FAQ Schema

```typescript
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};
```

## Next.js Integration

```typescript
// components/Schema.tsx
export function Schema({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// app/[slug]/page.tsx
import { Schema } from '@/components/Schema';

export default function Page({ data }) {
  return (
    <>
      <Schema data={generateLocalBusinessSchema(data.business)} />
      <Schema data={generateBreadcrumbSchema(data.breadcrumbs)} />
      {/* Page content */}
    </>
  );
}
```

## Integration

This skill is invoked by:
- `local-seo-optimizer` — for local business schema generation
- `sanity-website-generator` — for schema integration in templates
- `industry-templates` — for industry-specific schema defaults
```

---

### 1.5 accessibility

**Source**: Extracted from multiple agents

```markdown
---
name: accessibility
description: Validate and implement WCAG 2.1 AA compliance. Provides contrast checking,
  focus state patterns, touch target requirements, reduced motion handling, and 
  screen reader compatibility. Use when auditing accessibility or implementing 
  accessible components.
---

# Accessibility (WCAG 2.1 AA)

## Contrast Requirements

| Element | Minimum Ratio | AAA Target |
|---------|---------------|------------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (≥18px or ≥14px bold) | 3:1 | 4.5:1 |
| UI components | 3:1 | 4.5:1 |
| Graphical objects | 3:1 | 4.5:1 |

### Contrast Checker

```typescript
function checkContrast(fg: string, bg: string): ContrastResult {
  const ratio = calculateContrastRatio(fg, bg);
  return {
    ratio,
    passAA: ratio >= 4.5,
    passAALarge: ratio >= 3,
    passAAA: ratio >= 7,
  };
}
```

## Focus States

Every interactive element MUST have visible focus:

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Remove default, add custom */
button:focus {
  outline: none;
}
button:focus-visible {
  box-shadow: 0 0 0 3px var(--color-accent);
}
```

## Touch Targets

Minimum 44x44px for all interactive elements:

```css
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

.icon-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Reduced Motion

ALWAYS respect user preference:

```typescript
// Hook
function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    
    const handler = (e) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReduced;
}

// Usage
const prefersReduced = usePrefersReducedMotion();
const spring = prefersReduced 
  ? { type: 'tween', duration: 0 }
  : { type: 'spring', stiffness: 120, damping: 14 };
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Screen Reader Compatibility

### Semantic HTML
```html
<header role="banner">...</header>
<nav role="navigation" aria-label="Main">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>
```

### ARIA Labels
```html
<button aria-label="Close modal">
  <IconX aria-hidden="true" />
</button>

<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><span aria-current="page">Current</span></li>
  </ol>
</nav>
```

### Skip Links
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<style>
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: 0;
  top: 0;
  z-index: 9999;
  background: white;
  padding: 1rem;
}
</style>
```

## Automated Testing

```typescript
// playwright.config.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should pass accessibility audit', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(results.violations).toEqual([]);
});
```

## Integration

This skill is invoked by:
- `anti-slop-design` — for contrast validation in Design DNA
- `local-seo-optimizer` — accessibility affects SEO
- Standalone — for accessibility audits
```

---

### 1.6 motion-physics

**Source**: Extracted from agents, Design DNA schema

```markdown
---
name: motion-physics
description: Configure spring-based animations for natural motion feel. Provides
  spring presets, Framer Motion integration, and reduced motion fallbacks. Use when
  defining animation systems or implementing component transitions.
---

# Motion Physics

## Spring Configuration

Springs are defined by three values:
- **Stiffness**: How "strong" the spring is (higher = faster)
- **Damping**: How much resistance (higher = less bounce)
- **Mass**: Weight of the animated element (higher = slower, more momentum)

### Presets

| Name | Stiffness | Damping | Mass | Use Case |
|------|-----------|---------|------|----------|
| Snappy | 400 | 30 | 1 | Buttons, toggles, micro-interactions |
| Gentle | 120 | 14 | 1 | Page transitions, hero animations |
| Bouncy | 300 | 10 | 1 | Playful elements, attention-grabbing |
| Slow | 100 | 20 | 1.5 | Large elements, backgrounds |
| Instant | 500 | 35 | 0.5 | Tooltips, dropdowns |

### Design DNA Format

```json
{
  "motion": {
    "springs": {
      "snappy": { "stiffness": 400, "damping": 30, "mass": 1 },
      "gentle": { "stiffness": 120, "damping": 14, "mass": 1 },
      "bouncy": { "stiffness": 300, "damping": 10, "mass": 1 }
    },
    "defaultSpring": "gentle",
    "reducedMotion": "respectSystem"
  }
}
```

## Framer Motion Integration

```typescript
import { motion } from 'framer-motion';
import designDNA from './design-dna.json';

function getSpring(name: string = 'gentle') {
  const spring = designDNA.motion.springs[name];
  return {
    type: 'spring',
    stiffness: spring.stiffness,
    damping: spring.damping,
    mass: spring.mass,
  };
}

// Usage
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={getSpring('gentle')}
>
  Content
</motion.div>
```

## Reduced Motion Handling

```typescript
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  const transition = shouldReduceMotion
    ? { type: 'tween', duration: 0 }
    : getSpring('gentle');
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transition}
    >
      Content
    </motion.div>
  );
}
```

## CSS Fallbacks

For non-JS environments:

```css
/* Define spring-like cubic bezier approximations */
:root {
  --ease-snappy: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-gentle: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
```

## Integration

This skill is invoked by:
- `anti-slop-design` — for motion configuration in Design DNA
- `sanity-website-generator` — for animation implementation
```

---

## Phase 2: Composition Skills

### 2.1 anti-slop-design

**Replaces**: Art Director + Critic agents

```markdown
---
name: anti-slop-design
description: Generate distinctive, non-generic Design DNA for websites. Combines
  color theory, typography selection, motion physics, and anti-slop validation into
  a complete design system specification. Outputs design-dna.json. Use when starting
  any new website project.
---

# Anti-Slop Design System

## Overview

This skill orchestrates the generation of Design DNA by invoking foundation skills
and applying validation rules.

## Dependencies

Invoke these foundation skills during execution:
- `color-theory` — for OKLCH palette generation
- `typography` — for font pairing selection
- `anti-slop-constraints` — for banned pattern validation
- `motion-physics` — for spring configuration
- `accessibility` — for contrast validation

## Workflow

### Step 1: Gather Requirements
Extract from user input:
- Business type/industry
- Brand personality keywords (e.g., "bold", "minimal", "playful")
- Reference sites or aesthetic preferences
- Target audience

### Step 2: Generate Color Palette
Invoke `color-theory` skill:
1. Determine harmony mode based on personality
2. Generate OKLCH palette
3. Validate contrast ratios via `accessibility` skill
4. Adjust if needed

### Step 3: Select Typography
Invoke `typography` skill:
1. Match industry to font pairings
2. Verify market share <5%
3. Configure modular scale
4. Set up font stacks with fallbacks

### Step 4: Configure Motion
Invoke `motion-physics` skill:
1. Select spring presets matching personality
2. Set default spring
3. Configure reduced motion handling

### Step 5: Validate
Invoke `anti-slop-constraints` skill:
1. Check against banned patterns
2. Verify all required patterns present
3. Run verification checklist

### Step 6: Output

Generate `design-dna.json` matching schema:

```json
{
  "$schema": "./schemas/design-dna.schema.json",
  "meta": {
    "projectName": "example-project",
    "version": "1.0.0",
    "personality": ["tactile", "warm", "artisanal"],
    "antiPatterns": ["corporate-memphis", "blue-purple-gradient"]
  },
  "primitives": {
    "color": { /* from color-theory */ },
    "typography": { /* from typography */ },
    "motion": { /* from motion-physics */ },
    "geometry": { /* border-radius, spacing */ }
  },
  "generative": {
    "noise": {
      "seed": "unique-seed",
      "layoutJitter": { "maxOffset": 6, "rotationRange": [-2, 2] }
    }
  }
}
```

## Scoring Rubric (Critic Logic)

Score 1-4 on each criterion. PASS requires all ≥3:

| Criterion | Score 4 | Score 1 |
|-----------|---------|---------|
| Color | Unique OKLCH palette, AAA contrast | Tailwind defaults, fails AA |
| Typography | <1% market share, perfect hierarchy | Banned font, no scale |
| Motion | Sophisticated springs, a11y-first | No physics, ignores reduced motion |
| Uniqueness | Portfolio-worthy, memorable | Indistinguishable from template |

## Integration

This skill is invoked by:
- `sanity-website-generator` — for theming
- `industry-templates` — for base design configuration
- Standalone — for design system generation
```

---

### 2.2 local-seo-optimizer

```markdown
---
name: local-seo-optimizer
description: Optimize websites for local search rankings. Generates LocalBusiness
  schema markup, validates NAP consistency, creates service area pages, and provides
  Google Business Profile optimization guidance. Use for any local business website.
---

# Local SEO Optimizer

## Dependencies

Invoke these foundation skills:
- `schema-markup` — for JSON-LD generation
- `accessibility` — SEO and accessibility overlap

## Workflow

### Step 1: Business Information Audit
Gather and validate:
- Business name (exact match across all platforms)
- Address (formatted consistently)
- Phone (with area code)
- Hours of operation
- Service areas

### Step 2: Generate Schema Markup
Invoke `schema-markup` skill:
1. Determine appropriate @type for industry
2. Generate LocalBusiness schema
3. Add industry-specific fields
4. Generate Breadcrumb schema
5. Generate FAQ schema if applicable

### Step 3: NAP Consistency Check
Verify Name, Address, Phone consistency:
- Website header/footer
- Contact page
- Schema markup
- Google Business Profile
- Citations (Yelp, Yellow Pages, etc.)

### Step 4: Service Area Pages
For businesses serving multiple areas:
```
/services/[city]/
├── index.tsx           # City landing page
├── [service]/page.tsx  # City + service combo
```

Each page needs:
- Unique title: "[Service] in [City] | [Business Name]"
- Unique description
- LocalBusiness schema with areaServed
- Local content (landmarks, neighborhoods)

### Step 5: Technical SEO
Generate:
- sitemap.xml with all service area pages
- robots.txt allowing crawling
- Canonical URLs preventing duplicate content

## Output

```json
{
  "audit": {
    "napConsistency": { "score": 4, "issues": [] },
    "schemaMarkup": { "score": 4, "types": ["LocalBusiness", "FAQPage"] },
    "serviceAreaCoverage": { "score": 3, "pages": 12, "missing": ["Maryville"] }
  },
  "generatedFiles": [
    "components/Schema/LocalBusinessSchema.tsx",
    "app/sitemap.ts",
    "app/robots.ts"
  ],
  "recommendations": [
    "Add service area page for Maryville",
    "Update GBP hours to match website"
  ]
}
```

## Integration

This skill is invoked by:
- `sanity-website-generator` — for SEO setup
- `industry-templates` — for industry-specific local SEO
- Standalone — for local SEO audits
```

---

### 2.3 gohighlevel-integration

```markdown
---
name: gohighlevel-integration
description: Integrate GoHighLevel CRM with generated websites. Handles form submissions,
  lead capture, webhook configuration, voice AI triggers, and pipeline automation.
  Use when building sites that need CRM integration or automated follow-up sequences.
---

# GoHighLevel Integration

## Overview

This skill configures the connection between a Next.js website and GoHighLevel CRM
for lead capture and automation.

## Prerequisites

Environment variables required:
```
GHL_API_KEY=your-api-key
GHL_LOCATION_ID=your-location-id
GHL_PIPELINE_ID=default-pipeline-id
```

## Form Integration

### Contact Form → GHL Contact

```typescript
// app/api/contact/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  
  const ghlResponse = await fetch(
    `https://rest.gohighlevel.com/v1/contacts/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        source: 'Website Contact Form',
        tags: ['website-lead'],
        customField: {
          'website_page': data.sourcePage,
          'form_name': data.formName,
        },
      }),
    }
  );
  
  if (!ghlResponse.ok) {
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
  
  // Optionally add to pipeline
  const contact = await ghlResponse.json();
  await addToPipeline(contact.id, process.env.GHL_PIPELINE_ID);
  
  return NextResponse.json({ success: true });
}
```

### Lead Magnet → GHL + Tag

```typescript
async function handleLeadMagnet(data: LeadMagnetSubmission) {
  const contact = await createOrUpdateContact({
    email: data.email,
    firstName: data.firstName,
    tags: ['lead-magnet', data.magnetType],
  });
  
  // Trigger automation
  await triggerWorkflow(contact.id, 'lead-magnet-delivery');
  
  return contact;
}
```

## Webhook Configuration

### Receive GHL Webhooks

```typescript
// app/api/webhooks/ghl/route.ts
export async function POST(request: Request) {
  const payload = await request.json();
  
  switch (payload.type) {
    case 'ContactCreate':
      // Handle new contact
      break;
    case 'OpportunityStageUpdate':
      // Handle pipeline movement
      break;
    case 'AppointmentCreate':
      // Handle new booking
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

### Register Webhook in GHL

```typescript
async function registerWebhook(locationId: string, targetUrl: string) {
  await fetch('https://rest.gohighlevel.com/v1/webhooks/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locationId,
      url: targetUrl,
      events: ['ContactCreate', 'OpportunityStageUpdate', 'AppointmentCreate'],
    }),
  });
}
```

## Voice AI Integration

### Trigger Voice AI on Form Submit

```typescript
async function triggerVoiceAI(contactId: string, campaignId: string) {
  await fetch(`https://rest.gohighlevel.com/v1/contacts/${contactId}/campaigns/${campaignId}/trigger`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
    },
  });
}
```

## Pipeline Automation

### Auto-Stage Based on Page

```typescript
const PAGE_TO_STAGE: Record<string, string> = {
  '/pricing': 'qualified',
  '/book-demo': 'demo-requested',
  '/contact': 'new-lead',
};

async function addToPipeline(contactId: string, pipelineId: string, sourcePage: string) {
  const stageId = PAGE_TO_STAGE[sourcePage] || 'new-lead';
  
  await fetch(`https://rest.gohighlevel.com/v1/pipelines/${pipelineId}/opportunities`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contactId,
      pipelineStageId: stageId,
      name: `Website Lead - ${new Date().toISOString()}`,
    }),
  });
}
```

## Integration

This skill is standalone (no foundation dependencies).
Specific to agency workflow, not generally reusable.
```

---

## Phase 3: Workflow Orchestrator

### Updated SKILL.md (Replaces CLAUDE.md)

```markdown
---
name: anti-slop-website
description: Generate complete, distinctive Next.js + Sanity websites in one shot.
  Orchestrates design system generation, SEO optimization, CMS setup, and CRM integration.
  Use when building a new marketing website for a client.
---

# Anti-Slop Website Generator

## Overview

This workflow orchestrates multiple composition skills to generate a complete,
production-ready website.

## Pipeline

```
┌──────────────────┐     ┌────────────────────┐     ┌────────────────────────┐
│ anti-slop-design │ ──▶ │ local-seo-optimizer │ ──▶ │ sanity-website-generator│
│                  │     │                    │     │                        │
│ Output:          │     │ Output:            │     │ Output:                │
│ design-dna.json  │     │ schema config      │     │ Complete Next.js +     │
│                  │     │ sitemap setup      │     │ Sanity project         │
└──────────────────┘     └────────────────────┘     └────────────────────────┘
                                                               │
                                                               ▼
                                                    ┌────────────────────────┐
                                                    │gohighlevel-integration │
                                                    │                        │
                                                    │ Output:                │
                                                    │ CRM hooks configured   │
                                                    └────────────────────────┘
```

## Execution

### Step 1: Design System
```bash
# Invoke anti-slop-design skill
"Generate Design DNA for [business type] with personality: [keywords]"
```

Wait for design-dna.json output. Verify scores ≥3 on all criteria.

### Step 2: SEO Configuration
```bash
# Invoke local-seo-optimizer skill
"Configure local SEO for [business] in [location] using the generated Design DNA"
```

Wait for schema markup generation.

### Step 3: Project Scaffolding
```bash
# Invoke sanity-website-generator skill
"Generate Next.js + Sanity project using design-dna.json and SEO configuration"
```

Wait for project structure.

### Step 4: CRM Integration
```bash
# Invoke gohighlevel-integration skill
"Configure GoHighLevel integration for lead forms and automation"
```

### Step 5: Validation
Run automated checks:
```bash
npm run build          # Build verification
npm run test:a11y      # Accessibility
npm run lighthouse     # Performance + SEO
```

## Pass Criteria

| Check | Requirement |
|-------|-------------|
| Design DNA | All criteria ≥3 |
| Build | Successful, no errors |
| Accessibility | Zero axe-core violations |
| Lighthouse SEO | Score ≥90 |
| Lighthouse Performance | Score ≥80 |

## Error Handling

| Error | Resolution |
|-------|------------|
| Design DNA fails validation | Loop back to anti-slop-design (max 3 iterations) |
| Schema markup invalid | Re-run local-seo-optimizer |
| Build fails | Check for dependency issues, regenerate tailwind.config |
| CRM connection fails | Verify GHL API credentials |
```

---

## Implementation Instructions for Claude Code

Copy and execute:

```
PHASE 1: Create foundation skills from existing reference docs.

1. Create skills/foundation/color-theory/SKILL.md
   - Source: anti-slop-system/references/color-theory.md
   - Move scripts/generate-palette.ts to skills/foundation/color-theory/scripts/

2. Create skills/foundation/typography/SKILL.md
   - Source: anti-slop-system/references/font-alternatives.md

3. Create skills/foundation/anti-slop-constraints/SKILL.md
   - Source: anti-slop-system/references/anti-slop-constraints.md

4. Create skills/foundation/schema-markup/SKILL.md
   - Extract JSON-LD patterns from anti-slop-system/agents/seo-auditor.md
   - Add references/ folder with schema-by-industry.md

5. Create skills/foundation/accessibility/SKILL.md
   - Extract WCAG patterns from anti-slop-system/agents/
   - Move contrast checking logic

6. Create skills/foundation/motion-physics/SKILL.md
   - Extract spring configs from Design DNA schema and agents

PHASE 2: Create composition skills that invoke foundation.

7. Create skills/composition/anti-slop-design/SKILL.md
   - Merge Art Director + Critic agent logic
   - Reference foundation skills instead of inline knowledge
   - Move design-dna.schema.json to schemas/

8. Create skills/composition/local-seo-optimizer/SKILL.md
   - New skill, invokes schema-markup
   - Add local business specifics

9. Create skills/composition/gohighlevel-integration/SKILL.md
   - New skill, standalone
   - Add scripts for webhook creation

10. Create skills/composition/sanity-website-generator/SKILL.md
    - Merge Engineer agent with Sanity-specific patterns
    - Add assets/sanity-starter/ template

PHASE 3: Create workflow orchestrator.

11. Create skills/workflows/anti-slop-website/SKILL.md
    - Replace CLAUDE.md
    - Orchestrates composition skills
    - Contains no inline knowledge

After each skill creation, test:
- Skill metadata (name, description) is clear
- Dependencies are documented
- Can be invoked standalone
```

---

## Verification Checklist

After implementation, verify:

- [ ] Foundation skills can be invoked independently
- [ ] Composition skills correctly invoke foundation skills
- [ ] No knowledge duplication between skills
- [ ] Each skill has clear description for triggering
- [ ] Workflow orchestrator contains NO inline knowledge
- [ ] All existing functionality preserved
- [ ] Context window usage reduced (measure before/after)
