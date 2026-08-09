/**
 * Límites de uso. La fuente de verdad es el backend, que los aplica por IP;
 * aquí solo están para pintar los contadores antes de la primera respuesta.
 *
 * @module constants/limits
 */

/** @constant {number} Intentos por ventana de 15 minutos */
export const WINDOW_LIMIT = 8;

/** @constant {number} Intentos por día (medianoche, hora de España) */
export const DAILY_LIMIT = 40;
