import type { CropPixels, PassRenderData } from '../types';

/* ------------------------------------------------------------------ */
/*  PROMPT WARS — MASTER PASS TEMPLATE                                 */
/*  Fixed 1024 x 1536 canvas composition.                              */
/*  Everything brand-related is drawn programmatically and cached;     */
/*  only the photo + name + college are overlaid per participant.      */
/* ------------------------------------------------------------------ */

export const PASS_WIDTH = 1024;
export const PASS_HEIGHT = 1536;

const FONT = 'Poppins, "Segoe UI", sans-serif';

/* ------------------------------- layout ---------------------------- */
const CARD = { inset: 22, radius: 46 };
const PHOTO = { x: 352, y: 628, w: 320, h: 320, radius: 40 };
const NAME_BASELINE = 1068;
const DIVIDER_Y = 1114;
const COLLEGE_BASELINE = 1182;
const BADGE = { x0: 178, x1: 846, y0: 1222, y1: 1314 };
const TAGLINE_BASELINE = 1398;

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

/** Deterministic RNG so the master template looks identical every render. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

/** Multi-stop color ramp. stops: [position, hex][] */
function rampColor(stops: [number, string][], t: number): string {
  const x = Math.min(1, Math.max(0, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (x >= p0 && x <= p1) {
      const k = p1 === p0 ? 0 : (x - p0) / (p1 - p0);
      return lerpColor(c0, c1, k);
    }
  }
  return stops[stops.length - 1][1];
}

type Pt = [number, number];

/** Catmull-Rom → cubic bezier path through points. */
function smoothPath(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const cp2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], p2[0], p2[1]);
  }
}

function trackedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number): number {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + spacing;
  return w - spacing;
}

function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  baseline: number,
  spacing: number,
  align: 'center' | 'left' = 'center',
) {
  const total = trackedWidth(ctx, text, spacing);
  let x = align === 'center' ? cx - total / 2 : cx;
  for (const ch of text) {
    ctx.fillText(ch, x, baseline);
    x += ctx.measureText(ch).width + spacing;
  }
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
    size -= 2;
  }
  return size;
}

/** 4-point sparkle star. */
function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#ffffff') {
  const r = size;
  const k = size * 0.18;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + k, cy - k, cx + r, cy);
  ctx.quadraticCurveTo(cx + k, cy + k, cx, cy + r);
  ctx.quadraticCurveTo(cx - k, cy + k, cx - r, cy);
  ctx.quadraticCurveTo(cx - k, cy - k, cx, cy - r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const HAS_FILTER = typeof document !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype;

/* ---------------------------- liquid ribbons ------------------------ */
const WAVE_RAMP: [number, string][] = [
  [0.0, '#1e3a8a'],
  [0.18, '#2563eb'],
  [0.38, '#22d3ee'],
  [0.55, '#2dd4bf'],
  [0.72, '#facc15'],
  [0.88, '#fde047'],
  [1.0, '#f59e0b'],
];

interface RibbonOpts {
  pts: Pt[];
  width: number;
  bands?: number;
  seed: number;
  axis?: 'x' | 'y';
  ramp?: [number, string][];
  glow?: string;
}

function liquidRibbon(ctx: CanvasRenderingContext2D, o: RibbonOpts) {
  const rng = mulberry32(o.seed);
  const bands = o.bands ?? 26;
  const axis = o.axis ?? 'x';
  const ramp = o.ramp ?? WAVE_RAMP;

  ctx.save();

  // Soft outer glow
  if (HAS_FILTER) {
    ctx.filter = 'blur(26px)';
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = o.glow ?? '#22d3ee';
    ctx.lineWidth = o.width * 1.15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    smoothPath(ctx, o.pts);
    ctx.stroke();
  }

  // Flowing bands
  if (HAS_FILTER) ctx.filter = 'blur(2px)';
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const offset = (t - 0.5) * o.width;
    const jitter = (rng() - 0.5) * o.width * 0.06;
    const w = (o.width / bands) * (1.35 + rng() * 0.9);
    ctx.globalAlpha = 0.2 + rng() * 0.42;
    ctx.strokeStyle = rampColor(ramp, t);
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const shifted = o.pts.map((p) => (axis === 'x' ? [p[0] + offset + jitter, p[1]] : [p[0], p[1] + offset + jitter])) as Pt[];
    smoothPath(ctx, shifted);
    ctx.stroke();
  }

  // Specular streaks
  ctx.filter = 'none';
  for (let i = 0; i < 5; i++) {
    const t = rng();
    const offset = (t - 0.5) * o.width * 0.85;
    ctx.globalAlpha = 0.16 + rng() * 0.22;
    ctx.strokeStyle = rng() > 0.5 ? '#ffffff' : '#67e8f9';
    ctx.lineWidth = 1.5 + rng() * 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const shifted = o.pts.map((p) => (axis === 'x' ? [p[0] + offset, p[1]] : [p[0], p[1] + offset])) as Pt[];
    smoothPath(ctx, shifted);
    ctx.stroke();
  }

  ctx.restore();
}

