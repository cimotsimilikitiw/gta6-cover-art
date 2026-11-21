/**
 * Procedural multi-panel cover renderer.
 * Draws a GTA-inspired, original composition with Canvas 2D only.
 */

export const FORMATS = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  landscape: { w: 1920, h: 1080, label: '1920 × 1080' },
};

export function formatFor(key) {
  return FORMATS[key] || FORMATS.square;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function coverCrop(img, dx, dy, dw, dh, focusX = 0.5, focusY = 0.45, zoom = 1) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.max(dw / sw, dh / sh) * zoom;
  const cw = dw / scale;
  const ch = dh / scale;
  const sx = clamp(sw * focusX - cw / 2, 0, sw - cw);
  const sy = clamp(sh * focusY - ch / 2, 0, sh - ch);
  return { sx, sy, sw: cw, sh: ch, dx, dy, dw, dh };
}

function drawImagePanel(ctx, img, rect, opts = {}) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (img) {
    const c = coverCrop(img, x, y, w, h, opts.focusX ?? 0.5, opts.focusY ?? 0.45, opts.zoom ?? 1);
    ctx.filter = opts.filter || 'none';
    ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, c.dx, c.dy, c.dw, c.dh);
    ctx.filter = 'none';
  } else {
    const fallback = ctx.createLinearGradient(x, y, x + w, y + h);
    fallback.addColorStop(0, '#ff9a68');
    fallback.addColorStop(0.5, '#8e3b78');
    fallback.addColorStop(1, '#20103a');
    ctx.fillStyle = fallback;
    ctx.fillRect(x, y, w, h);
  }

  if (opts.tint) {
    ctx.fillStyle = opts.tint;
    ctx.fillRect(x, y, w, h);
  }

  const grade = ctx.createLinearGradient(x, y, x, y + h);
  grade.addColorStop(0, opts.top ?? 'rgba(255, 176, 120, 0.10)');
  grade.addColorStop(0.52, opts.mid ?? 'rgba(90, 20, 90, 0.06)');
  grade.addColorStop(1, opts.bottom ?? 'rgba(12, 4, 24, 0.48)');
  ctx.fillStyle = grade;
  ctx.fillRect(x, y, w, h);

  if (opts.vignette !== false) {
    const vg = ctx.createRadialGradient(x + w * 0.5, y + h * 0.45, Math.min(w, h) * 0.2, x + w * 0.5, y + h * 0.5, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(10, 3, 18, 0.28)');
    ctx.fillStyle = vg;
    ctx.fillRect(x, y, w, h);
  }

  ctx.restore();
}

function getLayout(w, h) {
  const margin = Math.round(Math.min(w, h) * 0.028);
  const gap = Math.round(Math.min(w, h) * 0.012);
  const inner = { x: margin, y: margin, w: w - margin * 2, h: h - margin * 2 };
  const panels = [];

  if (w / h > 1.35) {
    const leftW = Math.round(inner.w * 0.57);
    const rightW = inner.w - leftW - gap;
    const topH = Math.round(inner.h * 0.54);
    panels.push(
      { x: inner.x, y: inner.y, w: leftW, h: inner.h, zoom: 1.02, focusX: 0.5, focusY: 0.42, filter: 'saturate(1.08) contrast(1.04)' },
      { x: inner.x + leftW + gap, y: inner.y, w: rightW, h: topH, zoom: 1.28, focusX: 0.58, focusY: 0.35, tint: 'rgba(255, 84, 140, 0.12)', filter: 'saturate(1.18) contrast(1.08)' },
      { x: inner.x + leftW + gap, y: inner.y + topH + gap, w: rightW, h: inner.h - topH - gap, zoom: 1.45, focusX: 0.45, focusY: 0.6, tint: 'rgba(64, 210, 255, 0.10)', filter: 'saturate(1.12) hue-rotate(-6deg)' },
    );
  } else if (h / w > 1.15) {
    const topH = Math.round(inner.h * 0.57);
    const bottomH = inner.h - topH - gap;
    const leftW = Math.round(inner.w * 0.52);
    panels.push(
      { x: inner.x, y: inner.y, w: inner.w, h: topH, zoom: 1.03, focusX: 0.5, focusY: 0.38, filter: 'saturate(1.1) contrast(1.03)' },
      { x: inner.x, y: inner.y + topH + gap, w: leftW, h: bottomH, zoom: 1.35, focusX: 0.4, focusY: 0.55, tint: 'rgba(255, 90, 140, 0.11)', filter: 'saturate(1.2)' },
      { x: inner.x + leftW + gap, y: inner.y + topH + gap, w: inner.w - leftW - gap, h: bottomH, zoom: 1.52, focusX: 0.62, focusY: 0.52, tint: 'rgba(70, 210, 255, 0.09)', filter: 'saturate(1.08) contrast(1.06)' },
    );
  } else {
    const leftW = Math.round(inner.w * 0.56);
    const rightW = inner.w - leftW - gap;
    const topH = Math.round(inner.h * 0.52);
    panels.push(
      { x: inner.x, y: inner.y, w: leftW, h: inner.h, zoom: 1.04, focusX: 0.48, focusY: 0.42, filter: 'saturate(1.08) contrast(1.04)' },
      { x: inner.x + leftW + gap, y: inner.y, w: rightW, h: topH, zoom: 1.34, focusX: 0.58, focusY: 0.36, tint: 'rgba(255, 84, 140, 0.12)', filter: 'saturate(1.18)' },
      { x: inner.x + leftW + gap, y: inner.y + topH + gap, w: rightW, h: inner.h - topH - gap, zoom: 1.48, focusX: 0.46, focusY: 0.62, tint: 'rgba(64, 210, 255, 0.09)', filter: 'saturate(1.1) hue-rotate(-5deg)' },
    );
  }

  return { margin, gap, inner, panels };
}

