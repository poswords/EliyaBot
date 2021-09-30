const path = require('path');
const Discord = require('discord.js');
const moment = require('moment-timezone');

const group = path.parse(__filename).name;

const catchErr = err => {
  console.log(err)
}
const help = {
  name: 'help',
  group,
  aliases: ['commands', 'h'],
  memberName: 'help',
  description: 'Prints out this message.',
  execute(message) {
    const user = message.client.user;
    const orderedCommands = {};
    const commands = { uncategorized: [] };
    message.client.commands.forEach((c) => {
      if (c.group) {
        c.group in commands ? commands[c.group].push(c) : commands[c.group] = [c];
      } else {
        commands.uncategorized.push(c);
      }
    });
    Object.keys(commands).sort().forEach(key => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      orderedCommands[capitalizedKey] = commands[key]
        .sort((a, b) => a.name > b.name ? 1 : -1)
        .filter(c => !c.hidden);
    });

    const embed = new Discord.MessageEmbed()
      .setTitle(`${user.username} commands list`)
      .setThumbnail(user.avatarURL)
      .setDescription('All commands can be abbreviated')
      .setTimestamp();
    Object.keys(orderedCommands).forEach((k) => {
      if (orderedCommands[k].length > 0) {
        embed.addField('Group', `**${k}**`);
        orderedCommands[k].forEach((c) => {
          const prefix = process.env.PREFIX;
          let commandName = `${prefix}${c.name}`;
          if (c.aliases) {
            commandName = `${commandName}, ` + c.aliases.map(a => `${prefix}${a}`).join(', ');
          }
          embed.addField(commandName, c.description, true);
        });
      }
    });
    // not yet implemented
    // .addField('!bosses', 'Lists all bosses and their weapons', true)
    // .addField('!weapon [Weapon Name]', 'Lists information about the given weapon(Only has boss weapons atm).', true)

    return message.channel.send({embeds:[embed]}).catch(catchErr);
  },
};

const ping = {
  name: 'ping',
  group,
  description: 'Ping!',
  async execute(message) {
    const msg = await message.channel.send('Pong!');
    const pingTime = moment(msg.createdTimestamp).diff(moment(message.createdTimestamp));
    return msg.edit(`Pong! Time taken: ${pingTime}ms`);
  },
};

module.exports = [help, ping];
