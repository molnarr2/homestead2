# Paywall & Free Tier Strategy Research

## Pricing Summary

| Tier | Animals | Monthly | Annual | Effective Monthly |
|---|---|---|---|---|
| Free | 12 | $0 | $0 | $0 |
| Standard | 50 | $5.99/mo | $49.99/yr | $4.17/mo |
| Pro | Unlimited | $14.99/mo | $129.99/yr | $10.83/mo |

---

## Tier Structure Decision

The original 3-tier model (Free / Pro / Farm) was simplified to 2 tiers for MVP: **Free** and **Pro**. A third tier can be introduced later once the user base and feature set justify it.

---

## Free Trial Models

### CC-Required Trial
- User enters payment info, gets X days free, auto-converts to paid unless they cancel.
- Filters for intent. Typical conversion: 40-60% trial-to-paid.
- A portion of conversions are "forgot to cancel" -- these users churn at first renewal or leave angry reviews.
- Apple and Google have tightened rules around this pattern due to consumer complaints.
- Best suited for mature apps with established brand trust and paid acquisition channels.

### No-CC Open Trial
- User gets X days of Pro free, then hits the paywall when it expires.
- Typical conversion: 2-10% trial-to-paid. Much lower, but the funnel is dramatically wider.
- Zero friction, zero resentment. Every conversion is a genuine decision.

### Decision: No Trial at Launch
Start with a generous free tier and a hard paywall (Option A). No trial period. Simplest mental model for users, cleanest UX. Revisit once conversion data exists. If conversion is low, consider adding a contextual trial ("Try Pro free for 7 days") triggered at paywall moments.

---

## Paywall Psychology

### Gate at the Moment of Highest Anxiety
The paywall fires when the user is mid-action -- not preemptively. They've already committed mentally. Trigger points:
1. User tries to log a vaccination (health records)
2. User tries to record a breeding event
3. User exceeds the animal limit
4. User tries to log production
5. User tries to export data

### Loss Aversion
People feel losses ~2x more intensely than equivalent gains (Kahneman & Tversky). For the paywall to leverage this, the user must have experienced the feature first. A homesteader who has never logged a vaccination doesn't feel the loss of not being able to log the next one.

### The Data Moat
After 30 days of logging, the app contains information that doesn't exist anywhere else -- health history, breeding lineage, production data. That's the lock-in: not a paywall, but irreplaceable data. The more records a user logs, the harder it is to leave.

### Sowing and Reaping Principle
Treat the free tier as seed sown generously. The harvest comes from trust and gratitude, not manufactured scarcity. Users who feel they got real value for free become advocates. The ones who feel nickle-and-dimed talk negatively in Facebook groups and forums. In a niche market, word-of-mouth is the primary growth channel.

---

## Taste-Everything-With-Limits Model (Evaluated and Rejected)

Allow all features on Free but cap usage per feature (e.g., 3 health records, 1 active breeding, 5 notes).

### Pros
- Data moat builds itself. Every free record is an anchor.
- Analytics reveal which feature's paywall converts best.
- Free users can advocate for the full product.

### Cons
- Hard to communicate. Complex limits feel like tricks.
- Each limit is an engineering surface (counters, checks, edge cases, downgrade behavior).
- Users game it (delete records to make room, use notes instead of health records).
- "Almost enough" resentment: worse than getting nothing.
- Partial data is worse than no data -- incomplete records undermine trust.

### Verdict
Optimizes for conversion rate at the cost of user goodwill and simplicity. In a niche market in early growth, goodwill and word-of-mouth are worth more than conversion rate.

---

## Animal Count Distribution on American Homesteads

Source: USDA Census of Agriculture (2022), extension service reports, homesteading community surveys.

### Total Animal Count Distribution

| Total Animals | % of Homesteads | Cumulative |
|---|---|---|
| 1-10 | ~25% | 25% |
| 11-25 | ~35% | 60% |
| 26-50 | ~25% | 85% |
| 51-100 | ~10% | 95% |
| 100+ | ~5% | 100% |

Median total animal count: **15-25 animals**, heavily skewed by poultry.

### Per-Species Medians (Small Farms <50 Acres)

