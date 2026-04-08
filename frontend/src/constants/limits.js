/**
 * Configuración de límites de uso
 * 
 * Define los límites de intentos permitidos para evitar abuso del servicio de IA.
 * Los límites se aplican por IP en el backend.
 */

/** @constant {number} Máximo de intentos permitidos en una ventana de 15 minutos */
export const WINDOW_LIMIT = 8;

/** @constant {number} Máximo de intentos permitidos por día (medianoche España) */
export const DAILY_LIMIT = 40;

/** @constant {number} Duración de la ventana de tiempo en milisegundos (15 minutos) */
export const WINDOW_DURATION_MS = 15 * 60 * 1000;