function drawBackground(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#2a1146');
  sky.addColorStop(0.28, '#83345f');
  sky.addColorStop(0.58, '#ff8058');
  sky.addColorStop(0.78, '#ffbf72');
  sky.addColorStop(1, '#f9d39b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sunX = w * 0.76;
  const sunY = h * 0.34;
  const sunR = Math.min(w, h) * 0.18;
  const sun = ctx.createRadialGradient(sunX, sunY, sunR * 0.1, sunX, sunY, sunR);
  sun.addColorStop(0, 'rgba(255, 246, 214, 0.95)');
  sun.addColorStop(0.55, 'rgba(255, 170, 90, 0.7)');
  sun.addColorStop(1, 'rgba(255, 120, 80, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);
}

function drawScanlines(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#000';
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
  ctx.restore();
}

function drawPanelBorders(ctx, panels, gap) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 245, 236, 0.88)';
  ctx.lineWidth = Math.max(3, gap * 0.7);
  ctx.lineJoin = 'round';
  for (const p of panels) ctx.strokeRect(p.x, p.y, p.w, p.h);
  ctx.restore();
}

function drawPalm(ctx, baseX, baseY, scale, alpha) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#120718';
  ctx.fillStyle = '#120718';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-8, -55, 12, -120);
  ctx.quadraticCurveTo(22, -150, 18, -175);
  ctx.stroke();

  const fronds = [
    [-5, -170, -95, -210, -115, -185],
    [-2, -174, -65, -235, -70, -255],
    [8, -176, 5, -250, 20, -265],
    [18, -174, 78, -238, 98, -250],
    [20, -168, 110, -200, 130, -175],
    [14, -164, 70, -150, 95, -130],
    [-8, -164, -80, -150, -102, -125],
  ];
  ctx.lineWidth = 7;
  for (const [x0, y0, cx, cy, x1, y1] of fronds) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cx, cy, x1, y1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHorizon(ctx, w, h) {
  const y = h * 0.82;
  const haze = ctx.createLinearGradient(0, y - h * 0.08, 0, h);
  haze.addColorStop(0, 'rgba(255, 150, 100, 0)');
  haze.addColorStop(0.35, 'rgba(95, 20, 75, 0.22)');
  haze.addColorStop(1, 'rgba(16, 4, 28, 0.72)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, y - h * 0.08, w, h - (y - h * 0.08));

  ctx.save();
  ctx.fillStyle = 'rgba(18, 6, 28, 0.75)';
  ctx.fillRect(0, y, w, h - y);
  // skyline blocks
  const baseY = y + h * 0.02;
  const blockW = w / 24;
  for (let i = 0; i < 24; i++) {
    const bh = (h * 0.03) + (i % 5) * (h * 0.012) + ((i * 7) % 3) * (h * 0.008);
    ctx.fillRect(i * blockW, baseY - bh, blockW + 1, bh + h);
  }
  ctx.restore();

  drawPalm(ctx, w * 0.1, h * 0.95, Math.min(w, h) / 900, 0.72);
  drawPalm(ctx, w * 0.88, h * 0.97, Math.min(w, h) / 980, 0.62);
}

function drawWordmark(ctx, w, h, caption) {
  const title = (caption || 'NEON SUNSET').trim().toUpperCase() || 'NEON SUNSET';
  const safeMargin = w * 0.055;
  const bandTop = h * 0.78;
  const band = ctx.createLinearGradient(0, bandTop - h * 0.08, 0, h);
  band.addColorStop(0, 'rgba(14, 4, 24, 0)');
  band.addColorStop(0.35, 'rgba(20, 5, 30, 0.35)');
  band.addColorStop(1, 'rgba(12, 3, 20, 0.82)');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandTop - h * 0.08, w, h - bandTop + h * 0.08);

  // Top label
  ctx.save();
  ctx.fillStyle = 'rgba(255, 232, 214, 0.9)';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${Math.max(12, w * 0.016)}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.letterSpacing = '0.18em';
  ctx.fillText('GRAND THEFT AUTO', safeMargin, bandTop + h * 0.045);
  ctx.restore();

  // Geometric VI mark - original artwork, not a logo reproduction.
  const markH = Math.min(w, h) * 0.11;
  const markX = safeMargin;
  const markY = bandTop + h * 0.075;
  ctx.save();
  ctx.strokeStyle = '#fff4eb';
  ctx.lineWidth = Math.max(4, markH * 0.095);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(255, 120, 150, 0.45)';
  ctx.shadowBlur = markH * 0.18;
  // V
  ctx.beginPath();
  ctx.moveTo(markX, markY);
  ctx.lineTo(markX + markH * 0.24, markY + markH);
  ctx.lineTo(markX + markH * 0.48, markY);
  ctx.stroke();
  // I
  ctx.beginPath();
  ctx.moveTo(markX + markH * 0.64, markY);
  ctx.lineTo(markX + markH * 0.64, markY + markH);
  ctx.stroke();
  ctx.restore();

  // Caption
  const textX = markX + markH * 0.82;
  const maxW = w - textX - safeMargin;
  let size = Math.min(w, h) * 0.072;
  const font = (s) => `900 ${s}px Impact, Haettenschweiler, "Arial Narrow Bold", "Trebuchet MS", sans-serif`;
  ctx.font = font(size);
  while (ctx.measureText(title).width > maxW && size > 24) {
    size -= 2;
    ctx.font = font(size);
  }

  const textY = markY + markH * 0.72;
  ctx.save();
  ctx.font = font(size);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff7ef';
  ctx.shadowColor = 'rgba(255, 95, 140, 0.55)';
  ctx.shadowBlur = size * 0.22;
  ctx.fillText(title, textX, textY);
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(1.5, size * 0.03);
  ctx.strokeStyle = 'rgba(30, 8, 34, 0.45)';
  ctx.strokeText(title, textX, textY);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(255, 225, 200, 0.78)';
  ctx.font = `700 ${Math.max(11, size * 0.24)}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.fillText('VICE CITY STORIES', textX, textY + size * 0.36);
  ctx.restore();
}

function drawFrame(ctx, w, h, margin) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 230, 210, 0.22)';
  ctx.lineWidth = Math.max(2, margin * 0.2);
  ctx.strokeRect(margin * 0.45, margin * 0.45, w - margin * 0.9, h - margin * 0.9);
  ctx.restore();
}

export function renderCover(canvas, options = {}) {
  const format = formatFor(options.format || 'square');
  const w = format.w;
  const h = format.h;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.clearRect(0, 0, w, h);
  drawBackground(ctx, w, h);

  const layout = getLayout(w, h);
  for (const panel of layout.panels) {
    drawImagePanel(ctx, options.image || null, panel, panel);
  }
  drawPanelBorders(ctx, layout.panels, layout.gap);
  drawHorizon(ctx, w, h);
  drawScanlines(ctx, w, h);
  drawFrame(ctx, w, h, layout.margin);
  drawWordmark(ctx, w, h, options.caption || '');

  return { width: w, height: h, format: options.format || 'square' };
}
