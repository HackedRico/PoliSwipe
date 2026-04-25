# PoliSwipe

**Tagline:** Swipe right on democracy -- civic engagement that feels like a dating app, not a textbook.

**Track:** Governance & Accessibility

**GitHub:** https://github.com/HackedRico/PoliSwipe

---

## Inspiration

Civic engagement is lowest among 18-24 year olds, and it isn't because they don't care. It's friction. A 20-year-old who wants to oppose a data center near campus has to figure out which government body has jurisdiction, find their rep's contact info, write a coherent email, and do all of this between classes. Most give up after step one.

Meanwhile, the same student will swipe through a hundred cards on a dating app before lunch. We wanted to steal that interaction model and point it at something that actually matters. If swiping right can start a relationship, it can start a letter to a state delegate.

We targeted UMD students specifically because local politics (county zoning, state housing bills, campus energy policy) is where individual voices actually move the needle, and because "your rep" is a real person ten miles away, not an abstraction in D.C.

## What it does

PoliSwipe is a swipe-card app for civic participation. Students swipe through local bills, petitions, rallies, and campus issues -- real ones, like bills in Prince George's County, rallies at Hornbake Plaza, and reps like Del. Pena-Melnyk and Councilmember Franklin.

Four swipe directions, four actions:
- **Swipe right (care):** Claude drafts a personalized email to the relevant representative. The student reviews and sends.
- **Swipe down (ask):** Opens a chat where Claude answers questions about the issue in plain language.
- **Swipe up (share):** Share the card out.
- **Swipe left (skip):** Next card.

Beyond the deck, students can filter by issue type, save cards for later, post their own civic takes, read Reddit-style threaded community comments, and see a recap ("Civic Wrap") of what they engaged with.

## How we built it

- **Frontend:** React Native + Expo (iOS), with `react-native-reanimated` 4.x and `react-native-gesture-handler` for the swipe deck. Three cards render at once via modulo indexing; the top card is pan-interactive, cards behind are static with visual offset.
- **Bottom sheets:** Seven `BottomSheetModal` instances (action, chat, details, filter, saved, post, comments) controlled imperatively via refs from the main `StackScreen`.
- **State:** No global store. Persistent state (index, saves, filters) goes through a `usePersistentState` hook over AsyncStorage. Ephemeral state lives in `StackScreen`'s `useState`.
- **Backend:** FastAPI server exposing `/api/draft`, `/api/chat`, and `/api/posts`. The Expo app auto-discovers the backend's LAN IP via `Constants.expoConfig.hostUri`.
- **AI:** Claude powers draft emails and policy chat. Every prompt carries structured card context (bill numbers, rep names, dates) so responses stay grounded.
- **Fallback architecture:** Claude API (primary) -> scripted instant replies for common questions -> hardcoded per-card fallbacks. The app never shows an error state.
- **Data:** 22 hand-curated civic cards in `data/cards.ts` covering federal, state, county, campus, rallies, petitions, and elections.

Claude Code was used extensively throughout the build as a pair programmer.

## Challenges we ran into

- **AI hallucination on civic facts:** Telling a student the wrong voter registration deadline is worse than no tool. We constrained responses by passing structured card context in every prompt, capped response length, and always show email drafts for human review before "sending."
- **Latency killing the UX:** Students won't wait 8 seconds for a chat reply. We built the multi-tier fallback so common interactions hit the scripted layer instantly, the AI layer handles the long tail, and a 30-second timeout prevents hangs.
- **Partisan framing:** A civic tool that only shows one side is propaganda, not engagement. We seeded the deck with bills from both parties, diversified issue types, and wrote Claude's system prompt to be explicitly factual and nonpartisan.
- **Privacy:** Students type sensitive political opinions into chat. We made the AI endpoints stateless -- no chat history is stored on the backend; messages live in component state and disappear when the sheet closes.
- **Reanimated / Worklets version drift:** `react-native-reanimated` 4.x and `react-native-worklets` share native C++ bindings and have to stay in lockstep. One mismatched bump broke the swipe gesture silently. `npx expo install --fix` after every related bump is now muscle memory.
- **Stale closures in worklets:** `runOnJS` callbacks from reanimated worklets captured stale refs to the active card. Switching to `useRef` for card/onSwipe inside `useSwipeGesture` fixed it.

## Accomplishments that we're proud of

- **It feels like a dating app, not a civics textbook.** The swipe mechanic is smooth enough that people instinctively keep going -- which was the whole point.
- **Real local data.** Every card names a real bill, a real rep, and a real venue. No lorem ipsum civics.
- **Resilient AI UX.** The fallback architecture means the app demos perfectly even on flaky conference wifi -- the AI enhances when it's available, and scripted content carries the rest.
- **From swipe to sent email in under 15 seconds.** The "I care about this" -> "I did something about it" loop is tight enough that students actually close it.
- **Community Takes.** Reddit-style threaded comments on every card, shipped on a feature branch and merged the same night.

## What we learned

- **Interaction design is policy.** The reason civic tools don't get used isn't that people don't care -- it's that the UI puts twelve steps between caring and acting. Collapsing those steps is the whole intervention.
- **AI should disappear when it works and degrade when it doesn't.** The scripted fallback layer wasn't a hack, it was the right architecture. Users should never see "the AI is down."
- **Constraining the model beats prompting it harder.** Passing structured card context and capping response length did more for factual accuracy than any clever system-prompt wording.
- **Local politics is where the leverage is.** County councilmembers reply to email. U.S. senators don't. Building for the level where a single message moves the needle matters.
- **Ship the reanimated plugin last.** `react-native-reanimated/plugin` has to be the last entry in `babel.config.js` plugins -- we learned this by breaking the app and then breaking it again.

## What's next for PoliSwipe

- **Live data pipeline:** Replace hardcoded cards with real-time data from OpenStates API, local government RSS feeds, and campus event systems so the deck stays current without manual updates.
- **Real email delivery:** Integrate with mail APIs so "Send" actually delivers to the rep, with read receipts and follow-up tracking.
- **Personalized deck ranking:** Use swipe history to surface issues the student is most likely to care about, like a recommendation engine for civic participation.
- **Campus expansion:** Generalize the card data model so any university can plug in their local reps, bills, and campus issues. A UMich student sees Michigan bills; a UCLA student sees California ones.
- **Group actions:** Show students when friends care about the same issue and coordinate collective action ("12 CS students emailed about the data center -- join them").
- **Accessibility audit:** Full VoiceOver/TalkBack support, high-contrast mode, and screen reader labels on every interactive element.
