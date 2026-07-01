'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');

function loadCommands() {
  const commands = new Collection();
  const dir = path.join(__dirname, 'commands');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
  for (const file of files) {
    const command = require(path.join(dir, file));
    if (command?.data?.name && typeof command.execute === 'function') {
      commands.set(command.data.name, command);
    } else {
      console.warn(`[aviso] Comando ignorado (sem data/execute): ${file}`);
    }
  }
  return commands;
}

function main() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('DISCORD_TOKEN nao definido. Copie .env.example para .env e preencha.');
    process.exit(1);
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.commands = loadCommands();

  client.once(Events.ClientReady, (c) => {
    console.log(`Bot online como ${c.user.tag}. ${client.commands.size} comandos carregados.`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guildId) {
      await interaction.reply({ content: 'Este bot so funciona dentro de um servidor.', ephemeral: true });
      return;
    }
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`Erro ao executar /${interaction.commandName}:`, err);
      const payload = { content: 'Ocorreu um erro ao executar esse comando.', ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(payload);
      else await interaction.reply(payload);
    }
  });

  client.login(token);
}

main();
