# Personal Growth Dashboard

A lightweight web app for measuring and visualizing personal growth across Q4 2025 and Q1 2026.

## Features

- **SUS-adapted self-assessment** — 10-question survey scored 0–100
- **Activity tracking** — Events (×1) and milestones (×4) weighted growth score
- **Three comparison charts** — Self-score, activity breakdown, combined insight
- **Question-level delta** — Per-question improvement tracker
- **LocalStorage persistence** — Data saved between sessions
- **Print-ready** — Clean print layout for your report

## Tech Stack

- React 18 + Vite
- Chart.js + react-chartjs-2
- CSS Modules (no Tailwind, no external UI libraries)
- Google Fonts: DM Serif Display + DM Sans + DM Mono

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

Output goes to `dist/` — deploy that folder anywhere.

## Deploy Options

### Vercel (recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag the dist/ folder to netlify.com/drop
```

### GitHub Pages
```bash
npm run build
# Push dist/ to gh-pages branch
```

### Any static host
Upload the contents of `dist/` to your host.

## Project Structure

```
src/
  main.jsx          — Entry point
  App.jsx           — Root component + state
  constants.js      — Questions, scoring formulas
  style.css         — Global styles + design tokens
  components/
    Header.jsx      — Navigation header
    InputView.jsx   — Survey + activity input
    Dashboard.jsx   — Charts + insights
```

## Scoring

**Self-score (SUS-adapted)**
- Odd questions: score − 1
- Even questions: 5 − score
- Total × 2.5 = final score (0–100)

| Score | Level |
|-------|-------|
| 85–100 | Excellent |
| 70–84 | Good |
| 50–69 | Fair |
| 0–49 | Needs work |

**Growth score**
`events × 1 + milestones × 4`
