const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const DB = require('../data')
var data = DB.getData();
const moment = require('moment-timezone');
const { URL } = require('url');
const { Client } = require('pg');
const assetPath = 'http://eliya-bot.herokuapp.com/img/assets/';
const group = path.parse(__filename).name;
const reactionExpiry = 30000;
const normalReaction = '🙂';
const awakenReaction = '😤';
const weaponReaction = '⚔️';
const soulReaction = '📀';
const numberReactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const prefix = process.env.PREFIX || '!!';
const DUNGEONS = process.env.DUNGEONS.split(",");
const RIGHT = '➡️';
const LEFT = '⬅️';

const catchErr = err => {
  console.log(err)
}

const getInfoEmbed = (unit, flag) => {
  var devNicknames = "";
  var footer = unit.Stance + ' - ' + unit.Role + ' - ' + unit.Gender + ' - ' + unit.Race;
  if (unit.DevNicknames){
    devNicknames=unit.DevNicknames;
  }
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  if (unit.Obtain) {
    footer = footer + ' - ' + unit.Obtain;
  }
  footer += '           ' + devNicknames;
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription((unit.AlsoKnownAs?'**Also Known As: **'+unit.AlsoKnownAs+'\n':'')+
      '**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity
      + '\n**Leader Buff: **' + unit.LeaderBuff
      + '\n**Skill: **' + unit.Skill
      + '\n**Skill Cost: **' + unit.SkillWait)
    .addField('Ability 1', unit.Ability1, true)
    .addField('Ability 2', unit.Ability2, true)
    .addField('Ability 3', unit.Ability3, true)
    .setFooter(footer);
  if (unit.Ability4 && unit.Ability5 && unit.Ability6) {
    msg.addField('Ability 4', unit.Ability4, true)
      .addField('Ability 5', unit.Ability5, true)
      .addField('Ability 6', unit.Ability6, true)
  }
  if (unit.DevNicknames){
    if (flag == 'awaken') {
      msg.setThumbnail(assetPath + 'chars/' + devNicknames + '/square_1.png')
    } else {
      msg.setThumbnail(assetPath + 'chars/' + devNicknames + '/square_0.png')
    }
  }
  return msg;
};

const getEquipEmbed = (unit, flag) => {
  var devNicknames = "";
  if (unit.DevNicknames){
    devNicknames=unit.DevNicknames;
  }  
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .addField('Obtain', unit.Obtain, true)
    .setFooter(devNicknames);
  if (flag == 'soul') {
    msg.setDescription('**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity
      + '\n**Ability Soul: **' + unit.AbilitySoul);
    if (unit.DevNicknames){
      msg.setThumbnail(assetPath + 'item/equipment/' + devNicknames + '_soul.png')
    }
  } else {
    msg.setDescription('**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity
      + '\n**HP: **' + unit.MaxHP + '　　**ATK: **' + unit.MaxATK
      + '\n**Weapon Skill: **' + unit.WeaponSkill
      + '\n**Awaken Lv3: **' + unit.AwakenLv3
      + '\n**Awaken Lv5: **' + unit.AwakenLv5);
    if (unit.DevNicknames){
      msg.setThumbnail(assetPath + 'item/equipment/' + devNicknames + '.png')
    }
  }
  return msg;
};


const getThumbnailEmbed = (unit, flag) => {
  var devNicknames = "";
  var footer = unit.Stance + ' - ' + unit.Role + ' - ' + unit.Gender + ' - ' + unit.Race;
  if (unit.DevNicknames){
    devNicknames=unit.DevNicknames;
  }    
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  if (unit.Obtain) {
    footer = footer + ' - ' + unit.Obtain;
  }
  footer += '           ' + devNicknames;
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription((unit.AlsoKnownAs?'**Also Known As: **'+unit.AlsoKnownAs+'\n':'')+'**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity)
    .setThumbnail(assetPath + 'chars/' + devNicknames + '/square_0.png')
    .setFooter(footer);
  if (unit.DevNicknames){    
    if (flag == 'awaken') {
      msg.setThumbnail(assetPath + 'chars/' + devNicknames + '/square_1.png')
    } else {
      msg.setThumbnail(assetPath + 'chars/' + devNicknames + '/square_0.png')
    }
    return msg;
  }
};

const getArtEmbed = (unit, flag) => {
  var devNicknames = "";
  if (unit.DevNicknames){
    devNicknames=unit.DevNicknames;
  }      
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setFooter(devNicknames);
  if (unit.DevNicknames){        
    if (flag == 'awaken') {
      msg.setImage(assetPath + 'chars/' + devNicknames + '/full_shot_1.png')
    } else {
      msg.setImage(assetPath + 'chars/' + devNicknames + '/full_shot_0.png')
    }
  }
  return msg;

};
const getTitleEmbed = (unit) => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName)
    .setDescription('**Condition: **' + unit.Condition);
  msg.setImage(assetPath + 'titles/' + unit.DevNicknames + '.png')
  return msg;

};

const getShortENName = longName => {
  let enName = '';
  let n = longName.split('\n');
  if (n.length >= 2) {
    enName = n[n.length - 1];
  } else {
    enName = n[0];
    const idx = enName.indexOf(']');
    if (idx > 0) {
      enName = enName.slice(idx + 1).trim();
    }
  }
  return enName;
}

