import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import {
  ChevronRightIcon, UserIcon, SettingsIcon,
  BellIcon, LogoutIcon, ShieldIcon,
} from '../icons';
import BottomNav from '../components/BottomNav';
import { useApp, FREE_DAILY_MESSAGES } from '../context/AppContext';
import type { LegalDocId } from '../utils/consent';

const SETTINGS = [
  { id: 'profile',     label: 'Редактировать профиль', Icon: UserIcon,     danger: false },
  { id: 'plan',        label: 'Подписка и оплата',     Icon: SettingsIcon, danger: false },
  { id: 'notifs',      label: 'Уведомления',           Icon: BellIcon,     danger: false },
  { id: 'clear_chats', label: 'Очистить историю',      Icon: ShieldIcon,   danger: false },
  { id: 'logout',      label: 'Выйти',                 Icon: LogoutIcon,   danger: true  },
  { id: 'delete',      label: 'Удалить аккаунт',       Icon: LogoutIcon,   danger: true  },
] as const;

const LEGAL_LINKS: { id: LegalDocId; label: string }[] = [
  { id: 'privacy_policy',   label: 'Конфиденциальность' },
  { id: 'terms_of_service', label: 'Условия' },
  { id: 'personal_data',    label: '152-ФЗ' },
  { id: 'subscription',     label: 'Подписка' },
  { id: 'about',            label: 'О приложении' },
];

