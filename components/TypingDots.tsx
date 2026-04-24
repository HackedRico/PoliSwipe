import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

const DOT_COUNT = 3;
const DURATION = 1200;
const STAGGER = 150;

export default function TypingDots() {
  const anims = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.2)),
  ).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * STAGGER),
          Animated.timing(anim, {
            toValue: 1,
            duration: DURATION / 2,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: DURATION / 2,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    const parallel = Animated.parallel(animations);
    parallel.start();

    return () => {
      parallel.stop();
    };
  }, [anims]);

  return (
    <View style={styles.row}>
      {anims.map((anim, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PS_TOKENS.ink3,
  },
});