| Species | Typical Range | Notes |
|---|---|---|
| Chickens | 12-25 birds | ~60% of small-farm flocks have <50 birds |
| Goats | 6-12 head | 75% of goat operations have <25 animals |
| Cattle | 5-10 head | 70% of small operations have <20 head |
| Sheep | 10-20 head | Most hobby flocks under 30 |
| Pigs | 2-6 head | Highly seasonal, many raise 2-4/year for slaughter |
| Ducks | 4-12 | Limited USDA data |
| Rabbits | 5-15 | Limited USDA data |
| Bees | 2-6 hives | Limited USDA data |

### Implications for Free Tier Animal Limit

| Limit | Coverage | Assessment |
|---|---|---|
| 10 animals | ~25% | Too restrictive. Day one for most homesteaders. Feels punishing. |
| 15 animals | ~40% | Covers solo-species homesteaders. Still tight for mixed operations. |
| 20-25 animals | ~60% | Sweet spot. Backyard flock + a few dairy goats lives comfortably. |
| 50 animals | ~85% | Very generous. Only scaled-up operations pay. |
| 100 animals | ~95% | Essentially free for almost everyone. |

---

## Recommended Strategy

### Three-Tier Model: Free / Standard / Pro

Tiers map to natural homesteader growth stages, not arbitrary feature gates.

#### The Homesteader Journey

1. **Getting started** -- a few chickens, maybe a couple goats. Under 12 animals. Experimenting.
2. **Committed homesteader** -- mixed species, breeding some animals, producing eggs/milk regularly. 15-50 animals. This is their lifestyle now.
3. **Small farm operation** -- diversified, possibly selling at market, multiple species with serious breeding programs, might have help. 50+ animals.

#### Tier Definitions

| Tier | Animal Limit | Coverage | Who They Are |
|---|---|---|---|
| Free | 12 | ~30% | Beginners, backyard flock |
| Standard | 50 | ~85% | Committed homesteaders |
| Pro | Unlimited | 100% | Small farm operations |

#### Feature Matrix

| Feature | Free | Standard | Pro |
|---|---|---|---|
| Animals | 12 | 50 | Unlimited |
| All core features (health, breeding, production, notes, weight, withdrawal calc) | Yes | Yes | Yes |
| Multi-user access | -- | -- | Up to 5 users |
| CSV/PDF Export | -- | -- | Full |
| Priority support | -- | -- | Yes |

#### Why 12 for Free
- A dozen is a natural number -- "a dozen chickens" is how most people start.
- Covers ~30% of homesteads. Generous enough to be a real product, but the moment they diversify into a second species they're knocking on the Standard door.
- All features unlocked. The free tier is the trial. Users experience the full product and become advocates.
- Good seed sown. Not the whole harvest, but enough to demonstrate genuine value.

#### Why 50 for Standard (Not 25)
- 25 is right at the median. A homesteader with 20 chickens and 6 goats is already over. They'd hit the wall immediately and feel like they paid for nothing.
- The jump from Free (12) to Standard (25) is only 13 animals -- not a meaningful upgrade worth paying for.
- 50 gives Standard subscribers real room to grow. Someone with 25 chickens, 8 goats, 6 sheep, 4 pigs, and a few ducks lives comfortably. That's a serious homestead.
- The bell curve drops off hard after 50. Only ~15% of homesteads exceed it.

#### Why Unlimited for Pro
- Pro users are running operations with other people involved. Multi-user access and export are genuinely useful at this scale.
- Unlimited removes any ceiling. No more worrying about limits.

#### Conversion Psychology
- **Free -> Standard:** User outgrows 12 animals. They're already invested with real data. Standard is a natural "yes" tied to their homestead growing.
- **Standard -> Pro:** User outgrows 50 animals or needs multi-user/export. They're running a real operation. Pro solves a real need at that scale.
- Both conversions are tied to life-stage growth moments, not artificial frustration.

### Paywall Behavior
- Gate at the moment of action (creating the Nth+1 animal), not preemptively.
- No free trial at launch. Revisit with conversion data.
- The free tier is the trial -- a complete product for small homesteads.

### Growth Model
- Free users experience the full product and become advocates.
- Word-of-mouth in homesteading communities is the primary acquisition channel.
- The data moat (irreplaceable records accumulated over time) drives retention.
- Conversion happens naturally as homesteads grow, not through artificial limits.
