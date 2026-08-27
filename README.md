# Parivahan Sewa — RTO Learner's Licence Portal

A hackathon prototype demonstrating a modernized Indian government digital service: **online Learner's Licence application via the Karnataka RTO**, from form submission through officer review and approval tracking.

> **Demo prototype — not a real government service. All data is entirely synthetic.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Express.js 5 (auth + API routes) |
| Database | MongoDB via Mongoose |
| AI Assistant | OpenRouter API (`stealth/ox-alpha`) with offline fallback |
| Auth | Mock SSO (username/password + DigiLocker email flow) |
| Runtime | Node.js 20+ with `tsx` for TypeScript |

---

## Portals

| Portal | URL | Role |
|---|---|---|
| Citizen Portal | `/` | Apply for Learner's Licence, track applications |
| Officer Portal | `/officer` | Statewide application queue, review + approve/reject |
| Admin Dashboard | `/admin` | Metrics, audit log, service health |

---

## Quick Start (Combined Mode)

Combined mode runs both frontend and backend on a single port — easiest for local development.

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.local.example .env.local
# Edit .env.local and set MONGODB_URI and OPENROUTER_API_KEY

# 3. Start MongoDB (if running locally)
mongod

# 4. Seed mock data (run once)
npm run seed

# 5. Start the development server
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

Create `.env.local` in the project root:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/parivahan-rto

# OpenRouter API key — get one at https://openrouter.ai
# Optional: AI assistant runs in offline FAQ fallback mode without it
OPENROUTER_API_KEY=sk-or-v1-...

# Express session secret (change in production)
SESSION_SECRET=parivahan-demo-key-2024

# Separated deployment only — URL of the standalone API server
# Leave unset in combined (server.ts) mode
# API_URL=https://your-api.railway.app

# Separated deployment only — frontend URL for CORS
# FRONTEND_URL=https://your-app.vercel.app
```

---

## Demo Credentials

### Username / Password Login (`/login`)

| Role | Username | Password |
|---|---|---|
| Citizen | `anjali.sharma` | `demo123` |
| Citizen | `fatima.begum` | `demo123` |
| Citizen | `suresh.reddy` | `demo123` |
| Officer | `rajesh.kumar` | `officer123` |
| Officer | `priya.nair` | `officer123` |
| Admin | `admin` | `admin@rto` |

### DigiLocker Email Login (`/digilocker`)

| Role | Email |
|---|---|
| Citizen | `anjali.sharma@gmail.com` |
| Citizen | `fatima.begum@gmail.com` |
| Officer | `rajesh.kumar@karnataka.gov.in` |
| Officer | `priya.nair@karnataka.gov.in` |

---

## Architecture

### Combined Mode (default — `server.ts`)

```
Browser
  └── :3000 ──► Express (auth + API routes)
                └── Next.js handler (all other routes → pages)