const sendList = async (units, message, type) => {
  const msg = await message.channel.send('Found potential matches:\n```diff\n' + units.map((char, index) => (`${parseInt(index, 10) + 1}: ${char.ENName} ${(type == 't') ? "[" + char.JPName + "]" : ""} \n!${type} ${char.DevNicknames}`)).join('\n') + '```');
  await appendReacts(units, message, type, msg);
};

const sendFastList = async (units, message, type) => {
  let list = `${units.length} units found:\`\`\`python\n`;
  list += units.map((char, index) => {
    let enName = getShortENName(char['ENName']);
    return `${parseInt(index, 10) + 1}: ${enName} [${char.JPName}] # ${prefix}${type} ${char.DevNicknames}`
  }).join('\n');
  list += '\`\`\`';
  const msg = await message.channel.send(list);
  await appendReacts(units, message, type, msg, 4);
};

const appendReacts = async (units, message, type, msg, max=10) => {
  const filter = (reaction, user) => {
    return numberReactions.includes(reaction.emoji.name) && user.id === message.author.id;
  };
  let num = units.length;
  if (units.length > max) num = max;
  for (let i = 0; i < num; i++) {
    await msg.react(numberReactions[i]).catch(catchErr);
  }
  const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
  collector.on('collect', r => {
    for (let i = 0; i < num; i++) {
      if (r.emoji.name === numberReactions[i]) {
        switch (type) {
          case 'c':
            sendMessage(units[i], message);
            break;
          case 'w':
            sendThumbnail(units[i], message);
            break;
          case 'e':
            sendEquip(units[i], message);
            break;
          case 'art':
            sendArt(units[i], message);
            break;
          case 'alt':
            sendAlt(units[i], message);
            break;
          case 't':
            sendTitle(units[i], message);
            break;
        }
        msg.reactions.removeAll().catch(catchErr);
      }
    }
  });
  collector.on('end', collected => msg.reactions.removeAll().catch(catchErr));
}

const sendMessage = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };
  try {      
    const msg = await message.channel.send({embeds:[getInfoEmbed(unit, 'normal')]});
    await msg.react(normalReaction).catch(catchErr);
    await msg.react(awakenReaction).catch(catchErr);
    const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
    collector.on('collect', r => {
      if (r.emoji.name === normalReaction) {
        msg.edit({embeds:[getInfoEmbed(unit, 'normal')]});
      }
      if (r.emoji.name === awakenReaction) {
        msg.edit({embeds:[getInfoEmbed(unit, 'awaken')]});
      }
    });
    collector.on('end', collected => msg.reactions.removeAll().catch(catchErr));
  } catch (error) {
    console.log(error)
  }       
};

const sendEquip = async (unit, message) => {
  const filter = (reaction, user) => {
    return [weaponReaction, soulReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };
  try {        
    const msg = await message.channel.send({embeds:[getEquipEmbed(unit, 'icon')]});
    await msg.react(weaponReaction).catch(catchErr);
    await msg.react(soulReaction).catch(catchErr);
    const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
    collector.on('collect', r => {
      if (r.emoji.name === weaponReaction) {
        msg.edit({embeds:[getEquipEmbed(unit, 'icon')]});
      }
      if (r.emoji.name === soulReaction) {
        msg.edit({embeds:[getEquipEmbed(unit, 'soul')]});
      }
    });
    collector.on('end', collected => msg.reactions.removeAll().catch(catchErr));
  } catch (error) {
    console.log(error)
  }       
};

const sendThumbnail = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };
  try {       
    const msg = await message.channel.send({embeds:[getThumbnailEmbed(unit, 'normal')]});
    await msg.react(normalReaction).catch(catchErr);
    await msg.react(awakenReaction).catch(catchErr);
    const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
    collector.on('collect', r => {
      if (r.emoji.name === normalReaction) {
        msg.edit({embeds:[getThumbnailEmbed(unit, 'normal')]});
      }
      if (r.emoji.name === awakenReaction) {
        msg.edit({embeds:[getThumbnailEmbed(unit, 'awaken')]});
      }
    });
    collector.on('end', collected => msg.reactions.removeAll().catch(catchErr));
  } catch (error) {
    console.log(error)
  }     
};

const sendArt = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };
  try {       
    const msg = await message.channel.send({embeds:[getArtEmbed(unit, 'normal')]});
    await msg.react(normalReaction).catch(catchErr);
    await msg.react(awakenReaction).catch(catchErr);
    const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
    collector.on('collect', r => {
      if (r.emoji.name === normalReaction) {
        msg.edit({embeds:[getArtEmbed(unit, 'normal')]});
      }
      if (r.emoji.name === awakenReaction) {
        msg.edit({embeds:[getArtEmbed(unit, 'awaken')]});
      }
    });
    collector.on('end', collected => msg.reactions.removeAll().catch(catchErr));
  } catch (error) {
    console.log(error)
  }     
};

