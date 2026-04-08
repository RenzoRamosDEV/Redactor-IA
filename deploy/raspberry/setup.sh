#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -eq 0 ]]; then
  echo "Ejecuta este script como usuario normal (usará sudo cuando haga falta)."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="/opt/redactor-ia"
WEB_DIR="/var/www/redactor-ia"
SERVICE_NAME="redactor-ia-backend"
DOMAIN="${1:-tu-dominio.com}"

printf "\n[1/8] Instalando paquetes base...\n"
sudo apt update
sudo apt install -y nginx rsync nodejs npm

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if (( NODE_MAJOR < 18 )); then
  echo "Node.js ${NODE_MAJOR} detectado. Se requiere Node.js 18 o superior."
  echo "Instala una versión más reciente de Node y vuelve a ejecutar el script."
  exit 1
fi

printf "\n[2/8] Copiando proyecto a %s ...\n" "$APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo rsync -a --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  "$ROOT_DIR/" "$APP_DIR/"
sudo chown -R "$USER":"$USER" "$APP_DIR"

printf "\n[3/8] Instalando dependencias backend...\n"
cd "$APP_DIR/backend"
npm ci --omit=dev

if [[ ! -f "$APP_DIR/backend/.env" ]]; then
  cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
  echo "ATENCION: Se creó $APP_DIR/backend/.env desde .env.example. Edita GROQ_API_KEY antes de usar en producción."
fi

printf "\n[4/8] Construyendo frontend...\n"
cd "$APP_DIR/frontend"
npm ci
npm run build

printf "\n[5/8] Publicando frontend en %s ...\n" "$WEB_DIR"
sudo mkdir -p "$WEB_DIR"
sudo rsync -a --delete "$APP_DIR/frontend/dist/" "$WEB_DIR/"

printf "\n[6/8] Instalando servicio systemd...\n"
sudo cp "$APP_DIR/deploy/raspberry/systemd/redactor-ia-backend.service" "/etc/systemd/system/${SERVICE_NAME}.service"
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

printf "\n[7/8] Configurando Nginx para %s ...\n" "$DOMAIN"
sudo cp "$APP_DIR/deploy/raspberry/nginx/redactor-ia.conf" /etc/nginx/sites-available/redactor-ia.conf
sudo sed -i "s/tu-dominio.com/${DOMAIN}/g" /etc/nginx/sites-available/redactor-ia.conf
sudo ln -sf /etc/nginx/sites-available/redactor-ia.conf /etc/nginx/sites-enabled/redactor-ia.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

printf "\n[8/8] Estado de servicios\n"
sudo systemctl --no-pager --full status "$SERVICE_NAME" || true
sudo systemctl --no-pager --full status nginx || true

echo ""
echo "Despliegue base completado."
echo "Siguiente paso recomendado: configurar HTTPS con certbot:"
echo "  sudo apt install -y certbot python3-certbot-nginx"
echo "  sudo certbot --nginx -d ${DOMAIN}"
