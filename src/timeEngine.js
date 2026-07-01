'use strict';

const { minutesToComponents, formatComponents } = require('./calendar');

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

// Descreve o ritmo atual em linguagem natural.
function describeRate(rate) {
  if (!rate || rate === 0) return 'Pausado (o tempo nao avanca sozinho)';
  const perRealMinute = rate;
  if (perRealMinute % 1440 === 0) {
    return `${perRealMinute / 1440} dia(s) ficticio(s) por minuto real`;
  }
  if (perRealMinute % 60 === 0) {
    return `${perRealMinute / 60} hora(s) ficticia(s) por minuto real`;
  }
  return `${perRealMinute} minuto(s) ficticio(s) por minuto real`;
}

module.exports = {
  currentFictionalMinutes,
  reanchor,
  currentComponents,
  formatNow,
  describeRate,
};
