import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';

interface SectionLabelProps {
  children: string;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...TEXT.sectionLabel,
    color: PS_TOKENS.ink3,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 20,
  },
});
