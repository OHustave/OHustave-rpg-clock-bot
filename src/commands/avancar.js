'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getGuild, saveGuild } = require('../store');
const { currentFictionalMinutes, reanchor } = require('../timeEngine');
const { clockEmbed } = require('../embeds');

const UNIT_MINUTES = { minutos: 1, horas: 60, dias: 1440 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avancar')
    .setDescription('Avanca (ou retrocede) o tempo ficticio manualmente.')
    .addIntegerOption((o) => o.setName('quantidade').setDescription('Quanto avancar. Use numero negativo para voltar.').setRequired(true))
    .addStringOption((o) => o.setName('unidade').setDescription('Unidade de tempo').setRequired(true)
      .addChoices(
        { name: 'minutos', value: 'minutos' },
        { name: 'horas', value: 'horas' },
        { name: 'dias', value: 'dias' },
      )),
  async execute(interaction) {
    const state = getGuild(interaction.guildId);
    const qty = interaction.options.getInteger('quantidade');
    const unit = interaction.options.getString('unidade');

    const perDay = state.calendar.hoursPerDay * state.calendar.minutesPerHour;
    const perHour = state.calendar.minutesPerHour;
    const factor = unit === 'dias' ? perDay : unit === 'horas' ? perHour : 1;

    const current = currentFictionalMinutes(state);
    reanchor(state, current + qty * factor);
    saveGuild(interaction.guildId, state);

    const verbo = qty >= 0 ? 'avancado' : 'retrocedido';
    await interaction.reply({
      content: `Tempo ${verbo} em ${Math.abs(qty)} ${unit}.`,
      embeds: [clockEmbed(state)],
    });
  },
};

module.exports.UNIT_MINUTES = UNIT_MINUTES;
