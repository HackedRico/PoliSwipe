import { Platform } from 'react-native';

const systemFont = Platform.OS === 'ios' ? 'System' : 'Roboto';

export const FONT = {
  inter500: systemFont,
  inter700: systemFont,
  inter800: systemFont,
  inter900: systemFont,
  mono700:  Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace',
};

export const TEXT = {
  cardHeadline: { fontFamily: FONT.inter800, fontSize: 28, lineHeight: 33, letterSpacing: -0.9, fontWeight: '800' as const },
  sheetTitle:   { fontFamily: FONT.inter900, fontSize: 24, lineHeight: 26, letterSpacing: -0.72, fontWeight: '900' as const },
  wrapHuge:     { fontFamily: FONT.inter900, fontSize: 120, lineHeight: 110, letterSpacing: -8, fontWeight: '900' as const },
  wrapSection:  { fontFamily: FONT.inter900, fontSize: 32, lineHeight: 34, letterSpacing: -1.12, fontWeight: '900' as const },

  cardSummary:  { fontFamily: FONT.inter500, fontSize: 15, lineHeight: 22, letterSpacing: -0.16, fontWeight: '500' as const },
  detailsBody:  { fontFamily: FONT.inter500, fontSize: 15, lineHeight: 23, letterSpacing: -0.075, fontWeight: '500' as const },
  chatBody:     { fontFamily: FONT.inter500, fontSize: 13.5, lineHeight: 20, fontWeight: '500' as const },

  chip:         { fontFamily: FONT.inter800, fontSize: 10.5, letterSpacing: 0.95, fontWeight: '800' as const },
  sectionLabel: { fontFamily: FONT.inter800, fontSize: 10.5, letterSpacing: 1.26, fontWeight: '800' as const },
  factLabel:    { fontFamily: FONT.inter800, fontSize: 10.5, letterSpacing: 1.05, fontWeight: '800' as const },
  buttonLabel:  { fontFamily: FONT.inter800, fontSize: 15, letterSpacing: -0.15, fontWeight: '800' as const },
  actionHint:   { fontFamily: FONT.inter500, fontSize: 12, fontWeight: '500' as const },
};
