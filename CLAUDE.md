# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A hackathon prototype demonstrating a modernized Indian government digital service: **New Learner's Licence application via Parivahan/RTO**, from start through approval tracking. This is the only built journey — all other licence types appear as disabled "coming soon" cards. A narrow journey that works completely beats a broad one that's half-real.

## Tech Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS** — single deployable project, mobile-first (design at 375px first)
- **SQLite** via `better-sqlite3` — tables: `applications`, `officers`, `users`, `audit_log`, `form_drafts`, `test_tracks`, `test_slots`, `assistant_sessions`; DB at `data/rto.db` (auto-created on first run)
- **OpenRouter API** (`stealth/ox-alpha`) — server-side only via `lib/openrouter.ts`, key in `OPENROUTER_API_KEY`
- No real auth provider — simple mock session with `role: citizen | officer | admin`

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build
npm run lint       # lint
npm run seed       # seed mock data into MongoDB (run once after install)
```

Run `axe-core` or Lighthouse on the citizen flow before shipping; record the score on `/about-this-demo`.

## Architecture

### Three portals, one MongoDB database

| Portal | Route | Role |
|---|---|---|
| Citizen Portal | `/` | Full learner's licence journey |
| Officer Portal | `/officer` | Statewide claim queue + review |
| Admin Dashboard | `/admin` | Metrics, audit log, service health |

All three share the same MongoDB database. The `audit_log` collection is **append-only** and is the single source of truth for both the full internal record (officer names, IDs) and the anonymized citizen-facing timeline (timestamps + action labels only, no officer names or district).

### Core process innovation: decentralized officer pool

Any authorized RTO officer statewide can claim any application — not just the local officer. Citizens never see district names or officer identities. Status reads "Verified by RTO Officer — Karnataka", never a name or district. The system knows internally; the citizen doesn't need to understand jurisdictions.

The officer claim uses **optimistic locking** — two tabs racing to claim the same application must result in only one winning. This race must be demonstrable with two browser tabs.

### AI assistant is architecturally isolated

`lib/openrouter.ts` is **server-only** — never imported from a client component. The assistant:
- Explains eligibility, documents, fees, and process steps only
- Cannot read or write form data
- Never implies or produces an approval/rejection decision
- Passes `reasoning_details` back unmodified on replayed assistant turns (reasoning continuity)
- Falls back to a scripted 8-10 Q&A FAQ if the key is missing or call fails, showing a small "Assistant running in offline/fallback mode" badge

```ts
// lib/openrouter.ts — Server-only. Never import this from a client component.
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  reasoning_details?: unknown; // pass back unmodified on replayed assistant turns
};

export async function callAssistant(messages: ChatMessage[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "stealth/ox-alpha", messages, reasoning: { enabled: true } }),
  });
  if (!res.ok) throw new Error(`OpenRouter request failed: ${res.status}`);
  const result = await res.json();
  return result.choices[0].message; // { content, reasoning_details, ... }
}
```

Add `OPENROUTER_API_KEY=` to `.env.local.example` with a comment on where to get the key.

### Status states and status language

`Submitted → Assigned to Officer → Under Review → Approved/Rejected → Test Scheduled → Licence Issued`

Every status screen names the next concrete action, or explicitly says no action is needed and until when. Rejection always shows the exact failed checklist item and how to fix it — never a generic "Rejected."

### Save-and-resume

Form drafts are persisted in the `form_drafts` table (server-side), not only in browser storage. Session interruption must not lose data.

### What is mocked vs. real

The `/about-this-demo` page (linked from footer) must state clearly:

- **Functional**: full citizen journey, officer claim/review/approve with shared queue + optimistic locking, decentralized test-slot assignment, citizen-visible anonymized audit trail, admin analytics, AI assistant with documented fallback, measured accessibility score
- **Mocked**: DigiLocker, OTP, payments, document OCR/validation, CAPTCHA alternative, service-health scorecard numbers
- **Not built**: any other licence type or renewal, real RTO backend, real officer PKI/auth, production security hardening

Never use real Aadhaar/PAN formats with valid checksums — patterns must be obviously fake and labeled "MOCK"/"SYNTHETIC" in the UI itself.

## Mock Seed Data

- ~15–20 synthetic citizens (fake names, DOB, mock DigiLocker IDs labeled `MOCK-DL-XXXX`)
- ~6–8 officers across fake districts sharing ONE statewide queue
- ~4–6 fake authorized driving-test tracks statewide with open slots
- ~25–30 applications in varied states with timestamps spread over the last 30 days
- Audit log entries for all transitions (full internal + anonymized citizen views from the same rows)
- A few `form_drafts` rows to demo save-and-resume on load

## Build Order

1. Scaffold Next.js + Tailwind + MongoDB (mongoose), seed data, mock auth/role switcher
2. Citizen flow end-to-end: tolerant form validation (apostrophes, hyphens, regional chars), save-and-resume, accessible markup, OTP recovery path, payment reconciliation demo, queue-wait indicator, low-bandwidth mode toggle, anonymized audit trail view
3. Officer portal: shared statewide queue, claim with optimistic locking, checklist review with mandatory specific reason codes, approve/reject/escalate with audit logging, decentralized test-slot assignment
4. Admin dashboard: operational metrics + service-health scorecard aggregated from mock MongoDB
5. AI assistant: OpenRouter integration per spec — server-only key, reasoning continuity, scoped system prompt, language switcher (English + Hindi + one more), text-always-available alongside voice, scripted fallback
6. Accessibility + performance pass: axe-core/Lighthouse, fix flagged issues, record score on `/about-this-demo`
7. Polish: empty/loading/error/offline states everywhere; `npm install && npm run dev` must give a fully seeded, working demo with zero required config (OpenRouter key is optional — fallback mode covers it)
