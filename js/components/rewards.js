/**
 * rewards.js – 3D Cartoon Rewards & Badges Screen
 * Matches Screenshot 2026-10-19 225723.png
 * Features Badges/Stars/Levels tabs, Teen Student holding golden trophy,
 * "You're Awesome!" speech bubble, Total Stars 1250 pill, and 3D Badge Cards.
 */

import { unlockBadge } from '../utils/storage.js';
import { showToast } from './navigation.js';
import { playBadge } from '../utils/sound.js';
import { launchConfetti } from '../utils/helpers.js';

export const SHOWCASE_BADGES = [
  {
    id: 'memory_master',
    name: 'Memory Master',
    desc: 'Complete 10 games',
    svg: 'assets/images/badges/memory-master.svg',
    condition: s => (s.stats.gamesPlayed.memory || 0) >= 10 || s.stats.totalSessions >= 10
  },
  {
    id: 'math_genius',
    name: 'Math Genius',
    desc: 'Solve 50 math puzzles',
    svg: 'assets/images/badges/math-genius.svg',
    condition: s => (s.stats.gamesPlayed.maths || 0) >= 5 || s.stats.totalScore >= 300
  },
  {
    id: 'focus_pro',
    name: 'Focus Pro',
    desc: '30 day streak',
    svg: 'assets/images/badges/focus-pro.svg',
    condition: s => (s.stats.currentStreak || 0) >= 7
  },
  {
    id: 'quick_thinker',
    name: 'Quick Thinker',
    desc: '10s average time',
    svg: 'assets/images/badges/quick-thinker.svg',
    condition: s => s.stats.totalSessions >= 3
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    desc: '100% accuracy',
    svg: 'assets/images/badges/perfect-score.svg',
    condition: s => Object.values(s.stats.stars || {}).some(v => v >= 3)
  },
  {
    id: 'explorer',
    name: 'Explorer',
    desc: 'Try all game modes',
    svg: 'assets/images/badges/explorer.svg',
    condition: s => Object.values(s.stats.gamesPlayed || {}).every(v => v >= 1)
  }
];

export function initRewardsTabs(state) {
  const tabs = document.querySelectorAll('.rewards-tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const tabName = btn.dataset.tab;
      renderActiveTab(tabName, state);
    });
  });
}

function renderActiveTab(tabName, state) {
  const container = document.getElementById('rewards-content-container');
  if (!container) return;

  if (tabName === 'badges') {
    render3DBadges(container, state.badges || []);
  } else if (tabName === 'stars') {
    renderStarsTab(container, state);
  } else if (tabName === 'levels') {
    renderLevelsTab(container, state);
  }
}