const sendAlt = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };
  try {       
    const msg = await message.channel.send({embeds:[getArtEmbed(unit, 'awaken')]});
    await msg.react(normalReaction).catch(catchErr);
    await msg.react(awakenReaction).catch(catchErr);
    const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
    collector.on('collect', r => {
      if (r.emoji.name === normalReaction) {
        msg.edit({embeds:[getArtEmbed(unit, 'normal')]});
      }
      if (r.emoji.name === awakenReaction) {
        msg.edit({embeds:[getArtEmbed(unit, 'awaken')]});
      }
    });
    collector.on('end', collected => msg.reactions.removeAll().catch(catchErr));
  } catch (error) {
    console.log(error)
  }     
};

const sendTitle = async (unit, message) => {
  message.channel.send({embeds:[getTitleEmbed(unit)]});
};

const searchCharByName = chara => {
  var result = data.chars.filter(function (item) {
    if (typeof item.DevNicknames !== 'undefined') {
      if (item.DevNicknames.toLowerCase() === chara) {
        return true;
      }
    }
  });
  if (result.length <= 0) {
    // Search exact match first
    result = data.chars.filter(function (item) {
      let res;
      if (res != true) {
        if (getShortENName(item['ENName']).split(' ')[0].toLowerCase() === chara) {
          res = true;
        }
        if (item['JPName'] === chara) {
          res = true;
        }
        if (typeof item.OtherCommonNames !== 'undefined') {
          const ocns = item.OtherCommonNames.split(',');
          for (let i in ocns) {
            const n = ocns[i];
            if (n.trim().toLowerCase() === chara) {
              res = true;
              break;
            }
          }
        }
      }
      return res
    });
  }
  if (result.length <= 0) {
    result = data.chars.filter(function (item) {
      let res;
      if (res != true) {
        if (item.ENName.toLowerCase().indexOf(chara) !== -1) {
          res = true;
        }
        if (item.JPName.toLowerCase().indexOf(chara) !== -1) {
          res = true;
        }
        if (typeof item.OtherCommonNames !== 'undefined') {
          if (item.OtherCommonNames.toLowerCase().indexOf(chara.toLowerCase()) !== -1) {
            res = true;
          }
        }
      }
      return res
    });
  }
  return result;
};

const searchEquipByName = chara => {
  var result = data.equips.filter(function (item) {
    if (typeof item.DevNicknames !== 'undefined') {
      if (item.DevNicknames.toLowerCase() === chara) {
        return true;
      }
    }
  });
  if (result.length <= 0) {

    result = data.equips.filter(function (item) {
      var res;
      if (res != true) {
        if (item.ENName.toLowerCase().indexOf(chara) !== -1) {
          res = true;
        }
        if (item.JPName.toLowerCase().indexOf(chara) !== -1) {
          res = true;
        }
        if (typeof item.OtherCommonNames !== 'undefined') {
          if (item.OtherCommonNames.toLowerCase().indexOf(chara) !== -1) {
            res = true;
          }
        }
      }
      return res
    });
  }
  return result;
};

const searchTitle = chara => {
  var result = data.titles.filter(function (item) {
    if (typeof item.DevNicknames !== 'undefined') {
      if (item.DevNicknames.toLowerCase() === chara) {
        return true;
      }
    }
  });
  if (result.length <= 0) {

    result = data.titles.filter(function (item) {
      var res;
      if (res != true) {
        if (item.JPName.toLowerCase().indexOf(chara.toLowerCase()) !== -1) {
          res = true;
        }
        if (item.ENName.toLowerCase().indexOf(chara.toLowerCase()) !== -1) {
          res = true;
        }
        if (item.Condition.toLowerCase().indexOf(chara.toLowerCase()) !== -1) {
          res = true;
        }
        if (typeof item.OtherCommonNames !== 'undefined') {
          if (item.OtherCommonNames.toLowerCase().indexOf(chara.toLowerCase()) !== -1) {
            res = true;
          }
        }
      }
      return res
    });
  }
  return result;
};

const filterChar = (origin, cond) => {
  let lambda = null;
  switch (cond) {
    // Elements, most used so make one/two alphabets shortcut
    case 'f':
    case 'fi':
    case 'fire':
      lambda = char => char.Attribute === 'Fire'
      break;
    case 'w':
    case 'wa':
    case 'water':
      lambda = char => char.Attribute === 'Water'
      break;
    case 'i':
    case 'wi':
    case 'wind':
      lambda = char => char.Attribute === 'Wind'
      break;
    case 't':
    case 'th':
    case 'thunder':
      lambda = char => char.Attribute === 'Thunder'
      break;
    case 'l':
    case 'li':
    case 'light':
      lambda = char => char.Attribute === 'Light'
      break;
    case 'd':
    case 'da':
    case 'dark':
      lambda = char => char.Attribute === 'Dark'
      break;
    // Race
    case 'human':
    case 'sprite':
    case 'beast':
    case 'mecha':
    case 'dragon':
    case 'undead':
    case 'youkai':
    case 'plant':
    case 'demon':
    case 'aquatic':
      lambda = char => char['Race'].toLowerCase().indexOf(cond) >= 0;
      break;
    // PF type
    case 'sword':
    case 'bow':
    case 'fist':
    case 'support':
    case 'special':
      lambda = char => char['Role'].toLowerCase() === cond;
      break;
    // Gender
    case 'male':
    case 'female':
    case 'unknown':
    case 'lily':
      lambda = char => char['Gender'].toLowerCase() === cond;
      break;
  }
  // Skill wait
  if (/^s[wc](>|<|==|>=|<=)\d+$/.test(cond)) {
    lambda = char => eval(char['SkillWait'] + cond.slice(2));
  }
  // Rarity
  const r = cond.match(/^(\d+)\*$/);
  if (r != null) {
    lambda = char => {
      for (let i = 0; i < r[1].length; i++) {
        if (parseInt(char['Rarity']) === parseInt(r[1].charAt(i))) {
          return true;
        }
      }
      return false;
    }
  }

  if (lambda == null) {
    return null;
  }

  return origin.filter(function (char) {
    return lambda(char);
  });
};

