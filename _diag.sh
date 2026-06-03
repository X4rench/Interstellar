#!/bin/bash
echo "===== 1. CORS env в .env ====="
grep -iE "CORS|ORIGIN|BOT_USERNAME|PUBLIC_BASE_URL|DEV_BYPASS" /home/interstellar/interstellar/backend/.env 2>&1 | head -20

echo ""
echo "===== 2. CORS-код в server.js ====="
grep -nE "cors|origin|Origin|ALLOWED|allowedOrigins|allowList" /home/interstellar/interstellar/backend/server.js 2>&1 | head -30

echo ""
echo "===== 3. interstellar.service ====="
cat /etc/systemd/system/interstellar.service 2>&1

echo ""
echo "===== 4. Sanity check: оба проекта живы ====="
systemctl is-active interstellar cupidon
echo "--- health interstellar ---"
curl -s --max-time 5 https://api.interstellar-app.ru/health
echo ""
echo "--- health cupidon ---"
curl -s --max-time 5 https://cupidonai.ru/health
echo ""

echo "===== 5. nginx syntax ====="
nginx -t 2>&1

echo ""
echo "===== 6. nginx-конфиги Интерстеллара ====="
echo "--- sites-enabled/interstellar (API) ---"
cat /etc/nginx/sites-enabled/interstellar 2>&1 | head -60
echo ""
echo "--- sites-enabled/interstellar-frontend (статика) ---"
cat /etc/nginx/sites-enabled/interstellar-frontend 2>&1 | head -60

echo ""
echo "===== 7. dist и какой хэш реально отдаётся ====="
ls -la /home/interstellar/interstellar/mini-app/dist/ 2>&1 | head -10
echo "--- из реального HTTPS-ответа ---"
curl -s --max-time 5 https://interstellar-app.ru/ | grep -oE 'index-[^."]+\.(js|css)' | head -5

echo ""
echo "===== 8. journalctl interstellar -n 30 ====="
journalctl -u interstellar -n 30 --no-pager 2>&1 | tail -30

echo ""
echo "===== 9. sshd config + auth.log ====="
grep -iE "MaxStartups|MaxAuthTries|LoginGraceTime|AllowUsers|DenyUsers|AllowGroups" /etc/ssh/sshd_config 2>&1 | grep -v "^#"
echo "--- последние SSH-attempts ---"
tail -30 /var/log/auth.log 2>/dev/null | grep -iE "sshd|72.57" | tail -10
