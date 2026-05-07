# Homesteader Persona UX Feedback — Research

## Concept

Use an LLM-based persona that adopts the perspective of a homesteader (the app's end user) to evaluate UX decisions, screen flows, terminology, and feature prioritization from the user's point of view rather than the developer's.

This is not a replacement for real user research. It is a brainstorming and hypothesis-generation tool.

## Why Homesteader, Not Farmer

A homesteader is meaningfully different from a commercial farmer:

- Manages diverse animals in small numbers (5 goats, 12 chickens, 2 pigs, a cow) rather than hundreds of one species
- Wears every hat: vet, butcher, bookkeeper, builder
- Time is fragmented across animals, garden, repairs, family
- Emotional attachment to animals — they have names and personalities
- Self-taught — learned from YouTube, Facebook groups, and trial and error, not formal agriculture programs
- Motivated by self-sufficiency and family health, not profit margins
- Tech comfort varies wildly — from off-grid-minded and phone-averse to millennials who homestead because of internet communities

These differences directly affect UX needs. A homesteader tracking 4 species with 20 total animals has fundamentally different workflows than a rancher tracking 500 of one species.

## Approach

### Implementation: Markdown Document + Skill

Two pieces working together:

1. **Markdown document** (personas file) — rich content: detailed personas, backgrounds, constraints, real scenarios, vocabulary, frustrations. This is the knowledge layer. Lives in the project, version-controlled, evolves with the app.

2. **Skill** (invoked via `/homesteader` or similar) — a short behavioral trigger that reads the personas file and shifts into adversarial user-perspective mode. This is the activation layer.

Without the skill, the document gets forgotten. Without the document, the skill is shallow. Together they work.

### Making It Useful, Not a Mirror

The default LLM tendency is to be agreeable. An effective persona must be prompted to work against that:

- **Be skeptical and impatient** — "I don't have time for this, what does this even do?"
- **Assume minimal tech literacy** — "I don't know what sync means"
- **Push back on complexity** — "Why do I need 5 fields just to say my goat is sick?"
- **Surface what's confusing, not what works**

### Removing the Knowledge Advantage

The LLM knows the codebase. A real user doesn't. To get closer to real user experience:

- Describe only the UI (screenshots, screen descriptions) — don't give it access to code
- Ask "what do you think happens when you tap X?" before revealing what actually happens
- Withhold feature names and jargon — describe the screen visually and ask what the user thinks it's for

Forcing it to work from limited information produces better feedback.

### Using Multiple Personas

One persona gives one perspective. The homesteader audience is wide. Use several:

- Different ages, tech comfort levels, farm sizes
- Different primary motivations (self-sufficiency, hobby, health, community)
- Different roles (primary caretaker, spouse who checks occasionally, older kid helping with chores)

Different users break the app in different ways.

### Structured Interaction Over Open-Ended Questions

Task-based scenarios produce better output than "what do you think?":

- "Walk through logging a sick animal. What's your first instinct?"
- "You open the app for the first time. What do you expect to see?"
- "You have 30 seconds before you need to get back to work. What can you accomplish?"
- "Something went wrong. How do you figure out what happened?"

## Risks and Guardrails

### False Confidence

The biggest risk. An LLM playing a homesteader is a stereotype composite from training data, not a real person. Feedback sounds plausible but may be subtly wrong in ways that are hard to detect.

**Guardrail:** Treat all output as hypotheses to test, never as conclusions. Label it as such.

### Echo Chamber

The LLM understands the developer's intent. A real homesteader doesn't. It won't be confused by things a real user would be confused by.

**Guardrail:** Remove its knowledge advantage (describe UI only, withhold code and feature context).

### Validation Theater

It feels like user research but isn't. It could become a crutch that replaces actually talking to people.

**Guardrail:** Use it to generate better interview questions and testable hypotheses. Pair every persona insight with a plan to validate it with a real person.

### No Physical Context

A real homesteader is checking the app with dirty hands, in a barn with bad signal, interrupted by animals. The LLM can't simulate that.

**Guardrail:** Explicitly prompt for environmental constraints: "Assume you're holding a bottle-feeding kid in one arm. Can you do this one-handed?"

## Next Steps

- [ ] Create detailed personas document with 3-5 distinct homesteader profiles
- [ ] Build the skill that activates persona mode and reads the personas document
- [ ] Define a standard set of evaluation scenarios to run against new screens/flows
