import * as Linking from 'expo-linking';
import type { Card } from '@/types';

export async function emailRep(card: Card, toAddress = 'rep@example.gov') {
  const subject = encodeURIComponent(`Re: ${card.headline}`);
  const body    = encodeURIComponent(card.draft);
  const url = `mailto:${toAddress}?subject=${subject}&body=${body}`;
  const ok = await Linking.canOpenURL(url);
  if (ok) Linking.openURL(url);
}
