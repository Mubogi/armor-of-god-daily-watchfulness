/** Small shared helpers. No DOM assumptions. */

export const clamp = (v, min = 0, max = 100) => (v < min ? min : v > max ? max : v);

export const lerp = (a, b, t) => a + (b - a) * t;

export const rand = (min, max) => min + Math.random() * (max - min);
export const randInt = (min, max) => Math.floor(rand(min, max + 1));

export function pick(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

/** Weighted pick. `weights` is an array of positive numbers parallel to `items`. */
export function pickWeighted(items, weights, rng = Math.random) {
  let total = 0;
  for (const w of weights) total += w;
  if (total <= 0) return pick(items, rng);
  let roll = rng() * total;
  for (let i = 0; i < items.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function shuffle(arr, rng = Math.random) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function unique(arr) {
  return [...new Set(arr)];
}

export const formatClock = (minutes) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const avg = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);

export const sum = (nums) => nums.reduce((a, b) => a + b, 0);

/** Debounced rAF scheduler for visual updates. */
export function createTicker(fn) {
  let raf = 0;
  let running = false;
  const loop = (t) => {
    if (!running) return;
    fn(t);
    raf = requestAnimationFrame(loop);
  };
  return {
    start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    get running() {
      return running;
    }
  };
}

/** Escape text for safe innerHTML interpolation. */
export function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Tiny element factory to keep render code declarative. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue;
    node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}
