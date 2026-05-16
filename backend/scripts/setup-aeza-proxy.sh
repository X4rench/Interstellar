#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive
echo "=== Interstellar Proxy Setup ==="
apt-get update -qq
apt-get install -y -qq curl wget nano ufw build-essential
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp >/dev/null
ufw allow 3128/tcp >/dev/null
ufw allow 1080/tcp >/dev/null
ufw --force enable
cd /tmp
rm -rf 3proxy-0.9.4*
wget -q https://github.com/3proxy/3proxy/archive/refs/tags/0.9.4.tar.gz
tar xzf 0.9.4.tar.gz
cd 3proxy-0.9.4
echo "Compiling 3proxy (will take about 1 min)..."
make -f Makefile.Linux >/dev/null 2>&1
make -f Makefile.Linux install >/dev/null 2>&1
PROXY_PASS=$(openssl rand -base64 18 | tr -d '/+=' | head -c 20)
mkdir -p /etc/3proxy /var/log/3proxy
chown nobody:nogroup /var/log/3proxy
cat > /etc/3proxy/3proxy.cfg <<CFGEOF
nserver 1.1.1.1
nserver 8.8.8.8
nscache 65536
timeouts 1 5 30 60 180 1800 15 60
log /var/log/3proxy/3proxy.log D
logformat "L%d-%m-%Y %H:%M:%S %z %N.%p %E %U %C:%c %R:%r %O %I %h %T"
rotate 30
auth strong
users interstellar:CL:${PROXY_PASS}
proxy -p3128 -i0.0.0.0 -e0.0.0.0
socks -p1080 -i0.0.0.0 -e0.0.0.0
CFGEOF
cat > /etc/systemd/system/3proxy.service <<'SVCEOF'
[Unit]
Description=3proxy
After=network.target
[Service]
Type=simple
ExecStart=/usr/local/bin/3proxy /etc/3proxy/3proxy.cfg
Restart=on-failure
RestartSec=5
[Install]
WantedBy=multi-user.target
SVCEOF
systemctl daemon-reload
systemctl enable 3proxy >/dev/null 2>&1
systemctl restart 3proxy
sleep 2
if systemctl is-active --quiet 3proxy; then STATUS="RUNNING"; else STATUS="FAILED"; fi
EXT_IP=$(curl -s -4 ifconfig.me 2>/dev/null || echo "176.124.207.161")
TEST=$(curl -s -m 10 -x http://interstellar:${PROXY_PASS}@127.0.0.1:3128 https://api.telegram.org/bot1:test/getMe 2>/dev/null || echo "FAIL")
echo ""
echo "================================"
echo "  PROXY SETUP COMPLETE"
echo "================================"
echo "  Status:   $STATUS"
echo "  IP:       $EXT_IP"
echo "  Login:    interstellar"
echo "  Password: $PROXY_PASS"
echo "  HTTP:     3128"
echo "  SOCKS5:   1080"
echo "  Test:     ${TEST:0:80}"
echo "================================"
echo ""
echo "TG_API_PROXY=http://interstellar:${PROXY_PASS}@${EXT_IP}:3128"
