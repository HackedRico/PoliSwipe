import type { Comment, EmojiKey } from '@/types';

/**
 * Seed comment data keyed by cardId.
 * In production this comes from the API; for now it's static.
 */
export const COMMENTS: Record<string, Comment[]> = {
  // ── card_01: Data center petition ──────────────────────────
  card_01: [
    {
      id: 'c1-1',
      cardId: 'card_01',
      authorId: 'u-001',
      displayName: 'Verified UMD student',
      major: 'ENVS',
      year: "'26",
      verified: false,
      body: 'The BGE rate modeling is buried on page 47 of the environmental impact study. They project a 28% residential rate hike within 18 months of the data center going online. That\u2019s not speculation \u2014 it\u2019s their own numbers.',
      createdAt: '2026-04-24T10:00:00Z',
      reactions: { '\ud83d\udc4d': 84, '\u2764\ufe0f': 3, '\ud83e\udd14': 7, '\ud83d\ude24': 31, '\u2728': 12 },
      myReactions: [],
      replies: [
        {
          id: 'c1-1a',
          cardId: 'card_01',
          parentId: 'c1-1',
          authorId: 'u-002',
          displayName: 'Verified UMD student',
          major: 'ECON',
          year: "'25",
          verified: false,
          body: 'Source? I want to cite this in my email to Councilmember Franklin.',
          createdAt: '2026-04-24T11:00:00Z',
          reactions: { '\ud83d\udc4d': 9, '\u2764\ufe0f': 0, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 0 },
          myReactions: [],
          replies: [
            {
              id: 'c1-1a-i',
              cardId: 'card_01',
              parentId: 'c1-1a',
              authorId: 'u-001',
              displayName: 'Verified UMD student',
              major: 'ENVS',
              year: "'26",
              verified: false,
              body: 'PG County Council docket, CB-92-2025, Appendix D. Direct PDF link is on the council website under "pending legislation." Table 4.3.',
              createdAt: '2026-04-24T11:15:00Z',
              reactions: { '\ud83d\udc4d': 6, '\u2764\ufe0f': 0, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 18 },
              myReactions: [],
            },
          ],
        },
        {
          id: 'c1-1b',
          cardId: 'card_01',
          parentId: 'c1-1',
          authorId: 'u-org-sunrise',
          displayName: 'Sunrise UMD',
          verified: true,
          badge: 'Organizer',
          body: 'We\u2019re tabling at Stamp Thursday 11am\u20132pm with email templates and rate impact fact sheets. Bring your laptop \u2014 we\u2019ll help you draft a comment on the spot.',
          createdAt: '2026-04-24T12:00:00Z',
          reactions: { '\ud83d\udc4d': 14, '\u2764\ufe0f': 52, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 8 },
          myReactions: [],
        },
      ],
    },
    {
      id: 'c1-2',
      cardId: 'card_01',
      authorId: 'u-003',
      displayName: 'Verified UMD student',
      major: 'CS',
      year: "'27",
      dorm: 'South Campus Commons',
      verified: false,
      body: 'My landlord already sent a notice about "anticipated utility adjustments" for next lease cycle. This is already being priced in before it\u2019s even approved.',
      createdAt: '2026-04-24T08:00:00Z',
      reactions: { '\ud83d\udc4d': 41, '\u2764\ufe0f': 2, '\ud83e\udd14': 5, '\ud83d\ude24': 67, '\u2728': 0 },
      myReactions: [],
      replies: [
        {
          id: 'c1-2a',
          cardId: 'card_01',
          parentId: 'c1-2',
          authorId: 'u-004',
          displayName: 'Verified UMD student',
          major: 'GVPT',
          year: "'26",
          verified: false,
          body: 'Same here in College Park Towers. They\u2019re using the data center as cover for a rent hike they were planning anyway. We should track which landlords are doing this.',
          createdAt: '2026-04-24T08:30:00Z',
          reactions: { '\ud83d\udc4d': 23, '\u2764\ufe0f': 0, '\ud83e\udd14': 0, '\ud83d\ude24': 14, '\u2728': 5 },
          myReactions: [],
        },
      ],
    },
    {
      id: 'c1-3',
      cardId: 'card_01',
      authorId: 'u-org-diamondback',
      displayName: 'The Diamondback',
      verified: true,
      badge: 'Student press',
      body: 'Our investigation found QTS Realty has donated $180K to PG County Council campaigns since 2023. Full breakdown in tomorrow\u2019s edition.',
      createdAt: '2026-04-24T14:00:00Z',
      reactions: { '\ud83d\udc4d': 97, '\u2764\ufe0f': 12, '\ud83e\udd14': 8, '\ud83d\ude24': 0, '\u2728': 45 },
      myReactions: [],
    },
  ],

  // ── card_02: Rally at Hornbake ─────────────────────────────
  card_02: [
    {
      id: 'c2-1',
      cardId: 'card_02',
      authorId: 'u-org-ceejh',
      displayName: 'CEEJH',
      verified: true,
      badge: 'Organizer',
      body: 'Sign-making supplies available at 1:30pm by the fountain. We have extra poster board. Rain plan: move to Hornbake lobby. Check our Instagram for live updates.',
      createdAt: '2026-04-24T09:00:00Z',
      reactions: { '\ud83d\udc4d': 33, '\u2764\ufe0f': 28, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 11 },
      myReactions: [],
      replies: [
        {
          id: 'c2-1a',
          cardId: 'card_02',
          parentId: 'c2-1',
          authorId: 'u-005',
          displayName: 'Verified UMD student',
          major: 'ARCH',
          year: "'27",
          verified: false,
          body: 'Can I bring my dog? He\u2019s got a tiny protest sign from last time lol',
          createdAt: '2026-04-24T09:30:00Z',
          reactions: { '\ud83d\udc4d': 18, '\u2764\ufe0f': 42, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 0 },
          myReactions: [],
          replies: [
            {
              id: 'c2-1a-i',
              cardId: 'card_02',
              parentId: 'c2-1a',
              authorId: 'u-org-ceejh',
              displayName: 'CEEJH',
              verified: true,
              badge: 'Organizer',
              body: 'Yes! Leashed pets welcome. Protest dogs are peak morale.',
              createdAt: '2026-04-24T09:45:00Z',
              reactions: { '\ud83d\udc4d': 8, '\u2764\ufe0f': 61, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 5 },
              myReactions: [],
            },
          ],
        },
      ],
    },
    {
      id: 'c2-2',
      cardId: 'card_02',
      authorId: 'u-006',
      displayName: 'Verified UMD student',
      major: 'CMSC',
      year: "'26",
      verified: false,
      body: 'Anyone coming from South Campus? Trying to get a group together from the bus stop at Regents Dr. Thinking we meet at 1:40.',
      createdAt: '2026-04-24T10:30:00Z',
      reactions: { '\ud83d\udc4d': 15, '\u2764\ufe0f': 0, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 0 },
      myReactions: [],
      replies: [
        {
          id: 'c2-2a',
          cardId: 'card_02',
          parentId: 'c2-2',
          authorId: 'u-007',
          displayName: 'Verified UMD student',
          major: 'MATH',
          year: "'28",
          verified: false,
          body: 'I\u2019m in! I\u2019ll be at the bus stop. I\u2019ll have a red backpack.',
          createdAt: '2026-04-24T10:45:00Z',
          reactions: { '\ud83d\udc4d': 4, '\u2764\ufe0f': 2, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 0 },
          myReactions: [],
        },
      ],
    },
  ],

  // ── card_03: HB538 housing bill ────────────────────────────
  card_03: [
    {
      id: 'c3-1',
      cardId: 'card_03',
      authorId: 'u-008',
      displayName: 'Verified UMD student',
      major: 'URSP',
      year: "'25",
      verified: false,
      body: 'I wrote my thesis on this. The key thing people miss: HB538 doesn\u2019t force duplexes, it removes the ban. Cities can still set density, height, and parking requirements. It\u2019s a floor, not a ceiling.',
      createdAt: '2026-04-24T07:00:00Z',
      reactions: { '\ud83d\udc4d': 73, '\u2764\ufe0f': 5, '\ud83e\udd14': 2, '\ud83d\ude24': 0, '\u2728': 38 },
      myReactions: [],
      replies: [
        {
          id: 'c3-1a',
          cardId: 'card_03',
          parentId: 'c3-1',
          authorId: 'u-009',
          displayName: 'Verified UMD student',
          major: 'ECON',
          year: "'27",
          verified: false,
          body: 'This is actually really helpful context. Everyone in my group chat was freaking out thinking they\u2019re building apartments in their neighborhoods.',
          createdAt: '2026-04-24T07:30:00Z',
          reactions: { '\ud83d\udc4d': 19, '\u2764\ufe0f': 0, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 0 },
          myReactions: [],
        },
      ],
    },
    {
      id: 'c3-2',
      cardId: 'card_03',
      authorId: 'u-org-sga',
      displayName: 'SGA',
      verified: true,
      badge: 'Verified org',
      body: 'SGA passed a resolution supporting HB538 last semester. If you want to cite student government support in your email, reference Resolution 24-031.',
      createdAt: '2026-04-24T11:00:00Z',
      reactions: { '\ud83d\udc4d': 28, '\u2764\ufe0f': 4, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 15 },
      myReactions: [],
    },
  ],
};

