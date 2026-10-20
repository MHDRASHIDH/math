/**
 * navigation.js – SPA screen routing + Toast notifications for MathMind Kids
 */

let currentScreen = 'welcome';
const onEnterCallbacks = new Map();

const SCREEN_TITLES = {
  welcome: 'Welcome',
  auth: 'Player Login',
  home: 'MathMind Kids',
  'game-modes': 'Choose Your Game Mode',
  memory: 'Memory Sequence',
  cards: 'Matching Cards',
  recall: 'Recall Challenge',
  maths: 'Maths Puzzles',
  results: 'Game Results',
  rewards: 'Rewards & Badges',
  dashboard: 'Parent Dashboard',
  settings: 'Settings'
};

/**
 * Initialise navigation: wire up all nav links, back buttons, and popstate.
 */
export function initNavigation() {
  document.addEventListener('click', e => {
    const target = e.target.closest('[data-nav]');
    if (!target) return;
    e.preventDefault();
    navigateTo(target.dataset.nav);
  });

  // Global back buttons
  document.addEventListener('click', e => {
    const backBtn = e.target.closest('.btn-back');
    if (!backBtn) return;
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('home');
    }
  });

  window.addEventListener('popstate', e => {
    const screen = e.state?.screen ?? 'welcome';
    showScreen(screen, false);
  });
}

/**
 * Navigate to a named screen.
 * @param {string}  screenId
 * @param {boolean} pushHistory
 */
export function navigateTo(screenId, pushHistory = true) {
  showScreen(screenId, pushHistory);
}

function showScreen(screenId, push = true) {
  const nextEl = document.getElementById(`screen-${screenId}`);
  if (!nextEl) {
    console.warn(`[Navigation] No screen found: "screen-${screenId}"`);
    return;
  }

  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  nextEl.classList.add('active');
  currentScreen = screenId;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update top bar title if present
  const titleEl = document.getElementById('top-bar-title');
  if (titleEl) {
    titleEl.textContent = SCREEN_TITLES[screenId] || 'MathMind Kids';
  }

  // Toggle top header bar visibility (hide on welcome/auth if desired, or keep responsive)
  const topBar = document.getElementById('top-app-bar');
  if (topBar) {
    if (screenId === 'welcome' || screenId === 'auth') {
      topBar.style.display = 'none';
    } else {
      topBar.style.display = 'flex';
    }
  }

  if (push) history.pushState({ screen: screenId }, '', `#${screenId}`);

  if (onEnterCallbacks.has(screenId)) {
    onEnterCallbacks.get(screenId)();
  }
}

export function onScreenEnter(screenId, fn) {
  onEnterCallbacks.set(screenId, fn);
}

export function getActiveScreen() {
  return currentScreen;
}

/* ── Toast Notifications ─────────────────────────────────────── */

export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = { info: '💡', success: '🌟', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `<span aria-hidden="true" style="font-size:1.2rem">${iconMap[type] || '💡'}</span><span style="font-weight:700">${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}
