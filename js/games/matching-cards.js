/**
 * matching-cards.js – 3D Cartoon Matching Cards Game
 * Matches Screenshot 2026-10-19 225528.png
 * Features 3D animal cards (Lion, Panda, Elephant, Fox, Monkey, Bear, etc.),
 * Moves & Pairs counter, timer, score, and Brain Mascot feedback ("Good Memory!").
 */

import { shuffle, sleep, launchConfetti } from '../utils/helpers.js';
import { playCorrect, playWrong, playWin, playFlip } from '../utils/sound.js';
import { recordSession } from '../utils/storage.js';
import { navigateTo, showToast } from '../components/navigation.js';
import { checkAndAwardBadges } from '../components/rewards.js';
import { showGameResults } from './memory-sequence.js';

const ANIMALS = [
  { id: 'lion', name: 'Lion', img: 'assets/images/animals/lion.svg' },
  { id: 'panda', name: 'Panda', img: 'assets/images/animals/panda.svg' },
  { id: 'elephant', name: 'Elephant', img: 'assets/images/animals/elephant.svg' },
  { id: 'fox', name: 'Fox', img: 'assets/images/animals/fox.svg' },
  { id: 'monkey', name: 'Monkey', img: 'assets/images/animals/monkey.svg' },
  { id: 'bear', name: 'Bear', img: 'assets/images/animals/bear.svg' },
  { id: 'penguin', name: 'Penguin', img: 'assets/images/animals/penguin.svg' },
  { id: 'tiger', name: 'Tiger', img: 'assets/images/animals/tiger.svg' },
];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 6;
let moves = 0;
let score = 0;
let currentLevel = 3;
let timerSeconds = 30;
let timerInterval = null;
let gameActive = false;
let isBusy = false;
let appState = null;
let confettiCanvas = null;

export function initMatchingCards(state, canvas) {
  appState = state;
  confettiCanvas = canvas;

  const startBtn = document.getElementById('cards-start-btn');
  if (startBtn) startBtn.addEventListener('click', startGame);

  const restartBtn = document.getElementById('cards-restart-btn');
  if (restartBtn) restartBtn.addEventListener('click', startGame);

  const hintBtn = document.getElementById('cards-hint-btn');
  if (hintBtn) hintBtn.addEventListener('click', showHint);
}

function startGame() {
  clearInterval(timerInterval);
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  score = 0;
  isBusy = false;
  gameActive = true;
  totalPairs = currentLevel === 1 ? 4 : (currentLevel === 2 ? 6 : 8);
  timerSeconds = 35;

  updateHUD();
  setMascotSpeech('Find all the pairs! 🦁');
  startTimer();
  generateGrid();
}

function startTimer() {
  clearInterval(timerInterval);
  const timerEl = document.getElementById('cards-timer');
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timerSeconds--;
    if (timerEl) timerEl.textContent = `${Math.max(0, timerSeconds)}s`;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      endGame(false);
    }
  }, 1000);
}

function generateGrid() {
  const gridEl = document.getElementById('cards-grid-3d');
  if (!gridEl) return;
  gridEl.innerHTML = '';

  const selectedAnimals = ANIMALS.slice(0, totalPairs);
  const deck = [];
  selectedAnimals.forEach(a => {
    deck.push({ ...a, uid: a.id + '-1' });
    deck.push({ ...a, uid: a.id + '-2' });
  });

  cards = shuffle(deck);

  cards.forEach((card, index) => {
    const tile = document.createElement('div');
    tile.className = 'animal-card-tile';
    tile.dataset.index = index;
    tile.dataset.animal = card.id;

    // Front is card back pattern, hidden face is animal
    tile.innerHTML = `
      <div class="card-inner" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
        <span class="card-back-icon" style="font-size:2rem;display:block;">✨</span>
        <img src="${card.img}" alt="${card.name}" style="display:none;width:80%;height:80%;object-fit:contain;" />
      </div>
    `;

    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('aria-label', `Card ${index + 1}`);

    tile.addEventListener('click', () => handleCardClick(tile, index));
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick(tile, index);
      }
    });
    gridEl.appendChild(tile);
  });
}

