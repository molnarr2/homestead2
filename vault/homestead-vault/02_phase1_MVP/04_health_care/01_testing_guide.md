# Healthcare Testing Guide

The health system supports 6 record types: **Vaccination**, **Medication**, **Deworming**, **Vet Visit**, **Illness**, and **Injury**. Each is created through the same form but with type-specific fields that appear conditionally.

---

## General Setup (Before Testing)

1. Have at least 2 animals created (different species if possible)
2. Have at least 1 animal group created with 2+ animals in it
3. Note: All health records are accessed from **Animal Detail > Health tab**

---

## 1. Vaccination

**What it tracks:** Disease prevention shots with lot numbers, routes, and booster scheduling.

**Create Flow:**
1. Go to Animal Detail > Health tab
2. Tap the FAB (+) button
3. Animal should be pre-selected (read-only)
4. Tap "Vaccination" in the type selector
5. Enter name (e.g., "Rabies Vaccine")
6. Date defaults to today - leave it or change
7. Fill vaccination-specific fields:
   - Lot Number (e.g., "LOT-2024-A1")
   - Route - tap one of the options (Injection, Oral, etc.)
   - Next Due Date - pick a future date (this auto-creates a care reminder)
8. Optionally fill: Provider Name, Provider Phone, Cost, Notes
9. Tap "Save Health Record"
10. Verify you return to Health tab and the record appears

**Verify:**
- Record shows needle icon and "Vaccination" badge in the list
- Tap it to see detail - all fields display correctly
- Check Care tab: a "Vaccination: Rabies Vaccine" care event should exist with the due date you set
- Edit the record: change the lot number, save, verify update persists

---

## 2. Medication

**What it tracks:** Drug administration with dosage, frequency, and withdrawal periods for food-producing animals.

**Create Flow:**
1. Go to Animal Detail > Health tab > FAB (+)
2. Tap "Medication"
3. Enter name (e.g., "Penicillin")
4. Fill medication-specific fields:
   - Dosage: 5
   - Unit: tap "mL"
   - Route: tap "Injection"
   - Frequency: "2x daily for 5 days"
5. Fill withdrawal period (red section):
   - Withdrawal Days: 28
   - Withdrawal Type: tap "meat"
   - Verify the live calculation shows "Withdrawal ends: [date 28 days out]"
6. Save

**Verify:**
- Record shows pill icon in the list
- Active withdrawal banner appears at top of Health tab (red alert)
- Home screen shows the withdrawal in "Active Withdrawals" section
- Detail screen shows WithdrawalStatusCard with days remaining and "meat" badge
- Wait or change the date to test CLEARED status (set administration date 30+ days in past with 28-day withdrawal)

**Withdrawal Edge Cases:**
- Set withdrawal days to 0 - no withdrawal banner should appear
- Set withdrawal days to negative - should be rejected by validation
- Try each withdrawal type (meat, milk, eggs, all) and verify badge displays correctly

---

## 3. Deworming

**What it tracks:** Parasite treatment with dosage and withdrawal periods. Similar to medication but with different route options.

**Create Flow:**
1. Go to Animal Detail > Health tab > FAB (+)
2. Tap "Deworming"
3. Enter name (e.g., "Ivermectin")
4. Fill deworming-specific fields:
   - Dosage: 10
   - Unit: tap "mg"
   - Route: tap "Pour-On" (note: route options differ from medication - Oral, Injectable, Pour-On, Feed Additive)
5. Fill withdrawal period:
   - Withdrawal Days: 14
   - Withdrawal Type: tap "milk"
6. Save

**Verify:**
- Record shows bug icon in the list
- Withdrawal tracking works identically to medication
- Detail screen shows dosage with unit, route, and withdrawal card
- Edit the record: change route to "Feed Additive", verify it saves

---

## 4. Vet Visit

**What it tracks:** Professional veterinary consultations with diagnosis, treatment notes, and follow-up scheduling.

