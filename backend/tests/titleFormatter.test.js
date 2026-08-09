/**
 * Pruebas de la limpieza del título que devuelve la IA.
 *
 * Casi todos los casos vienen de comportamientos reales del modelo: aunque el
 * prompt pida solo el título, devuelve comillas, prefijos y puntos finales.
 */

const test = require('node:test');
const assert = require('node:assert');
const { cleanTitle } = require('../src/utils/titleFormatter');

test('deja intacto un título ya limpio', () => {
  assert.strictEqual(cleanTitle('Retraso del informe trimestral'), 'Retraso del informe trimestral');
});

test('quita las comillas que envuelven al título', () => {
  assert.strictEqual(cleanTitle('"Cambio de fecha"'), 'Cambio de fecha');
  assert.strictEqual(cleanTitle('«Cambio de fecha»'), 'Cambio de fecha');
  assert.strictEqual(cleanTitle('“Cambio de fecha”'), 'Cambio de fecha');
});

test('quita el prefijo "Título:" con y sin tilde', () => {
  assert.strictEqual(cleanTitle('Título: Aviso de retraso'), 'Aviso de retraso');
  assert.strictEqual(cleanTitle('titulo: Aviso de retraso'), 'Aviso de retraso');
  assert.strictEqual(cleanTitle('Title: Delay notice'), 'Delay notice');
});

test('quita las marcas de markdown con las que el modelo lo envuelve', () => {
  assert.strictEqual(cleanTitle('**Aviso de retraso**'), 'Aviso de retraso');
  assert.strictEqual(cleanTitle('## Título con almohadillas'), 'Título con almohadillas');
  assert.strictEqual(cleanTitle('Reagendación de reunión del martes*'), 'Reagendación de reunión del martes');
  assert.strictEqual(cleanTitle('**Título: Aviso de retraso**'), 'Aviso de retraso');
});

test('quita el punto final y la puntuación colgante', () => {
  assert.strictEqual(cleanTitle('Aviso de retraso.'), 'Aviso de retraso');
  assert.strictEqual(cleanTitle('Aviso de retraso,'), 'Aviso de retraso');
});

test('combina prefijo, comillas y punto final', () => {
  assert.strictEqual(cleanTitle('Título: "Retraso del informe."'), 'Retraso del informe');
});

test('se queda solo con la primera línea si el modelo se explaya', () => {
  assert.strictEqual(
    cleanTitle('Aviso de retraso\n\nEste título resume el correo sobre el informe.'),
    'Aviso de retraso'
  );
});

test('colapsa los espacios sobrantes', () => {
  assert.strictEqual(cleanTitle('  Aviso   de    retraso  '), 'Aviso de retraso');
});

test('descarta lo que no sirve como título', () => {
  assert.strictEqual(cleanTitle(''), null);
  assert.strictEqual(cleanTitle(null), null);
  assert.strictEqual(cleanTitle(undefined), null);
  assert.strictEqual(cleanTitle('ab'), null, 'demasiado corto');
  assert.strictEqual(cleanTitle('   '), null);
});

test('descarta el "Sin título" que a veces devuelve el propio modelo', () => {
  // Si lo aceptara, el documento se quedaría con un nombre peor que el
  // derivado del texto, que al menos dice algo.
  assert.strictEqual(cleanTitle('Sin título'), null);
  assert.strictEqual(cleanTitle('sin titulo'), null);
  assert.strictEqual(cleanTitle('Untitled'), null);
});

test('descarta los restos del razonamiento del modelo', () => {
  // Casos vistos de verdad: el modelo se pone a comprobar su propia respuesta
  // y devuelve el comentario en vez del título.
  assert.strictEqual(cleanTitle(' 5 words) - Good.'), null);
  assert.strictEqual(cleanTitle('Cambio de reunión (5 palabras)'), null);
  assert.strictEqual(cleanTitle('Aviso de retraso - Good'), null);
  assert.strictEqual(cleanTitle(') texto suelto'), null);
});

test('descarta fragmentos con paréntesis descuadrados', () => {
  assert.strictEqual(cleanTitle('reunión) del martes'), null);
  assert.strictEqual(cleanTitle('Aviso (sin cerrar'), null);
  assert.strictEqual(cleanTitle('Aviso [sin cerrar'), null);
});

test('no confunde un título legítimo con un resto', () => {
  assert.strictEqual(cleanTitle('Informe Q2 (borrador)'), 'Informe Q2 (borrador)');
  assert.strictEqual(cleanTitle('Reunión de buenas prácticas'), 'Reunión de buenas prácticas');
});

test('quita las palabras con las que el título queda colgando', () => {
  // El modelo corta al llegar a su límite de palabras y deja preposiciones
  // sueltas al final.
  assert.strictEqual(
    cleanTitle('Retraso en el envío del resumen de'),
    'Retraso en el envío del resumen'
  );
  assert.strictEqual(cleanTitle('Paseo al centro con'), 'Paseo al centro');
  assert.strictEqual(cleanTitle('Notes about the meeting of the'), 'Notes about the meeting');
});

test('no recorta un título que acaba bien', () => {
  assert.strictEqual(cleanTitle('Cambio de fecha'), 'Cambio de fecha');
  assert.strictEqual(cleanTitle('Retraso del informe trimestral'), 'Retraso del informe trimestral');
});

test('prefiere un título corto colgando antes que dejarlo en nada', () => {
  assert.strictEqual(cleanTitle('Paseo con'), 'Paseo con');
});

test('descarta títulos con pinta de código', () => {
  assert.strictEqual(cleanTitle('```texto```'), null);
  assert.strictEqual(cleanTitle('<script>algo</script>'), null);
  assert.strictEqual(cleanTitle('{ "title": "x" }'), null);
});

test('recorta los títulos largos por la última palabra que cabe', () => {
  const largo =
    'Comunicación al equipo de dirección sobre el retraso en la entrega del informe trimestral de ventas';
  const resultado = cleanTitle(largo);

  assert.ok(resultado.length <= 71, `mide ${resultado.length}`);
  assert.ok(resultado.endsWith('…'), 'debe indicar que sigue');
  assert.ok(!resultado.includes('  '), 'sin espacios dobles al cortar');
  assert.ok(largo.startsWith(resultado.slice(0, -1)), 'el recorte respeta el original');
});
