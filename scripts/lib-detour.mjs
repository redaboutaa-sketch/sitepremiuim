/**
 * Détourage d'un fond blanc UNIFORME par remplissage depuis les bords.
 *
 * Le remplissage part des bords : un blanc INTÉRIEUR (texte blanc dans un
 * disque rouge, reflet d'une canette) n'est jamais atteint, donc jamais
 * effacé. C'est ce qui distingue cette méthode d'un simple seuil de
 * chrominance, qui trouerait les logos.
 */
import sharp from 'sharp';

export async function detour(input, { tolerance = 12 } = {}) {
  const img = sharp(input).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const isWhite = (i) =>
    data[i] >= 255 - tolerance && data[i + 1] >= 255 - tolerance && data[i + 2] >= 255 - tolerance;

  const visited = new Uint8Array(W * H);
  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const p = y * W + x;
    if (visited[p]) return;
    if (!isWhite(p * C)) return;
    visited[p] = 1;
    queue.push(p);
  };

  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

  for (let head = 0; head < queue.length; head++) {
    const p = queue[head];
    const x = p % W, y = (p - x) / W;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }

  let removed = 0;
  for (let p = 0; p < W * H; p++) {
    if (visited[p]) { data[p * C + 3] = 0; removed++; }
  }

  const out = await sharp(data, { raw: { width: W, height: H, channels: C } })
    .png()
    .toBuffer();

  return { buffer: out, removedRatio: removed / (W * H), width: W, height: H };
}
