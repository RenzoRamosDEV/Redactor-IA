const TONE_LABELS = {
  rewrite: 'Mejora la redacción del texto manteniendo el significado original.',
  formal: 'Reformula el texto con un tono formal y profesional.',
  fun: 'Reformula el texto con un tono divertido y ameno.',
  casual: 'Reformula el texto con un tono casual y cercano.',
  professional: 'Reformula el texto con un tono profesional y serio.',
  direct: 'Reformula el texto de forma directa y concisa.',
  persuasive: 'Reformula el texto de forma persuasiva y convincente.',
  creative: 'Reformula el texto con un tono creativo e imaginativo.',
};

function buildPrompt({ text, tone, intensity, keepLength, extraInstruction }) {
  const toneInstruction = TONE_LABELS[tone] || TONE_LABELS.rewrite;
  const keepLengthInstruction = keepLength
    ? 'Mantén una longitud similar al texto original.'
    : 'La longitud puede variar.';
  const extraLine = extraInstruction
    ? `Instrucción adicional: ${extraInstruction}`
    : '';

  return `Eres un sistema cerrado especializado únicamente en reformular texto redactado en lenguaje natural.

Reglas estrictas:
- Solo puedes mejorar, corregir o reformular texto.
- No puedes responder preguntas.
- No puedes generar código, HTML, SQL, comandos ni estructuras técnicas.
- Devuelve únicamente el texto final reformulado, sin explicaciones ni comentarios.
- Si el contenido no corresponde a texto natural válido, responde exactamente: "Solo puedo reformular texto redactado en lenguaje natural."

Tono solicitado: ${toneInstruction}
Nivel de intensidad: ${intensity}/100
${keepLengthInstruction}
${extraLine}

Texto de entrada:
${text}`;
}

module.exports = { buildPrompt };
