#!/usr/bin/env npx ts-node

/**
 * Design DNA Validation Script
 * Validates a design-dna.json file against the schema and anti-slop constraints
 * 
 * Usage: npx ts-node scripts/validate-dna.ts <path-to-design-dna.json>
 */

import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import chroma from 'chroma-js';

// Types
interface OKLCHColor {
  l: number;
  c: number;
  h: number;
}

interface DesignDNA {
  meta: {
    projectName: string;
    version: string;
    personality: string[];
    antiPatterns: string[];
  };
  primitives: {
    color: {
      model: string;
      palette: Record<string, OKLCHColor>;
      contrastRatios: {
        textOnBackground: number;
        accentOnBackground?: number;
      };
    };
    typography: {
      scale: {
        base: number;
        ratio: number;
        ratioName?: string;
      };
      families: {
        heading: string[];
        body: string[];
        mono?: string[];
      };
    };
    motion: {
      springs: Record<string, { stiffness: number; damping: number; mass: number }>;
      defaultSpring: string;
      reducedMotion: string;
    };
    geometry: {
      borderRadius: Record<string, string>;
      spacing: { base: number; scale?: string };
    };
  };
  generative: {
    noise: {
      seed: string;
      layoutJitter: { maxOffset: number; rotationRange: number[] };
      colorVariation?: { hueShift: number; lightnessVariation: number };
    };
  };
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  scores: Record<string, number>;
}

// Banned patterns
const BANNED_FONTS = [
  'inter', 'roboto', 'open sans', 'poppins', 'montserrat', 
  'lato', 'nunito', 'source sans pro', 'raleway', 'oswald'
];

const GENERIC_PERSONALITY_WORDS = [
  'modern', 'clean', 'professional', 'simple', 'elegant',
  'minimalist', 'sleek', 'beautiful', 'nice', 'good'
];

// Calculate WCAG contrast ratio
function getContrastRatio(color1: OKLCHColor, color2: OKLCHColor): number {
  return chroma.contrast(
    chroma.oklch(color1.l, color1.c, color1.h),
    chroma.oklch(color2.l, color2.c, color2.h)
  );
}

