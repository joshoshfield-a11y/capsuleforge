/* CapsuleForge engine — client-side canvas compositing. No dependencies. */
"use strict";

/* ---------- site config ----------
 * Set these once before publishing. The demo zip's upsell button and the
 * butler deploy script read the same values (see marketing/butler-push.sh). */
const CONFIG = {
  ITCH_USER: "SkiticusPrime",
  PROJECT_SLUG: "capsuleforge",
  VERSION: "1.3.0",
};
const ITCH_URL = `https://${CONFIG.ITCH_USER}.itch.io/${CONFIG.PROJECT_SLUG}`;

/* ---------- templates ---------- */
const TEMPLATES = {
  ember:  { name: "Ember",  g: ["#2b0f14", "#0e0e14"], glow: "#ff5c5c", grad: "vertical" },
  ocean:  { name: "Ocean",  g: ["#0b2537", "#04101c"], glow: "#41c7ff", grad: "vertical" },
  violet: { name: "Violet", g: ["#2a1440", "#0d0817"], glow: "#b06bff", grad: "vertical" },
  gold:   { name: "Gold",   g: ["#3a2a08", "#120c04"], glow: "#ffc857", grad: "vertical" },
  mono:   { name: "Mono",   g: ["#23232b", "#0c0c10"], glow: "#c8c8d8", grad: "vertical" },
  toxic:  { name: "Toxic",  g: ["#12290f", "#060f05"], glow: "#7dff5c", grad: "vertical" },
};
const ITCH_SIZES = [
  ["cover",   630,  500,  "itch cover"],
  ["thumb",   315,  250,  "itch thumbnail"],
  ["og",      1200, 630,  "OG/Twitter card"],
  ["square",  512,  512,  "avatar/square"],
  ["banner",  960,  540,  "banner 16:9"],
  ["cap16",   800,  450,  "wide capsule"],
];
/* ----- Steam preset pack: paid tier. The free-demo build strips this array
 * (see marketing/butler-push.sh) — demo users get itch.io sizes only.
 * Dimensions verified against Valve's current store/library spec. ----- */
const STEAM_SIZES = [
  ["st-head",  920,  430,  "Steam header"],
  ["st-small", 462,  174,  "Steam small"],
  ["st-main",  1232, 706,  "Steam main"],
  ["st-vert",  748,  896,  "Steam vertical"],
  ["st-lib",   600,  900,  "Steam library"],
  ["st-hero",  3840, 1240, "Steam hero"],
  ["st-logo",  1280, 720,  "Steam logo"],
];
const SIZES = [...ITCH_SIZES, ...STEAM_SIZES];
const PLATFORMS = ["Windows", "macOS", "Linux", "Web", "Android"];
const FONTS = {
  // Google-font-backed stacks load when online (display=swap); system fallbacks keep it offline-capable
  block:     { name: "Block",        stack: "'Archivo Black','Arial Black','Helvetica Neue',sans-serif" },
  anton:     { name: "Anton",        stack: "'Anton','Arial Black',sans-serif" },
  bebas:     { name: "Bebas Neue",   stack: "'Bebas Neue','Oswald','Arial Narrow',sans-serif" },
  cinzel:    { name: "Cinzel",       stack: "'Cinzel',Georgia,'Times New Roman',serif" },
  orbitron:  { name: "Orbitron",     stack: "'Orbitron','Segoe UI',sans-serif" },
  righteous: { name: "Righteous",    stack: "'Righteous','Trebuchet MS',sans-serif" },
  pixel:     { name: "Pixel",        stack: "'Press Start 2P','Silkscreen',monospace" },
  marker:    { name: "Marker",       stack: "'Permanent Marker','Comic Sans MS',cursive" },
  mono:      { name: "Mono",         stack: "ui-monospace,Menlo,monospace" },
  serif:     { name: "Serif",        stack: "Georgia,'Times New Roman',serif" },
  clean:     { name: "Clean",        stack: "system-ui,'Segoe UI',Roboto,sans-serif" },
  condensed: { name: "Condensed",    stack: "'Oswald','Arial Narrow','Helvetica Neue Condensed',sans-serif" },
  playful:   { name: "Playful",      stack: "'Comic Sans MS','Chalkboard SE',cursive" },
};

const state = {
  template: "ember", size: "cover", anchor: "bl",
  images: [], bgIndex: -1, sample: null, sampleStyle: "screenprint",
  title: "BONE ORCHARD",
  tagline: "a slow-burn folk horror about what grows back",
  dev: "", accent: "#ff6b4a", textcolor: "#ffffff",
  glow: 40, vig: 35, grad: 55, tsize: 0, crop: 50,
  font: "block", ls: 6, upper: true, stroke: 70, strokecol: "#000000", grain: 0, blur: 0,
  hardshadow: false, underline: false,
  format: "png", jpgq: 90,
  safe: false, wm: false,
  badges: true, scan: false, plats: ["Windows", "macOS", "Linux", "Web"],
};

/* ---------- curated art-direction presets ----------
 * One click sets template, type, layout and finish together. These are
 * hand-tuned starting points, not random combos. */
