'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuild, saveGuild } = require('../store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('local')
    .setDescription('Gerencia os locais do RPG.')
    .addSubcommand((s) => s.setName('adicionar').setDescription('Adiciona um novo local.')
      .addStringOption((o) => o.setName('nome').setDescription('Nome do local').setRequired(true))
      .addStringOption((o) => o.setName('descricao').setDescription('Descricao ou nota (opcional)').setRequired(false)))
    .addSubcommand((s) => s.setName('editar').setDescription('Edita um local existente.')
      .addIntegerOption((o) => o.setName('numero').setDescription('Numero do local (veja em /local listar)').setMinValue(1).setRequired(true))
      .addStringOption((o) => o.setName('nome').setDescription('Novo nome (opcional)').setRequired(false))
      .addStringOption((o) => o.setName('descricao').setDescription('Nova descricao (opcional)').setRequired(false)))
    .addSubcommand((s) => s.setName('remover').setDescription('Remove um local.')
      .addIntegerOption((o) => o.setName('numero').setDescription('Numero do local (veja em /local listar)').setMinValue(1).setRequired(true)))
    .addSubcommand((s) => s.setName('listar').setDescription('Lista todos os locais.'))
    .addSubcommand((s) => s.setName('atual').setDescription('Define qual e o local atual.')
      .addIntegerOption((o) => o.setName('numero').setDescription('Numero do local (veja em /local listar)').setMinValue(1).setRequired(true))),
  async execute(interaction) {
    const state = getGuild(interaction.guildId);
    const sub = interaction.options.getSubcommand();

    if (sub === 'adicionar') {
      const nome = interaction.options.getString('nome');
      const descricao = interaction.options.getString('descricao') || '';
      state.locations.push({ name: nome, note: descricao });
      if (state.currentLocation == null) state.currentLocation = state.locations.length - 1;
      saveGuild(interaction.guildId, state);
      await interaction.reply(`Local **${nome}** adicionado (numero ${state.locations.length}).`);
      return;
    }

    if (sub === 'listar') {
      if (state.locations.length === 0) {
        await interaction.reply('Nenhum local cadastrado. Use `/local adicionar`.');
        return;
      }
      const lines = state.locations.map((l, i) => {
        const marker = i === state.currentLocation ? ' \u2b50 (atual)' : '';
        const note = l.note ? ` — ${l.note}` : '';
        return `**${i + 1}.** ${l.name}${note}${marker}`;
      });
      const embed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle('Locais do RPG')
        .setDescription(lines.join('\n'));
      await interaction.reply({ embeds: [embed] });
      return;
    }

    // Subcomandos que precisam de um numero valido.
    const idx = interaction.options.getInteger('numero') - 1;
    if (idx < 0 || idx >= state.locations.length) {
      await interaction.reply({ content: 'Numero de local invalido. Veja `/local listar`.', ephemeral: true });
      return;
    }

    if (sub === 'editar') {
      const nome = interaction.options.getString('nome');
      const descricao = interaction.options.getString('descricao');
      if (nome == null && descricao == null) {
        await interaction.reply({ content: 'Informe um novo `nome` e/ou `descricao`.', ephemeral: true });
        return;
      }
      if (nome != null) state.locations[idx].name = nome;
      if (descricao != null) state.locations[idx].note = descricao;
      saveGuild(interaction.guildId, state);
      await interaction.reply(`Local ${idx + 1} atualizado: **${state.locations[idx].name}**.`);
      return;
    }

    if (sub === 'remover') {
      const [removed] = state.locations.splice(idx, 1);
      if (state.currentLocation != null) {
        if (state.currentLocation === idx) state.currentLocation = state.locations.length ? 0 : null;
        else if (state.currentLocation > idx) state.currentLocation -= 1;
      }
      saveGuild(interaction.guildId, state);
      await interaction.reply(`Local **${removed.name}** removido.`);
      return;
    }

    if (sub === 'atual') {
      state.currentLocation = idx;
      saveGuild(interaction.guildId, state);
      await interaction.reply(`Local atual definido: **${state.locations[idx].name}**.`);
    }
  },
};
