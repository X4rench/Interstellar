import React, { useMemo, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Image, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path } from 'react-native-svg'

import { theme } from '../theme'
import { StarIcon } from '../icons'
import { useApp, PaywallReason } from '../context/AppContext'

// Цена месячной подписки. Точка истины.
const MONTHLY_PRICE = '799 ₽'

// ── Иконка-крестик для close ──
function CloseIcon({ color = theme.text2, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M3 3l10 10M13 3L3 13" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  )
}

// ── Иконка галочка для чек-листа ──
function CheckIcon({ color = '#FFFFFF', size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M2.5 7.5l3 3 6-6.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

// Только реально работающие фичи. «Расширенная память», «Приоритетная скорость»,
// «Эксклюзивные персонажи» обещали раньше, но они требуют backend-флага isPremium —
// см. MANUAL_TODO.md, B1. До реализации этих фич их нельзя писать в paywall —
// это введение в заблуждение и риск отказа в App Store / RuStore.
const FEATURES: string[] = [
  'Безлимит сообщений каждый день',
  'Все персонажи 18+ без блокировки',
  'Создавайте неограниченно своих',
  'Доступ ко всем стилям и настроениям',
  'Без ограничения на количество чатов',
  'Поддержка разработчиков',
]

// ── Заголовки в зависимости от reason ──
function getReasonHeading(reason: PaywallReason | null): { title: string; subtitle: string } {
  switch (reason) {
    case 'nsfw':
      return {
        title: 'Откройте все персонажи 18+',
        subtitle: 'Без цензуры. Без ограничений по возрасту.',
      }
    case 'limit':
      return {
        title: 'Дневной лимит исчерпан',
        subtitle: 'Безлимит сообщений ждёт по подписке.',
      }
    case 'create-limit':
      return {
        title: 'Создавайте без ограничений',
        subtitle: 'Любое количество своих персонажей.',
      }
    case 'manual':
    default:
      return {
        title: 'Откройте полный доступ',
        subtitle: 'Безлимит, NSFW и приоритет.',
      }
  }
}

export default function PaywallScreen() {
  const {
    paywallReason, closePaywall,
    purchase, startTrial, restorePurchases,
    trialAvailable, isPremium,
    setLegalDocId, navigate,
  } = useApp()

  const [busy, setBusy] = useState(false)

  const heading = useMemo(() => getReasonHeading(paywallReason), [paywallReason])

  // Если уже Pro — показываем confirmation, а не paywall (мало ли).
  if (isPremium) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.activeBox}>
          <Text style={s.activeTitle}>Pro активна</Text>
          <Text style={s.activeSub}>Спасибо за поддержку!</Text>
          <TouchableOpacity style={s.bigBtn} onPress={closePaywall} activeOpacity={0.9}>
            <Text style={s.bigBtnText}>Продолжить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const handlePurchase = async () => {
    if (busy) return
    setBusy(true)
    try {
      // ВНИМАНИЕ: Реальная платёжка должна быть здесь.
      // На iOS — StoreKit (react-native-iap), на Android — Google Play Billing
      // или RuStore Billing для российской дистрибуции.
      // Сейчас имитация: ставит подписку локально через 600мс.
      await new Promise(r => setTimeout(r, 600))
      const ok = await purchase('month')
      if (ok) {
        Alert.alert('Pro активирована', 'Доступ открыт. Приятного общения!', [
          { text: 'Готово', onPress: closePaywall },
        ])
      }
    } finally {
      setBusy(false)
    }
  }

  const handleTrial = async () => {
    if (busy) return
    setBusy(true)
    try {
      const ok = await startTrial()
      if (ok) {
        Alert.alert(
          'Триал начался',
          `У вас 3 дня бесплатного доступа. После — ${MONTHLY_PRICE}/мес. Отменить можно в любой момент.`,
          [{ text: 'Отлично', onPress: closePaywall }]
        )
      }
    } finally {
      setBusy(false)
    }
  }

  const handleRestore = async () => {
    if (busy) return
    setBusy(true)
    try {
      const ok = await restorePurchases()
      if (ok) {
        Alert.alert('Восстановлено', 'Подписка восстановлена.', [
          { text: 'Готово', onPress: closePaywall },
        ])
      } else {
        Alert.alert('Не найдено', 'Активных покупок не найдено.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={s.root}>
      {/* Закрытие */}
      <TouchableOpacity
        style={s.closeBtn}
        onPress={closePaywall}
        activeOpacity={0.7}
        hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
      >
        <CloseIcon size={14} color={theme.text2} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Hero — лого + заголовок зависящий от reason */}
        <View style={s.hero}>
          <LinearGradient
            colors={['#1A1A1A', '#0A0A0A']}
            style={s.heroBadge}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Image
              source={require('../icons/invertLogo.png')}
              style={{ width: 56, height: 28, tintColor: theme.text }}
            />
          </LinearGradient>
          <View style={s.heroNameRow}>
            <Text style={s.heroBrand}>интерстеллар</Text>
            <View style={s.proPill}>
              <Text style={s.proPillText}>PRO</Text>
            </View>
          </View>
          <Text style={s.heroTitle}>{heading.title}</Text>
          <Text style={s.heroSub}>{heading.subtitle}</Text>
        </View>

        {/* Чек-лист фич */}
        <View style={s.featuresCard}>
          {FEATURES.map(text => (
            <View key={text} style={s.featureRow}>
              <View style={s.featureCheck}>
                <CheckIcon size={11} color="#000" />
              </View>
              <Text style={s.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Карточка тарифа */}
        <View style={s.planSingle}>
          <View style={s.planSingleTop}>
            <Text style={s.planSingleTitle}>
              {trialAvailable ? '3 дня бесплатно' : 'Месячная подписка'}
            </Text>
            {trialAvailable && (
              <View style={s.planSingleBadge}>
                <Text style={s.planSingleBadgeText}>FREE</Text>
              </View>
            )}
          </View>
          <Text style={s.planSinglePrice}>
            {trialAvailable ? `затем ${MONTHLY_PRICE}/мес` : `${MONTHLY_PRICE}/мес`}
          </Text>
          <Text style={s.planSingleSub}>
            {trialAvailable
              ? 'Списания не будет, если отмените до конца триала'
              : 'Отмена в любой момент в настройках'}
          </Text>
        </View>

        {/* Главный CTA */}
        <TouchableOpacity
          style={[s.bigBtn, busy && s.bigBtnBusy]}
          onPress={() => (trialAvailable ? handleTrial() : handlePurchase())}
          activeOpacity={0.9}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={s.bigBtnText}>
                {trialAvailable ? 'Начать 3 дня бесплатно' : `Оформить за ${MONTHLY_PRICE}/мес`}
              </Text>
              <Text style={s.bigBtnSub}>
                {trialAvailable ? 'Отмена в любой момент' : 'Можно отменить из профиля'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Без фейкового social-proof. Когда соберём реальный рейтинг
            из стора — вернуть блок с цифрами из API. До тех пор показываем
            нейтральное сообщение. */}
        <View style={s.guaranteeRow}>
          <View style={s.guaranteeStar}>
            <StarIcon size={11} color="#FFFFFF" />
          </View>
          <Text style={s.guaranteeText}>Отмена в любой момент в настройках</Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <TouchableOpacity onPress={handleRestore} activeOpacity={0.6} disabled={busy}>
            <Text style={s.footerLink}>Восстановить покупки</Text>
          </TouchableOpacity>
          <Text style={s.footerDot}>·</Text>
          <TouchableOpacity
            onPress={() => { setLegalDocId('subscription'); navigate('legal') }}
            activeOpacity={0.6}
          >
            <Text style={s.footerLink}>Условия</Text>
          </TouchableOpacity>
          <Text style={s.footerDot}>·</Text>
          <TouchableOpacity
            onPress={() => { setLegalDocId('privacy_policy'); navigate('legal') }}
            activeOpacity={0.6}
          >
            <Text style={s.footerLink}>Конфиденциальность</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.disclaimer}>
          Подписка продлевается автоматически до отмены. Отключить можно в настройках App Store или Google Play не позднее, чем за 24 часа до окончания периода.
        </Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16 },

  closeBtn: {
    position: 'absolute', top: 48, right: 18, zIndex: 10,
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.surface3,
    borderWidth: 1, borderColor: theme.borderLight,
  },

  // Hero
  hero: {
    alignItems: 'center', paddingTop: 24, paddingBottom: 28,
  },
  heroBadge: {
    width: 84, height: 84, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.borderLight,
    marginBottom: 16,
  },
  heroNameRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  heroBrand: {
    fontSize: 17, fontWeight: '700',
    letterSpacing: -0.7, color: theme.text,
  },
  proPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8,
  },
  proPillText: { fontSize: 11, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
  heroTitle: {
    fontSize: 26, fontWeight: '800',
    color: theme.text, letterSpacing: -0.8,
    textAlign: 'center', marginBottom: 8, paddingHorizontal: 12,
  },
  heroSub: {
    fontSize: 14, color: theme.text2, textAlign: 'center', lineHeight: 20,
    paddingHorizontal: 16,
  },

  // Features
  featuresCard: {
    backgroundColor: theme.surface2,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 18, padding: 18, gap: 14,
    marginBottom: 22,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureCheck: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontSize: 14, color: theme.text, flex: 1, lineHeight: 19 },

  // Plan card
  planSingle: {
    backgroundColor: theme.surface2,
    borderWidth: 1, borderColor: theme.borderLight,
    borderRadius: 14, padding: 16, marginBottom: 14,
  },
  planSingleTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 6,
  },
  planSingleTitle: { fontSize: 15, fontWeight: '700', color: theme.text, letterSpacing: -0.2 },
  planSingleBadge: {
    backgroundColor: '#FFFFFF', borderRadius: 6,
    paddingVertical: 3, paddingHorizontal: 8,
  },
  planSingleBadgeText: { fontSize: 10, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
  planSinglePrice: { fontSize: 14, color: theme.text2, marginBottom: 4 },
  planSingleSub: { fontSize: 11, color: theme.text3 },

  // CTA
  bigBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginBottom: 8,
    shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  bigBtnBusy: { opacity: 0.7 },
  bigBtnText: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: -0.3 },
  bigBtnSub: { fontSize: 11, color: '#444', marginTop: 3, fontWeight: '500' },

  // Guarantee
  guaranteeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginBottom: 18,
  },
  guaranteeStar: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: theme.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  guaranteeText: { fontSize: 12, color: theme.text2, fontWeight: '500' },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 12,
  },
  footerLink: { fontSize: 12, color: theme.text2, fontWeight: '500' },
  footerDot: { fontSize: 12, color: theme.border },
  disclaimer: {
    fontSize: 10, color: theme.text3, lineHeight: 14,
    textAlign: 'center', paddingHorizontal: 8,
  },

  // Active state (если уже Pro)
  activeBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  activeTitle: { fontSize: 24, fontWeight: '800', color: theme.text },
  activeSub: { fontSize: 14, color: theme.text2, marginBottom: 16 },
})
