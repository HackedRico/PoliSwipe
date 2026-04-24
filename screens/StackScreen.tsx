import { useRef, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';

import TopBar from '@/components/TopBar';
import NavChips from '@/components/NavChips';
import ActionButtons from '@/components/ActionButtons';
import { SwipeCard } from '@/card/SwipeCard';

import { ActionDrawer } from '@/sheets/ActionDrawer';
import { ChatSheet } from '@/sheets/ChatSheet';
import { DetailsSheet } from '@/sheets/DetailsSheet';
import { FilterSheet } from '@/sheets/FilterSheet';
import { SavedSheet } from '@/sheets/SavedSheet';
import { PostSheet } from '@/sheets/PostSheet';

import { usePersistentState } from '@/hooks/usePersistentState';
import { useFilteredDeck } from '@/hooks/useFilteredDeck';
import type { Card, CardType, SavedItem, SwipeDir } from '@/types';
import { PS_TOKENS } from '@/theme/tokens';

export function StackScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [idx, setIdx] = usePersistentState<number>('idx', 0);
  const [careCount, setCareCount] = usePersistentState<number>('careCount', 0);
  const [saved, setSaved] = usePersistentState<SavedItem[]>('saved', []);
  const [filters, setFilters] = usePersistentState<CardType[]>('filters', []);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [chatMode, setChatMode] = useState<'global' | 'card'>('global');

  const actionRef = useRef<BottomSheetModal>(null);
  const chatRef = useRef<BottomSheetModal>(null);
  const detailsRef = useRef<BottomSheetModal>(null);
  const filterRef = useRef<BottomSheetModal>(null);
  const savedRef = useRef<BottomSheetModal>(null);
  const postRef = useRef<BottomSheetModal>(null);

  const deck = useFilteredDeck(filters);

  const handleSwipe = useCallback(
    (card: Card, dir: SwipeDir) => {
      if (dir === 'right') {
        setCareCount((c) => c + 1);
        setSaved((s) => [
          { card, savedAtISO: new Date().toISOString(), sent: false },
          ...s,
        ]);
        setActiveCard(card);
        actionRef.current?.present();
      } else if (dir === 'down') {
        setActiveCard(card);
        setChatMode('card');
        chatRef.current?.present();
      } else {
        setIdx((i) => i + 1);
      }
    },
    [],
  );

  const closeActionDrawer = useCallback(() => {
    actionRef.current?.dismiss();
    setIdx((i) => i + 1);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBar
        onAsk={() => {
          setChatMode('global');
          chatRef.current?.present();
        }}
      />
      <NavChips
        activeFilters={filters}
        savedCount={saved.length}
        careCount={careCount}
        onFilter={() => filterRef.current?.present()}
        onSaved={() => savedRef.current?.present()}
        onPost={() => postRef.current?.present()}
        onRecap={() => router.push('/wrap')}
      />

      <View style={styles.deck}>
        {deck.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\u{1F50D}'}</Text>
            <Text style={styles.emptyTitle}>No cards match your filters</Text>
            <Text style={styles.emptySub}>Try clearing your filters above</Text>
          </View>
        ) : (
          Array.from({ length: Math.min(3, deck.length) }, (_, i) => deck[(idx + i) % deck.length])
            .reverse()
            .map((c, i, arr) => (
              <SwipeCard
                key={c.id + '-' + Math.floor(idx / deck.length)}
                card={c}
                isTop={i === arr.length - 1}
                stackIndex={arr.length - 1 - i}
                onSwipe={handleSwipe}
                onMoreDetails={(cd) => {
                  setActiveCard(cd);
                  detailsRef.current?.present();
                }}
              />
            ))
        )}
      </View>

      {deck.length > 0 && (
        <ActionButtons
          onLeft={() => handleSwipe(deck[idx % deck.length], 'left')}
          onShare={() => handleSwipe(deck[idx % deck.length], 'up')}
          onRight={() => handleSwipe(deck[idx % deck.length], 'right')}
        />
      )}

      <ActionDrawer ref={actionRef} card={activeCard} onClose={closeActionDrawer} />
      <ChatSheet ref={chatRef} card={activeCard} isGlobal={chatMode === 'global'} />
      <DetailsSheet ref={detailsRef} card={activeCard} />
      <FilterSheet ref={filterRef} active={filters} onChange={setFilters} />
      <SavedSheet ref={savedRef} items={saved} />
      <PostSheet
        ref={postRef}
        onSubmit={(d) => console.log('post submitted', d)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PS_TOKENS.bg },
  deck: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: PS_TOKENS.ink, marginBottom: 6 },
  emptySub: { fontSize: 14, color: PS_TOKENS.ink3 },
});
