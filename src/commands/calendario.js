'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuild, saveGuild } = require('../store');
const { normalizeCalendar, componentsToMinutes } = require('../calendar');
const { currentComponents, reanchor } = require('../timeEngine');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calendario')
    .setDescription('Ve ou configura o calendario ficticio.')
    .addSubcommand((s) => s.setName('ver').setDescription('Mostra o calendario atual.'))
    .addSubcommand((s) => s.setName('meses').setDescription('Define os nomes dos meses (separados por virgula).')
      .addStringOption((o) => o.setName('nomes').setDescription('Ex: Verao, Colheita, Inverno').setRequired(true))
      .addStringOption((o) => o.setName('dias').setDescription('Dias por mes, separados por virgula (opcional). Ex: 30,30,30').setRequired(false)))
    .addSubcommand((s) => s.setName('dia').setDescription('Define quantas horas tem um dia.')
      .addIntegerOption((o) => o.setName('horas').setDescription('Horas por dia (ex: 24)').setMinValue(1).setMaxValue(1000).setRequired(true))),
  async execute(interaction) {
    const state = getGuild(interaction.guildId);
    const sub = interaction.options.getSubcommand();

    if (sub === 'ver') {
      const c = normalizeCalendar(state.calendar);
      const meses = c.monthNames.map((m, i) => `${m} (${c.daysPerMonth[i]}d)`).join(', ');
      const embed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle('Calendario ficticio')
        .addFields(
          { name: 'Horas por dia', value: String(c.hoursPerDay) },
          { name: 'Minutos por hora', value: String(c.minutesPerHour) },
          { name: `Meses (${c.monthNames.length})`, value: meses },
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    // Preserva o instante ficticio atual antes de mudar o calendario.
    const before = currentComponents(state);

    if (sub === 'meses') {
      const nomes = interaction.options.getString('nomes').split(',').map((s2) => s2.trim()).filter(Boolean);
      if (nomes.length === 0) {
        await interaction.reply({ content: 'Informe pelo menos um mes.', ephemeral: true });
        return;
      }
      let dias;
      const diasRaw = interaction.options.getString('dias');
      if (diasRaw) {
        dias = diasRaw.split(',').map((s2) => parseInt(s2.trim(), 10));
        if (dias.length !== nomes.length || dias.some((d) => !Number.isFinite(d) || d < 1)) {
          await interaction.reply({
            content: `A lista de dias deve ter ${nomes.length} numeros positivos (um por mes).`,
            ephemeral: true,
          });
          return;
        }
      } else {
        dias = nomes.map(() => 30);
      }
      state.calendar.monthNames = nomes;
      state.calendar.daysPerMonth = dias;
    } else if (sub === 'dia') {
      state.calendar.hoursPerDay = interaction.options.getInteger('horas');
    }

    // Re-ancora mantendo os mesmos componentes de data/hora no novo calendario.
    const safeMonth = Math.min(before.month, state.calendar.monthNames.length);
    const fic = componentsToMinutes(state.calendar, {
      year: before.year,
      month: safeMonth,
      day: before.day,
      hour: before.hour,
      minute: before.minute,
    });
    reanchor(state, fic);
    saveGuild(interaction.guildId, state);

    await interaction.reply('Calendario atualizado. Use `/calendario ver` para conferir e `/relogio` para ver a data.');
  },
};
