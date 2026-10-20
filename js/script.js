/**
 * script.js – Main entry point for MathMind Kids (3D Cartoon Edition)
 * Initialises authentication, SPA navigation, sound, settings, and all 4 games.
 */

import { initNavigation, onScreenEnter, navigateTo, showToast } from './components/navigation.js';
import { initAuth, isLoggedIn, getCurrentUser, logoutUser } from './components/auth.js';
import { initModal, showConfirm } from './components/modal.js';
import { renderBadges, renderStreak, initRewardsTabs } from './components/rewards.js';
import { renderDashboard } from './components/parent-dashboard.js';
import { loadState, saveState, updateSetting, clearAllData } from './utils/storage.js';
import { setSoundEnabled, isSoundEnabled, playClick } from './utils/sound.js';

import { initMemorySequence } from './games/memory-sequence.js';
import { initMatchingCards } from './games/matching-cards.js';
import { initRecallChallenge } from './games/recall-challenge.js';
import { initMathsPuzzles } from './games/maths-puzzles.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Load persisted state
  const state = loadState();
  const confettiCanvas = document.getElementById('confetti-canvas');

  // 2. Initialize Navigation & Modal
  initNavigation();
  initModal();

  // 3. Initialize Auth
  initAuth((user) => {
    updateTopPlayerChip(user);
    navigateTo('home');
  });

  // 4. Initialize Game Modules
  initMemorySequence(state, confettiCanvas);
  initMatchingCards(state, confettiCanvas);
  initRecallChallenge(state, confettiCanvas);
  initMathsPuzzles(state, confettiCanvas);

  // 5. Sound Toggle in Header
  initSoundToggle(state);

  // 6. Settings Screen Controls
  initSettings(state);

  // 7. Rewards Tabs
  initRewardsTabs(state);

  // 8. Screen Enter Listeners
  onScreenEnter('rewards', () => {
    const container = document.getElementById('rewards-content-container');
    renderBadges(container, state.badges);
  });

  onScreenEnter('dashboard', () => {
    renderDashboard(state);
  });

  onScreenEnter('home', () => {
    updateTopPlayerChip(getCurrentUser());
  });

  // 9. Initial Routing Check
  if (isLoggedIn()) {
    const user = getCurrentUser();
    updateTopPlayerChip(user);
    const hash = window.location.hash.replace('#', '');
    if (hash && ['home', 'game-modes', 'memory', 'cards', 'recall', 'maths', 'rewards', 'dashboard', 'settings'].includes(hash)) {
      navigateTo(hash, false);
    } else {
      navigateTo('home', false);
    }
  } else {
    navigateTo('welcome', false);
  }

  console.info('[MathMind Kids] 3D Cartoon Edition Ready! 🚀');
});

/* ── Top Player Chip ─────────────────────────────────────────── */

function updateTopPlayerChip(user) {
  const profile = user || {
    name: 'Rashid',
    level: 5,
    streak: 7,
    avatar: 'assets/images/avatar-rashid.svg'
  };

  const nameEl = document.getElementById('top-chip-name');
  const levelEl = document.getElementById('top-chip-level');
  const streakEl = document.getElementById('top-chip-streak');
  const avatarEl = document.getElementById('top-chip-avatar');

  if (nameEl) nameEl.innerHTML = `${profile.name || 'Rashid'} <span style="color:#facc15">👑</span>`;
  if (levelEl) levelEl.textContent = `Level ${profile.level || 5}`;
  if (streakEl) streakEl.textContent = `${profile.streak || 7} Day Streak`;
  if (avatarEl) avatarEl.src = profile.avatar || 'assets/images/avatar-rashid.svg';
}

/* ── Sound Toggle ────────────────────────────────────────────── */

function initSoundToggle(state) {
  setSoundEnabled(state.settings.soundEnabled ?? true);

  const soundBtn = document.getElementById('btn-sound-toggle-top');
  if (!soundBtn) return;

  updateSoundButton(soundBtn, state.settings.soundEnabled ?? true);

  soundBtn.addEventListener('click', () => {
    const newVal = !isSoundEnabled();
    setSoundEnabled(newVal);
    updateSetting(state, 'soundEnabled', newVal);
    updateSoundButton(soundBtn, newVal);
    showToast(newVal ? '🔊 Sound ON' : '🔇 Sound OFF', 'info', 1500);
  });
}

