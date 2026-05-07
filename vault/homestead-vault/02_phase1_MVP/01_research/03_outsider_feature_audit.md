# Outsider Feature Audit: Is the Free/Pro Boundary in the Right Place?

> An independent assessment of whether the app's core features are the right ones, whether the free/pro split maximizes retention and conversion, and what's missing that the master plan didn't consider. This challenges the existing plan where warranted.

---

## The Daily Life Test

Before looking at features, look at the user. A homesteader wakes up, walks to the barn, and does the same things every morning:

1. Feed animals
2. Check water
3. Collect eggs or milk
4. Quick visual health check -- anyone limping, lethargic, off feed?
5. Note anything unusual
6. Lock up at night

The app is only valuable if it fits into that routine. The question isn't "what features does a farm app need?" -- it's "what makes someone pull out their phone in the barn every day?"

---

## What the Current Free Tier Gets Right

**Animal profiles** -- correct. Foundational. Can't do anything without them.

**Care reminders + dashboard** -- correct. This is the daily hook. "Deworm Bella today." Open app, see what's due, do it, mark complete. The dashboard showing overdue and due-today care events is the core engagement loop.

**Starter playbooks** -- correct. Solves the blank-screen problem. A new user who selects "chickens" gets immediate care templates instead of staring at an empty app.

**Custom types/breeds/templates** -- fine as free, but this is a power-user feature. Most people will use starter playbooks and never customize. It doesn't drive daily use -- it's a setup-once feature. Not wrong to include it, but don't count on it for retention.

---

## What the Current Free/Pro Boundary Gets Wrong

### Notes should be free

Notes are the lowest-friction feature in the app. "Bella limping today." "Eggs down this week, might be the heat." "New rooster aggressive with hens." Three seconds to record, zero learning curve.

Gating notes behind Pro removes the feature most likely to build a daily recording habit. A user who jots notes about symptoms for a month will organically want proper health records. That's the natural upsell moment. Notes are the gateway to health records -- don't block the gateway.

**Recommendation:** Notes are free. Health records are Pro.

### Basic production logging should be free

Egg counting is likely the single highest-frequency action for the largest user segment (backyard chicken keepers). If someone opens the app every morning to log "6 eggs today," that's daily retention locked in.

The current app has production as fully Pro. This gates the daily habit behind a paywall that a new user hasn't earned trust for yet.

**Recommendation:** Simple daily log entry (quantity + type + date) is free. Trends, charts, summaries, type filtering, and cost-per-unit are Pro. This is the fitness app model: log for free, analyze for pay.

### Basic weight entry should be free

Same logic. Entering a weight is a 5-second action. The value of weight data compounds over time. If a user has 6 months of weight entries, they're locked in -- and they'll pay to see the chart.

**Recommendation:** Weight entry is free. Weight charts and body condition score tracking over time are Pro.

### Withdrawal alerts and breeding countdowns should be Pro-only on dashboard

The current dashboard shows withdrawal alerts and breeding countdowns alongside overdue care and due-today items. But withdrawal alerts require health records (Pro) and breeding countdowns require breeding records (Pro). If a free user never sees these sections because they have no Pro data, the sections are meaningless in free tier anyway.

Making this explicit simplifies the dashboard for free users and creates a visible "your dashboard gets smarter with Pro" upgrade signal.

**Recommendation:** Free dashboard shows overdue care + due today. Pro dashboard adds withdrawal alerts + breeding countdowns + activity feed.

---

## What's Missing That the Master Plan Didn't Consider

### 1. Homestead-wide activity feed

Each animal has a timeline tab, but there's no "what happened across the farm today" view. Currently the dashboard shows what's *due* but not what's *done*.

A daily activity feed would show: "Today -- logged 8 eggs, completed deworming for Bella, added note about Rosie, marked hoof trim done on all goats."

Why this matters:
- Creates a sense of daily accomplishment (psychological hook for retention)
- Answers "what did I do today/this week?" when memory fails
- Directly useful for delegation -- a caretaker sees what's already been handled
- Natural Pro feature since it aggregates across all record types

**Recommendation:** Add as a Pro dashboard section. Free users see due/overdue care only. Pro users see the full daily activity feed.

### 2. Quick-complete from dashboard

The dashboard shows overdue and due-today care items. But completing a care event currently requires navigating into the detail screen. That's too many taps for the daily "check things off" flow.

In the barn with dirty hands, every tap matters. A swipe-to-complete or single-tap checkmark on the dashboard card would dramatically reduce friction for the core daily action.

**Recommendation:** Add quick-complete action on dashboard care cards. This is a free-tier UX improvement that directly strengthens the core engagement loop.

