/**
 * memory-sequence.js – 3D Cartoon Memory Sequence Game
 * Matches Screenshot 2026-10-19 225625.png
 * Features 5 glowing spheres (Red, Blue, Green, Yellow, Purple),
 * sequence presentation, dashed repeat slots, timer, score, and mascot feedback.
 */

import { sleep, calcStars, launchConfetti } from '../utils/helpers.js';
import { playSequenceNote, playCorrect, playWrong, playWin } from '../utils/sound.js';
import { recordSession } from '../utils/storage.js';
import { navigateTo, showToast } from '../components/navigation.js';
import { checkAndAwardBadges } from '../components/rewards.js';

const SPHERES = [
  { id: 'red', name: 'Red', class: 'sphere-red', note: 0 },
  { id: 'blue', name: 'Blue', class: 'sphere-blue', note: 1 },
  { id: 'green', name: 'Green', class: 'sphere-green', note: 2 },
  { id: 'yellow', name: 'Yellow', class: 'sphere-yellow', note: 3 },
  { id: 'purple', name: 'Purple', class: 'sphere-purple', note: 4 },
];

let sequence = [];
let playerIndex = 0;
let currentLevel = 2;
let score = 60;
let isShowingSeq = false;
let gameActive = false;
let timerSeconds = 18;
let timerInterval = null;
let appState = null;
let confettiCanvas = null;

export function initMemorySequence(state, canvas) {
  appState = state;
  confettiCanvas = canvas;

  // Bind Start / Restart
  const startBtn = document.getElementById('memory-start-btn');
  if (startBtn) startBtn.addEventListener('click', startGame);

  const restartBtn = document.getElementById('memory-restart-btn');
  if (restartBtn) restartBtn.addEventListener('click', startGame);

  const hintBtn = document.getElementById('memory-hint-btn');
  if (hintBtn) hintBtn.addEventListener('click', showHint);

  // Bind clickable input spheres
  const inputContainer = document.getElementById('memory-input-spheres');
  if (inputContainer) {
    inputContainer.innerHTML = '';
    SPHERES.forEach((s, idx) => {
      const el = document.createElement('div');
      el.className = `glow-sphere ${s.class}`;
      el.dataset.index = idx;
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', s.name);
      el.addEventListener('click', () => handlePlayerSphereClick(idx));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlayerSphereClick(idx);
        }
      });
      inputContainer.appendChild(el);
    });
  }

  // Pre-render top display spheres
  const displayContainer = document.getElementById('memory-top-spheres');
  if (displayContainer) {
    displayContainer.innerHTML = '';
    SPHERES.forEach((s, idx) => {
      const el = document.createElement('div');
      el.className = `glow-sphere ${s.class}`;
      el.dataset.index = idx;
      displayContainer.appendChild(el);
    });
  }
}

function startGame() {
  clearInterval(timerInterval);
  sequence = [];
  playerIndex = 0;
  currentLevel = 1;
  score = 0;
  gameActive = true;
  timerSeconds = 25;

  updateHUD();
  setMascotSpeech('Remember the sequence...');
  startTimer();
  nextRound();
}

function startTimer() {
  clearInterval(timerInterval);
  const timerEl = document.getElementById('memory-timer');
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timerSeconds--;
    if (timerEl) timerEl.textContent = `${Math.max(0, timerSeconds)}s`;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      gameOver(false, 'Time ran out! Keep practising!');
    }
  }, 1000);
}

async function nextRound() {
  // Add next step (3 to 6 steps)
  const nextIdx = Math.floor(Math.random() * SPHERES.length);
  sequence.push(nextIdx);
  playerIndex = 0;

  updateHUD();
  renderDashedSlots();
  setMascotSpeech('Watch carefully! 🧠');

  await sleep(600);
  await playSequence();

  setMascotSpeech('Now repeat the sequence! 👆');
}

async function playSequence() {
  isShowingSeq = true;
  const topSpheres = document.querySelectorAll('#memory-top-spheres .glow-sphere');

  for (const idx of sequence) {
    const sphereEl = topSpheres[idx];
    if (sphereEl) {
      sphereEl.classList.add('active');
      playSequenceNote(idx);
      await sleep(500);
      sphereEl.classList.remove('active');
      await sleep(250);
    }
  }
  isShowingSeq = false;
}

