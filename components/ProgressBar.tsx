import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  pct: number;
  color: string;
  height?: number;
}

export default function ProgressBar({ pct, color, height = 6 }: ProgressBarProps) {
  return (
    <View style={[styles.outer, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.inner,
          {
            width: `${Math.min(Math.max(pct, 0), 100)}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  inner: {
    height: '100%',
  },
});
