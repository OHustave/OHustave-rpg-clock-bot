'use strict';

const test = require('node:test');
const assert = require('node:assert');

const { DEFAULT_CALENDAR, componentsToMinutes, minutesToComponents } = require('../src/calendar');
const { worldInfo, formatDuration } = require('../src/worldInfo');

function infoAt(comp, cal = DEFAULT_CALENDAR) {
  const min = componentsToMinutes(cal, comp);
  return worldInfo(cal, minutesToComponents(cal, min));
}

test('periodo do dia segue a hora', () => {
  assert.strictEqual(infoAt({ year: 1000, month: 1, day: 1, hour: 2, minute: 0 }).period.key, 'madrugada');
  assert.strictEqual(infoAt({ year: 1000, month: 1, day: 1, hour: 9, minute: 0 }).period.key, 'manha');
  assert.strictEqual(infoAt({ year: 1000, month: 1, day: 1, hour: 14, minute: 0 }).period.key, 'tarde');
  assert.strictEqual(infoAt({ year: 1000, month: 1, day: 1, hour: 22, minute: 0 }).period.key, 'noite');
});

test('dia da semana cicla pelos nomes', () => {
  const cal = { ...DEFAULT_CALENDAR, weekDayNames: ['A', 'B', 'C'] };
  // absoluteDay do ano 0, dia 1 = 0 -> primeiro nome.
  const first = worldInfo(cal, minutesToComponents(cal, componentsToMinutes(cal, { year: 0, month: 1, day: 1, hour: 0, minute: 0 })));
  assert.strictEqual(first.weekDayName, 'A');
  const third = worldInfo(cal, minutesToComponents(cal, componentsToMinutes(cal, { year: 0, month: 1, day: 3, hour: 0, minute: 0 })));
  assert.strictEqual(third.weekDayName, 'C');
});

test('fase da lua avanca com o ciclo', () => {
  const cal = { ...DEFAULT_CALENDAR, moonCycleDays: 8 };
  const d0 = worldInfo(cal, minutesToComponents(cal, componentsToMinutes(cal, { year: 0, month: 1, day: 1, hour: 0, minute: 0 })));
  assert.strictEqual(d0.moon.name, 'Lua Nova');
  const d4 = worldInfo(cal, minutesToComponents(cal, componentsToMinutes(cal, { year: 0, month: 1, day: 5, hour: 0, minute: 0 })));
  assert.strictEqual(d4.moon.name, 'Lua Cheia');
});

test('estacao segue a fracao do ano', () => {
  // 12 meses, 4 estacoes -> primeiro mes = primeira estacao; ultimo mes = ultima.
  assert.strictEqual(infoAt({ year: 1000, month: 1, day: 1, hour: 0, minute: 0 }).season.name, 'Primavera');
  assert.strictEqual(infoAt({ year: 1000, month: 12, day: 20, hour: 0, minute: 0 }).season.name, 'Inverno');
});

test('formatDuration usa dias/horas do calendario', () => {
  // Dia de 10h: 10h*60 + 5*60 = 900 min => 1 dia e 5 horas.
  const cal = { ...DEFAULT_CALENDAR, hoursPerDay: 10 };
  assert.strictEqual(formatDuration(cal, 900), '1 dia(s) e 5 hora(s)');
  assert.strictEqual(formatDuration(DEFAULT_CALENDAR, 0), 'menos de 1 min');
});
