'use strict';

const { EmbedBuilder } = require('discord.js');
const { formatNow, describeRate } = require('./timeEngine');

function clockEmbed(state) {
  const loc = state.currentLocation != null && state.locations[state.currentLocation]
    ? state.locations[state.currentLocation]
    : null;

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle('Relogio de RPG')
    .addFields(
      { name: 'Data e hora', value: `**${formatNow(state)}**` },
      { name: 'Ritmo', value: describeRate(state.clock.rate) },
    );

  if (loc) {
    embed.addFields({
      name: 'Local atual',
      value: loc.note ? `**${loc.name}** — ${loc.note}` : `**${loc.name}**`,
    });
  } else {
    embed.addFields({ name: 'Local atual', value: 'Nenhum definido (use `/local atual`)' });
  }

  embed.setFooter({ text: 'Use /relogio para consultar a qualquer momento' });
  return embed;
}

module.exports = { clockEmbed };
