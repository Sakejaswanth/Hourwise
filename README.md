# Time Tracker Pro (hourly) ✦

A modern, high-performance time tracking and productivity web application built with **React 19**, **TypeScript**, and **Vite**. Designed with an ultra-clean SaaS aesthetic inspired by Linear and Cron, featuring live drift-free timers, Pomodoro focus mode, project budgets, visual analytics, calendar timeline, and client invoice generation.

---

## ✨ Key Features

### ⏱️ Live Drift-Free Timer & Pomodoro Focus
- **Count-Up Stopwatch**: Real-time tracking based on timestamps, preventing drift even when backgrounded or asleep.
- **Pomodoro Mode**: Switch between **Focus (25m)**, **Short Break (5m)**, and **Long Break (15m)** with visual progress bar and completion notifications.
- **Synthesized Audio Chimes**: Web Audio API bells for timer start, pause, and Pomodoro finish (zero external audio file dependencies).
- **Inline Task Configuration**: Assign projects, tags (`#design`, `#dev`), notes, and billable status directly from the tracker bar.
- **1-Click Resume**: Instant play button on past entries to resume identical tasks with a single click.

### 📋 Detailed Timesheet & Grouped Logs
- **Date Grouping**: Entries neatly organized by date (Today, Yesterday, previous days) with daily subtotals for hours and billable earnings.
- **Multi-Filter & Search**: Filter by project, client, billable rate, tags, and keywords in real time.
- **Entry Actions**: Edit, duplicate, resume, or delete any past entry.

### 📂 Projects & Budget Management
- **Project Cards**: Track hourly billable rates, total time spent, and client revenue.
- **Budget Tracking**: Visual progress bars showing allocated hours (e.g. `28.5h / 40h`) with over-budget alerts.
- **Color Customization**: 8 curated color swatches (Coral, Mint, Lavender, Amber, Sky, Rose, Emerald, Indigo).
- **Quick Track**: Start tracking time directly on any project card.

### 📊 Reports, Analytics & Invoicing
- **Interactive SVG Donut Chart**: Project time allocation breakdown with hover segments and details.
- **Stacked Daily Bar Chart**: Visual comparison of billable client work vs. non-billable internal hours.
- **Date Range Filters**: This Week, Last Week, This Month, and All Time.
- **Export to CSV**: Download complete timesheet records with project, client, rate, duration, and calculated invoice amounts.
- **Print / PDF Invoice**: Clean, dedicated print stylesheet (`window.print()`) formatted for client invoicing.

### 📅 Calendar Timeline View
- **Weekly Schedule Visualizer**: Monday through Sunday grid (8:00 AM – 8:00 PM).
- **Time Block Layout**: Color-coded blocks mapped according to start time and duration.
- **Week Navigator**: Browse past and upcoming weeks with date range indicators.

### ⚙️ Preferences, Themes & Data Portability
- **Light & Dark Themes**: Handcrafted dual-theme design system with smooth color tokens.
- **Goal Setting**: Set daily and weekly focus targets with dynamic streak calculations.
- **Currencies**: Support for `$`, `€`, `£`, `₹`, `¥`, and `CHF`.
- **JSON Backup & Restore**: Export complete workspace snapshots or import archives anytime.
- **Demo Seed Generator**: Pre-loaded with realistic client projects and time entries dynamically mapped to the current week.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Start / Pause active timer |
| `S` | Stop and save current timer |
| `N` | Open manual time entry modal |
| `P` | Switch between Stopwatch & Pomodoro mode |
| `D` | Toggle Dark / Light theme |
| `1` – `6` | Navigate views (Overview, Entries, Projects, Reports, Calendar, Settings) |
| `?` | Open shortcuts cheat sheet |
| `Esc` | Close any open modal or navigation drawer |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation & Development
```bash
# Clone the repository
git clone <repo-url>
cd "Time tracker pro"

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build & Linting
```bash
# Type check and build production bundle
npm run build

# Run Oxlint for code quality
npm run lint

# Preview production build locally
npm run preview
```

---

## 📁 Architecture Overview

```
src/
├── types/
│   └── index.ts                 # TimeEntry, Project, UserSettings, PomodoroState, Tag, etc.
├── utils/
│   ├── sound.ts                 # Web Audio API chimes (start, pause, pomodoro bell)
│   ├── storage.ts               # LocalStorage sync, dynamic seed generator, JSON backup/restore
│   ├── time.ts                  # Drift-free timer calculations, date grouping & formatting
│   └── export.ts                # CSV generator & printable invoice trigger
├── context/
│   ├── timeTrackerContextDef.ts # Context definition & interface
│   ├── TimeTrackerContext.tsx   # State provider, timer interval, CRUD methods
│   └── useTimeTracker.ts        # Custom hook for consuming tracker state
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Navigation, active timer pill, theme toggle, mobile drawer
│   │   └── Topbar.tsx           # Breadcrumb, global search, sound toggle, shortcuts button
│   ├── timer/
│   │   └── TrackerHero.tsx      # Main timer hero, stopwatch/pomodoro, project/tag selector
│   ├── views/
│   │   ├── OverviewView.tsx     # Dashboard KPIs, weekly SVG bar chart, recent entries
│   │   ├── EntriesView.tsx      # Timesheet log grouped by date, multi-filter, CSV export
│   │   ├── ProjectsView.tsx     # Project cards, budget tracking, client rates
│   │   ├── ReportsView.tsx      # SVG Donut chart, stacked billable bars, invoice printout
│   │   ├── CalendarView.tsx     # Hourly weekly schedule timeline blocks
│   │   └── SettingsView.tsx     # Workspace profile, currencies, goals, data import/export
│   ├── modals/
│   │   ├── ManualEntryModal.tsx # Add/Edit manual time entry modal
│   │   ├── ProjectModal.tsx     # Create/Edit project modal
│   │   └── ShortcutsModal.tsx   # Keyboard shortcuts reference guide
│   └── common/
│       ├── Toast.tsx            # Floating toast notification system
│       └── StatCard.tsx         # Reusable KPI tile component
├── App.tsx                      # App shell, global shortcut listener & view router
├── App.css                      # Complete styling tokens for Light & Dark mode
└── main.tsx                     # React 19 entry root
```

---

## 📄 License
MIT License.