function drawLeftRibbon(ctx: CanvasRenderingContext2D) {
  liquidRibbon(ctx, {
    pts: [
      [30, 30],
      [180, 225],
      [70, 425],
      [188, 635],
      [78, 835],
      [152, 1025],
    ],
    width: 118,
    bands: 28,
    seed: 1337,
  });
}

function drawBottomLeftRibbon(ctx: CanvasRenderingContext2D) {
  liquidRibbon(ctx, {
    pts: [
      [-30, 1150],
      [118, 1255],
      [48, 1400],
      [138, 1560],
    ],
    width: 92,
    bands: 20,
    seed: 777,
    ramp: [
      [0.0, '#2563eb'],
      [0.25, '#22d3ee'],
      [0.55, '#facc15'],
      [1.0, '#fde047'],
    ],
    glow: '#facc15',
  });
}

function drawBottomRightRibbon(ctx: CanvasRenderingContext2D) {
  liquidRibbon(ctx, {
    pts: [
      [655, 1565],
      [785, 1440],
      [900, 1495],
      [1065, 1360],
    ],
    width: 92,
    bands: 22,
    seed: 4242,
    axis: 'y',
    ramp: [
      [0.0, '#1e3a8a'],
      [0.22, '#22d3ee'],
      [0.5, '#2dd4bf'],
      [0.78, '#facc15'],
      [1.0, '#fde047'],
    ],
    glow: '#22d3ee',
  });
}

