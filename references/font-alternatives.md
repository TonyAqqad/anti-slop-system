# Non-Generic Font Pairings

Curated font combinations that avoid the overused defaults. All fonts available on Google Fonts or Fontshare (free).

## Pairing Strategies

### 1. Serif Heading + Geometric Sans Body
**Personality**: Authoritative, Editorial, Premium

| Heading | Body | Best For |
|---------|------|----------|
| Fraunces | Space Grotesk | Artisan brands, luxury |
| Instrument Serif | Inter (only as body) | Publishing, editorial |
| Cormorant Garamond | Outfit | Fashion, beauty |
| Libre Baskerville | Karla | Law, finance, consulting |
| Playfair Display | Source Sans 3 | Hospitality, events |
| DM Serif Display | DM Sans | SaaS (elevated) |

### 2. Display Heading + Humanist Body
**Personality**: Bold, Contemporary, Statement

| Heading | Body | Best For |
|---------|------|----------|
| Clash Display | Satoshi | Tech startups, creative |
| Syne | General Sans | Music, entertainment |
| Cabinet Grotesk | Switzer | Agencies, portfolios |
| Archivo Black | Archivo | Sports, fitness |
| Bebas Neue | Source Sans 3 | Events, promotions |
| Unbounded | Nunito Sans | Gaming, apps |

### 3. Grotesque Heading + Readable Body
**Personality**: Modern, Professional, Clean (without being generic)

| Heading | Body | Best For |
|---------|------|----------|
| Space Grotesk | IBM Plex Sans | Developer tools |
| Darker Grotesque | Work Sans | Healthcare, education |
| Manrope | Lexend | Accessibility-focused |
| Plus Jakarta Sans | Figtree | Modern SaaS |
| Urbanist | Nunito | Consumer apps |

### 4. Variable Font Single Family
**Personality**: Cutting-edge, Cohesive, Technical

| Font | Axes | Best For |
|------|------|----------|
| Fraunces | opsz, wght, SOFT, WONK | High-end editorial |
| Recursive | wght, slnt, CASL, MONO | Developer, technical |
| Roboto Flex | wght, wdth, slnt, GRAD, XOPQ, XTRA, YOPQ, YTAS, YTDE, YTFI, YTLC, YTUC | Google ecosystem |
| Inter | wght, slnt | (Use sparingly, only for body) |

### 5. Quirky/Characterful Pairings
**Personality**: Playful, Distinctive, Memorable

| Heading | Body | Best For |
|---------|------|----------|
| Bricolage Grotesque | Atkinson Hyperlegible | Inclusive design |
| Young Serif | Figtree | Friendly SaaS |
| Anybody | Onest | Gen Z brands |
| Gloock | Instrument Sans | Coffee shops, artisan |
| Bodoni Moda | Karla | Luxury e-commerce |

---

## Google Fonts Market Share Reference

**AVOID as primary** (>2% usage):
1. Roboto (28%)
2. Open Sans (18%)
3. Lato (7%)
4. Montserrat (6%)
5. Poppins (5%)
6. Oswald (4%)
7. Source Sans Pro (3%)
8. Raleway (3%)
9. Inter (3%)
10. Noto Sans (2%)

**SAFE choices** (<1% usage):
- Fraunces (0.1%)
- Space Grotesk (0.4%)
- Instrument Serif (0.2%)
- Cabinet Grotesk (0.1%)
- Satoshi (Fontshare)
- General Sans (Fontshare)

---

## Font Loading Configuration

### Next.js with next/font

```typescript
// app/fonts.ts
import { Fraunces, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const heading = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  axes: ['opsz', 'SOFT', 'WONK'], // Variable font axes
});

const body = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const fonts = {
  className: `${heading.variable} ${body.variable} ${mono.variable}`,
  heading,
  body,
  mono,
};
```

### Fontshare via CSS

```css
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=cabinet-grotesk@700,800&display=swap');

:root {
  --font-body: 'Satoshi', system-ui, sans-serif;
  --font-heading: 'Cabinet Grotesk', system-ui, sans-serif;
}
```

---

## Pairing Selection Guide

### By Industry

| Industry | Recommended Pairing | Rationale |
|----------|---------------------|-----------|
| Legal/Finance | Libre Baskerville + Karla | Traditional authority + modern readability |
| Tech/SaaS | Space Grotesk + IBM Plex Sans | Technical but warm |
| Creative/Agency | Clash Display + Satoshi | Bold statement + clean body |
| Healthcare | Manrope + Lexend | Accessible, trustworthy |
| E-commerce/Fashion | Cormorant Garamond + Outfit | Elegant + modern |
| Food/Hospitality | Gloock + Figtree | Characterful + friendly |
| Education | Darker Grotesque + Work Sans | Approachable + readable |
| Real Estate | DM Serif Display + DM Sans | Premium + professional |

### By Personality

| Desired Feel | Heading Style | Body Style |
|--------------|---------------|------------|
| Trustworthy | Serif (old-style) | Humanist sans |
| Innovative | Geometric display | Grotesque |
| Friendly | Rounded sans | Humanist sans |
| Luxury | High-contrast serif | Light geometric |
| Technical | Monospace or geometric | Monospace or grotesque |
| Editorial | Variable serif | Variable serif |
| Playful | Display/decorative | Rounded sans |

---

## Anti-Pattern Alert

**DO NOT** create these common AI pairings:
- Inter + Inter (no pairing contrast)
- Poppins + Open Sans (both too common)
- Montserrat + Roboto (Google Docs default)
- Any Display font + same Display font for body
- Thin weights (300) as body text
