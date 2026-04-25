import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import {
  ChevronRightIcon, UserIcon, SettingsIcon,
  BellIcon, ShieldIcon, LogoutIcon,
  SparkleIcon, InfinityIcon, BrainIcon, LightningIcon,
  AgeRestrictedIcon, StarIcon, PaletteIcon,
} from '../icons';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';

const SETTINGS = [
  { id: 'profile',  label: 'Редактировать профиль',           Icon: UserIcon,     danger: false },
  { id: 'plan',     label: 'Подписка и оплата',                Icon: SettingsIcon, danger: false },
  { id: 'notifs',   label: 'Уведомления',                      Icon: BellIcon,     danger: false },
  { id: 'privacy',  label: 'Безопасность и конфиденциальность', Icon: ShieldIcon,  danger: false },
  { id: 'logout',   label: 'Выйти',                            Icon: LogoutIcon,   danger: true  },
] as const;

const PRO_FEATURES: { Icon: React.ComponentType<{ size?: number; color?: string }>; text: string }[] = [
  { Icon: InfinityIcon,       text: 'Неограниченные сообщения' },
  { Icon: BrainIcon,          text: 'Расширенная долгосрочная память' },
  { Icon: LightningIcon,      text: 'Приоритетные ответы без задержек' },
  { Icon: AgeRestrictedIcon,  text: 'Доступ ко всему контенту 18+' },
  { Icon: StarIcon,           text: 'Эксклюзивные персонажи' },
  { Icon: PaletteIcon,        text: 'Кастомные темы и фоны' },
];