/** Vortex swirl on the mid-right edge. */
function drawRightVortex(ctx: CanvasRenderingContext2D) {
  const cx = 992;
  const cy = 736;
  const rng = mulberry32(90210);

  ctx.save();
  // Glow bed
  if (HAS_FILTER) {
    ctx.filter = 'blur(30px)';
    ctx.globalAlpha = 0.38;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 100;
    ctx.beginPath();
    ctx.arc(cx, cy, 148, Math.PI * 0.75, Math.PI * 2.15);
    ctx.stroke();
    ctx.filter = 'blur(2px)';
  }

  // Spiral bands
  for (let i = 0; i < 26; i++) {
    const t = i / 25;
    const radius = 86 + i * 4.1;
    const start = Math.PI * (0.62 - t * 0.22) + rng() * 0.05;
    const end = Math.PI * (2.18 - t * 0.12);
    ctx.globalAlpha = 0.22 + rng() * 0.42;
    ctx.strokeStyle = rampColor(WAVE_RAMP, 1 - t);
    ctx.lineWidth = 3.5 + rng() * 8.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, end);
    ctx.stroke();
  }

  // Bright yellow outer streaks
  ctx.filter = 'none';
  for (let i = 0; i < 3; i++) {
    const radius = 158 + i * 13;
    ctx.globalAlpha = 0.6 - i * 0.16;
    ctx.strokeStyle = i === 0 ? '#fde047' : '#facc15';
    ctx.lineWidth = 6 - i * 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.72, Math.PI * 1.62);
    ctx.stroke();
  }

  // Dark eye of the vortex
  const eye = ctx.createRadialGradient(cx - 16, cy - 20, 8, cx, cy, 72);
  eye.addColorStop(0, 'rgba(4,5,12,0.98)');
  eye.addColorStop(0.65, 'rgba(4,5,12,0.85)');
  eye.addColorStop(1, 'rgba(4,5,12,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = eye;
  ctx.beginPath();
  ctx.arc(cx, cy, 72, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ------------------------------ grid + tech ------------------------- */
function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.save();
  const step = 64;
  ctx.strokeStyle = 'rgba(56,189,248,0.05)';
  ctx.lineWidth = 1;
  for (let x = CARD.inset + 20; x < PASS_WIDTH - CARD.inset; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, CARD.inset + 12);
    ctx.lineTo(x, PASS_HEIGHT - CARD.inset - 12);
    ctx.stroke();
  }
  for (let y = CARD.inset + 20; y < PASS_HEIGHT - CARD.inset; y += step) {
    ctx.beginPath();
    ctx.moveTo(CARD.inset + 12, y);
    ctx.lineTo(PASS_WIDTH - CARD.inset - 12, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTechAccents(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(34,211,238,0.28)';
  const line = (pts: Pt[]) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    const e = pts[pts.length - 1];
    ctx.fillStyle = 'rgba(34,211,238,0.45)';
    ctx.fillRect(e[0] - 3, e[1] - 3, 6, 6);
  };
  line([
    [760, 318],
    [862, 318],
    [862, 360],
  ]);
  line([
    [886, 250],
    [936, 250],
    [936, 300],
  ]);
  line([
    [196, 1072],
    [128, 1072],
    [128, 1136],
  ]);
  ctx.restore();
}

function drawChecker(ctx: CanvasRenderingContext2D) {
  const rng = mulberry32(24601);
  const size = 24;
  const x0 = 34;
  const y0 = 1362;
  ctx.save();
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      if ((r + c) % 2 !== 0) continue;
      const fade = Math.max(0, 1 - (r + c) / 9);
      if (rng() > fade + 0.15) continue;
      const blue = rng() > 0.35;
      ctx.fillStyle = blue ? `rgba(37,99,235,${0.5 * fade + 0.12})` : `rgba(34,211,238,${0.3 * fade + 0.08})`;
      ctx.fillRect(x0 + c * size, y0 + r * size, size - 3, size - 3);
    }
  }
  ctx.restore();
}

/* ------------------------------- border ----------------------------- */
function drawBorder(ctx: CanvasRenderingContext2D) {
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, PASS_WIDTH, PASS_HEIGHT);
  g.addColorStop(0, '#22d3ee');
  g.addColorStop(0.35, '#38bdf8');
  g.addColorStop(0.62, '#6366f1');
  g.addColorStop(1, '#a855f7');

  rr(ctx, CARD.inset, CARD.inset, PASS_WIDTH - CARD.inset * 2, PASS_HEIGHT - CARD.inset * 2, CARD.radius);
  ctx.strokeStyle = g;
  ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(56,189,248,0.85)';
  ctx.shadowBlur = 22;
  ctx.stroke();

  ctx.shadowBlur = 0;
  rr(ctx, CARD.inset + 14, CARD.inset + 14, PASS_WIDTH - CARD.inset * 2 - 28, PASS_HEIGHT - CARD.inset * 2 - 28, CARD.radius - 12);
  ctx.strokeStyle = 'rgba(148,163,255,0.16)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

