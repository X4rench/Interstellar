import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme, cardBg } from '../theme';
import {
  BackIcon, SmileIcon, BrainIcon, MoonIcon, FlowerIcon, LightningIcon, ShieldIcon,
  SpiralIcon, SwordIcon, AtomIcon, HeadphonesIcon, CrownIcon,
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
} from '../icons';
import { useApp } from '../context/AppContext';
import { Character } from '../data/characters';

type CardKey = keyof typeof cardBg;

const DRAFT_KEY = 'create_draft';

interface Draft {
  name: string;
  description: string;
  persona: string;
  firstMessage: string;
  selectedMoods: string[];
  nsfw: boolean;
  memory: boolean;
  gradientIdx: number;
  iconIdx: number;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <TouchableOpacity
      style={[s.toggle, value && s.toggleOn]}
      onPress={() => onChange(!value)}
      activeOpacity={0.9}
    >
      <View style={[
        s.toggleKnob,
        value
          ? { right: 3, left: undefined, backgroundColor: '#000000' }
          : { left: 3, right: undefined, backgroundColor: '#FFFFFF' },
      ]} />
    </TouchableOpacity>
  );
}

const MOODS: { id: string; label: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { id: 'flirt',  label: 'Флиртующий', Icon: SmileIcon },
  { id: 'smart',  label: 'Умный',       Icon: BrainIcon },
  { id: 'dark',   label: 'Тёмный',      Icon: MoonIcon },
  { id: 'gentle', label: 'Нежный',      Icon: FlowerIcon },
  { id: 'bold',   label: 'Дерзкий',     Icon: LightningIcon },
  { id: 'loyal',  label: 'Верный',      Icon: ShieldIcon },
];

const GRADIENT_KEYS: CardKey[] = ['freud', 'anime', 'arya', 'einstein', 'miku', 'stranger', 'cleopatra'];
const ICON_TYPES = ['brain', 'spiral', 'sword', 'atom', 'headphones', 'lightning', 'crown'];

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
    default:            return <BrainIcon size={size} />;
  }
}

