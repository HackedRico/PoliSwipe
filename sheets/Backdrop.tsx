import { BottomSheetBackdropProps, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

export const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.42}
    pressBehavior="close"
  />
);
