# Decisions

Choices made while building the nail-artist roadmap (see ROADMAP.md), recorded instead of asking.

## Setup
- **Folder:** `Desktop\nexus-booking` (package `nexus-booking`, origin `mrahmadb022-alt/Nexus`). It was clean and level with `origin/main`, so there was nothing to commit first. `Desktop\nexus-booking-backup-2026-08-03` is an older snapshot (its uncommitted changes are already in `main` as 77c7efd). It was left untouched.
- **Vercel:** project `nexus-booking` (`prj_d003iljiZfvQbMQYtpZOebTKGmHL`) deploys Nexus. Checked read-only, nothing changed.
- **Branch:** all work is on `feature/nail-artist-roadmap`. `main` is never committed to or pushed.

## Data & persistence
- Nexus keeps all data in React state inside `DataContext` with no storage, so a reload resets to seed data. New data (payments, expenses, message log, receipts, settings) follows the same pattern. Only the UI language uses localStorage, as before.
- Pure logic lives in `src/lib/*` (no React). Pages and tests both import it, so the numbers always agree.

## Money
- Services now store `priceAgorot` (integer) instead of `price` (shekels). Bookings snapshot `priceAgorot` and `durationMinutes` when they are created, so a later price change doesn't rewrite history.
- Display goes through `formatShekels()`: `₪65` or `₪65.50`, Western digits, in all languages.

## Time
- "Today" and "now" come from `src/lib/time.js`, which reads the wall clock in Asia/Jerusalem. The old `new Date().toISOString().slice(0,10)` gave the UTC date, which is wrong after 21:00/22:00 Israel time.
- `LOCALE_MAP` forces the Gregorian calendar and Western digits (`-u-ca-gregory-nu-latn`), because plain `ar` renders Arabic-Indic digits.
- Demo seed phones were US numbers. They are now Israeli numbers in mixed formats, to exercise normalization.