const filterCharByText = (origin, text, options) => {
  return origin.filter(function (char) {
    const exclude = !!options['exclude'];
    const fields = options['fields'];
    if (fields.length === 0) {
      fields.push(...['LeaderBuff', 'Skill']);
      for (let i = 1; i <= 6; i++) {
        fields.push('Ability' + i);
      }
    }
    if (options.regexp) {
      for (let f in fields) {
        const field = char[fields[f]];
        try {
          if (new RegExp(text).test(field.toLowerCase())) {
            return !exclude;
          }
        } catch (err) {
          console.log(err.stack)
          return null;
        }
      }
    } else {
      for (let f in fields) {
        const field = char[fields[f]];
        if (field.toLowerCase().indexOf(text) >= 0) {
          return !exclude;
        }
      }
    }
    return exclude;
  });
};


const filterEquip = (origin, cond) => {
  let lambda = null;
  switch (cond) {
    // Elements, most used so make one/two alphabets shortcut
    case 'f':
    case 'fi':
    case 'fire':
      lambda = char => char.Attribute === 'Fire'
      break;
    case 'w':
    case 'wa':
    case 'water':
      lambda = char => char.Attribute === 'Water'
      break;
    case 'i':
    case 'wi':
    case 'wind':
      lambda = char => char.Attribute === 'Wind'
      break;
    case 't':
    case 'th':
    case 'thunder':
      lambda = char => char.Attribute === 'Thunder'
      break;
    case 'l':
    case 'li':
    case 'light':
      lambda = char => char.Attribute === 'Light'
      break;
    case 'd':
    case 'da':
    case 'dark':
      lambda = char => char.Attribute === 'Dark'
      break;
  }
  // Rarity
  const r = cond.match(/^(\d+)\*$/);
  if (r != null) {
    lambda = char => {
      for (let i = 0; i < r[1].length; i++) {
        if (parseInt(char['Rarity']) === parseInt(r[1].charAt(i))) {
          return true;
        }
      }
      return false;
    }
  }

  if (lambda == null) {
    return null;
  }

  return origin.filter(function (char) {
    return lambda(char);
  });
};

const filterEquipByText = (origin, text, options) => {
  return origin.filter(function (char) {
    const exclude = !!options['exclude'];
    const fields = []; /*options['fields'];*/
    if (fields.length === 0) {
      fields.push(...['WeaponSkill', 'AwakenLv3', 'AwakenLv5']);
    }
    if (options.regexp) {
      for (let f in fields) {
        const field = char[fields[f]];
        try {
          if (new RegExp(text).test(field.toLowerCase())) {
            return !exclude;
          }
        } catch (err) {
          console.log(err.stack)
          return null;
        }
      }
    } else {
      for (let f in fields) {
        const field = char[fields[f]];
        if (field.toLowerCase().indexOf(text) >= 0) {
          return !exclude;
        }
      }
    }
    return exclude;
  });
};

const extractTextFilterOption = (options, arg) => {
  switch (arg) {
    case 'leader':
    case 'lb':
      options['fields'].push('LeaderBuff');
      return true;
    case 'skill':
    case 's':
      options['fields'].push('Skill');
      return true;
    case 'ability':
    case 'abi':
    case 'ab':
    case 'a':
      for (let i = 1; i <= 6; i++) {
        options['fields'].push('Ability' + i);
      }
      return true;
    case 'unison':
    case 'u':
    case 'sub':
      options['fields'].push('Skill');
      for (let i = 1; i <= 6; i++) {
        if (i === 3) continue;
        options['fields'].push('Ability' + i);
      }
      return true;
    case 'exclude':
    case 'ex':
    case 'not':
      options['exclude'] = true;
      return true;
    case 'regexp':
    case 're':
    case 'r':
      options['regexp'] = true;
      return true;
    case 'reset':
      options['fields'] = [];
      delete options['exclude'];
      delete options['regexp'];
      return true;
  }
  const r = arg.match(/^ab?(\d+)$/);
  if (r != null) {
    for (let i = 0; i < r[1].length; i++) {
      options['fields'].push('Ability' + r[1].charAt(i));
    }
    return true;
  }
  return false;
};



const guide = {
  name: 'guide',
  group,
  aliases: ['g', 'beginner'],
  description: 'Links LilyCat\'s Beginner Progression Guide.',
  execute(message) {
    const guideLink = 'https://docs.google.com/document/d/1gParEsz_GsETHyjunJ9mBz7tgKfkUOmueopR4UUp274';
    return message.channel.send(`The Beginner Progression Guide can be found here:\n${guideLink}`);
  },
};

