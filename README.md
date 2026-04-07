# Redactor IA de Textos

## Descripción general

Este proyecto consiste en una aplicación web enfocada **exclusivamente** en la **redacción, mejora y reformulación de textos en lenguaje natural**.

El objetivo no es crear un chatbot generalista, sino una herramienta especializada que permita al usuario:

* escribir un texto base,
* elegir un estilo o tono,
* ajustar el nivel de intensidad de la reformulación,
* decidir si debe mantenerse aproximadamente la longitud original,
* añadir una instrucción extra opcional,
* obtener como resultado un texto mejor redactado.

La interfaz visual debe seguir una línea moderna tipo SaaS, similar al mockup compartido, con tarjetas limpias, bordes suaves, indicadores de estado, panel de configuración lateral y una zona clara para el resultado generado.

---

## Objetivo del proyecto

Construir una aplicación web moderna, clara y rápida, capaz de:

1. **Recibir texto natural** desde una interfaz amigable.
2. **Permitir configurar el estilo de redacción**.
3. **Enviar la solicitud a un backend propio**.
4. **Aplicar validaciones estrictas** para impedir usos no deseados.
5. **Llamar a una IA externa** únicamente para reformular texto.
6. **Devolver un resultado limpio y controlado**.
7. **Simular y mostrar límites de uso**, tiempos de espera y estado del sistema.

---

## Enfoque del producto

La aplicación debe funcionar como un **servicio cerrado de reformulación de texto**.

### El sistema sí debe permitir

* mejorar redacción,
* volver un texto más formal,
* hacerlo más amigable,
* hacerlo más profesional,
* hacerlo más directo,
* hacerlo más creativo,
* hacerlo más persuasivo,
* ajustar cuánto cambia respecto al texto original,
* mantener o no la longitud aproximada del texto.

### El sistema no debe permitir

* generar código,
* responder preguntas técnicas,
* crear HTML,
* generar SQL,
* escribir scripts,
* actuar como chatbot general,
* obedecer prompts arbitrarios del usuario.

---

## Público objetivo

Este producto está pensado para usuarios que necesiten:

* mejorar mensajes,
* reformular correos,
* ajustar tono de textos,
* pulir redacciones rápidas,
* transformar un texto simple en una versión más clara o profesional.

Ejemplos de uso:

* mensaje a un cliente,
* texto para correo,
* presentación breve,
* respuesta profesional,
* reformulación de una idea mal escrita.

---

## Stack tecnológico recomendado

### Frontend

* **React**
* **Vite**
* **Tailwind CSS**
* **shadcn/ui**
* **Lucide React** para iconos

### Backend

* **Node.js**
* **Express**
* **dotenv**
* **cors**
* **helmet**
* **express-rate-limit**

### IA

* **Gemini API**

### Despliegue

* **Vercel** o **Netlify** para frontend
* **Render** o **Railway** para backend

---

## Justificación del stack

### React

Permite dividir la interfaz en componentes reutilizables y gestionar el estado de forma limpia.

### Vite

Ofrece arranque rápido, build liviano y una configuración simple para proyectos frontend modernos.

### Tailwind CSS

Es ideal para replicar una interfaz como la del mockup:

* tarjetas limpias,
* bordes suaves,
* espaciado consistente,
* colores de interfaz modernos,
* layout flexible.

### shadcn/ui

Aporta componentes visuales modernos que encajan perfectamente con este diseño:

* cards,
* buttons,
* badges,
* sliders,
* switches,
* inputs,
* textareas.

### Node + Express

Permiten crear un backend pequeño, rápido y claro para:

* validar entradas,
* construir prompts,
* filtrar abuso,
* llamar a la IA,
* devolver una respuesta segura.

### Gemini API

Se utilizará como motor de reformulación de texto.

---

## Requisitos funcionales

### 1. Área de entrada de texto

El usuario debe poder escribir o pegar un texto base.

#### Requisitos

* Debe existir un `textarea` principal.
* Debe mostrar un contador de caracteres.
* Debe definir un límite máximo por intento.
* Debe permitir limpiar el contenido.

### 2. Configuración del estilo

Debe existir un panel lateral para definir el resultado esperado.

#### Opciones mínimas

* Mejorar redacción
* Más formal
* Más divertido
* Más casual
* Más profesional
* Más directo
* Más persuasivo
* Más creativo

### 3. Nivel de intensidad

