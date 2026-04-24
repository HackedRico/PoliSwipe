import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import type { Card } from '@/types';

export async function addRallyToCalendar(card: Card) {
  if (!card.when?.isoStart) return;
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return;

  let calendarId: string;
  if (Platform.OS === 'ios') {
    const def = await Calendar.getDefaultCalendarAsync();
    calendarId = def.id;
  } else {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const def = calendars.find(c => c.isPrimary) || calendars[0];
    calendarId = def.id;
  }

  await Calendar.createEventAsync(calendarId, {
    title: card.headline,
    startDate: new Date(card.when.isoStart),
    endDate:   new Date(card.when.isoEnd ?? card.when.isoStart),
    location:  card.where?.address,
    notes:     card.summary,
    alarms:    [{ relativeOffset: -30 }],
  });
}
