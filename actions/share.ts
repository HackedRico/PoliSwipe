import { Share } from 'react-native';
import type { Card } from '@/types';

export function shareCard(card: Card) {
  return Share.share({
    message: `${card.headline}\n\n${card.summary}\n\nvia PoliSwipe`,
    title: card.headline,
  });
}
