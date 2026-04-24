# Card Data Layer

This document covers the complete content/data layer of PoliSwipe. Without these exact files, the app has no cards, chat responses, profile info, or category filters to display. Every file is reproduced in full so it can be copy-pasted to recreate the data layer from scratch.

---

## Table of Contents

1. [Card Data Format](#1-card-data-format)
2. [All 22 Cards -- Summary Table](#2-all-22-cards--summary-table)
3. [Complete Source: `data/cards.ts`](#3-complete-source-datacardsTS)
4. [Chat Scripts](#4-chat-scripts)
5. [Complete Source: `data/chatScripts.ts`](#5-complete-source-datachatscriptsts)
6. [Profile Data](#6-profile-data)
7. [Complete Source: `data/profile.ts`](#7-complete-source-dataprofilets)
8. [Categories](#8-categories)
9. [Complete Source: `data/categories.ts`](#9-complete-source-datacategoriests)
10. [How to Add New Cards](#10-how-to-add-new-cards)

---

## 1. Card Data Format

Every card is an object conforming to the `Card` type from `@/types`. Fields fall into two groups: **universal** (present on every card) and **type-specific** (only present on certain card types).

### Universal Fields (all cards)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier, e.g. `'card_01'` |
| `type` | `string` | One of: `petition`, `rally`, `state`, `campus`, `federal`, `local`, `election` |
| `emoji` | `string` | Emoji displayed on the card chip |
| `chipLabel` | `string` | Short label shown in the card chip (e.g. `'PETITION'`, `'CONGRESS'`, `'UMD'`) |
| `headline` | `string` | Primary card title |
| `summary` | `string` | 1-3 sentence description of the issue |
| `actionHint` | `string` | CTA button label (e.g. `'Sign petition'`, `'Call your senator'`) |
| `rep` | `string` | Name of the relevant representative or organization |
| `repTitle` | `string` | Title/role of the rep |
| `draft` | `string` | Pre-written email, text, or note the user can send |
| `peer` | `string` | Social proof line (e.g. `'14 CS students also cared'`) |
| `prompts` | `string[]` | Array of 3 suggested chat questions for the card |
| `sources` | `Source[]` | Array of `{ title, date }` objects for citations |
| `updatedAgo` | `string` | Human-readable time since last update (e.g. `'2h ago'`) |

### Type-Specific Fields

**Cards with `stat`** (types: `petition`, `state`, `campus`, `federal`, `local`, `election`):

| Field | Type | Description |
|-------|------|-------------|
| `stat.icon` | `string` | Emoji icon for the stat |
| `stat.text` | `string` | Stat description |
| `stat.tone` | `string` | Matches the card type, used for styling |

**Cards with `detailsBody`** (currently only `card_01`):

| Field | Type | Description |
|-------|------|-------------|
| `detailsBody` | `string` | Extended paragraph with deeper context |

**Rally cards** (`type: 'rally'`):

| Field | Type | Description |
|-------|------|-------------|
| `when.dateLabel` | `string` | Human-readable date (e.g. `'This Saturday'`) |
| `when.time` | `string` | Display time (e.g. `'2:00 PM'`) |
| `when.isoStart` | `string` | ISO 8601 start time |
| `when.isoEnd` | `string` | ISO 8601 end time |
| `where.place` | `string` | Venue name |
| `where.address` | `string` | Full address |
| `where.walkMin` | `number` | Walking time from campus in minutes |
| `weather.icon` | `string` | Weather emoji |
| `weather.temp` | `string` | Temperature string |
| `weather.desc` | `string` | Weather description |
| `going` | `number` | Total RSVP count |
| `majorGoing` | `number` | Number of students from user's major going |

---

## 2. All 22 Cards -- Summary Table

| # | ID | Type | Headline |
|---|-----|------|----------|
| 1 | `card_01` | petition | Data center the size of 30 football fields proposed 6 miles from UMD |
| 2 | `card_02` | rally | Rally against PG County data centers -- Hornbake Plaza, 2pm Saturday |
| 3 | `card_03` | state | HB538 allows duplexes near Purple Line stops -- your rent could drop |
| 4 | `card_04` | campus | SGA votes on Graduate Labor Union recognition this Thursday |
| 5 | `card_05` | federal | Senate voting next week on $1,200 Pell Grant expansion |
| 6 | `card_06` | local | Speed cameras coming to Route 1 near campus -- public comment open |
| 7 | `card_07` | election | PG County Council primary -- 3 candidates, 1 seat, your district |
| 8 | `card_08` | federal | CHIPS Act funding round 2 -- $3B for university research labs |
| 9 | `card_09` | rally | Sunrise UMD climate strike -- McKeldin Mall, Friday noon |
| 10 | `card_10` | petition | Petition: Make UMD dining halls publish carbon footprint labels |
| 11 | `card_11` | state | Maryland passes free community college for families under $100K |
| 12 | `card_12` | campus | UMD suspends 3 student orgs over protest policy violations |
| 13 | `card_13` | federal | TikTok ban bill clears Senate committee, floor vote next month |
| 14 | `card_14` | local | Metro fare hike proposal: $0.50 increase starting July 1 |
| 15 | `card_15` | campus | UMD announces $2B campus expansion plan including new CS building |
| 16 | `card_16` | petition | Petition to bring back 24-hour library access during finals |
| 17 | `card_17` | state | Maryland legalizes recreational cannabis, expungement begins |
| 18 | `card_18` | rally | March for affordable housing, downtown College Park, Sunday 1pm |
| 19 | `card_19` | election | SGA elections open now, vote for your college rep by Friday |
| 20 | `card_20` | federal | Student loan forgiveness deadline extended to June 30 |
| 21 | `card_21` | local | Purple Line construction blocking Route 1 crosswalks through May |
| 22 | `card_22` | campus | UMD dining workers vote to strike over wages, May 1 deadline |

### Card Type Distribution

| Type | Count | Cards |
|------|-------|-------|
| petition | 3 | card_01, card_10, card_16 |
| rally | 3 | card_02, card_09, card_18 |
| state | 3 | card_03, card_11, card_17 |
| campus | 4 | card_04, card_12, card_15, card_22 |
| federal | 4 | card_05, card_08, card_13, card_20 |
| local | 3 | card_06, card_14, card_21 |
| election | 2 | card_07, card_19 |

---

## 3. Complete Source: `data/cards.ts`

```ts
import type { Card } from '@/types';

export const CARDS: Card[] = [
  {
    id: 'card_01',
    type: 'petition',
    emoji: '\u270D\uFE0F',
    chipLabel: 'PETITION',
    headline: 'Data center the size of 30 football fields proposed 6 miles from UMD',
    summary: 'Prince George\'s County is considering CB-92-2025 to rezone the old Landover Mall site for a massive data center campus. Could spike electricity bills by 30% and strain the grid your dorm runs on.',
    stat: { icon: '\u{1F4CA}', text: '20,247 signatures in 2 weeks', tone: 'petition' },
    actionHint: 'Sign petition',
    rep: 'Councilmember Franklin',
    repTitle: 'PG County Council, District 5',
    draft: 'Dear Councilmember Franklin,\n\nAs a University of Maryland student living in College Park, I\'m deeply concerned about CB-92-2025. The proposed data center at the old Landover Mall site would dramatically increase electricity demand in our area, potentially raising bills by up to 30%. The environmental and infrastructure impacts on our campus community cannot be ignored.\n\nI urge you to vote against this rezoning proposal.\n\nSincerely,\nA concerned UMD student',
    peer: '14 CS students also cared',
    prompts: ['What\'s the timeline?', 'How does this affect my rent?', 'Who supports this?'],
    sources: [
      { title: 'Washington Post \u00B7 PG rezoning hearing draws 600', date: 'Apr 18' },
      { title: 'Diamondback \u00B7 Students rally against Landover data center', date: 'Apr 15' },
    ],
    detailsBody: 'The proposed data center would occupy 2.5 million square feet across the former Landover Mall site. Industry analysts estimate it would consume 400-600 megawatts of electricity \u2014 roughly equivalent to powering 300,000 homes. Prince George\'s County imposed a 180-day moratorium in March while studying environmental impacts. The site is located just 6 miles from UMD\'s campus, and prevailing winds would carry emissions directly toward College Park.',
    updatedAgo: '2h ago',
  },
  {
    id: 'card_02',
    type: 'rally',
    emoji: '\u270A',
    chipLabel: 'RALLY',
    headline: 'Rally against PG County data centers \u2014 Hornbake Plaza, 2pm Saturday',
    summary: 'Maryland Data Center Reform Coalition + CEEJH organizing a campus-wide walk. Your voice + body + friends = 10x more effective than online petitions.',
    when: { dateLabel: 'This Saturday', time: '2:00 PM', isoStart: '2026-04-25T14:00:00', isoEnd: '2026-04-25T16:00:00' },
    where: { place: 'Hornbake Plaza', address: 'Hornbake Library, College Park, MD 20742', walkMin: 8 },
    weather: { icon: '\u2600\uFE0F', temp: '72\u00B0F', desc: 'Clear skies' },
    going: 403,
    majorGoing: 11,
    actionHint: 'RSVP + add to calendar',
    rep: 'CEEJH Organizers',
    repTitle: 'Center for Community Engagement, Environmental Justice, and Health',
    draft: 'Hey! There\'s a rally against the PG County data center this Saturday at Hornbake Plaza, 2pm. 400+ people RSVP\'d already. Want to come with me?',
    peer: '11 CS students going',
    prompts: ['What should I bring?', 'Will it be peaceful?', 'How do I get there from South Campus?'],
    sources: [
      { title: 'UMD Today \u00B7 Students organize climate rally', date: 'Apr 20' },
      { title: 'CEEJH \u00B7 Event details and RSVP', date: 'Apr 19' },
    ],
    updatedAgo: '5h ago',
  },
  {
    id: 'card_03',
    type: 'state',
    emoji: '\u{1F4DC}',
    chipLabel: 'MARYLAND',
    headline: 'HB538 allows duplexes near Purple Line stops \u2014 your rent could drop',
    summary: 'The Housing Expansion and Affordability Act took effect Jan 2025. Within 1 mile of rail transit, cities can\'t ban multi-family housing. Purple Line stops at UMD in 2027.',
    stat: { icon: '\u{1F3E0}', text: 'Maryland has a 96,000-unit housing shortfall', tone: 'state' },
    actionHint: 'Email your delegate',
    rep: 'Del. Joseline Pe\u00F1a-Melnyk',
    repTitle: 'Maryland House of Delegates, District 21',
    draft: 'Dear Delegate Pe\u00F1a-Melnyk,\n\nAs a UMD student facing rising off-campus housing costs, I want to thank you for supporting HB538. The Purple Line will transform College Park, and allowing duplexes and triplexes near transit stops is exactly the kind of policy we need.\n\nPlease continue advocating for housing affordability in District 21.\n\nSincerely,\nA UMD student',
    peer: '23 students in your area also cared',
    prompts: ['When does this take effect?', 'How will it affect College Park?', 'What about parking?'],
    sources: [
      { title: 'Baltimore Sun \u00B7 Housing act reshapes Maryland zoning', date: 'Apr 10' },
      { title: 'MGA \u00B7 HB538 bill text', date: 'Jan 2025' },
    ],
    updatedAgo: '1d ago',
  },
  {
    id: 'card_04',
    type: 'campus',
    emoji: '\u{1F393}',
    chipLabel: 'UMD',
    headline: 'SGA votes on Graduate Labor Union recognition this Thursday',
    summary: 'Grad students earn ~$60K/year in stipends+benefits and want collective bargaining rights. SGA overrode president\'s veto 15-4-6 last March. Your TAs and lab instructors are grad students.',
    stat: { icon: '\u{1F4CB}', text: 'SGA vote: 15-4-6 override', tone: 'campus' },
    actionHint: 'Email your SGA rep',
    rep: 'SGA President Marcus Chen',
    repTitle: 'Student Government Association, UMD',
    draft: 'Dear President Chen,\n\nAs an undergraduate who benefits directly from the teaching and mentorship of graduate students, I support the SGA\'s recognition of the Graduate Labor Union. Fair wages and collective bargaining rights for our TAs improve the quality of education for everyone.\n\nThank you for your leadership on this issue.\n\nBest,\nA UMD undergraduate',
    peer: '8 students in your major also cared',
    prompts: ['What does this mean for my classes?', 'How did the vote break down?', 'What happens next?'],
    sources: [
      { title: 'Diamondback \u00B7 SGA overrides veto on GLU recognition', date: 'Mar 28' },
      { title: 'GLU \u00B7 Statement on recognition', date: 'Mar 29' },
    ],
    updatedAgo: '3h ago',
  },
  {
    id: 'card_05',
    type: 'federal',
    emoji: '\u{1F3DB}\uFE0F',
    chipLabel: 'CONGRESS',
    headline: 'Senate voting next week on $1,200 Pell Grant expansion',
    summary: 'S. 2023 would increase the max Pell Grant by $1,200 and cover short-term job training programs. If you or a friend uses Pell, this is $1,200/year directly.',
    stat: { icon: '\u{1F4B0}', text: '7.7M students receive Pell Grants', tone: 'federal' },
    actionHint: 'Call your senator',
    rep: 'Sen. Chris Van Hollen',
    repTitle: 'U.S. Senate, Maryland',
    draft: 'Dear Senator Van Hollen,\n\nI\'m a University of Maryland student and I urge you to vote YES on S. 2023, the Pell Grant expansion bill. Many of my classmates rely on Pell Grants to afford their education. An additional $1,200 per year would make a meaningful difference.\n\nThank you for representing Maryland students.\n\nSincerely,\nA UMD student',
    peer: '31 UMD students also cared',
    prompts: ['When is the vote?', 'Who opposes this?', 'How much do I get?'],
    sources: [
      { title: 'NPR \u00B7 Senate takes up student aid expansion', date: 'Apr 21' },
      { title: 'Congress.gov \u00B7 S.2023 bill text', date: 'Apr 2026' },
    ],
    updatedAgo: '6h ago',
  },
  {
    id: 'card_06',
    type: 'local',
    emoji: '\u{1F4CD}',
    chipLabel: 'PG COUNTY',
    headline: 'Speed cameras coming to Route 1 near campus \u2014 public comment open',
    summary: 'PG County DOT proposing 8 new speed cameras on US Route 1 between College Park and Hyattsville. 23 pedestrian crashes in the last 2 years. 30-day public comment period ends May 10.',
    stat: { icon: '\u26A0\uFE0F', text: '23 pedestrian crashes in 2 years', tone: 'local' },
    actionHint: 'Submit public comment',
    rep: 'County Executive Angela Alsobrooks',
    repTitle: 'Prince George\'s County Executive',
    draft: 'Dear County Executive Alsobrooks,\n\nAs a UMD student who walks and bikes along Route 1 daily, I strongly support the proposed speed cameras. The pedestrian crash statistics are alarming, and I\'ve personally witnessed dangerous driving. Please prioritize student and resident safety.\n\nThank you,\nA College Park resident',
    peer: '19 students near Route 1 also cared',
    prompts: ['Where exactly on Route 1?', 'How much are the fines?', 'Do they actually reduce crashes?'],
    sources: [
      { title: 'Patch \u00B7 Speed cameras proposed for Route 1 corridor', date: 'Apr 16' },
      { title: 'PG County DOT \u00B7 Public comment portal', date: 'Apr 14' },
    ],
    updatedAgo: '1d ago',
  },
  {
    id: 'card_07',
    type: 'election',
    emoji: '\u{1F5F3}\uFE0F',
    chipLabel: 'BALLOT',
    headline: 'PG County Council primary \u2014 3 candidates, 1 seat, your district',
    summary: 'District 3 primary is June 24. Three candidates with very different takes on housing density, the Purple Line, and campus-area development. Early voting starts June 14.',
    stat: { icon: '\u{1F4CA}', text: 'Only 12% of 18-24 voted in last primary', tone: 'election' },
    actionHint: 'Check voter registration',
    rep: 'MD Board of Elections',
    repTitle: 'Maryland State Board of Elections',
    draft: 'Reminder to self: Check voter registration at voterservices.elections.maryland.gov. PG County District 3 primary is June 24. Early voting June 14-20.',
    peer: '6 students in your dorm aren\'t registered yet',
    prompts: ['Where do I vote?', 'Compare the candidates', 'Am I registered?'],
    sources: [
      { title: 'PG County BOE \u00B7 2026 Primary candidates', date: 'Apr 1' },
      { title: 'Diamondback \u00B7 Student voter guide', date: 'Apr 18' },
    ],
    updatedAgo: '12h ago',
  },
  {
    id: 'card_08',
    type: 'federal',
    emoji: '\u{1F3DB}\uFE0F',
    chipLabel: 'CONGRESS',
    headline: 'CHIPS Act funding round 2 \u2014 $3B for university research labs',
    summary: 'The Commerce Dept announced $3 billion in CHIPS Act grants for semiconductor research at universities. UMD\'s A. James Clark School is applying. Could mean new CS and engineering labs on campus.',
    stat: { icon: '\u{1F52C}', text: '$3B in university grants announced', tone: 'federal' },
    actionHint: 'Email your rep to support UMD\'s bid',
    rep: 'Rep. Glenn Ivey',
    repTitle: 'U.S. House, Maryland District 4',
    draft: 'Dear Representative Ivey,\n\nUMD\'s Clark School of Engineering is applying for CHIPS Act Round 2 funding. As a student in the College Park district, I urge you to support UMD\'s application. This investment would create research opportunities, jobs, and keep American semiconductor innovation on campus.\n\nThank you,\nA UMD engineering student',
    peer: '42 engineering students also cared',
    prompts: ['How much could UMD get?', 'What labs would be built?', 'When will they decide?'],
    sources: [
      { title: 'Reuters \u00B7 CHIPS Act Round 2 details', date: 'Apr 22' },
      { title: 'UMD Today \u00B7 Clark School submits application', date: 'Apr 20' },
    ],
    updatedAgo: '4h ago',
  },
  {
    id: 'card_09',
    type: 'rally',
    emoji: '\u270A',
    chipLabel: 'RALLY',
    headline: 'Sunrise UMD climate strike \u2014 McKeldin Mall, Friday noon',
    summary: 'Sunrise Movement UMD chapter organizing a walkout demanding the university divest from fossil fuels. Endorsed by 12 student orgs. Speakers from Environmental Science and Public Policy.',
    when: { dateLabel: 'This Friday', time: '12:00 PM', isoStart: '2026-04-24T12:00:00', isoEnd: '2026-04-24T13:30:00' },
    where: { place: 'McKeldin Mall', address: 'McKeldin Mall, College Park, MD 20742', walkMin: 5 },
    weather: { icon: '\u26C5', temp: '68\u00B0F', desc: 'Partly cloudy' },
    going: 287,
    majorGoing: 8,
    actionHint: 'RSVP + add to calendar',
    rep: 'Sunrise UMD',
    repTitle: 'Sunrise Movement, UMD Chapter',
    draft: 'Hey! Sunrise UMD is doing a climate strike on McKeldin Mall this Friday at noon. 280+ people going. Come with?',
    peer: '8 CS students going',
    prompts: ['What are the demands?', 'Will professors excuse absences?', 'Is it student-run?'],
    sources: [
      { title: 'Sunrise UMD \u00B7 Strike announcement', date: 'Apr 19' },
      { title: 'Diamondback \u00B7 Climate groups unite for walkout', date: 'Apr 21' },
    ],
    updatedAgo: '1d ago',
  },
  {
    id: 'card_10',
    type: 'petition',
    emoji: '\u270D\uFE0F',
    chipLabel: 'PETITION',
    headline: 'Petition: Make UMD dining halls publish carbon footprint labels',
    summary: 'Student Sustainability Coalition gathering signatures to require Dining Services to display carbon footprint data on every menu item. UC Berkeley and Yale already do this.',
    stat: { icon: '\u{1F331}', text: '4,102 signatures, need 5,000', tone: 'petition' },
    actionHint: 'Sign the petition',
    rep: 'VP of Student Affairs',
    repTitle: 'University of Maryland Administration',
    draft: 'Dear VP of Student Affairs,\n\nI support the Student Sustainability Coalition\'s petition for carbon footprint labels in UMD dining halls. Peer institutions like UC Berkeley and Yale have already implemented this. It\'s a low-cost, high-impact way to promote environmental awareness.\n\nPlease consider this request.\n\nSincerely,\nA UMD student',
    peer: '17 students in your dorm signed',
    prompts: ['What would the labels look like?', 'Does this actually help?', 'Which dining halls?'],
    sources: [
      { title: 'SSC \u00B7 Carbon label petition', date: 'Apr 12' },
      { title: 'Yale Daily News \u00B7 Carbon labels pilot results', date: 'Mar 2026' },
    ],
    updatedAgo: '3d ago',
  },
  {
    id: 'card_11',
    type: 'state',
    emoji: '\u{1F4DC}',
    chipLabel: 'MARYLAND',
    headline: 'Maryland passes free community college for families under $100K',
    summary: 'HB 1260 makes community college tuition-free for Maryland families earning under $100,000. Signed by Gov. Moore last week. Transfers to UMD could increase.',
    stat: { icon: '\u{1F393}', text: '~45,000 students eligible statewide', tone: 'state' },
    actionHint: 'Share with someone who needs this',
    rep: 'Gov. Wes Moore',
    repTitle: 'Governor of Maryland',
    draft: 'Hey, did you see this? Maryland just made community college free for families under $100K. If you know anyone thinking about college, this could be huge for them.',
    peer: '56 UMD students shared this',
    prompts: ['Does this affect UMD tuition?', 'Who qualifies?', 'When does it start?'],
    sources: [
      { title: 'Baltimore Sun \u00B7 Moore signs free CC bill', date: 'Apr 17' },
      { title: 'MGA \u00B7 HB1260 enrolled', date: 'Apr 15' },
    ],
    updatedAgo: '1w ago',
  },
  {
    id: 'card_12',
    type: 'campus',
    emoji: '\u{1F393}',
    chipLabel: 'UMD',
    headline: 'UMD suspends 3 student orgs over protest policy violations',
    summary: 'Three student organizations suspended for 1 semester after protests blocked access to Stamp Student Union. New protest guidelines require 48-hour advance notice. ACLU of Maryland reviewing.',
    stat: { icon: '\u{1F4E2}', text: 'New rules affect 800+ student orgs', tone: 'campus' },
    actionHint: 'Email the Provost',
    rep: 'Provost Jennifer King Rice',
    repTitle: 'University of Maryland Provost',
    draft: 'Dear Provost Rice,\n\nI\'m concerned about the new protest guidelines requiring 48-hour advance notice. While I understand the need for campus order, these rules could have a chilling effect on free speech. I urge you to reconsider the policy with student input.\n\nSincerely,\nA UMD student',
    peer: '34 students also cared about this',
    prompts: ['Which orgs were suspended?', 'Is this legal?', 'What are the new rules?'],
    sources: [
      { title: 'Diamondback \u00B7 Three orgs suspended', date: 'Apr 22' },
      { title: 'ACLU MD \u00B7 Statement on campus speech', date: 'Apr 23' },
    ],
    updatedAgo: '8h ago',
  },
  {
    id: 'card_13',
    type: 'federal',
    emoji: '\u{1F3DB}\uFE0F',
    chipLabel: 'CONGRESS',
    headline: 'TikTok ban bill clears Senate committee, floor vote next month',
    summary: 'The RESTRICT Act would give the Commerce Dept power to ban foreign-owned apps deemed national security threats. TikTok has 150M US users, 67% of US teens use it daily.',
    stat: { icon: '\u{1F4F1}', text: '150M US users affected', tone: 'federal' },
    actionHint: 'Call your senator',
    rep: 'Sen. Angela Alsobrooks',
    repTitle: 'U.S. Senate, Maryland',
    draft: 'Dear Senator Alsobrooks,\n\nAs a college student, I rely on TikTok for news, community, and creative expression. I urge you to carefully consider the free speech implications of the RESTRICT Act before voting.\n\nSincerely,\nA UMD student',
    peer: '89 UMD students also cared',
    prompts: ['Does this actually ban TikTok?', 'When is the vote?', 'What are the alternatives?'],
    sources: [
      { title: 'NYT \u00B7 TikTok ban advances in Senate', date: 'Apr 22' },
      { title: 'Verge \u00B7 RESTRICT Act explained', date: 'Apr 20' },
    ],
    updatedAgo: '4h ago',
  },
  {
    id: 'card_14',
    type: 'local',
    emoji: '\u{1F4CD}',
    chipLabel: 'PG COUNTY',
    headline: 'Metro fare hike proposal: $0.50 increase starting July 1',
    summary: 'WMATA board proposing a $0.50 per-ride fare increase across all rail and bus lines. UMD students take an average of 8 Metro trips per week. Could cost you $200 more per year.',
    stat: { icon: '\u{1F68D}', text: '$200/year extra per student', tone: 'local' },
    actionHint: 'Submit public comment',
    rep: 'WMATA Board',
    repTitle: 'Washington Metropolitan Area Transit Authority',
    draft: 'Dear WMATA Board Members,\n\nAs a UMD student who depends on Metro to commute, I oppose the proposed fare increase. Students are already financially strained. Please consider expanding student discount programs instead.\n\nSincerely,\nA daily Metro rider',
    peer: '45 commuter students also cared',
    prompts: ['When does this take effect?', 'Is there a student discount?', 'How do I comment?'],
    sources: [
      { title: 'WTOP \u00B7 WMATA proposes fare hike', date: 'Apr 19' },
      { title: 'WMATA \u00B7 Public hearing notice', date: 'Apr 17' },
    ],
    updatedAgo: '2d ago',
  },
  {
    id: 'card_15',
    type: 'campus',
    emoji: '\u{1F393}',
    chipLabel: 'UMD',
    headline: 'UMD announces $2B campus expansion plan including new CS building',
    summary: 'The "Greater College Park" initiative includes a new 200,000 sqft Computer Science building, expanded dining, and 2,000 new housing beds. Construction starts fall 2027.',
    stat: { icon: '\u{1F3D7}\uFE0F', text: '$2B investment over 10 years', tone: 'campus' },
    actionHint: 'Attend town hall',
    rep: 'President Darryll Pines',
    repTitle: 'University of Maryland President',
    draft: 'Dear President Pines,\n\nI am excited about the Greater College Park initiative. As a CS student, a new building would directly improve my education. I hope student voices are included in the planning process.\n\nBest,\nA UMD CS major',
    peer: '67 CS students also cared',
    prompts: ['When does construction start?', 'Where will the CS building be?', 'How is it funded?'],
    sources: [
      { title: 'UMD Today \u00B7 $2B expansion announced', date: 'Apr 21' },
      { title: 'Diamondback \u00B7 New CS building details', date: 'Apr 22' },
    ],
    updatedAgo: '1d ago',
  },
  {
    id: 'card_16',
    type: 'petition',
    emoji: '\u270D\uFE0F',
    chipLabel: 'PETITION',
    headline: 'Petition to bring back 24-hour library access during finals',
    summary: 'McKeldin Library hours were cut to midnight last semester. 8,000+ students signed a petition to restore 24-hour access during finals weeks. Administration reviewing.',
    stat: { icon: '\u{1F4DA}', text: '8,412 signatures, need 10,000', tone: 'petition' },
    actionHint: 'Sign the petition',
    rep: 'Dean of Libraries',
    repTitle: 'University of Maryland Libraries',
    draft: 'Dear Dean of Libraries,\n\nAs a student who studies best late at night, losing 24-hour McKeldin access has hurt my academic performance. Please restore extended hours during finals. 8,000+ students agree.\n\nSincerely,\nA UMD student',
    peer: '22 students in your dorm signed',
    prompts: ['Why were hours cut?', 'Which buildings are open late?', 'When is the decision?'],
    sources: [
      { title: 'Diamondback \u00B7 Students push for 24hr McKeldin', date: 'Apr 18' },
      { title: 'Change.org \u00B7 McKeldin petition', date: 'Apr 10' },
    ],
    updatedAgo: '5d ago',
  },
  {
    id: 'card_17',
    type: 'state',
    emoji: '\u{1F4DC}',
    chipLabel: 'MARYLAND',
    headline: 'Maryland legalizes recreational cannabis, expungement begins',
    summary: 'Cannabis sales launched July 2023. Now the state is processing 175,000 expungement cases for prior convictions. If you or someone you know has a record, check eligibility.',
    stat: { icon: '\u2696\uFE0F', text: '175,000 cases eligible for expungement', tone: 'state' },
    actionHint: 'Check expungement eligibility',
    rep: 'Maryland Judiciary',
    repTitle: 'Maryland Courts',
    draft: 'Hey, did you know Maryland is automatically expunging cannabis convictions? If you or anyone you know has a record, check eligibility at mdcourts.gov/expungement. Spread the word.',
    peer: '28 students shared this',
    prompts: ['How do I check eligibility?', 'Is it automatic?', 'What charges qualify?'],
    sources: [
      { title: 'Baltimore Banner \u00B7 Expungement process begins', date: 'Apr 15' },
      { title: 'MD Courts \u00B7 Expungement FAQ', date: 'Apr 2026' },
    ],
    updatedAgo: '1w ago',
  },
  {
    id: 'card_18',
    type: 'rally',
    emoji: '\u270A',
    chipLabel: 'RALLY',
    headline: 'March for affordable housing, downtown College Park, Sunday 1pm',
    summary: 'College Park Tenants Union organizing a march from City Hall to the Purple Line construction site. Demanding rent stabilization and affordable units near transit.',
    when: { dateLabel: 'This Sunday', time: '1:00 PM', isoStart: '2026-04-26T13:00:00', isoEnd: '2026-04-26T15:00:00' },
    where: { place: 'College Park City Hall', address: '4500 Knox Rd, College Park, MD 20740', walkMin: 12 },
    weather: { icon: '\u{1F324}\uFE0F', temp: '70\u00B0F', desc: 'Mostly sunny' },
    going: 189,
    majorGoing: 6,
    actionHint: 'RSVP + add to calendar',
    rep: 'College Park City Council',
    repTitle: 'City of College Park',
    draft: 'There is a march for affordable housing this Sunday at 1pm starting at College Park City Hall. 180+ people going. Join us!',
    peer: '6 CS students going',
    prompts: ['What route does the march take?', 'What are the demands?', 'Is the city responding?'],
    sources: [
      { title: 'CP Tenants Union \u00B7 March details', date: 'Apr 20' },
      { title: 'Patch \u00B7 Housing crisis in College Park', date: 'Apr 18' },
    ],
    updatedAgo: '1d ago',
  },
  {
    id: 'card_19',
    type: 'election',
    emoji: '\u{1F5F3}\uFE0F',
    chipLabel: 'BALLOT',
    headline: 'SGA elections open now, vote for your college rep by Friday',
    summary: 'Student Government Association elections are live. 14 candidates running for 7 seats. Your vote decides who controls the $1.2M student activity fee budget.',
    stat: { icon: '\u{1F4CA}', text: 'Only 9% of students voted last year', tone: 'election' },
    actionHint: 'Vote now on Testudo',
    rep: 'SGA Election Board',
    repTitle: 'UMD Student Government Association',
    draft: 'Reminder: SGA elections close Friday at 5pm. Vote at testudo.umd.edu. These reps control $1.2M in student fees. Takes 2 minutes.',
    peer: '12 students in your major haven\'t voted',
    prompts: ['Who are the candidates?', 'What do they control?', 'Where do I vote?'],
    sources: [
      { title: 'Diamondback \u00B7 SGA candidate profiles', date: 'Apr 21' },
      { title: 'SGA \u00B7 Election portal', date: 'Apr 20' },
    ],
    updatedAgo: '6h ago',
  },
  {
    id: 'card_20',
    type: 'federal',
    emoji: '\u{1F3DB}\uFE0F',
    chipLabel: 'CONGRESS',
    headline: 'Student loan forgiveness deadline extended to June 30',
    summary: 'The SAVE plan IDR account adjustment is processing 4.6M borrowers. Deadline to consolidate and qualify was extended to June 30. Check if your loans are eligible.',
    stat: { icon: '\u{1F4B5}', text: '4.6M borrowers being processed', tone: 'federal' },
    actionHint: 'Check your eligibility',
    rep: 'Dept of Education',
    repTitle: 'U.S. Department of Education',
    draft: 'PSA: Student loan forgiveness deadline extended to June 30. If you have federal loans, check studentaid.gov to see if you qualify for the SAVE plan adjustment. Don\'t miss it.',
    peer: '73 UMD students checked eligibility',
    prompts: ['Am I eligible?', 'What is the SAVE plan?', 'How much could I save?'],
    sources: [
      { title: 'AP \u00B7 Loan forgiveness deadline extended', date: 'Apr 23' },
      { title: 'StudentAid.gov \u00B7 SAVE plan details', date: 'Apr 2026' },
    ],
    updatedAgo: '10h ago',
  },
  {
    id: 'card_21',
    type: 'local',
    emoji: '\u{1F4CD}',
    chipLabel: 'PG COUNTY',
    headline: 'Purple Line construction blocking Route 1 crosswalks through May',
    summary: 'Three pedestrian crosswalks near campus are closed for Purple Line construction. Alternate routes add 10 minutes to walks from South Campus to Route 1 businesses.',
    stat: { icon: '\u{1F6A7}', text: '3 crosswalks closed for 6 weeks', tone: 'local' },
    actionHint: 'Report safety concern',
    rep: 'Purple Line Transit Partners',
    repTitle: 'Maryland Transit Administration',
    draft: 'Dear PLTP,\n\nThe closed crosswalks near UMD are forcing students into dangerous jaywalking situations. Please install temporary signalized crossings or provide shuttle service during construction.\n\nConcerned student',
    peer: '38 students near Route 1 also cared',
    prompts: ['Which crosswalks are closed?', 'When do they reopen?', 'Is there an alternate route?'],
    sources: [
      { title: 'PLTP \u00B7 Construction update', date: 'Apr 21' },
      { title: 'Diamondback \u00B7 Students frustrated by closures', date: 'Apr 22' },
    ],
    updatedAgo: '2d ago',
  },
  {
    id: 'card_22',
    type: 'campus',
    emoji: '\u{1F393}',
    chipLabel: 'UMD',
    headline: 'UMD dining workers vote to strike over wages, May 1 deadline',
    summary: 'AFSCME Local 1072 representing 400+ dining hall workers voted 92% in favor of a strike if contract talks fail. Workers demand $18/hr minimum (currently $14.50).',
    stat: { icon: '\u{1F4AA}', text: '92% voted to authorize strike', tone: 'campus' },
    actionHint: 'Sign solidarity letter',
    rep: 'VP of Admin & Finance',
    repTitle: 'UMD Administration',
    draft: 'Dear VP of Administration,\n\nI stand with UMD dining workers. $14.50/hr in 2026 is not a living wage in the DC metro area. Please negotiate in good faith and meet the $18/hr demand.\n\nA concerned student',
    peer: '51 students signed the solidarity letter',
    prompts: ['When would the strike start?', 'Which dining halls?', 'How can I help?'],
    sources: [
      { title: 'Diamondback \u00B7 Dining workers vote to strike', date: 'Apr 23' },
      { title: 'AFSCME \u00B7 Contract demands', date: 'Apr 20' },
    ],
    updatedAgo: '5h ago',
  },
];
```

---

## 4. Chat Scripts

The chat system has four layers, checked in order:

1. **Card-specific scripted replies** (`SCRIPTED`) -- hand-written answers tied to a specific card's prompt buttons. Keyed by card ID, then by prompt string.
2. **Global prompts** (`GLOBAL_PROMPTS`) -- suggested questions shown in the chat when no card is selected.
3. **Global replies** (`GLOBAL_REPLIES`) -- hand-written answers for the global prompts.
4. **Fallback reply** (`FALLBACK_REPLY`) -- returned when no scripted or global match is found.

### Scripted Coverage

Only a subset of cards have scripted replies. Cards without scripted entries fall through to the fallback.

| Card | Prompts with scripted replies |
|------|-------------------------------|
| `card_01` | "What's the timeline?", "How does this affect my rent?", "Who supports this?" (all 3 prompts covered) |
| `card_02` | "What should I bring?", "Will it be peaceful?" (2 of 3 prompts covered) |
| `card_05` | "When is the vote?", "How much do I get?" (2 of 3 prompts covered) |

All other cards (card_03, card_04, card_06--card_22) have no scripted replies and will return `FALLBACK_REPLY`.

### Lookup Logic

When a user taps a prompt button on a card:

1. Check `SCRIPTED[cardId][promptText]` -- if found, return that `ScriptedReply` (text + optional sources).
2. Check `GLOBAL_REPLIES[promptText]` -- if the prompt matches a global prompt, return that string.
3. Return `FALLBACK_REPLY`.

---

## 5. Complete Source: `data/chatScripts.ts`

```ts
import type { Source } from '@/types';

export const GLOBAL_PROMPTS = [
  'What\'s on my ballot?',
  'Any rallies this week?',
  'Explain the data center issue',
];

interface ScriptedReply {
  text: string;
  sources?: Source[];
}

export const SCRIPTED: Record<string, Record<string, ScriptedReply>> = {
  card_01: {
    'What\'s the timeline?': {
      text: 'The PG County Council imposed a 180-day moratorium starting March 1. That means the earliest a vote could happen is late August 2026. But public pressure during the comment period (open now through May 30) is when your voice matters most.',
      sources: [{ title: 'PG County Council \u00B7 Moratorium resolution', date: 'Mar 1' }],
    },
    'How does this affect my rent?': {
      text: 'Data centers are massive electricity consumers. The proposed facility would use 400-600 MW \u2014 enough to power 300,000 homes. BGE has warned that increased grid strain could lead to rate hikes of 15-30% for residential customers in PG County, including off-campus housing.',
    },
    'Who supports this?': {
      text: 'The developer (QTS Realty) and some county officials point to $500M in tax revenue and 100+ permanent jobs. But local residents, environmental groups, and most student organizations oppose it due to environmental and cost concerns.',
    },
  },
  card_02: {
    'What should I bring?': {
      text: 'Organizers recommend: water bottle, comfortable shoes, sunscreen, and a sign if you have one. Sign-making supplies will be available at 1:30pm. No glass containers. Emergency contacts posted at the info table.',
    },
    'Will it be peaceful?': {
      text: 'Yes \u2014 this is organized by CEEJH, a UMD research center. Faculty advisors will be present. UMPD has been notified and will be managing traffic. It\'s a permitted, peaceful demonstration.',
    },
  },
  card_05: {
    'When is the vote?': {
      text: 'The Senate is expected to vote the week of April 28. Sen. Van Hollen is a co-sponsor, so Maryland\'s delegation is likely to vote yes. The House version still needs committee markup.',
    },
    'How much do I get?': {
      text: 'If you currently receive Pell Grants, the maximum award would increase from $7,395 to $8,595 per year \u2014 that\'s $1,200 more. If you\'re not Pell-eligible, it doesn\'t directly affect you, but 34% of UMD undergrads receive some form of Pell.',
    },
  },
};

export const GLOBAL_REPLIES: Record<string, string> = {
  'What\'s on my ballot?': 'Based on your College Park address, here\'s what\'s coming up:\n\n\u2022 **PG County Council Primary** \u2014 June 24 (District 3, 3 candidates)\n\u2022 **Maryland Governor\'s race** \u2014 November 2026\n\u2022 **U.S. House MD-4** \u2014 November 2026\n\nEarly voting for the primary starts June 14. Want me to compare the District 3 candidates?',
  'Any rallies this week?': 'I found 2 events near campus this week:\n\n1. **Sunrise UMD Climate Strike** \u2014 Friday noon, McKeldin Mall (287 RSVPs)\n2. **Data Center Rally** \u2014 Saturday 2pm, Hornbake Plaza (403 RSVPs)\n\nBoth are student-organized and peaceful. Want to RSVP to either?',
  'Explain the data center issue': 'Here\'s the short version:\n\nQTS Realty wants to build a massive data center on the old Landover Mall site, 6 miles from campus. It would use as much electricity as 300,000 homes.\n\n**Why students care:** Potential 15-30% electricity rate hikes, air quality concerns, and the irony of CS students\' work powering the very infrastructure harming their community.\n\n**Where it stands:** PG County imposed a 180-day moratorium. 20,000+ petition signatures. Public comment open through May 30.',
};

export const FALLBACK_REPLY = 'That\'s a great question. Based on what I know about this issue, let me look into it and give you a detailed answer. In the meantime, you can check the sources linked on the card for primary information.';
```

---

## 6. Profile Data

The profile data file exports four constants used across the Profile and Wrap screens.

### `PROFILE` -- User identity

The demo user's basic info. Displayed on the Profile tab and used to personalize cards (e.g. "CS students" peer lines).

| Field | Value |
|-------|-------|
| `name` | Jordan |
| `major` | Computer Science |
| `year` | Sophomore |
| `dorm` | Hagerstown Hall |
| `avatar` | J (single letter used as avatar placeholder) |

### `WRAP_TOP_ISSUES` -- Engagement breakdown

Shows which issue categories the user has engaged with most. Each entry has a label, percentage, and color for the progress bar.

| Label | Percentage | Color |
|-------|-----------|-------|
| Housing & Zoning | 85% | #E63946 (red) |
| Environment & Energy | 72% | #22C55E (green) |
| Education & Campus | 58% | #3B82F6 (blue) |

### `WRAP_NEXT` -- Next steps checklist

Suggested actions the user hasn't completed yet.

| Action | Sub-text | Done? |
|--------|----------|-------|
| Send 2 drafted emails | To Councilmember Franklin & Del. Pena-Melnyk | No |
| Attend Saturday rally | Hornbake Plaza, 2pm -- 340 RSVPs | No |
| Check voter registration | PG County primary June 24 | No |

### `WRAP_REPS` -- Representatives contacted

Tracks which reps the user has already reached out to and how.

| Name | Title | Contact method |
|------|-------|----------------|
| Councilmember Franklin | PG County Council, D5 | emailed |
| Del. Pena-Melnyk | MD House, D21 | emailed |
| Sen. Van Hollen | U.S. Senate, MD | called |

---

## 7. Complete Source: `data/profile.ts`

```ts
export const PROFILE = {
  name: 'Jordan',
  major: 'Computer Science',
  year: 'Sophomore',
  dorm: 'Hagerstown Hall',
  avatar: 'J',
};

export const WRAP_TOP_ISSUES = [
  { label: 'Housing & Zoning', pct: 85, color: '#E63946' },
  { label: 'Environment & Energy', pct: 72, color: '#22C55E' },
  { label: 'Education & Campus', pct: 58, color: '#3B82F6' },
];

export const WRAP_NEXT = [
  { emoji: '\u{1F4E7}', label: 'Send 2 drafted emails', sub: 'To Councilmember Franklin & Del. Pe\u00F1a-Melnyk', done: false },
  { emoji: '\u{1F4C5}', label: 'Attend Saturday rally', sub: 'Hornbake Plaza, 2pm \u2014 340 RSVPs', done: false },
  { emoji: '\u{1F5F3}\uFE0F', label: 'Check voter registration', sub: 'PG County primary June 24', done: false },
];

export const WRAP_REPS = [
  { name: 'Councilmember Franklin', title: 'PG County Council, D5', tag: 'emailed' },
  { name: 'Del. Pe\u00F1a-Melnyk', title: 'MD House, D21', tag: 'emailed' },
  { name: 'Sen. Van Hollen', title: 'U.S. Senate, MD', tag: 'called' },
];
```

---

## 8. Categories

Categories define the filter chips on the Explore/Feed screen. Each category maps to a card `type` value.

| `id` | Emoji | Label | Matching card type |
|------|-------|-------|--------------------|
| `federal` | (capitol) | Federal | `federal` |
| `state` | (scroll) | Maryland | `state` |
| `local` | (pin) | PG County | `local` |
| `campus` | (grad cap) | UMD | `campus` |
| `rally` | (fist) | Rally | `rally` |
| `petition` | (writing hand) | Petition | `petition` |
| `election` | (ballot box) | Ballot | `election` |

The array is typed `as const` so TypeScript can infer literal types for the `id` field.

---

## 9. Complete Source: `data/categories.ts`

```ts
export const ALL_CATEGORIES = [
  { id: 'federal',  emoji: '\u{1F3DB}\uFE0F', label: 'Federal' },
  { id: 'state',    emoji: '\u{1F4DC}', label: 'Maryland' },
  { id: 'local',    emoji: '\u{1F4CD}', label: 'PG County' },
  { id: 'campus',   emoji: '\u{1F393}', label: 'UMD' },
  { id: 'rally',    emoji: '\u270A', label: 'Rally' },
  { id: 'petition', emoji: '\u270D\uFE0F', label: 'Petition' },
  { id: 'election', emoji: '\u{1F5F3}\uFE0F', label: 'Ballot' },
] as const;
```

---

## 10. How to Add New Cards

### Step 1: Pick a type

Choose from the 7 existing types: `petition`, `rally`, `state`, `campus`, `federal`, `local`, `election`. If you need a new type, also add it to `data/categories.ts` and update the `Card` type in `@/types`.

### Step 2: Add the card object to `data/cards.ts`

Append a new object to the `CARDS` array. Use the next sequential ID (e.g. `card_23`). Every card **must** include all universal fields:

```ts
{
  id: 'card_23',
  type: 'campus',                         // one of the 7 types
  emoji: '\u{1F393}',                     // matches the category emoji
  chipLabel: 'UMD',                       // matches the category label (uppercase)
  headline: 'Your headline here',
  summary: 'A 1-3 sentence summary.',
  stat: { icon: '...', text: '...', tone: 'campus' },  // omit for rally cards
  actionHint: 'Button label',
  rep: 'Rep Name',
  repTitle: 'Rep Title',
  draft: 'Pre-written message...',
  peer: 'N students also cared',
  prompts: ['Question 1?', 'Question 2?', 'Question 3?'],
  sources: [
    { title: 'Source \u00B7 Article title', date: 'Mon DD' },
  ],
  updatedAgo: '1h ago',
}
```

For **rally** cards, add the event-specific fields (`when`, `where`, `weather`, `going`, `majorGoing`) and omit `stat`.

For cards that need an expanded details section, add the optional `detailsBody` string.

### Step 3: Add scripted chat replies (optional)

If you want the chat to give hand-written answers for your card's prompts, add an entry to `SCRIPTED` in `data/chatScripts.ts`:

```ts
card_23: {
  'Question 1?': {
    text: 'Your scripted answer here.',
    sources: [{ title: 'Source', date: 'Apr 24' }],  // optional
  },
},
```

Cards without scripted entries will return `FALLBACK_REPLY` for all prompts.

### Step 4: Verify

- The card appears in the swipe feed.
- The card is filterable by its category chip on the Explore screen.
- Tapping prompts in chat returns either scripted or fallback responses.
- The draft message renders in the action sheet.

### Adding a new category

If none of the 7 types fit, add a new entry to `ALL_CATEGORIES` in `data/categories.ts` and update the `Card` type definition in `@/types` to include the new type string.
