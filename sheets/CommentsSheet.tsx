import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Backdrop } from './Backdrop';
import { PS_TOKENS } from '@/theme/tokens';
import { shadow } from '@/theme/shadow';
import { COMMENTS, countComments, totalReactions } from '@/data/comments';
import type { Card, Comment, EmojiKey, OrgBadge } from '@/types';

// ─── Constants ───────────────────────────────────────────────
const EMOJI_OPTIONS: { key: EmojiKey; label: string }[] = [
  { key: '\ud83d\udc4d', label: 'Agree' },
  { key: '\u2764\ufe0f', label: 'Care' },
  { key: '\ud83e\udd14', label: 'Thinking' },
  { key: '\ud83d\ude24', label: 'Fired up' },
  { key: '\u2728', label: 'Insightful' },
];

type SortTab = 'top' | 'newest' | 'verified';

const BADGE_COLORS: Record<OrgBadge, string> = {
  Organizer: '#EC4899',
  'Student press': '#3B82F6',
  'UMD office': '#7C3AED',
  'Verified org': '#10B981',
};

// ─── Helpers ─────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function sortComments(comments: Comment[], tab: SortTab): Comment[] {
  const list = [...comments];
  switch (tab) {
    case 'top':
      return list.sort((a, b) => totalReactions(b) - totalReactions(a) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'newest':
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'verified':
      return list.filter((c) => c.verified).sort((a, b) => totalReactions(b) - totalReactions(a));
  }
}

// ─── CommentAvatar ───────────────────────────────────────────
function CommentAvatar({ comment }: { comment: Comment }) {
  if (comment.verified && comment.badge) {
    const bg = BADGE_COLORS[comment.badge] ?? PS_TOKENS.ink;
    const initials = comment.displayName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <View style={[styles.avatar, styles.avatarOrg, { backgroundColor: bg }]}>
        <Text style={styles.avatarOrgText}>{initials}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.avatar, styles.avatarStudent]}>
      <Text style={styles.avatarGlyph}>{'\u25D0'}</Text>
    </View>
  );
}