function renderDashedSlots() {
  const slotsContainer = document.getElementById('memory-dashed-slots');
  if (!slotsContainer) return;
  slotsContainer.innerHTML = '';

  sequence.forEach((_, i) => {
    const slot = document.createElement('div');
    slot.className = 'sphere-slot-dashed';
    slot.id = `mem-slot-${i}`;
    slotsContainer.appendChild(slot);
  });
}

function handlePlayerSphereClick(idx) {
  if (!gameActive || isShowingSeq) return;

  const currentSlot = document.getElementById(`mem-slot-${playerIndex}`);
  const targetIdx = sequence[playerIndex];

  if (idx === targetIdx) {
    // Correct step
    playSequenceNote(idx);
    if (currentSlot) {
      currentSlot.className = `sphere-slot-dashed filled glow-sphere ${SPHERES[idx].class}`;
      currentSlot.style.width = '55px';
      currentSlot.style.height = '55px';
    }
    playerIndex++;
    score += 15;
    updateHUD();

    if (playerIndex >= sequence.length) {
      // Completed current sequence!
      playCorrect();
      setMascotSpeech('Great Job! 🌟');
      currentLevel++;
      score += 25;
      updateHUD();

      if (currentLevel > 5) {
        gameOver(true, 'Incredible! You completed all memory levels!');
      } else {
        setTimeout(nextRound, 1000);
      }
    }
  } else {
    // Wrong step
    playWrong();
    setMascotSpeech('Oops! Try again! 💪');
    showToast('Not quite! Keep trying!', 'warning', 1500);
    setTimeout(() => {
      playerIndex = 0;
      renderDashedSlots();
      playSequence();
    }, 1000);
  }
}

function showHint() {
  if (!gameActive || isShowingSeq) return;
  showToast(`Hint: Next is ${SPHERES[sequence[playerIndex]].name}!`, 'info', 2000);
}

function updateHUD() {
  const levelEl = document.getElementById('memory-level');
  const scoreEl = document.getElementById('memory-score');
  const progressEl = document.getElementById('memory-progress-fill');

  if (levelEl) levelEl.textContent = `Level ${currentLevel}`;
  if (scoreEl) scoreEl.textContent = score;
  if (progressEl) {
    const pct = Math.min(100, (currentLevel / 5) * 100);
    progressEl.style.width = `${pct}%`;
  }
}

function setMascotSpeech(text) {
  const bubble = document.getElementById('memory-speech-bubble');
  if (bubble) bubble.textContent = text;
}

function gameOver(won, message) {
  gameActive = false;
  clearInterval(timerInterval);

  const stars = won ? 3 : (score > 60 ? 2 : 1);
  const xpEarned = score + 40;

  if (won) {
    playWin();
    if (confettiCanvas) launchConfetti(confettiCanvas);
  }

  // Record session
  if (appState) {
    recordSession(appState, 'memory', score, stars, 'medium');
    checkAndAwardBadges(appState);
  }

  // Open Results screen
  showGameResults({
    gameName: 'Memory Sequence',
    score,
    stars,
    xpEarned,
    timeTaken: `${25 - timerSeconds}s`,
    accuracy: won ? '100%' : '85%',
    message,
    onReplay: startGame,
    replayScreen: 'memory',
  });
}

/** Show unified results screen */
export function showGameResults(data) {
  const resScreen = document.getElementById('screen-results');
  if (!resScreen) return;

  document.getElementById('res-game-title').textContent = data.gameName;
  document.getElementById('res-score-val').textContent = data.score;
  document.getElementById('res-stars-val').textContent = '⭐'.repeat(data.stars);
  document.getElementById('res-xp-val').textContent = `+${data.xpEarned} XP`;
  document.getElementById('res-time-val').textContent = data.timeTaken;
  document.getElementById('res-accuracy-val').textContent = data.accuracy;
  document.getElementById('res-message-val').textContent = data.message;

  const replayBtn = document.getElementById('res-replay-btn');
  if (replayBtn) {
    replayBtn.onclick = () => {
      const screen = data.replayScreen || 'memory';
      navigateTo(screen);
      if (typeof data.onReplay === 'function') data.onReplay();
    };
  }

  navigateTo('results');
}
