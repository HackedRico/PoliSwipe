import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Backdrop } from './Backdrop';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import type { PostDraft, PostType } from '@/types';

interface PostSheetProps {
  onSubmit: (d: PostDraft) => void;
}

interface PostTypeOption {
  type: PostType;
  emoji: string;
  title: string;
  subtitle: string;
}

const POST_TYPES: PostTypeOption[] = [
  { type: 'rally', emoji: '\u270A', title: 'Rally / event', subtitle: 'Protest, walkout, teach-in' },
  { type: 'petition', emoji: '\u270D\uFE0F', title: 'Petition', subtitle: 'Signatures for a cause' },
  { type: 'election', emoji: '\u{1F5F3}\uFE0F', title: 'Campus referendum', subtitle: 'SGA / student vote' },
  { type: 'discussion', emoji: '\u{1F4AC}', title: 'Heads-up post', subtitle: 'Bill or news to flag' },
];

const PostSheet = forwardRef<BottomSheetModal, PostSheetProps>(
  ({ onSubmit }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [selectedType, setSelectedType] = useState<PostTypeOption | null>(null);
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [when, setWhen] = useState('');
    const [where, setWhere] = useState('');

    const resetForm = useCallback(() => {
      setStep(0);
      setSelectedType(null);
      setTitle('');
      setSummary('');
      setWhen('');
      setWhere('');
    }, []);

    const handleDismiss = useCallback(() => {
      resetForm();
    }, [resetForm]);

    const handleSelectType = useCallback((opt: PostTypeOption) => {
      setSelectedType(opt);
      setStep(1);
    }, []);

    const handleSubmit = useCallback(() => {
      if (!selectedType || !title.trim() || !summary.trim()) return;

      const draft: PostDraft = {
        type: selectedType.type,
        title: title.trim(),
        summary: summary.trim(),
      };
      if (
        (selectedType.type === 'rally' || selectedType.type === 'election') &&
        when.trim()
      ) {
        draft.when = when.trim();
      }
      if (
        (selectedType.type === 'rally' || selectedType.type === 'election') &&
        where.trim()
      ) {
        draft.where = where.trim();
      }

      onSubmit(draft);
      setStep(2);
    }, [selectedType, title, summary, when, where, onSubmit]);

    const handleDone = useCallback(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const canSubmit = title.trim().length > 0 && summary.trim().length > 0;

    const showWhenWhere =
      selectedType?.type === 'rally' || selectedType?.type === 'election';

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={Backdrop}
        onDismiss={handleDismiss}
        handleIndicatorStyle={{ backgroundColor: PS_TOKENS.ink3 }}
        backgroundStyle={{ backgroundColor: PS_TOKENS.card }}
      >
        <View style={styles.container}>
          {/* Step 0 -- Type Picker */}
          {step === 0 && (
            <View style={styles.stepContainer}>
              <Text style={[TEXT.sheetTitle, styles.stepTitle]}>Post something</Text>
              <Text style={styles.stepSubtitle}>
                Posts are reviewed within 24h
              </Text>

              {POST_TYPES.map((opt) => (
                <Pressable
                  key={opt.type}
                  style={styles.typeRow}
                  onPress={() => handleSelectType(opt)}
                >
                  <View style={styles.typeIconTile}>
                    <Text style={styles.typeEmoji}>{opt.emoji}</Text>
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeTitle}>{opt.title}</Text>
                    <Text style={styles.typeSubtitle}>{opt.subtitle}</Text>
                  </View>
                  <Text style={styles.typeChevron}>{'>'}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Step 1 -- Form */}
          {step === 1 && selectedType && (
            <View style={styles.stepContainer}>
              <View style={styles.typeBadgeRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeEmoji}>{selectedType.emoji}</Text>
                  <Text style={styles.typeBadgeLabel}>{selectedType.title}</Text>
                </View>
                <Pressable onPress={() => setStep(0)}>
                  <Text style={styles.changeText}>change</Text>
                </Pressable>
              </View>

              {/* Headline */}
              <Text style={styles.fieldLabel}>HEADLINE</Text>
              <BottomSheetTextInput
                style={styles.fieldInput}
                value={title}
                onChangeText={setTitle}
                placeholder="What's happening?"
                placeholderTextColor={PS_TOKENS.ink3}
              />

              {/* Summary */}
              <Text style={styles.fieldLabel}>SUMMARY</Text>
              <BottomSheetTextInput
                style={[styles.fieldInput, styles.fieldMultiline]}
                value={summary}
                onChangeText={setSummary}
                placeholder="Give some context..."
                placeholderTextColor={PS_TOKENS.ink3}
                multiline
                numberOfLines={3}
              />

              {/* When / Where (rally or election only) */}
              {showWhenWhere && (
                <View style={styles.whenWhereRow}>
                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>WHEN</Text>
                    <BottomSheetTextInput
                      style={styles.fieldInput}
                      value={when}
                      onChangeText={setWhen}
                      placeholder="e.g. Sat Apr 26 2pm"
                      placeholderTextColor={PS_TOKENS.ink3}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>WHERE</Text>
                    <BottomSheetTextInput
                      style={styles.fieldInput}
                      value={where}
                      onChangeText={setWhere}
                      placeholder="e.g. McKeldin Mall"
                      placeholderTextColor={PS_TOKENS.ink3}
                    />
                  </View>
                </View>
              )}

              {/* Moderation notice */}
              <View style={styles.noticeCard}>
                <Text style={styles.noticeText}>
                  Posts are reviewed by a student moderator before appearing in
                  anyone's stack. Verified orgs (SGA, Sunrise UMD, etc.) get a{' '}
                  {'\u2713'} badge and post instantly.
                </Text>
              </View>

              {/* Submit button */}
              <Pressable
                style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                <Text style={[TEXT.buttonLabel, styles.submitLabel]}>
                  Submit for review
                </Text>
              </Pressable>
            </View>
          )}

          {/* Step 2 -- Confirmation */}
          {step === 2 && (
            <View style={styles.confirmContainer}>
              <View style={styles.clockCircle}>
                <Text style={styles.clockIcon}>{'\u23F1'}</Text>
              </View>
              <Text style={[TEXT.sheetTitle, styles.confirmTitle]}>
                Pending review
              </Text>
              <Text style={styles.confirmBody}>
                A moderator will approve within 24h. You'll get a ping when it
                goes live.
              </Text>
              <Pressable style={styles.doneButton} onPress={handleDone}>
                <Text style={[TEXT.buttonLabel, styles.doneLabel]}>Done</Text>
              </Pressable>
            </View>
          )}
        </View>
      </BottomSheetModal>
    );
  },
);

PostSheet.displayName = 'PostSheet';
export { PostSheet };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    color: PS_TOKENS.ink,
    marginBottom: 4,
  },
  stepSubtitle: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
    marginBottom: 20,
  },
  // Type rows
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PS_TOKENS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: PS_TOKENS.borderCool,
  },
  typeIconTile: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: PS_TOKENS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeEmoji: {
    fontSize: 20,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    ...TEXT.buttonLabel,
    color: PS_TOKENS.ink,
    marginBottom: 2,
  },
  typeSubtitle: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
  },
  typeChevron: {
    fontSize: 18,
    color: PS_TOKENS.ink3,
    fontWeight: '600',
  },
  // Type badge
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeBadgeEmoji: {
    fontSize: 14,
  },
  typeBadgeLabel: {
    ...TEXT.chip,
    color: PS_TOKENS.ink,
    textTransform: 'uppercase',
  },
  changeText: {
    ...TEXT.actionHint,
    color: PS_TOKENS.share,
    fontWeight: '600',
  },
  // Fields
  fieldLabel: {
    ...TEXT.factLabel,
    color: PS_TOKENS.ink3,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  fieldInput: {
    backgroundColor: PS_TOKENS.bg,
    borderRadius: 12,
    padding: 14,
    ...TEXT.detailsBody,
    color: PS_TOKENS.ink,
  },
  fieldMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  whenWhereRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  // Notice
  noticeCard: {
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },
  noticeText: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
    lineHeight: 17,
  },
  // Submit
  submitButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitLabel: {
    color: '#FFFFFF',
  },
  // Confirmation
  confirmContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  clockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PS_TOKENS.brandAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  clockIcon: {
    fontSize: 28,
  },
  confirmTitle: {
    color: PS_TOKENS.ink,
    marginBottom: 10,
  },
  confirmBody: {
    ...TEXT.detailsBody,
    color: PS_TOKENS.ink2,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  doneButton: {
    height: 50,
    paddingHorizontal: 40,
    borderRadius: 14,
    backgroundColor: PS_TOKENS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneLabel: {
    color: '#FFFFFF',
  },
});
