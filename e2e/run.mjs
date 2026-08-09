/**
 * Prueba de principio a fin: arranca backend y frontend, abre un navegador
 * real y recorre el flujo completo de la aplicación.
 *
 *   node e2e/run.mjs              todo, incluidas las llamadas reales a la IA
 *   node e2e/run.mjs --sin-ia     sin gastar cuota (simula las respuestas)
 *
 * Necesita un Chromium. Se busca en el caché de Playwright, en el sistema o
 * en la variable CHROME_PATH.
 */

import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const PUERTO_API = 3011;
const PUERTO_WEB = 5183;
const URL_WEB = `http://localhost:${PUERTO_WEB}/redactor-ia/`;
const SIN_IA = process.argv.includes('--sin-ia');

const fallos = [];
const procesos = [];

/**
 * Registra el resultado de una comprobación.
 *
 * @param {string} nombre - Qué se comprueba
 * @param {boolean} ok - Si ha pasado
 * @param {string} [detalle] - Contexto para leer el fallo sin depurar
 */
function comprobar(nombre, ok, detalle = '') {
  console.log(`${ok ? '  ok  ' : ' FALLA'} ${nombre}${detalle ? ` — ${detalle}` : ''}`);
  if (!ok) fallos.push(nombre);
}

/**
 * Localiza un Chromium utilizable.
 *
 * @returns {string|undefined} Ruta al ejecutable, o undefined para que lo
 *   resuelva Playwright
 */
function buscarChromium() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const cache = join(homedir(), '.cache', 'ms-playwright');
  if (existsSync(cache)) {
    for (const dir of readdirSync(cache).filter(d => d.startsWith('chromium-'))) {
      for (const sub of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
        const ruta = join(cache, dir, sub);
        if (existsSync(ruta)) return ruta;
      }
    }
  }

  for (const ruta of ['/usr/bin/google-chrome', '/usr/bin/chromium', '/snap/bin/chromium']) {
    if (existsSync(ruta)) return ruta;
  }

  return undefined;
}

/**
 * Arranca un proceso y espera a que su URL responda.
 *
 * @param {string} nombre - Para los mensajes de error
 * @param {string} comando - Ejecutable
 * @param {string[]} args - Argumentos
 * @param {Object} env - Variables de entorno añadidas
 * @param {string} urlSalud - URL que debe responder
 */
async function arrancar(nombre, comando, args, env, urlSalud) {
  const proceso = spawn(comando, args, {
    cwd: RAIZ,
    env: { ...process.env, ...env },
    stdio: 'ignore',
  });
  procesos.push(proceso);

  for (let intento = 0; intento < 60; intento++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch(urlSalud);
      if (res.ok) return;
    } catch {
      /* todavía arrancando */
    }
  }

  throw new Error(`${nombre} no respondió en ${urlSalud}`);
}

/** Para todos los procesos arrancados por la prueba. */
function pararTodo() {
  for (const proceso of procesos) {
    try {
      proceso.kill();
    } catch {
      /* ya estaba muerto */
    }
  }
}

const navegador = await (async () => {
  console.log('\nArrancando backend y frontend…');
  await arrancar(
    'backend',
    'node',
    ['backend/src/server.js'],
    { PORT: String(PUERTO_API) },
    `http://localhost:${PUERTO_API}/health`
  );
  await arrancar(
    'frontend',
    'npm',
    ['run', 'dev', '--prefix', 'frontend', '--', '--port', String(PUERTO_WEB), '--strictPort'],
    { VITE_API_URL: `http://localhost:${PUERTO_API}` },
    URL_WEB
  );
  console.log(`Listos. Modo: ${SIN_IA ? 'sin IA (simulado)' : 'con IA real'}\n`);

  return chromium.launch({ executablePath: buscarChromium() });
})();

const contexto = await navegador.newContext({
  viewport: { width: 1440, height: 940 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await contexto.newPage();

// Las peticiones fallidas las provoca la propia prueba más abajo (429 y caída
// de red), y el navegador las registra como error aunque la aplicación las
// gestione bien. Lo que no puede aparecer nunca es una excepción de JavaScript.
const erroresConsola = [];
page.on(
  'console',
  m =>
    m.type() === 'error' &&
    !/Failed to load resource/.test(m.text()) &&
    erroresConsola.push(m.text())
);
page.on('pageerror', e => erroresConsola.push(`excepción: ${e.message}`));

const peticiones = [];

// En modo simulado se responde por el backend para no gastar cuota, pero el
// resto del recorrido es idéntico.
if (SIN_IA) {
  let n = 0;
  await page.route('**/api/rewrite', route => {
    const cuerpo = route.request().postDataJSON();
    peticiones.push(cuerpo);
    n++;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        result: `Le confirmo que el pedido saldrá mañana por la mañana. Variante ${n}.`,
        meta: {
          toneApplied: cuerpo.tone,
          processingTimeMs: 800,
          title: cuerpo.needsTitle ? `Título simulado ${n}` : null,
        },
        limits: {
          remainingWindow: Math.max(0, 8 - n),
          remainingDaily: Math.max(0, 40 - n),
          windowResetAt: Date.now() + 9 * 60 * 1000,
          dailyResetAt: Date.now() + 6 * 3600 * 1000,
          blockedBy: null,
        },
      }),
    });
  });
} else {
  page.on('request', req => {
    if (req.url().includes('/api/rewrite')) peticiones.push(req.postDataJSON());
  });
}

