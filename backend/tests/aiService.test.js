/**
 * Pruebas del cliente de IA, sin llamar a ningún proveedor.
 *
 * Se sustituye `fetch` para comprobar dos cosas: qué se envía (el modelo y el
 * control de razonamiento salen del entorno) y cómo se traduce lo que llega,
 * porque de esa traducción depende el mensaje que acaba viendo el usuario.
 */

// El servicio lee la configuración al cargarse, así que el entorno se prepara
// antes de requerirlo.
process.env.AI_BASE_URL = 'https://ejemplo.test/v1/';
process.env.AI_API_KEY = 'clave-de-prueba';
process.env.AI_MODEL = 'modelo-de-prueba';
process.env.AI_REASONING_EFFORT = 'low';

const test = require('node:test');
const assert = require('node:assert');
const { reformulateText, generateTitle } = require('../src/services/ai.service');

const fetchOriginal = globalThis.fetch;

/**
 * Sustituye fetch por una respuesta fija y guarda lo que se le pidió.
 *
 * @param {Object} respuesta - { ok, status, body }
 * @returns {{ peticiones: Array }} Registro de llamadas
 */
function simularFetch({ ok = true, status = 200, body = {} }) {
  const peticiones = [];

  globalThis.fetch = async (url, options) => {
    peticiones.push({ url, options, cuerpo: JSON.parse(options.body) });
    return { ok, status, json: async () => body };
  };

  return { peticiones };
}

test.afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

const respuestaOk = texto => ({
  ok: true,
  status: 200,
  body: { choices: [{ message: { content: texto }, finish_reason: 'stop' }] },
});

test('envía el formato de OpenAI al endpoint configurado', async () => {
  const { peticiones } = simularFetch(respuestaOk('  Texto reformulado.  '));
  const resultado = await reformulateText('mi prompt');

  assert.strictEqual(resultado, 'Texto reformulado.', 'recorta los espacios');
  assert.strictEqual(peticiones.length, 1);

  const [{ url, options, cuerpo }] = peticiones;
  assert.strictEqual(url, 'https://ejemplo.test/v1/chat/completions');
  assert.strictEqual(options.headers.Authorization, 'Bearer clave-de-prueba');
  assert.strictEqual(cuerpo.model, 'modelo-de-prueba');
  assert.deepStrictEqual(cuerpo.messages, [{ role: 'user', content: 'mi prompt' }]);
});

test('siempre manda el control de razonamiento', async () => {
  // Sin él, el modelo se gasta pensando el presupuesto de tokens y devuelve
  // títulos vacíos y reformulaciones cortadas a media frase.
  const { peticiones } = simularFetch(respuestaOk('Un título'));
  await generateTitle('prompt de título');

  assert.strictEqual(peticiones[0].cuerpo.reasoning_effort, 'low');
});

test('el título pide menos tokens y menos aleatoriedad que la reformulación', async () => {
  const { peticiones } = simularFetch(respuestaOk('algo'));

  await reformulateText('p');
  await generateTitle('p');

  const [reformular, titulo] = peticiones.map(p => p.cuerpo);
  assert.ok(titulo.max_tokens < reformular.max_tokens);
  assert.ok(titulo.temperature < reformular.temperature);
});

test('propaga el mensaje y el código de error del proveedor', async () => {
  simularFetch({
    ok: false,
    status: 429,
    body: { error: { message: 'You exceeded your current quota' } },
  });

  await assert.rejects(reformulateText('p'), err => {
    assert.strictEqual(err.status, 429, 'el código debe llegar a errorHandler');
    assert.match(err.message, /quota/);
    return true;
  });
});

test('avisa cuando la respuesta llega sin texto', async () => {
  // Pasa de verdad: el filtro de contenido corta la respuesta, o se agotan
  // los tokens pensando.
  simularFetch({
    ok: true,
    status: 200,
    body: { choices: [{ message: { content: '' }, finish_reason: 'length' }] },
  });

  await assert.rejects(reformulateText('p'), err => {
    assert.strictEqual(err.status, 502);
    assert.match(err.message, /length/, 'el motivo ayuda a diagnosticar');
    return true;
  });
});

test('traduce el fallo de red en algo tratable', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('fetch failed');
  };

  await assert.rejects(reformulateText('p'), err => {
    assert.strictEqual(err.status, 503);
    assert.match(err.message, /contactar/);
    return true;
  });
});

test('trata el corte por tiempo como servicio no disponible', async () => {
  globalThis.fetch = async () => {
    const err = new Error('abortada');
    err.name = 'AbortError';
    throw err;
  };

  await assert.rejects(reformulateText('p'), err => {
    assert.strictEqual(err.status, 503);
    assert.match(err.message, /tardado demasiado/);
    return true;
  });
});

test('aguanta una respuesta que no es JSON', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 502,
    json: async () => {
      throw new SyntaxError('no es JSON');
    },
  });

  await assert.rejects(reformulateText('p'), err => {
    assert.strictEqual(err.status, 502);
    return true;
  });
});
