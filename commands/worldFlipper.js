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
/*  const imagePath = assetPath + 'chars/' + unit.DevNicknames + '/square_0.png'
  if (fs.existsSync(imagePath)) {
    msg.attachFiles([imagePath])
      .setThumbnail('attachment://square_0.png');
  }*/
  return msg;
};

const getWeaponEmbed = unit => {
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');	
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription('\n**Rarity: **' + rarity
      + '\n**Weapon Skill: **' + unit.WeaponSkill)
    .addField('Obtain', unit.Obtain, true)
    .setFooter(unit.Notes);
/*  const imagePath = assetPath + 'equips/' + unit.DevNicknames + '/square_0.png'
  if (fs.existsSync(imagePath)) {
    msg.attachFiles([imagePath])
      .setThumbnail('attachment://square_0.png');
  }*/
  return msg;
}; 

const getThumbnailEmbed = unit => {
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription('**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity)
    .setFooter(unit.DevNicknames);
  const imagePath = assetPath + '/chars/' + unit.DevNicknames + '/square_0.png'
  if (fs.existsSync(imagePath)) {
    msg.attachFiles([imagePath])
      .setThumbnail('attachment://square_0.png');
  }
  return msg;
};

const getArtEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setFooter('!alt ' + unit.DevNicknames, 'https://cdn.discordapp.com/emojis/649164742988005378.png');
  const imagePath = assetPath + 'chars/' + unit.DevNicknames + '/full_shot_0.png'
  if (fs.existsSync(imagePath)) {
    msg.attachFiles([imagePath])
      .setImage('attachment://full_shot_0.png');
  } else {
    msg.setDescription('No full art yet')
  }
  return msg;

};

const getAltEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setFooter('!art ' + unit.DevNicknames, 'https://cdn.discordapp.com/emojis/648800594940657684.png');
  const imagePath = assetPath + 'chars/' + unit.DevNicknames + '/full_shot_1.png'
  if (fs.existsSync(imagePath)) {
    msg.attachFiles([imagePath])
      .setImage('attachment://full_shot_1.png');
  } else {
    msg.setDescription('No awakened art yet')
  }
  return msg;

};

const getAnimationEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setFooter(unit.DevNicknames);
  const imagePath = assetPath + 'chars/' + unit.DevNicknames + '/front.gif'
  if (fs.existsSync(imagePath)) {
    msg.attachFiles([imagePath])
      .setImage('attachment://front.gif');
  } else {
    msg.setDescription('No idle animation yet')
  }
  return msg;

};

const getSpecialEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setFooter(unit.DevNicknames);
  const imagePath = assetPath + 'chars/' + unit.DevNicknames + '/special.gif'
  if (fs.existsSync(imagePath)) {
    msg.attachFiles([imagePath])
      .setImage('attachment://special.gif');
  } else {
    msg.setDescription('No special animation yet')
  }
  return msg;

};

const sendMessage = async (unit, message) => {
  await message.channel.send(getInfoEmbed(unit))
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

const sendMalte = async (message)=>{
  const unit = {
	  ENName:'Malte',
	  JPName:'マルテ',
	  Rarity: 5,
	  WeaponSkill:'When entire party has penetration effect, self attack +280%',
	  Obtain:"This is not a unit. It's a weapon you get from Heart Scroll Trade-in. You can get heart scroll by maxing mana boards",
	  Notes:"This is the only weapon in the bot database due to high number of people wanting to know wtf is Malte",
	  DevNicknames:'general/spear_0005'
  }
  await message.channel.send(getWeaponEmbed(unit))	
}

const searchByName = chara => {
  var result = data.filter(function (item) {
    if (typeof item.DevNicknames !== 'undefined') {
      if (item.DevNicknames.toLowerCase() === chara) {
        return true;
      }
    }
  });
  if (result.length <= 0) {

    result = data.filter(function (item) {
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
	  sendMalte(message);
	}else{
		
		var arrFound = searchByName(chara);

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

    var arrFound = data.filter(function (item) {
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
	  sendMalte(message);
	}else{
		var arrFound = searchByName(chara);

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
    var arrFound = searchByName(chara);

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
    var arrFound = searchByName(chara);

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
    return message.channel.send('Database updated!');
  },
}
/*${char.Rarity}${char.Attribute.substring(0,2).toUpperCase()}*/

module.exports = [guide, tls, character, race, whois, art, alt, update];
