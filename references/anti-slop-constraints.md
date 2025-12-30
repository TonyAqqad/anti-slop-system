# Anti-Slop Design Constraints

This document defines patterns to AVOID and patterns to ENFORCE when generating Design DNA. Reference this before and during the Art Director phase.

## Absolute Bans (Auto-Fail)

### Typography Bans

**BANNED PRIMARY FONTS** (>5% Google Fonts market share):
- Inter
- Roboto
- Open Sans
- Poppins
- Montserrat
- Lato
- Nunito
- Source Sans Pro
- Raleway
- Oswald

**APPROVED FONT CATEGORIES** (distinctive alternatives):
| Use Case | Recommended Fonts |
|----------|-------------------|
| Elegant Serif | Fraunces, Instrument Serif, Libre Baskerville, Cormorant |
| Modern Sans | Satoshi, General Sans, Cabinet Grotesk, Switzer |
| Geometric Sans | Space Grotesk, Outfit, Syne, Urbanist |
| Display | Clash Display, Zodiak, Boska, Chillax |
| Editorial | PP Neue Montreal, ABC Favorit, GT America |
| Humanist | Source Serif 4, Newsreader, Bitter |

### Color Bans

**BANNED COLOR PATTERNS**:
```
# The "SaaS Gradient" - immediately recognizable as AI
#667eea → #764ba2  (blue-purple)
#6366f1 → #8b5cf6  (indigo-violet)
#3b82f6 → #8b5cf6  (blue-violet)

# Generic grays
#808080 (exact 50% gray)
#888888, #999999, #666666 (web-safe grays)

# Pure black/white without warmth
#000000 on #ffffff (add slight tint)

# Tailwind defaults used verbatim
bg-blue-500, bg-indigo-600, etc.
```

**REQUIRED COLOR APPROACH**:
- Use OKLCH color model (perceptually uniform)
- Calculate contrast ratios programmatically
- Add subtle hue tint to neutrals (not pure gray)
- Vary chroma intentionally (not all colors at same saturation)

### Layout Bans

**BANNED HERO PATTERNS**:
- ❌ Centered headline + subhead + CTA + floating 3D mockup
- ❌ Split layout with text left, dashboard screenshot right
- ❌ Full-width gradient background with white text
- ❌ Animated blob shapes in background
- ❌ "Trusted by" logo bar immediately below hero

**BANNED SECTION PATTERNS**:
- ❌ Three equal-width cards with icons above headlines
- ❌ Alternating image-left/image-right feature sections
- ❌ Testimonial carousel with avatar + quote + name/title
- ❌ Pricing table with "Most Popular" badge
- ❌ FAQ accordion with identical styling

**BANNED CTA COPY**:
- "Get Started"
- "Sign Up Free"
- "Start Your Free Trial"
- "Book a Demo"
- "Learn More"

### Shadow Bans

**BANNED SHADOW VALUES**:
```css
/* These are immediately recognizable as defaults */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
```

**APPROVED SHADOW APPROACH**:
- Use colored shadows (tinted with primary/accent hue)
- Vary blur and spread intentionally
- Consider glow effects for dark themes
- Use `box-shadow` stacking for depth

### Motion Bans

**BANNED MOTION PATTERNS**:
- ❌ `ease-in-out` for everything
- ❌ `transition: all 0.3s`
- ❌ Fade-up on scroll without spring physics
- ❌ Hover scale without proper easing
- ❌ Ignoring `prefers-reduced-motion`

---

## Required Patterns (Must Include)

### Accessibility Requirements

**WCAG 2.1 AA Compliance**:
- Text contrast ratio ≥ 4.5:1 (normal text)
- Text contrast ratio ≥ 3:1 (large text, 18px+ or 14px+ bold)
- UI component contrast ≥ 3:1
- Focus indicators visible
- Touch targets ≥ 44x44px

**Motion Accessibility**:
```typescript
// REQUIRED: Check and respect user preference
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// REQUIRED: Provide motion toggle
<MotionProvider reducedMotion={userPreference || prefersReducedMotion}>
```

