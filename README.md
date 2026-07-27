# SAMT — From Potential to Command
**Atmosphere Edition · v2.0 · Multi-file architecture**

An elite leadership programme concept site. Bilingual (English / العربية), zero dependencies beyond Google Fonts, no build step. WebGL atmosphere, kinetic typography, bearing-reticle cursor, cinematic intro.

---

## Project structure

| File | Role | Touch when… |
|---|---|---|
| `index.html` | Semantic markup, meta, structured data | Adding/removing sections |
| `styles.css` | Azimuth design system + motion + atmosphere UI | Changing look, spacing, motion feel |
| `i18n.js` | **All site copy**, both languages, as data | Editing any text — the file you'll touch most |
| `app.js` | Engine: instrument, reveals, tabs, language, WebGL, cursor, intro | Changing behavior |

Load order matters: `i18n.js` before `app.js` (already wired in `index.html`).

## Deploy

Upload all four files (plus this README, optionally) to the repository **root**. On every update, replace the changed files — text-only changes mean uploading `i18n.js` alone.

Keep `preview/approved-creative-reference.png` in place; social-share cards still point to it.

## Editing copy

Open `i18n.js`. Every visible string exists twice — once under `en:{}`, once under `ar:{}` — with identical keys. Edit values only; never delete a key from one language. Headline keys may contain `<br>` and `<em>`.

## The governing idea

**سَمْت** — the exact bearing; from its plural *as-sumūt* came *azimuth*. Everything derives from it: the scroll-linked bearing instrument (000°→360°), journey stages at true bearings, the intro's bearing-acquisition sequence, the doctrine interstitial, and the 360° circle closing at Admission.

## Design tokens

`--night #030A12` · `--ink #0A1626` · `--line #1B2B41` · `--bone #EDE6D6` · `--slate #97A6B8` · `--gold #C3A24A` · `--champagne #E9D9A6` — one easing family: `cubic-bezier(.22,1,.36,1)`.

**Type** — EN: Marcellus / Archivo / IBM Plex Mono · AR: Amiri / IBM Plex Sans Arabic. Arabic text carries zero letter-spacing (tracking breaks joining); display-scale سمت is unvocalized by design.

## Atmosphere systems (all in `app.js`)

WebGL fog + film grain + pointer glow (auto-fallback to CSS halo; static frame under reduced motion) · velocity-reactive marquee · parallax kinetic interstitial · magnetic buttons + reticle cursor (fine pointers only) · 000°→360° intro counter, skippable, ~2.7s.

## Quality floor

RTL via logical properties, LTR-isolated numerals · `prefers-reduced-motion` respected everywhere · reveal safety net (nothing stays hidden if observers fail) · keyboard-navigable tabs, skip link, focus states · no storage APIs.

---

*Concept website. Proposed partners and programme arrangements are subject to formal approval and agreement.*
