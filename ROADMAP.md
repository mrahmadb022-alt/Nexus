# Nail-artist roadmap (spec)

Work autonomously. Don't ask me questions; record decisions in DECISIONS.md and keep PROGRESS.md updated so work survives /clear. Commit after each feature.

IMPORTANT CONTEXT: The app I'm working on is NEXUS (GitHub: https://github.com/mrahmadb022-alt/Nexus, package name "nexus-booking", Vite + React SPA, frontend-only, data in src/context/DataContext.jsx). Previous work was wrongly done in a different app, Desktop\booking-app (Next.js). Do NOT modify Desktop\booking-app, its GitHub repo, or any Vercel settings. Use it only as a READ-ONLY reference for logic.

STEP 0: Find Nexus.
- Search C:\Users\0542526400 (Desktop, Documents, Downloads, and their subfolders) for a package.json with "name": "nexus-booking".
- If found: run git status and compare with origin/main. If the local copy has uncommitted or unpushed work, commit it on its own first and tell me. Use this folder.
- If not found: clone https://github.com/mrahmadb022-alt/Nexus into C:\Users\0542526400\Desktop\Nexus.
- Report the folder path you're using, and which Vercel project (if any) deploys Nexus. Read-only check, change nothing in Vercel.

STEP 1: Create a branch feature/nail-artist-roadmap. Never commit to or push main. First, save this whole spec in ROADMAP.md on the branch.

RULES:
- Stay frontend-only: no backend, no server, no real external APIs. Data stays in DataContext with the same persistence Nexus uses now.
- Keep Nexus's existing design, components, and structure. New screens must look native to it.
- Keep every language Nexus supports, with full RTL mirroring for Hebrew/Arabic. Gregorian calendar, Western digits. Timezone Asia/Jerusalem for "today".
- Mobile-first: everything works at 375px.
- No nested interactive elements (no button/a inside a button).
- Money as integer agorot, displayed as ₪.
- Port logic from Desktop\booking-app where useful (lib/phone.js, CSV/XLSX export, slot logic), adapted to Vite + React. Don't copy Next.js-specific code.
- Each feature is toggleable in the manager's settings.

FEATURES (one commit each):
1. Contact: Israeli phone normalization (054-123-4567 / 0541234567 / +972… → 972541234567) and Call (tel:) + WhatsApp (wa.me with a prefilled, localized confirmation message) on bookings and client details.
2. Payments + finance: payment status per booking (unpaid/paid/no-show/cancelled), method (cash/Bit/card/transfer/other), amount paid. Expenses with categories (add/edit/delete). Manager finance dashboard: date range, income, expenses, profit, no-show rate, trend chart, revenue by service, busiest days/hours, labeled as a management overview, not bookkeeping. Client-side CSV export starting with a UTF-8 BOM, and XLSX export, headers in the current language.
3. Automated messages (simulated): settings to toggle confirmation/reminder/cancellation and reminder timing; a message log showing what would be sent; "Send demo reminder" button; real send happens via the WhatsApp link only. Label "Demo mode, connects after backend setup".
4. Calendar: per booking "Add to calendar" (.ics download) and Google Calendar link; manager "Export all bookings (.ics)".
5. Receipts (demo): business type setting (exempt / licensed / company); numbered printable payment confirmation clearly marked as NOT a tax document; show which official document types become available after connecting an invoicing provider.
6. Marketing: unchecked consent checkbox in the booking flow; campaign composer that writes to the message log only, with the prefix פרסומת (first character U+05E4) / إعلان / Ad, and an opt-out mention.
7. Staff: Nexus already has staff selection. Make sure availability and double-booking are checked per staff member, plus an "Any available" option.

TESTING: Nexus has no tests. Add Vitest unit tests for pure logic (phone, CSV/BOM, slot/availability). npm run build must pass. If Playwright is available, add a smoke test of the booking flow at 375px in Hebrew.

FINISH: push the branch feature/nail-artist-roadmap to GitHub (not main), then give me a summary: folder used, what was built, anything you couldn't do, and how to preview it.
