import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { theme } from '../theme';
import {
  BackIcon, SmileIcon, BrainIcon, MoonIcon, FlowerIcon, LightningIcon, ShieldIcon,
  JokerCardIcon, MaskIcon, LotusIcon, FlameIcon, ScrollIcon, AutumnLeafIcon,
  CigarIcon, RoseIcon, FeatherIcon, MushroomIcon,
} from '../icons';
import { CharacterIcon } from '../components/CharacterIcon';
import AgeGateModal from '../components/AgeGateModal';
import { CUSTOM_GRADIENTS } from '../utils/gradients';
import { buildPersonaTemplate, validatePersonaText, FIELD_LIMITS } from '../utils/personaTemplate';
import { isConsentValid } from '../utils/consent';
import { useApp, FREE_CUSTOM_CHARS } from '../context/AppContext';
import { Character, Gender, CATEGORIES } from '../data/characters';
import { saveAvatar } from '../utils/avatarStorage';

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
  // Новые поля (Задача 3)
  gender: Gender;
  category: string;
  // Временный uri выбранной фотографии (cache image-picker'а). При следующей
  // сессии может оказаться недействительным — тогда просто загрузится без фото.
  avatarUri?: string | null;
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
  { id: 'flirt',        label: 'Флиртующий',     Icon: SmileIcon },
  { id: 'smart',        label: 'Умный',          Icon: BrainIcon },
  { id: 'dark',         label: 'Тёмный',         Icon: MoonIcon },
  { id: 'gentle',       label: 'Нежный',         Icon: FlowerIcon },
  { id: 'bold',         label: 'Дерзкий',        Icon: LightningIcon },
  { id: 'loyal',        label: 'Верный',         Icon: ShieldIcon },
  { id: 'humor',        label: 'С юмором',       Icon: JokerCardIcon },
  { id: 'mystery',      label: 'Загадочный',     Icon: MaskIcon },
  { id: 'calm',         label: 'Спокойный',      Icon: LotusIcon },
  { id: 'passionate',   label: 'Страстный',      Icon: FlameIcon },
  { id: 'wise',         label: 'Мудрый',         Icon: ScrollIcon },
  { id: 'melancholic',  label: 'Меланхоличный',  Icon: AutumnLeafIcon },
  { id: 'sarcastic',    label: 'Саркастичный',   Icon: CigarIcon },
  { id: 'charming',     label: 'Обаятельный',    Icon: RoseIcon },
  { id: 'dreamer',      label: 'Мечтатель',      Icon: FeatherIcon },
  { id: 'eccentric',    label: 'Эксцентричный',  Icon: MushroomIcon },
];

// Уникальные иконки только для кастомных персонажей (Задача 3.3).
// Не пересекаются с iconType встроенных персонажей.
const CUSTOM_ICON_TYPES: readonly string[] = [
  'robot', 'alien', 'maskface', 'lock', 'heartfull',
  'star8', 'moonstar', 'electricguitar', 'wolfhowl', 'dragon',
  'eyerunes', 'phoenix', 'kitsune', 'skullcrossbones', 'octopus',
  'crystal', 'bookspell', 'rosedark', 'wingedheart', 'compassmagic',
] as const;

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male',   label: 'Мужской' },
  { id: 'female', label: 'Женский' },
];

// Категории кроме «Все» — нельзя присвоить кастомному персонажу.
const SELECTABLE_CATEGORIES = CATEGORIES.filter(c => c !== 'Все');

