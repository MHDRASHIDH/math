/**
 * maths-puzzles.js – 3D Cartoon Maths Puzzles
 * Matches Screenshot 2026-10-19 225707.png
 * Features sequence pattern puzzles ("What number comes next?"),
 * 4 colorful 3D answer buttons, Level 3, Progress bar, Score 150, ⏱ 15s timer,
 * and Teen Student with glowing lightbulb saying "Think Logically!".
 */

import { sleep, launchConfetti, shuffle } from '../utils/helpers.js';
import { playCorrect, playWrong, playWin } from '../utils/sound.js';
import { recordSession } from '../utils/storage.js';
import { showToast } from '../components/navigation.js';
import { checkAndAwardBadges } from '../components/rewards.js';
import { showGameResults } from './memory-sequence.js';

const PUZZLE_BANK = [
  {
    question: 'What number comes next?',
    sequence: ['3', '6', '12', '24', '?'],
    correct: 48,
    options: [36, 42, 48, 60],
    hint: 'Rule: Multiply by 2 each step (doubling)!',
    difficulty: '13+'
  },
  {
    question: 'Complete the pattern:',
    sequence: ['5', '10', '20', '40', '?'],
    correct: 80,
    options: [60, 70, 80, 100],
    hint: 'Rule: Each number doubles the previous!',
    difficulty: '13+'
  },
  {
    question: 'Find the missing number:',
    sequence: ['2', '7', '14', '23', '?'],
    correct: 34,
    options: [28, 32, 34, 38],
    hint: 'Rule: Add +5, +7, +9, +11...',
    difficulty: '13+'
  },
  {
    question: 'What number completes the sequence?',
    sequence: ['1', '4', '9', '16', '?'],
    correct: 25,
    options: [20, 24, 25, 36],
    hint: 'Rule: Perfect squares (1², 2², 3², 4², 5²)',
    difficulty: '13+'
  },
  {
    question: 'What number comes next?',
    sequence: ['100', '92', '84', '76', '?'],
    correct: 68,
    options: [64, 66, 68, 70],
    hint: 'Rule: Subtract 8 each step',
    difficulty: '13+'
  }
];

let currentPuzzleIndex = 0;
let currentLevel = 3;
let score = 150;
let timerSeconds = 15;
let timerInterval = null;
let gameActive = false;
let appState = null;
let confettiCanvas = null;

const BUTTON_COLORS = [
  'var(--btn-blue-3d)',
  'var(--btn-green-3d)',
  'var(--btn-gold-3d)',
  'var(--btn-purple-3d)'
];

export function initMathsPuzzles(state, canvas) {
  appState = state;
  confettiCanvas = canvas;

  const startBtn = document.getElementById('maths-start-btn');
  if (startBtn) startBtn.addEventListener('click', startGame);

  const restartBtn = document.getElementById('maths-restart-btn');
  if (restartBtn) restartBtn.addEventListener('click', startGame);

  const hintBtn = document.getElementById('maths-hint-btn');
  if (hintBtn) hintBtn.addEventListener('click', showHint);
}

function startGame() {
  clearInterval(timerInterval);
  score = 0;
  currentPuzzleIndex = 0;
  currentLevel = 3;
  timerSeconds = 15;
  gameActive = true;

  updateHUD();
  loadPuzzle(currentPuzzleIndex);
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  const timerEl = document.getElementById('maths-timer');
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timerSeconds--;
    if (timerEl) timerEl.textContent = `${Math.max(0, timerSeconds)}s`;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      handleAnswer(null);
    }
  }, 1000);
}

function loadPuzzle(idx) {
  const puzzle = PUZZLE_BANK[idx % PUZZLE_BANK.length];
  timerSeconds = 15;

  const qTitle = document.getElementById('maths-puzzle-title');
  if (qTitle) qTitle.textContent = puzzle.question;

  const seqRow = document.getElementById('maths-seq-boxes');
  if (seqRow) {
    seqRow.innerHTML = '';
    puzzle.sequence.forEach(val => {
      const box = document.createElement('div');
      box.className = 'seq-box';
      box.textContent = val;
      if (val === '?') {
        box.style.borderColor = '#3b82f6';
        box.style.color = '#2563eb';
        box.style.background = '#eff6ff';
      }
      seqRow.appendChild(box);
    });
  }

  const ansRow = document.getElementById('maths-ans-buttons');
  if (ansRow) {
    ansRow.innerHTML = '';
    const shuffledOpts = shuffle([...puzzle.options]);
    shuffledOpts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'maths-ans-btn';
      btn.textContent = opt;
      btn.style.background = BUTTON_COLORS[i % BUTTON_COLORS.length];
      btn.onclick = () => handleAnswer(opt);
      ansRow.appendChild(btn);
    });
  }

  setSpeechBubble('Think Logically! 💡');
}

function handleAnswer(selectedOpt) {
  if (!gameActive) return;
  const puzzle = PUZZLE_BANK[currentPuzzleIndex % PUZZLE_BANK.length];

  if (selectedOpt === puzzle.correct) {
    playCorrect();
    score += 30;
    updateHUD();
    setSpeechBubble('Spot on! Excellent! 🎉');
    showToast('Correct! +30 points ⭐', 'success', 1200);
  } else {
    playWrong();
    setSpeechBubble('Check the difference! 🧐');
    showToast(`The correct answer was ${puzzle.correct}`, 'warning', 1800);
  }

  currentPuzzleIndex++;
  if (currentPuzzleIndex < 4) {
    setTimeout(() => {
      if (gameActive) loadPuzzle(currentPuzzleIndex);
    }, 1200);
  } else {
    setTimeout(endGame, 1200);
  }
}

function showHint() {
  if (!gameActive) return;
  const puzzle = PUZZLE_BANK[currentPuzzleIndex % PUZZLE_BANK.length];
  showToast(puzzle.hint, 'info', 3000);
  score = Math.max(0, score - 10);
  updateHUD();
}

function updateHUD() {
  const levelEl = document.getElementById('maths-level');
  const scoreEl = document.getElementById('maths-score');
  const progressEl = document.getElementById('maths-progress-fill');

  if (levelEl) levelEl.textContent = `Level ${currentLevel}`;
  if (scoreEl) scoreEl.textContent = score;
  if (progressEl) {
    const pct = Math.min(100, (currentPuzzleIndex / 4) * 100);
    progressEl.style.width = `${pct}%`;
  }
}

function setSpeechBubble(text) {
  const bubble = document.getElementById('maths-speech-bubble');
  if (bubble) bubble.textContent = text;
}

function endGame() {
  gameActive = false;
  clearInterval(timerInterval);

  const won = score >= 60;
  const stars = score >= 90 ? 3 : (score >= 60 ? 2 : 1);
  const xpEarned = score + 50;

  if (won) {
    playWin();
    if (confettiCanvas) launchConfetti(confettiCanvas);
  }

  if (appState) {
    recordSession(appState, 'maths', score, stars, 'medium');
    checkAndAwardBadges(appState);
  }

  showGameResults({
    gameName: 'Maths Puzzles',
    score,
    stars,
    xpEarned,
    timeTaken: '45s',
    accuracy: `${Math.round((score / 120) * 100)}%`,
    message: won ? 'Outstanding mathematical deduction!' : 'Great problem-solving session!',
    onReplay: startGame,
    replayScreen: 'maths',
  });
}
