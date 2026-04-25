import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line } from 'react-native-svg';

import { theme, cardBg } from '../theme';
import {
  BrainIcon, SpiralIcon, SwordIcon, AtomIcon,
  HeadphonesIcon, LightningIcon, CrownIcon,
  VinciIcon, ChiselIcon, QuillIcon, DnaIcon, AppleIcon, CoilIcon,
  VictoryIcon, TopHatIcon, DialogueIcon, ScrollIcon, CaveIcon,
  YinYangIcon, WheelIcon, TrebleIcon, PianoIcon, SnowflakeIcon,
  RavenIcon, MaskIcon, HammerPhilIcon, FistIcon,
  CosmosIcon, RocketIcon, ChipIcon, WinGridIcon, StockChartIcon,
  KiteIcon, BearIcon, Star5Icon, CharkhaIcon, ChainsIcon,
  DoveIcon, LaurelIcon, LanternIcon, AnchorIcon, SceptreIcon,
  AxeIcon, ShieldCrossIcon, SabersIcon, TelescopeIcon, RomanovIcon,
  HelmetIcon, LyreIcon, CandleIcon, WheatIcon, GuitarIcon, EyeMysticIcon, TableChemIcon,
  FlaskIcon, GobletIcon, JokerCardIcon, WolfIcon, BladesIcon, NoteBookIcon, CakeIcon,
  WingsIcon, TitanIcon, SaiyanIcon, StrawHatIcon, BoxingGloveIcon, SoccerBallIcon,
  CigarIcon, RoseIcon, FedoraIcon, PencilIcon, WandIcon, LightsaberIcon, StaffIcon,
  SharinganIcon, FlameIcon, ThreeSwordsIcon, LeafBandIcon, AutomailIcon,
  CowboyHatIcon, BarcodeIcon, HiddenBladeIcon, VisorIcon,
  BannerIcon, HordeIcon, SyringeIcon, CaneIcon,
  ChidoriIcon, GauntletIcon, MuscleIcon, MorningStarIcon, PlugIcon,
  SoapIcon, FeatherIcon, BowlerHatIcon, CoinFlipIcon, ChessIcon,
  WarMapIcon, MandalaIcon, AnkhIcon, DualGunIcon, RingIcon,
  MushroomIcon, ElderBloodIcon, SunflowerIcon, CarnationIcon, FangIcon,
  KunaiIcon, AtFieldIcon, ThunderboltIcon, MoonSceptreIcon, BusterIcon,
  TriforceIcon, BandanaIcon, MicrophoneIcon, ShadesIcon, WebIcon,
  BatSymbolIcon, ChampagneIcon, HeaddressIcon, LotusIcon, PipeSmokeIcon,
  InkwellIcon, BatonIcon, PastaIcon, JumpmanIcon, MouthguardIcon,
  ScarfIcon, PowerupIcon, DragonslayerIcon, EyePatchIcon,
  RebellionIcon, Compass2Icon, SpearIcon, GloveIcon,
  RastaIcon, LipsIcon, NunchakuIcon, ZigzagIcon,
  CartoucheIcon, SpartanIcon, CapIcon, PrismIcon,
  BeakerIcon, QueenCrownIcon, RacketIcon, WorldCupIcon,
  ManuscriptIcon, BirchIcon, MegaphoneIcon, GrandPianoIcon,
  PeaceAtomIcon, BarbedWireIcon, FeatherPenIcon, TroikaIcon, AutumnLeafIcon,
  SearchIcon, MessageIcon, StarIcon,
} from '../icons';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { Character, CATEGORIES } from '../data/characters';

type CardKey = keyof typeof cardBg;
type SortKey = 'rating' | 'messages' | 'alpha' | 'new';

const TABS = ['Все', ...CATEGORIES.slice(1)];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating',   label: 'По рейтингу' },
  { key: 'messages', label: 'По популярности' },
  { key: 'alpha',    label: 'По алфавиту' },
  { key: 'new',      label: 'Сначала новые' },
];

