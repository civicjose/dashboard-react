const LABOR_DAY_START = 9;
const LABOR_DAY_END = 18;
const LABOR_HOURS_PER_DAY = LABOR_DAY_END - LABOR_DAY_START;

export function laborMinutes(startDate, endDate) {
  let minutes = 0;
  let currentDate = new Date(startDate);
  while (currentDate < endDate) {
    const day = currentDate.getDay();
    if (day > 0 && day < 6) {
      const hour = currentDate.getHours();
      if (hour >= LABOR_DAY_START && hour < LABOR_DAY_END) {
        minutes++;
      }
    }
    currentDate.setMinutes(currentDate.getMinutes() + 1);
  }
  return minutes;
}

export function toHHMM(minutes) {
  if (isNaN(minutes) || minutes === null) return '00:00';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
}