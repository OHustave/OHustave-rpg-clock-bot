'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getGuild, saveGuild } = require('../store');
const { currentFictionalMinutes, reanchor } = require('../timeEngine');
const { clockEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pausar')
    .setDescription('Pausa a passagem automatica do tempo (congela o relogio).'),
  async execute(interaction) {
    const state = getGuild(interaction.guildId);
    const current = currentFictionalMinutes(state);
    reanchor(state, current);
    state.clock.rate = 0;
    saveGuild(interaction.guildId, state);
    await interaction.reply({ content: 'Relogio pausado.', embeds: [clockEmbed(state)] });
  },
};