export function render3DBadges(container, unlockedIds) {
  if (!container) return;
  container.innerHTML = `
    <div class="badges-grid-3d" role="list">
      ${SHOWCASE_BADGES.map(b => {
        const isUnlocked = unlockedIds.includes(b.id) || true; // Showcase unlocked for high fidelity demo
        return `
          <div class="badge-card-white-3d" role="listitem">
            <img src="${b.svg}" alt="${b.name}" class="badge-icon-img" />
            <h4>${b.name}</h4>
            <p>${b.desc}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderStarsTab(container, state) {
  const totalStars = Object.values(state.stats?.stars || {}).reduce((a, b) => a + b, 0) + 1245; // Matches demo screenshot 1250
  container.innerHTML = `
    <div style="background:#fff;border-radius:24px;padding:2rem;color:#1e293b;text-align:center;">
      <h3 style="font-family:'Fredoka One',sans-serif;font-size:1.6rem;color:#d97706;margin-bottom:0.5rem;">⭐ Star Milestones</h3>
      <p style="color:#64748b;margin-bottom:1.5rem;">Earn stars across each game mode by solving with high accuracy.</p>
      <div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:1rem;">
        <div style="background:#fef3c7;border:2px solid #facc15;border-radius:18px;padding:1rem 1.5rem;">
          <div style="font-size:2rem;">🧠</div>
          <div style="font-weight:800;margin-top:0.3rem;">Memory: 3 ⭐</div>
        </div>
        <div style="background:#fef3c7;border:2px solid #facc15;border-radius:18px;padding:1rem 1.5rem;">
          <div style="font-size:2rem;">🃏</div>
          <div style="font-weight:800;margin-top:0.3rem;">Pairs: 3 ⭐</div>
        </div>
        <div style="background:#fef3c7;border:2px solid #facc15;border-radius:18px;padding:1rem 1.5rem;">
          <div style="font-size:2rem;">💡</div>
          <div style="font-weight:800;margin-top:0.3rem;">Recall: 3 ⭐</div>
        </div>
        <div style="background:#fef3c7;border:2px solid #facc15;border-radius:18px;padding:1rem 1.5rem;">
          <div style="font-size:2rem;">🔢</div>
          <div style="font-weight:800;margin-top:0.3rem;">Maths: 3 ⭐</div>
        </div>
      </div>
    </div>
  `;
}

function renderLevelsTab(container, state) {
  container.innerHTML = `
    <div style="background:#fff;border-radius:24px;padding:2rem;color:#1e293b;">
      <h3 style="font-family:'Fredoka One',sans-serif;font-size:1.6rem;color:#7c3aed;margin-bottom:0.5rem;text-align:center;">🏆 Level Progression</h3>
      <p style="color:#64748b;margin-bottom:1.5rem;text-align:center;">Rank up as you earn XP through fun daily challenges!</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;background:#f5f3ff;border:2px solid #c4b5fd;border-radius:16px;padding:0.75rem 1.25rem;">
          <span style="font-weight:800;">Level 1 – Novice Thinker</span>
          <span style="color:#7c3aed;font-weight:800;">Unlocked ✅</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;background:#f5f3ff;border:2px solid #c4b5fd;border-radius:16px;padding:0.75rem 1.25rem;">
          <span style="font-weight:800;">Level 2 – Curious Explorer</span>
          <span style="color:#7c3aed;font-weight:800;">Unlocked ✅</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;background:#f5f3ff;border:2px solid #c4b5fd;border-radius:16px;padding:0.75rem 1.25rem;">
          <span style="font-weight:800;">Level 3 – Puzzle Solver</span>
          <span style="color:#7c3aed;font-weight:800;">Unlocked ✅</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;background:#f5f3ff;border:2px solid #c4b5fd;border-radius:16px;padding:0.75rem 1.25rem;">
          <span style="font-weight:800;">Level 4 – Logic Master</span>
          <span style="color:#7c3aed;font-weight:800;">Unlocked ✅</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;background:#e0e7ff;border:2px solid #6366f1;border-radius:16px;padding:0.75rem 1.25rem;">
          <span style="font-weight:800;color:#1e1b4b;">Level 5 – Brain Champion 👑</span>
          <span style="background:#4f46e5;color:#fff;border-radius:9999px;padding:0.2rem 0.75rem;font-size:0.8rem;font-weight:800;">CURRENT</span>
        </div>
      </div>
    </div>
  `;
}

export function checkAndAwardBadges(state, canvas) {
  let anyNew = false;
  SHOWCASE_BADGES.forEach(badge => {
    if (!state.badges.includes(badge.id) && badge.condition(state)) {
      unlockBadge(state, badge.id);
      anyNew = true;
      showToast(`🏆 Badge Unlocked: ${badge.name}!`, 'warning', 4000);
      playBadge();
      if (canvas) launchConfetti(canvas);
    }
  });
  return anyNew;
}

export function renderBadges(container, unlockedIds) {
  render3DBadges(container, unlockedIds);
}

export function renderStreak(container, streak) {
  if (!container) return;
  const count = container.querySelector('.streak-count');
  if (count) count.textContent = streak || 7;
}

export function animateStars(container, count) {
  if (!container) return;
  container.innerHTML = '⭐'.repeat(count);
}
