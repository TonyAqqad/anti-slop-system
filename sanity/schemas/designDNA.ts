/**
 * Sanity Schema: Design DNA Singleton
 *
 * This schema mirrors the design-dna.json structure so it can be exported
 * without additional mapping.
 *
 * Installation:
 * 1. Copy this file to your Sanity studio's schemas directory
 * 2. Import and add to your schema index
 * 3. Create the singleton document in Sanity Studio
 */

import { defineType, defineField } from 'sanity';

// Color field with OKLCH values
const oklchColorField = (name: string, title: string, isRequired: boolean = false) => defineField({
  name,
  title,
  type: 'object',
  validation: Rule => (isRequired ? Rule.required() : Rule),
  fields: [
    defineField({
      name: 'l',
      title: 'Lightness',
      type: 'number',
      validation: Rule => Rule.min(0).max(1).required(),
      description: '0 = black, 1 = white'
    }),
    defineField({
      name: 'c',
      title: 'Chroma',
      type: 'number',
      validation: Rule => Rule.min(0).max(0.4).required(),
      description: '0 = gray, 0.4 = maximum saturation'
    }),
    defineField({
      name: 'h',
      title: 'Hue',
      type: 'number',
      validation: Rule => Rule.min(0).max(360).required(),
      description: 'Hue angle in degrees (0-360)'
    }),
  ],
  options: {
    columns: 3
  }
});

const springConfigField = (name: string, title: string) => defineField({
  name,
  title,
  type: 'object',
  fields: [
    defineField({
      name: 'stiffness',
      title: 'Stiffness',
      type: 'number',
      validation: Rule => Rule.min(50).max(1000).required(),
      description: 'Higher = faster, snappier motion'
    }),
    defineField({
      name: 'damping',
      title: 'Damping',
      type: 'number',
      validation: Rule => Rule.min(1).max(100).required(),
      description: 'Higher = less oscillation'
    }),
    defineField({
      name: 'mass',
      title: 'Mass',
      type: 'number',
      validation: Rule => Rule.min(0.1).max(10).required(),
      initialValue: 1
    }),
  ]
});

