import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Animated, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

import { theme, cardBg } from '../theme';
import {
  BrainIcon, SpiralIcon, SwordIcon, AtomIcon, HeadphonesIcon, LightningIcon, CrownIcon,
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
  BackIcon, BulbIcon, SendIcon,
} from '../icons';
import { useApp, Message } from '../context/AppContext';
import { getOrCreateSession, sendMessage as apiSendMessage, clearSession } from '../utils/api';
import { getMockResponse } from '../utils/mockAI';

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
    default:            return <BrainIcon size={size} />;
  }
}

function TypingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -4, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(Math.max(0, 600 - delay)),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[s.typingDot, { transform: [{ translateY: anim }] }]} />;
}

function StarIcon({ filled, color = '#888888', size = 18 }: { filled?: boolean; color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M9 1l2 6h6L12 11l2 6-5-3.5L4 17l2-6L1 7h6z"
        stroke={color} strokeWidth="1.4" strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}

function MoreIcon({ color = '#888888', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9"  cy="9" r="1.5" fill={color} />
      <Circle cx="14" cy="9" r="1.5" fill={color} />
      <Circle cx="4"  cy="9" r="1.5" fill={color} />
    </Svg>
  );
}

function formatTime() {
  const now = new Date();
  return now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
}

export default function ChatScreen() {
  // ── Все хуки БЕЗУСЛОВНО вверху ───────────────────────────────────────────
  const {
    navigate, currentCharacter, chats,
    addMessage, clearChat, deleteCharacter,
    user, favorites, toggleFavorite,
  } = useApp();

  const [inputText, setInputText]     = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [memoryOn, setMemoryOn]       = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sessionId, setSessionId]     = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const charId   = currentCharacter?.id ?? '';
  const messages: Message[] = chats[charId] || [];
  const isEmptyChat = messages.length === 0;
  const isFavorite  = favorites.includes(charId);

  // Редирект если персонаж не задан
  useEffect(() => {
    if (!currentCharacter) navigate('home');
  }, [currentCharacter]);

  // Первое сообщение — добавляем когда чат пустой (включая после clearChat)
  useEffect(() => {
    if (!currentCharacter || !isEmptyChat) return;
    addMessage(currentCharacter.id, {
      id: `${currentCharacter.id}_first`,
      role: 'character',
      text: currentCharacter.firstMessage,
      time: formatTime(),
      date: new Date().toISOString(),
    });
  }, [charId, isEmptyChat]);

  // Создаём API-сессию при открытии нового персонажа
  useEffect(() => {
    if (!currentCharacter) return;
    setSessionId(null);
    getOrCreateSession(currentCharacter.id, currentCharacter.persona)
      .then(id => setSessionId(id))
      .catch(() => setSessionId(null));
  }, [charId]);

  // Скролл вниз при новых сообщениях
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length, isTyping]);

  const avatarLetter = user?.name?.[0]?.toUpperCase() ?? 'А';

  const sendMessageToChar = useCallback(async () => {
    if (!currentCharacter) return;
    const text = inputText.trim();
    if (!text || isTyping) return;
    setInputText('');

    await addMessage(currentCharacter.id, {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text,
      time: formatTime(),
      date: new Date().toISOString(),
    });
    setIsTyping(true);

    try {
      let responseText: string;
      if (sessionId) {
        responseText = await apiSendMessage(sessionId, text);
      } else {
        responseText = await getMockResponse(currentCharacter.id);
      }
      await addMessage(currentCharacter.id, {
        id: `msg_${Date.now()}_c`,
        role: 'character',
        text: responseText || '...',
        time: formatTime(),
        date: new Date().toISOString(),
      });
    } catch {
      try {
        const fallback = await getMockResponse(currentCharacter.id);
        await addMessage(currentCharacter.id, {
          id: `msg_${Date.now()}_c`,
          role: 'character',
          text: fallback,
          time: formatTime(),
          date: new Date().toISOString(),
        });
      } catch {
        await addMessage(currentCharacter.id, {
          id: `msg_${Date.now()}_err`,
          role: 'character',
          text: 'Нет соединения с сервером. Проверь интернет.',
          time: formatTime(),
          date: new Date().toISOString(),
        });
      }
    } finally {
      setIsTyping(false);
    }
  }, [inputText, isTyping, currentCharacter, addMessage, sessionId]);

  const handleClearChat = useCallback(() => {
    if (!currentCharacter) return;
    Alert.alert(
      'Очистить чат?',
      'Все сообщения и история разговора будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => {
            const id = currentCharacter.id;
            const persona = currentCharacter.persona;
            clearChat(id);
            // Последовательно: удаляем сессию → создаём новую
            clearSession(id)
              .then(() => getOrCreateSession(id, persona))
              .then(newId => setSessionId(newId))
              .catch(() => setSessionId(null));
          },
        },
      ]
    );
  }, [currentCharacter, clearChat]);

  const handleMore = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const handleDeleteCharacter = useCallback(() => {
    if (!currentCharacter) return;
    setMenuVisible(false);
    Alert.alert(
      `Удалить ${currentCharacter.name}?`,
      'Персонаж и вся история чата будут удалены навсегда.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            clearSession(currentCharacter.id).catch(() => {});
            deleteCharacter(currentCharacter.id);
            navigate('home');
          },
        },
      ]
    );
  }, [currentCharacter, deleteCharacter, navigate]);

  // ── Ранний возврат ПОСЛЕ всех хуков ─────────────────────────────────────
  if (!currentCharacter) return null;

  const character      = currentCharacter;
  const gradientColors = cardBg[character.gradientKey as CardKey] ?? cardBg.freud;
  const userMsgCount   = messages.filter(m => m.role === 'user').length;
  const charMsgCount   = messages.filter(m => m.role === 'character').length;

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigate('home')} activeOpacity={0.7}>
            <BackIcon />
          </TouchableOpacity>

          <TouchableOpacity style={s.charInfo} activeOpacity={0.8}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.charAvatar}
            >
              <CharacterIcon iconType={character.iconType} size={20} />
            </LinearGradient>
            <View>
              <Text style={s.charName}>{character.name}</Text>
              <View style={s.statusRow}>
                <View style={[s.statusDot, !sessionId && { backgroundColor: theme.text3 }]} />
                <Text style={[s.statusText, !sessionId && { color: theme.text3 }]}>
                  {sessionId ? 'В роли' : 'Подключение...'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={s.headerActions}>
            <TouchableOpacity style={s.iconBtn} onPress={() => toggleFavorite(character.id)} activeOpacity={0.7}>
              <StarIcon filled={isFavorite} color={isFavorite ? '#FFFFFF' : theme.text2} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => setStatsVisible(true)} activeOpacity={0.7}>
              <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                <Circle cx="9" cy="9" r="7.5" stroke={theme.text2} strokeWidth="1.4" />
                <Path d="M9 5v4l3 2" stroke={theme.text2} strokeWidth="1.4" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={handleMore} activeOpacity={0.7}>
              <MoreIcon color={theme.text2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Memory bar */}
        <TouchableOpacity style={s.memBar} onPress={() => setMemoryOn(v => !v)} activeOpacity={0.8}>
          <BulbIcon color={memoryOn ? theme.text2 : theme.text3} />
          <Text style={[s.memBarText, !memoryOn && { color: theme.text3 }]}>
            {memoryOn ? 'Долгосрочная память включена' : 'Долгосрочная память выключена'}
          </Text>
          <View style={[s.memToggle, !memoryOn && s.memToggleOff]}>
            <View style={[s.memToggleKnob, !memoryOn && s.memToggleKnobOff]} />
          </View>
        </TouchableOpacity>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={s.messages}
          contentContainerStyle={s.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.dateDivider}>
            <View style={s.dateLine} />
            <Text style={s.dateText}>Сегодня</Text>
            <View style={s.dateLine} />
          </View>

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <View key={msg.id} style={[s.msgRow, isUser && s.msgRowUser]}>
                {!isUser ? (
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.msgAvatar}
                  >
                    <CharacterIcon iconType={character.iconType} size={16} />
                  </LinearGradient>
                ) : (
                  <View style={[s.msgAvatar, { backgroundColor: '#2A2A2A' }]}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{avatarLetter}</Text>
                  </View>
                )}
                <View style={s.msgContent}>
                  <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleChar]}>
                    <Text style={[s.bubbleText, isUser && s.bubbleTextUser]}>{msg.text}</Text>
                  </View>
                  <Text style={[s.msgTime, isUser && { textAlign: 'right', color: 'rgba(0,0,0,0.35)' }]}>
                    {msg.time}
                  </Text>
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View style={s.typingRow}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.msgAvatar}
              >
                <CharacterIcon iconType={character.iconType} size={16} />
              </LinearGradient>
              <View style={s.typingBubble}>
                <TypingDot delay={0} />
                <TypingDot delay={200} />
                <TypingDot delay={400} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={s.inputWrap}>
          <View style={s.inputRow}>
            <TextInput
              style={s.textInput}
              placeholder={`Написать ${character.name.split(' ')[0]}...`}
              placeholderTextColor={theme.text3}
              multiline
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessageToChar}
              underlineColorAndroid="transparent"
              selectionColor={theme.text}
            />
            <TouchableOpacity
              style={[s.sendBtn, (!inputText.trim() || isTyping) && { opacity: 0.4 }]}
              onPress={sendMessageToChar}
              activeOpacity={0.85}
              disabled={!inputText.trim() || isTyping}
            >
              <SendIcon size={16} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Menu modal (three dots) */}
      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <TouchableOpacity style={s.menuCard} activeOpacity={1} onPress={() => {}}>
            <View style={s.menuHandle} />
            <Text style={s.menuTitle}>{currentCharacter?.name}</Text>
            <TouchableOpacity
              style={s.menuItem}
              activeOpacity={0.75}
              onPress={() => { setMenuVisible(false); handleClearChat(); }}
            >
              <Text style={s.menuItemDanger}>Очистить чат</Text>
            </TouchableOpacity>
            {currentCharacter?.userCreated && (
              <TouchableOpacity style={s.menuItem} activeOpacity={0.75} onPress={handleDeleteCharacter}>
                <Text style={s.menuItemDanger}>Удалить персонажа</Text>
              </TouchableOpacity>
            )}
            <View style={s.menuDivider} />
            <TouchableOpacity style={s.menuItem} activeOpacity={0.75} onPress={() => setMenuVisible(false)}>
              <Text style={s.menuItemCancel}>Отмена</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Stats modal */}
      <Modal visible={statsVisible} transparent animationType="fade" onRequestClose={() => setStatsVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setStatsVisible(false)}>
          <View style={s.statsCard}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.statsAvatar}
            >
              <CharacterIcon iconType={character.iconType} size={28} />
            </LinearGradient>
            <Text style={s.statsName}>{character.name}</Text>
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={s.statVal}>{userMsgCount}</Text>
                <Text style={s.statLbl}>Ваших</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statVal}>{charMsgCount}</Text>
                <Text style={s.statLbl}>Ответов</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statVal}>{messages.length}</Text>
                <Text style={s.statLbl}>Всего</Text>
              </View>
            </View>
            <TouchableOpacity style={s.statsClose} onPress={() => setStatsVisible(false)} activeOpacity={0.8}>
              <Text style={s.statsCloseText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  charInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  charAvatar: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  charName: { fontSize: 15, fontWeight: '600', letterSpacing: -0.3, color: theme.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.green },
  statusText: { fontSize: 11, color: theme.green },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  memBar: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10, padding: 8, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  memBarText: { flex: 1, fontSize: 12, color: theme.text2 },
  memToggle: {
    width: 32, height: 18, backgroundColor: '#FFFFFF',
    borderRadius: 9, alignItems: 'flex-end', paddingRight: 2, justifyContent: 'center',
  },
  memToggleOff: { backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'flex-start', paddingRight: 0, paddingLeft: 2 },
  memToggleKnob: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#000000' },
  memToggleKnobOff: { backgroundColor: '#555555' },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 4 },
  dateDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  dateLine: { flex: 1, height: 1, backgroundColor: theme.border },
  dateText: { fontSize: 11, color: theme.text3 },
  msgRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginBottom: 4 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  msgContent: { maxWidth: '78%' },
  bubble: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
  bubbleChar: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border, borderBottomLeftRadius: 6,
  },
  bubbleUser: { backgroundColor: '#FFFFFF', borderBottomRightRadius: 6 },
  bubbleText: { fontSize: 14, lineHeight: 21, color: theme.text },
  bubbleTextUser: { color: '#000000' },
  msgTime: { fontSize: 10, color: theme.text3, marginTop: 4, paddingHorizontal: 4 },
  typingRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: 4 },
  typingBubble: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 18, borderBottomLeftRadius: 6,
    paddingVertical: 12, paddingHorizontal: 16,
    flexDirection: 'row', gap: 4, alignItems: 'center',
  },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.text3 },
  inputWrap: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20,
    backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.border,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 20, paddingVertical: 8, paddingLeft: 16, paddingRight: 8,
  },
  textInput: {
    flex: 1, color: theme.text, fontSize: 14,
    minHeight: 22, maxHeight: 80, lineHeight: 20, paddingVertical: 0,
  } as any,
  sendBtn: {
    width: 34, height: 34, backgroundColor: '#FFFFFF', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  statsCard: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 24, padding: 28, alignItems: 'center', width: 280, gap: 16,
  },
  statsAvatar: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statsName: { fontSize: 17, fontWeight: '700', color: theme.text, letterSpacing: -0.4 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statVal: { fontSize: 22, fontWeight: '700', color: theme.text, letterSpacing: -0.5 },
  statLbl: { fontSize: 11, color: theme.text3, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: theme.border },
  statsClose: {
    backgroundColor: theme.surface3, borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 32,
  },
  statsCloseText: { fontSize: 14, fontWeight: '600', color: theme.text },
  menuCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: theme.surface2,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderBottomWidth: 0, borderColor: theme.border,
    paddingBottom: 34, paddingTop: 12,
  },
  menuHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: theme.surface3, alignSelf: 'center', marginBottom: 16,
  },
  menuTitle: {
    fontSize: 13, color: theme.text3, textAlign: 'center',
    marginBottom: 8, fontWeight: '500',
  },
  menuItem: {
    paddingVertical: 16, paddingHorizontal: 24,
  },
  menuItemDanger: { fontSize: 16, color: '#FF4444', fontWeight: '500' },
  menuItemCancel: { fontSize: 16, color: theme.text2, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: theme.border, marginHorizontal: 24, marginVertical: 4 },
});
