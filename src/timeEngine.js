'use strict';

const {
  minutesToComponents,
  formatComponents,
  normalizeCalendar,
  DEFAULT_CALENDAR,
} = require('./calendar');

// Retorna o total de minutos ficticios "agora", considerando o ritmo (rate).
function currentFictionalMinutes(state, nowMs = Date.now()) {
  const { anchorFictionalMinutes, anchorRealMs, rate } = state.clock;
  const elapsedRealMinutes = (nowMs - anchorRealMs) / 60000;
  return anchorFictionalMinutes + rate * elapsedRealMinutes;
}

// Re-ancora o relogio no valor ficticio informado, a partir de agora.
function reanchor(state, fictionalMinutes, nowMs = Date.now()) {
  state.clock.anchorFictionalMinutes = fictionalMinutes;
  state.clock.anchorRealMs = nowMs;
  return state;
}

function currentComponents(state, nowMs = Date.now()) {
  return minutesToComponents(state.calendar, currentFictionalMinutes(state, nowMs));
}

function formatNow(state, nowMs = Date.now()) {
  return formatComponents(state.calendar, currentComponents(state, nowMs));
}

// Descreve o ritmo atual em linguagem natural, respeitando o calendario.
function describeRate(rate, cal = DEFAULT_CALENDAR) {
  if (!rate || rate === 0) return 'Pausado (o tempo nao avanca sozinho)';
  const c = normalizeCalendar(cal);
  const perDay = c.hoursPerDay * c.minutesPerHour;
  const perHour = c.minutesPerHour;
  if (rate % perDay === 0) {
    return `${rate / perDay} dia(s) ficticio(s) por minuto real`;
  }
  if (rate % perHour === 0) {
    return `${rate / perHour} hora(s) ficticia(s) por minuto real`;
  }
  return `${rate} minuto(s) ficticio(s) por minuto real`;
}

module.exports = {
  currentFictionalMinutes,
  reanchor,
  currentComponents,
  formatNow,
  describeRate,
};
