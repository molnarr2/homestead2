# Schema Migration Options for Firestore

## Current State

- Firestore is schemaless — documents don't enforce a shape, so old and new documents can coexist
- No migration infrastructure exists today (no version fields, no migration scripts)
- No schema versions on any documents
- Cloud functions read care event documents directly (onCareEventComplete trigger, dailyCareReminder)
- The app reads documents with `as CareEvent` / `as HealthRecord` type assertions — no runtime validation
- The `_default()` functions define what new documents look like, but old documents may be missing new fields

## The Fundamental Question

When we add `healthRecordType` to CareEvent in MVP1, and later make breaking changes in a more complete version, what are our options?

---

## Option 1: Additive Fields + Client-Side Defaults (Cheapest)

**How it works:**
- Only add new optional fields. Never remove or rename existing fields.
- When reading a document, treat missing fields as their default value.
- The TypeScript interface and `_default()` function define what new documents look like.
- Old documents missing the new field just get the default at read time.

**For the care event category feature:**
- MVP1: Add `healthRecordType: HealthRecordType | ''` to CareEvent. Old documents don't have this field. When read, treat missing as `''` (husbandry behavior). No migration needed.
- Later: If we need to change `healthRecordType` to something else (e.g., a more complex `category` object), we'd add the new field alongside the old one and deprecate the old one in the client code.

**Pros:**
- Zero migration work. Zero downtime. Zero risk.
- Works naturally with Firestore's schemaless nature.
- Old and new app versions can coexist (important during app store rollouts where users update at different times).

**Cons:**
- Schema accumulates deprecated fields over time ("schema bloat").
- Client code needs to handle both old and new shapes indefinitely, or until all old documents are naturally updated.
- Can't do true breaking changes (rename, restructure, change types of existing fields).

**Best for:** Additive changes that extend existing documents. This covers most MVP -> V2 transitions.

---

## Option 2: Lazy Migration (Read-Time)

**How it works:**
- When the app reads a document, check if it's in the old format.
- If so, transform it to the new format in memory and optionally write the updated version back to Firestore.
- Can be done in the service layer or in a utility function.

**Example pattern:**
```typescript
function migrateCareEvent(data: any): CareEvent {
  // V1 -> V2: rename healthRecordType to category
  if (data.healthRecordType !== undefined && data.category === undefined) {
    data.category = data.healthRecordType ? { type: data.healthRecordType } : null
    // Optionally write back to Firestore here
  }
  return data as CareEvent
}
```

**Pros:**
- No upfront migration script. Documents migrate as they're accessed.
- Handles breaking changes (renames, restructures) gracefully.
- Active documents get migrated quickly. Inactive ones migrate when next touched.

**Cons:**
- Migration logic lives in the client code and must be maintained.
- Cloud functions also need the same migration logic (or you have two readers out of sync).
- If you write back, you're doing a write on every read for old documents (cost + potential for write conflicts).
- Stale documents that are never read again stay in old format forever (usually fine).

**Best for:** Changes that restructure fields or change types, where you want gradual migration without a batch job.

---

## Option 3: Batch Migration via Cloud Function (One-Time Script)

**How it works:**
- Write a one-time Cloud Function (or admin script) that reads all documents in a collection and updates them to the new schema.
- Run it once during a deployment window.
- After the migration, the client code only needs to handle the new format.

**Example:**
```typescript
// One-time migration function
export const migrateCareEvents = onRequest(async (req, res) => {
  const db = getFirestore()
  const homesteads = await db.collection('homestead').get()
  for (const hs of homesteads.docs) {
    const events = await hs.ref.collection('careEvent').get()
    const batch = db.batch()
    for (const doc of events.docs) {
      const data = doc.data()
      if (data.healthRecordType === undefined) {
        batch.update(doc.ref, { healthRecordType: '' })
      }
    }
    await batch.commit()
  }
  res.send('Done')
})
```

**Pros:**
- Clean cut. After migration, all documents are in the new format.
- Client code doesn't need to handle old formats.
- Cloud functions don't need migration logic.

**Cons:**
- Requires careful coordination: deploy migration, run it, then deploy new client code.
- For subcollections under homesteads, you need to iterate all homesteads (can be slow for large datasets).
- Firestore batch writes have a 500-operation limit per batch.
- Users on old app versions may break if they haven't updated yet (app store rollout lag).
- Cost: reads + writes for every document, even ones that haven't changed.

**Best for:** True breaking changes where you need a clean schema and can't tolerate old-format documents. Better suited for later stages when the user base and data volume are known.

---

## Option 4: Version Field + Hybrid

**How it works:**
- Add a `schemaVersion: number` field to every document (or to AdminObject so all documents get it).
- Client code checks the version and applies the appropriate migration path.
- Combine with lazy migration (Option 2) or batch migration (Option 3).

**Example:**
```typescript
// In AdminObject
interface AdminObject {
  deleted: boolean
  updated_at: Tstamp
  created_at: Tstamp
  schemaVersion: number  // <-- new
}

// In service
function readCareEvent(data: any): CareEvent {
  const version = data.admin?.schemaVersion ?? 1
  if (version < 2) return migrateV1toV2(data)
  if (version < 3) return migrateV2toV3(data)
  return data as CareEvent
}
```

**Pros:**
- Explicit versioning makes migrations deterministic.
- Can stack multiple migrations (V1 -> V2 -> V3) cleanly.
- Works well with both lazy and batch approaches.

**Cons:**
- Needs to be added now or at least before the first breaking change.
- Every reader (client + cloud functions) must understand all version transitions.
- Adds complexity that may not be needed if changes stay additive.

**Best for:** Projects that expect multiple rounds of schema evolution and want a systematic approach.

---

## Recommendation for This Project

**MVP1: Use Option 1 (Additive Fields + Client-Side Defaults).**

Add `healthRecordType` as a new field. Old documents don't have it and default to `''` at read time. Zero migration. Zero risk. This is the standard Firestore approach and it works perfectly for this change.

**If a breaking change is needed later: Use Option 2 (Lazy Migration) first.**

For example, if `healthRecordType` needs to become a richer object or get renamed, do a lazy migration in the service layer. This keeps it simple and doesn't require a batch job or downtime. The cloud function (onCareEventComplete) would also need the migration logic — it already spreads `...after` when creating the next recurring event, so new fields flow forward automatically.

**Consider adding a version field to AdminObject (Option 4) before the second breaking change.** If you've already done one lazy migration and are about to do another, that's the signal to add `schemaVersion`. Don't add it preemptively — it's overhead until you need it.

**Reserve Option 3 (Batch Migration) for large structural changes** like splitting a collection, merging collections, or changing the subcollection hierarchy. For field-level changes, lazy migration is almost always sufficient.

## Important Consideration: Cloud Functions

The `onCareEventComplete` trigger reads care event fields directly. When adding `healthRecordType`:
- The trigger spreads `...after` into the next recurring event, so `healthRecordType` will automatically carry forward to the next recurring care event with no code change needed.
- If a future version changes the field name or structure, the cloud function must be updated and redeployed **before or at the same time** as the client update. Cloud functions and client code must stay in sync on schema expectations.