**Create Flow:**
1. Go to Animal Detail > Health tab > FAB (+)
2. Tap "Vet Visit"
3. Enter name (e.g., "Annual Checkup")
4. Fill vet-specific fields:
   - Clinic Name: "Valley Vet Clinic"
   - Diagnosis: "Healthy, minor hoof wear"
   - Treatment Notes: "Trimmed hooves, administered booster"
   - Follow-up Date: pick a date 6 months out (auto-creates care reminder)
5. Fill Provider Name and Phone
6. Save

**Verify:**
- Record shows stethoscope icon in the list
- Detail screen shows clinic, diagnosis, treatment notes, follow-up date
- Check Care tab: a "Vet Follow-Up: Annual Checkup" care event should exist
- Tap animal name link on detail screen - should navigate to animal detail

---

## 5. Illness

**What it tracks:** Disease or sickness episodes with symptoms, treatment, and outcome tracking.

**Create Flow:**
1. Go to Animal Detail > Health tab > FAB (+)
2. Tap "Illness"
3. Enter name (e.g., "Respiratory Infection")
4. Fill illness-specific fields:
   - Symptoms: "Coughing, nasal discharge, reduced appetite"
   - Treatment: "Antibiotics course, isolated from herd"
   - Resolved Date: leave empty initially (ongoing illness)
   - Outcome: "Ongoing"
5. Save

**Verify:**
- Record shows thermometer icon in the list
- Detail screen shows symptoms, treatment, and outcome
- Edit later: add Resolved Date and change outcome to "Recovered", verify update

---

## 6. Injury

**What it tracks:** Physical trauma incidents with the same fields as illness.

**Create Flow:**
1. Go to Animal Detail > Health tab > FAB (+)
2. Tap "Injury"
3. Enter name (e.g., "Fence Laceration")
4. Fill injury-specific fields:
   - Symptoms: "3-inch cut on left foreleg, swelling"
   - Treatment: "Cleaned wound, applied antiseptic, bandaged"
   - Resolved Date: set to a week from now
   - Outcome: "Recovered"
5. Add Cost: 75
6. Save

**Verify:**
- Record shows bandage icon in the list
- Detail screen shows symptoms, treatment, resolved date, outcome, and cost with $
- Cost displays formatted (e.g., "$75.00" or "$75")

---

## 7. Group Health Records

**What it tracks:** Health events applied to an entire group of animals rather than a single animal.

**Create Flow:**
1. Go to any Animal Detail > Health tab > FAB (+)
2. Switch selection from animal to group using the animal/group toggle
3. Select a group
4. Pick any record type (e.g., "Deworming")
5. Fill out the form as normal
6. Save

**Verify:**
- Go to each animal in that group > Health tab
- The group health record should appear with a green group name badge
- Tapping a group record navigates to Group Detail (not individual record detail)
- Create an individual record on the same animal and verify both appear in the list, sorted by date

---

## 8. Photos

**Test with any record type:**
1. Create a health record
2. Attach a photo during creation
3. Save and verify photo appears on detail screen
4. Edit the record and change the photo
5. Save and verify the new photo replaced the old one

---

## 9. Cross-Cutting Tests

**Validation:**
- Try saving with no name - should fail
- Try saving with no animal/group selected - should fail
- Enter negative dosage - should be rejected
- Enter negative cost - should be rejected
- Enter negative withdrawal days - should be rejected

**Edit Restrictions:**
- Open edit screen - animal/group field should be read-only (cannot change)
- All other fields should be editable

**Empty State:**
- View Health tab on an animal with no records - should show heart-pulse icon with "No health records" message

**Sorting:**
- Create records with different dates on the same animal
- Verify they display newest-first in the Health tab

**Home Screen Integration:**
- Create a medication with active withdrawal
- Go to home screen - verify "Active Withdrawals" section shows the medication
- Tap it - should navigate to the animal
