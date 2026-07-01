'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

function collectCommandData() {
  const dir = path.join(__dirname, 'commands');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
  const data = [];
  for (const file of files) {
    const command = require(path.join(dir, file));
    if (command?.data) data.push(command.data.toJSON());
  }
  return data;
}

async function main() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId) {
    console.error('Defina DISCORD_TOKEN e CLIENT_ID no arquivo .env.');
    process.exit(1);
  }

  const commands = collectCommandData();
  const rest = new REST().setToken(token);

  try {
    if (guildId) {
      const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`${data.length} comandos registrados no servidor ${guildId} (instantaneo).`);
    } else {
      const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log(`${data.length} comandos registrados globalmente (pode levar ate 1h para aparecer).`);
    }
  } catch (err) {
    console.error('Falha ao registrar comandos:', err);
    process.exit(1);
  }
}

main();
