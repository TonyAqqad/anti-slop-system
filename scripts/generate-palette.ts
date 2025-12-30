#!/usr/bin/env npx ts-node

import chroma from 'chroma-js';

/**
 * OKLCH Palette Generator
 * Generates accessible color palettes using OKLCH color space
 * 
 * Usage: 
 *   npx ts-node scripts/generate-palette.ts --hue 220 --mode analogous
 *   npx ts-node scripts/generate-palette.ts --hue 45 --mode monochromatic --dark
 */

interface OKLCHColor {
  l: number;
  c: number;
  h: number;
}

interface GeneratedPalette {
  primary: OKLCHColor;
  secondary: OKLCHColor;
  accent: OKLCHColor;
  background: OKLCHColor;
  text: OKLCHColor;
  muted: OKLCHColor;
  border: OKLCHColor;
}

type HarmonyMode = 'monochromatic' | 'analogous' | 'split-complementary' | 'triadic';

function getContrastRatio(color1: OKLCHColor, color2: OKLCHColor): number {
  return chroma.contrast(
    chroma.oklch(color1.l, color1.c, color1.h),
    chroma.oklch(color2.l, color2.c, color2.h)
  );
}

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

// Adjust color to meet contrast requirements
function ensureContrast(
  fg: OKLCHColor, 
  bg: OKLCHColor, 
  minRatio: number = 4.5
): OKLCHColor {
  let adjusted = { ...fg };
  let ratio = getContrastRatio(adjusted, bg);
  
  const direction = bg.l > 0.5 ? -1 : 1; // Darken for light bg, lighten for dark bg
  
  while (ratio < minRatio && adjusted.l > 0.05 && adjusted.l < 0.95) {
    adjusted.l += direction * 0.02;
    ratio = getContrastRatio(adjusted, bg);
  }
  
  return adjusted;
}

// Generate palette based on harmony mode
function generatePalette(
  baseHue: number, 
  mode: HarmonyMode,
  isDark: boolean = false
): GeneratedPalette {
  const h = normalizeHue(baseHue);
  
  let palette: GeneratedPalette;
  
  const bgL = isDark ? 0.12 : 0.98;
  const textL = isDark ? 0.92 : 0.18;
  const bgC = isDark ? 0.02 : 0.01;
  
  switch (mode) {
    case 'monochromatic':
      palette = {
        primary: { l: isDark ? 0.65 : 0.45, c: 0.15, h },
        secondary: { l: isDark ? 0.55 : 0.55, c: 0.10, h },
        accent: { l: isDark ? 0.70 : 0.55, c: 0.20, h: normalizeHue(h + 180) },
        background: { l: bgL, c: bgC, h },
        text: { l: textL, c: 0.02, h },
        muted: { l: isDark ? 0.35 : 0.65, c: 0.04, h },
        border: { l: isDark ? 0.25 : 0.85, c: 0.02, h }
      };
      break;
      
    case 'analogous':
      palette = {
        primary: { l: isDark ? 0.65 : 0.45, c: 0.15, h },
        secondary: { l: isDark ? 0.60 : 0.50, c: 0.12, h: normalizeHue(h + 30) },
        accent: { l: isDark ? 0.70 : 0.55, c: 0.18, h: normalizeHue(h - 30) },
        background: { l: bgL, c: bgC, h },
        text: { l: textL, c: 0.02, h },
        muted: { l: isDark ? 0.35 : 0.65, c: 0.04, h: normalizeHue(h + 15) },
        border: { l: isDark ? 0.25 : 0.85, c: 0.02, h }
      };
      break;
      
    case 'split-complementary':
      const complement = normalizeHue(h + 180);
      palette = {
        primary: { l: isDark ? 0.65 : 0.45, c: 0.15, h },
        secondary: { l: isDark ? 0.60 : 0.52, c: 0.12, h: normalizeHue(complement + 30) },
        accent: { l: isDark ? 0.70 : 0.58, c: 0.18, h: normalizeHue(complement - 30) },
        background: { l: bgL, c: bgC, h },
        text: { l: textL, c: 0.02, h },
        muted: { l: isDark ? 0.35 : 0.65, c: 0.04, h },
        border: { l: isDark ? 0.25 : 0.85, c: 0.02, h }
      };
      break;
      
    case 'triadic':
      palette = {
        primary: { l: isDark ? 0.65 : 0.45, c: 0.15, h },
        secondary: { l: isDark ? 0.60 : 0.50, c: 0.12, h: normalizeHue(h + 120) },
        accent: { l: isDark ? 0.70 : 0.55, c: 0.18, h: normalizeHue(h + 240) },
        background: { l: bgL, c: bgC, h },
        text: { l: textL, c: 0.02, h: normalizeHue(h + 120) },
        muted: { l: isDark ? 0.35 : 0.65, c: 0.04, h },
        border: { l: isDark ? 0.25 : 0.85, c: 0.02, h }
      };
      break;
  }
  
  // Ensure text contrast
  palette.text = ensureContrast(palette.text, palette.background, 7.0);
  palette.primary = ensureContrast(palette.primary, palette.background, 4.5);
  
  return palette;
}

