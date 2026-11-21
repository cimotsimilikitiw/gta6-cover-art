/** Cover renderer: multi-panel GTA-poster-style composition on a canvas. */

const SIZES = {
  '1080x1080': { w: 1080, h: 1080 },
  '1080x1350': { w: 1080, h: 1350 },
  '1920x1080': { w: 1920, h: 1080 },
};

export function sizeFor(key) {
  return SIZES[key] || SIZES['1080x1080'];
}

function fitCover(img, dw, dh) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.max(dw / sw, dh / sh);
  const cw = dw / scale;
  const ch = dh / scale;
  return { sx: (sw - cw) / 2, sy: (sh - ch) / 2, sw: cw, sh: ch };
}

function drawPhotoPanel(ctx, img, x, y, w, h, opts = {}) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (img) {
    const base = fitCover(img, w, h);
    const zoom = opts.zoom || 1;
    const ox = (opts.ox || 0) * base.sw;
    const oy = (opts.oy || 0) * base.sh;
    const sw = base.sw / zoom;
    const sh = base.sh / zoom;
    const sx = base.sx + (base.sw - sw) / 2 + ox;
    const sy = base.sy + (base.sh - sh) / 2 + oy;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  } else {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#ff8f66');
    g.addColorStop(0.45, '#8d3d8f');
    g.addColorStop(1, '#1a1038');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffffff18';
    for (let i = 0; i < 8; i++) ctx.fillRect(x, y + i * h / 8, w, 1);
  }
  const grade = ctx.createLinearGradient(x, y, x, y + h);
  grade.addColorStop(0, opts.top || 'rgba(255, 120, 80, 0.12)');
  grade.addColorStop(0.55, opts.mid || 'rgba(120, 30, 110, 0.08)');
  grade.addColorStop(1, opts.bottom || 'rgba(20, 8, 40, 0.45)');
  ctx.fillStyle = grade;
  ctx.fillRect(x, y, w, h);
  if (opts.tint) {
    ctx.fillStyle = opts.tint;
    ctx.fillRect(x, y, w, h);
  }
  // subtle neon edge glow
  const edge = ctx.createLinearGradient(x, y, x + w, y);
  edge.addColorStop(0, 'rgba(255, 90, 180, 0.12)');
  edge.addColorStop(1, 'rgba(80, 220, 255, 0.08)');
  ctx.fillStyle = edge;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function panelLayout(w, h) {
  const pad = Math.round(Math.min(w, h) * 0.022);
  const gap = Math.round(Math.min(w, h) * 0.012);
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  if (w >= h) {
    // landscape: big left, two stacked right
    const leftW = Math.round(innerW * 0.58);
    const rightW = innerW - leftW - gap;
    const topH = Math.round(innerH * 0.52);
    const bottomH = innerH - topH - gap;
    return {
      pad, gap,
      panels: [
        { x: pad, y: pad, w: leftW, h: innerH, zoom: 1.05, ox: 0, oy: 0, bottom: 'rgba(20,8,40,0.35)' },
        { x: pad + leftW + gap, y: pad, w: rightW, h: topH, zoom: 1.35, ox: 0.08, oy: -0.08, tint: 'rgba(255,70,140,0.10)', bottom: 'rgba(35,10,60,0.40)' },
        { x: pad + leftW + gap, y: pad + topH + gap, w: rightW, h: bottomH, zoom: 1.55, ox: -0.05, oy: 0.12, tint: 'rgba(60,200,255,0.08)', bottom: 'rgba(15,5,35,0.45)' },
      ],
    };
  }
  if (h > w * 1.15) {
    // portrait: big top, two bottom
    const topH = Math.round(innerH * 0.58);
    const bottomH = innerH - topH - gap;
    const leftW = Math.round(innerW * 0.5);
    const rightW = innerW - leftW - gap;
    return {
      pad, gap,
      panels: [
        { x: pad, y: pad, w: innerW, h: topH, zoom: 1.02, ox: 0, oy: -0.02, bottom: 'rgba(20,8,40,0.30)' },
        { x: pad, y: pad + topH + gap, w: leftW, h: bottomH, zoom: 1.45, ox: -0.06, oy: 0.05, tint: 'rgba(255,70,140,0.10)', bottom: 'rgba(35,10,60,0.42)' },
        { x: pad + leftW + gap, y: pad + topH + gap, w: rightW, h: bottomH, zoom: 1.6, ox: 0.08, oy: 0.1, tint: 'rgba(60,200,255,0.08)', bottom: 'rgba(15,5,35,0.45)' },
      ],
    };
  }
  // square: big left, two stacked right
  const leftW = Math.round(innerW * 0.56);
  const rightW = innerW - leftW - gap;
  const topH = Math.round(innerH * 0.52);
  const bottomH = innerH - topH - gap;
  return {
    pad, gap,
    panels: [
      { x: pad, y: pad, w: leftW, h: innerH, zoom: 1.04, ox: 0, oy: 0, bottom: 'rgba(20,8,40,0.32)' },
      { x: pad + leftW + gap, y: pad, w: rightW, h: topH, zoom: 1.4, ox: 0.07, oy: -0.06, tint: 'rgba(255,70,140,0.10)', bottom: 'rgba(35,10,60,0.40)' },
      { x: pad + leftW + gap, y: pad + topH + gap, w: rightW, h: bottomH, zoom: 1.55, ox: -0.04, oy: 0.1, tint: 'rgba(60,200,255,0.08)', bottom: 'rgba(15,5,35,0.45)' },
    ],
  };
}

