import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line } from 'react-native-svg';

import { theme } from '../theme';
import { SearchIcon, MessageIcon, StarIcon } from '../icons';
import BottomNav from '../components/BottomNav';
import { CharacterIcon } from '../components/CharacterIcon';
import { getCharacterGradient } from '../utils/gradients';
import { useApp } from '../context/AppContext';
import { Character, CATEGORIES } from '../data/characters';
type SortKey = 'rating' | 'messages' | 'alpha' | 'new';

const TABS = ['Все', ...CATEGORIES.slice(1)];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating',   label: 'По рейтингу' },
  { key: 'messages', label: 'По популярности' },
  { key: 'alpha',    label: 'По алфавиту' },
  { key: 'new',      label: 'Сначала новые' },
];

function FilterIcon({ color = '#606060', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M2 4h12M4 8h8M6 12h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export default function LibraryScreen() {
  const { navigate, characters, libraryFilter, setLibraryFilter } = useApp();
  const [activeTab, setActiveTab] = useState('Все');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [sortVisible, setSortVisible] = useState(false);

  const isMine = libraryFilter === 'mine';

  const filtered = useMemo(() => {
    let list = isMine ? characters.filter(c => c.userCreated) : characters;
    if (activeTab !== 'Все') list = list.filter(c => c.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      if (sortKey === 'rating')   return b.rating - a.rating;
      if (sortKey === 'messages') return b.messages - a.messages;
      if (sortKey === 'alpha')    return a.name.localeCompare(b.name, 'ru');
      if (sortKey === 'new')      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0;
    });
  }, [characters, activeTab, search, sortKey, isMine]);

  const rows: Character[][] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2));
  }

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? '';

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={s.title}>{isMine ? 'Мои персонажи' : 'Каталог'}</Text>
          {isMine && (
            <TouchableOpacity onPress={() => setLibraryFilter('all')} activeOpacity={0.7}>
              <Text style={s.showAll}>Все →</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.searchRow}>
          <SearchIcon />
          <TextInput
            style={s.searchInput}
            placeholder="Поиск персонажей..."
            placeholderTextColor={theme.text3}
            value={search}
            onChangeText={setSearch}
            underlineColorAndroid="transparent"
          />
          <TouchableOpacity onPress={() => setSortVisible(true)} activeOpacity={0.7}>
            <FilterIcon color={theme.text2} />
          </TouchableOpacity>
        </View>

        <View style={s.sortHint}>
          <Text style={s.sortHintText}>{currentSortLabel}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[s.tab, activeTab === tab && s.tabOn]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextOn]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}
        contentContainerStyle={s.grid}>
        {rows.length === 0 && (
          <Text style={s.emptyText}>
            {isMine ? 'Вы ещё не создали персонажей' : 'Ничего не найдено'}
          </Text>
        )}
        {rows.map((row, ri) => (
          <View key={ri} style={s.row}>
            {row.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={s.card}
                onPress={() => navigate('chat', c)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={getCharacterGradient(c) as [string, string]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.cardImg}
                >
                  <CharacterIcon iconType={c.iconType} size={52} avatarUri={c.avatarUri} />
                  {c.isNSFW && (
                    <View style={s.nsfwBadge}>
                      <Text style={s.nsfwText}>18+</Text>
                    </View>
                  )}
                  {(c.isNew || c.userCreated) && (
                    <View style={[s.newBadge, c.userCreated && { backgroundColor: 'rgba(60,180,80,0.85)', borderColor: 'transparent' }]}>
                      <Text style={s.newText}>{c.userCreated ? 'МОЙ' : 'НОВЫЙ'}</Text>
                    </View>
                  )}
                </LinearGradient>

                <View style={s.cardBody}>
                  <Text style={s.cardName} numberOfLines={1}>{c.name}</Text>
                  <Text style={s.cardSub} numberOfLines={1}>{c.tags.join(' • ')}</Text>
                  <View style={s.cardStats}>
                    <View style={s.cardStatRow}>
                      <MessageIcon size={10} color={theme.text2} />
                      <Text style={s.cardStat}>{fmtNum(c.messages)}</Text>
                    </View>
                    <View style={s.cardStatRow}>
                      <StarIcon size={10} color={theme.text2} />
                      <Text style={s.cardStat}>{c.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
        <View style={{ height: 16 }} />
      </ScrollView>

      <BottomNav activeTab={isMine ? 'mine' : 'library'} />

      {/* Sort modal */}
      <Modal visible={sortVisible} transparent animationType="fade" onRequestClose={() => setSortVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setSortVisible(false)}>
          <View style={s.sortCard}>
            <Text style={s.sortTitle}>Сортировка</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[s.sortItem, sortKey === opt.key && s.sortItemOn]}
                onPress={() => { setSortKey(opt.key); setSortVisible(false); }}
                activeOpacity={0.8}
              >
                <Text style={[s.sortItemText, sortKey === opt.key && s.sortItemTextOn]}>
                  {opt.label}
                </Text>
                {sortKey === opt.key && (
                  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                    <Path d="M3 8l4 4 6-7" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return String(n);
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 20, paddingTop: 40, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.8, color: theme.text },
  showAll: { fontSize: 13, color: theme.text2, fontWeight: '500' },
  searchRow: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, height: 42, gap: 10,
  },
  searchInput: { flex: 1, color: theme.text, fontSize: 14 } as any,
  sortHint: { alignItems: 'flex-end', marginTop: -4 },
  sortHintText: { fontSize: 11, color: theme.text3 },
  tabsRow: { gap: 8, paddingBottom: 4 },
  tab: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14,
  },
  tabOn: { backgroundColor: '#fff', borderColor: '#fff' },
  tabText: { fontSize: 12, fontWeight: '500', color: theme.text2 },
  tabTextOn: { color: '#000' },
  body: { flex: 1 },
  grid: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: {
    flex: 1,
    backgroundColor: theme.surface1, borderWidth: 1, borderColor: theme.border,
    borderRadius: 18, overflow: 'hidden',
  },
  cardImg: { height: 150, width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  nsfwBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(220,50,50,0.85)',
    borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6,
  },
  nsfwText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  newBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1, borderColor: theme.borderLight,
    borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6,
  },
  newText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  cardBody: { padding: 10, paddingHorizontal: 12, paddingBottom: 12 },
  cardName: { fontSize: 13, fontWeight: '600', color: theme.text, letterSpacing: -0.1, marginBottom: 3 },
  cardSub:  { fontSize: 10, color: theme.text3, marginBottom: 6 },
  cardStats: { flexDirection: 'row', gap: 8 },
  cardStatRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardStat:  { fontSize: 10, color: theme.text2 },
  emptyText: { color: theme.text3, fontSize: 14, textAlign: 'center', paddingVertical: 40 },
  // Sort modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  sortCard: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 20, padding: 20, width: 260, gap: 4,
  },
  sortTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 8, letterSpacing: -0.3 },
  sortItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 12,
  },
  sortItemOn: { backgroundColor: '#FFFFFF' },
  sortItemText: { fontSize: 14, color: theme.text, fontWeight: '500' },
  sortItemTextOn: { color: '#000000', fontWeight: '600' },
});
