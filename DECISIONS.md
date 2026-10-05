# Decisions

Choices made while building the nail-artist roadmap (see ROADMAP.md), recorded instead of asking.

## Setup
- **Folder:** `Desktop\nexus-booking` (package `nexus-booking`, origin `mrahmadb022-alt/Nexus`). It was clean and level with `origin/main`, so there was nothing to commit first. `Desktop\nexus-booking-backup-2026-08-03` is an older snapshot (its uncommitted changes are already in `main` as 77c7efd). It was left untouched.
- **Vercel:** project `nexus-booking` (`prj_d003iljiZfvQbMQYtpZOebTKGmHL`) deploys Nexus. Checked read-only, nothing changed.
- **Branch:** all work is on `feature/nail-artist-roadmap`. `main` is never committed to or pushed.

## Data & persistence
- Data lives in React state inside `DataContext` and is saved to localStorage (see "Browser persistence" below).
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

## 2. Payments & finance
- Bookings carry `paymentStatus` (`unpaid` | `paid` | `no_show` | `cancelled`), `paymentMethod` (`cash` | `bit` | `card` | `transfer` | `other`) and `amountPaidAgorot`. Setting the payment to "cancelled" also cancels the booking. Cancelling a booking sets its payment to "cancelled" unless it was already paid. Rescheduling a cancelled booking resets its payment to "unpaid".
- The payment editor lives in the appointment details modal. The modal now reads the live booking from context, so edits show up straight away.
- Finance math is `src/lib/finance.js`, ported from booking-app. Income counts paid bookings on the date of service. The no-show rate is no-shows divided by non-cancelled bookings that already happened. The page states it is a management overview, not bookkeeping.
- Demo history (`src/context/seedHistory.js`): about 10 weeks of paid, no-show, and cancelled bookings plus monthly expenses, from a seeded PRNG so the numbers are stable. The range defaults to "last 30 days", because "this month" is nearly empty early in a month.
- Expense categories: materials, rent, equipment, marketing, other.
- Charts are plain HTML/flex, so RTL mirrors automatically. The two-series trend uses fixed blue/orange tokens (`--viz-income`, `--viz-expense`), checked with the dataviz palette validator on light and dark surfaces. The theme primary/secondary pairs failed the CVD checks on dark themes. Single-series bar lists use the theme primary. The trend chart has a hover/focus tooltip and a table view.
- Exports: CSV has a UTF-8 BOM, CRLF line endings, and formula-injection guarding. XLSX uses a minimal writer on `fflate` (the only new runtime dependency) and is right-to-left for he/ar. Headers follow the current language. Money is exported in shekels with 2 decimals.
- Navigation: at 375px the bottom nav already has five tabs, so tool pages are reached from cards on the dashboard (`ToolLinks`) plus links in the desktop sidebar.

## 3. Automated messages (simulated)
- Nothing is sent. DataContext keeps a `messageLog` of what would be sent. A booking confirmation (client flow) and a cancellation (client cancel, or a manager setting payment to "cancelled") log automatically when their switch is on. "Send demo reminder" logs a reminder for the next upcoming appointment.
- Real sending happens only through each entry's WhatsApp link (wa.me with the same text).
- Settings for confirmation/reminder/cancellation, and reminder timing (2/3/12/24/48 hours before), live on the Messages page. The on/off for the whole feature is in Settings → Features.
- Scheduled reminders are computed, not stored (`scheduledReminders` in `src/lib/messages.js`): active future bookings, sent N hours before their start on the Jerusalem clock, or immediately if the booking is already inside that window.
- Message text uses the language of the person acting at that moment. The two seeded log entries render in the current UI language.
- The page shows the badge "Demo mode, connects after backend setup" (translated).

## 4. Calendar
- `src/lib/ics.js` is ported from booking-app: RFC 5545 escaping, 75-octet folding that never splits a Hebrew/Arabic character, and UTC times computed from the Jerusalem wall clock plus the booking's snapshot duration.
- Per booking: an "Add to calendar" button (.ics download) next to a Google Calendar template link (no OAuth). They appear on the client's confirmation screen, the client's upcoming bookings, and the manager's appointment modal. Clients see "service · salon"; the manager's copy shows "client · service" with the phone.
- "Export all bookings (.ics)" sits on the Schedule page. Cancelled bookings are included with `STATUS:CANCELLED`, so re-importing removes them. `SEQUENCE` follows `updatedAt`, so reschedules replace the old event.

