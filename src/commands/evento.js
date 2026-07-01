'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuild, saveGuild } = require('../store');
const { componentsToMinutes, minutesToComponents, formatComponents } = require('../calendar');
const { currentFictionalMinutes } = require('../timeEngine');
const { formatDuration } = require('../worldInfo');
const { EMOJI, COLORS } = require('../theme');

function ensureEvents(state) {
  if (!Array.isArray(state.events)) state.events = [];
  return state.events;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('evento')
    .setDescription('Agenda e acompanha eventos em datas ficticias.')
    .addSubcommand((s) => s.setName('adicionar').setDescription('Agenda um novo evento.')
      .addStringOption((o) => o.setName('nome').setDescription('Nome do evento').setRequired(true))
      .addIntegerOption((o) => o.setName('dia').setDescription('Dia').setMinValue(1).setRequired(true))
      .addIntegerOption((o) => o.setName('mes').setDescription('Mes (numero)').setMinValue(1).setRequired(true))
      .addIntegerOption((o) => o.setName('ano').setDescription('Ano').setRequired(true))
      .addIntegerOption((o) => o.setName('hora').setDescription('Hora (opcional)').setMinValue(0).setRequired(false))
      .addIntegerOption((o) => o.setName('minuto').setDescription('Minuto (opcional)').setMinValue(0).setRequired(false)))
    .addSubcommand((s) => s.setName('listar').setDescription('Lista os eventos agendados.'))
    .addSubcommand((s) => s.setName('remover').setDescription('Remove um evento.')
      .addIntegerOption((o) => o.setName('numero').setDescription('Numero do evento (veja em /evento listar)').setMinValue(1).setRequired(true)))
    .addSubcommand((s) => s.setName('proximo').setDescription('Mostra o proximo evento.')),
  async execute(interaction) {
    const state = getGuild(interaction.guildId);
    const events = ensureEvents(state);
    const sub = interaction.options.getSubcommand();

    if (sub === 'adicionar') {
      const nome = interaction.options.getString('nome');
      const dia = interaction.options.getInteger('dia');
      const mes = interaction.options.getInteger('mes');
      const ano = interaction.options.getInteger('ano');
      const hora = interaction.options.getInteger('hora') ?? 0;
      const minuto = interaction.options.getInteger('minuto') ?? 0;

      if (mes > state.calendar.monthNames.length) {
        await interaction.reply({ content: `Este calendario so tem ${state.calendar.monthNames.length} meses.`, ephemeral: true });
        return;
      }

      const atMinutes = componentsToMinutes(state.calendar, { year: ano, month: mes, day: dia, hour: hora, minute: minuto });
      events.push({ name: nome, atMinutes });
      events.sort((a, b) => a.atMinutes - b.atMinutes);
      saveGuild(interaction.guildId, state);

      const when = formatComponents(state.calendar, minutesToComponents(state.calendar, atMinutes));
      await interaction.reply(`${EMOJI.event} Evento **${nome}** agendado para **${when}**.`);
      return;
    }

    if (sub === 'listar') {
      if (events.length === 0) {
        await interaction.reply('Nenhum evento agendado. Use `/evento adicionar`.');
        return;
      }
      const now = currentFictionalMinutes(state);
      const lines = events.map((e, i) => {
        const when = formatComponents(state.calendar, minutesToComponents(state.calendar, e.atMinutes));
        const delta = e.atMinutes - now;
        const rel = delta >= 0
          ? `em ${formatDuration(state.calendar, delta)}`
          : `ha ${formatDuration(state.calendar, delta)}`;
        return `**${i + 1}.** ${EMOJI.event} **${e.name}** \u2014 ${when} _(${rel})_`;
      });
      const embed = new EmbedBuilder()
        .setColor(COLORS.neutro)
        .setTitle(`${EMOJI.event} Eventos agendados`)
        .setDescription(lines.join('\n'));
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === 'remover') {
      const idx = interaction.options.getInteger('numero') - 1;
      if (idx < 0 || idx >= events.length) {
        await interaction.reply({ content: 'Numero de evento invalido. Veja `/evento listar`.', ephemeral: true });
        return;
      }
      const [removed] = events.splice(idx, 1);
      saveGuild(interaction.guildId, state);
      await interaction.reply(`Evento **${removed.name}** removido.`);
      return;
    }

    if (sub === 'proximo') {
      const now = currentFictionalMinutes(state);
      const upcoming = events.filter((e) => e.atMinutes >= now).sort((a, b) => a.atMinutes - b.atMinutes);
      if (upcoming.length === 0) {
        await interaction.reply('Nao ha eventos futuros agendados.');
        return;
      }
      const e = upcoming[0];
      const when = formatComponents(state.calendar, minutesToComponents(state.calendar, e.atMinutes));
      await interaction.reply(`${EMOJI.hourglass} Proximo: **${e.name}** em **${formatDuration(state.calendar, e.atMinutes - now)}** (${when}).`);
    }
  },
};
