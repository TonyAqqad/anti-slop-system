# OKLCH Color Theory for Generative Design

This document explains how to generate distinctive, accessible color palettes using the OKLCH color model.

## Why OKLCH?

**OKLCH** (Oklab Lightness, Chroma, Hue) is perceptually uniform:
- Equal steps in L produce equal perceived lightness changes
- Colors with same L have same perceived brightness (unlike HSL)
- Interpolation produces natural-looking gradients

**HSL Problems** (why we avoid it):
- Yellow at 50% L looks much brighter than blue at 50% L
- Saturated colors appear "neon" unexpectedly
- Gradients through HSL look unnatural

---

## OKLCH Value Ranges

```
L (Lightness): 0 to 1
  - 0 = black
  - 0.5 = mid-tone
  - 1 = white
  
C (Chroma): 0 to ~0.4
  - 0 = gray/neutral
  - 0.15 = typical saturated color
  - 0.3+ = extremely vivid (may be out of sRGB gamut)
  
H (Hue): 0 to 360 degrees
  - 0/360 = red
  - 30 = orange
  - 60 = yellow
  - 120 = green
  - 180 = cyan
  - 240 = blue
  - 300 = magenta/purple
```

---

## Palette Generation Strategies

### 1. Monochromatic with Accent

**Structure**: Single hue at varying L/C + one complementary accent

```javascript
function generateMonochromatic(baseHue, accentHue) {
  return {
    primary: { l: 0.45, c: 0.15, h: baseHue },
    secondary: { l: 0.55, c: 0.10, h: baseHue },
    tertiary: { l: 0.65, c: 0.06, h: baseHue },
    accent: { l: 0.60, c: 0.20, h: accentHue }, // +180° for complementary
    background: { l: 0.98, c: 0.01, h: baseHue },
    text: { l: 0.20, c: 0.02, h: baseHue }
  };
}

// Example: Warm gray with orange accent
generateMonochromatic(60, 30);
```

**Best for**: Professional services, luxury, editorial

### 2. Analogous Harmony

**Structure**: Three adjacent hues (30-60° apart)

```javascript
function generateAnalogous(centerHue) {
  return {
    primary: { l: 0.45, c: 0.15, h: centerHue },
    secondary: { l: 0.50, c: 0.12, h: (centerHue + 30) % 360 },
    accent: { l: 0.55, c: 0.18, h: (centerHue - 30 + 360) % 360 },
    background: { l: 0.97, c: 0.01, h: centerHue },
    text: { l: 0.22, c: 0.02, h: centerHue }
  };
}

// Example: Forest (green center)
generateAnalogous(140);
```

**Best for**: Nature brands, wellness, organic products

### 3. Split-Complementary

**Structure**: Base hue + two hues adjacent to complement

```javascript
function generateSplitComplementary(baseHue) {
  const complement = (baseHue + 180) % 360;
  return {
    primary: { l: 0.45, c: 0.15, h: baseHue },
    secondary: { l: 0.55, c: 0.12, h: (complement + 30) % 360 },
    accent: { l: 0.60, c: 0.18, h: (complement - 30 + 360) % 360 },
    background: { l: 0.98, c: 0.01, h: baseHue },
    text: { l: 0.20, c: 0.02, h: baseHue }
  };
}

// Example: Teal with warm accents
generateSplitComplementary(180);
```

**Best for**: Creative agencies, tech with personality

### 4. Triadic

**Structure**: Three hues 120° apart

```javascript
function generateTriadic(baseHue) {
  return {
    primary: { l: 0.45, c: 0.15, h: baseHue },
    secondary: { l: 0.50, c: 0.12, h: (baseHue + 120) % 360 },
    accent: { l: 0.55, c: 0.18, h: (baseHue + 240) % 360 },
    background: { l: 0.97, c: 0.02, h: baseHue },
    text: { l: 0.18, c: 0.02, h: (baseHue + 120) % 360 }
  };
}

// Example: Primary triad
generateTriadic(0); // Red, Green, Blue (but sophisticated)
```

**Best for**: Playful brands, children's products, entertainment

---

## Contrast Calculation

### WCAG Requirements

| Use Case | Minimum Ratio |
|----------|---------------|
| Normal text | 4.5:1 |
| Large text (18px+ or 14px+ bold) | 3:1 |
| UI components & graphics | 3:1 |
| AAA normal text | 7:1 |
| AAA large text | 4.5:1 |

### Implementation with chroma-js

