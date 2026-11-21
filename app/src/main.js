import { drawCover, sizeFor } from './cover.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const status = document.getElementById('status');
const photoInput = document.getElementById('photo');
const sizeSelect = document.getElementById('size');
const exportBtn = document.getElementById('export');

let photoImg = null;
let sizeKey = '1080x1080';

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = url;
  });
}

function render() {
  drawCover(canvas, photoImg, captionInput.value, sizeKey);
}

function setSize(key) {
  sizeKey = sizeFor(key) ? key : '1080x1080';
  sizeSelect.value = sizeKey;
  render();
}

function setStatus(msg) {
  status.textContent = msg;
}

photoInput.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    photoImg = await loadImage(url);
    render();
    setStatus('Photo loaded. Adjust caption or export.');
  } catch {
    setStatus('Could not load that photo.');
  } finally {
    URL.revokeObjectURL(url);
  }
});

captionInput.addEventListener('input', render);

sizeSelect.addEventListener('change', () => setSize(sizeSelect.value));

exportBtn.addEventListener('click', () => {
  const { w, h } = sizeFor(sizeKey);
  canvas.toBlob((blob) => {
    if (!blob) {
      setStatus('Export failed.');
      return;
    }
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `gta6-cover-${w}x${h}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(`Exported gta6-cover-${w}x${h}.png`);
  }, 'image/png');
});

async function initShotMode() {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  const clean = shot.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  document.body.classList.add('shot-' + clean);
  if (clean.includes('cover')) document.body.classList.add('shot-cover');
  if (clean.includes('editor')) document.body.classList.add('shot-editor');
  const photoName = (params.get('photo') || 'pier').replace(/[^a-z0-9_-]/gi, '');
  const cap = params.get('caption') || 'SUNSET HEIST';
  const size = params.get('size') || '1080x1080';
  captionInput.value = cap;
  setSize(size);
  try {
    photoImg = await loadImage(`./samples/${photoName}.jpg`);
  } catch {
    photoImg = null;
  }
  render();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
  window.__shotName = shot;
  return true;
}

(async () => {
  const shot = await initShotMode();
  if (!shot) {
    // Default sample for first paint.
    try {
      photoImg = await loadImage('./samples/pier.jpg');
      setStatus('Sample photo loaded. Replace it with your own.');
    } catch {
      setStatus('Add a photo to start.');
    }
    render();
  }
})();