const PRESETS = {
  arcade: { label: "Arcade Cabinet", desc: "chunky pixel type, scanlines, hard shadow",
    apply: { template: "mono", font: "pixel", anchor: "cc", accent: "#7dff5c",
      textcolor: "#ffffff", glow: 30, vig: 40, grad: 50, grain: 12, scan: true,
      stroke: 90, strokecol: "#000000", ls: 4, upper: true,
      hardshadow: true, underline: false } },
  zine: { label: "Zine Cut", desc: "marker type, heavy grain, rough and loud",
    apply: { template: "ember", font: "marker", anchor: "bl", accent: "#ff6b4a",
      textcolor: "#fff7ee", glow: 25, vig: 45, grad: 45, grain: 45, scan: false,
      stroke: 60, strokecol: "#1a0b0b", ls: 2, upper: true,
      hardshadow: true, underline: false } },
  vhs: { label: "VHS Rental", desc: "soft glow, tracking lines, warm bleed",
    apply: { template: "ocean", font: "bebas", anchor: "bc", accent: "#41c7ff",
      textcolor: "#ffffff", glow: 55, vig: 35, grad: 55, grain: 22, scan: true,
      stroke: 70, strokecol: "#000000", ls: 10, upper: true,
      hardshadow: false, underline: false } },
  print: { label: "Screen Print", desc: "flat color, quiet glow, accent rule",
    apply: { template: "gold", font: "clean", anchor: "cl", accent: "#ffc857",
      textcolor: "#ffffff", glow: 15, vig: 30, grad: 50, grain: 12, scan: false,
      stroke: 50, strokecol: "#000000", ls: 8, upper: true,
      hardshadow: false, underline: true } },
  matinee: { label: "Midnight Matinee", desc: "tall serif, big glow, dead center",
    apply: { template: "violet", font: "cinzel", anchor: "cc", accent: "#b06bff",
      textcolor: "#f5efff", glow: 70, vig: 40, grad: 65, grain: 8, scan: false,
      stroke: 60, strokecol: "#000000", ls: 12, upper: true,
      hardshadow: false, underline: false } },
};
/* accents the "Surprise me" dice is allowed to roll — no muddy randoms */
const CURATED_ACCENTS = ["#ff6b4a", "#41c7ff", "#b06bff", "#ffc857", "#7dff5c",
  "#ff8c42", "#4ae3b5", "#ff5c8c", "#6ee7ff", "#ffd166", "#e8e8f0", "#c084fc"];

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function hexA(hex, a) {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map(c => c + c).join(""); // expand #rgb → #rrggbb
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function lerp(a, b, t) { return a + (b - a) * t; }

/* cover-draw an image into rect, honoring crop slider (crop zooms in from cover-fit) */
function drawCover(ctx, img, W, H, crop, blur) {
  const iw = img.width, ih = img.height;
  const base = Math.max(W / iw, H / ih);
  const zoom = base * (1 + (crop / 100) * 0.6);
  const dw = iw * zoom, dh = ih * zoom;
  if (blur > 0 && "filter" in ctx) ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  if (blur > 0 && "filter" in ctx) ctx.filter = "none";
}

/* ---------- sample key-art generator ----------
 * Three hand-printed looks, seeded by title + template. Deliberately none of
 * the usual procedural clichés (no starfields, no ringed planets). */
const SAMPLE_STYLES = [
  ["screenprint", "Screenprint"],
  ["halftone", "Halftone"],
  ["grainfield", "Grainfield"],
];

function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(title, style) {
  let h = 7;
  for (const c of style + "|" + title) h = (h * 31 + c.charCodeAt(0)) | 0;
  return h;
}

/* multiply a hex color toward black — flat print shading */
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (((n >> 16) & 255) * f) | 0);
  const g = Math.min(255, (((n >> 8) & 255) * f) | 0);
  const b = Math.min(255, (((n & 255) * f) | 0));
  return `rgb(${r},${g},${b})`;
}

/* shared film-grain layer (also used by render()) */
function grainLayer(x, W, H, alpha, seed) {
  if (alpha <= 0) return;
  const nz = document.createElement("canvas");
  const ns = 3; // 1/3-res noise, tiled up
  nz.width = Math.ceil(W / ns); nz.height = Math.ceil(H / ns);
  const nx = nz.getContext("2d");
  const id = nx.createImageData(nz.width, nz.height);
  const rnd = mulberry(seed);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = (rnd() * 255) | 0;
    id.data[i] = id.data[i+1] = id.data[i+2] = v; id.data[i+3] = 255;
  }
  nx.putImageData(id, 0, 0);
  x.save(); x.globalAlpha = alpha; x.globalCompositeOperation = "overlay";
  x.drawImage(nz, 0, 0, W, H); x.restore();
}

function artScreenprint(x, W, H, rnd, ink, paper, pale) {
  x.fillStyle = paper; x.fillRect(0, 0, W, H);
  const mis = Math.max(2, W / 320); // misregistration offset — the print-shop tell
  // sun: pale ghost printed first, ink pulled slightly off-register
  const sx = W * (0.58 + rnd() * 0.22), sy = H * (0.26 + rnd() * 0.16);
  const sr = Math.min(W, H) * (0.24 + rnd() * 0.10);
  x.fillStyle = hexA(pale, 0.28);
  x.beginPath(); x.arc(sx + mis, sy + mis, sr, 0, Math.PI * 2); x.fill();
  x.fillStyle = hexA(ink, 0.88);
  x.beginPath(); x.arc(sx, sy, sr, 0, Math.PI * 2); x.fill();
  // horizon band in dark ink
  const hy = H * (0.60 + rnd() * 0.12);
  x.fillStyle = shade(ink, 0.22);
  x.fillRect(0, hy, W, H - hy);
  // thin pale rules floating above the horizon
  x.fillStyle = hexA(pale, 0.75);
  const bars = 2 + ((rnd() * 2) | 0);
  for (let i = 0; i < bars; i++) {
    const by = hy - H * (0.06 + i * 0.055 + rnd() * 0.02);
    x.fillRect(W * (0.08 + rnd() * 0.3), by, W * (0.15 + rnd() * 0.35), Math.max(2, H * 0.012));
  }
  // small registration square, bottom-left
  const q = Math.min(W, H) * 0.05;
  x.fillStyle = hexA(pale, 0.35);
  x.fillRect(W * 0.10 + mis, H * 0.78 + mis, q, q);
  x.fillStyle = hexA(ink, 0.9);
  x.fillRect(W * 0.10, H * 0.78, q, q);
  grainLayer(x, W, H, 0.16, 99);
}

