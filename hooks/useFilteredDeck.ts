import { useMemo } from 'react';
import { CARDS } from '@/data/cards';
import type { Card, CardType } from '@/types';

export function useFilteredDeck(filters: CardType[]): Card[] {
  return useMemo(() => (
    filters.length === 0 ? CARDS : CARDS.filter(c => filters.includes(c.type))
  ), [filters]);
}
