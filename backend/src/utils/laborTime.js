// CAMBIO: Horario ajustado de 8:00 a 19:00
const LABOR_DAY_START_HOUR = 8;
const LABOR_DAY_END_HOUR = 19;

/**
 * CORRECCIÓN: Renombramos la función para que coincida con la importación.
 * Calcula los minutos laborables (L-V, 8h-19h) entre dos fechas.
 * @param {Date} startDate - Fecha de inicio.
 * @param {Date} endDate - Fecha de fin.
 * @returns {number} - Total de minutos laborables.
 */
export function calculateBusinessMinutes(startDate, endDate) {
  let start = new Date(startDate);
  let end = new Date(endDate);

  if (start >= end) {
    return 0;
  }

  let totalMinutes = 0;

  const getClampedDate = (date) => {
    const clamped = new Date(date);
    if (clamped.getHours() < LABOR_DAY_START_HOUR) {
      clamped.setHours(LABOR_DAY_START_HOUR, 0, 0, 0);
    }
    if (clamped.getHours() >= LABOR_DAY_END_HOUR) {
      clamped.setHours(LABOR_DAY_END_HOUR, 0, 0, 0);
    }
    return clamped;
  };

  start = getClampedDate(start);
  end = getClampedDate(end);

  let current = new Date(start);

  while (current < end) {
    const dayOfWeek = current.getDay();
    // Si es día laborable (Lunes=1 a Viernes=5)
    if (dayOfWeek > 0 && dayOfWeek < 6) {
      const startOfDay = new Date(current);
      startOfDay.setHours(LABOR_DAY_START_HOUR, 0, 0, 0);

      const endOfDay = new Date(current);
      endOfDay.setHours(LABOR_DAY_END_HOUR, 0, 0, 0);

      const startIntersection = Math.max(current, startOfDay);
      const endIntersection = Math.min(end, endOfDay);
      
      if (startIntersection < endIntersection) {
        totalMinutes += (endIntersection - startIntersection) / (1000 * 60);
      }
    }
    // Avanzar al inicio del siguiente día
    current.setDate(current.getDate() + 1);
    current.setHours(LABOR_DAY_START_HOUR, 0, 0, 0);
  }

  return Math.round(totalMinutes);
}

/**
 * Convierte un total de minutos a un formato de texto "Xh Ym".
 * @param {number} minutes - Total de minutos.
 * @returns {string} - Cadena de texto formateada.
 */
export function toHHMM(minutes) {
  if (isNaN(minutes) || minutes === null || minutes < 0) return '-';
  if (minutes === 0) return '0m';

  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  
  let result = '';
  if (h > 0) {
    result += `${h}h `;
  }
  if (m > 0 || h === 0) {
    result += `${m}m`;
  }

  return result.trim();
}