function artHalftone(x, W, H, rnd, ink, paper, pale) {
  x.fillStyle = paper; x.fillRect(0, 0, W, H);
  const s = Math.max(7, W / 88);
  const cx = W * (0.68 + rnd() * 0.12), cy = H * (0.32 + rnd() * 0.12);
  const cr = Math.min(W, H) * 0.30;
  // dot field, density riding a diagonal wave, clean around the sun
  x.fillStyle = hexA(ink, 0.9);
  for (let gy = s / 2; gy < H; gy += s) {
    for (let gx = s / 2; gx < W; gx += s) {
      if (Math.hypot(gx - cx, gy - cy) < cr) continue;
      const wave = 0.5 + 0.5 * Math.sin((gx / W + gy / H) * Math.PI * 3);
      const r = s * 0.42 * (0.25 + 0.75 * wave);
      if (r < 0.6) continue;
      x.beginPath(); x.arc(gx, gy, r, 0, Math.PI * 2); x.fill();
    }
  }
  // printed sun: pale disc, ink ring, sparse dots inside
  x.fillStyle = hexA(pale, 0.92);
  x.beginPath(); x.arc(cx, cy, cr, 0, Math.PI * 2); x.fill();
  x.strokeStyle = hexA(ink, 0.9); x.lineWidth = Math.max(2, W / 300);
  x.beginPath(); x.arc(cx, cy, cr, 0, Math.PI * 2); x.stroke();
  x.fillStyle = hexA(ink, 0.5);
  for (let i = 0; i < 60; i++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * cr * 0.9;
    x.beginPath(); x.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s * 0.16, 0, Math.PI * 2); x.fill();
  }
  // flat bars along the bottom
  x.fillStyle = shade(ink, 0.25);
  x.fillRect(0, H * 0.86, W, H * 0.14);
  x.fillStyle = hexA(ink, 0.85);
  x.fillRect(0, H * 0.84, W, Math.max(2, H * 0.012));
  grainLayer(x, W, H, 0.10, 4242);
}

function artGrainfield(x, W, H, rnd, ink, paper, pale) {
  x.fillStyle = shade(paper, 1.15); x.fillRect(0, 0, W, H);
  // stacked bands with hand-wavy top edges
  const bands = 5 + ((rnd() * 3) | 0);
  for (let b = 0; b < bands; b++) {
    const y0 = H * (0.30 + (b / bands) * 0.62);
    x.fillStyle = b % 2 ? hexA(ink, 0.16 + rnd() * 0.10) : shade(paper, 0.9);
    x.beginPath(); x.moveTo(0, H); x.lineTo(0, y0);
    for (let px = 0; px <= W; px += W / 16)
      x.lineTo(px, y0 + (rnd() - 0.5) * H * 0.03);
    x.lineTo(W, H); x.closePath(); x.fill();
  }
  // hard sun disc sitting on the horizon — print, not render
  const hy = H * 0.62;
  const sr = Math.min(W, H) * (0.13 + rnd() * 0.05);
  const sx = W * (0.30 + rnd() * 0.4);
  x.fillStyle = hexA(ink, 0.95);
  x.beginPath(); x.arc(sx, hy - sr * 0.25, sr, 0, Math.PI * 2); x.fill();
  x.fillStyle = hexA(pale, 0.8);
  x.fillRect(0, hy, W, Math.max(2, H * 0.006));
  grainLayer(x, W, H, 0.22, 777);
}

function makeSampleArt(W, H, ink, paper, seed, style) {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  const rnd = mulberry(seed);
  const pale = "#f2ede4";
  const painters = { screenprint: artScreenprint, halftone: artHalftone, grainfield: artGrainfield };
  (painters[style] || artScreenprint)(x, W, H, rnd, ink, paper, pale);
  return c;
}

/* ---------- text layout ---------- */
function anchorPoint(a, W, H, pad) {
  const xs = { l: pad, c: W / 2, r: W - pad };
  const ys = { t: pad, c: H / 2, b: H - pad };
  return [xs[a[1]], ys[a[0]]];
}