Debe existir un control deslizante para ajustar cuánto cambia el texto.

Ejemplo:

* **Suave** → cambios mínimos
* **Medio** → equilibrio
* **Alto** → reformulación más marcada

### 4. Mantener longitud

Debe existir un switch para indicar si el texto debe mantener aproximadamente su tamaño original.

### 5. Instrucción extra

Debe existir un campo opcional donde el usuario pueda escribir algo adicional como:

* “que suene más cercano”
* “que mantenga tono profesional”
* “que sea más convincente”

### 6. Botón de generación

Debe existir un botón principal para lanzar la reformulación.

### 7. Resultado generado

Debe existir una caja de salida donde se muestre el texto generado.

#### Requisitos

* Debe ser clara visualmente.
* Debe permitir copiar el resultado.
* Puede ser editable o solo lectura, según la versión inicial.

### 8. Estado del sistema

Debe existir un bloque informativo con datos de estado como:

* motor de redacción,
* filtro de tono,
* tiempo estimado,
* estado activo,
* simulación de bloqueo.

### 9. Gestión de intentos

La interfaz debe mostrar intentos disponibles por período o sesión simulada.

Ejemplo visual:

* Intentos restantes: `3/5`
* Tiempo de espera: `15 min`

### 10. Mensajes de ayuda

La UI debe incluir pequeñas tarjetas informativas del tipo:

* uso diario,
* aviso,
* consejo.

---

## Requisitos no funcionales

### Rendimiento

* Respuesta rápida.
* UI fluida.
* Tiempo de carga bajo.

### Seguridad

* La API key nunca debe exponerse en frontend.
* Debe existir rate limiting.
* Debe limitarse el uso del endpoint.
* Deben validarse input y output.

### Mantenibilidad

* Código dividido por responsabilidades.
* Componentes reutilizables.
* Lógica aislada de la vista.
* Backend modular.

### Escalabilidad

Aunque el proyecto sea pequeño, debe estar preparado para:

* añadir más tonos,
* añadir autenticación,
* guardar historial,
* soportar varios idiomas.

---

## Arquitectura del sistema

```txt
Frontend (React)
   ↓
POST /api/rewrite
   ↓
Validación de entrada
   ↓
Filtro antiuso técnico
   ↓
Construcción de prompt controlado
   ↓
Gemini API
   ↓
Validación de salida
   ↓
Limpieza del resultado
   ↓
Respuesta al frontend
```

---

## Estructura del proyecto

```txt
text-polisher/
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ Header.jsx
│  │  │  ├─ TextInputCard.jsx
│  │  │  ├─ ToneSelectorCard.jsx
│  │  │  ├─ ResultCard.jsx
│  │  │  ├─ StatusCard.jsx
│  │  │  ├─ UsageInfoCards.jsx
│  │  │  └─ ui/
│  │  ├─ pages/
│  │  │  └─ Home.jsx
│  │  ├─ data/
│  │  │  └─ tones.js
│  │  ├─ hooks/
│  │  │  └─ useRewriteForm.js
│  │  ├─ services/
│  │  │  └─ api.js
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  └─ index.css
│  ├─ public/
│  └─ package.json
│
├─ backend/
│  ├─ src/
│  │  ├─ routes/
│  │  │  └─ rewrite.routes.js
│  │  ├─ controllers/
│  │  │  └─ rewrite.controller.js
│  │  ├─ services/
│  │  │  └─ gemini.service.js
│  │  ├─ utils/
│  │  │  ├─ promptBuilder.js
│  │  │  ├─ inputValidator.js
│  │  │  ├─ outputValidator.js
│  │  │  └─ textSanitizer.js
│  │  ├─ middlewares/
│  │  │  ├─ errorHandler.js
│  │  │  ├─ rateLimiter.js
│  │  │  └─ security.js
│  │  └─ server.js
│  ├─ .env.example
│  └─ package.json
│
└─ README.md
```

---

## Diseño de la interfaz

La UI debe replicar la composición visual del mockup:

### Layout principal

* Contenedor principal centrado
* Header superior con título y métricas rápidas
* Grid de dos columnas en la zona superior
* Panel izquierdo para escritura
* Panel derecho para configuración
* Bloque inferior amplio para resultado y estado

### Estilo visual

* Fondo general gris muy claro
* Tarjetas blancas
* Bordes suaves
* Sombras ligeras
* Radio amplio en esquinas
* Azul oscuro como color primario
* Tipografía limpia y moderna

