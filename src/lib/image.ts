/** Client-side image helpers: read, downscale and hash screenshots before sending them to the API. */

export interface PreparedImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
  width: number;
  height: number;
}

const MAX_EDGE = 1568; // Gemini reads fine at this size; keeps uploads small (~300–700KB).
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('That file is not an image. Please drop a PNG or JPG screenshot.'));
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      reject(new Error('That screenshot is over 15MB. Please use a smaller image.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode that image.'));
    img.src = src;
  });
}

export function isLowBandwidth(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!conn) return false;
  if (conn.saveData) return true;
  const slowTypes = ['slow-2g', '2g', '3g'];
  if (conn.effectiveType && slowTypes.includes(conn.effectiveType)) return true;
  return false;
}

/** Downscale to max edge on the long side and re-encode as JPEG with bandwidth-adaptive compression. */
export async function prepareImage(src: string | File, forceLowBandwidth?: boolean): Promise<PreparedImage> {
  const dataUrl = typeof src === 'string' ? src : await readFileAsDataUrl(src);
  const img = await loadImage(dataUrl);

  const lowBandwidth = forceLowBandwidth ?? isLowBandwidth();
  // Low-bandwidth users get 1120px max-edge at 0.76 quality (~90-150KB, saving ~75% data vs standard ~600KB).
  const maxEdge = lowBandwidth ? 1120 : MAX_EDGE;
  const quality = lowBandwidth ? 0.76 : 0.88;

  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const mimeType = 'image/jpeg';
  const out = canvas.toDataURL(mimeType, quality);
  const base64 = out.split(',')[1] || '';
  return { dataUrl: out, base64, mimeType, width, height };
}

/** Stable id for a prepared image so identical screenshots hit the on-device cache. */
export async function hashBase64(base64: string): Promise<string> {
  try {
    if (crypto?.subtle) {
      const buf = new TextEncoder().encode(base64);
      const digest = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(digest)).slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    /* fall through */
  }
  // djb2 fallback
  let h = 5381;
  for (let i = 0; i < base64.length; i += 7) h = ((h << 5) + h + base64.charCodeAt(i)) | 0;
  return 'h' + (h >>> 0).toString(16);
}

/** Fetch a same-origin image (e.g. /samples/x.png) as a data URL. */
export async function fetchImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read sample image.'));
    reader.readAsDataURL(blob);
  });
}
