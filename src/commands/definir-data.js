'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getGuild, saveGuild } = require('../store');
const { componentsToMinutes } = require('../calendar');
const { currentComponents, reanchor } = require('../timeEngine');
const { clockEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('definir-data')
    .setDescription('Define a data e hora ficticias atuais.')
    .addIntegerOption((o) => o.setName('dia').setDescription('Dia do mes').setMinValue(1).setRequired(true))
    .addIntegerOption((o) => o.setName('mes').setDescription('Mes (numero, 1 = primeiro mes)').setMinValue(1).setRequired(true))
    .addIntegerOption((o) => o.setName('ano').setDescription('Ano').setRequired(true))
    .addIntegerOption((o) => o.setName('hora').setDescription('Hora (0-23)').setMinValue(0).setRequired(false))
    .addIntegerOption((o) => o.setName('minuto').setDescription('Minuto (0-59)').setMinValue(0).setRequired(false)),
  async execute(interaction) {
    const state = getGuild(interaction.guildId);

    const now = currentComponents(state);
    const day = interaction.options.getInteger('dia');
    const month = interaction.options.getInteger('mes');
    const year = interaction.options.getInteger('ano');
    const hour = interaction.options.getInteger('hora') ?? now.hour;
    const minute = interaction.options.getInteger('minuto') ?? now.minute;

    if (month > state.calendar.monthNames.length) {
      await interaction.reply({
        content: `Este calendario so tem ${state.calendar.monthNames.length} meses. Use /calendario para ver ou alterar.`,
        ephemeral: true,
      });
      return;
    }

    const fic = componentsToMinutes(state.calendar, { year, month, day, hour, minute });
    reanchor(state, fic);
    saveGuild(interaction.guildId, state);

    await interaction.reply({ content: 'Data e hora atualizadas.', embeds: [clockEmbed(state)] });
  },
};
