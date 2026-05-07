# Withdrawal Period Calculator - Animal-Specific Examples

## Core Logic

```
withdrawalEndDate = dateAdministered + withdrawalPeriodDays
daysRemaining = withdrawalEndDate - today
status = daysRemaining > 0 ? "ACTIVE" : "CLEAR"
```

Each withdrawal tracks a **type** (`meat`, `milk`, `eggs`, or `all`) and the user enters the period days manually per medication/dewormer.

---

## Animal-Specific Examples

The system doesn't hardcode withdrawal data — it's user-entered — but here are real-world examples of how this plays out by animal type.

### Dairy Goats / Cattle (milk + meat)

- **Penicillin** — 4-day milk withdrawal, 8-day meat withdrawal. This means **two overlapping withdrawal records** on the same animal with different end dates and types.
- **Ivermectin (dewormer)** — 35-day meat withdrawal for cattle; **not approved** for lactating dairy animals whose milk is consumed, so withdrawal type = `all`.
- **Oxytetracycline** — 96-hour (4-day) milk, 28-day meat.

### Laying Poultry (eggs)

- **Fenbendazole (SafeGuard)** — Commonly used off-label for chickens/turkeys with a 13-14 day egg withdrawal.
- **Ivermectin** — Not FDA-approved for poultry; typical off-label egg withdrawal is 14+ days.
- **Corid (Amprolium)** — 0-day withdrawal for eggs (one of the few approved treatments with no withdrawal).

### Meat Rabbits

- **Sulfadimethoxine** — 10-day meat withdrawal.
- Most medications are used off-label in rabbits, making user-entered withdrawal periods critical.

### Sheep (meat + milk for some breeds)

- **Albendazole (Valbazen)** — 7-day meat withdrawal; **do not use in pregnant ewes** first trimester.
- **Cydectin (moxidectin)** — 14-day meat withdrawal for sheep.

### Pigs (meat only)

- **Ivermectin** — 18-day meat withdrawal.
- **Penicillin** — 7-day meat withdrawal.

---

## Key Complexity Points

1. **Multiple overlapping withdrawals** — A goat treated with penicillin has *both* a milk and meat withdrawal running simultaneously with different countdowns.
2. **Withdrawal type matters** — An egg farmer with chickens on Corid (0-day) can still sell eggs immediately, but if they used ivermectin, they'd need a 14-day egg hold.
3. **Off-label use** — Many small-farm animals (rabbits, poultry, goats) rely on off-label medications where there's no FDA-established withdrawal — the farmer must determine the period themselves, which is why the system is user-configurable rather than database-driven.
4. **Safety criticality** — This is the app's "killer feature" and positioned as the #1 reason to upgrade to Pro. Getting withdrawal wrong = food safety incident.

---

## Design Decision: No Medication Database

The system is intentionally **flexible** (no hardcoded medication database) because small/homestead farms frequently use off-label drugs where official withdrawal periods don't exist. The farmer follows veterinary guidance specific to their situation and enters the withdrawal period manually.
