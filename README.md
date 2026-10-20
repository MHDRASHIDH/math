# 🧠 MathMind Kids – Brain Training Game

> A free, fun, and privacy-friendly brain-training web app for children aged 5–12.
> Built with pure HTML, CSS, and Vanilla JavaScript (ES Modules). No frameworks, no databases, no external servers.

![MathMind Kids Banner](https://img.shields.io/badge/MathMind-Kids-7c5cfc?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSIuOWVtIiBmb250LXNpemU9IjkwIj7wn6eA</text></svg>)
![Version](https://img.shields.io/badge/version-1.0.0-success?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![No Tracking](https://img.shields.io/badge/privacy-no%20tracking-green?style=flat-square)

---

## 📋 Table of Contents

- [Features](#features)
- [Games](#games)
- [Folder Structure](#folder-structure)
- [Tech Stack](#tech-stack)
- [Setup & Running Locally](#setup--running-locally)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Privacy](#privacy)
- [Contributing](#contributing)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **Memory Sequence** | Simon-style button sequence game, grows each round |
| 🃏 **Matching Cards** | Emoji card-flip game with move-count scoring |
| 💡 **Recall Challenge** | Timed word/number memorisation, 3 rounds |
| 🔢 **Maths Puzzles** | Age-adaptive multiple-choice maths questions |
| 🎯 **3 Difficulty Levels** | Easy / Medium / Hard for every game |
| 👶 **Age Groups** | Tailored for ages 5–6, 7–9, and 10–12 |
| ⭐ **Stars & Badges** | 14 collectable badges, 0–3 stars per session |
| 🔥 **Daily Streaks** | Encourages daily play |
| 💡 **Hints System** | In-game hints after incorrect answers |
| 🔊 **Sound Effects** | Procedural Web Audio – no external audio files |
| 📊 **Parent Dashboard** | Weekly bar charts, session history, best scores |
| 📥 **CSV Export** | Download full session history as a CSV file |
| 💾 **localStorage** | All data stays on the device – no servers |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |
| ♿ **Accessible** | WCAG 2.1 AA: focus rings, skip links, ARIA, reduced motion |
| 🎨 **Dark Premium Theme** | Glassmorphism, micro-animations, confetti |

---

## 🎮 Games

### 🧠 Memory Sequence
Simon-style game where coloured emoji buttons light up in a sequence.
The player must repeat the sequence in the correct order.
Each successful round adds one more step.

- **Easy**: Start at 2, max 6 steps, 600ms flash
- **Medium**: Start at 3, max 10 steps, 450ms flash
- **Hard**: Start at 4, max 14 steps, 300ms flash

### 🃏 Matching Cards
Classic emoji card-flip memory game.
Flip cards to find all matching pairs.
Fewer moves = higher score.

- **Easy**: 6 pairs (3×4 grid)
- **Medium**: 8 pairs (4×4 grid)
- **Hard**: 12 pairs (4×6 grid)

### 💡 Recall Challenge
A list of words or numbers appears briefly.
The player must type back as many as they can remember.
3 rounds per game. Partial credit awarded.

- **Easy**: 4 words, 4 seconds
- **Medium**: 6 mixed items, 3 seconds
- **Hard**: 8 numbers, 2 seconds

### 🔢 Maths Puzzles
Age-appropriate maths questions with 4 multiple-choice options.
Questions adapt to the selected age group.

| Age Group | Operations | Number Range |
|---|---|---|
| Ages 5–6 | +, − | Up to 10 |
| Ages 7–9 | +, −, × | Up to 50 |
| Ages 10–12 | +, −, ×, ÷ | Up to 144 |

---

## 📁 Folder Structure

```
MathMind-Kids/
│
├── index.html              ← Single-page app entry point
├── README.md               ← This file
├── .gitignore
│
├── assets/
│   ├── images/             ← Game images (future use)
│   ├── icons/              ← App icons (future use)
│   └── sounds/             ← Audio files (currently procedural)
│
├── css/
│   ├── style.css           ← Main design system & all component styles
│   ├── responsive.css      ← Media queries (1024px, 768px, 480px)
│   └── accessibility.css   ← WCAG 2.1 AA focus, contrast, reduced-motion
│
├── js/
│   ├── script.js           ← 🚀 Main entry point (bootstraps all modules)
│   │
│   ├── games/
│   │   ├── memory-sequence.js   ← Simon-style sequence game
│   │   ├── matching-cards.js    ← Emoji card-flip game
│   │   ├── recall-challenge.js  ← Timed recall game
│   │   └── maths-puzzles.js     ← Age-adaptive maths questions
│   │
│   ├── components/
│   │   ├── navigation.js        ← SPA screen routing + toast notifications
│   │   ├── modal.js             ← Reusable confirm/alert dialog
│   │   ├── rewards.js           ← Badge catalogue + unlock logic + stars
│   │   └── parent-dashboard.js  ← Charts, tables, CSV export button
│   │
│   └── utils/
│       ├── storage.js      ← localStorage helpers + CSV export
│       ├── sound.js        ← Web Audio API procedural sounds
│       └── helpers.js      ← shuffle, randInt, sleep, confetti, etc.
│
└── docs/
    └── project-documentation.md
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure, ARIA, screen system |
| CSS3 | Custom properties, animations, glassmorphism, Grid, Flexbox |
| Vanilla JavaScript (ES2020+) | All logic, no frameworks |
| ES Modules | `import`/`export` for clean module separation |
| Web Audio API | Procedural sound effects (no external files) |
| localStorage | Client-side data persistence |
| Canvas API | Confetti celebration effect |
| CSS Animations | Micro-interactions, card flips, star bursts |

---

## 🚀 Setup & Running Locally

### Prerequisites
- A modern web browser (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)
- **VS Code** with the **Live Server** extension installed

### Why Live Server is Required
This project uses **ES Modules** (`type="module"`).
Browsers block module imports when opening HTML files directly as `file://` URLs due to CORS security policy.
You **must** serve the project via an HTTP server.

### Method 1: VS Code Live Server (Recommended)
1. Open the `MathMind-Kids/` folder in VS Code
2. Right-click `index.html` → **"Open with Live Server"**
3. The app opens at `http://127.0.0.1:5500`

### Method 2: Python HTTP Server
```bash
cd MathMind-Kids
python -m http.server 8080
# Open http://localhost:8080
```

### Method 3: Node.js http-server
```bash
npx -y http-server MathMind-Kids -p 8080 -o
```

---

## 🌐 Deploying to GitHub Pages

### Step 1: Create a GitHub Repository
```bash
cd MathMind-Kids
git init
git add .
git commit -m "🚀 Initial commit: MathMind Kids v1.0.0"
```

### Step 2: Push to GitHub
```bash
# Create a repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/mathmind-kids.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select **Branch: main** and **Folder: / (root)**
4. Click **Save**
5. Your site will be live at:
   `https://YOUR_USERNAME.github.io/mathmind-kids/`

> ⏱ GitHub Pages may take 2–5 minutes to deploy on the first run.

### Step 4: Verify ES Modules Work
GitHub Pages serves files over HTTPS, so ES Modules will work correctly.
No extra configuration is needed.

---

## 🔒 Privacy

- ✅ **All data stored locally** using `localStorage` on the user's device
- ✅ **Zero external servers** — no data is ever transmitted
- ✅ **No cookies**, no analytics, no advertising
- ✅ **No user accounts** or login required
- ✅ **COPPA compliant** — no collection of children's data
- ✅ CSV export is generated **entirely in the browser**
- ✅ Sound effects are **generated procedurally** — no external audio files loaded

---

## 🧪 Testing Checklist

Before submitting or publishing, verify:

- [ ] All 4 games start, play, and end correctly
- [ ] Score is calculated and displayed properly
- [ ] Stars animate on game completion (0–3)
- [ ] Difficulty buttons switch levels correctly
- [ ] Sound effects play (and toggle off correctly)
- [ ] Badges unlock after earning them
- [ ] Streak increments when playing on consecutive days
- [ ] Dashboard shows correct stats and charts
- [ ] Session table populates after games
- [ ] CSV export downloads correctly
- [ ] "Reset Progress" works and confirms via modal
- [ ] Navigation links all work (desktop and mobile)
- [ ] Hamburger menu opens/closes on mobile
- [ ] Responsive layout on 320px, 768px, 1024px viewports
- [ ] Focus rings visible on keyboard navigation
- [ ] No console errors or warnings

---

## 📄 License

MIT License – free to use, modify, and share.

---

## 🤝 Contributing

Pull requests welcome! Please:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add: my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

*Built with ❤️ for curious kids everywhere.*
