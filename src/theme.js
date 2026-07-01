'use strict';

// Paleta e emojis centralizados para manter a estetica consistente.
const COLORS = {
  madrugada: 0x2b2d5e, // azul profundo
  manha: 0xf6c453, // dourado claro
  tarde: 0xff9f43, // laranja quente
  noite: 0x6c5ce7, // roxo
  neutro: 0x8b5cf6,
};

const EMOJI = {
  clock: '\u{1F570}\uFE0F', // 🕰️
  calendar: '\u{1F4C5}', // 📅
  hourglass: '\u{23F3}', // ⏳
  location: '\u{1F4CD}', // 📍
  speed: '\u{23E9}', // ⏩
  pause: '\u{23F8}\uFE0F', // ⏸️
  star: '\u2B50', // ⭐
  event: '\u{1F5D3}\uFE0F', // 🗓️
  help: '\u{2728}', // ✨
  season: {
    Primavera: '\u{1F338}', // 🌸
    Verao: '\u2600\uFE0F', // ☀️
    Outono: '\u{1F342}', // 🍂
    Inverno: '\u2744\uFE0F', // ❄️
    default: '\u{1F30D}', // 🌍
  },
  moon: ['\u{1F311}', '\u{1F312}', '\u{1F313}', '\u{1F314}', '\u{1F315}', '\u{1F316}', '\u{1F317}', '\u{1F318}'],
  period: {
    madrugada: '\u{1F319}', // 🌙
    manha: '\u{1F305}', // 🌅
    tarde: '\u2600\uFE0F', // ☀️
    noite: '\u{1F307}', // 🌇
  },
};

function colorForPeriod(periodKey) {
  return COLORS[periodKey] || COLORS.neutro;
}

// Barra de progresso em blocos unicode.
function progressBar(fraction, size = 12) {
  const f = Math.min(Math.max(fraction, 0), 1);
  const filled = Math.round(f * size);
  return `${'\u2588'.repeat(filled)}${'\u2591'.repeat(size - filled)} ${Math.round(f * 100)}%`;
}

module.exports = { COLORS, EMOJI, colorForPeriod, progressBar };