/* -------------------------------- logos ----------------------------- */
function drawAIGlorythmLogo(ctx: CanvasRenderingContext2D) {
  ctx.save();
  // Mark — rounded triangle with orbit + sparkle
  const mx = 108;
  const my = 118;
  const s = 1.0;
  const tri = ctx.createLinearGradient(mx, my, mx + 62 * s, my + 62 * s);
  tri.addColorStop(0, '#a855f7');
  tri.addColorStop(1, '#6d28d9');

  ctx.fillStyle = tri;
  ctx.beginPath();
  const ax = mx + 31 * s;
  const ay = my + 4 * s;
  const bx = mx + 60 * s;
  const by = my + 58 * s;
  const cx2 = mx + 2 * s;
  const cy2 = my + 58 * s;
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(cx2, cy2);
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 10;
  ctx.strokeStyle = tri;
  ctx.stroke();
  ctx.fill();

  // Orbit ring
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(mx + 31 * s, my + 34 * s, 30 * s, 13 * s, -Math.PI / 5.4, 0, Math.PI * 2);
  ctx.stroke();

  // Inner swirl dot + sparkle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(mx + 31 * s, my + 34 * s, 3.2 * s, 0, Math.PI * 2);
  ctx.fill();
  drawSparkle(ctx, mx + 52 * s, my + 12 * s, 8, '#e9d5ff');

  // Wordmark
  const g = ctx.createLinearGradient(186, 140, 320, 195);
  g.addColorStop(0, '#c084fc');
  g.addColorStop(1, '#7c3aed');
  ctx.fillStyle = g;
  ctx.font = `800 34px ${FONT}`;
  ctx.textBaseline = 'alphabetic';
  drawTracked(ctx, 'AIGlorythm', 184, 182, 0.5, 'left');
  ctx.restore();
}

