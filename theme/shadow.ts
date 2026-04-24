import { Platform } from 'react-native';

export const shadow = {
  card: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.10, shadowRadius: 24 },
    android: { elevation: 8 },
  }),
  button: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
    android: { elevation: 2 },
  }),
  sheet: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -12 }, shadowOpacity: 0.15, shadowRadius: 24 },
    android: { elevation: 16 },
  }),
  softRow: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    android: { elevation: 1 },
  }),
};