function drawTextBlock(ctx, W, H, o) {
  const pad = Math.round(Math.min(W, H) * 0.055);
  // bottom-anchored text must clear the badge row: its real height + breathing room
  const badgesDrawn = o.badges && o.plats && o.plats.length > 0;
  const minWH = Math.min(W, H);
  const lift = (o.anchor[0] === "b" && badgesDrawn)
    ? Math.round(minWH * (0.036 * 1.9 + 0.035)) + Math.round(minWH * 0.028)
    : 0;
  const [ax0, ay0] = anchorPoint(o.anchor, W, H, pad);
  const ax = ax0, ay = o.anchor[0] === "b" ? ay0 - lift : ay0;
  const align = o.anchor[1] === "l" ? "left" : o.anchor[1] === "r" ? "right" : "center";
  const base = o.anchor[0] === "t" ? 1 : o.anchor[0] === "c" ? 0 : -1;

  const font = (FONTS[o.font] || FONTS.block).stack;
  const title = o.upper ? o.title.toUpperCase() : o.title;
  // title font size: auto from canvas size unless overridden
  let ts = o.tsize || Math.round(Math.min(W, H) * (title.length > 14 ? 0.105 : 0.13));
  ctx.font = `700 ${ts}px ${font}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = (ts * (o.ls || 0) / 100) + "px";   // BEFORE wrap so measureText sees it
  const lines = wrap(ctx, title, W - pad * 2, ctx.font);
  const lh = ts * 1.06;
  // pre-wrap the tagline so the block height is exact, not estimated
  let tagFs = 0, tagLines = [], tagAdv = 0;
  if (o.tagline) {
    tagFs = Math.round(ts * 0.34);
    tagLines = wrap(ctx, o.tagline, W - pad * 2, `${tagFs}px ${font}`);
    tagAdv = ts * 0.06 + tagLines.length * tagFs * 1.35;
  }
  const ulAdv = o.underline ? ts * 0.10 + Math.max(2, Math.round(ts * 0.075)) : 0;
  const devBelow = o.dev && base >= 0;
  const devAdv = devBelow ? Math.round(ts * 0.27) * 1.1 : 0;
  const blockH = lines.length * lh + ulAdv + tagAdv + devAdv;

  ctx.textAlign = align; ctx.textBaseline = "alphabetic";
  // bottom anchor: the block's bottom edge lands exactly on ay
  let y = base === 0 ? ay - blockH / 2 + lh
        : base > 0 ? ay + lh
        : ay - blockH;

  const gx = ax;
  const shOff = o.hardshadow ? Math.max(2, Math.round(ts * 0.055)) : 0;

  // title with glow + stroke
  ctx.font = `700 ${ts}px ${font}`;
  ctx.shadowColor = o.glowCol; ctx.shadowBlur = ts * (o.glow / 100) * 0.9;
  if (o.stroke > 0) {
    ctx.lineWidth = Math.max(1, ts / 14 * (o.stroke / 70));
    ctx.strokeStyle = hexA(o.strokeCol || "#000000", 0.75);
  }
  let maxW = 0;
  for (const ln of lines) {
    const lw = ctx.measureText(ln).width;   // letterSpacing already applied
    if (lw > maxW) maxW = lw;
    if (o.stroke > 0) ctx.strokeText(ln, gx, y);
    if (o.hardshadow) {
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle = (o.strokeCol && o.strokeCol.toLowerCase() !== "#000000")
        ? hexA(o.strokeCol, 0.9) : "rgba(0,0,0,0.85)";
      ctx.fillText(ln, gx + shOff, y + shOff);
      ctx.restore();
    }
    ctx.fillStyle = o.text; ctx.fillText(ln, gx, y); y += lh;
  }
  ctx.shadowBlur = 0;

  // accent rule under the title
  if (o.underline && maxW > 0) {
    const bh = Math.max(2, Math.round(ts * 0.075));
    const bx = align === "left" ? gx : align === "right" ? gx - maxW : gx - maxW / 2;
    y += ts * 0.04;
    ctx.fillStyle = o.accent;
    ctx.fillRect(bx, y, maxW, bh);
    y += bh + ts * 0.06;
  }
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  if (tagLines.length) {
    y += ts * 0.06;
    ctx.font = `${tagFs}px ${font}`;
    ctx.fillStyle = hexA(o.text, 0.85); ctx.shadowColor = "rgba(0,0,0,.8)"; ctx.shadowBlur = tagFs / 3;
    for (const ln of tagLines) {
      ctx.fillText(ln, gx, y + tagFs); y += tagFs * 1.35;
    }
    ctx.shadowBlur = 0;
  }
  if (o.dev) {
    const fs = Math.round(ts * 0.27);
    ctx.font = `700 ${fs}px ${font}`;
    ctx.fillStyle = o.accent; ctx.shadowColor = "rgba(0,0,0,.8)"; ctx.shadowBlur = fs / 3;
    const tag = "by " + o.dev;
    if (base > 0) { // below title block
      ctx.textAlign = align; ctx.fillText(tag, gx, y + fs * 1.1);
    } else if (base === 0) {
      ctx.fillText(tag, gx, y + fs * 1.1);
    } else { // top corner mark
      ctx.textAlign = o.anchor[1] === "l" ? "right" : o.anchor[1] === "r" ? "left" : "center";
      const cx = o.anchor[1] === "l" ? W - pad : o.anchor[1] === "r" ? pad : ax;
      const cy = o.anchor[0] === "b" ? pad + fs : ay;
      ctx.fillText(tag, cx, cy + fs * 0.8);
    }
    ctx.shadowBlur = 0;
  }
}

function wrap(ctx, text, maxW, font) {
  ctx.font = font;
  const words = text.split(/\s+/), out = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; }
    else cur = t;
  }
  if (cur) out.push(cur);
  return out.slice(0, 4);
}

/* ---------- badges ---------- */
function drawBadges(ctx, W, H, o) {
  if (!o.badges || !o.plats.length) return;
  const fs = Math.round(Math.min(W, H) * 0.036);
  ctx.font = `700 ${fs}px ui-monospace, Menlo, monospace`;
  const items = o.plats;
  const gap = fs * 0.5, padX = fs * 0.75, h = fs * 1.9;
  const widths = items.map(p => ctx.measureText(p).width + padX * 2);
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = (W - totalW) / 2, y = H - h - Math.round(Math.min(W, H) * 0.035);
  for (let i = 0; i < items.length; i++) {
    ctx.fillStyle = "rgba(8,8,12,0.66)";
    rrect(ctx, x, y, widths[i], h, h / 2); ctx.fill();
    ctx.strokeStyle = hexA(o.accent, 0.85); ctx.lineWidth = Math.max(1, fs / 10);
    rrect(ctx, x, y, widths[i], h, h / 2); ctx.stroke();
    ctx.fillStyle = o.text; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(items[i], x + widths[i] / 2, y + h / 2 + fs * 0.06);
    x += widths[i] + gap;
  }
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/* ---------- palette extraction ----------
 * Buckets a downscaled copy of the art into 4-bit color bins, skips near-grays,
 * returns up to 5 diversified hex colors — the loudest colors in the art. */
function colorDist(a, b) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);
}
function extractPalette(img) {
  const N = 48;
  const c = document.createElement("canvas");
  c.width = N; c.height = Math.max(1, Math.round(N * img.height / img.width));
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(img, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  const bins = new Map();
  for (let i = 0; i < d.length; i += 16) {   // every 4th pixel is plenty
    const r = d[i] >> 4, g = d[i + 1] >> 4, b = d[i + 2] >> 4;
    if (Math.max(r, g, b) - Math.min(r, g, b) < 2) continue;  // skip grays
    const key = (r << 8) | (g << 4) | b;
    bins.set(key, (bins.get(key) || 0) + 1);
  }
  const out = [];
  for (const [key] of [...bins.entries()].sort((a, b) => b[1] - a[1])) {
    const hex = "#" + [(key >> 8) & 15, (key >> 4) & 15, key & 15]
      .map(v => (v * 17).toString(16).padStart(2, "0")).join("");
    if (out.some(h => colorDist(h, hex) < 48)) continue;  // diversify
    out.push(hex);
    if (out.length === 5) break;
  }
  return out;
}

/* ---------- main render ---------- */
function render(W, H, opts) {
  const t = TEMPLATES[state.template];
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");

  // 1. background
  const src = state.bgIndex >= 0 ? state.images[state.bgIndex] : state.sample;
  if (src) drawCover(x, src, W, H, state.crop, state.blur);
  else {
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, t.g[0]); g.addColorStop(1, t.g[1]);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  }

  // 2. template gradient overlay for text legibility
  const ov = x.createLinearGradient(0, H * 0.25, 0, H);
  ov.addColorStop(0, "rgba(0,0,0,0)");
  ov.addColorStop(1, `rgba(0,0,0,${state.grad / 100})`);
  x.fillStyle = ov; x.fillRect(0, 0, W, H);

  // 3. scanlines
  if (state.scan) {
    x.fillStyle = "rgba(0,0,0,0.16)";
    for (let y = 0; y < H; y += 4) x.fillRect(0, y, W, 1);
  }

  // 4. vignette
  if (state.vig > 0) {
    const v = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${state.vig / 100})`);
    x.fillStyle = v; x.fillRect(0, 0, W, H);
  }

  // 4.5 film grain (seeded, stable across refreshes)
  grainLayer(x, W, H, state.grain / 100 * 0.5, 1234);

  // 5. text
  drawTextBlock(x, W, H, {
    anchor: state.anchor, title: state.title, tagline: state.tagline, dev: state.dev,
    text: state.textcolor, accent: state.accent, glow: state.glow, glowCol: t.glow,
    tsize: state.tsize, badges: state.badges, plats: state.plats,
    font: state.font, ls: state.ls, upper: state.upper,
    stroke: state.stroke, strokeCol: state.strokecol,
    hardshadow: state.hardshadow, underline: state.underline,
  });

  // 6. badges
  drawBadges(x, W, H, { badges: state.badges, plats: state.plats, accent: state.accent, text: state.textcolor });

  // 7. optional watermark (on by default when toggled; burned into exports)
  if ((!opts || opts.wm !== false) && state.wm) {
    const wf = Math.round(Math.min(W, H) * 0.024);
    x.font = `${wf}px ui-monospace, Menlo, monospace`;
    x.textAlign = "right"; x.textBaseline = "bottom";
    x.fillStyle = "rgba(255,255,255,0.45)";
    x.fillText("made with CapsuleForge", W - wf, H - wf * 0.8);
  }

  // 8. safe-area guide — preview only, NEVER exported
  if (opts && opts.guide && state.safe) {
    const gx = W * 0.08, gy = H * 0.08;
    x.save();
    x.strokeStyle = "rgba(255,255,255,0.5)"; x.lineWidth = Math.max(1, W / 400);
    x.setLineDash([Math.max(4, W / 60), Math.max(3, W / 90)]);
    x.strokeRect(gx, gy, W - gx * 2, H - gy * 2);
    x.restore();
  }

  return c;
}