function drawSponsorLogos(ctx: CanvasRenderingContext2D) {
  ctx.save();

  /* --- OSEN --- */
  const ox = 600;
  const oy = 130;
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 4.5;
  ctx.lineJoin = 'round';
  const hexR = 23;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const px = ox + 25 + hexR * Math.cos(a);
    const py = oy + 30 + hexR * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = 'rgba(96,165,250,0.22)';
  ctx.fill();
  // inner spark
  ctx.fillStyle = '#93c5fd';
  ctx.beginPath();
  ctx.arc(ox + 25, oy + 30, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = `800 40px ${FONT}`;
  ctx.fillStyle = '#f8fafc';
  drawTracked(ctx, 'OSEN', ox + 60, oy + 46, 1.5, 'left');

  // divider between sponsors
  ctx.strokeStyle = 'rgba(148,163,184,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(796, 132);
  ctx.lineTo(796, 182);
  ctx.stroke();

  /* --- Craftora (cube + wordmark) --- */
  const cx0 = 822;
  const cy0 = 158;
  const k = 21;
  // isometric cube
  ctx.lineJoin = 'round';
  const top = ctx.createLinearGradient(cx0, cy0 - k * 1.4, cx0, cy0);
  top.addColorStop(0, '#93c5fd');
  top.addColorStop(1, '#60a5fa');
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(cx0, cy0 - k * 1.35);
  ctx.lineTo(cx0 + k, cy0 - k * 0.7);
  ctx.lineTo(cx0, cy0 - k * 0.05);
  ctx.lineTo(cx0 - k, cy0 - k * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.moveTo(cx0 - k, cy0 - k * 0.7);
  ctx.lineTo(cx0, cy0 - k * 0.05);
  ctx.lineTo(cx0, cy0 + k * 1.15);
  ctx.lineTo(cx0 - k, cy0 + k * 0.5);
  ctx.closePath();
  ctx.fill();

  const rightF = ctx.createLinearGradient(cx0, cy0, cx0 + k, cy0 + k);
  rightF.addColorStop(0, '#3b82f6');
  rightF.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = rightF;
  ctx.beginPath();
  ctx.moveTo(cx0 + k, cy0 - k * 0.7);
  ctx.lineTo(cx0, cy0 - k * 0.05);
  ctx.lineTo(cx0, cy0 + k * 1.15);
  ctx.lineTo(cx0 + k, cy0 + k * 0.5);
  ctx.closePath();
  ctx.fill();

  // wordmark "raftora" completes "C|raftora"
  const cg = ctx.createLinearGradient(cx0 + 16, 130, cx0 + 180, 190);
  cg.addColorStop(0, '#7dd3fc');
  cg.addColorStop(0.55, '#818cf8');
  cg.addColorStop(1, '#c084fc');
  ctx.fillStyle = cg;
  ctx.font = `800 35px ${FONT}`;
  drawTracked(ctx, 'raftora', cx0 + 26, 180, 0.4, 'left');

  ctx.restore();
}

/* --------------------------------- title ---------------------------- */
function drawTitle(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';

  // "Prompt"
  ctx.font = `900 196px ${FONT}`;
  ctx.shadowColor = 'rgba(34,211,238,0.28)';
  ctx.shadowBlur = 46;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Prompt', 512, 446);

  // "Wars" with cyan gradient
  const g = ctx.createLinearGradient(0, 440, 0, 618);
  g.addColorStop(0, '#7dd3fc');
  g.addColorStop(0.45, '#2fd4f2');
  g.addColorStop(1, '#0bb8e2');
  ctx.shadowColor = 'rgba(34,211,238,0.5)';
  ctx.shadowBlur = 60;
  ctx.fillStyle = g;
  ctx.fillText('Wars', 512, 612);
  ctx.shadowBlur = 0;

  // slanted energy streaks to the right of "Wars"
  const streak = (x: number, y: number, w: number, h: number, color: string, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    const sk = h * 1.05;
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w + sk * 0.32, y + h * 0.22);
    ctx.lineTo(x + sk * 0.32, y + h * 1.18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  streak(788, 562, 74, 16, '#2563eb', 0.95);
  streak(808, 518, 88, 17, '#3b82f6', 0.9);
  streak(832, 472, 66, 15, '#60a5fa', 0.85);

  ctx.restore();
}

/* ------------------------------ photo frame ------------------------- */
function drawPhotoFrame(ctx: CanvasRenderingContext2D, opts: { fillInterior?: boolean } = {}) {
  const fillInterior = opts.fillInterior !== false;
  ctx.save();

  // Interior (also the empty-state placeholder bed)
  if (fillInterior) {
    const inner = ctx.createLinearGradient(PHOTO.x, PHOTO.y, PHOTO.x + PHOTO.w, PHOTO.y + PHOTO.h);
    inner.addColorStop(0, '#0b1226');
    inner.addColorStop(1, '#05060c');
    rr(ctx, PHOTO.x + 5, PHOTO.y + 5, PHOTO.w - 10, PHOTO.h - 10, PHOTO.radius - 6);
    ctx.fillStyle = inner;
    ctx.fill();
  }

  // Glowing border (cyan → purple)
  const g = ctx.createLinearGradient(PHOTO.x, PHOTO.y, PHOTO.x + PHOTO.w, PHOTO.y + PHOTO.h);
  g.addColorStop(0, '#22d3ee');
  g.addColorStop(0.5, '#4f7df9');
  g.addColorStop(1, '#a855f7');
  rr(ctx, PHOTO.x, PHOTO.y, PHOTO.w, PHOTO.h, PHOTO.radius);
  ctx.strokeStyle = g;
  ctx.lineWidth = 7;
  ctx.shadowColor = 'rgba(56,189,248,0.85)';
  ctx.shadowBlur = 26;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Corner brackets
  ctx.strokeStyle = 'rgba(34,211,238,0.95)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const off = 24;
  const arm = 46;
  const corner = (x: number, y: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * arm, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * arm);
    ctx.stroke();
  };
  corner(PHOTO.x - off, PHOTO.y - off, 1, 1);
  corner(PHOTO.x + PHOTO.w + off, PHOTO.y - off, -1, 1);
  corner(PHOTO.x - off, PHOTO.y + PHOTO.h + off, 1, -1);
  corner(PHOTO.x + PHOTO.w + off, PHOTO.y + PHOTO.h + off, -1, -1);

  ctx.restore();
}

/* ------------------------------ name block -------------------------- */
function drawDivider(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = 'rgba(226,232,240,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(288, DIVIDER_Y);
  ctx.lineTo(462, DIVIDER_Y);
  ctx.moveTo(562, DIVIDER_Y);
  ctx.lineTo(736, DIVIDER_Y);
  ctx.stroke();
  drawSparkle(ctx, 512, DIVIDER_Y, 13, '#ffffff');
  ctx.restore();
}

/* ------------------------------ badge + tagline --------------------- */
function drawBadge(ctx: CanvasRenderingContext2D) {
  const { x0, x1, y0, y1 } = BADGE;
  const ym = (y0 + y1) / 2;
  const cut = 36;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0 + cut, y0);
  ctx.lineTo(x1 - cut, y0);
  ctx.lineTo(x1, ym);
  ctx.lineTo(x1 - cut, y1);
  ctx.lineTo(x0 + cut, y1);
  ctx.lineTo(x0, ym);
  ctx.closePath();
  ctx.fillStyle = '#04050c';
  ctx.fill();

  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#22d3ee');
  g.addColorStop(0.5, '#6366f1');
  g.addColorStop(1, '#a855f7');
  ctx.strokeStyle = g;
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(99,102,241,0.8)';
  ctx.shadowBlur = 16;
  ctx.stroke();
  ctx.shadowBlur = 0;

  drawSparkle(ctx, x0 + 82, ym + 3, 17, '#ffffff');
  drawSparkle(ctx, x1 - 82, ym + 3, 17, '#ffffff');

  ctx.font = `italic 800 58px ${FONT}`;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'alphabetic';
  drawTracked(ctx, 'PARTICIPANT', 512, ym + 21, 2.5, 'center');
  ctx.restore();
}

function drawTagline(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = `italic 500 36px ${FONT}`;
  ctx.fillStyle = 'rgba(241,245,249,0.95)';
  ctx.textBaseline = 'alphabetic';
  drawTracked(ctx, 'Think  ·  Prompt  ·  Build', 512, TAGLINE_BASELINE, 1, 'center');

  ctx.strokeStyle = 'rgba(226,232,240,0.45)';
  ctx.lineWidth = 2;
  const y = TAGLINE_BASELINE - 11;
  const half = trackedWidth(ctx, 'Think  ·  Prompt  ·  Build', 1) / 2;
  ctx.beginPath();
  ctx.moveTo(512 - half - 36, y);
  ctx.lineTo(512 - half - 160, y);
  ctx.moveTo(512 + half + 36, y);
  ctx.lineTo(512 + half + 160, y);
  ctx.stroke();
  ctx.restore();
}

/* --------------------------- background cache ----------------------- */
let bgCache: HTMLCanvasElement | null = null;

function buildBackground(): HTMLCanvasElement {
  if (bgCache) return bgCache;
  const canvas = document.createElement('canvas');
  canvas.width = PASS_WIDTH;
  canvas.height = PASS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // Base
  const base = ctx.createRadialGradient(512, 560, 80, 512, 760, 1050);
  base.addColorStop(0, '#0b1226');
  base.addColorStop(0.55, '#060814');
  base.addColorStop(1, '#04050c');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, PASS_WIDTH, PASS_HEIGHT);

  drawGrid(ctx);
  drawTechAccents(ctx);
  drawChecker(ctx);
  drawLeftRibbon(ctx);
  drawBottomLeftRibbon(ctx);
  drawRightVortex(ctx);
  drawBottomRightRibbon(ctx);

  drawBorder(ctx);
  drawAIGlorythmLogo(ctx);
  drawSponsorLogos(ctx);
  drawTitle(ctx);
  drawPhotoFrame(ctx);
  drawDivider(ctx);
  drawBadge(ctx);
  drawTagline(ctx);

  bgCache = canvas;
  return canvas;
}

