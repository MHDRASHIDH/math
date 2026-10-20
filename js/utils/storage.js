/**
 * storage.js – localStorage helpers for MathMind Kids
 * All data stays on the device. No external servers.
 */

const STORAGE_KEY = 'mathmind_kids_v1';

/** Default state structure */
const DEFAULT_STATE = {
  profile: {
    name: 'Champion',
    ageGroup: '7-9',    // '5-6' | '7-9' | '10-12'
    createdAt: null,
  },
  settings: {
    soundEnabled: true,
    musicEnabled: false,
    difficulty: 'medium', // 'easy' | 'medium' | 'hard'
    highContrast: false,
    largeText: false,
    reducedMotion: false,
  },
  stats: {
    totalSessions: 0,
    totalScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    gamesPlayed: {
      memory: 0,
      cards: 0,
      recall: 0,
      maths: 0,
    },
    bestScores: {
      memory: 0,
      cards: 0,
      recall: 0,
      maths: 0,
    },
    stars: {
      memory: 0,
      cards: 0,
      recall: 0,
      maths: 0,
    },
  },
  badges: [],
  sessionLog: [],  // last 30 sessions kept
};

/**
 * Load the full state from localStorage.
 * If nothing is stored yet, returns the default state.
 * @returns {object}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    // Deep-merge with defaults to handle new keys added in updates
    return deepMerge(deepClone(DEFAULT_STATE), parsed);
  } catch (err) {
    console.warn('[Storage] Failed to parse saved state, resetting.', err);
    return deepClone(DEFAULT_STATE);
  }
}

/**
 * Persist the full state object to localStorage.
 * @param {object} state
 */
export function saveState(state) {
  try {
    // Trim session log to last 30 entries
    if (Array.isArray(state.sessionLog) && state.sessionLog.length > 30) {
      state.sessionLog = state.sessionLog.slice(-30);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('[Storage] Failed to save state.', err);
  }
}

/**
 * Record a completed game session.
 * @param {object} state   - current app state (mutated in place)
 * @param {string} game    - 'memory' | 'cards' | 'recall' | 'maths'
 * @param {number} score
 * @param {number} stars   - 0-3
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 */
export function recordSession(state, game, score, stars, difficulty) {
  const today = todayStr();

  // Update streak
  if (state.stats.lastPlayedDate === today) {
    // already played today – streak continues
  } else if (state.stats.lastPlayedDate === yesterdayStr()) {
    state.stats.currentStreak += 1;
  } else {
    state.stats.currentStreak = 1; // reset
  }

  state.stats.longestStreak = Math.max(
    state.stats.longestStreak,
    state.stats.currentStreak
  );
  state.stats.lastPlayedDate = today;

  // Aggregate stats
  state.stats.totalSessions += 1;
  state.stats.totalScore   += score;
  state.stats.gamesPlayed[game] = (state.stats.gamesPlayed[game] || 0) + 1;

  if (score > (state.stats.bestScores[game] || 0)) {
    state.stats.bestScores[game] = score;
  }

  // Stars: keep the highest per game
  if (stars > (state.stats.stars[game] || 0)) {
    state.stats.stars[game] = stars;
  }

  // Session log entry
  state.sessionLog.push({
    date: today,
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    game,
    score,
    stars,
    difficulty,
  });

  saveState(state);
}

/**
 * Unlock a badge if it hasn't been unlocked yet.
 * @param {object} state
 * @param {string} badgeId
 * @returns {boolean} true if newly unlocked
 */
export function unlockBadge(state, badgeId) {
  if (!state.badges.includes(badgeId)) {
    state.badges.push(badgeId);
    saveState(state);
    return true;
  }
  return false;
}

/**
 * Update a settings key.
 * @param {object} state
 * @param {string} key
 * @param {*}      value
 */
export function updateSetting(state, key, value) {
  state.settings[key] = value;
  saveState(state);
}

/**
 * Wipe all stored data (used by "Reset Progress" in settings).
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[Storage] Failed to clear data.', err);
  }
}

/**
 * Export progress as a CSV string.
 * @param {object} state
 * @returns {string} CSV content
 */
export function exportCSV(state) {
  const header = ['Date', 'Time', 'Game', 'Score', 'Stars', 'Difficulty'].join(',');
  const rows = state.sessionLog.map(s =>
    [s.date, s.time, s.game, s.score, s.stars, s.difficulty].join(',')
  );
  return [header, ...rows].join('\n');
}

/**
 * Trigger a browser download of the CSV file.
 * @param {object} state
 */
export function downloadCSV(state) {
  const csv = exportCSV(state);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mathmind-progress-${todayStr()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ── Private helpers ──────────────────────────────────────────── */

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      key in target &&
      typeof target[key] === 'object'
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
