
  Two things worth knowing

  - No real-time triggers. Completing a care event, logging a breeding, or recording a withdrawal does not push immediately — it only matters at the next 07:00 run. If you want instant pushes, those would need
  Firestore onDocumentWritten triggers, which don't exist yet.
  - Timezone. onSchedule('every day 07:00') runs at 07:00 UTC unless you pass a timeZone option, and the "due today" math uses the server's new Date() (UTC). So "today" is a UTC day boundary — if your users
  are in, say, US timezones, an item due "today" locally might land in a different UTC day. Worth confirming this matches what you want before shipping.

  Want me to add a timeZone option to the schedules, or is UTC fine for now?