function drawPanelBorders(ctx, panels, gap) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 245, 235, 0.92)';
  ctx.lineWidth = Math.max(2, gap * 0.65);
  for (const p of panels) ctx.strokeRect(p.x, p.y, p.w, p.h);
  ctx.restore();
}

function drawSunset(ctx, w, h) {
  const g = ctx.createLinearGradient(0, h * 0.15, 0, h);
  g.addColorStop(0, 'rgba(255, 170, 90, 0.00)');
  g.addColorStop(0.45, 'rgba(255, 90, 130, 0.05)');
  g.addColorStop(1, 'rgba(255, 120, 50, 0.10)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawTitle(ctx, w, h, caption) {
  const text = (caption || 'SUNSET HEIST').trim().toUpperCase();
  const margin = w * 0.06;
  const bandH = h * 0.19;
  const y = h - bandH;
  const band = ctx.createLinearGradient(0, y - h * 0.08, 0, h);
  band.addColorStop(0, 'rgba(0,0,0,0)');
  band.addColorStop(0.35, 'rgba(20,5,25,0.45)');
  band.addColorStop(1, 'rgba(15,4,20,0.88)');
  ctx.fillStyle = band;
  ctx.fillRect(0, y - h * 0.08, w, bandH + h * 0.08);

  // Original geometric VI motif (not a Rockstar logo).
  const vi = Math.min(w, h) * 0.072;
  const vx = margin + vi * 0.7;
  const vy = y + bandH * 0.44;
  ctx.save();
  ctx.strokeStyle = '#fff3ea';
  ctx.lineWidth = Math.max(3, vi * 0.1);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(vx - vi * 0.55, vy - vi * 0.48);
  ctx.lineTo(vx - vi * 0.18, vy + vi * 0.48);
  ctx.lineTo(vx + vi * 0.18, vy - vi * 0.48);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(vx + vi * 0.42, vy - vi * 0.48);
  ctx.lineTo(vx + vi * 0.42, vy + vi * 0.48);
  ctx.stroke();
  ctx.restore();

  const textX = vx + vi * 0.85;
  const maxWidth = w - textX - margin;
  let size = bandH * 0.42;
  ctx.font = `900 ${size}px Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 18) {
    size -= 2;
    ctx.font = `900 ${size}px Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif`;
  }
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff6ee';
  ctx.shadowColor = 'rgba(255, 90, 130, 0.55)';
  ctx.shadowBlur = size * 0.18;
  ctx.fillText(text, textX, vy);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(20, 5, 25, 0.55)';
  ctx.lineWidth = Math.max(1, size * 0.03);
  ctx.strokeText(text, textX, vy);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(255, 235, 220, 0.82)';
  ctx.font = `700 ${Math.max(12, bandH * 0.11)}px system-ui, sans-serif`;
  ctx.fillText('VICE CITY SUNSET EDITION', textX, vy + size * 0.52);
  ctx.restore();
}

export function drawCover(canvas, img, caption, sizeKey) {
  const { w, h } = sizeFor(sizeKey);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#2d1840');
  bg.addColorStop(0.5, '#7a315f');
  bg.addColorStop(1, '#ff9966');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const layout = panelLayout(w, h);
  for (const p of layout.panels) drawPhotoPanel(ctx, img, p.x, p.y, p.w, p.h, p);
  drawPanelBorders(ctx, layout.panels, layout.gap);
  drawSunset(ctx, w, h);
  drawTitle(ctx, w, h, caption);
}