const titulo = () => page.locator('.doc-title').textContent();
const resultado = () => page.locator('.result-text').textContent();

const TEXTO = 'oye te paso el resumen de la reunion de ayer en cuanto pueda, perdona el retraso pero he tenido mucho lio';

try {
  // ── Carga inicial ───────────────────────────────────────────────────
  await page.goto(URL_WEB, { waitUntil: 'networkidle' });
  comprobar('la aplicación carga', (await page.locator('.app-header').count()) === 1);
  comprobar('el documento empieza sin nombre', (await titulo()) === 'Sin título');
  comprobar('el historial empieza vacío', (await page.locator('.history-item').count()) === 0);

  const uso = await page.locator('.rail-usage .usage-meter').count();
  comprobar('el consumo se muestra encima del historial', uso === 2, `${uso} barras`);

  // ── Escribir y reformular ───────────────────────────────────────────
  await page.locator('.source-input').fill(TEXTO);
  await page.waitForTimeout(200);
  comprobar('el nombre se deriva mientras se escribe', (await titulo()) !== 'Sin título', await titulo());
  comprobar('el contador cuenta los caracteres', (await page.locator('.counter').textContent()).includes(String(TEXTO.length)));

  await page.getByRole('button', { name: 'Más profesional' }).click();
  await page.locator('.source-input').press('Control+Enter');
  await page.locator('.result-text').waitFor({ timeout: 60000 });

  const v1 = (await resultado()).trim();
  comprobar('⌘/Ctrl + Enter reformula', v1.length > 0);
  comprobar('el resultado difiere del original', v1 !== TEXTO);
  comprobar('la primera reformulación pide título', peticiones[0]?.needsTitle === true);
  comprobar('la IA nombra el documento', (await titulo()) !== 'Sin título', await titulo());

  // ── Copiar ──────────────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Copiar' }).click();
  await page.waitForTimeout(400);
  const portapapeles = await page.evaluate(() => navigator.clipboard.readText());
  comprobar('"Copiar" lleva el texto al portapapeles', portapapeles.trim() === v1);

  // ── Segunda variante ────────────────────────────────────────────────
  const nombreTrasPrimera = await titulo();
  await page.getByRole('button', { name: 'Otra variante' }).click();
  await page.locator('.version-pill').nth(1).waitFor({ timeout: 60000 });
  await page.waitForTimeout(400);

  comprobar('la segunda reformulación NO vuelve a pedir título', peticiones[1]?.needsTitle === false);
  comprobar('el nombre no cambia con la segunda variante', (await titulo()) === nombreTrasPrimera);

  const v2 = (await resultado()).trim();
  comprobar('la variante es otro texto', v2 !== v1);

  await page.getByRole('button', { name: 'v1', exact: true }).click();
  await page.waitForTimeout(300);
  comprobar('volver a v1 recupera su texto', (await resultado()).trim() === v1);

  // ── Comparación ─────────────────────────────────────────────────────
  await page.getByRole('tab', { name: 'Comparar' }).click();
  await page.waitForTimeout(300);
  comprobar('la comparación enfrenta los dos textos', (await page.locator('.diff-col').count()) === 2);
  comprobar('la comparación resalta cambios', (await page.locator('.diff-del, .diff-add').count()) > 0);

  const original = (await page.locator('.diff-text--before').textContent()).trim();
  comprobar('la comparación reconstruye el original exacto', original === TEXTO.trim(), original.slice(0, 40));

  await page.getByRole('tab', { name: 'Resultado' }).click();

  // ── Renombrar ───────────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Renombrar' }).click();
  await page.locator('.doc-title-input').fill('Resumen de la reunión');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.waitForTimeout(300);
  comprobar('renombrar cierra la edición', (await page.locator('.doc-title-input').count()) === 0);
  comprobar('el nombre puesto a mano se aplica', (await titulo()) === 'Resumen de la reunión');

  // ── Historial ───────────────────────────────────────────────────────
  await page.waitForTimeout(1000);
  comprobar('el documento entra en el historial', (await page.locator('.history-item').count()) === 1);

  await page.getByRole('button', { name: '+ Nuevo' }).click();
  await page.waitForTimeout(300);
  comprobar('"+ Nuevo" vacía el editor', (await page.locator('.source-input').inputValue()) === '');
  comprobar('"+ Nuevo" conserva el historial', (await page.locator('.history-item').count()) === 1);

  await page.locator('.history-item').first().click();
  await page.waitForTimeout(300);
  comprobar('el historial restaura el documento', (await titulo()) === 'Resumen de la reunión');
  comprobar('el historial restaura el resultado', (await page.locator('.result-text').count()) === 1);

  // ── Persistencia ────────────────────────────────────────────────────
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  comprobar('el historial sobrevive a recargar', (await page.locator('.history-item').count()) === 1);

  // ── Límite de caracteres ────────────────────────────────────────────
  await page.locator('.source-input').fill('a'.repeat(520));
  await page.waitForTimeout(200);
  comprobar('pasarse de 500 caracteres impide generar', await page.getByRole('button', { name: 'Reformular' }).isDisabled());
  comprobar('el contador avisa del exceso', (await page.locator('.counter').getAttribute('class')).includes('counter--over'));

  // ── Idiomas ─────────────────────────────────────────────────────────
  for (const [idioma, esperado] of [['EN', 'Rephrase'], ['ES', 'Reformular']]) {
    await page.getByRole('button', { name: idioma, exact: true }).click();
    await page.waitForTimeout(300);
    comprobar(`la interfaz cambia a ${idioma}`, (await page.getByRole('button', { name: esperado }).count()) > 0);

    const texto = await page.locator('.app').innerText();
    const crudas = texto.match(/\b(result|source|style|usage|history|compare|notice|tones|document|header|brand|errors)\.[a-zA-Z.]+/g);
    comprobar(`sin claves de traducción a la vista en ${idioma}`, !crudas, crudas ? crudas.join(', ') : '');
  }

  // ── Límite agotado y error del servidor ─────────────────────────────
  await page.unroute('**/api/rewrite').catch(() => {});
  await page.route('**/api/rewrite', route =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Demasiados intentos en 15 minutos. Espera un momento.',
        limits: {
          remainingWindow: 0,
          remainingDaily: 30,
          windowResetAt: Date.now() + 4 * 60 * 1000,
          dailyResetAt: Date.now() + 6 * 3600 * 1000,
          blockedBy: 'window',
        },
      }),
    })
  );

  await page.getByRole('button', { name: '+ Nuevo' }).click();
  await page.locator('.source-input').fill('un texto cualquiera para agotar el límite');
  await page.getByRole('button', { name: 'Reformular' }).click();
  await page.waitForTimeout(700);

  comprobar('al agotar el tramo se avisa', (await page.locator('.notice').count()) > 0);
  comprobar('al agotar el tramo no se puede generar', await page.getByRole('button', { name: 'Reformular' }).isDisabled());
  comprobar('el consumo refleja el tramo agotado', (await page.locator('.rail-usage .mono').first().textContent()).replace(/\s/g, '') === '8/8');
  comprobar('se indica cuándo se renueva', /4 min/.test(await page.locator('.usage-note').textContent()));

  await page.unroute('**/api/rewrite');
  await page.route('**/api/rewrite', route => route.abort('connectionrefused'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('.source-input').fill('otro texto con el backend caído');
  await page.getByRole('button', { name: 'Reformular' }).click();
  await page.waitForTimeout(700);
  comprobar('sin conexión se explica el problema', /conexión con el servidor/.test(await page.locator('.notice').textContent()));

  // ── Adaptación a móvil ──────────────────────────────────────────────
  await page.unroute('**/api/rewrite');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  comprobar('en móvil el historial se esconde tras un botón', await page.getByRole('button', { name: 'Historial' }).isVisible());

  await page.getByRole('button', { name: 'Historial' }).click();
  await page.waitForTimeout(400);
  comprobar('el cajón del historial se abre', await page.locator('.rail--left').isVisible());

  comprobar('sin errores en la consola del navegador', erroresConsola.length === 0, erroresConsola.join(' | ').slice(0, 120));
} catch (err) {
  comprobar(`la prueba se cortó: ${err.message}`, false);
} finally {
  await navegador.close();
  pararTodo();
}

console.log(
  fallos.length
    ? `\n${fallos.length} comprobación(es) fallida(s):\n  - ${fallos.join('\n  - ')}\n`
    : '\nTodo funciona.\n'
);
process.exit(fallos.length ? 1 : 0);