const tls = {
  name: 'translations',
  group,
  aliases: ['tl', 'translation'],
  description: "Link to Eliya Bot's translation webapp",
  execute(message) {
    const tlDocLink = 'http://eliya-bot.herokuapp.com/list';
    return message.channel.send(`The translation webapp can be found here:\n${tlDocLink}`);
  },
};

function getTimeUntil(diff) {
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);
  const hours = Math.floor(diff / 1000 / 60 / 60 - (days * 24));
  const minutes = Math.floor(diff / 1000 / 60 % 60);
  var timeUntil = '';
  if (days > 100){
    timeUntil = 'Unspecified'
  }else{
    if (days > 0) {
      timeUntil += days + 'd';
    }
    if (hours > 0 || days > 0) {
      timeUntil += hours + 'h';
    }
    if (minutes > 0 || hours > 0 || days > 0) {
      timeUntil += minutes + 'm';
    }
  }
  return timeUntil;
}

const event = {
  name: 'event',
  group,
  aliases: ['ev', 'events'],
  description: 'Lists ongoing/upcoming events.',
  execute(message) {
    var ongoingList = '';
    var upcomingList = '';
    for (i = 0; i < data.events.length; i++) {
      const event = data.events[i];
      var aLength = 40 - event.ENName.length;
      var start = moment.tz(event.Start, "Asia/Tokyo");
      var end = moment.tz(event.End, "Asia/Tokyo");
      var now = moment.tz("Asia/Tokyo");

      if (end.isAfter(now)) {

        if (aLength < 0) {
          aLength = 0
        }
        
        if (start.isBefore(now)) {
          timeUntil = getTimeUntil(end.format("x") - now.format("x"));
          if (event.Type != "Banner") {
            ongoingList += event.ENName + '\n+ End : ' + ((event.End!=='2099-12-31')?event.End:'') + ' (' + timeUntil + ")\n";
          }
        } else {
          timeUntil = getTimeUntil(start.format("x") - now.format("x"));
          if (event.Type != "Banner") {
            upcomingList += event.ENName + '\n+ Start : ' + event.Start + ' (' + timeUntil + ")\n";
          }
        }
      }
    }
    var msg = new Discord.MessageEmbed();

    if (ongoingList.length > 0) {
      msg.addFields({name: "Ongoing Events", value: "```diff\n" + ongoingList + "```"});
    } else {
      msg.addFields({name: "Ongoing Events", value: "```diff\nNo ongoing event```"})
    }
    if (upcomingList.length > 0) {
      msg.addFields({name: "Upcoming Events", value: "```diff\n" + upcomingList + "```"})
    } else {
      msg.addFields({name: "Upcoming Events", value: "```diff\nNo upcoming event```"})
    }

    return message.channel.send({embeds:[msg]});
  },
};
const gacha = {
  name: 'gacha',
  group,
  aliases: ['b', 'bn', 'banner', 'banners'],
  description: 'Lists ongoing/upcoming pick-up banner.',
  execute(message) {
    var ongoingBannerList = '';
    var upcomingBannerList = '';
    for (i = 0; i < data.events.length; i++) {
      const event = data.events[i];
      var aLength = 40 - event.ENName.length;
      var start = moment.tz(event.Start, "Asia/Tokyo");
      var end = moment.tz(event.End, "Asia/Tokyo");
      var now = moment.tz("Asia/Tokyo");

      if (end.isAfter(now)) {

        if (aLength < 0) {
          aLength = 0
        }
        
        if (start.isBefore(now)) {
          timeUntil = getTimeUntil(end.format("x") - now.format("x"));
          if (event.Type == "Banner") {
            ongoingBannerList += event.ENName + '\n+ End : ' + ((event.End!=='2099-12-31')?event.End:'') + ' (' + timeUntil + ")\n";
          }
        } else {
          timeUntil = getTimeUntil(start.format("x") - now.format("x"));
          if (event.Type == "Banner") {
            upcomingBannerList += event.ENName + '\n+ Start : ' + event.Start + ' (' + timeUntil + ")\n";
          }
        }
      }
    }
    var msg = new Discord.MessageEmbed();

    if (ongoingBannerList.length > 0) {
      msg.addFields({name: "Ongoing Banners", value: "```diff\n" + ongoingBannerList + "```"});
    } else {
      msg.addFields({name: "Ongoing Banners", value: "```diff\nNo ongoing pick-up banner```"})
    }
    if (upcomingBannerList.length > 0) {
      msg.addFields({name: "Upcoming Banners", value: "```diff\n" + upcomingBannerList + "```"})
    } else {
      msg.addFields({name: "Upcoming Banners", value: "```diff\nNo upcoming pick-up banner```"})
    }

    return message.channel.send({embeds:[msg]});
  },
};
const tracker = {
  name: 'tracker',
  group,
  aliases: ['tr', 'track'],
  description: 'Links Collection Tracker.',
  execute(message) {
    const tlDocLink = 'http://eliya-bot.herokuapp.com/';
    return message.channel.send(`The collection tracker can be found below. Fill in both your units and weapons here for teambuilding advice: \n${tlDocLink}`);
  },
};
const character = {
  name: 'character',
  group,
  args: true,
  usage: '<chara name>',
  aliases: ['c', 'char'],
  description: 'Lists information about the given character.',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
    if (chara == 'malte') {
      sendEquip(searchEquipByName(chara)[0], message);
    } else {

      var arrFound = searchCharByName(chara);

      if (arrFound.length === 0) {
        return message.channel.send('No character found!');
      }
      if (arrFound.length > 30) {
        return message.channel.send(arrFound.length + ' found! Please narrow your search');
      }
      if (arrFound.length === 1) {
        sendMessage(arrFound[0], message);
      } else {
        sendList(arrFound, message, 'c');
      }
    }
  },
};

