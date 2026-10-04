# Progress — feature/nail-artist-roadmap

Resume from here after /clear. Spec: ROADMAP.md. Decisions: DECISIONS.md.

| # | Step | Status |
|---|------|--------|
| 0 | Locate Nexus, branch, ROADMAP.md, groundwork (Vitest, Jerusalem time, agorot) | done |
| 1 | Contact: phone normalization, Call + WhatsApp | done |
| 2 | Payments + finance dashboard + CSV/XLSX | done |
| 3 | Automated messages (simulated) + log | done |
| 4 | Calendar: .ics + Google link + export all | done |
| 5 | Receipts (demo) | done |
| 6 | Marketing consent + campaign composer | done |
| 7 | Staff availability per staff member | done |
| — | Playwright smoke test (375px, Hebrew), push branch | done |

## Commands
- `npm run dev`: local preview
- `npm test`: Vitest (src/**/*.test.js)
- `npm run test:e2e`: Playwright smoke (tests/e2e)
- `npm run build`: must pass before each commit

## Where things are
- Pure logic: `src/lib/` (phone, money, time, finance, export/{csv,xlsx,datasets}, ics, messages, receipts, marketing, availability, features). Every module has a `*.test.js`.
- State: `src/context/DataContext.jsx` (payments, expenses, messageLog, messagingSettings, confirmations, receiptSettings, marketingConsents, features); demo history in `src/context/seedHistory.js`.
- Strings: `src/translations.features.js` (one group per feature, en/he/ar, parity-tested).
- New pages: `/manager/finance`, `/manager/messages`, `/manager/confirmation/:id`. On phones they're reached through the dashboard tool cards; on desktop through the sidebar. Toggles are in Settings → Features.

## Possible next steps (need a backend)
- Persist data (currently in-memory, same as before).
- Real WhatsApp/SMS sending, scheduled reminders, signed unsubscribe links.
- Invoicing provider for official receipts and tax invoices.
