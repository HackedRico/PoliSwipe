export type CardType =
  | 'federal' | 'state' | 'local' | 'campus'
  | 'rally' | 'petition' | 'election';

export interface Source {
  title: string;
  date: string;
  url?: string;
}

export interface CardWhen  { dateLabel: string; time: string; isoStart?: string; isoEnd?: string }
export interface CardWhere { place: string; address: string; walkMin: number; lat?: number; lng?: number }
export interface CardWeather { icon: string; temp: string; desc: string }
export interface CardStat  { icon: string; text: string; tone: CardType }

export interface Card {
  id: string;
  type: CardType;
  emoji: string;
  chipLabel: string;
  headline: string;
  summary: string;
  stat?: CardStat;
  when?: CardWhen;
  where?: CardWhere;
  weather?: CardWeather;
  going?: number;
  majorGoing?: number;
  actionHint: string;
  rep: string;
  repTitle: string;
  draft: string;
  peer: string;
  prompts: string[];
  sources: Source[];
  detailsBody?: string;
  updatedAgo?: string;
}

export type SwipeDir = 'left' | 'right' | 'up' | 'down';

export interface SavedItem { card: Card; savedAtISO: string; sent: boolean }

export type PostType = 'rally' | 'petition' | 'election' | 'discussion';
export interface PostDraft {
  type: PostType; title: string; summary: string;
  when?: string; where?: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  sources?: Source[];
}

// --- Community Takes (Comments) ---

export type EmojiKey = '\ud83d\udc4d' | '\u2764\ufe0f' | '\ud83e\udd14' | '\ud83d\ude24' | '\u2728';

export type OrgBadge = 'Organizer' | 'Student press' | 'UMD office' | 'Verified org';

export interface Comment {
  id: string;
  cardId: string;
  parentId?: string;
  authorId: string;
  displayName: string;
  major?: string;
  year?: string;
  dorm?: string;
  verified: boolean;
  badge?: OrgBadge;
  body: string;
  createdAt: string;
  reactions: Record<EmojiKey, number>;
  myReactions: EmojiKey[];
  replies?: Comment[];
  removed?: boolean;
}