/* ------------------------------ fonts ------------------------------- */
const FONT_SPECS = [
  '300 36px Poppins',
  '500 36px Poppins',
  '800 36px Poppins',
  '900 36px Poppins',
  'italic 500 36px Poppins',
  'italic 800 36px Poppins',
];

let fontsReady: Promise<void> | null = null;

export function ensureFonts(): Promise<void> {
  if (!fontsReady) {
    fontsReady = (async () => {
      try {
        await Promise.all(FONT_SPECS.map((s) => document.fonts.load(s)));
        await document.fonts.ready;
      } catch {
        // Non-fatal: canvas falls back to system sans.
      }
    })();
  }
  return fontsReady;
}

/* ------------------------------ render ------------------------------ */
function drawParticipantPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | HTMLCanvasElement,
  crop: CropPixels,
) {
  const inset = 7;
  const dx = PHOTO.x + inset;
  const dy = PHOTO.y + inset;
  const dw = PHOTO.w - inset * 2;
  const dh = PHOTO.h - inset * 2;

  ctx.save();
  rr(ctx, dx, dy, dw, dh, PHOTO.radius - 10);
  ctx.clip();

  // "cover" behaviour with the chosen crop rect
  const sw = crop.width;
  const sh = crop.height;
  if (sw > 0 && sh > 0) {
    const scale = Math.max(dw / sw, dh / sh);
    const rw = sw * scale;
    const rh = sh * scale;
    ctx.drawImage(photo, crop.x, crop.y, sw, sh, dx + (dw - rw) / 2, dy + (dh - rh) / 2, rw, rh);
  }
  ctx.restore();
}