// ─── Reaction Row ────────────────────────────────────────────
function ReactionRow({
  comment,
  onToggle,
  onOpenPicker,
}: {
  comment: Comment;
  onToggle: (commentId: string, emoji: EmojiKey) => void;
  onOpenPicker: (commentId: string) => void;
}) {
  const sorted = useMemo(() => {
    return (Object.entries(comment.reactions) as [EmojiKey, number][])
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [comment.reactions]);

  const mySet = useMemo(() => new Set(comment.myReactions), [comment.myReactions]);

  return (
    <View style={styles.reactionRow}>
      {sorted.map(([emoji, count]) => (
        <Pressable
          key={emoji}
          style={[styles.reactionPill, mySet.has(emoji) && styles.reactionPillActive]}
          onPress={() => onToggle(comment.id, emoji)}
        >
          <Text style={styles.reactionEmoji}>{emoji}</Text>
          <Text style={[styles.reactionCount, mySet.has(emoji) && styles.reactionCountActive]}>
            {count}
          </Text>
        </Pressable>
      ))}
      <Pressable style={styles.reactionAdd} onPress={() => onOpenPicker(comment.id)}>
        <Text style={styles.reactionAddText}>{'\uFF0B'}</Text>
      </Pressable>
    </View>
  );
}

// ─── Reaction Picker Popover ─────────────────────────────────
function ReactionPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: EmojiKey) => void;
  onClose: () => void;
}) {
  return (
    <Pressable style={styles.pickerOverlay} onPress={onClose}>
      <View style={styles.pickerCard}>
        {EMOJI_OPTIONS.map(({ key, label }) => (
          <Pressable
            key={key}
            style={styles.pickerOption}
            onPress={() => {
              onSelect(key);
              onClose();
            }}
          >
            <Text style={styles.pickerEmoji}>{key}</Text>
            <Text style={styles.pickerLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </Pressable>
  );
}

// ─── CommentThread (recursive) ───────────────────────────────
function CommentThread({
  comment,
  depth,
  onToggleReaction,
  onOpenPicker,
  onReply,
  replyingTo,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  onCancelReply,
}: {
  comment: Comment;
  depth: number;
  onToggleReaction: (commentId: string, emoji: EmojiKey) => void;
  onOpenPicker: (commentId: string) => void;
  onReply: (commentId: string) => void;
  replyingTo: string | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const replyCount = comment.replies ? countComments(comment.replies) : 0;

  const railColor = depth <= 1 ? '#ECEAE2' : '#F4F2EB';

  return (
    <View
      style={[
        styles.threadContainer,
        depth > 0 && {
          paddingLeft: 12,
          marginLeft: 4,
          borderLeftWidth: 2,
          borderLeftColor: railColor,
        },
      ]}
    >
      {/* Comment body */}
      <View style={styles.commentRow}>
        <CommentAvatar comment={comment} />
        <View style={styles.commentBody}>
          {/* Identity line */}
          <View style={styles.identityRow}>
            <Text style={styles.authorName} numberOfLines={1}>
              {comment.displayName}
            </Text>
            {comment.badge && (
              <View style={[styles.orgBadge, { backgroundColor: (BADGE_COLORS[comment.badge] ?? PS_TOKENS.ink) + '20' }]}>
                <Text style={[styles.orgBadgeText, { color: BADGE_COLORS[comment.badge] ?? PS_TOKENS.ink }]}>
                  {'\u2713'} {comment.badge.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Meta line */}
          <Text style={styles.metaLine}>
            {comment.major ? `${comment.major} ${comment.year}` : ''}
            {comment.major && comment.dorm ? ' \u00B7 ' : ''}
            {comment.dorm ?? ''}
            {(comment.major || comment.dorm) ? ' \u00B7 ' : ''}
            {timeAgo(comment.createdAt)}
          </Text>

          {/* Body text */}
          {!collapsed && (
            <>
              <Text style={styles.bodyText}>
                {comment.removed ? '[removed by author]' : comment.body}
              </Text>

              {/* Reactions + actions */}
              {!comment.removed && (
                <View style={styles.actionsRow}>
                  <ReactionRow
                    comment={comment}
                    onToggle={onToggleReaction}
                    onOpenPicker={onOpenPicker}
                  />
                  <Pressable style={styles.replyButton} onPress={() => onReply(comment.id)}>
                    <Text style={styles.replyButtonText}>Reply</Text>
                  </Pressable>
                  {replyCount > 0 && (
                    <Pressable onPress={() => setCollapsed(true)}>
                      <Text style={styles.collapseText}>Collapse</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Inline reply composer */}
              {replyingTo === comment.id && (
                <View style={styles.inlineComposer}>
                  <View style={styles.inlineComposerIdentity}>
                    <View style={[styles.avatar, styles.avatarStudent, { width: 24, height: 24 }]}>
                      <Text style={[styles.avatarGlyph, { fontSize: 12 }]}>{'\u25D0'}</Text>
                    </View>
                    <Text style={styles.inlineComposerLabel}>Replying as Verified UMD student</Text>
                  </View>
                  <TextInput
                    style={styles.inlineInput}
                    value={replyText}
                    onChangeText={onReplyTextChange}
                    placeholder="Write a reply\u2026"
                    placeholderTextColor={PS_TOKENS.ink3}
                    multiline
                    autoFocus
                  />
                  <View style={styles.inlineComposerActions}>
                    <Pressable onPress={onCancelReply}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.inlinePostButton, !replyText.trim() && styles.inlinePostDisabled]}
                      onPress={onSubmitReply}
                      disabled={!replyText.trim()}
                    >
                      <Text style={styles.inlinePostText}>Reply</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Collapsed state */}
          {collapsed && (
            <Pressable onPress={() => setCollapsed(false)} style={styles.expandRow}>
              <Text style={styles.expandText}>
                Expand \u00B7 {replyCount} hidden
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Nested replies */}
      {!collapsed &&
        comment.replies?.map((reply) => (
          <CommentThread
            key={reply.id}
            comment={reply}
            depth={depth + 1}
            onToggleReaction={onToggleReaction}
            onOpenPicker={onOpenPicker}
            onReply={onReply}
            replyingTo={replyingTo}
            replyText={replyText}
            onReplyTextChange={onReplyTextChange}
            onSubmitReply={onSubmitReply}
            onCancelReply={onCancelReply}
          />
        ))}
    </View>
  );
}

// ─── CommentsSheet ───────────────────────────────────────────
interface CommentsSheetProps {
  card: Card | null;
}

const CommentsSheet = forwardRef<BottomSheetModal, CommentsSheetProps>(
  ({ card }, ref) => {
    const snapPoints = useMemo(() => ['92%'], []);
    const [sortTab, setSortTab] = useState<SortTab>('top');
    const [composerExpanded, setComposerExpanded] = useState(false);
    const [composerText, setComposerText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [pickerTarget, setPickerTarget] = useState<string | null>(null);

    // Local mutable copy of comments for optimistic updates
    const [localComments, setLocalComments] = useState<Record<string, Comment[]>>(() => {
      return JSON.parse(JSON.stringify(COMMENTS));
    });

    const cardId = card?.id ?? '';
    const rawComments = localComments[cardId] ?? [];
    const commentCount = countComments(rawComments);
    const sorted = useMemo(() => sortComments(rawComments, sortTab), [rawComments, sortTab]);

    // ── Reaction toggle (optimistic) ──
    const handleToggleReaction = useCallback(
      (commentId: string, emoji: EmojiKey) => {
        setLocalComments((prev) => {
          const next = JSON.parse(JSON.stringify(prev)) as Record<string, Comment[]>;
          const toggle = (comments: Comment[]): boolean => {
            for (const c of comments) {
              if (c.id === commentId) {
                const idx = c.myReactions.indexOf(emoji);
                if (idx >= 0) {
                  c.myReactions.splice(idx, 1);
                  c.reactions[emoji] = Math.max(0, (c.reactions[emoji] ?? 0) - 1);
                } else {
                  c.myReactions.push(emoji);
                  c.reactions[emoji] = (c.reactions[emoji] ?? 0) + 1;
                }
                return true;
              }
              if (c.replies && toggle(c.replies)) return true;
            }
            return false;
          };
          toggle(next[cardId] ?? []);
          return next;
        });
      },
      [cardId],
    );

    // ── Post top-level comment ──
    const handlePost = useCallback(() => {
      if (!composerText.trim() || !cardId) return;
      const newComment: Comment = {
        id: `c-new-${Date.now()}`,
        cardId,
        authorId: 'u-self',
        displayName: 'Verified UMD student',
        major: 'CS',
        year: "'26",
        verified: false,
        body: composerText.trim(),
        createdAt: new Date().toISOString(),
        reactions: { '\ud83d\udc4d': 0, '\u2764\ufe0f': 0, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 0 },
        myReactions: [],
        replies: [],
      };
      setLocalComments((prev) => {
        const next = { ...prev };
        next[cardId] = [newComment, ...(next[cardId] ?? [])];
        return next;
      });
      setComposerText('');
      setComposerExpanded(false);
    }, [composerText, cardId]);

    // ── Post reply ──
    const handleSubmitReply = useCallback(() => {
      if (!replyText.trim() || !replyingTo || !cardId) return;
      const newReply: Comment = {
        id: `c-reply-${Date.now()}`,
        cardId,
        parentId: replyingTo,
        authorId: 'u-self',
        displayName: 'Verified UMD student',
        major: 'CS',
        year: "'26",
        verified: false,
        body: replyText.trim(),
        createdAt: new Date().toISOString(),
        reactions: { '\ud83d\udc4d': 0, '\u2764\ufe0f': 0, '\ud83e\udd14': 0, '\ud83d\ude24': 0, '\u2728': 0 },
        myReactions: [],
      };
      setLocalComments((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as Record<string, Comment[]>;
        const insert = (comments: Comment[]): boolean => {
          for (const c of comments) {
            if (c.id === replyingTo) {
              if (!c.replies) c.replies = [];
              c.replies.push(newReply);
              return true;
            }
            if (c.replies && insert(c.replies)) return true;
          }
          return false;
        };
        insert(next[cardId] ?? []);
        return next;
      });
      setReplyText('');
      setReplyingTo(null);
    }, [replyText, replyingTo, cardId]);

    const handleDismiss = useCallback(() => {
      setComposerExpanded(false);
      setComposerText('');
      setReplyingTo(null);
      setReplyText('');
      setPickerTarget(null);
      setSortTab('top');
    }, []);

    if (!card) return null;

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
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={styles.eyebrow}>
                  COMMUNITY TAKES \u00B7 {commentCount}
                </Text>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {card.headline}
                </Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => {
                  if (ref && typeof ref !== 'function' && ref.current) {
                    ref.current.dismiss();
                  }
                }}
              >
                <Text style={styles.closeX}>{'\u2715'}</Text>
              </Pressable>
            </View>

            {/* Sort tabs */}
            <View style={styles.sortRow}>
              <View style={styles.sortTabs}>
                {(['top', 'newest', 'verified'] as SortTab[]).map((tab) => (
                  <Pressable
                    key={tab}
                    style={[styles.sortPill, sortTab === tab && styles.sortPillActive]}
                    onPress={() => setSortTab(tab)}
                  >
                    <Text
                      style={[styles.sortPillText, sortTab === tab && styles.sortPillTextActive]}
                    >
                      {tab === 'top' ? 'Top' : tab === 'newest' ? 'Newest' : 'Verified'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.anonymousLabel}>Anonymous \u00B7 UMD-verified</Text>
            </View>
          </View>

          {/* ── Scrollable body ── */}
          <BottomSheetScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Composer */}
            {!composerExpanded ? (
              <Pressable
                style={styles.composerCollapsed}
                onPress={() => setComposerExpanded(true)}
              >
                <View style={[styles.avatar, styles.avatarStudent]}>
                  <Text style={styles.avatarGlyph}>{'\u25D0'}</Text>
                </View>
                <Text style={styles.composerPlaceholder}>
                  Write a take \u00B7 you'll show as "Verified UMD student"
                </Text>
              </Pressable>
            ) : (
              <View style={styles.composerExpanded}>
                <View style={styles.composerIdentity}>
                  <View style={[styles.avatar, styles.avatarStudent]}>
                    <Text style={styles.avatarGlyph}>{'\u25D0'}</Text>
                  </View>
                  <View>
                    <Text style={styles.composerName}>Verified UMD student</Text>
                    <Text style={styles.composerHiddenHint}>\u00B7 identity stays hidden</Text>
                  </View>
                </View>
                <TextInput
                  style={styles.composerInput}
                  value={composerText}
                  onChangeText={setComposerText}
                  placeholder="Share context, ask a question, drop a source\u2026"
                  placeholderTextColor={PS_TOKENS.ink3}
                  multiline
                  autoFocus
                />
                <View style={styles.composerFooter}>
                  <Text style={styles.guidelinesText}>Community guidelines apply.</Text>
                  <View style={styles.composerButtons}>
                    <Pressable onPress={() => { setComposerExpanded(false); setComposerText(''); }}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.postButton, !composerText.trim() && styles.postButtonDisabled]}
                      onPress={handlePost}
                      disabled={!composerText.trim()}
                    >
                      <Text style={styles.postButtonText}>Post</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Empty state */}
            {sorted.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>{'\ud83d\udcac'}</Text>
                <Text style={styles.emptyTitle}>Be the first take.</Text>
                <Text style={styles.emptySub}>
                  Share context or a question before you swipe.
                </Text>
              </View>
            )}

            {/* Comment threads */}
            {sorted.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                depth={0}
                onToggleReaction={handleToggleReaction}
                onOpenPicker={setPickerTarget}
                onReply={(id) => {
                  setReplyingTo(id);
                  setReplyText('');
                }}
                replyingTo={replyingTo}
                replyText={replyText}
                onReplyTextChange={setReplyText}
                onSubmitReply={handleSubmitReply}
                onCancelReply={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
              />
            ))}
          </BottomSheetScrollView>

          {/* Reaction picker popover */}
          {pickerTarget && (
            <ReactionPicker
              onSelect={(emoji) => handleToggleReaction(pickerTarget, emoji)}
              onClose={() => setPickerTarget(null)}
            />
          )}
        </View>
      </BottomSheetModal>
    );
  },
);

CommentsSheet.displayName = 'CommentsSheet';
export { CommentsSheet };

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Header ──
  header: {
    paddingHorizontal: 22,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: PS_TOKENS.borderCool,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.26,
    color: PS_TOKENS.ink3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.34,
    color: PS_TOKENS.ink,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PS_TOKENS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    fontSize: 14,
    fontWeight: '700',
    color: PS_TOKENS.ink2,
  },

  // ── Sort tabs ──
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sortTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: PS_TOKENS.card,
    borderWidth: 1,
    borderColor: PS_TOKENS.dividerWarm,
  },
  sortPillActive: {
    backgroundColor: PS_TOKENS.ink,
    borderColor: PS_TOKENS.ink,
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  sortPillTextActive: {
    color: '#FFFFFF',
  },
  anonymousLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: PS_TOKENS.ink3,
  },

  // ── Body ──
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // ── Composer collapsed ──
  composerCollapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  composerPlaceholder: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: PS_TOKENS.ink3,
  },

  // ── Composer expanded ──
  composerExpanded: {
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 14,
    padding: 14,
  },
  composerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  composerName: {
    fontSize: 13,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  composerHiddenHint: {
    fontSize: 11,
    fontWeight: '500',
    color: PS_TOKENS.ink3,
  },
  composerInput: {
    minHeight: 80,
    fontSize: 14,
    fontWeight: '500',
    color: PS_TOKENS.ink,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  composerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  guidelinesText: {
    fontSize: 11,
    fontWeight: '500',
    color: PS_TOKENS.ink3,
  },
  composerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: PS_TOKENS.ink2,
  },
  postButton: {
    backgroundColor: PS_TOKENS.brand,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postButtonDisabled: {
    opacity: 0.4,
  },
  postButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: PS_TOKENS.dividerWarm,
    marginVertical: 14,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PS_TOKENS.ink,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    fontWeight: '500',
    color: PS_TOKENS.ink3,
    textAlign: 'center',
  },

  // ── Comment thread ──
  threadContainer: {
    marginBottom: 6,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },

  // ── Avatar ──
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarStudent: {
    backgroundColor: PS_TOKENS.tint,
  },
  avatarGlyph: {
    fontSize: 16,
    color: PS_TOKENS.ink3,
  },
  avatarOrg: {
    borderRadius: 8,
  },
  avatarOrgText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ── Identity ──
  commentBody: {
    flex: 1,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: PS_TOKENS.ink,
    flexShrink: 1,
    maxWidth: 160,
  },
  orgBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
  },
  orgBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.64,
  },
  metaLine: {
    fontSize: 11.5,
    fontWeight: '500',
    color: PS_TOKENS.ink3,
    marginTop: 1,
  },

  // ── Body text ──
  bodyText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '500',
    color: PS_TOKENS.ink,
    letterSpacing: -0.07,
    marginTop: 5,
  },

  // ── Actions row ──
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  replyButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: PS_TOKENS.ink2,
  },
  collapseText: {
    fontSize: 12,
    fontWeight: '600',
    color: PS_TOKENS.ink3,
  },

  // ── Reactions ──
  reactionRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: PS_TOKENS.tint,
    borderWidth: 1,
    borderColor: PS_TOKENS.dividerWarm,
  },
  reactionPillActive: {
    borderColor: PS_TOKENS.brand,
    backgroundColor: PS_TOKENS.brand + '10',
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '700',
    color: PS_TOKENS.ink2,
  },
  reactionCountActive: {
    color: PS_TOKENS.brand,
  },
  reactionAdd: {
    width: 28,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: PS_TOKENS.ink3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionAddText: {
    fontSize: 14,
    color: PS_TOKENS.ink3,
    fontWeight: '500',
  },

  // ── Reaction picker ──
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  pickerCard: {
    flexDirection: 'row',
    backgroundColor: PS_TOKENS.card,
    borderRadius: 16,
    padding: 8,
    gap: 4,
    ...shadow.sheet,
  },
  pickerOption: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pickerEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  pickerLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: PS_TOKENS.ink2,
  },

  // ── Expand / collapse ──
  expandRow: {
    paddingVertical: 6,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '600',
    color: PS_TOKENS.share,
  },

  // ── Inline reply composer ──
  inlineComposer: {
    marginTop: 8,
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 10,
    padding: 10,
  },
  inlineComposerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  inlineComposerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: PS_TOKENS.ink2,
  },
  inlineInput: {
    fontSize: 13,
    fontWeight: '500',
    color: PS_TOKENS.ink,
    lineHeight: 18,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  inlineComposerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  inlinePostButton: {
    backgroundColor: PS_TOKENS.brand,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inlinePostDisabled: {
    opacity: 0.4,
  },
  inlinePostText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
