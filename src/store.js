'use strict';

const fs = require('fs');
const path = require('path');
const { DEFAULT_CALENDAR, componentsToMinutes } = require('./calendar');

const DATA_FILE = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.resolve(__dirname, '..', 'data', 'guilds.json');

function ensureDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readAll() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

function writeAll(data) {
  ensureDir();
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

function defaultGuildState() {
  const calendar = { ...DEFAULT_CALENDAR };
  // Comeca em 01/Janeiro/1000, 08:00, pausado.
  const anchorFictionalMinutes = componentsToMinutes(calendar, {
    year: 1000, month: 1, day: 1, hour: 8, minute: 0,
  });
  return {
    calendar,
    clock: {
      anchorFictionalMinutes,
      anchorRealMs: Date.now(),
      // Minutos ficticios que passam por minuto real. 0 = pausado.
      rate: 0,
    },
    locations: [],
    currentLocation: null,
  };
}

function getGuild(guildId) {
  const all = readAll();
  if (!all[guildId]) {
    all[guildId] = defaultGuildState();
    writeAll(all);
  }
  return all[guildId];
}

function saveGuild(guildId, state) {
  const all = readAll();
  all[guildId] = state;
  writeAll(all);
}

module.exports = {
  DATA_FILE,
  getGuild,
  saveGuild,
  defaultGuildState,
};