/* ---------- preview ---------- */
function refresh() {
  const [id, W, H] = SIZES.find(s => s[0] === state.size);
  const out = render(W, H, { guide: true });
  const pv = $("preview");
  pv.width = W; pv.height = H;
  pv.getContext("2d").drawImage(out, 0, 0);
  window.__lastRender = out;
}

/* ---------- export ---------- */
function download(canvas, name, forcePng) {
  const fmt = (!forcePng && state.format === "jpg") ? "jpg" : "png";
  const url = canvas.toDataURL(fmt === "jpg" ? "image/jpeg" : "image/png",
                               fmt === "jpg" ? state.jpgq / 100 : undefined);
  const fname = name.replace(/\.png$/i, "." + fmt);
  if (window.AndroidBridge && typeof window.AndroidBridge.savePNG === "function") {
    window.AndroidBridge.savePNG(fname, url); return; }   // WebView: hand to native bridge
  const a = document.createElement("a");
  a.download = fname;
  a.href = url;
  a.click();
}
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "game"; }

/* ---------- contact sheet ---------- */
/* One live preview of the current design at every export size, so a crop
 * that beheads the hero art on the thumbnail is visible before exporting. */
function showContactSheet() {
  const CELL_W = 300, CELL_H = 240, LABEL_H = 26, GAP = 18, COLS = 3;
  const cells = SIZES.map(([id, W, H, name]) => {
    const s = Math.min(1, CELL_W / W, CELL_H / H);
    return { id, W, H, name, w: Math.round(W * s), h: Math.round(H * s), img: render(W, H) };
  });
  const rows = Math.ceil(cells.length / COLS);
  const sheet = $("sheetcanvas");
  sheet.width = COLS * (CELL_W + GAP) + GAP;
  sheet.height = rows * (CELL_H + LABEL_H + GAP) + GAP;
  const x = sheet.getContext("2d");
  x.fillStyle = "#0b0b11"; x.fillRect(0, 0, sheet.width, sheet.height);
  cells.forEach((c, i) => {
    const cx = GAP + (i % COLS) * (CELL_W + GAP);
    const cy = GAP + Math.floor(i / COLS) * (CELL_H + LABEL_H + GAP);
    // checkerboard so transparency/letterboxing reads honestly
    x.fillStyle = "#14141c"; x.fillRect(cx, cy, CELL_W, CELL_H);
    x.drawImage(c.img, cx + (CELL_W - c.w) / 2, cy + (CELL_H - c.h) / 2, c.w, c.h);
    x.strokeStyle = "#2b2b3d"; x.lineWidth = 1;
    x.strokeRect(cx + .5, cy + .5, CELL_W - 1, CELL_H - 1);
    x.fillStyle = "#9a9ab0"; x.font = "11px ui-monospace, Menlo, monospace";
    x.textAlign = "center"; x.textBaseline = "top";
    x.fillText(`${c.name} — ${c.W}×${c.H}`, cx + CELL_W / 2, cy + CELL_H + 6);
  });
  window.__sheetCanvas = sheet;
  $("sheetmodal").hidden = false;
}
function closeContactSheet() { $("sheetmodal").hidden = true; }

