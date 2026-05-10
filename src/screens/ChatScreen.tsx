import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Animated, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ScreenCapture from 'expo-screen-capture';

import { theme } from '../theme';
import { BackIcon, BulbIcon, SendIcon, SmileIcon, LightningIcon, ChevronRightIcon } from '../icons';
import { CharacterIcon } from '../components/CharacterIcon';
import MoodPickerModal from '../components/MoodPickerModal';
import AgeGateModal from '../components/AgeGateModal';
import { getCharacterGradient } from '../utils/gradients';
import { composePersona, getMoodLabel } from '../utils/moods';
import { isConsentValid } from '../utils/consent';
import { useApp, Message, FREE_DAILY_MESSAGES } from '../context/AppContext';
import { sendMessage as apiSendMessage, ChatMessage } from '../utils/api';
import { getMockResponse } from '../utils/mockAI';

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
    characterMoods, setCharacterMood,
    isPremium, dailyLimitReached, todayMessageCount, openPaywall,
  } = useApp();

  const [inputText, setInputText]     = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [memoryOn, setMemoryOn]       = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [moodPickerVisible, setMoodPickerVisible] = useState(false);
  const [nsfwGateVisible, setNsfwGateVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const charId   = currentCharacter?.id ?? '';
  const messages: Message[] = chats[charId] || [];
  const isEmptyChat = messages.length === 0;
  const isFavorite  = favorites.includes(charId);
  const currentMood = characterMoods[charId] ?? null;

  // Редирект если персонаж не задан
  useEffect(() => {
    if (!currentCharacter) navigate('home');
  }, [currentCharacter]);

  // Защита от скриншотов / записи экрана пока юзер в чате (D-extra).
  // Android: блокирует и системные скриншоты, и захват экрана.
  // iOS: добавляет наблюдатель на screenshot/recording, скриншот не блокируется
  //      платформой, но запись экрана даёт чёрный кадр для секций которые
  //      пометили как secure.
  // На web — функция no-op.
  useEffect(() => {
    let active = true;
    ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    return () => {
      active = false;
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
      void active;
    };
  }, []);

  // Возрастной gate при первом открытии NSFW персонажа (Задача 4).
  useEffect(() => {
    if (!currentCharacter || !currentCharacter.isNSFW) return;
    isConsentValid('age_18').then(ok => {
      if (!ok) setNsfwGateVisible(true);
    });
  }, [charId]);

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

  const handleMoodSelect = useCallback((moodId: string | null) => {
    if (!currentCharacter) return;
    // Stateless: persona подмешивается на каждый запрос, серверной сессии нет —
    // менять mood можно прямо в полёте, новые ответы будут учитывать новый стиль.
    setCharacterMood(currentCharacter.id, moodId);
  }, [currentCharacter, setCharacterMood]);

  // Скролл вниз при новых сообщениях
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length, isTyping]);

  const avatarLetter = user?.name?.[0]?.toUpperCase() ?? 'А';

  const sendMessageToChar = useCallback(async () => {
    if (!currentCharacter) return;
    const text = inputText.trim();
    if (!text || isTyping) return;

    // Дневной лимит для free-юзеров. Хук-точка триггера paywall.
    if (dailyLimitReached) {
      openPaywall('limit');
      return;
    }
    setInputText('');

    await addMessage(currentCharacter.id, {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text,
      time: formatTime(),
      date: new Date().toISOString(),
    });
    setIsTyping(true);

    // Stateless-протокол: persona + полная история уезжают на бэк каждый раз.
    // Берём messages из state на момент клика и добавляем новое user-сообщение —
    // это надёжнее чем ждать асинхронного setState из addMessage.
    const persona = composePersona(
      currentCharacter.persona,
      currentMood,
      currentCharacter.gender,
    );
    const history: ChatMessage[] = [
      ...messages.map(m => ({
        role: m.role,
        content: m.text,
      })),
      { role: 'user', content: text },
    ];

    try {
      const responseText = await apiSendMessage(persona, history);
      await addMessage(currentCharacter.id, {
        id: `msg_${Date.now()}_c`,
        role: 'character',
        text: responseText,
        time: formatTime(),
        date: new Date().toISOString(),
      });
    } catch {
      // Production: явная ошибка вместо mock'а — честнее по отношению к юзеру.
      // В DEV mock-фолбэк остаётся, чтобы не блокировать разработку.
      let errorText = 'Не удалось получить ответ. Проверьте интернет и попробуйте снова.';
      if (__DEV__) {
        try {
          errorText = await getMockResponse(currentCharacter.id);
        } catch {}
      }
      await addMessage(currentCharacter.id, {
        id: `msg_${Date.now()}_err`,
        role: 'character',
        text: errorText,
        time: formatTime(),
        date: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
    }
  }, [inputText, isTyping, currentCharacter, addMessage, messages, currentMood]);

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
          onPress: () => clearChat(currentCharacter.id),
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
  const gradientColors = getCharacterGradient(character) as [string, string];
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
              <CharacterIcon iconType={character.iconType} size={20} avatarUri={character.avatarUri} />
            </LinearGradient>
            <View>
              <Text style={s.charName}>{character.name}</Text>
              <View style={s.statusRow}>
                <View style={s.statusDot} />
                <Text style={s.statusText}>В роли</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={s.headerActions}>
            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => setMoodPickerVisible(true)}
              activeOpacity={0.7}
            >
              <SmileIcon size={18} color={currentMood ? '#FFFFFF' : theme.text2} />
              {currentMood && <View style={s.moodIndicatorDot} />}
            </TouchableOpacity>
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

        {/* Mood indicator under name */}
        {currentMood && (
          <View style={s.moodPill}>
            <SmileIcon size={11} color={theme.text2} />
            <Text style={s.moodPillText}>Стиль: {getMoodLabel(currentMood)}</Text>
          </View>
        )}

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

        {/* Warning о лимите: показываем когда осталось ≤ 5 сообщений или лимит достигнут */}
        {!isPremium && todayMessageCount >= FREE_DAILY_MESSAGES - 5 && (
          <TouchableOpacity
            style={s.limitBar}
            onPress={() => openPaywall('limit')}
            activeOpacity={0.85}
          >
            <LightningIcon size={14} color="#FFFFFF" />
            <Text style={s.limitBarText}>
              {dailyLimitReached
                ? 'Дневной лимит исчерпан · Открыть Pro'
                : `Осталось ${FREE_DAILY_MESSAGES - todayMessageCount} сообщений · Безлимит в Pro`}
            </Text>
            <ChevronRightIcon color={theme.text2} size={14} />
          </TouchableOpacity>
        )}

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
                    <CharacterIcon iconType={character.iconType} size={16} avatarUri={character.avatarUri} />
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
                <CharacterIcon iconType={character.iconType} size={16} avatarUri={character.avatarUri} />
              </LinearGradient>
              <View style={s.typingBubble}>
                <TypingDot delay={0} />
                <TypingDot delay={200} />
                <TypingDot delay={400} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input — заменяется на CTA если лимит исчерпан */}
        <View style={s.inputWrap}>
          {dailyLimitReached ? (
            <TouchableOpacity
              style={s.limitCta}
              onPress={() => openPaywall('limit')}
              activeOpacity={0.9}
            >
              <Text style={s.limitCtaText}>Открыть Pro · безлимит сообщений</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.inputRow}>
              <TextInput
                style={s.textInput}
                placeholder={`Написать ${character.name.split(' ')[0]}...`}
                placeholderTextColor={theme.text3}
                multiline
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendMessageToChar}
                maxLength={2000}
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
          )}
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

      {/* Mood picker modal */}
      <MoodPickerModal
        visible={moodPickerVisible}
        currentMood={currentMood}
        characterIsNsfw={Boolean(character.isNSFW)}
        onSelect={handleMoodSelect}
        onClose={() => setMoodPickerVisible(false)}
      />

      {/* NSFW age-gate modal (Задача 4) */}
      <AgeGateModal
        visible={nsfwGateVisible}
        onConfirm={() => setNsfwGateVisible(false)}
        onCancel={() => {
          setNsfwGateVisible(false);
          navigate('home');
        }}
      />

      {/* Stats modal */}
      <Modal visible={statsVisible} transparent animationType="fade" onRequestClose={() => setStatsVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setStatsVisible(false)}>
          <View style={s.statsCard}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.statsAvatar}
            >
              <CharacterIcon iconType={character.iconType} size={28} avatarUri={character.avatarUri} />
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
  charAvatar: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  charName: { fontSize: 15, fontWeight: '600', letterSpacing: -0.3, color: theme.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.green },
  statusText: { fontSize: 11, color: theme.green },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  moodIndicatorDot: {
    position: 'absolute', top: 7, right: 7,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#fff',
  },
  moodPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    marginHorizontal: 16, marginTop: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  moodPillText: { fontSize: 11, color: theme.text2, fontWeight: '500' },
  memBar: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10, padding: 8, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  memBarText: { flex: 1, fontSize: 12, color: theme.text2 },
  limitBar: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  limitBarText: { flex: 1, fontSize: 12, color: theme.text, fontWeight: '500' },
  limitCta: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingVertical: 14, alignItems: 'center',
  },
  limitCtaText: { fontSize: 14, fontWeight: '700', color: '#000', letterSpacing: -0.2 },
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
  msgAvatar: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
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
  statsAvatar: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
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
