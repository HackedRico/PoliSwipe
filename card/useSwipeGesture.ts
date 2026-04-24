import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Card, SwipeDir } from '@/types';

const THRESHOLD = 90;
const FLY_X = 600;
const FLY_Y = 700;
const DURATION = 280;

export function useSwipeGesture(
  card: Card,
  isTop: boolean,
  onSwipe: (c: Card, d: SwipeDir) => void,
) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const pressing = useSharedValue(0);

  const triggerSwipe = (dir: SwipeDir) => {
    if (dir === 'right')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (dir === 'left')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwipe(card, dir);
  };

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onBegin(() => {
      pressing.value = withTiming(1, { duration: 120 });
    })
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onFinalize((e) => {
      pressing.value = withTiming(0, { duration: 120 });
      const absX = Math.abs(e.translationX);
      const absY = Math.abs(e.translationY);

      if (absX < THRESHOLD && absY < THRESHOLD) {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        return;
      }

      let dir: SwipeDir;
      if (absX > absY) dir = e.translationX > 0 ? 'right' : 'left';
      else dir = e.translationY < 0 ? 'up' : 'down';

      if (dir === 'down') {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        runOnJS(triggerSwipe)('down');
      } else {
        const tX = dir === 'right' ? FLY_X : dir === 'left' ? -FLY_X : 0;
        const tY = dir === 'up' ? -FLY_Y : 0;
        tx.value = withTiming(tX, { duration: DURATION });
        ty.value = withTiming(tY, { duration: DURATION }, (fin) => {
          if (fin) runOnJS(triggerSwipe)(dir);
        });
      }
    });

  return { pan, tx, ty, pressing };
}