const equipment = {
  name: 'equipment',
  group,
  args: true,
  usage: '<equipment name>',
  aliases: ['e', 'equip'],
  description: 'Lists information about the given equipment.',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    } else {
      var arrFound = searchEquipByName(chara);

      if (arrFound.length === 0) {
        return message.channel.send('No equipment found!');
      }
      if (arrFound.length > 30) {
        return message.channel.send(arrFound.length + ' found! Please narrow your search');
      }
      if (arrFound.length === 1) {
        sendEquip(arrFound[0], message);
      } else {
        sendList(arrFound, message, 'e');
      }
    }
  },
};

const race = {
  name: 'race',
  group,
  args: true,
  usage: '<chara race>',
  aliases: ['r'],
  description: 'Lists characters with the given race.',
  async execute(message, args) {
    const race = args.length ? args.join(' ').toLowerCase() : null;
    if (race.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }

    var arrFound = data.chars.filter(function (item) {
      return item.Race.toLowerCase().indexOf(race) !== -1;
    });

    if (arrFound.length === 0) {
      return message.channel.send('No character found!');
    }
    if (arrFound.length > 40) {
      return message.channel.send(arrFound.length + ' found! Please narrow your search');
    }
    if (arrFound.length === 1) {
      sendMessage(arrFound[0], message);
    } else {
      sendList(arrFound, message, 'c');
    }

  },
};

const whois = {
  name: 'whois',
  group,
  args: true,
  usage: '<chara thumbnail>',
  aliases: ['w', 'tn'],
  description: 'Show thumbnail of the character',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;

    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
    if (chara == 'malte') {
      sendEquip(searchEquipByName(chara)[0], message);
    } else {
      var arrFound = searchCharByName(chara);

      if (arrFound.length === 0) {
        return message.channel.send('No character found!');
      }
      if (arrFound.length > 30) {
        return message.channel.send(arrFound.length + ' found! Please narrow your search');
      }
      if (arrFound.length === 1) {
        sendThumbnail(arrFound[0], message);
      } else {
        sendList(arrFound, message, 'w');
      }
    }
  },
};

const art = {
  name: 'art',
  group,
  args: true,
  usage: '<chara art>',
  aliases: ['a'],
  description: 'Show full art of the character',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
    var arrFound = searchCharByName(chara);

    if (arrFound.length === 0) {
      return message.channel.send('No character found!');
    }
    if (arrFound.length > 30) {
      return message.channel.send(arrFound.length + ' found! Please narrow your search');
    }
    if (arrFound.length === 1) {
      sendArt(arrFound[0], message);
    } else {
      sendList(arrFound, message, 'art');
    }
  },
};
const alt = {
  name: 'alt',
  group,
  args: true,
  usage: '<chara alt>',
  aliases: ['al'],
  description: 'Show alternate art of the character',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
    var arrFound = searchCharByName(chara);

    if (arrFound.length === 0) {
      return message.channel.send('No character found!');
    }
    if (arrFound.length > 30) {
      return message.channel.send(arrFound.length + ' found! Please narrow your search');
    }
    if (arrFound.length === 1) {
      sendAlt(arrFound[0], message);
    } else {
      sendList(arrFound, message, 'alt');
    }
  },
};

const title = {
  name: 'title',
  group,
  args: true,
  usage: '<title>',
  aliases: ['t'],
  description: 'Show title',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
    var arrFound = searchTitle(chara);

    if (arrFound.length === 0) {
      return message.channel.send('No character found!');
    }
    if (arrFound.length > 30) {
      return message.channel.send(arrFound.length + ' found! Please narrow your search');
    }
    if (arrFound.length === 1) {
      sendTitle(arrFound[0], message);
    } else {
      sendList(arrFound, message, 't');
    }
  },
};
const update = {
  name: 'update',
  group,
  usage: '<update>',
  description: 'Sync spreadsheet data',
  execute(message, args) {
    data = DB.getData();
    const axios = require('axios');
    axios.post('http://eliya-bot.herokuapp.com/update', {})
      .then((res) => {

      })
      .catch((error) => {
        console.error(error)
      })
    return message.channel.send('Database updated!');
  },
}

