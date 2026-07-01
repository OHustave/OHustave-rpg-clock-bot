'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getGuild, saveGuild } = require('../store');
const { currentFictionalMinutes, reanchor, describeRate } = require('../timeEngine');
const { clockEmbed } = require('../embeds');

const UNIT_MINUTES = { minutos: 1, horas: 60, dias: 1440 };

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

    let rate;
    if (preset === 'pausado') rate = 0;
    else if (preset === 'real') rate = 1;
    else if (preset === 'hora') rate = 60;
    else if (preset === 'dia') rate = 1440;
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
      rate = qty * UNIT_MINUTES[unit];
    }

    // Congela o tempo atual antes de trocar o ritmo, para nao dar salto.
    const current = currentFictionalMinutes(state);
    reanchor(state, current);
    state.clock.rate = rate;
    saveGuild(interaction.guildId, state);

    await interaction.reply({
      content: `Ritmo definido: ${describeRate(rate)}.`,
      embeds: [clockEmbed(state)],
    });
  },
};
