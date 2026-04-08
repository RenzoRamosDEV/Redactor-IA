# Despliegue en Raspberry Pi (producción)

Este proyecto queda desplegado así:

- `Nginx` sirve el frontend estático en `/var/www/redactor-ia`
- `systemd` mantiene vivo el backend Node (`redactor-ia-backend`)
- `Nginx` hace proxy de `/api/*` y `/health` al backend (`127.0.0.1:3001`)

## 1) Preparar DNS y router

1. Crea un registro `A` en tu dominio apuntando a tu IP pública.
2. En el router, abre y redirige puertos hacia la Raspberry:
   - `80 -> 80` (HTTP)
   - `443 -> 443` (HTTPS)
3. Recomiendo IP local fija para la Raspberry.

## 2) Copiar proyecto y desplegar

Desde la Raspberry, en la raíz del proyecto:

```bash
./deploy/raspberry/setup.sh tu-dominio.com
```

Esto hace:

- instala `nginx` + `rsync`
- copia el proyecto a `/opt/redactor-ia`
- instala dependencias backend y frontend
- construye frontend
- publica `dist` en `/var/www/redactor-ia`
- crea/arranca servicio `systemd`
- instala config de `nginx`

## 3) Configurar variables backend

Edita el archivo:

```bash
nano /opt/redactor-ia/backend/.env
```

Contenido mínimo:

```env
PORT=3001
ALLOWED_ORIGINS=https://tu-dominio.com
GROQ_API_KEY=tu_api_key_real
```

Si usas `www`, añade ambos:

```env
ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

Reinicia backend:

```bash
sudo systemctl restart redactor-ia-backend
```

## 4) Activar HTTPS (Let’s Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

## 5) Verificar estado

```bash
systemctl status redactor-ia-backend --no-pager
systemctl status nginx --no-pager
curl http://127.0.0.1:3001/health
curl -I https://tu-dominio.com
```

## 6) Actualizar en el futuro

Cada vez que cambies código:

```bash
cd /ruta/al/proyecto
./deploy/raspberry/setup.sh tu-dominio.com
```

Si solo cambias `.env`:

```bash
sudo systemctl restart redactor-ia-backend
```
