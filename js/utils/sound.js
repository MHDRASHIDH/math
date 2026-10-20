/**
 * sound.js – Web Audio API sound effects for MathMind Kids
 * Generates all sounds procedurally – no external audio files needed.
 * Optional, fully togglable via app settings.
 */

let audioCtx = null;
let enabled  = true;

/**
 * Lazily initialise the AudioContext on first user interaction.
 * Browsers block autoplay until a user gesture.
 */
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if browser suspended it
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Enable or disable all sounds.
 * @param {boolean} on
 */
export function setSoundEnabled(on) {
  enabled = Boolean(on);
}

/**
 * Returns whether sound is currently enabled.
 * @returns {boolean}
 */
export function isSoundEnabled() {
  return enabled;
}

/* ── Core tone generator ─────────────────────────────────────── */

/**
 * Play a synthetic tone.
 * @param {number}  freq      - Hz
 * @param {number}  duration  - seconds
 * @param {string}  type      - OscillatorNode.type
 * @param {number}  gain      - 0..1
 * @param {number}  startTime - AudioContext time offset (default: now)
 */
function playTone(freq, duration = 0.15, type = 'sine', gain = 0.25, startTime = 0) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime + startTime;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.connect(env);
    env.connect(ctx.destination);

    osc.type      = type;
    osc.frequency.setValueAtTime(freq, now);

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(gain, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  } catch (err) {
    // Silently fail – sound is optional
  }
}

/* ── Named sound effects ─────────────────────────────────────── */

/** Short positive "ding" for correct answers */
export function playCorrect() {
  playTone(523.25, 0.12, 'sine', 0.3);           // C5
  playTone(659.25, 0.15, 'sine', 0.3, 0.1);      // E5
  playTone(783.99, 0.2,  'sine', 0.25, 0.22);    // G5
}

/** Buzzer sound for wrong answers */
export function playWrong() {
  playTone(200, 0.08, 'sawtooth', 0.2);
  playTone(150, 0.12, 'sawtooth', 0.2, 0.08);
}

/** Ascending fanfare for level / round complete */
export function playLevelUp() {
  const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
  notes.forEach((freq, i) => playTone(freq, 0.18, 'sine', 0.28, i * 0.1));
}

/** Celebratory chord for game win */
export function playWin() {
  playTone(523.25, 0.4, 'sine', 0.3);
  playTone(659.25, 0.4, 'sine', 0.25, 0.0);
  playTone(783.99, 0.4, 'sine', 0.2,  0.0);
  playTone(1046.5, 0.5, 'sine', 0.2,  0.1);
}

/** Button / card click tick */
export function playClick() {
  playTone(800, 0.05, 'square', 0.1);
}

/** Countdown beep (each second) */
export function playBeep() {
  playTone(440, 0.08, 'sine', 0.2);
}

/** Final countdown warning beep */
export function playBeepWarning() {
  playTone(880, 0.1, 'sine', 0.3);
}

/** Card flip sound */
export function playFlip() {
  playTone(600, 0.06, 'triangle', 0.15);
  playTone(900, 0.06, 'triangle', 0.1, 0.05);
}

/** Badge unlock jingle */
export function playBadge() {
  const melody = [523, 659, 784, 1047];
  melody.forEach((f, i) => playTone(f, 0.25, 'sine', 0.3, i * 0.12));
}

/** Sequence button highlight sound – pitch varies by index */
export function playSequenceNote(index) {
  const notes = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
  const freq  = notes[index % notes.length];
  playTone(freq, 0.3, 'sine', 0.35);
}

/** Streak milestone sound */
export function playStreak() {
  playTone(440, 0.1, 'sine', 0.3);
  playTone(550, 0.1, 'sine', 0.3, 0.1);
  playTone(660, 0.15,'sine', 0.3, 0.2);
  playTone(880, 0.3, 'sine', 0.35, 0.35);
}
