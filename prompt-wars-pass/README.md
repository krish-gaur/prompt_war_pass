# Prompt Wars — Pass Generator

**Your Prompt Wars identity starts here.** Create your personalized participant pass and show the
world you're part of Prompt Wars.

A premium, fully client-side web app for **Prompt Wars 2026** — the Workshop + Build-A-Thon by
**AlGlorythm** (12 December 2026, Thoughtworks Technologies, sponsored by OSEN + Craftora).
Participants upload a photo, add their name and college, and download a share-worthy 1024 × 1536
identity pass in under a minute.

---

## ✨ Features

- **Original master artwork** — the project owner's 1024 × 1536 Prompt Wars reference image is used
  directly as the pass background. The original logos, liquid graphics, neon borders, typography,
  photo frame, badge and tagline are preserved pixel-for-pixel. Only the participant photo, name and
  college are overlaid — no redrawing, no AI recreation, no design drift.
- **Photo upload with crop & zoom** — JPG / JPEG / PNG / WEBP up to 5 MB, drag & drop or file
  picker, reposition + zoom + replace, clipped perfectly inside the glowing photo frame.
- **Live pass preview** — the pass updates as you type (name, college, photo).
- **Smart text fitting** — long names and college names automatically resize to fit.
- **High-quality PNG export** — 1024 × 1536, no watermark, no margins, no distortion.
  Filename: `PromptWars_[ParticipantName].png`.
- **Social sharing** — LinkedIn, WhatsApp, Instagram (share-sheet + download), copy the prewritten
  event announcement, and native Web Share API on mobile with graceful fallbacks.
- **Privacy first** — no login, no registration, no database. Photos are processed entirely
  in the browser and never uploaded or stored.
- **Mobile-first & responsive** — excellent experience on Android and iPhone, no horizontal
  scrolling, large tap targets.
- **Extra actions** — Regenerate Pass · Change Photo · Edit Details · Create Another Pass.

## 🛠 Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Rendering | HTML Canvas API (fixed master template) |
| Image cropping | react-easy-crop |
| Icons | lucide-react + custom brand SVGs |
| Fonts | Poppins (self-hosted via @fontsource — works offline) |

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev          # → http://localhost:5173

# 3. Production build
npm run build        # type-checks, then outputs to ./dist

# 4. Preview the production build locally
npm run preview      # → http://localhost:4173
```

Node.js 18+ recommended (developed on Node 20).

## 📁 Project Structure

```
prompt-wars-pass/
├── index.html                 # Meta, OG tags, favicon
├── vite.config.ts             # Vite + React + Tailwind, deploy-ready config
├── tsconfig.json              # Strict TypeScript config
├── public/
│   ├── favicon.svg
│   └── assets/
│       └── pass-template-clean.png   # Original artwork (placeholder text removed)
└── src/
    ├── main.tsx               # Entry + self-hosted Poppins fonts
    ├── App.tsx                # State machine: form → generate → share
    ├── index.css              # Tailwind v4 theme, buttons, effects
    ├── types.ts               # Shared types (CropPixels, PhotoState…)
    ├── lib/
    │   ├── drawPass.ts        # ⭐ Master pass template renderer (1024×1536)
    │   ├── image.ts           # File validation (type/size) + helpers
    │   ├── share.ts           # LinkedIn/WhatsApp/Instagram/Web Share + download
    │   └── notify.ts          # Tiny toast event bus
    └── components/
        ├── Navbar.tsx         # Sticky brand navigation
        ├── Hero.tsx           # "READY TO ENTER THE PROMPT WARS?"
        ├── PassCreator.tsx    # Form + live preview (Section 2)
        ├── PhotoUploader.tsx  # Upload, crop/zoom modal, replace/remove
        ├── PassCanvas.tsx     # Reusable canvas preview component
        ├── ResultSection.tsx  # Download + sharing (Section 3)
        ├── EventInfo.tsx      # Event details (Section 4)
        ├── Footer.tsx
        ├── Toast.tsx
        └── BrandIcons.tsx     # AlGlorythm / Craftora / social brand marks
```

## 🎨 How Pass Rendering Works

`src/lib/drawPass.ts` owns the entire composition:

1. **Original master artwork** — `public/assets/pass-template-clean.png` is the project owner's
   original 1024 × 1536 reference image, with only the two placeholder strings ("Your Name" and
   "Your College") removed. Every other pixel is byte-for-byte identical to the source artwork.
   It is loaded once and drawn as the background of every pass.
2. **Per-participant overlay** — only three things are drawn on top:
   - the cropped photograph, clipped to the original photo frame (aspect-correct, never stretched);
   - the participant's full name, in the original Poppins weight, size, position and white colour;
   - the college / university name, in the original position, weight and colour.
   Both text fields auto-shrink when needed so long names never overflow.
3. **Single shared renderer** — `renderParticipantPass()` is used by the hero mock, live preview,
   final showcase, PNG download and social sharing. The preview and the exported PNG are therefore
   pixel-identical.

The only regions that ever change are the photo frame, the name line and the college line.
A pixel comparison against the original artwork outside those three regions returns zero difference.

## 📱 Sharing Behaviour

| Channel | Behaviour |
| --- | --- |
| LinkedIn | Uses the native share sheet with the pass PNG where supported. Otherwise downloads the pass, copies the prewritten announcement and opens the LinkedIn share dialog so you can attach the image. |
| WhatsApp | Uses the native share sheet with the pass PNG where supported (`navigator.share` with files). Otherwise downloads the pass and opens `wa.me` with the prewritten caption so you can attach it. |
| Instagram | Instagram has no direct web publishing API — the app shares/downloads the image through the native share sheet on mobile (pick Instagram) and shows clear instructions for feed/story posting. |
| Copy announcement | One tap copies the official caption + hashtags. |
| Download again | Re-exports the full-resolution PNG anytime. |

Suggested caption (prewritten, exactly as provided in the share block):

> I'm officially part of Prompt Wars 2026 by AlGlorythm! Ready to experiment, create, and push the
> boundaries of AI through prompts. See you on 12 December 2026! #PromptWars #AlGlorythm #AI

## 🔒 Privacy & Validation

- Photos are read with `URL.createObjectURL` and drawn to canvas — **never uploaded**.
- Client-side validation: accepted types (`jpg/jpeg/png/webp`), max size **5 MB**, required name
  and college fields with inline error states.
- EXIF-oriented decode via the browser's standard image pipeline.
- `URL.createObjectURL` references are revoked when photos are replaced or removed.

## ☁️ Deployment

The build is static — deploy `dist/` anywhere.

**Vercel**

```bash
npm i -g vercel && vercel
```
Framework preset: *Vite* · Build command: `npm run build` · Output dir: `dist` (auto-detected).

**Netlify**

```bash
npm i -g netlify-cli && netlify deploy --prod
```
Build command: `npm run build` · Publish dir: `dist` (auto-detected).

No environment variables, servers or databases required.

## ✅ User Flow

1. Open the website → **CREATE MY PASS**
2. Upload a photograph (crop / zoom / reposition)
3. Enter full name + college (preview updates live)
4. **GENERATE MY PASS** → final pass showcase
5. **DOWNLOAD MY PASS** (`PromptWars_YourName.png`)
6. Share on LinkedIn / Instagram / WhatsApp

---

Made with creativity by **AlGlorythm** · Think · Prompt · Build
