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

## Feature toggles
- `src/lib/features.js` lists the features. Their state is a separate `features` slice in DataContext, not part of `businessSettings`. Settings edits a local copy of `businessSettings` and writes all of it back on Save, which would silently undo toggles.
- Toggles apply immediately, like the theme picker. All features default to on.

## 1. Contact
- `src/lib/phone.js` is ported from booking-app. Unusable numbers return null, and the UI then hides the links (or explains why, in the details modal).
- Manager side: full Call + WhatsApp buttons in the appointment details modal, and compact icon links on each row of today's schedule. The WhatsApp text is the localized confirmation, or the cancellation for cancelled bookings.
- Client side: each upcoming booking has a "Contact the salon" Call/WhatsApp row using the business phone, with a localized "about my booking" text.
- Messages use the language of whoever is acting in the UI right now. There is no per-client language yet. Times are always 24h (`14:00`).
- Phone inputs (client profile, business settings) show a hint when the number can't be normalized.
