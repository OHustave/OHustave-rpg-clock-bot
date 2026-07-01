'use strict';

const test = require('node:test');
const assert = require('node:assert');

const {
  DEFAULT_CALENDAR,
  componentsToMinutes,
  minutesToComponents,
  formatComponents,
} = require('../src/calendar');
const { currentFictionalMinutes, reanchor, describeRate } = require('../src/timeEngine');

test('round-trip de componentes <-> minutos', () => {
  const comp = { year: 1000, month: 3, day: 15, hour: 13, minute: 45 };
  const min = componentsToMinutes(DEFAULT_CALENDAR, comp);
  const back = minutesToComponents(DEFAULT_CALENDAR, min);
  assert.strictEqual(back.year, 1000);
  assert.strictEqual(back.month, 3);
  assert.strictEqual(back.day, 15);
  assert.strictEqual(back.hour, 13);
  assert.strictEqual(back.minute, 45);
  assert.strictEqual(back.monthName, 'Marco');
});

test('virada de dia e de mes', () => {
  const start = componentsToMinutes(DEFAULT_CALENDAR, { year: 1000, month: 1, day: 31, hour: 23, minute: 30 });
  const later = minutesToComponents(DEFAULT_CALENDAR, start + 60); // +60 min
  assert.strictEqual(later.day, 1);
  assert.strictEqual(later.month, 2);
  assert.strictEqual(later.hour, 0);
  assert.strictEqual(later.minute, 30);
});

test('calendario customizado: 10h por dia, 3 meses de 5 dias', () => {
  const cal = {
    monthNames: ['Um', 'Dois', 'Tres'],
    daysPerMonth: [5, 5, 5],
    hoursPerDay: 10,
    minutesPerHour: 60,
  };
  const start = componentsToMinutes(cal, { year: 0, month: 3, day: 5, hour: 9, minute: 0 });
  const next = minutesToComponents(cal, start + 60); // vira o ano
  assert.strictEqual(next.year, 1);
  assert.strictEqual(next.month, 1);
  assert.strictEqual(next.day, 1);
  assert.strictEqual(next.hour, 0);
});

test('ritmo faz o tempo passar; reanchor congela', () => {
  const state = {
    calendar: { ...DEFAULT_CALENDAR },
    clock: { anchorFictionalMinutes: 0, anchorRealMs: 1000, rate: 60 },
  };
  // 2 minutos reais depois -> 120 minutos ficticios (rate 60).
  const now = 1000 + 2 * 60000;
  assert.strictEqual(Math.round(currentFictionalMinutes(state, now)), 120);

  reanchor(state, currentFictionalMinutes(state, now), now);
  state.clock.rate = 0;
  const muchLater = now + 999 * 60000;
  assert.strictEqual(Math.round(currentFictionalMinutes(state, muchLater)), 120);
});

test('avancar negativo retrocede', () => {
  const state = {
    calendar: { ...DEFAULT_CALENDAR },
    clock: { anchorFictionalMinutes: 500, anchorRealMs: 0, rate: 0 },
  };
  reanchor(state, currentFictionalMinutes(state, 0) - 120, 0);
  assert.strictEqual(Math.round(currentFictionalMinutes(state, 0)), 380);
});

test('describeRate cobre presets', () => {
  assert.match(describeRate(0), /Pausado/);
  assert.match(describeRate(60), /hora/);
  assert.match(describeRate(1440), /dia/);
});

test('describeRate respeita calendario customizado (dia de 10h)', () => {
  const cal = {
    monthNames: ['Um', 'Dois', 'Tres'],
    daysPerMonth: [5, 5, 5],
    hoursPerDay: 10,
    minutesPerHour: 60,
  };
  // Num dia de 10h, 600 min ficticios = 1 dia; 60 min = 1 hora.
  assert.match(describeRate(600, cal), /1 dia/);
  assert.match(describeRate(60, cal), /1 hora/);
});

test('formatComponents produz string legivel', () => {
  const s = formatComponents(DEFAULT_CALENDAR, {
    year: 1000, month: 1, monthName: 'Janeiro', day: 1, hour: 8, minute: 5,
  });
  assert.strictEqual(s, '01 de Janeiro de 1000, 08:05');
});