const filterCharacter = {
  name: 'filter-character',
  group,
  args: true,
  usage: '<filter conditions>',
  aliases: ['f', 'fc'],
  description: 'Filter characters by conditions',
  async execute(message, args) {
    let filtered = data.chars;
    let textFilterOptions = {
      fields: []
    };
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (extractTextFilterOption(textFilterOptions, arg)) {
        continue;
      }
      switch (arg) {
        case '-t':
        case '--text':
          if (i === args.length - 1) {
            return message.channel.send("Not enough argument for -t text search!");
          }
          i++;
          filtered = filterCharByText(filtered, args[i].toLowerCase(), textFilterOptions);
          break;
        default:
          const result = filterChar(filtered, args[i].toLowerCase());
          if (result == null) {
            filtered = filterCharByText(filtered, args[i].toLowerCase(), textFilterOptions);
          } else {
            filtered = result;
          }
          break;
      }
    }

    if (filtered.length === 0) {
      return message.channel.send('No character found!');
    }
    if (filtered.length > 30) {
      return message.channel.send(filtered.length + ' found! Please narrow your search');
    }
    if (filtered.length === 1) {
      await sendMessage(filtered[0], message);
    } else {
      await sendFastList(filtered, message, 'c');
    }
  },
};

const filterEquipment = {
  name: 'filter-equipment',
  group,
  args: true,
  usage: '<efilter conditions>',
  aliases: ['ef', 'fe'],
  description: 'Filter equipments by conditions',
  async execute(message, args) {
    let filtered = data.equips;
    let textFilterOptions = {
      fields: []
    };
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (extractTextFilterOption(textFilterOptions, arg)) {
        continue;
      }
      switch (arg) {
        case '-t':
        case '--text':
          if (i === args.length - 1) {
            return message.channel.send("Not enough argument for -t text search!");
          }
          i++;
          filtered = filterEquipByText(filtered, args[i].toLowerCase(), textFilterOptions);
          break;
        default:
          const result = filterEquip(filtered, args[i].toLowerCase());
          if (result == null) {
            filtered = filterEquipByText(filtered, args[i].toLowerCase(), textFilterOptions);
          } else {
            filtered = result;
          }
          break;
      }
    }

    if (filtered.length === 0) {
      return message.channel.send('No equipment found!');
    }
    if (filtered.length > 30) {
      return message.channel.send(filtered.length + ' found! Please narrow your search');
    }
    if (filtered.length === 1) {
      await sendMessage(filtered[0], message);
    } else {
      await sendFastList(filtered, message, 'e');
    }
  },
};

async function DBOperation(operation) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  try {
    const res = await client.query(operation)
    await client.end()
    return res;
  } catch (err) {
    await client.end()
    console.log(err.stack)
    return null;
  }
}

function validDungeon(name) {
  return DUNGEONS.includes(name)
}

function setRemove(originalSet, toBeRemovedSet) {
  toBeRemovedSet.forEach(Set.prototype.delete, originalSet);
}

const submit = {
  name: 'submit',
  group,
  args: true,
  usage: '<submit dungeon | description | team link>',
  aliases: ['s'],
  description: 'Submits a team to be viewed',
  async execute(message, args) {

    if (!process.env.DATABASE_URL) {
      return message.channel.send('Missing database for team data. The schema is provided in the repo ');
    }

    const desc = args.length == 3 ? args[1] : "No description";

    if (args.length < 2) {
      return message.channel.send('Entry too short please have a minimum of dungeon name and team link!');
    }
    if (args.length > 3) {
      return message.channel.send('Entry too long! Did you forget to wrap the description in quotes?');
    }

    // random url validator regex 
    ValidateURI = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    const URI = args.length == 3 ? args[2] : args[1]
    const url = ValidateURI.test(URI) ? new URL(URI) : null
    if (url == null) {
      return message.channel.send('Invalid Image URL');
    }
    if (url.host != 'eliya-bot.herokuapp.com' && url.host != 'veliya-bot.herokuapp.com') {
      return message.channel.send('Invalid Image URL');
    }

    if (!validDungeon(args[0].toLowerCase())) {
      return message.channel.send('Invalid Dungeon. Valid options are: ' + DUNGEONS.toString() + ' case insensitive');
    }

    const components = url.pathname.slice(6).split("-")
    // Unit Validation
    for (let i = 0; i < 6; i++) {
      let character = searchCharByName(components[i])
      if (character.length == 0 && components[i] != "blank") {
        return message.channel.send('Invalid unit: ' + components[i]);
      }
    }
    components[11] = components[11].split('.')[0]
    // Weapon Validation
    for (let i = 6; i < 12; i++) {
      let character = searchEquipByName(components[i])
      if (character.length == 0 && components[i] != "blank") {
        return message.channel.send('Invalid equipment: ' + components[i]);
      }
    }

    const queryString = `INSERT INTO TEAMS (dungeon, url, cards, unison, weapons, souls, creator, description) VALUES (\'${args[0].toLowerCase()}\',
    \'${URI}\',
    \'{${components[0]},${components[2]},${components[4]}}\', 
    \'{${components[1]},${components[3]},${components[5]}}\', 
    \'{${components[6]},${components[7]},${components[8]}}\', 
    \'{${components[9]},${components[10]},${components[11]}}\',${message.author.id}, '${desc}');`
    const res = await DBOperation(queryString)
    if (!res) {
      return message.channel.send('Team already exists for dungeon')
    }

    return message.channel.send('Team was submitted');
  },
};

