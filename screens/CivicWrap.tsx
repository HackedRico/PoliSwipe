import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import ProgressBar from '@/components/ProgressBar';
import { usePersistentState } from '@/hooks/usePersistentState';
import {
  PROFILE,
  WRAP_TOP_ISSUES,
  WRAP_NEXT,
  WRAP_REPS,
} from '@/data/profile';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';

const { height: SCREEN_H } = Dimensions.get('window');

const TAG_COLORS: Record<string, string> = {
  emailed: PS_TOKENS.success,
  called: PS_TOKENS.share,
  texted: '#F59E0B',
};

export function CivicWrap() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [careCount] = usePersistentState<number>('careCount', 0);
  const [, setIdx] = usePersistentState<number>('idx', 0);

  // Animated counter for panel 0
  const [displayCount, setDisplayCount] = useState(0);
  const countStarted = useRef(false);

  useEffect(() => {
    if (countStarted.current) return;
    countStarted.current = true;

    const target = careCount;
    if (target <= 0) {
      setDisplayCount(0);
      return;
    }

    const totalDuration = 600;
    const steps = Math.min(target, 30);
    const intervalMs = totalDuration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += Math.ceil(target / steps);
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setDisplayCount(current);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [careCount]);

  const handleBack = () => {
    router.back();
  };

  const handleStartOver = () => {
    setIdx(0);
    router.replace('/');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed close button */}
      <Pressable
        style={[styles.closeBtn, { top: insets.top + 12 }]}
        onPress={handleBack}
        hitSlop={12}
      >
        <Text style={styles.closeIcon}>{'\u2715'}</Text>
      </Pressable>

    <ScrollView
      pagingEnabled
      showsVerticalScrollIndicator={false}
      bounces={false}
      style={styles.scroll}
    >
      {/* Panel 0 -- Hero count */}
      <View
        style={[
          styles.panel,
          { backgroundColor: '#FAFAF7', paddingTop: insets.top + 24 },
        ]}
      >
        <Text style={styles.p0TopLabel}>APR 24 . THURSDAY NIGHT</Text>
        <Text style={styles.p0Subhead}>You cared about</Text>
        <Text style={[TEXT.wrapHuge, { color: PS_TOKENS.brand }]}>
          {displayCount}
        </Text>
        <Text style={styles.p0Below}>things tonight.</Text>
        <View style={styles.p0HintWrap}>
          <Text style={styles.p0Hint}>scroll down</Text>
          <Text style={styles.p0Arrow}>v</Text>
        </View>
      </View>

      {/* Panel 1 -- Top Issues */}
      <View style={[styles.panel, { backgroundColor: '#FFF7DE' }]}>
        <View style={styles.panelContent}>
          <Text style={styles.sectionNum}>01 . YOUR TOP ISSUES</Text>
          <Text style={[TEXT.wrapSection, styles.panelHeadline]}>
            You care most about housing & energy
          </Text>
          <View style={styles.barsWrap}>
            {WRAP_TOP_ISSUES.map((issue) => (
              <View key={issue.label} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barLabel}>{issue.label}</Text>
                  <Text style={[styles.barPct, { color: issue.color }]}>
                    {issue.pct}%
                  </Text>
                </View>
                <ProgressBar pct={issue.pct} color={issue.color} height={8} />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Panel 2 -- Your Wins */}
      <View style={[styles.panel, { backgroundColor: '#FFECEC' }]}>
        <View style={styles.panelContent}>
          <Text style={styles.sectionNum}>02 . YOUR WINS</Text>
          <Text style={[TEXT.wrapSection, styles.panelHeadline]}>
            You emailed 3 reps tonight
          </Text>
          <View style={styles.repsWrap}>
            {WRAP_REPS.map((rep) => (
              <View key={rep.name} style={styles.repCard}>
                <View style={styles.repAvatar}>
                  <Text style={styles.repInitials}>
                    {rep.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.repInfo}>
                  <Text style={styles.repName}>{rep.name}</Text>
                  <Text style={styles.repTitle}>{rep.title}</Text>
                </View>
                <View
                  style={[
                    styles.repTag,
                    {
                      backgroundColor:
                        (TAG_COLORS[rep.tag] ?? PS_TOKENS.ink3) + '22',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.repTagText,
                      { color: TAG_COLORS[rep.tag] ?? PS_TOKENS.ink3 },
                    ]}
                  >
                    {rep.tag}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Panel 3 -- Up Next */}
      <View style={[styles.panel, { backgroundColor: '#EAF4FF' }]}>
        <View style={styles.panelContent}>
          <Text style={styles.sectionNum}>03 . UP NEXT</Text>
          <View style={styles.todosWrap}>
            {WRAP_NEXT.map((todo) => (
              <View key={todo.label} style={styles.todoRow}>
                <Text style={styles.todoEmoji}>{todo.emoji}</Text>
                <View style={styles.todoText}>
                  <Text style={styles.todoLabel}>{todo.label}</Text>
                  <Text style={styles.todoSub}>{todo.sub}</Text>
                </View>
                <Text style={styles.todoArrow}>{'>'}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Panel 4 -- Civic Vibe (dark) */}
      <View
        style={[
          styles.panel,
          { backgroundColor: '#111111', paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.panelContent}>
          <Text style={[styles.sectionNum, { color: PS_TOKENS.brandAccent }]}>
            04 . YOUR CIVIC VIBE
          </Text>
          <Text style={[TEXT.wrapSection, styles.darkHeadline]}>
            You showed up.
          </Text>
          <Text style={styles.darkBody}>
            Most people scroll past the news. You stopped, read, and took
            action. That is what civic engagement looks like -- and it matters
            more than you think.
          </Text>
          <Pressable style={styles.shareBtn} onPress={() => {}}>
            <Text style={styles.shareBtnText}>Share</Text>
          </Pressable>
          <Pressable style={styles.ghostBtn} onPress={handleStartOver}>
            <Text style={styles.ghostBtnText}>Start over</Text>
          </Pressable>
          <Text style={styles.footer}>Made at UMD x Anthropic Hackathon</Text>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  panel: {
    height: SCREEN_H,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  panelContent: {
    width: '100%',
    maxWidth: 380,
  },

  /* Panel 0 */
  p0TopLabel: {
    ...TEXT.sectionLabel,
    color: PS_TOKENS.ink3,
    textTransform: 'uppercase',
    marginBottom: 24,
    textAlign: 'center',
  },
  p0Subhead: {
    ...TEXT.wrapSection,
    color: PS_TOKENS.ink,
    textAlign: 'center',
  },
  p0Below: {
    ...TEXT.wrapSection,
    color: PS_TOKENS.ink,
    textAlign: 'center',
    marginTop: -4,
  },
  p0HintWrap: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    alignItems: 'center',
  },
  p0Hint: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink3,
    marginBottom: 4,
  },
  p0Arrow: {
    fontSize: 16,
    color: PS_TOKENS.ink3,
    fontWeight: '600',
  },

  /* Section numbers */
  sectionNum: {
    ...TEXT.sectionLabel,
    color: PS_TOKENS.ink3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  panelHeadline: {
    color: PS_TOKENS.ink,
    marginBottom: 28,
  },

  /* Panel 1 -- bars */
  barsWrap: {
    gap: 20,
  },
  barRow: {
    gap: 8,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  barPct: {
    fontSize: 15,
    fontWeight: '800',
  },

  /* Panel 2 -- reps */
  repsWrap: {
    gap: 12,
  },
  repCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  repAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  repInfo: {
    flex: 1,
  },
  repName: {
    fontSize: 15,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  repTitle: {
    fontSize: 13,
    color: PS_TOKENS.ink2,
    marginTop: 2,
  },
  repTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  repTagText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Panel 3 -- todos */
  todosWrap: {
    gap: 12,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  todoEmoji: {
    fontSize: 22,
  },
  todoText: {
    flex: 1,
  },
  todoLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  todoSub: {
    fontSize: 13,
    color: PS_TOKENS.ink2,
    marginTop: 2,
  },
  todoArrow: {
    fontSize: 18,
    color: PS_TOKENS.ink3,
    fontWeight: '600',
  },

  /* Panel 4 -- dark */
  darkHeadline: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 40,
    marginBottom: 16,
  },
  darkBody: {
    ...TEXT.detailsBody,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 32,
  },
  shareBtn: {
    backgroundColor: PS_TOKENS.brandAccent,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  shareBtnText: {
    ...TEXT.buttonLabel,
    color: PS_TOKENS.ink,
  },
  ghostBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ghostBtnText: {
    ...TEXT.buttonLabel,
    color: 'rgba(255,255,255,0.7)',
  },
  footer: {
    ...TEXT.actionHint,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },
});