```

Express intercepts `/auth/*` and `/api/*` before passing everything else to Next.js. Both run in a single process on one port. Use for local development.

```bash
npm run dev      # development
npm start        # production
```

### Separated Mode (`api-server.ts` + Next.js)

```
Browser
  └── :3000 ──► Next.js (pages + rewrites)
                └── :4000 ──► Express API server (auth + API)
                              └── MongoDB
```

Next.js rewrites proxy `/auth/*` and `/api/*` server-side to the Express API. The browser always talks to a single origin (no CORS issues in the browser). Use for independent deployment.

```bash
# Terminal 1 — API backend
npm run dev:api      # development  (port 4000)
npm run start:api    # production

# Terminal 2 — Next.js frontend
API_URL=http://localhost:4000 npm run dev:web      # development (port 3000)
API_URL=http://localhost:4000 npm run start:web    # production
```

---

## Deployment Guide (Separated Mode)

### Backend — Railway / Render / EC2

1. Deploy this repo to your server of choice
2. Set the start command to: `npm run start:api`
3. Set environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   OPENROUTER_API_KEY=sk-or-v1-...
   SESSION_SECRET=<random-64-char-string>
   FRONTEND_URL=https://your-app.vercel.app
   API_PORT=4000
   ```
4. Note the deployed URL, e.g. `https://parivahan-api.railway.app`

### Frontend — Vercel

1. Connect the repo to Vercel
2. Set the build command to: `npm run build`
3. Set the start command to: `npm run start:web`
4. Set environment variables:
   ```
   API_URL=https://parivahan-api.railway.app
   MONGODB_URI=mongodb+srv://...   # needed for SSR pages (status, applications)
   ```
5. Deploy

> **Cookie note:** In production with separate domains, the API server sets cookies with `SameSite=None; Secure`. Next.js rewrites proxy requests server-side, so the browser always communicates with the Vercel domain — cookies work seamlessly without cross-origin issues.

---

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Combined mode — Express + Next.js on port 3000 |
| `npm run dev:api` | API server only — Express on port 4000 |
| `npm run dev:web` | Frontend only — Next.js on port 3000 (needs `API_URL`) |
| `npm run build` | Next.js production build |
| `npm start` | Combined production server |
| `npm run start:api` | API production server |
| `npm run start:web` | Next.js production server |
| `npm run seed` | Seed MongoDB with mock data (run once) |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |

---

## Project Structure

```
├── app/                    # Next.js App Router (frontend pages only)
│   ├── layout.tsx          # Root layout — nav, header, AI assistant
│   ├── page.tsx            # Home — service catalog, stats, lookup tool
│   ├── login/              # SSO login page
│   ├── digilocker/         # DigiLocker email sign-in
│   ├── apply/              # Citizen application flow
│   │   ├── form/           # 5-step application wizard
│   │   ├── otp/            # OTP verification (mock)
│   │   ├── payment/        # Payment (mock)
│   │   └── confirmation/   # Post-submission confirmation
│   ├── applications/       # My Applications — user's own apps
│   ├── status/[id]/        # Application status + audit timeline
│   ├── officer/            # Officer queue + review pages
│   └── admin/              # Admin dashboard
│
├── components/             # Shared React components
│   ├── AIAssistant.tsx     # Floating chat widget
│   ├── FontSizeControls.tsx# A- A A+ accessibility controls
│   ├── StatusLookupTool.tsx# RC / DL / eChallan quick check
│   ├── OfficerClaimButton.tsx
│   ├── OfficerReviewForm.tsx
│   ├── QueueIndicator.tsx
│   ├── RoleSwitcher.tsx
│   └── StatusStepper.tsx
│
├── lib/                    # Shared server-side libraries
│   ├── db.ts               # Mongoose models + connectDb()
│   ├── openrouter.ts       # AI assistant (OpenRouter + fallback)
│   ├── types.ts            # TypeScript types + status labels
│   └── session.ts          # Cookie session helpers
│
├── scripts/
│   └── seed.ts             # MongoDB seed script
│
├── server.ts               # Combined server (Express wrapping Next.js)
├── api-server.ts           # Standalone Express API (separated mode)
├── next.config.js          # Next.js config + API rewrites
└── .env.local              # Local environment variables (not committed)
```

---

## Key Features

### Citizen Journey
- DigiLocker sign-in to pre-fill identity details
- 5-step application wizard with save-and-resume (draft persisted per user in MongoDB)
- Mock OTP verification, mock UPI payment
- Application status tracking with anonymized audit trail
- Each user's draft and applications are isolated — fresh start on logout

### Officer Portal
- Statewide shared queue (any Karnataka RTO officer can claim any application)
- **Optimistic locking** — two officers racing to claim the same application: only one wins (demo with two browser tabs)
- Mandatory specific rejection reason codes with citizen-facing fix instructions

### Admin Dashboard
- Real-time KPIs from MongoDB (applications per status, officer workload, rejection breakdown)
- Anonymized audit log (officer identity internal, citizen-facing timeline shows only actions + timestamps)

### AI Assistant
- Floating chat widget on all pages
- Answers questions about eligibility, documents, fees, and process steps
- Supports English, हिन्दी (Hindi), and ಕನ್ನಡ (Kannada)
- Live AI via OpenRouter (`stealth/ox-alpha`); automatic fallback to scripted FAQ if API unavailable

---

## What Is Mocked vs Functional

| Feature | Status |
|---|---|
| Citizen application form (5 steps) | **Functional** |
| Form save-and-resume | **Functional** |
| Officer claim queue + optimistic locking | **Functional** |
| Officer approve / reject with reason codes | **Functional** |
| Audit trail (internal + anonymized citizen view) | **Functional** |
| Admin metrics dashboard | **Functional** (reads real MongoDB) |
| AI assistant with offline fallback | **Functional** |
| RC / DL / eChallan status lookup | **Mock** (static demo data) |
| DigiLocker (document fetch) | **Mock** (pre-fills hardcoded demo data) |
| OTP / SMS | **Mock** (any 6 digits accepted) |
| Payment (UPI / card) | **Mock** (1.5 s delay then success) |
| Document upload / OCR | **Mock** (click-to-upload, no real file) |
| CAPTCHA | **Not built** |
| Permanent DL / Renewal / Duplicate DL | **Coming soon** (disabled cards) |
| Real RTO backend integration | **Not built** |
| Real officer PKI / auth | **Not built** |

> Aadhaar and PAN patterns shown in the UI are obviously fake and labeled `MOCK` / `SYNTHETIC`.

---

## Accessibility

- Skip-to-content link
- ARIA labels on all interactive elements
- Focus management on step transitions in the form wizard
- Font size controls (A− A A+) that persist across page loads
- Low-bandwidth toggle (disables decorative images/animations)
- Colour contrast meets WCAG AA for primary text

---

## License

MIT — demo / educational use only. Not affiliated with the Government of India or MoRTH.