export default function CreateScreen() {
  const {
    navigate, addCharacter,
    isPremium, customLimitReached, customCharsCount, openPaywall,
  } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [persona, setPersona] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>(['flirt', 'bold']);
  const [nsfw, setNsfw] = useState(false);
  const [memory, setMemory] = useState(true);
  const [gradientIdx, setGradientIdx] = useState(0);
  const [iconIdx, setIconIdx] = useState(0);
  const [gender, setGender] = useState<Gender>('male');
  const [selectedCategory, setSelectedCategory] = useState<string>('Кумиры');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [ageGateVisible, setAgeGateVisible] = useState(false);
  // Кастомный аватар: временный uri из image-picker, который потом
  // (при handleCreate) копируется в documentDirectory через saveAvatar.
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  // Блокирует кнопку «Создать», пока saveAvatar копирует фото в FS.
  const [isCreating, setIsCreating] = useState(false);

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
        setGender(d.gender || 'male');
        setSelectedCategory(d.category || 'Кумиры');
        setAvatarUri(d.avatarUri ?? null);
      } catch {}
    }).catch(() => {});
  }, []);

  const saveDraft = async () => {
    const draft: Draft = {
      name, description, persona, firstMessage, selectedMoods,
      nsfw, memory, gradientIdx, iconIdx, gender, category: selectedCategory,
      avatarUri,
    };
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft)).catch(() => {});
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  // Открытие галереи + квадратный кроп. Permissions попросятся автоматически
  // через expo-image-picker (config-plugin прописан в app.json). На web —
  // FileSystem не работает, поэтому функция дисейблится.
  const pickFromGallery = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Недоступно в веб-версии', 'Загрузка фото работает в мобильном приложении.');
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Нет доступа к фото',
        'Разрешите доступ к фото в настройках приложения, чтобы установить аватар.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      // Resize/JPEG-конвертация будет при saveAvatar — не дублируем здесь.
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setAvatarUri(result.assets[0].uri);
  };

  const removeAvatar = () => setAvatarUri(null);

  const toggleMood = (id: string) => {
    setSelectedMoods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  // Включение NSFW требует возрастного согласия (Задача 4).
  const handleNsfwToggle = async (next: boolean) => {
    if (!next) {
      setNsfw(false);
      return;
    }
    const ok = await isConsentValid('age_18');
    if (ok) {
      setNsfw(true);
    } else {
      setAgeGateVisible(true);
    }
  };

  const onAgeConfirmed = () => {
    setAgeGateVisible(false);
    setNsfw(true);
  };

  const handleCreate = async () => {
    if (isCreating) return;
    if (!name.trim()) { setError('Введите имя персонажа'); return; }
    if (!description.trim()) { setError('Добавьте описание'); return; }
    if (!firstMessage.trim()) { setError('Добавьте первое сообщение персонажа'); return; }

    // Лимит кастомных персонажей для free-юзеров.
    // Сохраняем черновик чтобы юзер не потерял ввод после возврата с paywall.
    if (customLimitReached) {
      const draft: Draft = {
        name, description, persona, firstMessage, selectedMoods,
        nsfw, memory, gradientIdx, iconIdx, gender, category: selectedCategory,
        avatarUri,
      };
      AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft)).catch(() => {});
      openPaywall('create-limit');
      return;
    }

    // Локальная мягкая валидация описания (Задача 5)
    const w = validatePersonaText(persona);
    if (w) setWarning(w); else setWarning('');

    const tagLabels = selectedMoods.map(m => MOODS.find(x => x.id === m)?.label ?? m);
    const defaultMood = selectedMoods[0]; // первый mood становится дефолтным

    // Шаблонная сборка persona (Задача 5: гибрид без AI)
    const composedPersona = buildPersonaTemplate({
      name: name.trim(),
      description: description.trim(),
      gender,
      personaRaw: persona.trim(),
      firstMessage: firstMessage.trim(),
      tagLabels,
      defaultMood,
      nsfw,
    });

    const chosenGradient = CUSTOM_GRADIENTS[gradientIdx];
    const newId = `custom_${Date.now()}`;

    setIsCreating(true);

    // Если юзер выбрал фото — копируем его в постоянное хранилище.
    // saveAvatar делает resize+JPEG. Если падает (нет места, повреждённый
    // файл) — продолжаем без аватара, не блокируя создание персонажа.
    let persistedAvatarUri: string | undefined;
    if (avatarUri) {
      try {
        const saved = await saveAvatar(newId, avatarUri);
        if (saved) persistedAvatarUri = saved;
      } catch {
        // Не блокируем создание — персонаж появится без фото.
      }
    }

    const newChar: Character = {
      id: newId,
      name: name.trim(),
      description: description.trim(),
      category: selectedCategory,
      iconType: CUSTOM_ICON_TYPES[iconIdx],
      gradientKey: 'shadow', // фолбэк-ключ; реальный цвет — в customGradient
      tags: tagLabels,
      messages: 0,
      rating: 5.0,
      isNew: true,
      isNSFW: nsfw,
      firstMessage: firstMessage.trim(),
      persona: composedPersona, // готовый шаблон для backend
      rawPersona: persona.trim(), // оригинал пользователя
      userCreated: true,
      gender,
      customGradient: chosenGradient.colors,
      avatarUri: persistedAvatarUri,
    };

    AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
    addCharacter(newChar);
    setIsCreating(false);
    navigate('chat', newChar);
  };

  const currentIconType = CUSTOM_ICON_TYPES[iconIdx];
  const currentGradient = CUSTOM_GRADIENTS[gradientIdx];
  // При наличии фото тап по аватару = выбрать другое; иначе циклим preset-иконку.
  const handleAvatarTap = avatarUri
    ? pickFromGallery
    : () => setIconIdx((iconIdx + 1) % CUSTOM_ICON_TYPES.length);
  const createBtnLabel = customLimitReached
    ? 'Открыть Pro для создания'
    : isCreating ? 'Создаю...' : 'Создать персонажа ✦';

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

        {/* Лимит-баннер: счётчик и переход на paywall */}
        {!isPremium && (
          <TouchableOpacity
            style={[s.limitBanner, customLimitReached && s.limitBannerHot]}
            onPress={() => openPaywall('create-limit')}
            activeOpacity={0.85}
          >
            <Text style={[s.limitBannerText, customLimitReached && s.limitBannerTextHot]}>
              {customLimitReached
                ? `Лимит ${FREE_CUSTOM_CHARS} персонажей · Открыть Pro`
                : `${customCharsCount} / ${FREE_CUSTOM_CHARS} бесплатных персонажей`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Avatar + gradient picker (Задача 3.4: реальные цвета) */}
        <View style={s.avatarSection}>
          <TouchableOpacity
            onPress={handleAvatarTap}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={currentGradient.colors as [string, string]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.avatarPicker}
            >
              <CharacterIcon
                iconType={currentIconType}
                size={48}
                avatarUri={avatarUri ?? undefined}
              />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={s.avatarHint}>
            {avatarUri ? 'Тап по фото — выбрать другое' : 'Нажми для смены иконки'}
          </Text>

          <View style={s.avatarActions}>
            <TouchableOpacity
              style={s.avatarActionBtn}
              onPress={pickFromGallery}
              activeOpacity={0.8}
            >
              <Text style={s.avatarActionText}>
                {avatarUri ? 'Сменить фото' : 'Загрузить фото'}
              </Text>
            </TouchableOpacity>
            {avatarUri && (
              <TouchableOpacity
                style={[s.avatarActionBtn, s.avatarActionBtnGhost]}
                onPress={removeAvatar}
                activeOpacity={0.8}
              >
                <Text style={[s.avatarActionText, s.avatarActionTextGhost]}>Сбросить</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
            {CUSTOM_GRADIENTS.map((g, i) => (
              <TouchableOpacity
                key={g.id}
                onPress={() => setGradientIdx(i)}
                style={[s.colorDot, gradientIdx === i && s.colorDotOn]}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={g.colors as [string, string]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.colorDotInner}
                />
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
            maxLength={FIELD_LIMITS.name}
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Gender (Задача 3.1) */}
        <View style={s.field}>
          <Text style={s.label}>Пол персонажа</Text>
          <View style={s.chipsRow}>
            {GENDERS.map(g => (
              <TouchableOpacity
                key={g.id}
                style={[s.chip, gender === g.id && s.chipOn]}
                onPress={() => setGender(g.id)}
                activeOpacity={0.85}
              >
                <Text style={[s.chipLabel, gender === g.id && s.chipLabelOn]}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category (Задача 3.2) */}
        <View style={s.field}>
          <Text style={s.label}>Категория</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
            {SELECTABLE_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[s.chip, selectedCategory === cat && s.chipOn]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.85}
              >
                <Text style={[s.chipLabel, selectedCategory === cat && s.chipLabelOn]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
            maxLength={FIELD_LIMITS.description}
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Persona */}
        <View style={s.field}>
          <Text style={s.label}>Характер и поведение</Text>
          <TextInput
            style={[s.input, s.textarea]}
            placeholder="Опишите как персонаж говорит, думает, что любит, как реагирует... (минимум 30 символов для лучших ответов)"
            placeholderTextColor={theme.text3}
            multiline
            numberOfLines={4}
            value={persona}
            onChangeText={t => { setPersona(t); setWarning(validatePersonaText(t) || ''); }}
            maxLength={FIELD_LIMITS.personaRaw}
            underlineColorAndroid="transparent"
          />
          {!!warning && <Text style={s.warningText}>{warning}</Text>}
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
          <Text style={s.label}>Первое сообщение от персонажа</Text>
          <Text style={s.fieldHint}>
            Это сообщение персонаж напишет первым, когда вы откроете чат.
          </Text>
          <TextInput
            style={[s.input, s.textarea]}
            placeholder="Привет! Я Виктор, детектив. Что привело вас ко мне?"
            placeholderTextColor={theme.text3}
            multiline
            numberOfLines={3}
            value={firstMessage}
            onChangeText={t => { setFirstMessage(t); setError(''); }}
            maxLength={FIELD_LIMITS.firstMessage}
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
            <Toggle value={nsfw} onChange={handleNsfwToggle} />
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

        <TouchableOpacity
          style={[s.createBtn, isCreating && { opacity: 0.6 }]}
          onPress={handleCreate}
          activeOpacity={0.9}
          disabled={isCreating}
        >
          <Text style={s.createBtnText}>{createBtnLabel}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <AgeGateModal
        visible={ageGateVisible}
        onConfirm={onAgeConfirmed}
        onCancel={() => setAgeGateVisible(false)}
      />
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
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  avatarHint: { fontSize: 11, color: theme.text3, marginTop: 8 },
  avatarActions: {
    flexDirection: 'row', gap: 8, marginTop: 10,
  },
  avatarActionBtn: {
    backgroundColor: theme.surface3, borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  avatarActionBtnGhost: {
    backgroundColor: 'transparent',
  },
  avatarActionText: {
    fontSize: 12, fontWeight: '600', color: theme.text,
  },
  avatarActionTextGhost: { color: theme.text2 },
  colorDot: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  colorDotOn: { borderColor: '#fff' },
  colorDotInner: { width: 22, height: 22, borderRadius: 11 },

  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: theme.text2, letterSpacing: 0.2 },
  fieldHint: { fontSize: 11, color: theme.text3, marginTop: -4, lineHeight: 15 },
  input: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: theme.text, fontSize: 14,
  },
  textarea: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },

  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14,
  },
  chipOn: { backgroundColor: '#fff', borderColor: '#fff' },
  chipLabel: { fontSize: 12, fontWeight: '500', color: theme.text2 },
  chipLabelOn: { color: '#000' },

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

  warningText: { fontSize: 12, color: '#E0A040', marginTop: 4 },
  errorText: { fontSize: 13, color: '#FF4444', textAlign: 'center' },
  limitBanner: {
    backgroundColor: theme.surface2,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
    alignItems: 'center',
  },
  limitBannerHot: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  limitBannerText: {
    fontSize: 12, color: theme.text2, fontWeight: '500',
  },
  limitBannerTextHot: { color: theme.text, fontWeight: '600' },
  createBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  createBtnText: { color: '#000', fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },
});