/* ---------- UI wiring ---------- */
/* set every control from state — used after restore-from-storage and reset */
function syncUI() {
  $("title").value = state.title; $("tagline").value = state.tagline;
  $("dev").value = state.dev; $("accent").value = state.accent;
  $("textcolor").value = state.textcolor;
  $("font").value = state.font; $("anchor").value = state.anchor;
  $("upper").checked = !!state.upper; $("scan").checked = !!state.scan;
  $("badges").checked = !!state.badges; $("safe").checked = !!state.safe;
  $("wm").checked = !!state.wm;
  const setR = (id, lbl, v, suffix) => {
    $(id).value = v;
    $(lbl).textContent = suffix === "px" ? v + "px" : suffix === "auto" ? (v ? v + "px" : "auto") : v + "%";
  };
  setR("glow", "glowv", state.glow); setR("vig", "vigv", state.vig);
  setR("grad", "gradv", state.grad); setR("crop", "cropv", state.crop);
  setR("ls", "lsv", state.ls); setR("stroke", "strokev", state.stroke);
  setR("grain", "grainv", state.grain);
  setR("blur", "blurv", state.blur, "px");
  setR("tsize", "tsizev", state.tsize, "auto");
  $("strokecol").value = state.strokecol;
  $("hardshadow").checked = !!state.hardshadow;
  $("underline").checked = !!state.underline;
  $("format").value = state.format;
  $("jpgq").value = state.jpgq; $("jpgqv").textContent = state.jpgq + "%";
  $("jpgqrow").hidden = state.format !== "jpg";
  $("export").textContent = "⬇ Download " + state.format.toUpperCase();
  document.querySelectorAll("#artstyles button").forEach(b =>
    b.classList.toggle("on", b.dataset.style === state.sampleStyle));
  document.querySelectorAll("#plats input").forEach((el, i) =>
    el.checked = state.plats.includes(PLATFORMS[i]));
  [...$("tpls").children].forEach((el, i) =>
    el.classList.toggle("on", Object.keys(TEMPLATES)[i] === state.template));
  [...$("sizes").children].forEach((el, i) =>
    el.classList.toggle("on", SIZES[i][0] === state.size));
  markThumb(state.bgIndex);
}

