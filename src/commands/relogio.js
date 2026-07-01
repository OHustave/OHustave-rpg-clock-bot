'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getGuild } = require('../store');
const { clockEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('relogio')
    .setDescription('Mostra a data, hora e local ficticios atuais.'),
  async execute(interaction) {
    const state = getGuild(interaction.guildId);
    await interaction.reply({ embeds: [clockEmbed(state)] });
  },
};