```javascript
import chroma from 'chroma-js';

function oklchToChroma(l, c, h) {
  return chroma.oklch(l, c, h);
}

function getContrastRatio(color1, color2) {
  return chroma.contrast(color1, color2);
}

function ensureContrast(foreground, background, minRatio = 4.5) {
  let fg = oklchToChroma(foreground.l, foreground.c, foreground.h);
  const bg = oklchToChroma(background.l, background.c, background.h);
  
  let ratio = getContrastRatio(fg, bg);
  
  // Adjust lightness until contrast is met
  while (ratio < minRatio && foreground.l > 0.05) {
    foreground.l -= 0.02;
    fg = oklchToChroma(foreground.l, foreground.c, foreground.h);
    ratio = getContrastRatio(fg, bg);
  }
  
  return { color: foreground, ratio };
}

// Usage
const text = { l: 0.30, c: 0.02, h: 220 };
const bg = { l: 0.98, c: 0.01, h: 220 };
const { color, ratio } = ensureContrast(text, bg, 7.0); // AAA target
console.log(`Adjusted text L: ${color.l}, Contrast: ${ratio.toFixed(2)}:1`);
```

---

## Generative Color Variation

Add organic variation to repeated elements:

```javascript
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

function generateColorVariation(baseColor, seed, index) {
  const noise = createNoise2D(alea(seed));
  const hueShift = 5; // max degrees
  const lightnessVar = 0.03; // max L variation
  
  return {
    l: baseColor.l + (noise(index, 0) * lightnessVar),
    c: baseColor.c, // Keep chroma stable for accessibility
    h: (baseColor.h + (noise(index, 1) * hueShift) + 360) % 360
  };
}

// Each card gets slightly different color
cards.map((card, i) => ({
  ...card,
  backgroundColor: generateColorVariation(accent, 'project-seed', i)
}));
```

---

## Dark Mode Transformation

Flip lightness while preserving hue relationships:

```javascript
function toDarkMode(palette) {
  return Object.fromEntries(
    Object.entries(palette).map(([name, color]) => {
      let newL;
      if (name === 'background') {
        newL = 0.12; // Dark background
      } else if (name === 'text') {
        newL = 0.92; // Light text
      } else {
        // Invert around 0.5, adjust for visibility
        newL = 1 - color.l + 0.1;
        newL = Math.max(0.3, Math.min(0.85, newL));
      }
      
      return [name, { ...color, l: newL }];
    })
  );
}
```

---

## Avoiding "AI Slop" Colors

### Banned Combinations (in OKLCH terms)

```javascript
const BANNED_PALETTES = [
  // Blue-purple SaaS gradient
  { primary: { h: 250-270 }, accent: { h: 280-300 } },
  
  // Generic blue with gray
  { primary: { l: 0.45-0.55, c: 0.1-0.2, h: 230-250 } },
  
  // Startup neon
  { accent: { c: 0.25+, h: 140-180 } }, // Neon green/cyan
];

function isPaletteBanned(palette) {
  // Check against banned combinations
  // Return true if matches any pattern
}
```

### Approved Distinctive Hue Regions

| Region | Hue Range | Personality |
|--------|-----------|-------------|
| Terracotta | 20-35 | Warm, earthy, artisan |
| Ochre/Mustard | 70-85 | Vintage, bold, creative |
| Forest | 130-150 | Natural, calm, organic |
| Teal | 175-195 | Fresh, modern (not overused if paired well) |
| Plum | 310-330 | Luxurious, bold, distinctive |
| Coral | 15-25 | Warm, friendly, energetic |

### Neutral Tinting

**Never use pure gray.** Always add subtle hue:

```javascript
function createTintedNeutral(hue, lightness) {
  return {
    l: lightness,
    c: 0.01 + (1 - lightness) * 0.02, // Slightly more chroma in darker shades
    h: hue
  };
}

// Warm neutrals (tinted with orange)
const warmGray = createTintedNeutral(45, 0.5);

// Cool neutrals (tinted with blue)
const coolGray = createTintedNeutral(230, 0.5);
```

---

## Complete Palette Generator

```typescript
// scripts/generate-palette.ts
import chroma from 'chroma-js';

interface OKLCHColor {
  l: number;
  c: number;
  h: number;
}

interface Palette {
  primary: OKLCHColor;
  secondary: OKLCHColor;
  accent: OKLCHColor;
  background: OKLCHColor;
  text: OKLCHColor;
  contrastRatios: {
    textOnBackground: number;
    accentOnBackground: number;
  };
}

function generatePalette(
  primaryHue: number,
  strategy: 'monochromatic' | 'analogous' | 'split-complementary' | 'triadic'
): Palette {
  // Implementation based on strategy
  // Always verify contrast and adjust
}

// CLI usage
const hue = parseInt(process.argv[2]) || 180;
const strategy = process.argv[3] || 'monochromatic';
console.log(JSON.stringify(generatePalette(hue, strategy), null, 2));
```

Run: `npx ts-node scripts/generate-palette.ts 220 split-complementary`