function drawNameCollege(ctx: CanvasRenderingContext2D, data: PassRenderData) {
  const nameText = data.name.trim();
  const collegeText = data.college.trim();
  const placeholder = !!data.showPlaceholders;

  // Name
  const name = nameText || (placeholder ? 'Your Name' : '');
  if (name) {
    const nameSize = fitFontSize(ctx, name, 848, 96, 34, 800);
    ctx.save();
    ctx.font = `800 ${nameSize}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = nameText ? '#ffffff' : 'rgba(255,255,255,0.32)';
    if (nameText) {
      ctx.shadowColor = 'rgba(56,189,248,0.25)';
      ctx.shadowBlur = 28;
    }
    ctx.fillText(name, 512, NAME_BASELINE);
    ctx.restore();
  }

  // College
  const college = collegeText || (placeholder ? 'Your College' : '');
  if (college) {
    const collegeSize = fitFontSize(ctx, college, 812, 46, 22, 500);
    ctx.save();
    ctx.font = `500 ${collegeSize}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = collegeText ? 'rgba(241,245,249,0.96)' : 'rgba(255,255,255,0.3)';
    ctx.fillText(college, 512, COLLEGE_BASELINE);
    ctx.restore();
  }
}

/** Render the complete pass onto a 1024x1536 canvas. */
export async function renderPass(canvas: HTMLCanvasElement, data: PassRenderData): Promise<void> {
  await ensureFonts();
  canvas.width = PASS_WIDTH;
  canvas.height = PASS_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, PASS_WIDTH, PASS_HEIGHT);

  const bg = buildBackground();
  ctx.drawImage(bg, 0, 0);

  if (data.photo && data.crop && data.crop.width > 0) {
    drawParticipantPhoto(ctx, data.photo, data.crop);
  }

  // Redraw the glowing frame edge above the photo so it is never covered.
  drawPhotoFrame(ctx, { fillInterior: false });
  drawNameCollege(ctx, data);
}

/** Full-resolution export helper. */
export async function renderPassToBlob(data: PassRenderData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await renderPass(canvas, data);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not generate the PNG. Please try again.'));
    }, 'image/png');
  });
}

export const passLayout = { PHOTO, BADGE, NAME_BASELINE, COLLEGE_BASELINE };
