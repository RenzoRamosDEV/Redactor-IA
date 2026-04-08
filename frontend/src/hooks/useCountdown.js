/**
 * Hook personalizado para crear un contador regresivo en tiempo real
 * 
 * @module hooks/useCountdown
 */

import { useState, useEffect } from 'react';

/**
 * Crea un contador regresivo que se actualiza cada segundo
 * 
 * @param {number|null} targetMs - Timestamp Unix (ms) objetivo del countdown
 * @returns {string|null} String formateado "MM:SS" o null si no hay countdown activo
 * 
 * @example
 * const countdown = useCountdown(Date.now() + 15 * 60 * 1000); // 15 minutos
 * // countdown = "14:59", "14:58", ..., null
 * 
 * @example
 * const countdown = useCountdown(null);
 * // countdown = null
 */
export function useCountdown(targetMs) {
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    // Sin objetivo, no hay countdown
    if (!targetMs) {
      setDisplay(null);
      return;
    }

    /**
     * Calcula y actualiza el tiempo restante
     * @private
     */
    function tick() {
      const diff = targetMs - Date.now();
      
      // Si ya pasó el tiempo, ocultar countdown
      if (diff <= 0) {
        setDisplay(null);
        return;
      }
      
      // Convertir milisegundos a minutos y segundos
      const totalSec = Math.ceil(diff / 1000);
      const minutes = Math.floor(totalSec / 60);
      const seconds = totalSec % 60;
      
      // Formatear como "MM:SS" con ceros a la izquierda
      setDisplay(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }

    // Ejecutar inmediatamente y luego cada segundo
    tick();
    const intervalId = setInterval(tick, 1000);
    
    // Cleanup: detener el intervalo cuando el componente se desmonte o targetMs cambie
    return () => clearInterval(intervalId);
  }, [targetMs]);

  return display;
}
