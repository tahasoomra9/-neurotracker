# NeuroTracker (WIP)

**A productivity and financial-planning desktop app that turns your goals into clear, actionable weekly tasks.**

![Status](https://img.shields.io/badge/Status-Work_In_Progress-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech](https://img.shields.io/badge/Built_With-Electron_%7C_React_%7C_TypeScript-blueviolet)

## Overview

NeuroTracker is a desktop application built with **TypeScript**, **React**, and **Electron**. It is designed to act as a minimalistic "life OS," helping users organize their lives across two major areas: Skill Acquisition and Financial Planning.

Unlike standard planners that just list dates, NeuroTracker creates the steps for you—breaking down learning curves and savings goals into manageable weekly chunks.

---

## Core Features

### 1. 🧠 Skill & Goal Breakdown
NeuroTracker turns abstract ambitions into concrete plans.

*   **You Enter:**
    *   A skill you want to learn (e.g., Programming, Drawing, Machine Learning, Guitar).
    *   Your current skill level.
    *   Your target level or specific goal.
*   **NeuroTracker Then:**
    *   Breaks the skill into small, realistic, progression-based steps.
    *   Generates specific weekly plans and tasks.
    *   Adapts tasks based on difficulty, time constraints, and user progress.
    *   Tracks streaks, milestones, and learning momentum.

### 2. 💰 Finance & Savings Planner
A proactive approach to saving money based on weekly behavior.

*   **You Enter:**
    *   Your monthly income (salary, rent, side gigs, etc.).
    *   Your monthly expenses.
    *   A savings goal (e.g., £2000 for a PC build, rent deposit, travel fund).
*   **NeuroTracker Then:**
    *   Calculates exactly how much you need to save each week.
    *   Converts your saving plan into actionable weekly "financial tasks."
    *   Shows real-time progress towards your goal.
    *   Alerts you when spending habits threaten the plan.
    *   Allows for flexible adjustments at any time.

---

## Feature Status

| Feature | Status |
| :--- | :--- |
| **Desktop App Shell (Electron)** | ✔ Ready |
| **Weekly Task Generator** | ✔ Ready |
| **Goal Breakdown Logic** | ✔ Ready |
| **Finance Tracker** | ✔ Ready |
| **Local Data Storage** | ✔ Ready |
| **AI-Powered Breakdown System** | ❗ WIP |
| **Gamification (Streaks, XP)** | ❗ WIP |
| **Visual Dashboards** | ❗ WIP |
| **Data Import/Export** | ❗ Planned |
| **Offline Mode** | ❗ Planned |

---

## Tech Stack

*   **[Electron](https://www.electronjs.org/)**: Desktop application shell.
*   **[React](https://reactjs.org/)**: User Interface library.
*   **[TypeScript](https://www.typescriptlang.org/)**: For type-safe, maintainable code.
*   **Vite / Webpack**: Build tooling.
*   **LocalStorage / IndexedDB**: Data persistence (File storage WIP).

---

## Project Structure

```text
neurotracker/
│
├── app/                # Electron main process configuration
├── src/                # React frontend source code
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Application views/routes
│   └── utils/          # Helper functions and logic
├── public/             # Static assets
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

---

## Getting Started

### Prerequisites

*   **Node.js** (v18 or higher)
*   **npm** or **yarn**

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/neurotracker.git
    cd neurotracker
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Usage

**Run in development mode:**
Starts the React dev server and the Electron window.
```bash
npm run dev
```

**Build the application:**
Compiles the code and builds the executable for your OS.
```bash
npm run build
npm run electron:build
```

---

## Why NeuroTracker?

Most planners tell you *what* to do. NeuroTracker helps you figure out *how* to do it.

It is built as a long-term, minimalistic system for people who want:
*   **Clarity** on their path forward.
*   **Progress** measurable in weekly steps.
*   **Consistency** via habit tracking.
*   **Automation** of the planning process.

---

## Roadmap

The project is actively in development. The current focus is on integrating the AI engine for smarter task generation.

- [ ] **AI-based breakdown engine** (Integration with LLMs for dynamic task creation)
- [ ] **XP & Achievement System** (Gamify the productivity experience)
- [ ] **Financial Graphing** (Visual representations of savings vs. expenses)
- [ ] **Drag-and-drop Weekly Planner** (Better UI for task management)
- [ ] **Dark Mode** (Full UI theming)
- [ ] **Cloud Sync** (Optional cross-device synchronization)
- [ ] **CI/CD & Testing** (Robust testing suite)

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
```
