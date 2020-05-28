// Run dotenv
require('dotenv').config();
const fs = require('fs');

const Discord = require('discord.js');

const client = new Discord.Client();
const prefix = process.env.PREFIX || '!!';
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const commands = require(`./commands/${file}`);
  if (Array.isArray(commands)) {
    commands.forEach(c => client.commands.set(c.name, c));
  } else {
    client.commands.set(commands.name, commands);
  }
}
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    return;
  }

  try {
    console.log(`Executing command ${message.content} by @${message.author.tag} ` +
      `in #${message.channel.name} (${message.channel.guild.name})`);

    if (command.args && !args.length) {
      let reply = 'You didn\'t provide any arguments!';
      if (command.usage) {
        reply += `\nUsage ${prefix}${command.name} ${command.usage}`;
      }

      return message.channel.send(reply);
    }
    return command.execute(message, args);
  } catch (error) {
    console.error(error);
    // return message.channel.send('There was an error trying to execute that command!');
  }
});

client.on('error', console.error);

client.login(process.env.DISCORD_TOKEN);