### 3. The "barn moment" UX gap

The app is designed like a management tool you use at a desk. But the highest-value moment is in the barn -- hands dirty, animals around, phone in one hand.

Missing barn-friendly features:
- Large tap targets for gloved hands
- Quick-add shortcuts ("+egg" "+note" "+weight" from home screen)
- Photo-first note creation (snap a photo, add text later)
- Minimal-scroll views that show the most important info first

This isn't a feature -- it's a design philosophy that should inform every screen. The app that wins is the one that's usable with one dirty hand.

**Recommendation:** Not a feature to build, but a lens to evaluate every screen through. Prioritize screens and flows that are used in the barn (dashboard, quick log, notes) over ones used at a desk (customization, profile, breeding records).

---

## Revised Free/Pro Split

### Free Tier -- "Daily Recording Habits"

The free tier should do one thing well: make the user dependent on recording their daily farm activity in this app.

| Feature            | What's Free                                  | What's Gated                                                |
| ------------------ | -------------------------------------------- | ----------------------------------------------------------- |
| Animal profiles    | Full CRUD, photos, sire/dam, up to N animals | Unlimited animals (Pro)                                     |
| Care reminders     | Recurring + single, mark complete, templates | Advanced schedules (Pro)                                    |
| Dashboard          | Overdue care, due today, quick-complete      | Withdrawal alerts, breeding countdowns, activity feed (Pro) |
| Notes              | Full notes with tags and photos              | --                                                          |
| Production logging | Daily entry (quantity + type + date)         | Trends, charts, summaries, cost-per-unit (Pro)              |
| Weight entry       | Basic weight + date                          | Charts, body condition tracking over time (Pro)             |
| Customization      | Full types, breeds, care templates           | --                                                          |
| Playbooks          | Species-specific onboarding                  | --                                                          |

### Pro Tier -- "Management Intelligence"

The Pro tier turns raw data into actionable insight. The user has already built the habit of recording -- now they pay for the intelligence layer.

| Feature | What Pro Adds |
|---------|---------------|
| Health records | Vaccination, medication, deworming, vet visit, illness/injury tracking |
| Withdrawal calculator | Automatic withdrawal period tracking + dashboard alerts |
| Breeding manager | Breeding events, gestation countdown, birth outcomes, pedigree view |
| Production analytics | Trend charts, summary cards, type filtering, cost-per-unit |
| Weight analytics | Weight history charts, body condition score tracking |
| Dashboard upgrades | Withdrawal alerts, breeding countdowns, activity feed |
| Multi-user | Invite members with roles (manager, caretaker, viewer) |
| Export | PDF animal records, shareable profiles |
| Unlimited animals | No cap on animal count |

### Why This Split Works

1. **Free users build habits** -- daily egg logging, notes, care check-offs. These are the stickiest actions.
2. **Pro is the "aha" moment** -- after 2-4 weeks of daily use, the user has data. They want to see trends. They want health records. They want to share with a vet. The upgrade sells itself.
3. **No feature feels crippled** -- free isn't "Pro with things removed." It's a complete daily recording tool. Pro adds a management layer on top.
4. **The upgrade trigger is natural** -- user tries to add a health record, sees the Pro prompt. User taps "trends" on production, sees the Pro prompt. The trigger matches the desire.

---

## Comparison: Master Plan vs This Audit

| Decision | Master Plan | This Audit | Rationale |
|----------|-------------|------------|-----------|
| Tier count | 3 (Free/Pro/Farm) | 2 (Free/Pro) | Not enough features or users to justify 3 tiers at MVP |
| Notes | Pro | **Free** | Gateway habit that leads to health record upsell |
| Production logging | Pro | **Free (basic) / Pro (analytics)** | Daily egg counting is the #1 retention hook for chicken keepers |
| Weight entry | Pro | **Free (basic) / Pro (charts)** | Low-friction entry builds data dependency |
| Task/chore system | Included (P1) | **Removed** | Care events cover animal tasks; general chores are better served by multi-user + existing dashboard |
| Caretaker handoff | Dedicated feature (Farm tier) | **Replaced by multi-user roles** | Same outcome, simpler implementation, no web frontend needed |
| Dashboard content | Everything visible | **Free: care only. Pro: adds withdrawals, breeding, activity feed** | Clean separation; free dashboard isn't cluttered with empty Pro sections |
| Quick-complete | Not mentioned | **Add to free tier** | Critical UX for the core daily loop |
| Activity feed | Not mentioned | **Add as Pro dashboard section** | "What happened today" view for accomplishment + delegation |