function init() {
  // template swatches
  const tg = $("tpls");
  for (const [key, t] of Object.entries(TEMPLATES)) {
    const d = document.createElement("div");
    d.className = "tpl" + (key === state.template ? " on" : "");
    d.style.background = `linear-gradient(135deg, ${t.g[0]}, ${t.g[1]} 60%), radial-gradient(circle at 70% 30%, ${t.glow}44, transparent 60%)`;
    d.innerHTML = `<span>${t.name}</span>`;
    d.onclick = () => {
      state.template = key;
      [...tg.children].forEach((el, i) => el.classList.toggle("on", Object.keys(TEMPLATES)[i] === key));
      if (!state.images.length) genSample(true);   // re-tint sample to the new template
      refresh();
    };
    tg.appendChild(d);
  }

  // sizes
  const sg = $("sizes");
  for (const [id, W, H, label] of SIZES) {
    const b = document.createElement("button");
    b.textContent = `${label} ${W}×${H}`;
    b.className = id === state.size ? "on" : "";
    b.onclick = () => {
      state.size = id;
      [...sg.children].forEach((el, i) => el.classList.toggle("on", SIZES[i][0] === id));
      refresh();
    };
    sg.appendChild(b);
  }

  // platform checkboxes
  const pg = $("plats");
  for (const p of PLATFORMS) {
    const l = document.createElement("label");
    l.innerHTML = `<input type="checkbox" ${state.plats.includes(p) ? "checked" : ""}> ${p}`;
    l.querySelector("input").onchange = e => {
      state.plats = e.target.checked ? [...state.plats, p] : state.plats.filter(x => x !== p);
      refresh();
    };
    pg.appendChild(l);
  }

  // font select
  const fs = $("font");
  for (const [key, f] of Object.entries(FONTS)) {
    const o = document.createElement("option");
    o.value = key; o.textContent = f.name;
    if (key === state.font) o.selected = true;
    fs.appendChild(o);
  }
  fs.onchange = e => { state.font = e.target.value; refresh(); };

  // safe-area guide + watermark toggles
  $("safe").onchange = e => { state.safe = e.target.checked; refresh(); };
  $("wm").onchange = e => { state.wm = e.target.checked; refresh(); };

  // reset art direction to defaults (keeps uploaded images + sample style)
  $("reset").onclick = () => {
    Object.assign(state, {
      template: "ember", size: "cover", font: "block", anchor: "bl",
      accent: "#ff6b4a", textcolor: "#ffffff",
      glow: 40, vig: 35, grad: 55, tsize: 0, crop: 50,
      ls: 6, upper: true, stroke: 70, strokecol: "#000000",
      hardshadow: false, underline: false, format: "png", jpgq: 90,
      grain: 0, blur: 0, safe: false, wm: false, scan: false,
      badges: true, plats: ["Windows", "macOS", "Linux", "Web"],
    });
    syncUI();
    if (!state.images.length) genSample(true);
    refresh();
    persist();
  };

  // randomize art direction — accents roll from a curated list, no muddy randoms
  $("rand").onclick = () => {
    const keys = Object.keys(TEMPLATES), fkeys = Object.keys(FONTS);
    const anchors = ["bl", "bc", "br", "cl", "cc", "cr", "tl", "tc", "tr"];
    state.template = keys[(Math.random() * keys.length) | 0];
    state.font = fkeys[(Math.random() * fkeys.length) | 0];
    state.anchor = anchors[(Math.random() * anchors.length) | 0];
    state.accent = CURATED_ACCENTS[(Math.random() * CURATED_ACCENTS.length) | 0];
    syncUI();
    if (!state.images.length) genSample(true);
    refresh();
    persist();
  };

  // text inputs (title edits re-seed the sample art, debounced)
  let titleT = null;
  const bind = (id, key) => { $(id).oninput = e => { state[key] = e.target.value; refresh(); }; };
  bind("tagline", "tagline"); bind("dev", "dev");
  $("title").oninput = e => {
    state.title = e.target.value;
    clearTimeout(titleT);
    titleT = setTimeout(() => { if (state.bgIndex < 0) genSample(true); }, 400);
    refresh();
  };
  $("accent").oninput = e => { state.accent = e.target.value; refresh(); };
  $("textcolor").oninput = e => { state.textcolor = e.target.value; refresh(); };

  // ranges
  const bindR = (id, key, label) => {
    $(id).oninput = e => {
      state[key] = +e.target.value;
      if (label) $(label).textContent = e.target.value + "%";
      refresh();
    };
  };
  bindR("glow", "glow", "glowv"); bindR("vig", "vig", "vigv");
  bindR("grad", "grad", "gradv"); bindR("crop", "crop", "cropv");
  $("tsize").oninput = e => {
    state.tsize = +e.target.value;
    $("tsizev").textContent = state.tsize ? state.tsize + "px" : "auto";
    refresh();
  };
  $("anchor").onchange = e => { state.anchor = e.target.value; refresh(); };
  $("badges").onchange = e => { state.badges = e.target.checked; refresh(); };
  $("upper").onchange = e => { state.upper = e.target.checked; refresh(); };
  $("strokecol").oninput = e => { state.strokecol = e.target.value; refresh(); };
  bindR("ls", "ls", "lsv"); bindR("stroke", "stroke", "strokev");
  bindR("grain", "grain", "grainv");
  $("blur").oninput = e => { state.blur = +e.target.value; $("blurv").textContent = e.target.value + "px"; refresh(); };
  $("scan").onchange = e => { state.scan = e.target.checked; refresh(); };

  // drop zone (with dragleave counter to stop flicker)
  const dz = $("drop"), fi = $("file");
  let dragDepth = 0;
  dz.onclick = () => fi.click();
  dz.ondragover = e => { e.preventDefault(); dz.classList.add("over"); };
  dz.ondragenter = e => { e.preventDefault(); dragDepth++; dz.classList.add("over"); };
  dz.ondragleave = () => { if (--dragDepth <= 0) { dragDepth = 0; dz.classList.remove("over"); } };
  dz.ondrop = e => { e.preventDefault(); dragDepth = 0; dz.classList.remove("over"); loadFiles(e.dataTransfer.files); };
  fi.onchange = () => loadFiles(fi.files);
  // dropping a file anywhere else must not navigate away and nuke the session
  document.addEventListener("dragover", e => e.preventDefault());
  document.addEventListener("drop", e => e.preventDefault());

  addSampleTile();

  // sample-art styles: segmented picker — regenerates the stand-in and selects it
  const asg = $("artstyles");
  for (const [key, label] of SAMPLE_STYLES) {
    const b = document.createElement("button");
    b.textContent = label; b.dataset.style = key;
    b.className = key === state.sampleStyle ? "on" : "";
    b.onclick = () => {
      state.sampleStyle = key;
      [...asg.children].forEach(el => el.classList.toggle("on", el.dataset.style === key));
      genSample(true);
      state.bgIndex = -1; markThumb(-1);
      refresh(); persist();
    };
    asg.appendChild(b);
  }

  // curated art-direction presets — one click sets a whole look
  const prg = $("presets");
  for (const [key, p] of Object.entries(PRESETS)) {
    const b = document.createElement("button");
    b.className = "preset";
    const nm = document.createElement("b"); nm.textContent = p.label;
    const ds = document.createElement("i"); ds.textContent = p.desc;
    b.appendChild(nm); b.appendChild(ds);
    b.onclick = () => {
      Object.assign(state, p.apply);
      if (!state.images.length) genSample(true);
      syncUI(); refresh(); persist();
    };
    prg.appendChild(b);
  }

  // palette extraction — loudest colors from the current backdrop
  $("pullpal").onclick = () => {
    const src = state.bgIndex >= 0 ? state.images[state.bgIndex] : state.sample;
    const row = $("palrow");
    row.innerHTML = "";
    if (!src) return;
    const pal = extractPalette(src);
    if (!pal.length) {
      row.innerHTML = `<span class="hint">No strong colors in this one — try a busier screenshot.</span>`;
      return;
    }
    for (const hex of pal) {
      const s = document.createElement("button");
      s.className = "palswatch"; s.style.background = hex; s.title = hex;
      s.onclick = () => { state.accent = hex; $("accent").value = hex; refresh(); persist(); };
      row.appendChild(s);
    }
  };

  // export format
  const updExportLabel = () => { $("export").textContent = "⬇ Download " + state.format.toUpperCase(); };
  $("format").onchange = e => {
    state.format = e.target.value;
    $("jpgqrow").hidden = state.format !== "jpg";
    updExportLabel(); refresh();
  };
  $("jpgq").oninput = e => {
    state.jpgq = +e.target.value;
    $("jpgqv").textContent = e.target.value + "%";
  };
  updExportLabel();

  // title effects
  $("hardshadow").onchange = e => { state.hardshadow = e.target.checked; refresh(); };
  $("underline").onchange = e => { state.underline = e.target.checked; refresh(); };

  // export
  $("export").onclick = () => {
    const [id, W, H] = SIZES.find(s => s[0] === state.size);
    download(render(W, H), `${slug(state.title)}-${id}-${W}x${H}.png`);
  };
  // export-all is swapped for an upsell link in the free demo build — guard it
  if ($("exportall")) $("exportall").onclick = async () => {
    for (const [id, W, H] of SIZES) {
      download(render(W, H), `${slug(state.title)}-${id}-${W}x${H}.png`);
      await new Promise(r => setTimeout(r, 350)); // let the browser breathe between downloads
    }
  };

  // contact sheet — preview every size at once
  $("contactsheet").onclick = showContactSheet;
  $("sheetclose").onclick = closeContactSheet;
  $("sheetdl").onclick = () =>
    download(window.__sheetCanvas, `${slug(state.title)}-contact-sheet.png`, true);
  $("sheetmodal").addEventListener("click", e => {
    if (e.target === $("sheetmodal")) closeContactSheet();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !$("sheetmodal").hidden) closeContactSheet();
  });

  // brand persistence — restores state AND syncs every control (P0 fix)
  try {
    const saved = JSON.parse(localStorage.getItem("capsuleforge") || "null");
    if (saved) Object.assign(state, saved);
  } catch (e) {}
  const persist = () => {
    const { title, tagline, dev, accent, textcolor, template, size, anchor, glow, vig, grad, tsize, crop, badges, plats, font, ls, upper, stroke, strokecol, grain, blur, safe, wm, sampleStyle, hardshadow, underline, format, jpgq } = state;
    try { localStorage.setItem("capsuleforge", JSON.stringify({ title, tagline, dev, accent, textcolor, template, size, anchor, glow, vig, grad, tsize, crop, badges, plats, font, ls, upper, stroke, strokecol, grain, blur, safe, wm, sampleStyle, hardshadow, underline, format, jpgq })); } catch (e) {}
  };
  document.addEventListener("input", persist);
  document.addEventListener("change", persist);
  syncUI();

  genSample();
  refresh();
}

