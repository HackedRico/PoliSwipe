import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

interface ActionButtonsProps {
  onLeft: () => void;
  onShare: () => void;
  onRight: () => void;
  disabled?: boolean;
}

export default function ActionButtons({
  onLeft,
  onShare,
  onRight,
  disabled,
}: ActionButtonsProps) {
  return (
    <View style={styles.row} pointerEvents={disabled ? 'none' : 'auto'}>
      {/* Skip */}
      <View style={styles.btnWrap}>
        <Pressable
          style={[
            styles.circle,
            styles.skipCircle,
            {
              ...Platform.select({
                ios: { shadowColor: PS_TOKENS.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 14 },
                android: { elevation: 6 },
              }),
            },
          ]}
          onPress={onLeft}
        >
          <Text style={[styles.glyph, { color: PS_TOKENS.danger }]}>{'X'}</Text>
        </Pressable>
        <Text style={[styles.label, { color: PS_TOKENS.danger }]}>SKIP</Text>
      </View>

      {/* Share */}
      <View style={styles.btnWrap}>
        <Pressable
          style={[
            styles.circle,
            styles.shareCircle,
            {
              ...Platform.select({
                ios: { shadowColor: PS_TOKENS.share, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 14 },
                android: { elevation: 6 },
              }),
            },
          ]}
          onPress={onShare}
        >
          <Text style={[styles.glyph, { color: PS_TOKENS.share }]}>{'\u2191'}</Text>
        </Pressable>
        <Text style={[styles.label, { color: PS_TOKENS.share }]}>SHARE</Text>
      </View>

      {/* Care */}
      <View style={styles.btnWrap}>
        <Pressable
          style={[
            styles.circle,
            styles.careCircle,
            {
              ...Platform.select({
                ios: { shadowColor: PS_TOKENS.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 14 },
                android: { elevation: 6 },
              }),
            },
          ]}
          onPress={onRight}
        >
          <Text style={[styles.careGlyph, { color: PS_TOKENS.success }]}>{'\u2665'}</Text>
        </Pressable>
        <Text style={[styles.label, { color: PS_TOKENS.success }]}>CARE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 28,
    paddingVertical: 14,
  },
  btnWrap: {
    alignItems: 'center',
  },
  circle: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: PS_TOKENS.danger,
  },
  shareCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: PS_TOKENS.share,
  },
  careCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: PS_TOKENS.success,
  },
  glyph: {
    fontSize: 24,
    fontWeight: '700',
  },
  careGlyph: {
    fontSize: 26,
    fontWeight: '700',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 6,
  },
});
