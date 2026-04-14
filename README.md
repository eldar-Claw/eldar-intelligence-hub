# 🧠 Eldar Intelligence Hub

**Daily Executive News & Content Brief — Hebrew RTL Mobile App**

A production-ready MVP mobile application that automatically collects, ranks, summarizes, and delivers a daily executive report in Hebrew with the top news topics and professional content.

## 📱 Screenshots

Light theme with blue accents (#1a365d / #2b6cb0) — clean executive dashboard.

## 🏗️ Architecture

```
eldar-intelligence-hub/
├── backend/                  # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── index.ts         # Express server entry
│   │   ├── routes/          # API endpoints
│   │   │   ├── reports.ts   # Reports CRUD + generation
│   │   │   ├── sources.ts   # Source management
│   │   │   ├── settings.ts  # App settings
│   │   │   └── logs.ts      # System logs
│   │   ├── services/        # Core business logic
│   │   │   ├── collector.ts       # RSS feed fetcher
│   │   │   ├── filter.ts         # Duplicate removal + quality
│   │   │   ├── ranker.ts         # Importance ranking
│   │   │   ├── summarizer.ts     # OpenAI GPT summarization
│   │   │   ├── reportGenerator.ts # Report assembly
│   │   │   ├── emailer.ts        # Email delivery
│   │   │   └── scheduler.ts      # Daily cron job
│   │   ├── db/              # Database layer
│   │   │   ├── schema.ts   # Drizzle ORM schema
│   │   │   ├── client.ts   # SQLite connection
│   │   │   └── seed.ts     # Sample data
│   │   └── utils/
│   │       └── logger.ts    # Winston logger
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── mobile/                   # React Native (Expo) App
│   ├── app/
│   │   ├── _layout.tsx      # Root layout (RTL)
│   │   └── (tabs)/
│   │       ├── _layout.tsx  # Tab navigator
│   │       ├── index.tsx    # Dashboard (daily report)
│   │       ├── history.tsx  # Past reports
│   │       ├── sources.tsx  # Source management
│   │       └── settings.tsx # Settings
│   ├── components/          # UI components
│   │   ├── ReportCard.tsx
│   │   ├── ImportanceBadge.tsx
│   │   ├── CategoryPill.tsx
│   │   ├── TrendCard.tsx
│   │   ├── ExecutiveSummary.tsx
│   │   ├── SectionHeader.tsx
│   │   └── EmptyState.tsx
│   ├── services/
│   │   ├── api.ts           # Axios API client
│   │   └── storage.ts       # AsyncStorage
│   ├── types/index.ts       # TypeScript interfaces
│   ├── constants/theme.ts   # Colors, spacing, fonts
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── shared/types.ts           # Shared TypeScript types
├── .env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on phone

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings (OpenAI key, SMTP, etc.)

# Initialize database + seed sample data
npm run db:push
npm run db:seed

# Start server
npm run dev
```

Server runs at `http://localhost:3001`

### 2. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo dev server
npx expo start
```

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

### 3. Demo Mode

The app includes built-in sample data. Even without a running backend, the Dashboard will show a full demo report in Hebrew with:
- 10 news items across all categories
- 5 professional content items
- 3 macro trends
- Executive summary, conclusion, and watch-next

## 🔧 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | SQLite file path | `./data/database.sqlite` |
| `OPENAI_API_KEY` | OpenAI API key for summarization | Required for AI features |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | Email sender address | Required for email |
| `SMTP_PASS` | Email app password | Required for email |
| `EMAIL_TO` | Report recipient email | `eldar@el-dar.co.il` |
| `SCHEDULE_TIME` | Daily report time (HH:MM) | `07:00` |
| `TIMEZONE` | Timezone | `Asia/Jerusalem` |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List reports (paginated) |
| GET | `/api/reports/latest` | Get today's report |
| GET | `/api/reports/:id` | Get specific report |
| POST | `/api/reports/generate` | Trigger report generation |
| GET | `/api/sources` | List all sources |
| POST | `/api/sources` | Add new source |
| PUT | `/api/sources/:id` | Update source |
| DELETE | `/api/sources/:id` | Delete source |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |
| GET | `/api/logs` | Get system logs |

## 📰 News Sources (Default)

| Source | Category | Type |
|--------|----------|------|
| Ynet | News | RSS |
| Haaretz | News | RSS |
| Calcalist | Economy | RSS |
| Globes | Economy | RSS |
| Walla | News | RSS |
| Kan News | News | RSS |
| Geektime | Technology | RSS |
| People & Computers | Technology | RSS |
| TechCrunch | Technology | RSS |
| Reuters | News | RSS |
| BBC News | News | RSS |

## 🎨 Design System

- **Primary**: `#2b6cb0` (Blue)
- **Primary Dark**: `#1a365d` (Navy)
- **Background**: `#ffffff` (White)
- **Surface**: `#f7fafc` (Light gray)
- **Theme**: Light with blue accents
- **Direction**: RTL (Right-to-Left)
- **Language**: Hebrew only

## 📋 Report Structure

Each daily report includes:

1. **תקציר מנהלים** — Executive summary
2. **חדשות מרכזיות** — Top 10 news (with importance 1-10)
3. **תוכן מקצועי** — 5-10 professional articles/posts
4. **מגמות** — 3 macro trends
5. **סיכום ניהולי** — Management conclusion
6. **מה לעקוב** — What to watch next 24 hours

## 🚢 Deployment

### Backend (VPS/Cloud)
```bash
cd backend
npm run build
npm start
```

### Mobile (Expo)
```bash
cd mobile
npx expo build:ios    # iOS
npx expo build:android # Android
# Or use EAS Build:
npx eas build --platform all
```

## 📝 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo + TypeScript |
| Navigation | Expo Router (file-based) |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite + Drizzle ORM |
| AI | OpenAI GPT-4 |
| Email | Nodemailer |
| Scheduler | node-cron |

## 📄 License

Private — Eldar Intelligence Hub © 2026