### Spring Physics Requirements

Every animation MUST use spring physics:

```typescript
// REQUIRED structure in Design DNA
"motion": {
  "springs": {
    "default": { "stiffness": 120, "damping": 14, "mass": 1 }
  }
}

// BANNED: duration-only animations
transition={{ duration: 0.3 }} // ❌
transition={{ type: "spring", stiffness: 120, damping: 14 }} // ✓
```

### Generative Variation Requirements

Every project MUST include noise-based variation:

```typescript
// REQUIRED: Seed-based deterministic noise
"generative": {
  "noise": {
    "seed": "unique-project-identifier",
    "layoutJitter": { ... }
  }
}
```

This ensures:
- Each project looks unique
- Results are reproducible
- Controlled chaos, not random chaos

### Typography Scale Requirements

```typescript
// REQUIRED: Modular scale
"typography": {
  "scale": {
    "base": 16-20,
    "ratio": 1.2-1.618
  }
}

// BANNED: Arbitrary font sizes
fontSize: ["14px", "16px", "20px", "32px"] // ❌ No ratio
```

---

## Uniqueness Verification Checklist

Before approving Design DNA, verify:

### Visual Distinction
- [ ] Primary font has <5% market share
- [ ] Color palette not achievable with Tailwind defaults
- [ ] At least one "unexpected" design choice
- [ ] Would a designer screenshot this for inspiration?

### Technical Validity
- [ ] All contrast ratios calculated and passing
- [ ] Spring physics defined (not just easing)
- [ ] Reduced motion handling specified
- [ ] Generative seed is unique

### Anti-Pattern Scan
- [ ] No banned fonts used
- [ ] No banned color patterns
- [ ] No banned layout patterns
- [ ] No banned shadow values

### Personality Check
- [ ] Personality keywords are specific (not "modern", "clean")
- [ ] Anti-patterns list is populated
- [ ] Design choices support stated personality

---

## Good vs Bad Examples

### Color: Bad
```json
{
  "primary": "#3b82f6",
  "secondary": "#64748b",
  "accent": "#8b5cf6"
}
```
**Why bad**: Exact Tailwind values, blue-purple SaaS look

### Color: Good
```json
{
  "primary": { "l": 0.45, "c": 0.14, "h": 165 },
  "secondary": { "l": 0.55, "c": 0.08, "h": 145 },
  "accent": { "l": 0.62, "c": 0.22, "h": 35 }
}
```
**Why good**: OKLCH model, non-blue primary, warm accent contrast

### Typography: Bad
```json
{
  "heading": ["Inter", "sans-serif"],
  "body": ["Inter", "sans-serif"]
}
```
**Why bad**: Banned font, no pairing contrast

### Typography: Good
```json
{
  "heading": ["Instrument Serif", "Georgia", "serif"],
  "body": ["Satoshi", "system-ui", "sans-serif"]
}
```
**Why good**: Distinctive fonts, serif/sans pairing, proper fallbacks

### Motion: Bad
```json
{
  "transition": "all 0.3s ease-in-out"
}
```
**Why bad**: No spring physics, generic easing

### Motion: Good
```json
{
  "springs": {
    "snappy": { "stiffness": 400, "damping": 30, "mass": 1 },
    "gentle": { "stiffness": 120, "damping": 14, "mass": 1 }
  },
  "reducedMotion": "respectSystem"
}
```
**Why good**: Spring physics, multiple variants, accessibility

---

## Escape Hatches

Some banned patterns are acceptable IF:

1. **Banned font OK if**: Client specifically requires it (document in meta.notes)
2. **Centered hero OK if**: Using asymmetric element sizing or unconventional composition
3. **Three cards OK if**: Cards have significantly different sizes, angles, or treatments
4. **Gradient OK if**: Not blue-purple and using OKLCH interpolation

Document any exception in `meta.exceptions` with justification.