// Main validation function
function validateDesignDNA(dna: DesignDNA): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const scores: Record<string, number> = {};

  // 1. Validate Color System
  let colorScore = 4;
  
  if (dna.primitives.color.model !== 'oklch') {
    errors.push('Color model must be "oklch"');
    colorScore = 1;
  }
  
  const textColor = dna.primitives.color.palette.text;
  const bgColor = dna.primitives.color.palette.background;
  
  if (textColor && bgColor) {
    const calculatedContrast = getContrastRatio(textColor, bgColor);
    const statedContrast = dna.primitives.color.contrastRatios.textOnBackground;
    
    if (calculatedContrast < 4.5) {
      errors.push(`Text contrast ratio (${calculatedContrast.toFixed(2)}) fails WCAG AA (needs 4.5+)`);
      colorScore = 1;
    } else if (Math.abs(calculatedContrast - statedContrast) > 0.5) {
      warnings.push(`Stated contrast (${statedContrast}) differs from calculated (${calculatedContrast.toFixed(2)})`);
    }
    
    if (calculatedContrast >= 7) {
      colorScore = 4;
    } else if (calculatedContrast >= 4.5) {
      colorScore = 3;
    }
  }
  
  scores.colorSystem = colorScore;

  // 2. Validate Typography
  let typographyScore = 4;
  
  const headingFont = dna.primitives.typography.families.heading[0]?.toLowerCase();
  const bodyFont = dna.primitives.typography.families.body[0]?.toLowerCase();
  
  if (BANNED_FONTS.some(f => headingFont?.includes(f))) {
    errors.push(`Heading font "${headingFont}" is banned (too common)`);
    typographyScore = 1;
  }
  
  if (BANNED_FONTS.some(f => bodyFont?.includes(f))) {
    if (bodyFont !== 'inter') { // Inter OK as body only
      errors.push(`Body font "${bodyFont}" is banned (too common)`);
      typographyScore = Math.min(typographyScore, 2);
    }
  }
  
  if (!dna.primitives.typography.scale.ratio) {
    errors.push('Typography must define a modular scale ratio');
    typographyScore = 1;
  }
  
  if (dna.primitives.typography.families.heading.length < 2) {
    warnings.push('Heading font stack should include fallbacks');
  }
  
  scores.typographySystem = typographyScore;

  // 3. Validate Motion
  let motionScore = 4;
  
  if (!dna.primitives.motion.springs || Object.keys(dna.primitives.motion.springs).length === 0) {
    errors.push('Motion must define spring physics (not just easing)');
    motionScore = 1;
  }
  
  if (dna.primitives.motion.reducedMotion !== 'respectSystem') {
    warnings.push('Consider setting reducedMotion to "respectSystem" for accessibility');
    motionScore = Math.min(motionScore, 3);
  }
  
  const defaultSpring = dna.primitives.motion.springs?.[dna.primitives.motion.defaultSpring];
  if (!defaultSpring) {
    errors.push(`Default spring "${dna.primitives.motion.defaultSpring}" not found in springs`);
    motionScore = Math.min(motionScore, 2);
  }
  
  scores.motionSystem = motionScore;

  // 4. Validate Geometry
  let geometryScore = 4;
  
  const radiusValues = Object.values(dna.primitives.geometry.borderRadius);
  const uniqueRadii = new Set(radiusValues.filter(v => v !== '0px' && v !== '9999px'));
  
  if (uniqueRadii.size < 2) {
    warnings.push('Border radius should vary by component type');
    geometryScore = 3;
  }
  
  if (!dna.primitives.geometry.spacing?.base) {
    errors.push('Spacing must define a base unit');
    geometryScore = Math.min(geometryScore, 2);
  }
  
  scores.geometricSystem = geometryScore;

  // 5. Validate Uniqueness
  let uniquenessScore = 4;
  
  const genericPersonality = dna.meta.personality.filter(p => 
    GENERIC_PERSONALITY_WORDS.includes(p.toLowerCase())
  );
  
  if (genericPersonality.length > 0) {
    warnings.push(`Generic personality words detected: ${genericPersonality.join(', ')}`);
    uniquenessScore = Math.min(uniquenessScore, 2);
  }
  
  if (dna.meta.antiPatterns.length === 0) {
    errors.push('Must define at least one anti-pattern to avoid');
    uniquenessScore = Math.min(uniquenessScore, 2);
  }
  
  if (!dna.generative?.noise) {
    errors.push('Generative noise configuration is required');
    uniquenessScore = Math.min(uniquenessScore, 2);
  } else {
    if (!dna.generative.noise.seed) {
      errors.push('Generative noise must include a deterministic seed');
      uniquenessScore = Math.min(uniquenessScore, 2);
    }
    if (!dna.generative.noise.layoutJitter) {
      errors.push('Generative noise must include layoutJitter settings');
      uniquenessScore = Math.min(uniquenessScore, 2);
    }
  }
  
  scores.uniqueness = uniquenessScore;

  // 6. Technical Validity (schema already checked by Ajv)
  scores.technicalValidity = errors.length === 0 ? 4 : 2;

  // Calculate overall
  const allScores = Object.values(scores);
  const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
  const minScore = Math.min(...allScores);

  return {
    valid: minScore >= 3 && errors.length === 0,
    errors,
    warnings,
    scores
  };
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npx ts-node validate-dna.ts <path-to-design-dna.json>');
    process.exit(1);
  }
  
  const filePath = path.resolve(args[0]);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  let dna: DesignDNA;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    dna = JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    process.exit(1);
  }
  
  // Load and validate against schema
  const schemaPath = path.resolve(__dirname, '../schemas/design-dna.schema.json');
  if (fs.existsSync(schemaPath)) {
    const ajv = new Ajv({ allErrors: true });
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    const validate = ajv.compile(schema);
    
    if (!validate(dna)) {
      console.log('\n❌ Schema Validation Failed:\n');
      validate.errors?.forEach(err => {
        console.log(`  - ${err.instancePath}: ${err.message}`);
      });
      process.exit(1);
    }
  }
  
  // Run anti-slop validation
  const result = validateDesignDNA(dna);
  
  console.log('\n' + '='.repeat(60));
  console.log('  Design DNA Validation Report');
  console.log('='.repeat(60) + '\n');
  
  console.log('Scores:');
  Object.entries(result.scores).forEach(([criterion, score]) => {
    const emoji = score >= 3 ? '✅' : '❌';
    console.log(`  ${emoji} ${criterion}: ${score}/4`);
  });
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(e => console.log(`  - ${e}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`  Verdict: ${result.valid ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60) + '\n');
  
  process.exit(result.valid ? 0 : 1);
}

main().catch(console.error);