function formatColor(color: OKLCHColor): { oklch: string; hex: string } {
  const swatch = chroma.oklch(color.l, color.c, color.h);
  return {
    oklch: `oklch(${(color.l * 100).toFixed(1)}% ${color.c.toFixed(3)} ${color.h.toFixed(1)})`,
    hex: swatch.hex()
  };
}

function generateDNAFragment(
  baseHue: number, 
  mode: HarmonyMode, 
  isDark: boolean
): object {
  const palette = generatePalette(baseHue, mode, isDark);
  
  const contrastRatios = {
    textOnBackground: getContrastRatio(palette.text, palette.background),
    primaryOnBackground: getContrastRatio(palette.primary, palette.background),
    accentOnBackground: getContrastRatio(palette.accent, palette.background)
  };
  
  return {
    color: {
      model: 'oklch',
      palette: Object.fromEntries(
        Object.entries(palette).map(([name, color]) => [
          name,
          { l: Number(color.l.toFixed(3)), c: Number(color.c.toFixed(3)), h: Number(color.h.toFixed(1)) }
        ])
      ),
      contrastRatios: {
        textOnBackground: Number(contrastRatios.textOnBackground.toFixed(2)),
        primaryOnBackground: Number(contrastRatios.primaryOnBackground.toFixed(2)),
        accentOnBackground: Number(contrastRatios.accentOnBackground.toFixed(2))
      }
    }
  };
}

// CLI
function main() {
  const args = process.argv.slice(2);
  
  let hue = 220;
  let mode: HarmonyMode = 'split-complementary';
  let isDark = false;
  let outputFormat: 'preview' | 'json' | 'css' = 'preview';
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--hue':
      case '-h':
        hue = parseInt(args[++i]) || 220;
        break;
      case '--mode':
      case '-m':
        mode = (args[++i] as HarmonyMode) || 'split-complementary';
        break;
      case '--dark':
      case '-d':
        isDark = true;
        break;
      case '--json':
        outputFormat = 'json';
        break;
      case '--css':
        outputFormat = 'css';
        break;
      case '--help':
        console.log(`
OKLCH Palette Generator

Usage:
  npx ts-node generate-palette.ts [options]

Options:
  --hue, -h <number>     Base hue (0-360, default: 220)
  --mode, -m <mode>      Harmony mode (default: split-complementary)
                         Options: monochromatic, analogous, split-complementary, triadic
  --dark, -d             Generate dark mode palette
  --json                 Output as Design DNA JSON fragment
  --css                  Output as CSS variables
  --help                 Show this help

Examples:
  npx ts-node generate-palette.ts --hue 45 --mode analogous
  npx ts-node generate-palette.ts --hue 180 --mode triadic --dark --json
        `);
        process.exit(0);
    }
  }
  
  const palette = generatePalette(hue, mode, isDark);
  
  console.log('\n' + '='.repeat(60));
  console.log(`  OKLCH Palette Generator`);
  console.log(`  Hue: ${hue}° | Mode: ${mode} | Theme: ${isDark ? 'Dark' : 'Light'}`);
  console.log('='.repeat(60) + '\n');
  
  if (outputFormat === 'json') {
    console.log(JSON.stringify(generateDNAFragment(hue, mode, isDark), null, 2));
  } else if (outputFormat === 'css') {
    console.log(':root {');
    Object.entries(palette).forEach(([name, color]) => {
      const formatted = formatColor(color);
      console.log(`  --color-${name}: ${formatted.hex}; /* ${formatted.oklch} */`);
    });
    console.log('}');
  } else {
    // Preview mode
    Object.entries(palette).forEach(([name, color]) => {
      const formatted = formatColor(color);
      const contrast = name === 'text' || name === 'primary' 
        ? ` (contrast: ${getContrastRatio(color, palette.background).toFixed(2)}:1)`
        : '';
      console.log(`${name.padEnd(12)} ${formatted.hex}  ${formatted.oklch}${contrast}`);
    });
    
    console.log('\nContrast Ratios:');
    console.log(`  Text on Background:    ${getContrastRatio(palette.text, palette.background).toFixed(2)}:1 ${getContrastRatio(palette.text, palette.background) >= 7 ? '✅ AAA' : getContrastRatio(palette.text, palette.background) >= 4.5 ? '✅ AA' : '❌ Fail'}`);
    console.log(`  Primary on Background: ${getContrastRatio(palette.primary, palette.background).toFixed(2)}:1 ${getContrastRatio(palette.primary, palette.background) >= 4.5 ? '✅ AA' : '❌ Fail'}`);
    console.log(`  Accent on Background:  ${getContrastRatio(palette.accent, palette.background).toFixed(2)}:1 ${getContrastRatio(palette.accent, palette.background) >= 3 ? '✅ UI' : '❌ Fail'}`);
  }
  
  console.log('');
}

main();
