'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { EMOJI, COLORS } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Lista todos os comandos do bot de RPG.'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.neutro)
      .setAuthor({ name: 'RPG Clock' })
      .setTitle(`${EMOJI.help} Central de Ajuda`)
      .setDescription('Um relogio de tempo ficticio para o seu RPG, com calendario, estacoes, luas, locais e eventos.')
      .addFields(
        {
          name: `${EMOJI.clock} Tempo`,
          value: [
            '`/relogio` \u2014 mostra data, hora, periodo, estacao, lua e local.',
            '`/definir-data` \u2014 define a data e hora atuais.',
            '`/avancar` \u2014 avanca/retrocede o tempo (minutos, horas, dias).',
            '`/velocidade` \u2014 define o ritmo em que o tempo passa sozinho.',
            '`/pausar` \u2014 congela o relogio.',
          ].join('\n'),
        },
        {
          name: `${EMOJI.location} Locais`,
          value: '`/local adicionar | editar | remover | listar | atual`',
        },
        {
          name: `${EMOJI.event} Eventos`,
          value: '`/evento adicionar | listar | remover | proximo`',
        },
        {
          name: `${EMOJI.calendar} Calendario`,
          value: '`/calendario ver | meses | dia | semana | estacoes | lua` \u2014 customize meses, dias, horas, dias da semana, estacoes e ciclo lunar.',
        },
      )
      .setFooter({ text: 'RPG Clock \u2022 use /relogio para comecar' });
    await interaction.reply({ embeds: [embed] });
  },
};
