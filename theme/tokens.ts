export const PS_TOKENS = {
  brand: '#E63946',
  brandDeep: '#C2282C',
  brandAccent: '#FFD23F',

  ink: '#0A0A0A',
  ink2: '#6B6B6B',
  ink3: '#A0A0A0',

  bg: '#FAFAF7',
  card: '#FFFFFF',
  tint: '#F5F4EE',

  success: '#22C55E',
  danger: '#EF4444',
  share: '#3B82F6',

  chip: {
    federal:  '#7C3AED',
    state:    '#E63946',
    local:    '#F59E0B',
    campus:   '#0A0A0A',
    rally:    '#EC4899',
    petition: '#10B981',
    election: '#06B6D4',
  } as Record<string, string>,

  dividerWarm: '#E5E3DB',
  borderCool:  '#F0EEE6',

  overlay: 'rgba(0,0,0,0.42)',
  sheetShadow: 'rgba(0,0,0,0.15)',
} as const;
