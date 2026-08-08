/**
 * Diff palabra a palabra entre el texto original y el reformulado.
 *
 * Se usa en la vista "Comparar": el original marca en rojo lo que desaparece y
 * el resultado marca en verde lo que se añade. Como los textos van topados a
 * 500 caracteres (~100 palabras), una tabla LCS cuadrada es de sobra.
 *
 * @module utils/diffWords
 */

/** @constant {number} Palabras comunes que pueden absorberse entre dos cambios */
const GAP_MAX_WORDS = 2;

/** @constant {number} Caracteres máximos de ese hueco */
const GAP_MAX_CHARS = 12;

/**
 * Parte el texto en unidades "palabra + espacio que la sigue".
 *
 * Los espacios viajan pegados a su palabra en vez de ser tokens propios: si
 * compitieran por sí mismos, la subsecuencia común más larga preferiría
 * alinear espacios (que siempre coinciden) antes que palabras, y el diff
 * saldría inservible. Concatenar las unidades reconstruye el texto exacto.
 *
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  if (!text) return [];

  const leading = text.match(/^\s*/)[0];
  const units = text.slice(leading.length).match(/\S+\s*/g) || [];

  if (!units.length) return leading ? [leading] : [];
  if (leading) units[0] = leading + units[0];

  return units;
}

/**
 * Clave de comparación: solo la palabra, sin espacios ni mayúsculas, para que
 * un cambio de capitalización o de espaciado no cuente como reescritura.
 *
 * @param {string} unit
 * @returns {string}
 */
function compareKey(unit) {
  return unit.trim().toLowerCase();
}

/**
 * @typedef {Object} DiffSegment
 * @property {string} text - Trozo de texto contiguo
 * @property {'equal'|'removed'|'added'} type - Cómo debe pintarse
 */

/**
 * @typedef {Object} WordDiff
 * @property {DiffSegment[]} before - Segmentos del texto original ('equal' | 'removed')
 * @property {DiffSegment[]} after - Segmentos del resultado ('equal' | 'added')
 * @property {number} removals - Bloques de texto eliminado
 * @property {number} additions - Bloques de texto añadido
 */

/**
 * Calcula el diff entre dos textos.
 *
 * @param {string} [before=''] - Texto original
 * @param {string} [after=''] - Texto reformulado
 * @returns {WordDiff}
 *
 * @example
 * diffWords('el informe que pedisteis', 'el informe solicitado');
 * // before: [{text:'el informe ',type:'equal'}, {text:'que pedisteis',type:'removed'}]
 * // after:  [{text:'el informe ',type:'equal'}, {text:'solicitado',type:'added'}]
 * // removals: 1, additions: 1
 */
export function diffWords(before = '', after = '') {
  const blocks = mergeShortGaps(
    toBlocks(align(tokenize(before), tokenize(after)))
  );
  const ops = blocks.flatMap(block => block.ops);

  return {
    before: collapse(ops, 'removed', false),
    after: collapse(ops, 'added', true),
    removals: countBlocks(blocks, 'removed'),
    additions: countBlocks(blocks, 'added'),
  };
}

/**
 * Alinea ambas secuencias por su subsecuencia común más larga.
 *
 * @param {string[]} a - Unidades del original
 * @param {string[]} b - Unidades del resultado
 * @returns {Array<{token: string, tokenAfter?: string, type: 'equal'|'removed'|'added'}>}
 */
function align(a, b) {
  const ka = a.map(compareKey);
  const kb = b.map(compareKey);

  // lcs[i][j] = longitud de la subsecuencia común más larga de a[i..] y b[j..]
  const lcs = Array.from({ length: a.length + 1 }, () =>
    new Uint16Array(b.length + 1)
  );

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        ka[i] === kb[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (ka[i] === kb[j]) {
      // Misma palabra con distinta capitalización o espaciado: cada lado
      // conserva su propio texto.
      ops.push({ token: a[i], tokenAfter: b[j], type: 'equal' });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ token: a[i], type: 'removed' });
      i++;
    } else {
      ops.push({ token: b[j], type: 'added' });
      j++;
    }
  }
  while (i < a.length) ops.push({ token: a[i++], type: 'removed' });
  while (j < b.length) ops.push({ token: b[j++], type: 'added' });

  return ops;
}

/**
 * Agrupa las operaciones en bloques alternos de texto intacto y texto tocado.
 *
 * @param {Array<Object>} ops - Operaciones alineadas
 * @returns {Array<{kind: 'equal'|'change', ops: Array<Object>}>}
 */
