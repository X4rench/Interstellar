#!/bin/bash
# ════════════════════════════════════════════════════════════════════
# Interstellar Backend Setup — AEZA Moscow
# Запускать как root через VNC: curl ... | bash
# ════════════════════════════════════════════════════════════════════
set -e
export DEBIAN_FRONTEND=noninteractive

# ── Конфиг (заполнено для interstellar-app.ru, IP 77.110.105.156) ──
POLZA_KEY="pza_3WwCiKq4iHk0_x7ZLo2beYwq8qy-TU35"
ADMIN_IDS="794285476,1920476158"
DOMAIN="api.interstellar-app.ru"
GH_REPO="https://github.com/X4rench/Interstellar.git"
TG_PROXY="http://interstellar:JXq2kAXVREqoiQLgh28v@176.124.207.161:3128"

echo "=== Interstellar Backend Setup Started ==="

# ── 1. Update + install packages ──────────────────────────────────
echo "[1/12] Updating apt + installing packages (this takes ~2 min)..."
apt-get update -qq
apt-get install -y -qq \
  curl wget git nano ufw build-essential \
  nginx certbot python3-certbot-nginx

# ── 2. Firewall ───────────────────────────────────────────────────
echo "[2/12] Configuring firewall..."
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable

# ── 3. Create user ────────────────────────────────────────────────
echo "[3/12] Creating user 'interstellar'..."
if ! id interstellar >/dev/null 2>&1; then
  useradd -m -s /bin/bash interstellar
  usermod -aG sudo interstellar
fi

# ── 4. Install nvm + Node 20 for interstellar user ────────────────
echo "[4/12] Installing nvm + Node 20 (this takes ~1-2 min)..."
sudo -u interstellar bash <<'NVMEOF'
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash >/dev/null 2>&1
fi
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 20 >/dev/null 2>&1
nvm alias default 20 >/dev/null 2>&1
node --version
NVMEOF

# ── 5. Clone repo ─────────────────────────────────────────────────
echo "[5/12] Cloning repo..."
sudo -u interstellar bash <<CLONEEOF
if [ ! -d "\$HOME/interstellar" ]; then
  git clone $GH_REPO \$HOME/interstellar
else
  cd \$HOME/interstellar && git pull
fi
CLONEEOF

# ── 6. Data dir ───────────────────────────────────────────────────
echo "[6/12] Creating data directory..."
sudo -u interstellar mkdir -p /home/interstellar/interstellar-data

# ── 7. Generate secrets + write .env ──────────────────────────────
echo "[7/12] Generating secrets and writing .env..."
PAYOUT_KEY=$(openssl rand -base64 32)
WEBHOOK_SECRET=$(openssl rand -hex 32)

cat > /home/interstellar/interstellar/backend/.env <<ENVEOF
# polza.ai LLM
POLZA_API_KEY=$POLZA_KEY
POLZA_API_URL=https://api.polza.ai/api/v1/chat/completions
POLZA_MODEL=openai/gpt-4o-mini

# Server
PORT=3001
NODE_ENV=production
TRUST_PROXY_HOPS=1

# Telegram Bot — ЗАПОЛНИТЬ ВРУЧНУЮ после создания бота в @BotFather
BOT_TOKEN=
BOT_USERNAME=
BOT_APP_NAME=app

# Database
DB_PATH=/home/interstellar/interstellar-data/interstellar.sqlite

# DEV bypass — ВКЛЮЧЕНО пока BOT_TOKEN не установлен. После настройки
# бота — поменять на 0 и перезапустить сервис.
DEV_BYPASS_INITDATA=1

# CORS — обновить после деплоя frontend на Cloudflare Pages
CORS_ALLOWED_ORIGINS=https://localhost:5173

# RBAC
ADMIN_TELEGRAM_IDS=$ADMIN_IDS
PAYOUT_ENCRYPTION_KEY=$PAYOUT_KEY
PARTNER_PII_CONSENT_VERSION=2026.05
BUSINESS_INN=
BUSINESS_NAME=Interstellar

# Тарифы (Stars)
STAR_PRICE_BASIC=199
STAR_PRICE_PREMIUM=499
STAR_PRICE_DAY_PASS=50

# Webhook
TELEGRAM_WEBHOOK_SECRET=$WEBHOOK_SECRET
PUBLIC_BASE_URL=https://$DOMAIN

