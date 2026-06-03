#!/bin/bash
# Точечный фикс CORS для Интерстеллара.
# Купидон НЕ трогается: только /home/interstellar/.../.env + systemctl restart interstellar.

ENV=/home/interstellar/interstellar/backend/.env

echo "===== BEFORE ====="
grep CORS_ALLOWED_ORIGINS "$ENV" || { echo "FAIL: не нашёл CORS_ALLOWED_ORIGINS в .env"; exit 1; }
echo ""

echo "===== BACKUP ====="
BACKUP="${ENV}.bak.$(date +%s)"
cp "$ENV" "$BACKUP"
echo "Сохранён бэкап: $BACKUP"
echo ""

echo "===== APPLYING PATCH ====="
# Идемпотентность: если web.telegram.org уже есть — ничего не делаем.
if grep -q "https://web.telegram.org" "$ENV"; then
    echo "web.telegram.org уже в whitelist — no-op"
else
    # Добавляем 3 варианта в конец текущей строки CORS_ALLOWED_ORIGINS.
    sed -i 's|\(CORS_ALLOWED_ORIGINS=.*\)|\1,https://web.telegram.org,https://webk.telegram.org,https://weba.telegram.org|' "$ENV"
    echo "Патч применён"
fi
echo ""

echo "===== AFTER ====="
grep CORS_ALLOWED_ORIGINS "$ENV"
echo ""

echo "===== RESTART INTERSTELLAR (cupidon НЕ трогаем) ====="
systemctl restart interstellar
sleep 2
echo "interstellar: $(systemctl is-active interstellar)"
echo "cupidon (untouched): $(systemctl is-active cupidon)"
echo ""

echo "===== SAFETY CHECK: оба проекта живы ====="
echo "--- interstellar /health ---"
curl -s --max-time 5 https://api.interstellar-app.ru/health
echo ""
echo "--- cupidon /health (MUST STAY UP) ---"
curl -s --max-time 5 https://cupidonai.ru/health
echo ""
echo ""

echo "===== CORS PREFLIGHT: web.telegram.org должен теперь пройти 204 ====="
curl -i -X OPTIONS --max-time 5 \
  -H "Origin: https://web.telegram.org" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  https://api.interstellar-app.ru/api/v1/chat 2>&1 | head -15
echo ""

echo "===== CORS PREFLIGHT: webk.telegram.org ====="
curl -i -X OPTIONS --max-time 5 \
  -H "Origin: https://webk.telegram.org" \
  -H "Access-Control-Request-Method: POST" \
  https://api.interstellar-app.ru/api/v1/chat 2>&1 | head -10
echo ""

echo "===== журнал interstellar (последние 15 строк) ====="
journalctl -u interstellar -n 15 --no-pager 2>&1 | tail -15

echo ""
echo "===== DONE ====="
echo "Если preflight выше = HTTP/1.1 204 + Access-Control-Allow-Origin: https://web.telegram.org →"
echo "  открой Mini App в Telegram Desktop, попробуй отправить сообщение — должно работать."
echo ""
echo "Если что-то пошло не так — откати: cp $BACKUP $ENV && systemctl restart interstellar"
