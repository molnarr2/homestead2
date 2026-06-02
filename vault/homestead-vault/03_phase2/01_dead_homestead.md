# Dead Homestead Problem

## The Problem

When a user signs up, uses the app for a week, then never opens it again:

1. Their care events still get scanned every day by `dailyCareReminder` (collection group query hits all homesteads)
2. Overdue care events accumulate (nobody is completing them), notifications pile up on the device
3. The user ignores notifications until they disable them or the device token expires
4. Their data costs Firestore reads every single day, forever
5. Nobody knows they're gone. Nothing adapts.

At scale (1000+ homesteads), scanning abandoned homesteads is the majority of cloud function cost.

## Current State

- `lastActiveAt` field added to Homestead schema (ISO 8601 string)
- Updated once per day on app open via `HomesteadService.updateLastActiveIfNeeded()`
- MMKV used locally to avoid redundant Firestore writes within the same day

## Future Options (not yet implemented)

### Option A: Stop Scanning Dormant Homesteads (cost saving)

In scheduled functions, skip homesteads where `lastActiveAt` is older than 30 days.

- Pros: Immediately reduces Firestore reads for abandoned accounts.
- Cons: If a user comes back after 60 days, they won't have gotten notifications during that gap. Probably fine.

### Option B: Taper Notifications (re-engagement)

Instead of sending daily reminders forever to someone who isn't opening the app:
- Days 1-7 of inactivity: normal daily notifications
- Days 8-14: reduce to every 3 days
- Days 15-30: one "we miss you" nudge, then stop
- Day 30+: stop all notifications, mark homestead dormant

- Pros: Respectful. Doesn't burn goodwill. Reduces cost.
- Cons: Requires tracking notification history per homestead.

### Option C: Win-Back Notification (growth)

After 14 days of inactivity, send a single push notification:
> "Your animals still need care. You have 12 overdue tasks. Tap to catch up."

Then silence. If they don't come back, stop scanning entirely.

- Pros: One shot at re-engagement without being spammy.
- Cons: Only works if user hasn't disabled notifications.

### Option D: Archive Dormant Homesteads (data hygiene)

After 90 days of inactivity:
- Flag homestead as dormant
- Scheduled functions skip dormant homesteads entirely
- If user logs back in, reactivate

- Pros: Clean separation between active and dead data.
- Cons: Reactivation logic. Subscription lapse during dormancy.

## Recommendation

Option A + C together. Skip dormant homesteads in cron functions (uses `lastActiveAt` already in place). Send one win-back notification at the 14-day mark. Covers cost savings and gives one shot at re-engagement.