export default function ProfileScreen() {
  const { navigate, logout, user, setUser, characters, chats, todayMessageCount, streakDays } = useApp();

  const [editVisible, setEditVisible] = useState(false);
  const [proVisible, setProVisible] = useState(false);
  const [notifsVisible, setNotifsVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [notifsOn, setNotifsOn] = useState(true);

  const totalMessages = useMemo(() =>
    Object.values(chats).reduce((acc, msgs) => acc + msgs.length, 0),
  [chats]);

  const myChars = useMemo(() => characters.filter(c => c.userCreated).length, [characters]);

  const avatarLetter = user?.name?.[0]?.toUpperCase() ?? 'А';
  const displayName = user?.name ?? 'Пользователь';
  const handle = user?.handle ?? '';

  const handleSetting = (id: string) => {
    if (id === 'logout') {
      Alert.alert('Выйти?', 'Данные профиля будут удалены с устройства.', [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: logout },
      ]);
      return;
    }
    if (id === 'profile') {
      setEditName(user?.name ?? '');
      setEditVisible(true);
      return;
    }
    if (id === 'plan') {
      setProVisible(true);
      return;
    }
    if (id === 'notifs') {
      setNotifsVisible(true);
      return;
    }
    if (id === 'privacy') {
      Alert.alert(
        'Конфиденциальность',
        'Все данные хранятся локально на вашем устройстве и не передаются третьим лицам.',
        [{ text: 'Понятно' }]
      );
      return;
    }
  };

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed.length < 2) return;
    if (!user) return;
    setUser({
      ...user,
      name: trimmed,
      handle: `@${trimmed.toLowerCase().replace(/\s+/g, '_')} · ${user.since}`,
    });
    setEditVisible(false);
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.hero}>
          <View style={s.bigAvatar}>
            <Text style={s.bigAvatarText}>{avatarLetter}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.profileName}>{displayName}</Text>
            <Text style={s.profileHandle}>{handle}</Text>
          </View>
          <View style={s.statsRow}>
            {[
              { val: String(myChars || characters.length), lbl: 'Персонажей' },
              { val: totalMessages > 999 ? (totalMessages / 1000).toFixed(1) + 'K' : String(totalMessages), lbl: 'Сообщений' },
              { val: String(streakDays), lbl: 'Дней подряд' },
            ].map((stat, i) => (
              <React.Fragment key={stat.lbl}>
                {i > 0 && <View style={s.statDivider} />}
                <View style={s.statItem}>
                  <Text style={s.statVal}>{stat.val}</Text>
                  <Text style={s.statLbl}>{stat.lbl}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={s.planCard}>
          <View style={s.planTop}>
            <Text style={s.planTitle}>Бесплатный план</Text>
            <TouchableOpacity style={s.proBtn} onPress={() => setProVisible(true)} activeOpacity={0.85}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={s.proBtnText}>Pro</Text>
                <Image source={require('../icons/invertLogo.png')} style={{ width: 31, height: 15 }} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={s.usageRow}>
            <Text style={s.usageText}>{Math.min(todayMessageCount, 50)}/50 сообщений сегодня</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${Math.min((todayMessageCount / 50) * 100, 100)}%` }]} />
          </View>
        </View>

        <View style={s.settingsList}>
          {SETTINGS.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[s.settingItem, i === SETTINGS.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => handleSetting(item.id)}
              activeOpacity={0.75}
            >
              <View style={[s.settingIcon, item.danger && s.settingIconDanger]}>
                <item.Icon color={item.danger ? '#FF4444' : theme.text2} size={16} />
              </View>
              <Text style={[s.settingLabel, item.danger && s.settingLabelDanger]}>
                {item.label}
              </Text>
              {!item.danger && <ChevronRightIcon color={theme.text3} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <BottomNav activeTab="profile" />

      {/* Edit profile modal */}
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setEditVisible(false)}>
          <TouchableOpacity style={s.editCard} activeOpacity={1} onPress={() => {}}>
            <Text style={s.editTitle}>Редактировать профиль</Text>
            <TextInput
              style={s.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Ваше имя"
              placeholderTextColor={theme.text3}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
              underlineColorAndroid="transparent"
            />
            <View style={s.editBtns}>
              <TouchableOpacity style={s.editBtnCancel} onPress={() => setEditVisible(false)} activeOpacity={0.8}>
                <Text style={s.editBtnCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.editBtnSave} onPress={handleSaveName} activeOpacity={0.85}>
                <Text style={s.editBtnSaveText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Pro modal */}
      <Modal visible={proVisible} transparent animationType="fade" onRequestClose={() => setProVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setProVisible(false)}>
          <TouchableOpacity style={s.proCard} activeOpacity={1} onPress={() => {}}>
            <View style={s.proTitleRow}>
              <Text style={s.proTitle}>Интерстеллар Pro</Text>
              <Image source={require('../icons/invertLogo.png')} style={{ width: 50, height: 26, tintColor: theme.text, marginTop: 6 }} />
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

      {/* Notifications modal */}
      <Modal visible={notifsVisible} transparent animationType="fade" onRequestClose={() => setNotifsVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setNotifsVisible(false)}>
          <TouchableOpacity style={s.editCard} activeOpacity={1} onPress={() => {}}>
            <Text style={s.editTitle}>Уведомления</Text>
            <TouchableOpacity
              style={s.notifRow}
              onPress={() => setNotifsOn(v => !v)}
              activeOpacity={0.8}
            >
              <Text style={s.notifLabel}>Push-уведомления</Text>
              <View style={[s.toggle, notifsOn && s.toggleOn]}>
                <View style={[s.toggleKnob, notifsOn
                  ? { right: 3, left: undefined, backgroundColor: '#000' }
                  : { left: 3, right: undefined, backgroundColor: '#fff' }
                ]} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={s.editBtnSave} onPress={() => setNotifsVisible(false)} activeOpacity={0.85}>
              <Text style={s.editBtnSaveText}>Готово</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  hero: { alignItems: 'center', paddingTop: 52, paddingBottom: 28, gap: 12 },
  bigAvatar: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: theme.surface3,
    borderWidth: 2, borderColor: theme.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  bigAvatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  profileName:   { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, color: theme.text },
  profileHandle: { fontSize: 13, color: theme.text3, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  statDivider: { width: 1, height: 28, backgroundColor: theme.border, marginHorizontal: 20 },
  statItem: { alignItems: 'center', minWidth: 64 },
  statVal: { fontSize: 17, fontWeight: '700', color: theme.text, letterSpacing: -0.5 },
  statLbl: { fontSize: 11, color: theme.text3, marginTop: 2 },

  planCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: theme.surface2,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 18, padding: 16, gap: 10,
  },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planTitle: { fontSize: 15, fontWeight: '600', color: theme.text },
  proBtn: {
    backgroundColor: '#fff', borderRadius: 6,
    paddingVertical: 5, paddingHorizontal: 10,
  },
  proBtnText: { fontSize: 12, fontWeight: '700', color: '#000' },
  usageRow: {},
  usageText: { fontSize: 12, color: theme.text3 },
  progressBar: {
    height: 4, backgroundColor: theme.surface3, borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 2 },

  settingsList: {
    marginHorizontal: 20,
    backgroundColor: theme.surface2,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 18, overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  settingIcon: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: theme.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  settingIconDanger: { backgroundColor: 'rgba(255,68,68,0.1)' },
  settingLabel: { flex: 1, fontSize: 14, color: theme.text },
  settingLabelDanger: { color: '#FF4444' },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  editCard: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 24, padding: 24, width: '100%', gap: 16,
  },
  editTitle: { fontSize: 17, fontWeight: '700', color: theme.text, letterSpacing: -0.4 },
  editInput: {
    backgroundColor: theme.surface3, borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: theme.text, fontSize: 15,
  },
  editBtns: { flexDirection: 'row', gap: 10 },
  editBtnCancel: {
    flex: 1, backgroundColor: theme.surface3, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  editBtnCancelText: { fontSize: 14, fontWeight: '600', color: theme.text2 },
  editBtnSave: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  editBtnSaveText: { fontSize: 14, fontWeight: '700', color: '#000' },

  // Pro modal
  proCard: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', gap: 16,
  },
  proTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
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

  // Notifs
  notifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifLabel: { fontSize: 15, color: theme.text },
  toggle: {
    width: 44, height: 26, backgroundColor: theme.surface3,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 13, justifyContent: 'center',
  },
  toggleOn: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  toggleKnob: { position: 'absolute', width: 20, height: 20, borderRadius: 10 },
});
