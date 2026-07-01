'use strict';

const { normalizeCalendar, minutesPerDay } = require('./calendar');
const { EMOJI } = require('./theme');

const PERIODS = [
  { key: 'madrugada', label: 'Madrugada' },
  { key: 'manha', label: 'Manha' },
  { key: 'tarde', label: 'Tarde' },
  { key: 'noite', label: 'Noite' },
];

const MOON_NAMES = [
  'Lua Nova', 'Crescente', 'Quarto Crescente', 'Gibosa Crescente',
  'Lua Cheia', 'Gibosa Minguante', 'Quarto Minguante', 'Minguante',
];

// Reune tudo que descreve o "mundo" no instante ficticio (a partir dos componentes).
function worldInfo(cal, comp) {
  const c = normalizeCalendar(cal);

  // Periodo do dia pela fracao das horas.
  const dayFraction = (comp.hour * c.minutesPerHour + comp.minute) / minutesPerDay(c);
  const periodIndex = Math.min(PERIODS.length - 1, Math.floor(dayFraction * PERIODS.length));
  const period = PERIODS[periodIndex];

  // Dia da semana pelo dia absoluto.
  const wIndex = ((comp.absoluteDay % c.weekDayNames.length) + c.weekDayNames.length) % c.weekDayNames.length;
  const weekDayName = c.weekDayNames[wIndex];

  // Fase da lua pelo dia absoluto dentro do ciclo lunar.
  const cyclePos = ((comp.absoluteDay % c.moonCycleDays) + c.moonCycleDays) % c.moonCycleDays;
  const moonIndex = Math.floor((cyclePos / c.moonCycleDays) * MOON_NAMES.length) % MOON_NAMES.length;

  // Estacao pela fracao do ano.
  const daysInYear = c.daysPerMonth.reduce((a, b) => a + b, 0);
  const yearFraction = comp.dayOfYear / daysInYear;
  const seasonIndex = Math.min(c.seasonNames.length - 1, Math.floor(yearFraction * c.seasonNames.length));
  const seasonName = c.seasonNames[seasonIndex];

  return {
    dayFraction,
    weekDayName,
    period: { key: period.key, label: period.label, emoji: EMOJI.period[period.key] },
    moon: { name: MOON_NAMES[moonIndex], emoji: EMOJI.moon[moonIndex] },
    season: { name: seasonName, emoji: EMOJI.season[seasonName] || EMOJI.season.default },
  };
}

// Formata uma duracao (em minutos ficticios) usando o calendario.
function formatDuration(cal, minutes) {
  const c = normalizeCalendar(cal);
  const mpd = minutesPerDay(c);
  let m = Math.abs(Math.round(minutes));

  const days = Math.floor(m / mpd);
  m -= days * mpd;
  const hours = Math.floor(m / c.minutesPerHour);
  m -= hours * c.minutesPerHour;
  const mins = m;

  const parts = [];
  if (days) parts.push(`${days} dia(s)`);
  if (hours) parts.push(`${hours} hora(s)`);
  if (mins && !days) parts.push(`${mins} min`);
  return parts.length ? parts.join(' e ') : 'menos de 1 min';
}

module.exports = { worldInfo, formatDuration, PERIODS, MOON_NAMES };
