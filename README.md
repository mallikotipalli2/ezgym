# EzGym 💪

A premium, mobile-first Progressive Web App for fitness tracking. Built for serious gym users who want instant performance, offline capability, and seamless data sync.

## Features

- **Workout Tracking** — Push, Pull, Legs, Cardio, and Custom workouts with real-time set/rep/weight logging
- **Offline-First** — Works fully offline with IndexedDB. No account required.
- **Cloud Sync** — Optional Supabase auth for cross-device synchronization
- **Analytics** — Weekly charts, streak tracking, personal records, volume stats
- **PWA** — Installable, fast, and optimized for mobile with service worker caching
- **Dark/Light Mode** — Premium dark theme by default with light mode toggle

## Tech Stack

- **React 18** + TypeScript
- **Vite** — Build tooling with PWA plugin
- **Tailwind CSS** — Utility-first styling with custom design system
- **Dexie.js** — IndexedDB wrapper for local-first data
- **Supabase** — Auth + PostgreSQL for optional cloud sync
- **Framer Motion** — Smooth animations
- **Recharts** — Analytics visualizations
- **Lucide React** — Icon system

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> The app works fully without Supabase in local-only mode.

## Database Setup

If using Supabase for cloud sync:

1. Create a new Supabase project
2. Run `supabase/migration.sql` in the SQL Editor
3. Add your project URL and anon key to `.env`

## Deployment

### Netlify

Push to GitHub and connect with Netlify. Config is already in `netlify.toml`.

### Vercel

```bash
npx vercel
```

### Any Static Host

The `dist/` folder after `npm run build` is fully static and can be deployed anywhere.

## Architecture

```
src/
├── components/
│   ├── ui/           # Design system (Button, Card, Modal, Input, Badge, Avatar)
│   ├── layout/       # Navigation, PageContainer, Header
│   ├── workout/      # WorkoutCard, ExercisePicker, SetRow, ActiveWorkout
│   ├── analytics/    # WeeklyChart, StreakDisplay, VolumeChart, PersonalRecords
│   └── profile/      # ProfileForm, StatsCard
├── pages/            # Dashboard, Workout, Progress, Profile
├── hooks/            # useWorkout, useAnalytics
├── context/          # AuthContext, ThemeContext
├── lib/              # db (Dexie), supabase, sync engine, exercises, utils
└── types/            # TypeScript interfaces
```

## License

MIT