/** Count all comments recursively (top-level + all nested replies). */
export function countComments(comments: Comment[]): number {
  let total = 0;
  for (const c of comments) {
    total += 1;
    if (c.replies) total += countComments(c.replies);
  }
  return total;
}

/** Sum all reactions on a single comment. */
export function totalReactions(c: Comment): number {
  return Object.values(c.reactions).reduce((a, b) => a + b, 0);
}

/** Find the top-scoring top-level comment for a card. */
export function topComment(comments: Comment[]): Comment | undefined {
  if (comments.length === 0) return undefined;
  return comments.reduce((best, c) =>
    totalReactions(c) > totalReactions(best) ? c : best
  );
}

/** Get the most-used emoji on a comment. */
export function topEmoji(c: Comment): EmojiKey | undefined {
  let best: EmojiKey | undefined;
  let bestCount = 0;
  for (const [emoji, count] of Object.entries(c.reactions) as [EmojiKey, number][]) {
    if (count > bestCount) {
      best = emoji;
      bestCount = count;
    }
  }
  return best;
}

/** Get badge info for a card: count + top reaction emoji. */
export function getCommentBadge(cardId: string): { count: number; topReactionEmoji?: EmojiKey } | null {
  const comments = COMMENTS[cardId];
  if (!comments || comments.length === 0) return null;
  const count = countComments(comments);
  const top = topComment(comments);
  const emoji = top ? topEmoji(top) : undefined;
  return { count, topReactionEmoji: emoji };
}