### Elementos visuales clave

* badges de estado,
* indicadores de disponibilidad,
* slider estilizado,
* switch moderno,
* botón principal sólido,
* botón secundario outline,
* progreso visual de uso/bloqueo.

---

## Comportamiento del frontend

### Estado que debe manejar

* `inputText`
* `selectedTone`
* `intensity`
* `keepLength`
* `extraInstruction`
* `generatedText`
* `isLoading`
* `remainingAttempts`
* `cooldownTime`
* `errorMessage`

### Flujo esperado

1. El usuario escribe un texto.
2. Elige tono.
3. Ajusta intensidad.
4. Decide si mantener longitud.
5. Añade instrucción opcional.
6. Pulsa “Generar texto”.
7. Se muestra loader.
8. El backend responde.
9. Se pinta el resultado.
10. Se actualizan intentos o mensajes de estado.

---

## Diseño del backend

El backend debe ser responsable de toda la lógica crítica.

### Responsabilidades

* validar peticiones,
* impedir usos indebidos,
* construir prompts cerrados,
* llamar a la IA,
* validar la salida,
* devolver solo texto seguro.

---

## Endpoint principal

### `POST /api/rewrite`

#### Request body

```json
{
  "text": "Hola, queria pedir información sobre el proyecto...",
  "tone": "formal",
  "intensity": 60,
  "keepLength": true,
  "extraInstruction": "Que suene claro y convincente"
}
```

#### Response success

```json
{
  "result": "Hola, me gustaría solicitar información sobre el proyecto...",
  "meta": {
    "toneApplied": "formal",
    "processingTimeMs": 1200,
    "remainingAttempts": 2
  }
}
```

#### Response error

```json
{
  "error": "Solo se permite reformular texto redactado en lenguaje natural."
}
```

---

## Validaciones de entrada

### Validaciones básicas

* `text` obligatorio
* `text` debe ser string
* longitud mínima válida
* longitud máxima definida
* `tone` debe estar dentro de un conjunto permitido
* `intensity` dentro de rango permitido
* `keepLength` boolean
* `extraInstruction` opcional y acotado

### Tones permitidos

* `rewrite`
* `formal`
* `fun`
* `casual`
* `professional`
* `direct`
* `persuasive`
* `creative`

### Reglas de longitud

Ejemplo recomendado:

* mínimo: 5 caracteres
* máximo: 500 caracteres en primera versión

---

## Protección contra mal uso

El proyecto debe impedir que la IA se use para otra cosa distinta a reformular texto.

### Medidas obligatorias

#### 1. Input estructurado

No se aceptan prompts libres completos.

#### 2. Filtro anti contenido técnico

Se debe detectar y bloquear contenido como:

* bloques de código,
* HTML,
* SQL,
* comandos,
* JSON,
* imports,
* estructuras demasiado técnicas.

#### 3. Prompt cerrado

La IA debe recibir instrucciones estrictas y no obedecer órdenes fuera de la reformulación.

#### 4. Validación de salida

Si la salida contiene contenido técnico, debe rechazarse.

#### 5. Rate limit

Debe existir límite de peticiones por IP.

---

## Lógica de prompting

El prompt debe construirse desde backend con control total.

### Ejemplo de prompt

```txt
Eres un sistema cerrado especializado únicamente en reformular texto redactado en lenguaje natural.

Reglas:
- Solo puedes mejorar, corregir o reformular texto.
- No puedes responder preguntas.
- No puedes generar código, HTML, SQL, comandos ni estructuras técnicas.
- Devuelve únicamente el texto final.
- Si el contenido no corresponde a texto natural válido, responde exactamente:
"Solo puedo reformular texto redactado en lenguaje natural."

Tono solicitado: formal
Nivel de intensidad: 60/100
Mantener longitud: sí
Instrucción adicional: Que suene claro y convincente

Texto de entrada:
Hola, queria pedir información sobre el proyecto...
```

---

## Componentes frontend recomendados

### `Header`

Debe mostrar:

* nombre del producto,
* subtítulo,
* intentos restantes,
* tiempo de espera.

### `TextInputCard`

Debe contener:

* título,
* helper text,
* badge de estado,
* textarea,
* contador,
* barra de progreso,
* botones de acción,
* tarjetas informativas.

