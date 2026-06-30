#!/usr/bin/env bash
# Deploy AiGameopedia to aigamopedia.com (NOT Ai Gamopedia — that belongs on poker365.world)
# Run on server as root:
#   bash scripts/deploy-aigamopedia-server.sh

set -euo pipefail

APP_DIR="/var/www/vaszeen/aigamopedia/aigamopedia_demo"
REPO_URL="https://github.com/akashzeen-art/poker365_NigeriaMTN.git"
PORT="${PORT:-5500}"
PM2_NAME="${PM2_NAME:-aigamopedia-mtn-nigeria}"

echo "==> Deploying AiGameopedia to ${APP_DIR} (aigamopedia.com)"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  echo "==> No git repo found; replacing folder with fresh clone..."
  mkdir -p "$(dirname "${APP_DIR}")"
  if [[ -d "${APP_DIR}" ]]; then
    backup="${APP_DIR}.old.$(date +%Y%m%d%H%M%S)"
    echo "==> Moving existing folder to ${backup}"
    mv "${APP_DIR}" "${backup}"
  fi
  git clone "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"
git remote set-url origin "${REPO_URL}"
git fetch origin main
git reset --hard origin/main

npm ci --omit=dev 2>/dev/null || npm install --omit=dev

test -f server.js
test -f index.html
grep -q "AiGameopedia" index.html

if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe "${PM2_NAME}" >/dev/null 2>&1; then
    PORT="${PORT}" pm2 restart "${PM2_NAME}" --update-env
  else
    PORT="${PORT}" pm2 start server.js --name "${PM2_NAME}" --cwd "${APP_DIR}"
    pm2 save
  fi
fi

sleep 2
curl -s "http://127.0.0.1:${PORT}/" | grep '<title>'
echo "==> Done: https://aigamopedia.com/"
