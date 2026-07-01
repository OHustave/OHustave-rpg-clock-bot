'use strict';

// Calendario padrao (Gregoriano simplificado, sem anos bissextos).
const DEFAULT_CALENDAR = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
  daysPerMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  hoursPerDay: 24,
  minutesPerHour: 60,
};

function normalizeCalendar(cal) {
  const c = { ...DEFAULT_CALENDAR, ...(cal || {}) };
  if (!Array.isArray(c.monthNames) || c.monthNames.length === 0) {
    c.monthNames = [...DEFAULT_CALENDAR.monthNames];
  }
  if (!Array.isArray(c.daysPerMonth) || c.daysPerMonth.length !== c.monthNames.length) {
    // Se os dias por mes nao baterem com o numero de meses, usa 30 para todos.
    c.daysPerMonth = c.monthNames.map(() => 30);
  }
  c.hoursPerDay = Math.max(1, Math.floor(c.hoursPerDay || DEFAULT_CALENDAR.hoursPerDay));
  c.minutesPerHour = Math.max(1, Math.floor(c.minutesPerHour || DEFAULT_CALENDAR.minutesPerHour));
  return c;
}

function minutesPerDay(cal) {
  return cal.hoursPerDay * cal.minutesPerHour;
}

function daysPerYear(cal) {
  return cal.daysPerMonth.reduce((a, b) => a + b, 0);
}

function daysBeforeMonth(cal, monthIndex /* 0-based */) {
  let sum = 0;
  for (let i = 0; i < monthIndex; i += 1) sum += cal.daysPerMonth[i];
  return sum;
}

// Converte componentes ficticios em total de minutos absolutos desde o ano 0.
// month e day sao 1-based.
function componentsToMinutes(cal, { year, month, day, hour, minute }) {
  const c = normalizeCalendar(cal);
  const y = Math.floor(year);
  const m = Math.min(Math.max(Math.floor(month), 1), c.monthNames.length) - 1;
  const maxDay = c.daysPerMonth[m];
  const d = Math.min(Math.max(Math.floor(day), 1), maxDay) - 1;
  const h = Math.min(Math.max(Math.floor(hour), 0), c.hoursPerDay - 1);
  const min = Math.min(Math.max(Math.floor(minute), 0), c.minutesPerHour - 1);

  const totalDays = y * daysPerYear(c) + daysBeforeMonth(c, m) + d;
  return totalDays * minutesPerDay(c) + h * c.minutesPerHour + min;
}

// Converte total de minutos absolutos em componentes ficticios.
function minutesToComponents(cal, totalMinutes) {
  const c = normalizeCalendar(cal);
  const mpd = minutesPerDay(c);
  let total = Math.floor(totalMinutes);

  let totalDays = Math.floor(total / mpd);
  let remMin = total - totalDays * mpd;
  if (remMin < 0) { remMin += mpd; totalDays -= 1; }

  const hour = Math.floor(remMin / c.minutesPerHour);
  const minute = remMin % c.minutesPerHour;

  const dpy = daysPerYear(c);
  let year = Math.floor(totalDays / dpy);
  let dayOfYear = totalDays - year * dpy;
  if (dayOfYear < 0) { dayOfYear += dpy; year -= 1; }

  let month = 0;
  while (month < c.daysPerMonth.length && dayOfYear >= c.daysPerMonth[month]) {
    dayOfYear -= c.daysPerMonth[month];
    month += 1;
  }
  const day = dayOfYear + 1;

  return {
    year,
    month: month + 1, // 1-based
    monthName: c.monthNames[month],
    day,
    hour,
    minute,
  };
}

function formatComponents(cal, comp) {
  const hh = String(comp.hour).padStart(2, '0');
  const mm = String(comp.minute).padStart(2, '0');
  const dd = String(comp.day).padStart(2, '0');
  return `${dd} de ${comp.monthName} de ${comp.year}, ${hh}:${mm}`;
}

module.exports = {
  DEFAULT_CALENDAR,
  normalizeCalendar,
  minutesPerDay,
  daysPerYear,
  componentsToMinutes,
  minutesToComponents,
  formatComponents,
};
