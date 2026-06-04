Use the tech-spec skill

Write it here: /Users/molnarr2/src/homestead2/vault/homestead-vault/02_phase1_MVP/07_code_review/
* Prefix: 07_

When a v1 user logs into the system (they have an user record) and there is no user_v2 record then they need to go through onboarding. An user_v2 and homestead_v2 records will need to be created, use the same way with onboarding.
* The golden path: is when signing in or authenticated if the user_v2 document doesn't exist then check for an user record. 

We also want a transition screen to pop up before moving to onboarding when an user v1 => v2 with a message about this and then a button to continue. Keep it short and concise. This is a group up reworking of the app and will require the animals to be re-entered. Sorry for the inconveniences. But also excited about a more complete experience this will bring to you so please give it a try.