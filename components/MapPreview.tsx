import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

export default function MapPreview() {
  return (
    <View style={styles.root}>
      {/* Park blob */}
      <View style={styles.park} />

      {/* Horizontal roads */}
      <View style={[styles.hRoad, { top: '30%' }]} />
      <View style={[styles.hRoad, { top: '65%' }]} />

      {/* Vertical road */}
      <View style={[styles.vRoad, { left: '62%' }]} />

      {/* Pin */}
      <View style={styles.pinWrap}>
        <View style={styles.pin}>
          <Text style={styles.pinEmoji}>{'\u270A'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 118,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E8F0E5',
    position: 'relative',
  },
  park: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 78,
    height: 54,
    borderRadius: 24,
    backgroundColor: '#C3DDB2',
  },
  hRoad: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-1deg' }],
  },
  vRoad: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#FFFFFF',
  },
  pinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PS_TOKENS.brand,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinEmoji: {
    fontSize: 12,
  },
});
