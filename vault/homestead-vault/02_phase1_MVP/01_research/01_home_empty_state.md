# Home Screen Empty State Research

## Problem

When no alerts exist (no overdue care, due-today care, active withdrawals, or breeding countdowns), the home screen shows a static "All caught up!" message. This wastes the most-visited screen in the app.

## Current Data Available in Stores

| Store | Key Data |
|---|---|
| animalStore | All animals (name, type, breed, gender, birthday, state, weight) |
| careStore | All care events (recurring schedule, due dates) |
| breedingStore | Breeding records (status, breeding date, due dates) |
| healthStore | Withdrawal records |
| productionStore | Production logs (eggs, milk, fiber, honey, meat) |
| weightStore | Weight logs (weight, body condition score, date) |
| homesteadStore | Homestead info |

## Options

### Option A: Farm Snapshot (Recommended)

Replace the empty state with a quick-glance summary card section:

- **Herd counts** - animal totals grouped by type (e.g. "5 Chickens, 3 Goats, 2 Cattle")
- **Today's production** - eggs collected, milk yield, etc. (from productionStore)
- **Upcoming care** - care events due in the next 7 days (not overdue, just upcoming)
- **Active breedings** - count of animals currently bred, nearest due date

All data already exists in current stores. Minimal new queries needed.

### Option B: Quick Actions Grid

Show shortcut buttons for common daily tasks:

- Log production (eggs/milk)
- Add care event
- Record weight
- Add new animal

Reduces taps to the most frequent actions. No new data needed.

### Option C: Farm Snapshot + Quick Actions (A + B combined)

Show the snapshot summary at top, quick actions below. Gives both information and fast access. Risk: could feel cluttered on smaller screens.

## Recommendation

**Option A (Farm Snapshot)** for MVP. It turns a dead screen into the most useful screen by answering "how is my farm doing right now?" at a glance. Quick actions (Option B) can be added later as a second iteration since the bottom tab bar already provides navigation to those features.

Key widgets to build:
1. Herd summary by animal type
2. Upcoming care (next 7 days)
3. Today's production totals (if user tracks production)
4. Active breeding count + nearest due date (if any exist)

Each widget only renders if it has data to show, avoiding empty sections.
