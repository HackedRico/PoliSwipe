import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { CardFace } from './CardFace';
import { useSwipeGesture } from './useSwipeGesture';
import type { Card, SwipeDir } from '@/types';

interface SwipeCardProps {
  card: Card;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (c: Card, d: SwipeDir) => void;
  onMoreDetails: (c: Card) => void;
  onComments?: (c: Card) => void;
}

export function SwipeCard({
  card,
  isTop,
  stackIndex,
  onSwipe,
  onMoreDetails,
  onComments,
}: SwipeCardProps) {
  const { pan, tx, ty, pressing } = useSwipeGesture(card, isTop, onSwipe);

  const style = useAnimatedStyle(() => {
    if (!isTop) {
      return {
        transform: [
          { translateY: stackIndex * 10 },
          { scale: 1 - stackIndex * 0.04 },
        ],
      };
    }
    return {
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { rotate: `${tx.value * 0.05}deg` },
        { scale: 1 - pressing.value * 0.015 },
      ],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10 - stackIndex,
          },
          style,
        ]}
      >
        <CardFace
          card={card}
          tx={tx}
          ty={ty}
          isTop={isTop}
          onMoreDetails={onMoreDetails}
          onComments={onComments}
        />
      </Animated.View>
    </GestureDetector>
  );
}
