import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme';
import { NavHomeIcon, NavCatalogIcon, NavMyIcon, NavProfileIcon } from '../icons';
import { useApp } from '../context/AppContext';

export type ActiveTab = 'home' | 'library' | 'mine' | 'profile';

interface Props {
  activeTab: ActiveTab;
}

export default function BottomNav({ activeTab }: Props) {
  const { navigate, setLibraryFilter } = useApp();
  const c = (tab: ActiveTab) => activeTab === tab ? theme.accentLight : theme.text3;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={() => navigate('home')} activeOpacity={0.7}>
        <NavHomeIcon color={c('home')} />
        <Text style={[styles.label, { color: c('home') }]}>Главная</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => { setLibraryFilter('all'); navigate('library'); }}
        activeOpacity={0.7}
      >
        <NavCatalogIcon color={c('library')} />
        <Text style={[styles.label, { color: c('library') }]}>Каталог</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigate('create')} activeOpacity={0.8}>
        <View style={styles.addBtn}>
          <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <Path d="M9 3v12M3 9h12" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => { setLibraryFilter('mine'); navigate('library'); }}
        activeOpacity={0.7}
      >
        <NavMyIcon color={c('mine')} />
        <Text style={[styles.label, { color: c('mine') }]}>Мои</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigate('profile')} activeOpacity={0.7}>
        <NavProfileIcon color={c('profile')} />
        <Text style={[styles.label, { color: c('profile') }]}>Профиль</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.surface1,
    borderTopWidth: 1, borderTopColor: theme.border,
    paddingTop: 8, paddingBottom: 20,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 4 },
  label: { fontSize: 10, fontWeight: '500', letterSpacing: 0.1 },
  addBtn: {
    width: 42, height: 42, backgroundColor: '#FFFFFF',
    borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: -6,
    shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
});
