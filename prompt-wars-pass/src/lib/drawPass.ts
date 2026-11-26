import type { CropPixels, PassRenderData } from '../types';

/* ------------------------------------------------------------------ */
/*  PROMPT WARS — MASTER PASS TEMPLATE                                 */
/*                                                                     */
/*  The pass artwork is the project owner's original 1024 x 1536      */
/*  reference image. It is drawn pixel-for-pixel as the background.    */
/*  Only three things are ever added on top:                           */
/*    1. the participant photograph, inside the original frame         */
/*    2. the participant name                                          */
/*    3. the college / university name                                 */
/*                                                                     */
/*  `pass-template-clean.png` is the original artwork with ONLY the    */
/*  two placeholder text strings ("Your Name" / "Your College")       */
/*  removed. Every other pixel is byte-for-byte identical.             */
/* ------------------------------------------------------------------ */

export const PASS_WIDTH = 1024;
export const PASS_HEIGHT = 1536;

const FONT = 'Poppins, "Segoe UI", sans-serif';

/* ------------------------------- layout ---------------------------- */
/* Measured directly from the original 1024 x 1536 reference artwork. */
const PHOTO = { x: 367, y: 633, w: 292, h: 332, radius: 37 };
export const PHOTO_ASPECT = PHOTO.w / PHOTO.h;

const NAME = {
  baseline: 1066,
  maxWidth: 800,
  maxSize: 92,
  minSize: 24,
  weight: 700,
};

const COLLEGE = {
  baseline: 1152,
  maxWidth: 800,
  maxSize: 40,
  minSize: 14,
  weight: 500,
};

const PLACEHOLDER_NAME = 'Your Name';
const PLACEHOLDER_COLLEGE = 'Your College';

/* ------------------------------- helpers --------------------------- */
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  weight: number,
): number {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function sourceSize(photo: HTMLImageElement | HTMLCanvasElement): { w: number; h: number } {
  if (photo instanceof HTMLImageElement) {
    return { w: photo.naturalWidth || photo.width, h: photo.naturalHeight || photo.height };
  }
  return { w: photo.width, h: photo.height };
}

/* ------------------------------ fonts ------------------------------- */
const FONT_SPECS = ['500 40px Poppins', '700 92px Poppins'];

let fontsReady: Promise<void> | null = null;

export function ensureFonts(): Promise<void> {
  if (!fontsReady) {
    fontsReady = (async () => {
      try {
        await Promise.all(FONT_SPECS.map((s) => document.fonts.load(s)));
        await document.fonts.ready;
      } catch {
        // Non-fatal: canvas falls back to the system sans-serif stack.
      }
    })();
  }
  return fontsReady;
}

/* --------------------------- master template ------------------------ */
let templatePromise: Promise<HTMLImageElement> | null = null;

function loadTemplate(): Promise<HTMLImageElement> {
  if (!templatePromise) {
    templatePromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => {
        templatePromise = null;
        reject(new Error('Could not load the Prompt Wars pass template. Please refresh and try again.'));
      };
      img.src = `${import.meta.env.BASE_URL}assets/pass-template-clean.png`;
    });
  }
  return templatePromise;
}

/* ------------------------------ photo ------------------------------- */
function drawParticipantPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | HTMLCanvasElement,
  crop: CropPixels | null | undefined,
) {
  const { w: naturalW, h: naturalH } = sourceSize(photo);
  if (!naturalW || !naturalH) return;

  const cropW = crop && crop.width > 0 ? crop.width : naturalW;
  const cropH = crop && crop.height > 0 ? crop.height : naturalH;
  const cropX = crop && crop.width > 0 ? crop.x : 0;
  const cropY = crop && crop.height > 0 ? crop.y : 0;

  ctx.save();
  rr(ctx, PHOTO.x, PHOTO.y, PHOTO.w, PHOTO.h, PHOTO.radius);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // "cover" — never stretch. The crop already matches the frame aspect,
  // so this fills the frame exactly with no distortion.
  const scale = Math.max(PHOTO.w / cropW, PHOTO.h / cropH);
  const drawW = cropW * scale;
  const drawH = cropH * scale;
  const drawX = PHOTO.x + (PHOTO.w - drawW) / 2;
  const drawY = PHOTO.y + (PHOTO.h - drawH) / 2;

  ctx.drawImage(photo, cropX, cropY, cropW, cropH, drawX, drawY, drawW, drawH);
  ctx.restore();
}

/* --------------------------- name + college ------------------------- */
function drawNameCollege(ctx: CanvasRenderingContext2D, data: PassRenderData) {
  const nameText = data.name.trim();
  const collegeText = data.college.trim();
  const showPlaceholders = !!data.showPlaceholders;

  // Cover "Your Name" placeholder rectangle with background matching the badge
  // Rectangle measured from the original artwork where placeholder text was removed
  ctx.fillStyle = '#04050c';
  ctx.fillRect(233, 982, 570, 98);

  const name = nameText || (showPlaceholders ? PLACEHOLDER_NAME : '');
  if (name) {
    const size = fitFontSize(ctx, name, NAME.maxWidth, NAME.maxSize, NAME.minSize, NAME.weight);
    ctx.save();
    ctx.font = `${NAME.weight} ${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, PASS_WIDTH / 2, NAME.baseline, NAME.maxWidth);
    ctx.restore();
  }

  // Cover "Your College" placeholder rectangle with background matching the badge
  // Rectangle measured from the original artwork where placeholder text was removed
  ctx.fillStyle = '#04050c';
  ctx.fillRect(360, 1110, 303, 66);

  const college = collegeText || (showPlaceholders ? PLACEHOLDER_COLLEGE : '');
  if (college) {
    const size = fitFontSize(ctx, college, COLLEGE.maxWidth, COLLEGE.maxSize, COLLEGE.minSize, COLLEGE.weight);
    ctx.save();
    ctx.font = `${COLLEGE.weight} ${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(college, PASS_WIDTH / 2, COLLEGE.baseline, COLLEGE.maxWidth);
    ctx.restore();
  }
}

/* ------------------------------ render ------------------------------ */
/**
 * The ONE shared pass renderer.
 *
 * Used by the live preview, the final preview, the PNG download and
 * every social share. Because preview and export both call this exact
 * function, they are guaranteed to be pixel-identical.
 */
export async function renderParticipantPass(
  canvas: HTMLCanvasElement,
  data: PassRenderData,
): Promise<void> {
  const [template] = await Promise.all([loadTemplate(), ensureFonts()]);

  canvas.width = PASS_WIDTH;
  canvas.height = PASS_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not create the pass canvas.');

  ctx.clearRect(0, 0, PASS_WIDTH, PASS_HEIGHT);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. The original artwork, pixel-for-pixel.
  ctx.drawImage(template, 0, 0, PASS_WIDTH, PASS_HEIGHT);

  // 2. Participant photograph inside the original frame.
  if (data.photo) {
    drawParticipantPhoto(ctx, data.photo, data.crop);
  }

  // 3. Name + college in the original positions and typography.
  drawNameCollege(ctx, data);
}

/** Backwards-compatible alias used across the app. */
export const renderPass = renderParticipantPass;

/** Full-resolution PNG export helper. */
export async function renderPassToBlob(data: PassRenderData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await renderParticipantPass(canvas, data);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not generate the PNG. Please try again.'));
    }, 'image/png');
  });
}

export const passLayout = { PHOTO, NAME, COLLEGE };
