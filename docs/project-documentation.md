# MathMind Kids – Project Documentation

## 1. Project Overview

MathMind Kids is a browser-based brain-training application designed for children aged 5–12.
It provides four interactive games to develop memory, concentration, and mathematical skills.

The application is built entirely with HTML5, CSS3, and Vanilla JavaScript (ES Modules).
No frameworks, databases, or external services are used.

---

## 2. Architecture

### Single-Page Application (SPA)

The app is structured as a SPA using a custom screen-switching system.
Each "page" is a `<section class="screen">` element.
Only one screen is visible at a time (`class="active"`).
Navigation is handled by `js/components/navigation.js`.

### Module Graph

```
script.js (entry)
├── components/navigation.js    (showToast, navigateTo, onScreenEnter)
├── components/modal.js         (showConfirm, openModal, closeModal)
├── components/rewards.js       → utils/storage.js, components/navigation.js
│                               → utils/sound.js, utils/helpers.js
├── components/parent-dashboard.js → utils/storage.js, components/navigation.js
├── utils/storage.js            (loadState, saveState, recordSession, downloadCSV)
├── utils/sound.js              (playCorrect, playWrong, playWin, ...)
├── utils/helpers.js            (shuffle, randInt, sleep, launchConfetti, ...)
├── games/memory-sequence.js    → all utils + components/rewards.js
├── games/matching-cards.js     → all utils + components/rewards.js
├── games/recall-challenge.js   → all utils + components/rewards.js
└── games/maths-puzzles.js      → all utils + components/rewards.js
```

### State Object Schema

```json
{
  "profile": {
    "name": "Champion",
    "ageGroup": "7-9",
    "createdAt": null
  },
  "settings": {
    "soundEnabled": true,
    "musicEnabled": false,
    "difficulty": "medium",
    "highContrast": false
  },
  "stats": {
    "totalSessions": 0,
    "totalScore": 0,
    "currentStreak": 0,
    "longestStreak": 0,
    "lastPlayedDate": null,
    "gamesPlayed": { "memory": 0, "cards": 0, "recall": 0, "maths": 0 },
    "bestScores":  { "memory": 0, "cards": 0, "recall": 0, "maths": 0 },
    "stars":       { "memory": 0, "cards": 0, "recall": 0, "maths": 0 }
  },
  "badges": [],
  "sessionLog": []
}
```

---

## 3. CSS Design System

### Colour Tokens (CSS Custom Properties)

| Token | Value | Usage |
|---|---|---|
| `--clr-bg` | `#0d0f1a` | Page background |
| `--clr-surface` | `#161827` | Card backgrounds |
| `--clr-primary` | `#7c5cfc` | Buttons, links, accents |
| `--clr-secondary` | `#fc5c7d` | Secondary actions |
| `--clr-accent` | `#ffd700` | Badges, streak, stars |
| `--clr-success` | `#4ade80` | Correct answers |
| `--clr-info` | `#38bdf8` | Recall game theme |

### Fonts

- **Body**: Nunito (Google Fonts) – friendly, rounded, great for children
- **Display / Headings**: Fredoka One (Google Fonts) – bold, playful headings

### Breakpoints

| Name | Width |
|---|---|
| Desktop | > 1024px |
| Tablet | ≤ 1024px |
| Mobile | ≤ 768px |
| Small Mobile | ≤ 480px |

---

## 4. Game Mechanics

### Scoring

| Game | Points | Penalty |
|---|---|---|
| Memory Sequence | +round_length × 10 per round | Game over on wrong |
| Matching Cards | base − move_penalty × 3 | Deducted per extra move |
| Recall Challenge | +15 per correct item | −5 per incorrect guess |
| Maths Puzzles | +10 + age_bonus per correct | −penalty per wrong (difficulty) |

### Star Rating

All games use the same formula:

| Performance | Stars |
|---|---|
| ≥ 90% | ⭐⭐⭐ |
| ≥ 60% | ⭐⭐ |
| ≥ 30% | ⭐ |
| < 30% | ☆ |

---

## 5. Badge Conditions

| ID | Condition |
|---|---|
| `first_game` | `totalSessions >= 1` |
| `rising_star` | Any game has `stars >= 3` |
| `streak_3` | `currentStreak >= 3` |
| `streak_7` | `currentStreak >= 7` |
| `memory_5` | `gamesPlayed.memory >= 5` |
| `cards_5` | `gamesPlayed.cards >= 5` |
| `recall_5` | `gamesPlayed.recall >= 5` |
| `maths_5` | `gamesPlayed.maths >= 5` |
| `score_100` | Any `bestScores >= 100` |
| `score_500` | `totalScore >= 500` |
| `score_1000` | `totalScore >= 1000` |
| `all_games` | All 4 games played ≥ 1 time |
| `sessions_10` | `totalSessions >= 10` |
| `sessions_25` | `totalSessions >= 25` |

---

## 6. Accessibility Features

- **WCAG 2.1 AA** compliant
- Skip-to-content link for keyboard users
- All interactive elements have `aria-label` or descriptive text
- Focus rings visible on all interactive elements (`:focus-visible`)
- Live regions (`aria-live`) for game status announcements
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Cards and buttons: `role`, `tabindex`, keyboard Enter/Space support
- Reduced motion: all animations disabled via `@media (prefers-reduced-motion: reduce)`
- Minimum touch target size: 44×44px for all interactive elements

---

## 7. localStorage Data Flow

```
User plays game
      ↓
recordSession(state, game, score, stars, difficulty)
      ↓
state.stats updated (totalSessions, gamesPlayed, bestScores, streak, sessionLog)
      ↓
saveState(state) → JSON.stringify → localStorage['mathmind_kids_v1']
      ↓
checkAndAwardBadges(state, canvas) → unlockBadge() → saveState()
      ↓
Parent visits Dashboard → loadState() → renderDashboard(state)
      ↓
Parent clicks Export CSV → downloadCSV(state) → Blob URL → browser download
```

---

## 8. Sound System

All sounds are generated procedurally using the **Web Audio API**.
No external audio files are required or loaded.

Sounds are created by combining:
- `OscillatorNode` (sine, square, sawtooth, triangle waveforms)
- `GainNode` (envelope: attack + exponential decay)

The `AudioContext` is lazily initialised on the first user interaction to comply with browser autoplay policies.

---

## 9. Known Limitations

1. **File:// protocol**: ES Modules do not work when opening `index.html` directly in a browser. A local HTTP server is required.
2. **Safari audio**: Web Audio may require an explicit user gesture (tap/click) before playing on iOS Safari.
3. **localStorage quota**: The 5MB default quota is more than sufficient for this app's data volume.
4. **Offline**: The app works offline after the first load except for Google Fonts (which are loaded from CDN). To make it fully offline, download and self-host the fonts.

---

## 10. Future Enhancements

- [ ] Service Worker for offline / PWA support
- [ ] Additional game types (word scramble, number patterns)
- [ ] Multiple child profiles
- [ ] Parent lock / PIN for dashboard access
- [ ] Custom word lists for recall challenge
- [ ] Multiplayer (local turn-based)
- [ ] Dark/light mode toggle
- [ ] More badge categories
- [ ] Background music toggle
