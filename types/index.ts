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
