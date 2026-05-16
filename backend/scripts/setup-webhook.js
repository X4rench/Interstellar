#!/usr/bin/env node
/**
 * Однократный скрипт регистрации Telegram webhook'а.
 *
 * Запускается вручную после деплоя или при смене PUBLIC_BASE_URL.
 *
 * Пример (PowerShell):
 *   cd backend
 *   node scripts/setup-webhook.js
 *
 * Что делает:
 *   1. Читает BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, PUBLIC_BASE_URL из .env
 *   2. Вызывает setWebhook с allowed_updates=[message, pre_checkout_query, my_chat_member]
 *   3. Печатает результат + текущий getWebhookInfo
 *
 * Также можно использовать --delete для отвязки webhook'а.
 */

import 'dotenv/config';
import {
  setWebhook,
  getWebhookInfo,
  deleteWebhook,
  setBotCommands,
} from '../bot-api.js';

const args = new Set(process.argv.slice(2));
const wantDelete = args.has('--delete');
const wantInfo = args.has('--info');

async function main() {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
  const PUBLIC_BASE = process.env.PUBLIC_BASE_URL;

  if (!BOT_TOKEN) {
    console.error('[setup-webhook] BOT_TOKEN not set in .env');
    process.exit(1);
  }

  if (wantInfo) {
    const info = await getWebhookInfo();
    console.log(JSON.stringify(info, null, 2));
    return;
  }

  if (wantDelete) {
    console.log('[setup-webhook] Removing webhook...');
    const res = await deleteWebhook({ dropPendingUpdates: false });
    console.log('[setup-webhook] result:', res);
    return;
  }

  if (!SECRET) {
    console.error('[setup-webhook] TELEGRAM_WEBHOOK_SECRET not set in .env');
    console.error('[setup-webhook] Generate via: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }
  if (!PUBLIC_BASE) {
    console.error('[setup-webhook] PUBLIC_BASE_URL not set in .env');
    console.error('[setup-webhook] Set to your public HTTPS URL (cloudflared/ngrok/Render).');
    process.exit(1);
  }

  const webhookUrl = `${PUBLIC_BASE.replace(/\/$/, '')}/api/v1/telegram/webhook`;
  console.log(`[setup-webhook] Registering: ${webhookUrl}`);
  const setResult = await setWebhook({
    url: webhookUrl,
    secretToken: SECRET,
    allowedUpdates: ['message', 'pre_checkout_query', 'my_chat_member'],
  });
  console.log('[setup-webhook] setWebhook result:', setResult);

  // Регистрируем /paysupport команду — требуется Telegram TOS для платных
  // ботов. Юзер видит её в меню команд.
  await setBotCommands({
    commands: [
      { command: 'start', description: 'Запустить бота' },
      { command: 'paysupport', description: 'Помощь по оплате и возврату' },
    ],
  });
  console.log('[setup-webhook] /paysupport command registered');

  console.log('\n[setup-webhook] Verifying...');
  const info = await getWebhookInfo();
  console.log(JSON.stringify(info, null, 2));

  if (info.url === webhookUrl && info.has_custom_certificate === false) {
    console.log('\n✅ Webhook is configured correctly.');
  } else {
    console.warn('\n⚠️  Webhook info does not match expected. Check above.');
  }
}

main().catch((err) => {
  console.error('[setup-webhook] FAILED:', err.message || err);
  process.exit(1);
});