function handleCardClick(tile, index) {
  if (!gameActive || isBusy || tile.classList.contains('flipped') || tile.classList.contains('matched')) {
    return;
  }

  playFlip();
  revealCard(tile);
  flippedCards.push({ tile, card: cards[index] });

  if (flippedCards.length === 2) {
    moves++;
    updateHUD();
    checkMatch();
  }
}

function revealCard(tile) {
  tile.classList.add('flipped');
  const backIcon = tile.querySelector('.card-back-icon');
  const img = tile.querySelector('img');
  if (backIcon) backIcon.style.display = 'none';
  if (img) img.style.display = 'block';
}

function hideCard(tile) {
  tile.classList.remove('flipped');
  const backIcon = tile.querySelector('.card-back-icon');
  const img = tile.querySelector('img');
  if (backIcon) backIcon.style.display = 'block';
  if (img) img.style.display = 'none';
}

async function checkMatch() {
  isBusy = true;
  const [first, second] = flippedCards;

  if (first.card.id === second.card.id) {
    // Match!
    playCorrect();
    first.tile.classList.add('matched');
    second.tile.classList.add('matched');
    matchedPairs++;
    score += 20;
    setMascotSpeech('Good Memory! ⭐');
    flippedCards = [];
    isBusy = false;
    updateHUD();

    if (matchedPairs >= totalPairs) {
      setTimeout(() => endGame(true), 600);
    }
  } else {
    // Not match
    playWrong();
    await sleep(900);
    hideCard(first.tile);
    hideCard(second.tile);
    flippedCards = [];
    isBusy = false;
  }
}

function showHint() {
  if (!gameActive || isBusy) return;
  // Briefly flash all unmatched cards
  const unmatched = document.querySelectorAll('.animal-card-tile:not(.matched)');
  unmatched.forEach(revealCard);
  setTimeout(() => {
    unmatched.forEach(t => {
      if (!flippedCards.some(f => f.tile === t)) {
        hideCard(t);
      }
    });
  }, 1000);
  score = Math.max(0, score - 10);
  updateHUD();
  showToast('Hint: Memorise fast! 👁️', 'info', 1500);
}

function updateHUD() {
  const levelEl = document.getElementById('cards-level');
  const scoreEl = document.getElementById('cards-score');
  const movesEl = document.getElementById('cards-moves-count');
  const pairsEl = document.getElementById('cards-pairs-count');
  const progressEl = document.getElementById('cards-progress-fill');

  if (levelEl) levelEl.textContent = `Level ${currentLevel}`;
  if (scoreEl) scoreEl.textContent = score;
  if (movesEl) movesEl.textContent = moves;
  if (pairsEl) pairsEl.textContent = `${matchedPairs} / ${totalPairs}`;
  if (progressEl) {
    const pct = totalPairs ? Math.min(100, (matchedPairs / totalPairs) * 100) : 0;
    progressEl.style.width = `${pct}%`;
  }
}

function setMascotSpeech(text) {
  const bubble = document.getElementById('cards-speech-bubble');
  if (bubble) bubble.textContent = text;
}

function endGame(won) {
  gameActive = false;
  clearInterval(timerInterval);

  const stars = won ? 3 : 1;
  const xpEarned = score + 50;

  if (won) {
    playWin();
    if (confettiCanvas) launchConfetti(confettiCanvas);
  }

  if (appState) {
    recordSession(appState, 'cards', score, stars, 'medium');
    checkAndAwardBadges(appState);
  }

  showGameResults({
    gameName: 'Match the Pairs',
    score,
    stars,
    xpEarned,
    timeTaken: `${35 - timerSeconds}s`,
    accuracy: `${Math.round((matchedPairs / Math.max(1, moves)) * 100)}%`,
    message: won ? 'Fantastic memory! All pairs matched!' : 'Good try! Practise to beat your score!',
    onReplay: startGame,
    replayScreen: 'cards',
  });
}
