'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getGuild, saveGuild } = require('../store');
const { currentFictionalMinutes, reanchor, describeRate } = require('../timeEngine');
const { clockEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('velocidade')
    .setDescription('Define o ritmo com que o tempo ficticio passa sozinho.')
    .addStringOption((o) => o.setName('preset').setDescription('Escolha um ritmo pronto').setRequired(true)
      .addChoices(
        { name: 'Pausado', value: 'pausado' },
        { name: 'Tempo real (1:1)', value: 'real' },
        { name: '1 min real = 1 hora ficticia', value: 'hora' },
        { name: '1 min real = 1 dia ficticio', value: 'dia' },
        { name: 'Personalizado (use quantidade + unidade)', value: 'custom' },
      ))
    .addIntegerOption((o) => o.setName('quantidade').setDescription('[Personalizado] tempo ficticio por minuto real').setMinValue(1).setRequired(false))
    .addStringOption((o) => o.setName('unidade').setDescription('[Personalizado] unidade').setRequired(false)
      .addChoices(
        { name: 'minutos', value: 'minutos' },
        { name: 'horas', value: 'horas' },
        { name: 'dias', value: 'dias' },
      )),
  async execute(interaction) {
    const state = getGuild(interaction.guildId);
    const preset = interaction.options.getString('preset');

    // Deriva a conversao do calendario atual (dias/horas podem ser customizados).
    const perHour = state.calendar.minutesPerHour;
    const perDay = state.calendar.hoursPerDay * state.calendar.minutesPerHour;

    let rate;
    if (preset === 'pausado') rate = 0;
    else if (preset === 'real') rate = 1;
    else if (preset === 'hora') rate = perHour;
    else if (preset === 'dia') rate = perDay;
    else {
      const qty = interaction.options.getInteger('quantidade');
      const unit = interaction.options.getString('unidade');
      if (!qty || !unit) {
        await interaction.reply({
          content: 'Para o ritmo personalizado, informe `quantidade` e `unidade`.',
          ephemeral: true,
        });
        return;
      }
      const factor = unit === 'dias' ? perDay : unit === 'horas' ? perHour : 1;
      rate = qty * factor;
    }

    // Congela o tempo atual antes de trocar o ritmo, para nao dar salto.
    const current = currentFictionalMinutes(state);
    reanchor(state, current);
    state.clock.rate = rate;
    saveGuild(interaction.guildId, state);

    await interaction.reply({
      content: `Ritmo definido: ${describeRate(rate, state.calendar)}.`,
      embeds: [clockEmbed(state)],
    });
  },
};
