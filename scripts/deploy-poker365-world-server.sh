#!/usr/bin/env bash
# Deploy Poker 365 to poker365.world (separate port from aigamopedia.com)
# Run on server as root:
#   bash scripts/deploy-poker365-world-server.sh

set -euo pipefail

APP_DIR="/var/www/vaszeen/poker365"
REPO_URL="https://github.com/akashzeen-art/AiGamopediaPlArEn.git"
PORT="${PORT:-5501}"
PM2_NAME="${PM2_NAME:-poker365-world}"

echo "==> Deploying Poker 365 to ${APP_DIR} (poker365.world)"

mkdir -p "$(dirname "${APP_DIR}")"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  if [[ -d "${APP_DIR}" ]]; then
    mv "${APP_DIR}" "${APP_DIR}.old.$(date +%Y%m%d%H%M%S)"
  fi
  git clone "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"
git remote set-url origin "${REPO_URL}"
git fetch origin main
git reset --hard origin/main
npm ci --omit=dev

grep -q "Poker 365" index.html

if pm2 describe "${PM2_NAME}" >/dev/null 2>&1; then
  PORT="${PORT}" pm2 restart "${PM2_NAME}" --update-env
else
  PORT="${PORT}" pm2 start server.js --name "${PM2_NAME}" --cwd "${APP_DIR}"
  pm2 save
fi

sleep 2
curl -s "http://127.0.0.1:${PORT}/" | grep '<title>'
curl -s -o /dev/null -w "moreGames.js: %{http_code}\n" "http://127.0.0.1:${PORT}/moreGames.js"
curl -s -o /dev/null -w "play365Games.js: %{http_code}\n" "http://127.0.0.1:${PORT}/play365Games.js"
curl -s -o /dev/null -w "thumbnails: %{http_code}\n" "http://127.0.0.1:${PORT}/thumbnails/aircraft.png"
echo "==> Done. Point nginx poker365.world -> http://127.0.0.1:${PORT}"