## 5. Receipts (demo)
- A "payment confirmation" can be issued for any paid booking from its payment section. It is numbered `DEMO-0001`, `DEMO-0002`, and so on: sequential, never reused, one per booking (issuing again opens the existing one). It opens as a standalone printable page (`/manager/confirmation/:id`, no app navigation) with a "Not a tax document" notice inside the printed area.
- The business type setting (exempt / licensed / company) is in Settings → "Receipts & invoicing", together with the official documents an invoicing provider would unlock: exempt → receipt; licensed or company → tax invoice, tax invoice/receipt, receipt, credit invoice. Licensed dealers and companies also see an allocation-number note. No specific shekel threshold is shown because it changes by year.
- The demo business address and timezone are now Israeli (Tel Aviv, Asia/Jerusalem) instead of the US placeholder.

## 6. Marketing
- Consent is its own per-client record (`marketingConsents` in DataContext), not a field derived from bookings. The booking form's checkbox is never pre-checked. Ticking it opts the client in; leaving it unticked on a later booking does not withdraw an earlier consent. Withdrawing is an explicit choice: the same checkbox on the client's Profile, which applies immediately. Each booking also records whether the box was ticked, for the audit trail.
- The campaign composer is on the Messages page, since campaigns go to the message log only. The audience is clients whose consent is true, counted once each (`consentedRecipients`).
- The ad prefix is hardcoded in `src/lib/marketing.js`, not in translations, so the exact characters can't drift. `פרסומת` starts with U+05E4, and a unit test checks it. The prefix follows the composer's current language (פרסומת / إعلان / Ad), then come the business name, the body, and a localized opt-out line ("reply STOP / הסר / إيقاف"). None of these can be removed in the composer. A real unsubscribe link needs a backend.
- Seed clients have mixed consent, so the audience count isn't trivial (5 of 8).

## 7. Per-staff availability
- Before this, a slot was blocked by any booking with the same start time, for every staff member, and service duration was ignored. `src/lib/availability.js` (adapted from booking-app) now checks duration-aware interval overlap per staff member. "Any available" (the existing "No preference" / "Any Available" choices) is the union over all staff. Slots must finish before closing time, and today's slots that already started are skipped, using the Jerusalem clock.
- At confirm time, DataContext re-checks the slot (`hasConflict`). For "any available" it assigns the least busy free staff member (`freeStaffForSlot`, marked `autoAssigned`). If the slot was taken in the meantime, the confirmation step says so and links back to choose another time; nothing is saved.
- Rescheduling uses the same staff member and the booking's own duration, and the booking's current slot doesn't block itself. The manager's "Available Slots" modal shows 30-minute openings where anyone is free.
- With the toggle off, there is one shared calendar: every booking blocks the slot for everyone, still duration-aware.

## Testing
- Vitest: `src/**/*.test.js` covers phone, money, time, finance, CSV/BOM, XLSX, datasets, ICS, messages, receipts, marketing, availability, and translation key parity across en/he/ar.
- Playwright (`tests/e2e`, pinned to 1.63.0) runs at 375px with the Jerusalem timezone. It books through the full flow in Hebrew, and sweeps manager pages in Arabic for horizontal overflow and nested interactive elements. It starts its own Vite server on port 5174.

## Browser persistence
- `src/lib/persistence.js` saves every DataContext slice (bookings, gallery, staff, services, reviews, announcements, offers, waitlist, hours, business settings, client profile, feature switches, expenses, messaging settings, message log, receipt settings, confirmations, marketing consents) under one key, `nexus-booking:data`, as `{ version, savedAt, data }`. The booking draft is not saved.
- It saves after every change and loads once on startup. Each read and write is in try/catch. If storage is blocked or full, the app keeps working from memory.
- Corrupt JSON, a different `version` or a non-object payload means the whole save is ignored and the demo seed is used. A single slice with the wrong shape (array vs object) falls back to its seed slice. Saved objects are merged over the seed, so settings or feature switches added later get their defaults.
- Uploaded images are `blob:` URLs, which stop working once the page is closed. They are dropped on load: gallery entries are removed, and the hero and logo go back to their seed values.
- The seed is built by `buildSeedState()`, which runs fresh each time, so dates stay relative to today after a reset. Saved data keeps its original dates.
- "Reset demo data" is at the bottom of Settings. It uses an inline, translated confirmation instead of `window.confirm`. It clears the key and puts every slice back to a fresh seed.
