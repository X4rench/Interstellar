import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../theme';
import {
  LogoImageSmall,
  SearchIcon, ChevronRightIcon,
  AgeRestrictedIcon,
} from '../icons';
import BottomNav from '../components/BottomNav';
import { CharacterIcon } from '../components/CharacterIcon';
import { getCharacterGradient } from '../utils/gradients';
import { useApp } from '../context/AppContext';
import { Character, CATEGORIES } from '../data/characters';

export default function HomeScreen() {
  const { navigate, characters, chats, user, isPremium, openPaywall, canOpenCharacter } = useApp();
  const [activeCat, setActiveCat] = useState('Все');
  const [search, setSearch] = useState('');

  const featured = useMemo(() =>
    characters.slice(0, 4),
  [characters]);

  const filtered = useMemo(() => {
    let list = characters;
    if (activeCat !== 'Все') list = list.filter(c => c.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    return list;
  }, [characters, activeCat, search]);

  const recentChars = useMemo(() => {
    return characters
      .filter(c => chats[c.id] && chats[c.id].length > 0)
      .slice(0, 4);
  }, [characters, chats]);

  const avatarLetter = user?.name?.[0]?.toUpperCase() ?? 'А';

  // NSFW-гейт: для не-Pro персонажей с isNSFW открывается paywall
  // вместо чата. Pro-юзеры идут напрямую.
  const openChat = (char: Character) => {
    if (!canOpenCharacter(char)) {
      openPaywall('nsfw');
      return;
    }
    navigate('chat', char);
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={{ marginTop: 4 }}><LogoImageSmall size={30} /></View>
          <Text style={s.logoText}>интерстеллар</Text>
        </View>
        <TouchableOpacity style={s.avatar} onPress={() => navigate('profile')}>
          <Text style={s.avatarLetter}>{avatarLetter}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchBar}>
        <SearchIcon />
        <TextInput
          style={s.searchInput}
          placeholder="Найти персонажа или кумира..."
          placeholderTextColor={theme.text3}
          value={search}
          onChangeText={setSearch}
          underlineColorAndroid="transparent"
        />
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* Популярные */}
        {!search && (
          <>
            <View style={s.secRow}>
              <Text style={s.secTitle}>Популярные</Text>
              <TouchableOpacity onPress={() => navigate('library')}>
                <Text style={s.secMore}>Все →</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.hScroll}>
              {featured.map((c) => {
                const locked = c.isNSFW && !isPremium;
                return (
                  <TouchableOpacity key={c.id} style={s.featCard}
                    onPress={() => openChat(c)} activeOpacity={0.85}>
                    <LinearGradient
                      colors={getCharacterGradient(c) as [string, string]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={s.featImg}
                    >
                      <CharacterIcon iconType={c.iconType} size={52} avatarUri={c.avatarUri} />
                    </LinearGradient>
                    {locked ? (
                      <View style={[s.featBadge, s.featBadgeLock]}>
                        <AgeRestrictedIcon size={10} color="#FFFFFF" />
                        <Text style={[s.featBadgeText, { color: '#FFFFFF', marginLeft: 3 }]}>PRO</Text>
                      </View>
                    ) : c.isNew ? (
                      <View style={s.featBadge}>
                        <Text style={[s.featBadgeText, { color: theme.accentLight }]}>ТОП</Text>
                      </View>
                    ) : null}
                    <View style={s.featInfo}>
                      <Text style={s.featName}>{c.name}</Text>
                      <Text style={s.featDesc}>{c.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Категории */}
            <View style={[s.secRow, { paddingTop: 18 }]}>
              <Text style={s.secTitle}>Категории</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.hScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[s.catPill, activeCat === cat && s.catPillOn]}
                  onPress={() => setActiveCat(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.catText, activeCat === cat && s.catTextOn]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {!isPremium && (
              <TouchableOpacity style={s.upgradeBanner} onPress={() => openPaywall('manual')} activeOpacity={0.85}>
                <Image source={require('../icons/invertLogo.png')} style={{ width: 56, height: 30, tintColor: theme.text }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.upgradeTitle}>Интерстеллар Pro</Text>
                  <Text style={s.upgradeSub}>3 дня бесплатно · затем 799 ₽/мес</Text>
                </View>
                <ChevronRightIcon color={theme.text2} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Результаты поиска */}
        {search ? (
          <>
            <View style={s.secRow}>
              <Text style={s.secTitle}>Результаты: {filtered.length}</Text>
            </View>
            <View style={s.recentList}>
              {filtered.map((item, i) => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.recentItem, i === filtered.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => openChat(item)}
                  activeOpacity={0.75}
                >
                  <LinearGradient
                    colors={getCharacterGradient(item) as [string, string]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.recentAvatar}
                  >
                    <CharacterIcon iconType={item.iconType} size={26} avatarUri={item.avatarUri} />
                  </LinearGradient>
                  <View style={s.recentInfo}>
                    <Text style={s.recentName}>{item.name}</Text>
                    <Text style={s.recentMsg} numberOfLines={1}>{item.description}</Text>
                  </View>
                  <ChevronRightIcon color={theme.text3} />
                </TouchableOpacity>
              ))}
              {filtered.length === 0 && (
                <Text style={s.emptyText}>Ничего не найдено</Text>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Недавние */}
            <View style={s.secRow}>
              <Text style={s.secTitle}>Недавние</Text>
            </View>

            <View style={s.recentList}>
              {recentChars.length === 0 ? (
                <Text style={s.emptyText}>Начните чат с персонажем →</Text>
              ) : (
                recentChars.map((item, i) => {
                  const msgs = chats[item.id] || [];
                  const lastMsg = msgs[msgs.length - 1];
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[s.recentItem, i === recentChars.length - 1 && { borderBottomWidth: 0 }]}
                      onPress={() => openChat(item)}
                      activeOpacity={0.75}
                    >
                      <View>
                        <LinearGradient
                          colors={getCharacterGradient(item) as [string, string]}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                          style={s.recentAvatar}
                        >
                          <CharacterIcon iconType={item.iconType} size={26} avatarUri={item.avatarUri} />
                        </LinearGradient>
                      </View>
                      <View style={s.recentInfo}>
                        <Text style={s.recentName} numberOfLines={1}>{item.name}</Text>
                        <Text style={s.recentMsg} numberOfLines={1}>
                          {lastMsg ? (lastMsg.role === 'user' ? 'Вы: ' : '') + lastMsg.text : item.firstMessage}
                        </Text>
                      </View>
                      <View style={s.recentMeta}>
                        <Text style={s.recentTime}>
                          {lastMsg?.time ?? ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      <BottomNav activeTab="home" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 40,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoText: { fontSize: 17, fontWeight: '700', letterSpacing: -0.7, color: theme.text },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: theme.surface3,
    borderWidth: 1, borderColor: theme.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontSize: 13, fontWeight: '600', color: '#fff' },
  searchBar: {
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: theme.surface2,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 12,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, height: 42, gap: 10,
  },
  searchInput: { flex: 1, color: theme.text, fontSize: 14 },
  body: { flex: 1 },
  secRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  secTitle: { fontSize: 16, fontWeight: '600', letterSpacing: -0.3, color: theme.text },
  secMore:  { fontSize: 13, color: theme.text2, fontWeight: '500' },
  hScroll: { paddingHorizontal: 20, gap: 12 },
  featCard: {
    width: 150, backgroundColor: theme.surface1,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 18, overflow: 'hidden',
  },
  featImg: {
    width: '100%', height: 130,
    alignItems: 'center', justifyContent: 'center',
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  featBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1, borderColor: theme.borderLight,
    borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8,
    flexDirection: 'row', alignItems: 'center',
  },
  featBadgeLock: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  featBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  featInfo: { padding: 10, paddingHorizontal: 12, paddingBottom: 12 },
  featName: { fontSize: 13, fontWeight: '600', color: theme.text, letterSpacing: -0.1, marginBottom: 3 },
  featDesc: { fontSize: 11, color: theme.text3, lineHeight: 15 },
  catPill: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14,
  },
  catPillOn: { backgroundColor: '#fff', borderColor: '#fff' },
  catText:   { fontSize: 12, fontWeight: '500', color: theme.text2 },
  catTextOn: { color: '#000' },
  upgradeBanner: {
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.borderLight,
    borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  upgradeTitle: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 2 },
  upgradeSub:   { fontSize: 11, color: theme.text3 },
  recentList: { paddingHorizontal: 20 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  recentAvatar: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: theme.green, borderWidth: 2, borderColor: theme.bg,
  },
  recentInfo: { flex: 1, minWidth: 0 },
  recentName: { fontSize: 14, fontWeight: '600', letterSpacing: -0.1, color: theme.text, marginBottom: 2 },
  recentMsg:  { fontSize: 12, color: theme.text3 },
  recentMeta: { alignItems: 'flex-end', gap: 4 },
  recentTime: { fontSize: 11, color: theme.text3 },
  unreadBadge: {
    backgroundColor: '#fff', borderRadius: 10,
    paddingVertical: 2, paddingHorizontal: 7, minWidth: 18, alignItems: 'center',
  },
  unreadText: { fontSize: 10, fontWeight: '700', color: '#000' },
  emptyText: { color: theme.text3, fontSize: 14, textAlign: 'center', paddingVertical: 24 },
});
