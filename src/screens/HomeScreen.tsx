import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Modal, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { theme, cardBg } from '../theme';
import {
  LogoImageSmall, BrainIcon, SpiralIcon, SwordIcon,
  AtomIcon, HeadphonesIcon, LightningIcon, CrownIcon,
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
  SearchIcon, ChevronRightIcon,
  SparkleIcon, InfinityIcon, AgeRestrictedIcon, PaletteIcon, StarIcon,
} from '../icons';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { Character, CATEGORIES } from '../data/characters';

type CardKey = keyof typeof cardBg;

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

const PRO_FEATURES: { Icon: React.ComponentType<{ size?: number; color?: string }>; text: string }[] = [
  { Icon: InfinityIcon,       text: 'Неограниченные сообщения' },
  { Icon: BrainIcon,          text: 'Расширенная долгосрочная память' },
  { Icon: LightningIcon,      text: 'Приоритетные ответы без задержек' },
  { Icon: AgeRestrictedIcon,  text: 'Доступ ко всему контенту 18+' },
  { Icon: StarIcon,           text: 'Эксклюзивные персонажи' },
  { Icon: PaletteIcon,        text: 'Кастомные темы и фоны' },
];

export default function HomeScreen() {
  const { navigate, characters, chats, user } = useApp();
  const [activeCat, setActiveCat] = useState('Все');
  const [search, setSearch] = useState('');
  const [proVisible, setProVisible] = useState(false);

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

  const openChat = (char: Character) => navigate('chat', char);

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
              {featured.map((c) => (
                <TouchableOpacity key={c.id} style={s.featCard}
                  onPress={() => openChat(c)} activeOpacity={0.85}>
                  <LinearGradient
                    colors={cardBg[c.gradientKey as CardKey] ?? cardBg.freud}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.featImg}
                  >
                    <CharacterIcon iconType={c.iconType} size={52} />
                  </LinearGradient>
                  {c.isNew && (
                    <View style={s.featBadge}>
                      <Text style={[s.featBadgeText, { color: theme.accentLight }]}>ТОП</Text>
                    </View>
                  )}
                  <View style={s.featInfo}>
                    <Text style={s.featName}>{c.name}</Text>
                    <Text style={s.featDesc}>{c.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
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

            <TouchableOpacity style={s.upgradeBanner} onPress={() => setProVisible(true)} activeOpacity={0.85}>
              <Image source={require('../icons/invertLogo.png')} style={{ width: 56, height: 30, tintColor: theme.text }} />
              <View style={{ flex: 1 }}>
                <Text style={s.upgradeTitle}>Интерстеллар Про</Text>
                <Text style={s.upgradeSub}>Неограниченный чат, память, голос — от 299 ₽/мес</Text>
              </View>
              <ChevronRightIcon color={theme.text2} />
            </TouchableOpacity>
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
                    colors={cardBg[item.gradientKey as CardKey] ?? cardBg.freud}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.recentAvatar}
                  >
                    <CharacterIcon iconType={item.iconType} size={26} />
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
                          colors={cardBg[item.gradientKey as CardKey] ?? cardBg.freud}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                          style={s.recentAvatar}
                        >
                          <CharacterIcon iconType={item.iconType} size={26} />
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

      <Modal visible={proVisible} transparent animationType="fade" onRequestClose={() => setProVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setProVisible(false)}>
          <TouchableOpacity style={s.proCard} activeOpacity={1} onPress={() => {}}>
            <View style={s.proTitleRow}>
              <Text style={s.proTitle}>Интерстеллар Про</Text>
              <View style={{ marginTop: 2 }}><LogoImageSmall size={20} /></View>
            </View>
            <Text style={s.proSubtitle}>Открой полный доступ</Text>
            <View style={s.proFeatures}>
              {PRO_FEATURES.map(f => (
                <View key={f.text} style={s.proFeatureRow}>
                  <f.Icon size={15} color={theme.text2} />
                  <Text style={s.proFeature}>{f.text}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={s.proBuyBtn} activeOpacity={0.9}
              onPress={() => { setProVisible(false); Alert.alert('Скоро', 'Оплата появится в ближайшем обновлении.'); }}>
              <Text style={s.proBuyText}>299 ₽ / месяц</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setProVisible(false)} activeOpacity={0.7}>
              <Text style={s.proClose}>Не сейчас</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  },
  featBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1, borderColor: theme.borderLight,
    borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8,
  },
  featBadgeText: { fontSize: 10, fontWeight: '600' },
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
  proTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  proCard: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', gap: 16,
  },
  proTitle: { fontSize: 22, fontWeight: '800', color: theme.text, letterSpacing: -0.6 },
  proSubtitle: { fontSize: 13, color: theme.text3, marginTop: -8 },
  proFeatures: { width: '100%', gap: 10 },
  proFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  proFeature: { fontSize: 14, color: theme.text, lineHeight: 20, flex: 1 },
  proBuyBtn: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%',
    paddingVertical: 16, alignItems: 'center',
  },
  proBuyText: { fontSize: 16, fontWeight: '700', color: '#000' },
  proClose: { fontSize: 13, color: theme.text3, paddingVertical: 4 },
});
