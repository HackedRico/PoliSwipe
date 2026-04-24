import * as Haptics from 'expo-haptics';

export function useHaptic() {
  return {
    care:  () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    skip:  () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    share: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    ask:   () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    tap:   () => Haptics.selectionAsync(),
  };
}