export default function CreateScreen() {
  const { navigate, addCharacter } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [persona, setPersona] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>(['flirt', 'bold']);
  const [nsfw, setNsfw] = useState(false);
  const [memory, setMemory] = useState(true);
  const [gradientIdx, setGradientIdx] = useState(0);
  const [iconIdx, setIconIdx] = useState(0);
  const [error, setError] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);

  // Load draft on mount
  useEffect(() => {
    AsyncStorage.getItem(DRAFT_KEY).then(json => {
      if (!json) return;
      try {
        const d: Draft = JSON.parse(json);
        setName(d.name || '');
        setDescription(d.description || '');
        setPersona(d.persona || '');
        setFirstMessage(d.firstMessage || '');
        setSelectedMoods(d.selectedMoods || ['flirt', 'bold']);
        setNsfw(d.nsfw ?? false);
        setMemory(d.memory ?? true);
        setGradientIdx(d.gradientIdx ?? 0);
        setIconIdx(d.iconIdx ?? 0);
      } catch {}
    }).catch(() => {});
  }, []);

  const saveDraft = async () => {
    const draft: Draft = { name, description, persona, firstMessage, selectedMoods, nsfw, memory, gradientIdx, iconIdx };
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft)).catch(() => {});
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const toggleMood = (id: string) => {
    setSelectedMoods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    if (!name.trim()) { setError('Введите имя персонажа'); return; }
    if (!description.trim()) { setError('Добавьте описание'); return; }
    if (!firstMessage.trim()) { setError('Добавьте первое сообщение персонажа'); return; }

    const newChar: Character = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category: 'Кумиры',
      iconType: ICON_TYPES[iconIdx],
      gradientKey: GRADIENT_KEYS[gradientIdx],
      tags: selectedMoods.map(m => MOODS.find(x => x.id === m)?.label ?? m),
      messages: 0,
      rating: 5.0,
      isNew: true,
      isNSFW: nsfw,
      firstMessage: firstMessage.trim(),
      persona: persona.trim() || `${name.trim()}. ${description.trim()}`,
      userCreated: true,
    };

    AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
    addCharacter(newChar);
    navigate('chat', newChar);
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigate('home')} activeOpacity={0.7}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Создать персонажа</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={saveDraft}>
          <Text style={[s.draftBtn, draftSaved && s.draftBtnSaved]}>
            {draftSaved ? 'Сохранено ✓' : 'Черновик'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}
        contentContainerStyle={s.bodyContent}>

        {/* Avatar + gradient picker */}
        <View style={s.avatarSection}>
          <TouchableOpacity
            style={s.avatarPicker}
            onPress={() => { const next = (iconIdx + 1) % ICON_TYPES.length; setIconIdx(next); setGradientIdx(next); }}
            activeOpacity={0.8}
          >
            <CharacterIcon iconType={ICON_TYPES[iconIdx]} size={40} />
          </TouchableOpacity>
          <Text style={s.avatarHint}>Нажми для смены иконки</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
            {GRADIENT_KEYS.map((key, i) => (
              <TouchableOpacity
                key={key}
                onPress={() => { setGradientIdx(i); setIconIdx(i); }}
                style={[s.colorDot, gradientIdx === i && s.colorDotOn]}
              >
                <View style={[s.colorDotInner, { backgroundColor: cardBg[key][0] }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Name */}
        <View style={s.field}>
          <Text style={s.label}>Имя персонажа</Text>
          <TextInput
            style={s.input}
            placeholder="Например: Виктор, Элизабет..."
            placeholderTextColor={theme.text3}
            value={name}
            onChangeText={t => { setName(t); setError(''); }}
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Description */}
        <View style={s.field}>
          <Text style={s.label}>Краткое описание</Text>
          <TextInput
            style={s.input}
            placeholder="Детектив из Петербурга, 1890-е..."
            placeholderTextColor={theme.text3}
            value={description}
            onChangeText={t => { setDescription(t); setError(''); }}
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Persona */}
        <View style={s.field}>
          <Text style={s.label}>Характер и поведение</Text>
          <TextInput
            style={[s.input, s.textarea]}
            placeholder="Опишите как персонаж говорит, думает, что любит, как реагирует..."
            placeholderTextColor={theme.text3}
            multiline
            numberOfLines={4}
            value={persona}
            onChangeText={setPersona}
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Moods */}
        <View style={s.field}>
          <Text style={s.label}>Настроение</Text>
          <View style={s.moodsGrid}>
            {MOODS.map((m) => {
              const on = selectedMoods.includes(m.id);
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[s.moodChip, on && s.moodChipOn]}
                  onPress={() => toggleMood(m.id)}
                  activeOpacity={0.8}
                >
                  <m.Icon size={14} color={on ? '#000' : theme.text2} />
                  <Text style={[s.moodLabel, on && s.moodLabelOn]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* First message */}
        <View style={s.field}>
          <Text style={s.label}>Первое сообщение</Text>
          <TextInput
            style={[s.input, s.textarea]}
            placeholder="С этого начнётся разговор..."
            placeholderTextColor={theme.text3}
            multiline
            numberOfLines={3}
            value={firstMessage}
            onChangeText={t => { setFirstMessage(t); setError(''); }}
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Toggles */}
        <View style={s.togglesSection}>
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleTitle}>Режим 18+</Text>
              <Text style={s.toggleSub}>Откровенный контент</Text>
            </View>
            <Toggle value={nsfw} onChange={setNsfw} />
          </View>
          <View style={s.divider} />
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleTitle}>Долгосрочная память</Text>
              <Text style={s.toggleSub}>Персонаж помнит прошлые чаты</Text>
            </View>
            <Toggle value={memory} onChange={setMemory} />
          </View>
        </View>

        {!!error && <Text style={s.errorText}>{error}</Text>}

        <TouchableOpacity style={s.createBtn} onPress={handleCreate} activeOpacity={0.9}>
          <Text style={s.createBtnText}>Создать персонажа ✦</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 40, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12,
  },
  backBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', letterSpacing: -0.3, color: theme.text },
  draftBtn: { fontSize: 14, color: theme.text2, fontWeight: '500' },
  draftBtnSaved: { color: theme.green },
  body: { flex: 1 },
  bodyContent: { padding: 20, gap: 20 },

  avatarSection: { alignItems: 'center', paddingVertical: 8 },
  avatarPicker: {
    width: 96, height: 96, borderRadius: 28,
    borderWidth: 2, borderStyle: 'dashed', borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarHint: { fontSize: 11, color: theme.text3, marginTop: 8 },
  colorDot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  colorDotOn: { borderColor: '#fff' },
  colorDotInner: { width: 22, height: 22, borderRadius: 11 },

  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: theme.text2, letterSpacing: 0.2 },
  input: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: theme.text, fontSize: 14,
  },
  textarea: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },

  moodsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12,
  },
  moodChipOn: { backgroundColor: '#fff', borderColor: '#fff' },
  moodLabel: { fontSize: 12, fontWeight: '500', color: theme.text2 },
  moodLabelOn: { color: '#000' },

  togglesSection: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 16, overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  divider: { height: 1, backgroundColor: theme.border, marginHorizontal: 16 },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 14, fontWeight: '500', color: theme.text, marginBottom: 2 },
  toggleSub:   { fontSize: 12, color: theme.text3 },
  toggle: {
    width: 44, height: 26, backgroundColor: theme.surface3,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 13, justifyContent: 'center',
  },
  toggleOn: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  toggleKnob: {
    position: 'absolute',
    width: 20, height: 20, borderRadius: 10,
  },

  errorText: { fontSize: 13, color: '#FF4444', textAlign: 'center' },
  createBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  createBtnText: { color: '#000', fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },
});
