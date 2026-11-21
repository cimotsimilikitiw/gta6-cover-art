import { renderCover, formatFor } from './cover.js';

const canvas = document.getElementById('cover');
const photoInput = document.getElementById('photoInput');
const captionInput = document.getElementById('captionInput');
const formatInput = document.getElementById('formatInput');
const downloadBtn = document.getElementById('downloadBtn');
const statusEl = document.getElementById('status');
const sampleButtons = Array.from(document.querySelectorAll('[data-sample]'));

const SAMPLE_PATHS = {
  pier: './samples/pier.jpg',
  boulevard: './samples/boulevard.jpg',
};

const state = {
  image: null,
  caption: captionInput.value || 'NEON SUNSET',
  format: 'square',
  sample: 'pier',
};

function setStatus(message) {
  statusEl.textContent = message;
}

function syncSampleButtons() {
  for (const btn of sampleButtons) {
    const active = btn.dataset.sample === state.sample;
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function draw() {
  renderCover(canvas, {
    image: state.image,
    caption: state.caption,
    format: state.format,
  });
}

async function setSample(name, announce = true) {
  const key = SAMPLE_PATHS[name] ? name : 'pier';
  state.sample = key;
  syncSampleButtons();
  try {
    state.image = await loadImage(SAMPLE_PATHS[key]);
    draw();
    if (announce) setStatus(`Loaded ${key} sample.`);
  } catch (err) {
    console.error(err);
    state.image = null;
    draw();
    if (announce) setStatus('Sample image could not be loaded.');
  }
}

function setFormat(format, announce = false) {
  state.format = formatFor(format) ? format : 'square';
  formatInput.value = state.format;
  draw();
  if (announce) setStatus(`Format: ${formatFor(state.format).label}.`);
}

function setCaption(value, announce = false) {
  state.caption = String(value || '').slice(0, 42);
  captionInput.value = state.caption;
  draw();
  if (announce) setStatus('Caption updated.');
}

photoInput.addEventListener('change', async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    state.image = img;
    state.sample = '';
    syncSampleButtons();
    draw();
    setStatus(`Loaded ${file.name}.`);
  } catch (err) {
    console.error(err);
    setStatus('That file could not be read as an image.');
  } finally {
    URL.revokeObjectURL(url);
  }
});

captionInput.addEventListener('input', (event) => {
  state.caption = event.target.value.slice(0, 42);
  draw();
});

formatInput.addEventListener('change', (event) => {
  setFormat(event.target.value, true);
});

for (const btn of sampleButtons) {
  btn.addEventListener('click', () => {
    void setSample(btn.dataset.sample);
  });
}

downloadBtn.addEventListener('click', () => {
  const { w, h } = formatFor(state.format);
  canvas.toBlob((blob) => {
    if (!blob) {
      setStatus('Export failed.');
      return;
    }
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `vice-cover-${state.format}-${w}x${h}.png`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
    setStatus('PNG exported.');
  }, 'image/png');
});

function sanitizeToken(value, fallback = '') {
  return String(value || fallback).toLowerCase().replace(/[^a-z0-9_-]+/g, '');
}

async function applyShotMode() {
  const params = new URLSearchParams(window.location.search);
  const shot = sanitizeToken(params.get('shot'));
  if (!shot) return false;

  document.body.classList.add(`shot-${shot}`);
  const view = sanitizeToken(params.get('view'));
  const isEditor = view === 'editor' || shot.includes('editor');
  const isCover = view === 'cover' || shot.includes('cover') || !isEditor;
  document.body.classList.add(isCover && !isEditor ? 'shot-cover' : 'shot-editor');

  const sample = sanitizeToken(params.get('photo'), 'pier');
  const caption = params.get('caption');
  const format = sanitizeToken(params.get('format') || params.get('size'), 'square');

  if (caption !== null) setCaption(caption);
  else setCaption(state.caption);
  setFormat(format);

  await setSample(SAMPLE_PATHS[sample] ? sample : 'pier', false);
  draw();

  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch { /* ignore */ }
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  window.__shotReady = true;
  window.__shotName = shot;
  window.__shotState = { shot, sample: state.sample, format: state.format, caption: state.caption };
  return true;
}

async function boot() {
  syncSampleButtons();
  setFormat(state.format);
  const shot = await applyShotMode();
  if (!shot) {
    await setSample('pier', false);
    setStatus('Sample loaded. Replace the photo or export the cover.');
  }
}

boot().catch((err) => {
  console.error(err);
  setStatus('The studio failed to initialize.');
});
