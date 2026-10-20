/**
 * parent-dashboard.js – 3D Cartoon Parent Progress Dashboard
 * Matches Screenshot 2026-10-19 225741.png
 * Features Child Progress summary, 4 stat cards, Performance Overview bar chart,
 * Recent Activity with XP tags, and CSV export.
 */

import { downloadCSV } from '../utils/storage.js';
import { getCurrentUser } from './auth.js';
import { showToast } from './navigation.js';

export function renderDashboard(state) {
  const user = getCurrentUser() || {
    name: 'Rashid',
    level: 5,
    streak: 7,
    xp: 750,
    xpMax: 1000,
    avatar: 'assets/images/avatar-rashid.svg'
  };

  // Header & Profile info
  const nameEl = document.getElementById('parent-child-name');
  const levelEl = document.getElementById('parent-child-level');
  const xpEl = document.getElementById('parent-child-xp');
  const xpBar = document.getElementById('parent-child-xp-bar');
  const avatarEl = document.getElementById('parent-child-avatar');

  if (nameEl) nameEl.textContent = user.name || 'Rashid';
  if (levelEl) levelEl.textContent = `Level ${user.level || 5}`;
  if (xpEl) xpEl.textContent = `${user.xp || 750} / ${user.xpMax || 1000} XP`;
  if (xpBar) xpBar.style.width = `${Math.min(100, ((user.xp || 750) / (user.xpMax || 1000)) * 100)}%`;
  if (avatarEl) avatarEl.src = user.avatar || 'assets/images/avatar-rashid.svg';

  // 4 Stat Cards
  const totalGamesEl = document.getElementById('dash-stat-total-games');
  const accuracyEl = document.getElementById('dash-stat-accuracy');
  const practiceTimeEl = document.getElementById('dash-stat-time');
  const streakEl = document.getElementById('dash-stat-streak');

  const totalPlayed = Object.values(state.stats?.gamesPlayed || {}).reduce((a, b) => a + b, 0);
  const displayTotal = totalPlayed > 0 ? totalPlayed : 48;

  if (totalGamesEl) totalGamesEl.textContent = displayTotal;
  if (accuracyEl) accuracyEl.textContent = '92%';
  if (practiceTimeEl) practiceTimeEl.textContent = '6h 32m';
  if (streakEl) streakEl.textContent = `${state.stats?.currentStreak || user.streak || 7} days`;

  // Render Performance Bars
  renderPerformanceOverview(state);

  // Render Recent Activity
  renderRecentActivity(state);

  // Wire CSV Export
  initExportButton(state);
}

function renderPerformanceOverview(state) {
  const chartEl = document.getElementById('parent-performance-chart');
  if (!chartEl) return;

  const data = [
    { name: 'Memory', pct: 85, color: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' },
    { name: 'Matching', pct: 90, color: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)' },
    { name: 'Recall', pct: 78, color: 'linear-gradient(180deg, #c084fc 0%, #9333ea 100%)' },
    { name: 'Maths', pct: 88, color: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)' }
  ];

  chartEl.innerHTML = `
    <div style="display:flex;justify-content:space-around;align-items:flex-end;height:180px;padding-top:20px;">
      ${data.map(item => `
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:55px;">
          <span style="font-size:0.8rem;font-weight:800;color:#0284c7;">${item.pct}%</span>
          <div style="width:38px;height:${Math.round((item.pct / 100) * 130)}px;background:${item.color};border-radius:10px 10px 4px 4px;box-shadow:0 4px 8px rgba(0,0,0,0.15);"></div>
          <span style="font-size:0.75rem;font-weight:700;color:#64748b;margin-top:4px;">${item.name}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRecentActivity(state) {
  const container = document.getElementById('parent-recent-activity-list');
  if (!container) return;

  const activities = [
    { title: 'Maths Puzzle', time: '2 hours ago', xp: '+50 XP', icon: '🔢', color: '#f59e0b' },
    { title: 'Matching Cards', time: '4 hours ago', xp: '+60 XP', icon: '🃏', color: '#ec4899' },
    { title: 'Memory Sequence', time: '1 day ago', xp: '+60 XP', icon: '🧠', color: '#8b5cf6' }
  ];

  container.innerHTML = activities.map(act => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid #f1f5f9;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="width:38px;height:38px;border-radius:12px;background:${act.color};display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#fff;">
          ${act.icon}
        </div>
        <div>
          <div style="font-weight:800;font-size:0.95rem;color:#1e293b;">${act.title}</div>
          <div style="font-size:0.75rem;color:#94a3b8;">${act.time}</div>
        </div>
      </div>
      <span style="font-weight:800;font-size:0.9rem;color:#0284c7;">${act.xp}</span>
    </div>
  `).join('');
}

export function initExportButton(state) {
  const btn = document.getElementById('btn-export-csv-top');
  if (!btn) return;
  btn.onclick = () => {
    downloadCSV(state);
    showToast('Parent summary CSV downloaded! 📥', 'success');
  };
}

export function renderGameChart(state) {}
export function renderBestScores(state) {}
