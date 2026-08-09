/**
 * Pruebas de la comparación palabra a palabra.
 *
 * Dos propiedades son innegociables: que los segmentos reconstruyan los textos
 * exactos (si no, la vista "Comparar" enseñaría algo que el usuario nunca
 * escribió) y que el resaltado agrupe frases en vez de salpicar palabras
 * sueltas.
 */

import test from 'node:test';
import assert from 'node:assert';
import { diffWords } from '../src/utils/diffWords.js';

/** Reconstruye un lado del diff concatenando sus segmentos. */
const unir = segmentos => segmentos.map(s => s.text).join('');

/** Texto marcado de un lado, sin lo que quedó intacto. */
const marcado = segmentos =>
  segmentos.filter(s => s.type !== 'equal').map(s => s.text);

test('los segmentos reconstruyen los dos textos exactamente', () => {
  const casos = [
    ['el informe que pedisteis', 'el informe solicitado'],
    ['mismo texto', 'mismo texto'],
    ['', 'texto nuevo'],
    ['texto viejo', ''],
    ['', ''],
    ['  espacios   raros  ', 'espacios raros'],
    ['Con\nsaltos\nde línea', 'Con saltos de línea'],
    ['Acentuación y ñ, ¿signos?', 'Acentuacion y n, signos'],
  ];

  for (const [antes, despues] of casos) {
    const d = diffWords(antes, despues);
    assert.strictEqual(unir(d.before), antes, `original: ${JSON.stringify(antes)}`);
    assert.strictEqual(unir(d.after), despues, `resultado: ${JSON.stringify(despues)}`);
  }
});

test('marca solo lo que cambia', () => {
  const d = diffWords('el informe que pedisteis', 'el informe solicitado');

  assert.deepStrictEqual(marcado(d.before), ['que pedisteis']);
  assert.deepStrictEqual(marcado(d.after), ['solicitado']);
  assert.strictEqual(d.removals, 1);
  assert.strictEqual(d.additions, 1);
});

test('dos textos iguales no tienen cambios', () => {
  const d = diffWords('mismo texto', 'mismo texto');

  assert.strictEqual(d.removals, 0);
  assert.strictEqual(d.additions, 0);
  assert.ok(d.before.every(s => s.type === 'equal'));
});

test('ignora los cambios de mayúsculas y de espaciado', () => {
  // Cada lado sigue mostrando su propio texto, pero no se marca como cambio.
  const d = diffWords('El Informe  trimestral', 'el informe trimestral');

  assert.strictEqual(d.removals, 0);
  assert.strictEqual(d.additions, 0);
  assert.strictEqual(unir(d.before), 'El Informe  trimestral');
  assert.strictEqual(unir(d.after), 'el informe trimestral');
});

test('agrupa la frase reescrita en lugar de salpicar palabras sueltas', () => {
  // Al reformular aparecen por el camino palabras que coinciden ("de", "el",
  // "que"). Sin agrupar, el resaltado sale como confeti.
  const d = diffWords(
    'Os escribo para comentaros que el informe que pedisteis no va a estar listo',
    'Les escribimos para informarles que el informe solicitado no estará disponible'
  );

  assert.ok(d.removals <= 3, `${d.removals} grupos: demasiado fragmentado`);
  assert.ok(d.additions <= 3, `${d.additions} grupos: demasiado fragmentado`);
  assert.ok(d.removals >= 1 && d.additions >= 1, 'algo tiene que marcarse');
});

test('conserva intacto el tramo largo que no se tocó', () => {
  const comun = 'con los datos de ventas del';
  const d = diffWords(
    `Os escribo porque el informe ${comun} Q2 no está listo`,
    `Les informo de que el documento ${comun} segundo trimestre no está listo`
  );

  const intacto = d.before.filter(s => s.type === 'equal').map(s => s.text).join('');
  assert.ok(intacto.includes(comun), `no se conservó "${comun}"`);
});

test('el resaltado no se queda con los espacios de los extremos', () => {
  // Un bloque de color colgando al final de la frase se lee como un error.
  const d = diffWords('hola mundo cruel', 'hola mundo feliz');

  for (const segmento of [...d.before, ...d.after]) {
    if (segmento.type === 'equal') continue;
    assert.strictEqual(segmento.text, segmento.text.trim(), JSON.stringify(segmento.text));
  }
});

test('un texto vacío se cuenta como un solo cambio', () => {
  const alta = diffWords('', 'texto nuevo entero');
  assert.strictEqual(alta.removals, 0);
  assert.strictEqual(alta.additions, 1);

  const baja = diffWords('texto viejo entero', '');
  assert.strictEqual(baja.removals, 1);
  assert.strictEqual(baja.additions, 0);
});

test('aguanta el texto más largo que admite la aplicación', () => {
  const antes = 'palabra '.repeat(70).trim();
  const despues = 'vocablo '.repeat(70).trim();

  const inicio = Date.now();
  const d = diffWords(antes, despues);

  assert.strictEqual(unir(d.before), antes);
  assert.strictEqual(unir(d.after), despues);
  assert.ok(Date.now() - inicio < 1000, 'la comparación no debe bloquear la interfaz');
});
