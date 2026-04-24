import Constants from 'expo-constants';
import type { Card, ChatMessage } from '@/types';

function getBackendUrl(): string {
  // In Expo Go, debuggerHost gives us the dev machine's LAN IP
  const host = Constants.expoConfig?.hostUri?.split(':')[0]
    ?? Constants.manifest2?.extra?.expoGo?.debuggerHost?.split(':')[0]
    ?? 'localhost';
  return `http://${host}:8000`;
}

export async function fetchAIDraft(card: Card): Promise<string | null> {
  try {
    const resp = await fetch(`${getBackendUrl()}/api/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: card.headline,
        summary: card.summary,
        rep: card.rep,
        rep_title: card.repTitle,
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.draft ?? null;
  } catch {
    return null;
  }
}

export async function fetchAIChat(
  message: string,
  card: Card | null,
  history: ChatMessage[],
): Promise<string | null> {
  try {
    const resp = await fetch(`${getBackendUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        card_headline: card?.headline ?? null,
        card_summary: card?.summary ?? null,
        history: history.slice(-4).map(m => ({ role: m.role, text: m.text })),
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.reply ?? null;
  } catch {
    return null;
  }
}