export const designDNA = defineType({
  name: 'designDNA',
  title: 'Design DNA',
  type: 'document',

  // Singleton behavior
  __experimental_actions: ['update', 'publish'],

  groups: [
    { name: 'meta', title: 'Metadata' },
    { name: 'primitives', title: 'Primitives' },
    { name: 'generative', title: 'Generative' },
    { name: 'components', title: 'Components' },
  ],

  fields: [
    defineField({
      name: 'meta',
      title: 'Meta',
      type: 'object',
      group: 'meta',
      validation: Rule => Rule.required(),
      fields: [
        defineField({
          name: 'projectName',
          title: 'Project Name',
          type: 'string',
          validation: Rule => Rule.regex(/^[a-z0-9-]+$/).required(),
          description: 'Kebab-case project identifier'
        }),
        defineField({
          name: 'version',
          title: 'Version',
          type: 'string',
          initialValue: '1.0.0',
          validation: Rule => Rule.regex(/^\d+\.\d+\.\d+$/).required()
        }),
        defineField({
          name: 'personality',
          title: 'Personality Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          validation: Rule => Rule.min(2).max(5).required(),
          description: 'Specific aesthetic descriptors (avoid generic words like "modern")'
        }),
        defineField({
          name: 'antiPatterns',
          title: 'Anti-Patterns',
          type: 'array',
          of: [{ type: 'string' }],
          validation: Rule => Rule.min(1).required(),
          description: 'Aesthetic patterns to explicitly avoid'
        }),
      ]
    }),

    defineField({
      name: 'primitives',
      title: 'Primitives',
      type: 'object',
      group: 'primitives',
      validation: Rule => Rule.required(),
      fields: [
        defineField({
          name: 'color',
          title: 'Color System',
          type: 'object',
          validation: Rule => Rule.required(),
          fields: [
            defineField({
              name: 'model',
              title: 'Color Model',
              type: 'string',
              options: {
                list: [{ title: 'OKLCH', value: 'oklch' }]
              },
              initialValue: 'oklch',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'palette',
              title: 'Color Palette',
              type: 'object',
              validation: Rule => Rule.required(),
              fields: [
                oklchColorField('primary', 'Primary', true),
                oklchColorField('secondary', 'Secondary', true),
                oklchColorField('accent', 'Accent', true),
                oklchColorField('background', 'Background', true),
                oklchColorField('text', 'Text', true),
                oklchColorField('muted', 'Muted'),
                oklchColorField('border', 'Border'),
              ]
            }),
            defineField({
              name: 'contrastRatios',
              title: 'Contrast Ratios',
              type: 'object',
              validation: Rule => Rule.required(),
              fields: [
                defineField({
                  name: 'textOnBackground',
                  title: 'Text on Background',
                  type: 'number',
                  validation: Rule => Rule.min(4.5).required(),
                  description: 'Must be >= 4.5 for WCAG AA'
                }),
                defineField({
                  name: 'accentOnBackground',
                  title: 'Accent on Background',
                  type: 'number',
                  validation: Rule => Rule.min(3),
                  description: 'Must be >= 3 for UI components'
                }),
              ]
            }),
          ]
        }),

        defineField({
          name: 'typography',
          title: 'Typography System',
          type: 'object',
          validation: Rule => Rule.required(),
          fields: [
            defineField({
              name: 'scale',
              title: 'Typography Scale',
              type: 'object',
              validation: Rule => Rule.required(),
              fields: [
                defineField({
                  name: 'base',
                  title: 'Base Size (px)',
                  type: 'number',
                  validation: Rule => Rule.min(14).max(24).required(),
                  initialValue: 18
                }),
                defineField({
                  name: 'ratio',
                  title: 'Scale Ratio',
                  type: 'number',
                  validation: Rule => Rule.min(1.1).max(1.618).required(),
                  initialValue: 1.333
                }),
                defineField({
                  name: 'ratioName',
                  title: 'Ratio Name',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Minor Second (1.067)', value: 'minorSecond' },
                      { title: 'Major Second (1.125)', value: 'majorSecond' },
                      { title: 'Minor Third (1.2)', value: 'minorThird' },
                      { title: 'Major Third (1.25)', value: 'majorThird' },
                      { title: 'Perfect Fourth (1.333)', value: 'perfectFourth' },
                      { title: 'Augmented Fourth (1.414)', value: 'augmentedFourth' },
                      { title: 'Perfect Fifth (1.5)', value: 'perfectFifth' },
                      { title: 'Golden Ratio (1.618)', value: 'goldenRatio' },
                    ]
                  }
                }),
              ]
            }),
            defineField({
              name: 'families',
              title: 'Font Families',
              type: 'object',
              validation: Rule => Rule.required(),
              fields: [
                defineField({
                  name: 'heading',
                  title: 'Heading Font Stack',
                  type: 'array',
                  of: [{ type: 'string' }],
                  validation: Rule => Rule.min(2).required()
                }),
                defineField({
                  name: 'body',
                  title: 'Body Font Stack',
                  type: 'array',
                  of: [{ type: 'string' }],
                  validation: Rule => Rule.min(2).required()
                }),
                defineField({
                  name: 'mono',
                  title: 'Monospace Font Stack',
                  type: 'array',
                  of: [{ type: 'string' }]
                }),
              ]
            }),
            defineField({
              name: 'weights',
              title: 'Font Weights',
              type: 'object',
              fields: [
                defineField({
                  name: 'heading',
                  title: 'Heading Weights',
                  type: 'array',
                  of: [{ type: 'number' }]
                }),
                defineField({
                  name: 'body',
                  title: 'Body Weights',
                  type: 'array',
                  of: [{ type: 'number' }]
                }),
              ]
            }),
          ]
        }),

        defineField({
          name: 'motion',
          title: 'Motion System',
          type: 'object',
          validation: Rule => Rule.required(),
          fields: [
            defineField({
              name: 'springs',
              title: 'Spring Configurations',
              type: 'object',
              validation: Rule => Rule.required(),
              fields: [
                springConfigField('snappy', 'Snappy'),
                springConfigField('gentle', 'Gentle'),
                springConfigField('bouncy', 'Bouncy'),
                springConfigField('dramatic', 'Dramatic'),
              ]
            }),
            defineField({
              name: 'defaultSpring',
              title: 'Default Spring',
              type: 'string',
              options: {
                list: [
                  { title: 'Snappy', value: 'snappy' },
                  { title: 'Gentle', value: 'gentle' },
                  { title: 'Bouncy', value: 'bouncy' },
                  { title: 'Dramatic', value: 'dramatic' },
                ]
              },
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'reducedMotion',
              title: 'Reduced Motion Handling',
              type: 'string',
              options: {
                list: [
                  { title: 'Respect System Preference', value: 'respectSystem' },
                  { title: 'Always Reduce', value: 'alwaysReduce' },
                  { title: 'Ignore (Not Recommended)', value: 'ignore' },
                ]
              },
              initialValue: 'respectSystem',
              validation: Rule => Rule.required()
            }),
          ]
        }),

        defineField({
          name: 'geometry',
          title: 'Geometry System',
          type: 'object',
          validation: Rule => Rule.required(),
          fields: [
            defineField({
              name: 'borderRadius',
              title: 'Border Radius Scale',
              type: 'object',
              validation: Rule => Rule.required(),
              fields: [
                defineField({ name: 'none', type: 'string', initialValue: '0px' }),
                defineField({ name: 'sm', type: 'string', initialValue: '2px' }),
                defineField({ name: 'md', type: 'string', initialValue: '6px' }),
                defineField({ name: 'lg', type: 'string', initialValue: '12px' }),
                defineField({ name: 'xl', type: 'string', initialValue: '16px' }),
                defineField({ name: 'pill', type: 'string', initialValue: '9999px' }),
              ]
            }),
            defineField({
              name: 'radiusPersonality',
              title: 'Radius Personality',
              type: 'string',
              options: {
                list: [
                  { title: 'Sharp (0-4px)', value: 'sharp' },
                  { title: 'Soft (8-16px)', value: 'soft' },
                  { title: 'Organic (Variable)', value: 'organic' },
                  { title: 'Mixed Sharp-Soft', value: 'mixed-sharp-soft' },
                ]
              }
            }),
            defineField({
              name: 'spacing',
              title: 'Spacing System',
              type: 'object',
              validation: Rule => Rule.required(),
              fields: [
                defineField({
                  name: 'base',
                  title: 'Spacing Base Unit',
                  type: 'number',
                  options: {
                    list: [
                      { title: '4px', value: 4 },
                      { title: '8px', value: 8 },
                    ]
                  },
                  initialValue: 4,
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'scale',
                  title: 'Spacing Scale',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Linear (4, 8, 12, 16...)', value: 'linear' },
                      { title: 'Fibonacci (4, 8, 12, 20, 32...)', value: 'fibonacci' },
                      { title: 'Exponential (4, 8, 16, 32...)', value: 'exponential' },
                    ]
                  }
                }),
              ]
            }),
            defineField({
              name: 'aspectRatios',
              title: 'Aspect Ratios',
              type: 'object',
              fields: [
                defineField({ name: 'hero', type: 'string' }),
                defineField({ name: 'card', type: 'string' }),
                defineField({ name: 'thumbnail', type: 'string' }),
                defineField({ name: 'golden', type: 'string' }),
                defineField({ name: 'cinematic', type: 'string' }),
              ]
            }),
          ]
        }),
      ]
    }),

    defineField({
      name: 'generative',
      title: 'Generative',
      type: 'object',
      group: 'generative',
      validation: Rule => Rule.required(),
      fields: [
        defineField({
          name: 'noise',
          title: 'Noise',
          type: 'object',
          validation: Rule => Rule.required(),
          fields: [
            defineField({
              name: 'seed',
              title: 'Noise Seed',
              type: 'string',
              validation: Rule => Rule.min(8).required(),
              description: 'Unique seed for reproducible generative effects'
            }),
            defineField({
              name: 'layoutJitter',
              title: 'Layout Jitter',
              type: 'object',
              validation: Rule => Rule.required(),
              fields: [
                defineField({
                  name: 'maxOffset',
                  title: 'Max Offset (px)',
                  type: 'number',
                  validation: Rule => Rule.min(0).max(20).required(),
                  initialValue: 6
                }),
                defineField({
                  name: 'rotationRange',
                  title: 'Rotation Range (deg)',
                  type: 'array',
                  of: [{ type: 'number' }],
                  validation: Rule => Rule.length(2).required(),
                  initialValue: [-2, 2]
                }),
              ]
            }),
            defineField({
              name: 'colorVariation',
              title: 'Color Variation',
              type: 'object',
              fields: [
                defineField({
                  name: 'hueShift',
                  title: 'Hue Shift (deg)',
                  type: 'number',
                  validation: Rule => Rule.min(0).max(15),
                  initialValue: 5
                }),
                defineField({
                  name: 'lightnessVariation',
                  title: 'Lightness Variation',
                  type: 'number',
                  validation: Rule => Rule.min(0).max(0.1),
                  initialValue: 0.03
                }),
              ]
            }),
          ]
        })
      ]
    }),

    defineField({
      name: 'components',
      title: 'Components',
      type: 'object',
      group: 'components',
      fields: [
        defineField({
          name: 'hero',
          title: 'Hero',
          type: 'object',
          fields: [
            defineField({ name: 'layout', type: 'string' }),
            defineField({ name: 'imageStyle', type: 'string' }),
            defineField({ name: 'textAlignment', type: 'string' }),
            defineField({ name: 'animation', type: 'string' }),
          ]
        }),
        defineField({
          name: 'cards',
          title: 'Cards',
          type: 'object',
          fields: [
            defineField({ name: 'variant', type: 'string' }),
            defineField({ name: 'hoverEffect', type: 'string' }),
            defineField({ name: 'imageAspect', type: 'string' }),
            defineField({ name: 'radius', type: 'string' }),
          ]
        }),
        defineField({
          name: 'buttons',
          title: 'Buttons',
          type: 'object',
          fields: [
            defineField({
              name: 'primary',
              title: 'Primary Button',
              type: 'object',
              fields: [
                defineField({ name: 'style', type: 'string' }),
                defineField({ name: 'radius', type: 'string' }),
                defineField({ name: 'animation', type: 'string' }),
                defineField({ name: 'textTransform', type: 'string' }),
              ]
            }),
            defineField({
              name: 'secondary',
              title: 'Secondary Button',
              type: 'object',
              fields: [
                defineField({ name: 'style', type: 'string' }),
                defineField({ name: 'radius', type: 'string' }),
                defineField({ name: 'animation', type: 'string' }),
                defineField({ name: 'textTransform', type: 'string' }),
              ]
            }),
          ]
        }),
        defineField({
          name: 'navigation',
          title: 'Navigation',
          type: 'object',
          fields: [
            defineField({ name: 'style', type: 'string' }),
            defineField({ name: 'position', type: 'string' }),
            defineField({ name: 'blur', type: 'boolean' }),
            defineField({ name: 'borderBottom', type: 'boolean' }),
          ]
        }),
        defineField({
          name: 'footer',
          title: 'Footer',
          type: 'object',
          fields: [
            defineField({ name: 'layout', type: 'string' }),
            defineField({ name: 'background', type: 'string' }),
          ]
        }),
      ]
    }),
  ],

  preview: {
    select: {
      title: 'meta.projectName',
      subtitle: 'meta.version'
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Design DNA',
        subtitle: `v${subtitle || '1.0.0'}`
      };
    }
  }
});

// Export for schema index
export default designDNA;

/**
 * GROQ Query for fetching Design DNA in Next.js
 *
 * const DESIGN_DNA_QUERY = groq`
 *   *[_type == "designDNA"][0] {
 *     meta,
 *     primitives,
 *     generative,
 *     components
 *   }
 * `;
 */
