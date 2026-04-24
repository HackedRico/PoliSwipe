import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';

const STAMP_BORDER = 4;
const STAMP_RADIUS = 12;
const STAMP_PH = 22;
const STAMP_PV = 10;
const STAMP_FONT = 34;
const STAMP_LETTER_SPACING = 2;
const ROTATION_DEG = 14;
const STRENGTH_DIVISOR = 120;
const MAX_TINT_OPACITY = 0.72;

interface SwipeOverlayProps {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
}

export function SwipeOverlay({ tx, ty }: SwipeOverlayProps) {
  const strength = useDerivedValue(() => {
    const absX = Math.abs(tx.value);
    const absY = Math.abs(ty.value);
    return Math.min(1, Math.max(absX, absY) / STRENGTH_DIVISOR);
  });

  const direction = useDerivedValue(() => {
    const absX = Math.abs(tx.value);
    const absY = Math.abs(ty.value);
    if (absX < 5 && absY < 5) return 'none';
    if (absX > absY) return tx.value > 0 ? 'right' : 'left';
    return ty.value < 0 ? 'up' : 'down';
  });

  const tintStyle = useAnimatedStyle(() => {
    let color: string;
    switch (direction.value) {
      case 'right':
        color = '#22C55E';
        break;
      case 'left':
        color = '#EF4444';
        break;
      case 'up':
        color = '#3B82F6';
        break;
      case 'down':
        color = '#111111';
        break;
      default:
        color = '#000000';
        break;
    }
    return {
      backgroundColor: color,
      opacity: strength.value * MAX_TINT_OPACITY,
    };
  });

  const stampStyle = useAnimatedStyle(() => {
    const dir = direction.value;
    const s = strength.value;
    const scale = 0.6 + s * 0.4;

    let rotation = 0;
    let top: number | undefined;
    let left: number | undefined;
    let right: number | undefined;
    let alignSelf: 'flex-start' | 'flex-end' | 'center' = 'center';

    if (dir === 'right') {
      rotation = -ROTATION_DEG;
      top = 40;
      left = 24;
      alignSelf = 'flex-start';
    } else if (dir === 'left') {
      rotation = ROTATION_DEG;
      top = 40;
      right = 24;
      alignSelf = 'flex-end';
    }

    return {
      transform: [{ rotate: `${rotation}deg` }, { scale }],
      opacity: s,
      ...(top !== undefined && { marginTop: top }),
      ...(left !== undefined && { marginLeft: left }),
      ...(right !== undefined && { marginRight: right }),
      alignSelf,
    };
  });

  // Render all four stamps and control their visibility
  const rightStampOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'right' ? 1 : 0,
  }));

  const leftStampOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'left' ? 1 : 0,
  }));

  const upStampOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 1 : 0,
  }));

  const downStampOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'down' ? 1 : 0,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.container]}
    >
      {/* Full-bleed tint */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.tint, tintStyle]}
      />

      {/* Stamp container */}
      <Animated.View style={[styles.stampPositioner, stampStyle]}>
        {/* CARE stamp - right swipe */}
        <Animated.View style={[styles.stampRow, rightStampOpacity]}>
          <Animated.Text style={styles.stampEmoji}>{'\u2764\uFE0F'}</Animated.Text>
          <Animated.Text style={styles.stampText}>CARE</Animated.Text>
        </Animated.View>

        {/* SKIP stamp - left swipe */}
        <Animated.View
          style={[styles.stampRow, styles.stampAbsolute, leftStampOpacity]}
        >
          <Animated.Text style={styles.stampEmoji}>{'\u2715'}</Animated.Text>
          <Animated.Text style={styles.stampText}>SKIP</Animated.Text>
        </Animated.View>

        {/* SHARE stamp - up swipe */}
        <Animated.View
          style={[styles.stampRow, styles.stampAbsolute, upStampOpacity]}
        >
          <Animated.Text style={styles.stampEmoji}>{'\u2191'}</Animated.Text>
          <Animated.Text style={styles.stampText}>SHARE</Animated.Text>
        </Animated.View>

        {/* ASK stamp - down swipe */}
        <Animated.View
          style={[styles.stampRow, styles.stampAbsolute, downStampOpacity]}
        >
          <Animated.Text style={styles.stampEmoji}>{'\u2304'}</Animated.Text>
          <Animated.Text style={styles.stampText}>ASK</Animated.Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  tint: {
    borderRadius: 24,
  },
  stampPositioner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: STAMP_BORDER,
    borderColor: '#FFFFFF',
    borderRadius: STAMP_RADIUS,
    paddingVertical: STAMP_PV,
    paddingHorizontal: STAMP_PH,
    gap: 8,
  },
  stampAbsolute: {
    position: 'absolute',
  },
  stampEmoji: {
    fontSize: STAMP_FONT - 6,
    color: '#FFFFFF',
  },
  stampText: {
    fontWeight: '900',
    fontSize: STAMP_FONT,
    color: '#FFFFFF',
    letterSpacing: STAMP_LETTER_SPACING,
  },
});
