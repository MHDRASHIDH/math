/**
 * helpers.js – Shared utility functions for MathMind Kids
 */

/**
 * Shuffle an array in place using Fisher-Yates algorithm.
 * @param {Array} arr
 * @returns {Array} the same (mutated) array
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Return a random integer in [min, max] (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array.
 * @param {Array} arr
 * @returns {*}
 */
export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Clamp a number between min and max.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Wait for a specified number of milliseconds.
 * @param {number} ms
 * @returns {Promise}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format a duration in seconds to mm:ss string.
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Compute the number of stars (0-3) based on a score percentage.
 * @param {number} correctCount
 * @param {number} total
 * @returns {number} 0 | 1 | 2 | 3
 */
export function calcStars(correctCount, total) {
  if (total === 0) return 0;
  const pct = correctCount / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.3) return 1;
  return 0;
}

/**
 * Generate a random pastel / bright colour (HSL) for game elements.
 * @param {number} index - used to evenly space hues
 * @returns {string} CSS colour string
 */
export function gameColour(index) {
  const hues = [260, 340, 200, 150, 40, 30, 280, 180];
  const hue = hues[index % hues.length];
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get today's date as ISO string (YYYY-MM-DD).
 * @returns {string}
 */
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Throttle a function – it fires at most once per `limit` ms.
 * @param {Function} fn
 * @param {number}   limit
 * @returns {Function}
 */
export function throttle(fn, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * Debounce a function – it fires after `delay` ms of silence.
 * @param {Function} fn
 * @param {number}   delay
 * @returns {Function}
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Generate a simple UUID-v4-ish string (no crypto required).
 * @returns {string}
 */
export function uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Confetti burst on a canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {number}            count  - number of particles (default 120)
 */
export function launchConfetti(canvas, count = 120) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLOURS = ['#7c5cfc','#fc5c7d','#ffd700','#4ade80','#38bdf8','#fb923c'];
  const particles = Array.from({ length: count }, () => ({
    x:   Math.random() * canvas.width,
    y:   Math.random() * canvas.height - canvas.height,
    w:   randInt(8, 14),
    h:   randInt(4, 8),
    r:   Math.random() * Math.PI * 2,
    rx:  (Math.random() - 0.5) * 0.2,
    vy:  randInt(3, 7),
    vx:  (Math.random() - 0.5) * 3,
    clr: COLOURS[Math.floor(Math.random() * COLOURS.length)],
    alpha: 1,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.y  += p.vy;
      p.x  += p.vx;
      p.r  += p.rx;
      p.alpha -= 0.008;

      if (p.y < canvas.height + 20 && p.alpha > 0) alive = true;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.r);
      ctx.fillStyle = p.clr;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) {
      frame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  cancelAnimationFrame(frame);
  draw();
}
