/**
 * recall-challenge.js – 3D Cartoon Illustrated Scene Recall Challenge
 * Matches Screenshot 2026-10-19 225640.png
 * Shows an illustrated scene, hides it, and prompts the player with dropdown questions.
 * Features Level 2, Progress bar, Score, ⏱ 20s timer, "👁 Show Again" button,
 * and encouragement from Brain Mascot.
 */

import { sleep, launchConfetti } from '../utils/helpers.js';
import { playCorrect, playWrong, playWin } from '../utils/sound.js';
import { recordSession } from '../utils/storage.js';
import { showToast } from '../components/navigation.js';
import { checkAndAwardBadges } from '../components/rewards.js';
import { showGameResults } from './memory-sequence.js';

const SCENE_QUESTIONS = [
  {
    q: '1. What color is the backpack?',
    options: ['Red', 'Blue', 'Green', 'Yellow'],
    answer: 'Red'
  },
  {
    q: '2. How many books are there in the stack?',
    options: ['1', '2', '3', '5'],
    answer: '3'
  },
  {
    q: '3. What is next to the water bottle?',
    options: ['Backpack', 'Plant', 'Basketball', 'Door'],
    answer: 'Backpack'
  },
  {
    q: '4. What color are the eyeglasses?',
    options: ['Blue', 'Black', 'Red', 'Silver'],
    answer: 'Blue'
  },
  {
    q: '5. What sport ball is on the desk?',
    options: ['Basketball', 'Soccer ball', 'Tennis ball', 'Baseball'],
    answer: 'Basketball'
  }
];

let currentLevel = 2;
let score = 90;
let timerSeconds = 20;
let timerInterval = null;
let gameActive = false;
let sceneVisible = true;
let appState = null;
let confettiCanvas = null;

export function initRecallChallenge(state, canvas) {
  appState = state;
  confettiCanvas = canvas;

  const startBtn = document.getElementById('recall-start-btn');
  if (startBtn) startBtn.addEventListener('click', startGame);

  const showAgainBtn = document.getElementById('recall-show-again-btn');
  if (showAgainBtn) showAgainBtn.addEventListener('click', toggleSceneVisibility);

  const submitBtn = document.getElementById('recall-submit-btn-3d');
  if (submitBtn) submitBtn.addEventListener('click', checkAnswers);
}

function startGame() {
  clearInterval(timerInterval);
  score = 0;
  currentLevel = 2;
  timerSeconds = 25;
  gameActive = true;
  sceneVisible = true;

  updateHUD();
  showScene();
  renderQuestions();
  startTimer();

  // Hide scene after 7 seconds for memory test
  showToast('Memorise everything on the desk! 👁️', 'info', 2500);
  setTimeout(() => {
    if (gameActive) hideScene();
  }, 7000);
}

function startTimer() {
  clearInterval(timerInterval);
  const timerEl = document.getElementById('recall-timer');
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timerSeconds--;
    if (timerEl) timerEl.textContent = `${Math.max(0, timerSeconds)}s`;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      checkAnswers();
    }
  }, 1000);
}

function showScene() {
  const imgEl = document.getElementById('recall-scene-img');
  const coverEl = document.getElementById('recall-scene-cover');
  if (imgEl) imgEl.style.filter = 'none';
  if (coverEl) coverEl.style.display = 'none';
  sceneVisible = true;
}

function hideScene() {
  const imgEl = document.getElementById('recall-scene-img');
  const coverEl = document.getElementById('recall-scene-cover');
  if (imgEl) imgEl.style.filter = 'blur(25px)';
  if (coverEl) coverEl.style.display = 'flex';
  sceneVisible = false;
}

function toggleSceneVisibility() {
  if (!gameActive) return;
  if (!sceneVisible) {
    showScene();
    score = Math.max(0, score - 15);
    updateHUD();
    showToast('Scene revealed for 2.5s (-15 pts hint)', 'info', 1800);
    setTimeout(hideScene, 2500);
  }
}

function renderQuestions() {
  const container = document.getElementById('recall-questions-list');
  if (!container) return;
  container.innerHTML = '';

  const activeQuestions = SCENE_QUESTIONS.slice(0, 3); // 3 questions per round
  activeQuestions.forEach((item, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'recall-q-item';
    wrap.innerHTML = `
      <label style="display:block;font-weight:700;margin-bottom:0.3rem;color:#f1f5f9;">
        ${item.q}
      </label>
      <select class="dropdown-3d" id="recall-ans-${index}" aria-label="${item.q}">
        <option value="">Select answer...</option>
        ${item.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
      </select>
    `;
    container.appendChild(wrap);
  });
}

function checkAnswers() {
  if (!gameActive) return;
  gameActive = false;
  clearInterval(timerInterval);

  let correctCount = 0;
  const activeQuestions = SCENE_QUESTIONS.slice(0, 3);

  activeQuestions.forEach((item, index) => {
    const select = document.getElementById(`recall-ans-${index}`);
    if (select && select.value.toLowerCase() === item.answer.toLowerCase()) {
      correctCount++;
      select.style.borderColor = '#22c55e';
    } else if (select) {
      select.style.borderColor = '#ef4444';
    }
  });

  const roundScore = correctCount * 30;
  score += roundScore;
  const won = correctCount >= 2;

  if (won) {
    playCorrect();
    playWin();
    if (confettiCanvas) launchConfetti(confettiCanvas);
  } else {
    playWrong();
  }

  showScene();

  if (appState) {
    recordSession(appState, 'recall', score, won ? 3 : 1, 'medium');
    checkAndAwardBadges(appState);
  }

  showGameResults({
    gameName: 'Recall Challenge',
    score,
    stars: won ? (correctCount === 3 ? 3 : 2) : 1,
    xpEarned: score + 45,
    timeTaken: `${20 - Math.max(0, timerSeconds)}s`,
    accuracy: `${Math.round((correctCount / 3) * 100)}%`,
    message: won ? 'Brilliant visual observation!' : 'Good effort! Review the scene to remember more details!',
    onReplay: startGame,
    replayScreen: 'recall',
  });
}

function updateHUD() {
  const levelEl = document.getElementById('recall-level');
  const scoreEl = document.getElementById('recall-score');
  const progressEl = document.getElementById('recall-progress-fill');

  if (levelEl) levelEl.textContent = `Level ${currentLevel}`;
  if (scoreEl) scoreEl.textContent = score;
  if (progressEl) progressEl.style.width = '65%';
}
