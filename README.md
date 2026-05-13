# Redactor IA

Herramienta web para reformular y mejorar textos usando inteligencia artificial. El usuario pega su texto, elige el tono deseado y recibe una versión reescrita por un modelo LLM en segundos.

---

## Preview

![Captura 1](frontend/src/assets/Captura%20desde%202026-05-13%2015-42-06.png)
![Captura 2](frontend/src/assets/Captura%20desde%202026-05-13%2015-42-11.png)

---

## Para qué sirve

- **Mejorar la redacción** de textos escritos rápido o con errores de estilo
- **Cambiar el tono** de un mensaje: más formal, casual, profesional, directo, persuasivo, divertido o creativo
- **Ajustar la intensidad** del cambio (desde leve retoque hasta reescritura total)
- **Mantener o liberar la longitud** del texto original según necesidad
- **Agregar instrucciones extra** para personalizar el resultado

---

## Tecnologías

### Frontend

| Tecnología | Uso |
|---|---|
| **React 19** | Framework UI principal |
| **Vite** | Bundler y servidor de desarrollo |
| **Tailwind CSS** | Estilos y diseño responsive |
| **i18next** | Internacionalización (español / inglés) |
| **Lucide React** | Iconos |
| **clsx + tailwind-merge** | Composición condicional de clases CSS |
| **Claude Design** | Para demos y modelos de front |

### Backend

| Tecnología | Uso |
|---|---|
| **Node.js + Express 5** | Servidor HTTP y API REST |
| **Groq SDK** | Cliente para llamar al modelo LLM |
| **Llama 3.3 70B** | Modelo de IA que reformula el texto (vía Groq) |
| **Helmet** | Headers de seguridad HTTP |
| **CORS** | Control de acceso entre origen frontend y backend |
| **express-rate-limit** | Límite de uso por IP (8 intentos/15min, 40/día) |
| **dotenv** | Gestión de variables de entorno |

---

## Arquitectura

```
redactor-ia/
├── frontend/          # App React (Vite)
│   └── src/
│       ├── components/    # Header, TextInputCard, ToneSelectorCard, ResultCard
│       ├── pages/         # Home.jsx (estado global)
│       ├── services/      # Llamadas a la API del backend
│       ├── locales/       # Traducciones es.json / en.json
│       └── constants/     # Tonos, límites, configuración
└── backend/           # API Express (Node.js)
    └── src/
        ├── routes/        # POST /api/rewrite, GET /api/limits
        ├── controllers/   # Lógica de las rutas
        ├── services/      # Integración con Groq API
        ├── middlewares/   # Rate limiting, manejo de errores
        └── utils/         # Construcción del prompt
```

---

## Configuración y arranque

### 1. Variables de entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
GROQ_API_KEY=tu_api_key_de_groq
PORT=3001
# Opcional: URL del frontend en producción
FRONTEND_URL=https://tu-dominio.com
```

Obtén tu API key gratis en: https://console.groq.com/keys

### 2. Instalar dependencias

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 3. Levantar el proyecto

```bash
# Desde la raíz del proyecto
node backend/src/server.js & npm run dev --prefix frontend
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/health

### 4. Parar los servicios

```bash
pkill -f "node.*server.js" && pkill -f "vite"
```

---

## Limites de uso

Para evitar abuso de la API de IA, el backend aplica rate limiting por IP:

- **8 intentos** por ventana de 15 minutos
- **40 intentos** por día (reset a medianoche)
- Máximo **500 caracteres** por texto de entrada
