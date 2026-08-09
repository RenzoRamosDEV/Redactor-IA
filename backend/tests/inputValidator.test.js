/**
 * Pruebas de la validación de entrada del endpoint de reformulación.
 *
 * Es la primera barrera del backend: todo lo que pase de aquí acaba dentro de
 * un prompt que se envía a la IA.
 */

const test = require('node:test');
const assert = require('node:assert');
const { validateInput } = require('../src/utils/inputValidator');

/** Entrada válida mínima, para modificar en cada caso. */
const valida = () => ({
  text: 'Un texto de ejemplo lo bastante largo para pasar el mínimo.',
  tone: 'formal',
  intensity: 60,
  keepLength: true,
});

test('acepta una entrada correcta', () => {
  assert.strictEqual(validateInput(valida()), null);
});

test('acepta la instrucción extra y la petición de título', () => {
  assert.strictEqual(
    validateInput({ ...valida(), extraInstruction: 'Más cercano', needsTitle: true }),
    null
  );
});

test('exige el texto', () => {
  assert.ok(validateInput({ ...valida(), text: undefined }));
  assert.ok(validateInput({ ...valida(), text: '' }));
  assert.ok(validateInput({ ...valida(), text: 12345 }));
});

test('rechaza textos demasiado cortos o demasiado largos', () => {
  assert.ok(validateInput({ ...valida(), text: 'hola' }));
  assert.ok(validateInput({ ...valida(), text: 'a'.repeat(501) }));
  assert.strictEqual(validateInput({ ...valida(), text: 'a'.repeat(500) }), null);
});

test('rechaza tonos que no están en la lista', () => {
  assert.ok(validateInput({ ...valida(), tone: 'sarcastico' }));
  assert.ok(validateInput({ ...valida(), tone: undefined }));

  for (const tone of ['rewrite', 'formal', 'fun', 'casual', 'professional', 'direct', 'persuasive', 'creative']) {
    assert.strictEqual(validateInput({ ...valida(), tone }), null, `debería aceptar ${tone}`);
  }
});

test('exige que la intensidad sea un número entre 0 y 100', () => {
  assert.ok(validateInput({ ...valida(), intensity: -1 }));
  assert.ok(validateInput({ ...valida(), intensity: 101 }));
  assert.ok(validateInput({ ...valida(), intensity: '60' }));
  assert.strictEqual(validateInput({ ...valida(), intensity: 0 }), null);
  assert.strictEqual(validateInput({ ...valida(), intensity: 100 }), null);
});

test('exige que keepLength sea booleano', () => {
  assert.ok(validateInput({ ...valida(), keepLength: 'true' }));
  assert.ok(validateInput({ ...valida(), keepLength: undefined }));
});

test('limita la instrucción extra a 200 caracteres', () => {
  assert.ok(validateInput({ ...valida(), extraInstruction: 'a'.repeat(201) }));
  assert.strictEqual(validateInput({ ...valida(), extraInstruction: 'a'.repeat(200) }), null);
});

test('exige que needsTitle sea booleano cuando viene', () => {
  assert.ok(validateInput({ ...valida(), needsTitle: 'si' }));
  assert.ok(validateInput({ ...valida(), needsTitle: 1 }));
  assert.strictEqual(validateInput({ ...valida(), needsTitle: false }), null);
});

test('rechaza texto con pinta de código', () => {
  const codigos = [
    '<div>hola mundo</div>',
    'function saludar() { return 1 }',
    'SELECT nombre FROM usuarios donde algo',
    'import React from "react" y algo mas',
    '```bloque de codigo aqui```',
    'console.log("hola") y algo mas de texto',
    'def saludar(nombre): pasa algo aqui',
  ];

  for (const text of codigos) {
    assert.ok(validateInput({ ...valida(), text }), `debería rechazar: ${text}`);
  }
});