// Дата → русский формат "1 мая 2026"
function formatRuDate(iso: string | null): string {
  if (!iso) return '—';
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

type DangerStage = null | 'clear_chats' | 'delete' | 'delete_busy';

export default function ProfileScreen() {
  const {
    navigate, logout, user, setUser, characters, chats,
    todayMessageCount, streakDays, setLegalDocId,
    isPremium, subscription, openPaywall, cancelSubscription,
    clearAllChats, deleteAccountFully,
  } = useApp();

  const [editVisible, setEditVisible] = useState(false);
  const [notifsVisible, setNotifsVisible] = useState(false);
  const [subVisible, setSubVisible] = useState(false);
  // Двухстадийная отмена в одной модалке: false — статус, true — confirm.
  const [cancelStage, setCancelStage] = useState(false);
  // Универсальная confirm-модалка для destructive operations (W2/W3).
  const [dangerStage, setDangerStage] = useState<DangerStage>(null);
  const [editName, setEditName] = useState('');

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
      // Pro-юзер: показываем меню управления подпиской.
      // Free: показываем paywall.
      if (isPremium) {
        setCancelStage(false);
        setSubVisible(true);
      } else {
        openPaywall('manual');
      }
      return;
    }
    if (id === 'notifs') {
      setNotifsVisible(true);
      return;
    }
    if (id === 'clear_chats') {
      setDangerStage('clear_chats');
      return;
    }
    if (id === 'delete') {
      setDangerStage('delete');
      return;
    }
  };

  // Подтверждение и выполнение destructive operation.
  // Все ошибки ловим в Alert — modal закрывается в любом случае.
  const performDanger = async () => {
    if (dangerStage === 'clear_chats') {
      try {
        await clearAllChats();
      } catch {}
      setDangerStage(null);
      return;
    }
    if (dangerStage === 'delete') {
      setDangerStage('delete_busy');
      try {
        await deleteAccountFully();
        // Успех: deleteAccountFully уже сбросил всё state и перешёл на splash.
      } catch (e) {
        // Бэк недоступен — локально всё равно почистили.
        Alert.alert(
          'Аккаунт удалён локально',
          'Не удалось связаться с сервером. Данные на устройстве удалены, серверная запись будет удалена при следующем подключении.',
        );
      } finally {
        setDangerStage(null);
      }
    }
  };

  const openLegal = (docId: LegalDocId) => {
    setLegalDocId(docId);
    navigate('legal');
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

        {isPremium ? (
          <View style={s.planCardPro}>
            <View style={s.planTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={require('../icons/invertLogo.png')} style={{ width: 28, height: 14, tintColor: '#000' }} />
                <Text style={s.planTitlePro}>Pro активна</Text>
              </View>
              {subscription?.isTrial && (
                <View style={s.trialBadge}>
                  <Text style={s.trialBadgeText}>ТРИАЛ</Text>
                </View>
              )}
            </View>
            <Text style={s.planExpires}>
              {subscription?.cancelledAt
                ? `Отменена · активна до ${formatRuDate(subscription.expiresAt)}`
                : `Активна до ${formatRuDate(subscription?.expiresAt ?? null)}`}
            </Text>
            <Text style={s.planBenefits}>Безлимит сообщений · Все 18+ · Без рекламы</Text>
          </View>
        ) : (
          <View style={s.planCard}>
            <View style={s.planTop}>
              <Text style={s.planTitle}>Бесплатный план</Text>
              <TouchableOpacity style={s.proBtn} onPress={() => openPaywall('manual')} activeOpacity={0.85}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Text style={s.proBtnText}>Pro</Text>
                  <Image source={require('../icons/invertLogo.png')} style={{ width: 31, height: 15 }} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={s.usageRow}>
              <Text style={s.usageText}>
                {Math.min(todayMessageCount, FREE_DAILY_MESSAGES)}/{FREE_DAILY_MESSAGES} сообщений сегодня
              </Text>
            </View>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${Math.min((todayMessageCount / FREE_DAILY_MESSAGES) * 100, 100)}%` }]} />
            </View>
          </View>
        )}

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

        {/* Правовые ссылки */}
        <View style={s.legalFooter}>
          {LEGAL_LINKS.map((link, i) => (
            <React.Fragment key={link.id}>
              {i > 0 && <Text style={s.legalDot}>·</Text>}
              <TouchableOpacity onPress={() => openLegal(link.id)} activeOpacity={0.6}>
                <Text style={s.legalLink}>{link.label}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: 16 }} />
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
              maxLength={40}
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

      {/* Notifications modal — push-уведомления пока НЕ реализованы.
          Toggle disabled, чтобы не вводить юзера в заблуждение. См. MANUAL_TODO.md. */}
      <Modal visible={notifsVisible} transparent animationType="fade" onRequestClose={() => setNotifsVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setNotifsVisible(false)}>
          <TouchableOpacity style={s.editCard} activeOpacity={1} onPress={() => {}}>
            <Text style={s.editTitle}>Уведомления</Text>
            <View style={[s.notifRow, { opacity: 0.5 }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.notifLabel}>Push-уведомления</Text>
                <Text style={[s.usageText, { marginTop: 4 }]}>Сейчас недоступны</Text>
              </View>
              <View style={s.toggle}>
                <View style={[s.toggleKnob, { left: 3, right: undefined, backgroundColor: '#fff' }]} />
              </View>
            </View>
            <TouchableOpacity style={s.editBtnSave} onPress={() => setNotifsVisible(false)} activeOpacity={0.85}>
              <Text style={s.editBtnSaveText}>Готово</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Subscription management modal — для Pro-юзеров.
          Двухстадийная: cancelStage=false → статус, true → confirm отмены. */}
      <Modal
        visible={subVisible}
        transparent
        animationType="fade"
        onRequestClose={() => { setSubVisible(false); setCancelStage(false); }}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => { setSubVisible(false); setCancelStage(false); }}
        >
          <TouchableOpacity style={s.editCard} activeOpacity={1} onPress={() => {}}>
            {!cancelStage ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Image source={require('../icons/invertLogo.png')} style={{ width: 32, height: 16, tintColor: theme.text }} />
                  <Text style={s.editTitle}>
                    {subscription?.isTrial ? 'Триал Pro' : 'Подписка Pro'}
                  </Text>
                </View>
                <View style={s.subInfoRow}>
                  <Text style={s.subInfoLabel}>Статус</Text>
                  <Text style={s.subInfoValue}>
                    {subscription?.cancelledAt
                      ? 'Отменена'
                      : subscription?.isTrial ? 'Бесплатный период' : 'Активна'}
                  </Text>
                </View>
                <View style={s.subInfoRow}>
                  <Text style={s.subInfoLabel}>Тариф</Text>
                  <Text style={s.subInfoValue}>
                    {subscription?.isTrial ? 'Пробный · далее месяц' : 'Месяц'}
                  </Text>
                </View>
                <View style={s.subInfoRow}>
                  <Text style={s.subInfoLabel}>
                    {subscription?.isTrial ? 'Списание' : 'Действует до'}
                  </Text>
                  <Text style={s.subInfoValue}>
                    {formatRuDate(subscription?.expiresAt ?? null)}
                  </Text>
                </View>

                {!subscription?.cancelledAt && (
                  <TouchableOpacity
                    style={s.subDangerBtn}
                    onPress={() => setCancelStage(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={s.subDangerText}>Отменить подписку</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={s.editBtnSave}
                  onPress={() => setSubVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={s.editBtnSaveText}>Закрыть</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={s.editTitle}>Отменить подписку?</Text>
                <Text style={s.subConfirmText}>
                  {subscription?.isTrial
                    ? `Триал останется активен до ${formatRuDate(subscription.expiresAt)}. После — без автопродления.`
                    : `Pro останется активна до ${formatRuDate(subscription?.expiresAt ?? null)}. После — без автопродления.`}
                </Text>
                <View style={s.editBtns}>
                  <TouchableOpacity
                    style={s.editBtnCancel}
                    onPress={() => setCancelStage(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.editBtnCancelText}>Назад</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.subConfirmBtn}
                    onPress={async () => {
                      await cancelSubscription();
                      setCancelStage(false);
                      setSubVisible(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={s.subConfirmBtnText}>Отменить</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Destructive confirm modal — для очистки чатов и удаления аккаунта (W2/W3). */}
      <Modal
        visible={dangerStage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => dangerStage !== 'delete_busy' && setDangerStage(null)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => dangerStage !== 'delete_busy' && setDangerStage(null)}
        >
          <TouchableOpacity style={s.editCard} activeOpacity={1} onPress={() => {}}>
            {dangerStage === 'clear_chats' && (
              <>
                <Text style={s.editTitle}>Очистить всю историю?</Text>
                <Text style={s.subConfirmText}>
                  Все диалоги со всеми персонажами будут удалены безвозвратно.
                  Подписка и кастомные персонажи останутся.
                </Text>
                <View style={s.editBtns}>
                  <TouchableOpacity
                    style={s.editBtnCancel}
                    onPress={() => setDangerStage(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.editBtnCancelText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.subConfirmBtn}
                    onPress={performDanger}
                    activeOpacity={0.85}
                  >
                    <Text style={s.subConfirmBtnText}>Очистить</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {(dangerStage === 'delete' || dangerStage === 'delete_busy') && (
              <>
                <Text style={s.editTitle}>Удалить аккаунт?</Text>
                <Text style={s.subConfirmText}>
                  Удаляются: профиль, все чаты, кастомные персонажи, подписка
                  и все настройки. Это действие нельзя отменить.
                </Text>
                <View style={s.editBtns}>
                  <TouchableOpacity
                    style={s.editBtnCancel}
                    onPress={() => setDangerStage(null)}
                    activeOpacity={0.8}
                    disabled={dangerStage === 'delete_busy'}
                  >
                    <Text style={s.editBtnCancelText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.subConfirmBtn, dangerStage === 'delete_busy' && { opacity: 0.5 }]}
                    onPress={performDanger}
                    activeOpacity={0.85}
                    disabled={dangerStage === 'delete_busy'}
                  >
                    <Text style={s.subConfirmBtnText}>
                      {dangerStage === 'delete_busy' ? 'Удаление...' : 'Удалить навсегда'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  planCardPro: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18, padding: 16, gap: 6,
  },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planTitle:    { fontSize: 15, fontWeight: '600', color: theme.text },
  planTitlePro: { fontSize: 15, fontWeight: '700', color: '#000', letterSpacing: -0.3 },
  planExpires:  { fontSize: 13, color: '#222', fontWeight: '500' },
  planBenefits: { fontSize: 11, color: '#555' },
  trialBadge: {
    backgroundColor: '#000', borderRadius: 6,
    paddingVertical: 3, paddingHorizontal: 7,
  },
  trialBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },
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

  // Subscription modal
  subInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  subInfoLabel: { fontSize: 13, color: theme.text3 },
  subInfoValue: { fontSize: 14, color: theme.text, fontWeight: '600' },
  subDangerBtn: {
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,68,68,0.3)',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  subDangerText: { fontSize: 14, fontWeight: '600', color: '#FF4444' },
  subConfirmText: { fontSize: 13, color: theme.text2, lineHeight: 19 },
  subConfirmBtn: {
    flex: 1, backgroundColor: '#FF4444', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  subConfirmBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  // Legal footer
  legalFooter: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', alignItems: 'center',
    gap: 6, paddingHorizontal: 24, paddingTop: 20,
  },
  legalLink: { fontSize: 11, color: theme.text3, letterSpacing: 0.1 },
  legalDot:  { fontSize: 11, color: theme.border },

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
