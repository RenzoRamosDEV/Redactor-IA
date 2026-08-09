/**
 * Pruebas del nombre derivado del documento y de la agrupación del historial.
 */

import test from 'node:test';
import assert from 'node:assert';
import { deriveTitle, groupByDay, formatTime } from '../src/utils/documents.js';

test('sin texto, devuelve el nombre de reserva', () => {
  assert.strictEqual(deriveTitle('', 'Sin título'), 'Sin título');
  assert.strictEqual(deriveTitle('   ', 'Sin título'), 'Sin título');
  assert.strictEqual(deriveTitle(undefined, 'Sin título'), 'Sin título');
});

test('usa la primera frase completa cuando es corta', () => {
  assert.strictEqual(
    deriveTitle('Aviso de retraso. El informe no estará listo.', 'Sin título'),
    'Aviso de retraso'
  );
});

test('recorta los textos largos por una palabra entera', () => {
  const titulo = deriveTitle(
    'Os escribo para comentaros que el informe que pedisteis no va a estar listo para el viernes',
    'Sin título'
  );

  assert.ok(titulo.length <= 59, `mide ${titulo.length}`);
  assert.ok(titulo.endsWith('…'));
  assert.ok(!titulo.slice(0, -1).endsWith(' '), 'sin espacio antes de los puntos');
});

test('colapsa saltos de línea y espacios repetidos', () => {
  assert.strictEqual(
    deriveTitle('Aviso\n\n  de   retraso', 'Sin título'),
    'Aviso de retraso'
  );
});

test('agrupa los documentos por día natural', () => {
  const ahora = new Date('2026-05-13T12:00:00').getTime();
  const dia = 86400000;

  const documentos = [
    { id: 'a', updatedAt: ahora, versions: [{}] },
    { id: 'b', updatedAt: ahora - 2 * 3600000, versions: [{}] },
    { id: 'c', updatedAt: ahora - dia, versions: [{}] },
    { id: 'd', updatedAt: ahora - 5 * dia, versions: [{}] },
  ];

  const grupos = groupByDay(documentos, {
    language: 'es',
    todayLabel: 'Hoy',
    yesterdayLabel: 'Ayer',
    now: ahora,
  });

  assert.strictEqual(grupos.length, 3);
  assert.strictEqual(grupos[0].label, 'Hoy');
  assert.deepStrictEqual(grupos[0].items.map(d => d.id), ['a', 'b']);
  assert.strictEqual(grupos[1].label, 'Ayer');
  assert.strictEqual(grupos[2].label !== 'Hoy' && grupos[2].label !== 'Ayer', true);
});

test('"ayer por la noche" sigue siendo ayer, aunque hayan pasado pocas horas', () => {
  // Comparar fechas naturales y no intervalos de 24 h.
  const ahora = new Date('2026-05-13T01:00:00').getTime();
  const anoche = new Date('2026-05-12T23:50:00').getTime();

  const grupos = groupByDay([{ id: 'a', updatedAt: anoche, versions: [{}] }], {
    language: 'es',
    todayLabel: 'Hoy',
    yesterdayLabel: 'Ayer',
    now: ahora,
  });

  assert.strictEqual(grupos[0].label, 'Ayer');
});

test('ordena del más reciente al más antiguo', () => {
  const ahora = new Date('2026-05-13T12:00:00').getTime();
  const documentos = [
    { id: 'viejo', updatedAt: ahora - 3600000, versions: [{}] },
    { id: 'nuevo', updatedAt: ahora, versions: [{}] },
  ];

  const grupos = groupByDay(documentos, {
    language: 'es',
    todayLabel: 'Hoy',
    yesterdayLabel: 'Ayer',
    now: ahora,
  });

  assert.deepStrictEqual(grupos[0].items.map(d => d.id), ['nuevo', 'viejo']);
});

test('sin documentos no hay grupos', () => {
  const grupos = groupByDay([], {
    language: 'es',
    todayLabel: 'Hoy',
    yesterdayLabel: 'Ayer',
  });

  assert.deepStrictEqual(grupos, []);
});

test('la hora se formatea según el idioma', () => {
  const momento = new Date('2026-05-13T14:05:00').getTime();
  assert.match(formatTime(momento, 'es'), /14[:.]05/);
  assert.match(formatTime(momento, 'en'), /02[:.]05/i);
});
