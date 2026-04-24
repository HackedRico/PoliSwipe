# PoliSwipe

**Tagline:** Swipe right on democracy -- civic engagement that feels like a dating app, not a textbook.

**Track:** Governance & Accessibility

**GitHub:** https://github.com/HackedRico/PoliSwipe

---

## Who we built this for and why they need it

We built PoliSwipe for college students who care about the world but don't know where to start participating in it.

The problem isn't apathy -- it's friction. A 20-year-old who wants to oppose a data center near campus has to figure out which government body has jurisdiction, find their rep's contact info, write a coherent email, and do all of this between classes. Most give up after step one.

PoliSwipe removes every barrier between "I care about this" and "I did something about it." Students swipe through local bills, petitions, rallies, and campus issues the same way they'd swipe through any other feed. Swipe right on something you care about, and Claude drafts a personalized email to your representative in seconds. Swipe down to ask questions about a policy you don't understand. Every card is hyperlocal -- real bills in Prince George's County, real rallies at Hornbake Plaza, real reps like Del. Pena-Melnyk and Councilmember Franklin.

We targeted UMD students specifically because civic engagement is lowest among 18-24 year olds, and because local politics (county zoning, state housing bills, campus energy policy) is where individual voices actually move the needle.

## How we used Claude / AI in the project

Claude powers two core features that turn passive scrolling into real civic action:

**1. AI-Drafted Emails to Representatives**
When a student swipes right ("I care"), a bottom sheet opens and Claude drafts a personalized email to the relevant representative. The draft is specific to the issue, addresses the rep by name and title, and writes from the student's perspective as a UMD student. Students can edit the draft before sending. This takes a task that normally stops people cold ("What do I even say to a state delegate?") and reduces it to a 10-second review.

**2. Conversational Policy Chat**
Swiping down on any card opens a chat interface where students can ask Claude questions about the issue -- "How does this zoning bill affect my rent?", "What's the timeline for this vote?", "Who supports this?" Claude responds with concise, factual answers grounded in the card's context. This replaces the experience of Googling a bill number and getting a 40-page PDF.

Both features use a resilient fallback architecture: Claude API (primary) -> pre-written scripted responses -> hardcoded fallbacks. The app never shows an error state or leaves the student hanging, even if the network drops mid-demo.

Claude Code was also used extensively as a development tool throughout the build process.

## What could go wrong and how we addressed it

**AI hallucination / bad civic info:**
Telling a student the wrong deadline for voter registration or misidentifying their representative would be worse than no tool at all. We constrain Claude's responses by passing structured card context (specific bill numbers, rep names, verified dates) in every prompt, and we cap response length to keep answers focused. For the highest-stakes interactions (email drafts), we always show the draft for human review before "sending."

**API latency ruining the UX:**
Students won't wait 8 seconds for a chat response. We implemented a multi-tier fallback: scripted instant replies for common questions, pre-written draft emails per card, and a 30-second timeout. The app feels responsive even when the AI is slow because the most common interactions hit the scripted layer first.

**Filter bubbles / partisan framing:**
A civic engagement tool that only shows one side isn't engagement -- it's propaganda. Our card data includes bills from both parties, covers multiple issue types (federal, state, local, campus, rallies, petitions, elections), and Claude's system prompt explicitly instructs factual, nonpartisan responses. The filter system lets students choose issue categories, not political leanings.

**Privacy:**
Students might type sensitive political opinions into chat. We don't store chat history on the backend -- messages live in component state and disappear when the sheet closes. The backend is stateless for AI endpoints.

## What we'd build next if we had more time

- **Live data pipeline:** Replace hardcoded cards with real-time data from OpenStates API, local government RSS feeds, and campus event systems so the deck stays current without manual updates.
- **Real email delivery:** Integrate with mail APIs so "Send" actually delivers the email to the representative, with read receipts and follow-up tracking.
- **Personalized deck ranking:** Use swipe history to surface issues the student is most likely to care about, similar to how recommendation engines work but for civic participation.
- **Campus expansion:** Generalize the card data model so any university can plug in their local reps, bills, and campus issues. A UMich student sees Michigan bills; a UCLA student sees California ones.
- **Group actions:** Let students see when friends care about the same issue and coordinate collective action (e.g., "12 CS students emailed about the data center -- join them").
- **Accessibility audit:** Full VoiceOver/TalkBack support, high-contrast mode, and screen reader labels on every interactive element.
