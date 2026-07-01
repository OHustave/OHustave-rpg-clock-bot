'use strict';

const { EmbedBuilder } = require('discord.js');
const { formatNow, describeRate, currentComponents, currentFictionalMinutes } = require('./timeEngine');
const { worldInfo, formatDuration } = require('./worldInfo');
const { EMOJI, colorForPeriod, progressBar } = require('./theme');

function nextEvent(state) {
  if (!Array.isArray(state.events) || state.events.length === 0) return null;
  const now = currentFictionalMinutes(state);
  const upcoming = state.events
    .filter((e) => e.atMinutes >= now)
    .sort((a, b) => a.atMinutes - b.atMinutes);
  if (upcoming.length === 0) return null;
  const e = upcoming[0];
  return { name: e.name, inMinutes: e.atMinutes - now };
}

function clockEmbed(state) {
  const comp = currentComponents(state);
  const info = worldInfo(state.calendar, comp);
  const hh = String(comp.hour).padStart(2, '0');
  const mm = String(comp.minute).padStart(2, '0');
  const dd = String(comp.day).padStart(2, '0');

  const loc = state.currentLocation != null && state.locations[state.currentLocation]
    ? state.locations[state.currentLocation]
    : null;

  const embed = new EmbedBuilder()
    .setColor(colorForPeriod(info.period.key))
    .setAuthor({ name: 'Cronica do Mundo' })
    .setTitle(`${EMOJI.clock} ${hh}:${mm} \u2014 ${info.weekDayName}`)
    .setDescription(`${EMOJI.calendar} **${dd} de ${comp.monthName} de ${comp.year}**`)
    .addFields(
      { name: `${info.period.emoji} Periodo`, value: info.period.label, inline: true },
      { name: `${info.season.emoji} Estacao`, value: info.season.name, inline: true },
      { name: `${info.moon.emoji} Lua`, value: info.moon.name, inline: true },
      { name: `${EMOJI.speed} Ritmo`, value: describeRate(state.clock.rate, state.calendar), inline: false },
      { name: 'Progresso do dia', value: `\`${progressBar(info.dayFraction)}\``, inline: false },
    );

  embed.addFields({
    name: `${EMOJI.location} Local atual`,
    value: loc ? (loc.note ? `**${loc.name}** \u2014 ${loc.note}` : `**${loc.name}**`) : 'Nenhum definido (use `/local atual`)',
    inline: false,
  });

  const ev = nextEvent(state);
  if (ev) {
    embed.addFields({
      name: `${EMOJI.hourglass} Proximo evento`,
      value: `**${ev.name}** \u2014 em ${formatDuration(state.calendar, ev.inMinutes)}`,
      inline: false,
    });
  }

  embed.setFooter({ text: 'RPG Clock \u2022 tempo do seu mundo' }).setTimestamp(new Date());
  return embed;
}

// Confirmacao curta + o relogio atualizado.
function actionReply(state, message) {
  return { content: message, embeds: [clockEmbed(state)] };
}

module.exports = { clockEmbed, actionReply, nextEvent };

// Reexporta para conveniencia em testes.
module.exports.formatNow = formatNow;
