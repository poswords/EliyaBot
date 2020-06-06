const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const DB = require('../data')
var data = DB.getData();
const assetPath = 'http://eliya-bot.herokuapp.com/img/assets/';
const group = path.parse(__filename).name;

const getInfoEmbed = unit => {
  var footer = unit.Role + ' - ' + unit.Gender + ' - ' + unit.Race;
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  if (unit.DropLocation) {
    footer = footer + ' - ' + unit.DropLocation;
  }
  footer += '           ' + unit.DevNicknames
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription('**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity
      + '\n**Leader Skill: **' + unit.LeaderBuff
      + '\n**Active Skill: **' + unit.Skill)
    .addField('Ability 1', unit.Ability1, true)
    .addField('Ability 2', unit.Ability2, true)
    .addField('Ability 3', unit.Ability3, true)
    .setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_0.png')
    .setFooter(footer);
  return msg;
};

const getEquipEmbed = unit => {
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');	
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription('**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity
      + '\n**Weapon Skill: **' + unit.WeaponSkill)
    .addField('Obtain', unit.Obtain, true)
    .setThumbnail(assetPath + 'item/equipment/' + unit.DevNicknames + '.png')  
    .setFooter(unit.DevNicknames);
  return msg;
}; 

const getThumbnailEmbed = unit => {
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription('**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity)
    .setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_0.png')  
    .setFooter(unit.DevNicknames);
  return msg;
};

const getArtEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setImage(assetPath + 'chars/' + unit.DevNicknames + '/full_shot_0.png')
    .setFooter('!alt ' + unit.DevNicknames, 'https://cdn.discordapp.com/emojis/649164742988005378.png');
  return msg;

};

const getAltEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
.setImage(assetPath + 'chars/' + unit.DevNicknames + '/full_shot_1.png')  
    .setFooter('!art ' + unit.DevNicknames, 'https://cdn.discordapp.com/emojis/648800594940657684.png');
  return msg;

};

const getAnimationEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
  	.setImage(assetPath + 'chars/' + unit.DevNicknames + '/front.gif')  
    .setFooter(unit.DevNicknames);
  return msg;

};

const getSpecialEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
  	.setImage(assetPath + 'chars/' + unit.DevNicknames + '/special.gif')    
    .setFooter(unit.DevNicknames);
  return msg;
};

const sendMessage = async (unit, message) => {
  await message.channel.send(getInfoEmbed(unit))
};

const sendEquip= async (unit, message) => {
  await message.channel.send(getEquipEmbed(unit))
};

const sendThumbnail = async (unit, message) => {
  await message.channel.send(getThumbnailEmbed(unit))
};

const sendArt = async (unit, message) => {
  await message.channel.send(getArtEmbed(unit))
};

const sendAlt = async (unit, message) => {
  await message.channel.send(getAltEmbed(unit))
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

    result = data.chars.filter(function (item) {
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

const guide = {
  name: 'guide',
  group,
  aliases: ['g', 'beginner'],
  description: 'Links LilyCat\'s Beginner Progression Guide.',
  execute(message) {
    const guideLink = 'https://docs.google.com/document/d/1kOxR6SSj7TB564OI4f-nZ-tX2JioyoBGEK_a498Swcc/edit';
    return message.channel.send(`The Beginner Progression Guide can be found here:\n${guideLink}`);
  },
};

const tls = {
  name: 'translations',
  group,
  aliases: ['tl', 'translation'],
  description: 'Links Doli\'s Translation Sheet.',
  execute(message) {
    const tlDocLink = 'https://docs.google.com/spreadsheets/d/1moWhlsmAFkmItRJPrhhi9qCYu8Y93sXGyS1ZBo2L38c/edit';
    return message.channel.send(`The main translation document can be found here:\n${tlDocLink}`);
  },
};

const tracker = {
  name: 'tracker',
  group,
  aliases: ['tr', 'track'],
  description: 'Links Collection Tracker.',
  execute(message) {
    const tlDocLink = 'http://eliya-bot.herokuapp.com/';
    return message.channel.send(`The collection tracker can be found here: \n${tlDocLink}`);
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
	if (chara == 'malte'){
	  sendEquip(searchEquipByName(chara)[0], message);
	}else{
		
		var arrFound = searchCharByName(chara);

		if (arrFound.length === 0) {
		  return message.channel.send('No character found!');
		}
		if (arrFound.length > 30) {
		  return message.channel.send(arrFound.length + 'found! Please narrow your search');
		}
		if (arrFound.length === 1) {
		  sendMessage(arrFound[0], message);
		} else {
		  message.channel.send('Found potential matches:\n```diff\n' + arrFound.map((char, index) => (`${parseInt(index, 10) + 1}: ${char.ENName} \n!c ${char.DevNicknames}`)).join('\n') + '```');
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
    }else{
		var arrFound = searchEquipByName(chara);

		if (arrFound.length === 0) {
		  return message.channel.send('No equipment found!');
		}
		if (arrFound.length > 30) {
		  return message.channel.send(arrFound.length + 'found! Please narrow your search');
		}
		if (arrFound.length === 1) {
		  sendEquip(arrFound[0], message);
		} else {
		  message.channel.send('Found potential matches:\n```diff\n' + arrFound.map((char, index) => (`${parseInt(index, 10) + 1}: ${char.ENName} \n!e ${char.DevNicknames}`)).join('\n') + '```');
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
      message.channel.send('Found matches:\n```diff\n' + arrFound.map((char, index) => (`${parseInt(index, 10) + 1}: ${char.ENName} \n!c ${char.DevNicknames}`)).join('\n') + '```');
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
	if (chara == 'malte'){
	  sendEquip(searchEquipByName(chara)[0], message);
	}else{
		var arrFound = searchCharByName(chara);

		if (arrFound.length === 0) {
		  return message.channel.send('No character found!');
		}
		if (arrFound.length > 30) {
		  return message.channel.send(arrFound.length + 'found! Please narrow your search');
		}
		if (arrFound.length === 1) {
		  sendThumbnail(arrFound[0], message);
		} else {
		  message.channel.send('Found potential matches:\n```diff\n' + arrFound.map((char, index) => (`${parseInt(index, 10) + 1}: ${char.ENName} \n!w ${char.DevNicknames}`)).join('\n') + '```');
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
      return message.channel.send(arrFound.length + 'found! Please narrow your search');
    }
    if (arrFound.length === 1) {
      sendArt(arrFound[0], message);
    } else {
      message.channel.send('Found potential matches:\n```diff\n' + arrFound.map((char, index) => (`${parseInt(index, 10) + 1}: ${char.ENName} \n!art ${char.DevNicknames}`)).join('\n') + '```');
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
      return message.channel.send(arrFound.length + 'found! Please narrow your search');
    }
    if (arrFound.length === 1) {
      sendAlt(arrFound[0], message);
    } else {
      message.channel.send('Found potential matches:\n```diff\n' + arrFound.map((char, index) => (`${parseInt(index, 10) + 1}: ${char.ENName} \n!alt ${char.DevNicknames}`)).join('\n') + '```');
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
	 axios.post('http://eliya-bot.herokuapp.com/update', {
	})
	.then((res) => {
	  console.log(res)
	})
	.catch((error) => {
	  console.error(error)
	})
    return message.channel.send('Database updated!');
  },
}
/*${char.Rarity}${char.Attribute.substring(0,2).toUpperCase()}*/

module.exports = [guide, tls, tracker,character, equipment, race, whois, art, alt, update];