function genSample(force) {
  if (state.sample && !force) return;
  const t = TEMPLATES[state.template];
  state.sample = makeSampleArt(1280, 720, t.glow, t.g[1],
    seedFrom(state.title, state.sampleStyle), state.sampleStyle);
  refresh();
}

function loadFiles(files) {
  const imgs = [...files].filter(f => f.type.startsWith("image/"));
  if (!imgs.length) return;
  const fi = $("file");
  let pending = imgs.length;
  const done = () => { if (--pending === 0) { fi.value = ""; refresh(); } };
  imgs.forEach(f => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      state.images.push(img);
      addThumb(img, state.images.length - 1);
      if (state.images.length === 1) { state.bgIndex = 0; markThumb(0); }
      done();
    };
    img.onerror = () => { URL.revokeObjectURL(url); done(); }; // corrupt/unsupported → skip, don't stall
    img.src = url;
  });
}

function addThumb(img, idx) {
  const wrap = document.createElement("div");
  wrap.className = "thumbwrap"; wrap.dataset.idx = idx;
  const t = document.createElement("img");
  t.src = img.src; t.className = "thumb";
  t.title = "Click to use as background";
  t.onclick = () => { state.bgIndex = idx; markThumb(idx); refresh(); };
  const x = document.createElement("span");
  x.className = "thumbx"; x.textContent = "×"; x.title = "Remove";
  x.onclick = (e) => {
    e.stopPropagation();
    removeImage(idx);
  };
  wrap.appendChild(t); wrap.appendChild(x);
  $("thumbs").appendChild(wrap);
}
function markThumb(idx) {
  document.querySelectorAll(".thumbwrap").forEach(el =>
    el.classList.toggle("on", +el.dataset.idx === idx));
  const st = $("sampletile");
  if (st) st.classList.toggle("on", idx === -1);
}
/* sample-art tile: lets the user switch back to generated art after uploading */
function addSampleTile() {
  if ($("sampletile")) return;
  const d = document.createElement("div");
  d.className = "thumbwrap on"; d.id = "sampletile"; d.dataset.idx = "-1";
  d.title = "Use generated sample art";
  d.innerHTML = `<div class="thumbsample">✦</div>`;
  d.onclick = () => { state.bgIndex = -1; markThumb(-1); refresh(); };
  $("thumbs").prepend(d);
}
function removeImage(idx) {
  const img = state.images[idx];
  if (!img) return;
  URL.revokeObjectURL(img.src);
  state.images.splice(idx, 1);
  // rebuild thumbs (indexes shifted)
  $("thumbs").innerHTML = "";
  addSampleTile();
  state.images.forEach((im, i) => addThumb(im, i));
  if (state.bgIndex === idx) state.bgIndex = state.images.length ? 0 : -1;
  else if (state.bgIndex > idx) state.bgIndex--;
  markThumb(state.bgIndex);
  refresh();
}

// ---------- touch sliders ----------
// Native range inputs are unreliable under touch: the first touchmove snaps the
// value before the browser claims the gesture for scrolling. Take over: lock the
// gesture direction on the dominant axis — horizontal adjusts, vertical scrolls.
function initTouchSliders() {
  document.querySelectorAll("input[type=range]").forEach((el) => {
    el.style.touchAction = "none";
    let startX = 0, startY = 0, prevY = 0, mode = null;
    el.addEventListener("touchstart", (e) => {
      e.preventDefault();                    // block native tap-snap: value only changes on horizontal drag
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY; prevY = t.clientY; mode = null;
    }, { passive: false });
    el.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      const dx = t.clientX - startX, dy = t.clientY - startY;
      if (!mode && (Math.abs(dx) > 6 || Math.abs(dy) > 6))
        mode = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
      if (mode === "h") {
        e.preventDefault();                      // no native adjust, no scroll
        const r = el.getBoundingClientRect();
        const min = +el.min, max = +el.max;
        let v = min + (max - min) * ((t.clientX - r.left) / r.width);
        v = Math.max(min, Math.min(max, Math.round(v)));
        if (v !== +el.value) {
          el.value = v;
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      } else if (mode === "v") {
        window.scrollBy(0, prevY - t.clientY);   // content follows the finger
      }
      prevY = t.clientY;
    }, { passive: false });
  });
}
initTouchSliders();

init();
/* test hook */
window.__cf = { state, render, SIZES, TEMPLATES, FONTS, PLATFORMS, CONFIG, ITCH_URL, PRESETS, SAMPLE_STYLES, syncUI, refresh, hexA, drawCover, extractPalette, seedFrom, makeSampleArt };