function CharacterIcon({ iconType, size }: { iconType: string; size: number }) {
  switch (iconType) {
    case 'brain':       return <BrainIcon size={size} />;
    case 'spiral':      return <SpiralIcon size={size} />;
    case 'sword':       return <SwordIcon size={size} />;
    case 'atom':        return <AtomIcon size={size} />;
    case 'headphones':  return <HeadphonesIcon size={size} />;
    case 'lightning':   return <LightningIcon size={size} />;
    case 'crown':       return <CrownIcon size={size} />;
    case 'vinci':       return <VinciIcon size={size} />;
    case 'chisel':      return <ChiselIcon size={size} />;
    case 'quill':       return <QuillIcon size={size} />;
    case 'dna':         return <DnaIcon size={size} />;
    case 'apple':       return <AppleIcon size={size} />;
    case 'coil':        return <CoilIcon size={size} />;
    case 'victory':     return <VictoryIcon size={size} />;
    case 'tophat':      return <TopHatIcon size={size} />;
    case 'dialogue':    return <DialogueIcon size={size} />;
    case 'scroll':      return <ScrollIcon size={size} />;
    case 'cave':        return <CaveIcon size={size} />;
    case 'yinyang':     return <YinYangIcon size={size} />;
    case 'wheel':       return <WheelIcon size={size} />;
    case 'treble':      return <TrebleIcon size={size} />;
    case 'piano':       return <PianoIcon size={size} />;
    case 'snowflake':   return <SnowflakeIcon size={size} />;
    case 'raven':       return <RavenIcon size={size} />;
    case 'mask':        return <MaskIcon size={size} />;
    case 'hammerphil':  return <HammerPhilIcon size={size} />;
    case 'fist':        return <FistIcon size={size} />;
    case 'cosmos':      return <CosmosIcon size={size} />;
    case 'rocket':      return <RocketIcon size={size} />;
    case 'chip':        return <ChipIcon size={size} />;
    case 'wingrid':     return <WinGridIcon size={size} />;
    case 'stockchart':  return <StockChartIcon size={size} />;
    case 'kite':        return <KiteIcon size={size} />;
    case 'bear':        return <BearIcon size={size} />;
    case 'star5':       return <Star5Icon size={size} />;
    case 'charkha':     return <CharkhaIcon size={size} />;
    case 'chains':      return <ChainsIcon size={size} />;
    case 'dove':        return <DoveIcon size={size} />;
    case 'laurel':      return <LaurelIcon size={size} />;
    case 'lantern':     return <LanternIcon size={size} />;
    case 'anchor':      return <AnchorIcon size={size} />;
    case 'sceptre':     return <SceptreIcon size={size} />;
    case 'axe':         return <AxeIcon size={size} />;
    case 'shieldcross': return <ShieldCrossIcon size={size} />;
    case 'sabers':      return <SabersIcon size={size} />;
    case 'telescope':   return <TelescopeIcon size={size} />;
    case 'romanov':     return <RomanovIcon size={size} />;
    case 'helmet':      return <HelmetIcon size={size} />;
    case 'lyre':        return <LyreIcon size={size} />;
    case 'candle':      return <CandleIcon size={size} />;
    case 'wheat':       return <WheatIcon size={size} />;
    case 'guitar':      return <GuitarIcon size={size} />;
    case 'eyemystic':   return <EyeMysticIcon size={size} />;
    case 'tablechem':   return <TableChemIcon size={size} />;
    case 'flask':       return <FlaskIcon size={size} />;
    case 'goblet':      return <GobletIcon size={size} />;
    case 'jokercard':   return <JokerCardIcon size={size} />;
    case 'wolf':        return <WolfIcon size={size} />;
    case 'blades':      return <BladesIcon size={size} />;
    case 'notebook':    return <NoteBookIcon size={size} />;
    case 'cake':        return <CakeIcon size={size} />;
    case 'wings':       return <WingsIcon size={size} />;
    case 'titan':       return <TitanIcon size={size} />;
    case 'saiyan':      return <SaiyanIcon size={size} />;
    case 'strawhat':    return <StrawHatIcon size={size} />;
    case 'boxingglove': return <BoxingGloveIcon size={size} />;
    case 'soccerball':  return <SoccerBallIcon size={size} />;
    case 'cigar':       return <CigarIcon size={size} />;
    case 'rose':        return <RoseIcon size={size} />;
    case 'fedora':      return <FedoraIcon size={size} />;
    case 'pencil':      return <PencilIcon size={size} />;
    case 'wand':        return <WandIcon size={size} />;
    case 'lightsaber':  return <LightsaberIcon size={size} />;
    case 'staff':       return <StaffIcon size={size} />;
    case 'sharingan':   return <SharinganIcon size={size} />;
    case 'flame':       return <FlameIcon size={size} />;
    case 'threeswords': return <ThreeSwordsIcon size={size} />;
    case 'leafband':    return <LeafBandIcon size={size} />;
    case 'automail':    return <AutomailIcon size={size} />;
    case 'cowboyhat':   return <CowboyHatIcon size={size} />;
    case 'barcode':     return <BarcodeIcon size={size} />;
    case 'hiddenblade': return <HiddenBladeIcon size={size} />;
    case 'visor':       return <VisorIcon size={size} />;
    case 'banner':      return <BannerIcon size={size} />;
    case 'horde':       return <HordeIcon size={size} />;
    case 'syringe':     return <SyringeIcon size={size} />;
    case 'cane':        return <CaneIcon size={size} />;
    case 'chidori':     return <ChidoriIcon size={size} />;
    case 'gauntlet':    return <GauntletIcon size={size} />;
    case 'muscle':      return <MuscleIcon size={size} />;
    case 'morningstar': return <MorningStarIcon size={size} />;
    case 'plug':        return <PlugIcon size={size} />;
    case 'soap':        return <SoapIcon size={size} />;
    case 'feather':     return <FeatherIcon size={size} />;
    case 'bowlerhat':   return <BowlerHatIcon size={size} />;
    case 'coinflip':    return <CoinFlipIcon size={size} />;
    case 'chess':       return <ChessIcon size={size} />;
    case 'warmap':      return <WarMapIcon size={size} />;
    case 'mandala':     return <MandalaIcon size={size} />;
    case 'ankh':        return <AnkhIcon size={size} />;
    case 'dualgun':     return <DualGunIcon size={size} />;
    case 'ring':        return <RingIcon size={size} />;
    case 'mushroom':    return <MushroomIcon size={size} />;
    case 'elderblood':  return <ElderBloodIcon size={size} />;
    case 'sunflower':   return <SunflowerIcon size={size} />;
    case 'carnation':   return <CarnationIcon size={size} />;
    case 'fang':        return <FangIcon size={size} />;
    case 'kunai':       return <KunaiIcon size={size} />;
    case 'atfield':     return <AtFieldIcon size={size} />;
    case 'thunderbolt': return <ThunderboltIcon size={size} />;
    case 'moonsceptre': return <MoonSceptreIcon size={size} />;
    case 'buster':      return <BusterIcon size={size} />;
    case 'triforce':    return <TriforceIcon size={size} />;
    case 'bandana':     return <BandanaIcon size={size} />;
    case 'microphone':  return <MicrophoneIcon size={size} />;
    case 'shades':      return <ShadesIcon size={size} />;
    case 'web':         return <WebIcon size={size} />;
    case 'batsymbol':   return <BatSymbolIcon size={size} />;
    case 'champagne':   return <ChampagneIcon size={size} />;
    case 'headdress':   return <HeaddressIcon size={size} />;
    case 'lotus':       return <LotusIcon size={size} />;
    case 'pipesmoke':   return <PipeSmokeIcon size={size} />;
    case 'inkwell':     return <InkwellIcon size={size} />;
    case 'baton':       return <BatonIcon size={size} />;
    case 'pasta':       return <PastaIcon size={size} />;
    case 'jumpman':     return <JumpmanIcon size={size} />;
    case 'mouthguard':  return <MouthguardIcon size={size} />;
    case 'scarf':       return <ScarfIcon size={size} />;
    case 'powerup':     return <PowerupIcon size={size} />;
    case 'dragonslayer':return <DragonslayerIcon size={size} />;
    case 'eyepatch':    return <EyePatchIcon size={size} />;
    case 'rebellion':   return <RebellionIcon size={size} />;
    case 'compass2':    return <Compass2Icon size={size} />;
    case 'spear':       return <SpearIcon size={size} />;
    case 'glove':       return <GloveIcon size={size} />;
    case 'rasta':       return <RastaIcon size={size} />;
    case 'lips':        return <LipsIcon size={size} />;
    case 'nunchaku':    return <NunchakuIcon size={size} />;
    case 'zigzag':      return <ZigzagIcon size={size} />;
    case 'cartouche':   return <CartoucheIcon size={size} />;
    case 'spartan':     return <SpartanIcon size={size} />;
    case 'cap':         return <CapIcon size={size} />;
    case 'prism':       return <PrismIcon size={size} />;
    case 'beaker':      return <BeakerIcon size={size} />;
    case 'queencrown':  return <QueenCrownIcon size={size} />;
    case 'racket':      return <RacketIcon size={size} />;
    case 'worldcup':    return <WorldCupIcon size={size} />;
    case 'manuscript':  return <ManuscriptIcon size={size} />;
    case 'birch':       return <BirchIcon size={size} />;
    case 'megaphone':   return <MegaphoneIcon size={size} />;
    case 'grandpiano':  return <GrandPianoIcon size={size} />;
    case 'peaceatom':   return <PeaceAtomIcon size={size} />;
    case 'barbedwire':  return <BarbedWireIcon size={size} />;
    case 'featherpen':  return <FeatherPenIcon size={size} />;
    case 'troika':      return <TroikaIcon size={size} />;
    case 'autumnleaf':  return <AutumnLeafIcon size={size} />;
    default:            return <BrainIcon size={size} />;
  }
}

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
                  colors={cardBg[c.gradientKey as CardKey] ?? cardBg.freud}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.cardImg}
                >
                  <CharacterIcon iconType={c.iconType} size={52} />
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
  cardImg: { height: 150, width: '100%', alignItems: 'center', justifyContent: 'center' },
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