const team = {
  name: 'team',
  group,
  args: true,
  usage: '<team dungeon>',
  aliases: ['te'],
  description: 'Pulls up submitted teams for a dungeon',
  async execute(message, args) {

    if (!process.env.DATABASE_URL) {
      return message.channel.send('Missing database for team data. The schema is provided in the repo ');
    }
    // For custom filters we increase the allowed length and implement custom logic
    if (args.length != 1) {
      return message.channel.send('Please enter just the dungeon name');
    }

    if (!validDungeon(args[0].toLowerCase())) {
      return message.channel.send('Invalid Dungeon. Valid options are: ' + DUNGEONS.toString());
    }

    const queryString = `SELECT * FROM teams WHERE dungeon = '${args[0].toLowerCase()}' ORDER BY voter_score DESC`
    const res = await DBOperation(queryString)
    if (!res) {
      return message.channel.send("No Teams Found")
    }
    for (let i of res.rows) {
      mainReal = []
      unisonReal = []
      for (let j of i.cards) {
        let unit = searchCharByName(j)
        mainReal.push(j != "blank" ? unit[0].ENName.split("\n")[1] : "blank")
      }
      for (let j of i.unison) {
        let unit = searchCharByName(j)
        unisonReal.push(j != "blank" ? unit[0].ENName.split("\n")[1] : "blank")
      }
      i.mainReal = mainReal
      i.unisonReal = unisonReal
    }

    const msg = await message.channel.send({ embeds: [getTeamListEmbed(res.rows, 0)] });
    await EditTeamList(res.rows, message.author.id, 0, msg);
  },
};


const sendTeam = async (team, msg) => {
  var final = new Discord.MessageEmbed()
    .setImage(team.url)
    .setDescription(team.description)
    .setTitle(team.dungeon)
    .setFooter(`Voter score: ${team.voter_score}`);

  msg.edit({ embeds: [final] })
  await msg.react("👍")
  await msg.react("👎")
  const voters = team.voters == null ? new Set() : new Set(team.voters)

  const filter = (reaction, user) => {
    return ["👍", "👎"].includes(reaction.emoji.name) && !voters.has(user.id);
  };

  const upvote = new Set()
  const downvote = new Set()
  const collector = msg.createReactionCollector({ filter, time: reactionExpiry });

  collector.on('collect', (r, user) => {
    if (r.emoji.name == "👍") {
      upvote.add(user.id)
    } else {
      downvote.add(user.id)
    }
  });

// Everyone who hasn't previously voted will have their votes applied
  collector.on('end', () => {
    setRemove(upvote, voters)
    setRemove(downvote, voters)
    const score = team.voter_score + upvote.size - downvote.size
    const newVoters = new Set([...upvote, ...downvote, ...voters])
    const queryString = `UPDATE teams set  voters= '{${Array.from(newVoters)}}', voter_score = ${score} where id = '${team.id}'`
    msg.reactions.removeAll().catch(catchErr);
    // This may potentially fail? Only result would be the votes not getting counted
    DBOperation(queryString)
  });
};

// Can send filtered search here 
const getTeamListEmbed = (datum, current) => {
  var msg = new Discord.MessageEmbed()
    .setTitle('Results Page ' + (current / 5 + 1))
  for (let i = 0 + current; i <= datum.length - 1 && i < 5 + current; i++) {
    msg.addField(i + 1 - current + ": " + datum[i].mainReal[0] + " " + datum[i].mainReal[1] + " " + datum[i].mainReal[2],
      datum[i].unisonReal[0] + " " + datum[i].unisonReal[1] + " " + datum[i].unisonReal[2] + " ")
  }
  return msg;
};


const EditTeamList = async (datum, message, current, msg) => {
// Build array of valid reactions for the menu
  let validReactions = []
    for (let i = 0; i <= datum.length - (current+1) && i < 5; i++) {
      validReactions.push(numberReactions[i]);
    }


  if (current > 0) {
    validReactions.push(LEFT)
  }
  if (datum.length - current > 5) {
    validReactions.push(RIGHT)
  }

  const filter = (reaction, user) => {
    return validReactions.includes(reaction.emoji.name) && user.id === message;
  };
  msg.edit({ embeds: [getTeamListEmbed(datum, current)] })


  for (let i = 0; i < validReactions.length; i++) {
    await msg.react(validReactions[i]);
  }

  // Timeout detection for removing emotes
  let acted = false
  // Single use collector for caller
  const collector = msg.createReactionCollector({ filter, time: reactionExpiry, max: 1 });
  collector.on('collect', r => {
    acted = true
    if (r.emoji.name === RIGHT) {
      msg.reactions.removeAll();
      EditTeamList(datum, message, current + 5, msg)
    }
    if (r.emoji.name === LEFT) {
      msg.reactions.removeAll().catch(catchErr);;
      EditTeamList(datum, message, current - 5, msg)
    }
    const num = datum.length < 5 ? datum.length : 5
    for (let i = 0; i < num; i++) {
      if (r.emoji.name === numberReactions[i]) {
        msg.reactions.removeAll().catch(catchErr);;
        sendTeam(datum[i + current], msg)
      }
    }
  });

  collector.on('end', () => {
    if (!acted) {
      msg.reactions.removeAll().catch(catchErr);
    }
  });

};

module.exports = [guide, tls, tracker, event, gacha, character, equipment,
  race, whois, art, alt, update, filterCharacter, filterEquipment, submit, team];