# Прокси к api.telegram.org через AEZA Швеция
TG_API_PROXY=$TG_PROXY

# Reconciliation
RECONCILE_INTERVAL_MIN=5
ENVEOF
chown interstellar:interstellar /home/interstellar/interstellar/backend/.env
chmod 600 /home/interstellar/interstellar/backend/.env

# ── 8. npm ci ─────────────────────────────────────────────────────
echo "[8/12] Installing npm dependencies (this takes ~2-3 min for better-sqlite3 compile)..."
sudo -u interstellar bash <<'NPMEOF'
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
cd $HOME/interstellar/backend
npm ci
NPMEOF

# ── 9. systemd service ────────────────────────────────────────────
echo "[9/12] Creating systemd service..."
NODE_BIN=$(ls /home/interstellar/.nvm/versions/node/*/bin/node | head -1)

mkdir -p /var/log/interstellar
chown interstellar:interstellar /var/log/interstellar

cat > /etc/systemd/system/interstellar.service <<SVCEOF
[Unit]
Description=Interstellar Backend
After=network.target

[Service]
Type=simple
User=interstellar
WorkingDirectory=/home/interstellar/interstellar/backend
ExecStart=$NODE_BIN server.js
Restart=on-failure
RestartSec=5
EnvironmentFile=/home/interstellar/interstellar/backend/.env
StandardOutput=append:/var/log/interstellar/backend.log
StandardError=append:/var/log/interstellar/backend.err.log

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable interstellar >/dev/null 2>&1
systemctl restart interstellar
sleep 3

# ── 10. nginx ─────────────────────────────────────────────────────
echo "[10/12] Configuring nginx..."
cat > /etc/nginx/sites-available/interstellar <<NGINXEOF
server {
    server_name $DOMAIN;
    listen 80;

    location /api/v1/telegram/webhook {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Telegram-Bot-Api-Secret-Token \$http_x_telegram_bot_api_secret_token;
        client_max_body_size 1m;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        proxy_http_version 1.1;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/interstellar /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ── 11. Let's Encrypt SSL (non-fatal — может упасть если DNS не разлетелся) ──
echo "[11/12] Attempting Let's Encrypt SSL..."
SSL_OK="NO"
if certbot --nginx -d $DOMAIN \
   --non-interactive --agree-tos \
   --register-unsafely-without-email \
   --redirect 2>&1 | tail -10; then
  SSL_OK="YES"
fi

# ── 12. Health check ──────────────────────────────────────────────
echo "[12/12] Running health check..."
sleep 2
HEALTH=$(curl -s --max-time 5 http://localhost:3001/health || echo "FAIL")
SERVICE_STATUS=$(systemctl is-active interstellar)
NGINX_STATUS=$(systemctl is-active nginx)
EXT_IP=$(curl -s -4 --max-time 5 ifconfig.me 2>/dev/null || echo "unknown")

echo ""
echo "════════════════════════════════════════════"
echo "  BACKEND SETUP COMPLETE"
echo "════════════════════════════════════════════"
echo "  Server IP:      $EXT_IP"
echo "  Domain:         $DOMAIN"
echo "  systemd:        $SERVICE_STATUS"
echo "  nginx:          $NGINX_STATUS"
echo "  SSL configured: $SSL_OK"
echo "  /health:        ${HEALTH:0:80}"
echo "════════════════════════════════════════════"
echo ""
echo "NEXT STEPS:"
echo "  1. Test: curl -k https://$DOMAIN/health"
echo "     (или http:// если SSL=NO)"
echo "  2. Create bot in @BotFather, get BOT_TOKEN"
echo "  3. Edit /home/interstellar/interstellar/backend/.env"
echo "     - Set BOT_TOKEN=..."
echo "     - Set BOT_USERNAME=..."
echo "     - Set DEV_BYPASS_INITDATA=0"
echo "  4. systemctl restart interstellar"
echo ""
if [ "$SSL_OK" = "NO" ]; then
  echo "⚠️  SSL не настроился — DNS ещё не пропагнулся."
  echo "    Подожди 15-30 минут и запусти:"
  echo "    certbot --nginx -d $DOMAIN --register-unsafely-without-email --agree-tos --redirect"
fi
