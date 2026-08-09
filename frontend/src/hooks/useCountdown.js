/**
 * Cuenta atrás en vivo hacia un instante futuro.
 *
 * @module hooks/useCountdown
 */

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Milisegundos que faltan para `targetMs`, recalculados cada segundo.
 *
 * Devuelve `null` cuando no hay objetivo o cuando ya se ha cumplido, de modo
 * que el componente puede simplemente ocultar el aviso.
 *
 * El reloj es estado externo y mutable, así que se lee con
 * `useSyncExternalStore`: cada render obtiene la hora de verdad en lugar de
 * arrastrar la que hubiera al montar el componente. Importa porque el objetivo
 * llega mucho después del montaje, dentro de la respuesta del backend.
 *
 * @param {number|null} targetMs - Timestamp Unix (ms) objetivo
 * @returns {number|null} Milisegundos restantes, o null
 */
export function useCountdown(targetMs) {
  const subscribe = useCallback(
    onClockTick => {
      if (!targetMs || targetMs <= Date.now()) return () => {};

      const intervalId = setInterval(() => {
        onClockTick();
        if (Date.now() >= targetMs) clearInterval(intervalId);
      }, 1000);

      return () => clearInterval(intervalId);
    },
    [targetMs]
  );

  // Redondeado al segundo: mientras no cambie el segundo hay que devolver
  // exactamente el mismo valor, o React volvería a renderizar sin parar.
  const getRemaining = useCallback(() => {
    if (!targetMs) return null;

    const remaining = targetMs - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) * 1000 : null;
  }, [targetMs]);

  return useSyncExternalStore(subscribe, getRemaining, getRemaining);
}

/** @param {number} ms @returns {number} Minutos restantes, mínimo 1 */
export function toMinutes(ms) {
  return Math.max(1, Math.ceil(ms / 60000));
}

/** @param {number} ms @returns {number} Segundos restantes, mínimo 1 */
export function toSeconds(ms) {
  return Math.max(1, Math.ceil(ms / 1000));
}
