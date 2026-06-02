# H7 — Fix Withdrawal-Period Date Math (off by up to a day)

## Summary
Withdrawal and gestation day-counting truncates fractional days toward zero, so an animal can be marked `CLEAR` (sellable/milkable) up to a day before its meat/milk withdrawal genuinely ends. Fix the day-difference at the root (`DateUtility.daysBetween`) to compare calendar days normalized to start-of-day, and treat withdrawal as `ACTIVE` through the end of the withdrawal-end day.

## Current Behavior

**Root cause — `util/DateUtility.ts:23-29`:**
- `daysBetween(start, end)` returns `differenceInDays(parseISO(end), parseISO(start))`. date-fns `differenceInDays` counts whole 24h spans and **truncates the fractional remainder toward zero**.
- `addDays(iso, n)` returns `addDaysFn(parseISO(iso), n)` re-serialized to ISO — it preserves the **time-of-day** of the input.

**Failure path — `util/WithdrawalUtility.ts:20-22`:**
- `withdrawalEndDate = addDays(dateAdministered, withdrawalPeriodDays)` carries the administration clock time (e.g. medication given `2026-06-01T09:00` + 7d → `2026-06-08T09:00`).
- `daysRemaining = daysBetween(todayIso(), withdrawalEndDate)`. Checked at `2026-06-08T08:00`, the span from now to the end is 23h → truncates to `0`.
- `status = daysRemaining > 0 ? 'ACTIVE' : 'CLEAR'` → flips to `CLEAR` while ~a day of withdrawal genuinely remains. The animal is shown as sellable/milkable a day early. This is a food-safety defect.

**Same `addDays` + `daysBetween` pattern reused by:**
- `util/GestationUtility.ts:21-22` — `expectedDueDate`, `daysRemaining`, `progressPercent`, `isOverdue`.
- `feature/breeding/component/GestationCountdown.tsx:12` — `daysBetween(expectedDueDate, todayIso())` for "overdue by N days".
- `feature/production/screen/ProductionListController.ts:30` — `daysBetween(l.date, today) <= 7` for the recent-logs filter.
- `feature/health/component/MedicationFields.tsx:125` and `feature/health/component/DewormingFields.tsx:115` — `formatDate(addDays(date, withdrawalDays))` "Withdrawal ends" preview. These format only the date portion, so the preview is already date-correct; no change required, but they share `addDays`.

## Desired Behavior

Count **calendar days** between two dates, ignoring time-of-day, by normalizing both ends to start-of-day before differencing. Treat the withdrawal-end day itself as still `ACTIVE` (withdrawal clears at the start of the day *after* the end day).

- `daysBetween(start, end)` returns `differenceInCalendarDays(startOfDay(parseISO(end)), startOfDay(parseISO(start)))`.
- With the example above: `differenceInCalendarDays(2026-06-08, 2026-06-08) = 0` on the end day, `-1` the next day.
- `WithdrawalUtility` status: `daysRemaining >= 0 ? 'ACTIVE' : 'CLEAR'` (was `> 0`). `daysRemaining` continues to clamp to `Math.max(_, 0)` for display.

This makes the result independent of administration clock time and conservative for food safety — an animal stays `ACTIVE` through the entire end day.

## Schema Changes
None. No Firestore fields, documents, or collections change.

## Data Access Audit
Not applicable in the database sense — every function in scope is pure, synchronous date arithmetic over in-memory ISO strings. **Zero Firestore reads or writes** are added or removed on any path. `getActiveWithdrawals` and `calculateGestation` operate on records already loaded into their Zustand stores via existing `onSnapshot` listeners. The fix changes only the arithmetic, not the access pattern, so there is no N+1, locality, denormalization, or round-trip impact.

## Touch Points

**Util (root fix):**
- `util/DateUtility.ts` — change `daysBetween` to normalize both args with `startOfDay` and use `differenceInCalendarDays` instead of `differenceInDays`. Update the date-fns import (add `differenceInCalendarDays`, `startOfDay`; `differenceInDays` becomes unused — remove it). This single change corrects every caller below.
- `util/WithdrawalUtility.ts:22` — change status threshold from `daysRemaining > 0` to `daysRemaining >= 0` so the end day stays `ACTIVE`.

**Beneficiaries of the root fix (verify, no edits expected):**
- `util/GestationUtility.ts` — `daysRemaining`/`progressPercent`/`isOverdue` become calendar-day exact; `isOverdue: daysRemaining < 0` correctly treats the due day as not-yet-overdue.
- `feature/breeding/component/GestationCountdown.tsx` — "overdue by N days" becomes calendar-accurate.
- `feature/production/screen/ProductionListController.ts` — recent-logs window becomes calendar-based (now correctly includes a log made earlier today regardless of time).

**No change:**
- `MedicationFields.tsx` / `DewormingFields.tsx` — `formatDate` already drops time; preview unaffected.
- `addDays` — left as-is. Once comparison is start-of-day normalized, the carried time-of-day no longer affects status, and the date portion it produces is already correct.

## Data Migration
None. The change is computed live on every render/list; nothing is persisted. Existing health and breeding records are re-evaluated correctly on next read with no backfill.

## Risk
- **Behavior shift on the boundary day (intended):** animals previously flipped to `CLEAR` on the morning of the end day will now show `ACTIVE` for that full day. This is the fix, and it is the safe direction (over-conservative on food safety, never under).
- **Cross-caller impact:** changing `daysBetween` globally also shifts gestation and production-recency math by at most a fractional day at boundaries. Reviewed above — all four callers want calendar-day semantics, so the global change is correct rather than a side effect. No caller relies on sub-day precision.
- **No data-integrity or performance risk** — pure function change, no persisted state, no new queries.