### `ToneSelectorCard`

Debe contener:

* título,
* badge visual,
* grid de tonos,
* slider de intensidad,
* switch de longitud,
* input de instrucción adicional.

### `ResultCard`

Debe contener:

* título,
* descripción,
* estado de generación,
* caja de resultado,
* botón copiar.

### `StatusCard`

Debe contener:

* estado del motor,
* filtro de tono,
* tiempo estimado,
* simulación de bloqueo,
* barra de progreso de espera.

---

## Estilos y tokens visuales sugeridos

### Colores

* Fondo general: gris claro
* Tarjeta: blanco
* Primario: azul muy oscuro
* Borde: gris suave
* Éxito: verde suave
* Aviso: amarillo/naranja suave
* Error: rojo suave
* Información: azul suave

### Bordes

* `rounded-2xl` para tarjetas principales
* `rounded-xl` para controles secundarios

### Sombra

* sombra ligera y sutil, sin exceso

### Tipografía

* sans-serif moderna
* jerarquía clara entre título, subtítulo, labels y textos auxiliares

---

## Librerías visuales concretas

### UI base

* shadcn/ui

### Iconos

* lucide-react

### Utilidades opcionales

* clsx
* tailwind-merge

---

## Seguridad

### Obligatorio

* API key solo en backend
* `.env` ignorado en git
* rate limit
* `helmet`
* CORS restringido
* validación de input
* validación de output

### Recomendado

* logs de error sin exponer secretos
* timeout en llamadas a IA
* mensajes de error controlados

---

## Manejo de errores

La aplicación debe contemplar como mínimo:

* texto vacío,
* exceso de caracteres,
* tono inválido,
* timeout del proveedor IA,
* caída del backend,
* cuota agotada,
* salida inválida,
* intento bloqueado temporalmente.

La interfaz debe mostrar mensajes claros y no técnicos.

---

## Roadmap de desarrollo

### Fase 1 — UI visual

Objetivo: replicar el mockup exactamente.

#### Incluye

* layout completo,
* estilos,
* interacción visual,
* loaders fake,
* estados simulados.

### Fase 2 — Backend funcional

Objetivo: conectar la UI a un endpoint real.

#### Incluye

* Express,
* endpoint `/api/rewrite`,
* validaciones,
* conexión con Gemini.

### Fase 3 — Hardening

Objetivo: cerrar usos indebidos.

#### Incluye

* filtros técnicos,
* validación de salida,
* rate limiting,
* mejores mensajes de error.

### Fase 4 — Deploy

Objetivo: dejar el proyecto accesible online.

#### Incluye

* frontend desplegado,
* backend desplegado,
* variables configuradas,
* dominio opcional.

---

## MVP mínimo aceptable

Para considerar el proyecto como una primera versión completa debe incluir:

* interfaz como el mockup,
* selección de tono,
* slider de intensidad,
* switch de longitud,
* caja de texto,
* caja de resultado,
* backend conectado,
* reformulación real,
* bloqueo de usos técnicos,
* botón copiar,
* control de errores.

---

## Posibles mejoras futuras

* historial de textos generados,
* autenticación,
* límite por usuario,
* guardado de favoritos,
* varios idiomas,
* exportar resultado,
* modo oscuro,
* plantillas rápidas,
* analítica de uso,
* versión móvil más avanzada.

---

## Criterios de calidad

El proyecto se considerará bien hecho si:

* visualmente se parece al mockup,
* el código frontend está bien dividido,
* el backend no expone la API key,
* el sistema no se comporta como chatbot,
* la respuesta es rápida,
* la experiencia se siente moderna,
* el código es mantenible.

---

## Resumen final

Este proyecto debe construirse como una **aplicación web moderna de reformulación de texto**, con una **UI tipo SaaS**, un **frontend en React**, un **backend en Express** y una **integración controlada con Gemini API**.

La prioridad principal es que:

* se vea bien,
* sea clara de usar,
* tenga una arquitectura limpia,
* y esté completamente enfocada en una sola tarea: **redactar mejor texto natural**.

---

## Stack final recomendado

### Frontend

* React
* Vite
* Tailwind CSS
* shadcn/ui
* Lucide React

### Backend

* Node.js
* Express
* dotenv
* cors
* helmet
* express-rate-limit

### IA

* Gemini API

### Deploy

* Vercel o Netlify para frontend
* Render o Railway para backend