function updateSoundButton(btn, enabled) {
  btn.textContent = enabled ? '🔊' : '🔇';
  btn.setAttribute('aria-label', enabled ? 'Mute audio' : 'Enable audio');
}

/* ── Settings Screen ─────────────────────────────────────────── */

function initSettings(state) {
  // Sound toggle in settings
  const soundToggle = document.getElementById('setting-sound-toggle');
  if (soundToggle) {
    soundToggle.checked = state.settings.soundEnabled ?? true;
    soundToggle.addEventListener('change', () => {
      const val = soundToggle.checked;
      setSoundEnabled(val);
      updateSetting(state, 'soundEnabled', val);
      const topBtn = document.getElementById('btn-sound-toggle-top');
      if (topBtn) updateSoundButton(topBtn, val);
    });
  }

  // Music toggle
  const musicToggle = document.getElementById('setting-music-toggle');
  if (musicToggle) {
    musicToggle.checked = state.settings.musicEnabled ?? false;
    musicToggle.addEventListener('change', () => {
      const val = musicToggle.checked;
      updateSetting(state, 'musicEnabled', val);
      showToast(val ? '🎵 Music ON' : '🎵 Music OFF', 'info', 1500);
    });
  }

  // High Contrast toggle
  const contrastToggle = document.getElementById('setting-contrast-toggle');
  if (contrastToggle) {
    contrastToggle.checked = state.settings.highContrast ?? false;
    if (state.settings.highContrast) document.body.classList.add('high-contrast');
    contrastToggle.addEventListener('change', () => {
      const val = contrastToggle.checked;
      updateSetting(state, 'highContrast', val);
      document.body.classList.toggle('high-contrast', val);
      showToast(val ? '👁️ High Contrast ON' : '👁️ High Contrast OFF', 'info', 1500);
    });
  }

  // Larger Text toggle
  const largeTextToggle = document.getElementById('setting-large-text-toggle');
  if (largeTextToggle) {
    largeTextToggle.checked = state.settings.largeText ?? false;
    if (state.settings.largeText) document.body.classList.add('large-text');
    largeTextToggle.addEventListener('change', () => {
      const val = largeTextToggle.checked;
      updateSetting(state, 'largeText', val);
      document.body.classList.toggle('large-text', val);
      showToast(val ? '🔍 Larger Text ON' : '🔍 Larger Text OFF', 'info', 1500);
    });
  }

  // Reduced Motion toggle
  const motionToggle = document.getElementById('setting-motion-toggle');
  if (motionToggle) {
    motionToggle.checked = state.settings.reducedMotion ?? false;
    if (state.settings.reducedMotion) document.body.classList.add('reduced-motion');
    motionToggle.addEventListener('change', () => {
      const val = motionToggle.checked;
      updateSetting(state, 'reducedMotion', val);
      document.body.classList.toggle('reduced-motion', val);
      showToast(val ? '🎬 Reduced Motion ON' : '🎬 Reduced Motion OFF', 'info', 1500);
    });
  }

  // Logout button
  const logoutBtns = document.querySelectorAll('.btn-logout-action');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      logoutUser();
      showToast('Logged out. See you next time! 👋', 'info', 2000);
      setTimeout(() => navigateTo('welcome'), 500);
    });
  });

  // Export CSV
  const exportBtn = document.getElementById('btn-settings-export-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      import('./utils/storage.js').then(m => m.downloadCSV(state));
      showToast('Progress CSV downloaded! 📥', 'success');
    });
  }

  // Clear data
  const clearBtn = document.getElementById('btn-settings-clear-data');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      showConfirm({
        title: '⚠️ Clear Local Progress?',
        message: 'This will reset all your game scores, streak, and badges. This cannot be undone.',
        confirmText: '🗑️ Reset',
        cancelText: 'Cancel',
        type: 'warning',
        onConfirm: () => {
          clearAllData();
          logoutUser();
          showToast('Data cleared. Restarting...', 'warning');
          setTimeout(() => window.location.reload(), 1200);
        }
      });
    });
  }
}
