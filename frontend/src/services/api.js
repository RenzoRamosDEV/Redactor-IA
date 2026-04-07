const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function rewriteText({ text, tone, intensity, keepLength, extraInstruction }) {
  const response = await fetch(`${API_URL}/api/rewrite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, tone, intensity, keepLength, extraInstruction }),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error || 'Error al procesar la solicitud.');
    if (data.limits) err.limits = data.limits;
    throw err;
  }

  return data;
}