function toBlocks(ops) {
  const blocks = [];

  for (const op of ops) {
    const kind = op.type === 'equal' ? 'equal' : 'change';
    const last = blocks[blocks.length - 1];

    if (last && last.kind === kind) last.ops.push(op);
    else blocks.push({ kind, ops: [op] });
  }

  return blocks;
}

/**
 * Absorbe los restos comunes muy cortos que quedan entre dos cambios.
 *
 * Al reescribir una frase entera aparecen por el camino palabras sueltas que
 * coinciden ("de", "el", "que") y el resaltado se ve como confeti. Tratarlas
 * como parte del cambio devuelve un resaltado a nivel de frase.
 *
 * @param {Array<{kind: string, ops: Array<Object>}>} blocks
 * @returns {Array<{kind: string, ops: Array<Object>}>}
 */
function mergeShortGaps(blocks) {
  const merged = [];

  blocks.forEach((block, index) => {
    const previous = merged[merged.length - 1];
    const isGap =
      block.kind === 'equal' &&
      previous?.kind === 'change' &&
      blocks[index + 1]?.kind === 'change';

    if (isGap && isShort(block.ops)) {
      // El hueco pasa a formar parte del cambio: se elimina en un lado y se
      // añade en el otro.
      for (const op of block.ops) {
        previous.ops.push({ token: op.token, type: 'removed' });
        previous.ops.push({ token: op.tokenAfter ?? op.token, type: 'added' });
      }
      return;
    }

    if (previous && previous.kind === block.kind) {
      previous.ops.push(...block.ops);
    } else {
      merged.push({ kind: block.kind, ops: [...block.ops] });
    }
  });

  return merged;
}

/**
 * ¿El tramo común es lo bastante corto como para absorberlo?
 *
 * @param {Array<Object>} ops - Operaciones del bloque
 * @returns {boolean}
 */
function isShort(ops) {
  const chars = ops.reduce((total, op) => total + op.token.trim().length, 0);
  return ops.length <= GAP_MAX_WORDS && chars <= GAP_MAX_CHARS;
}

/**
 * Proyecta las operaciones sobre un lado y las funde en segmentos pintables.
 *
 * @param {Array<Object>} ops - Operaciones del diff
 * @param {'removed'|'added'} marked - Tipo que se resalta en este lado
 * @param {boolean} useAfterToken - Si toma el texto del lado reformulado
 * @returns {DiffSegment[]}
 */
function collapse(ops, marked, useAfterToken) {
  const segments = [];

  /**
   * Añade texto al final, fundiéndolo con el segmento previo si es del mismo
   * tipo. Ignora las cadenas vacías.
   */
  const push = (text, type) => {
    if (!text) return;
    const last = segments[segments.length - 1];
    if (last && last.type === type) last.text += text;
    else segments.push({ text, type });
  };

  let buffer = '';
  let bufferType = null;

  /**
   * Cierra el tramo acumulado. En los tramos resaltados, los espacios de los
   * extremos se dejan fuera del color: un bloque colgando al final de la frase
   * se lee como un error. Los espacios interiores sí se resaltan, para que la
   * frase quede marcada de un tirón.
   */
  const flush = () => {
    if (buffer && bufferType !== 'equal') {
      const [, before, core, after] = buffer.match(/^(\s*)([\s\S]*?)(\s*)$/);
      push(before, 'equal');
      push(core, bufferType);
      push(after, 'equal');
    } else {
      push(buffer, 'equal');
    }

    buffer = '';
    bufferType = null;
  };

  for (const op of ops) {
    if (op.type !== 'equal' && op.type !== marked) continue;

    const type = op.type === 'equal' ? 'equal' : marked;
    if (type !== bufferType) flush();

    bufferType = type;
    buffer +=
      useAfterToken && op.type === 'equal' && op.tokenAfter !== undefined
        ? op.tokenAfter
        : op.token;
  }
  flush();

  return segments;
}

/**
 * Cuenta los bloques de cambio que aportan texto a un lado concreto.
 *
 * @param {Array<{kind: string, ops: Array<Object>}>} blocks
 * @param {'removed'|'added'} type
 * @returns {number}
 */
function countBlocks(blocks, type) {
  return blocks.filter(
    block =>
      block.kind === 'change' &&
      block.ops.some(op => op.type === type && op.token.trim())
  ).length;
}
