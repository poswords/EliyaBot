const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const DB = require('../data')
var data = DB.getData();
const moment = require('moment-timezone');
const assetPath = 'http://eliya-bot.herokuapp.com/img/assets/';
const group = path.parse(__filename).name;

const getInfoEmbed = (unit, flag)  => {
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
      + '\n**Leader Buff: **' + unit.LeaderBuff
      + '\n**Skill: **' + unit.Skill)
    .addField('Ability 1', unit.Ability1, true)
    .addField('Ability 2', unit.Ability2, true)
    .addField('Ability 3', unit.Ability3, true)
    .setFooter(footer);
	if (flag == 'awaken'){
    	msg.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_1.png')   		
	}else{
		msg.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_0.png')
	}		
  return msg;
};

const getEquipEmbed = (unit, flag) => {
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');	
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription('**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity
      + '\n**Weapon Skill: **' + unit.WeaponSkill)
    .addField('Obtain', unit.Obtain, true)
    .setFooter(unit.DevNicknames);
	if (flag == 'soul'){
    	msg.setThumbnail(assetPath + 'item/equipment/' + unit.DevNicknames + '_soul.png')   		
	}else{
		msg.setThumbnail(assetPath + 'item/equipment/' + unit.DevNicknames + '.png') 
	}	
  return msg;
}; 

const getThumbnailEmbed =(unit, flag) => {
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
	console.log(flag);
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription('**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity)
  	.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_0.png')  	
	.setFooter(unit.DevNicknames);
	if (flag == 'awaken'){
    	msg.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_1.png')   		
	}else{
		msg.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_0.png')
	}			
  return msg;
};

const getArtEmbed = (unit, flag)=> {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setFooter(unit.DevNicknames);
	if (flag == 'awaken'){
    	msg.setImage(assetPath + 'chars/' + unit.DevNicknames + '/full_shot_1.png')  		
	}else{
		msg.setImage(assetPath + 'chars/' + unit.DevNicknames + '/full_shot_0.png')  
	}		
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


const reactionExpiry = 30000;
const normalReaction = '🙂';
const awakenReaction = '😤';
const weaponReaction = '⚔️';	
const soulReaction = '📀';	
const sendMessage = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };	
  const msg = await message.channel.send(getInfoEmbed(unit, 'normal'));	
  await msg.react(normalReaction);
  await msg.react(awakenReaction);  
  const collector = msg.createReactionCollector(filter, { max: 10, time: reactionExpiry });  
  collector.on('collect', r => {
    if (r.emoji.name === normalReaction) {
      msg.edit(getInfoEmbed(unit, 'normal'));
    }
    if (r.emoji.name === awakenReaction) {
      msg.edit(getInfoEmbed(unit, 'awaken'));
    }
  });	
  collector.on('end', collected => msg.reactions.removeAll());
};

const sendEquip= async (unit, message) => {
  const filter = (reaction, user) => {
    return [weaponReaction, soulReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };	
  const msg = await message.channel.send(getEquipEmbed(unit, 'icon'));	
  await msg.react(weaponReaction);
  await msg.react(soulReaction);
  const collector = msg.createReactionCollector(filter, { max: 10, time: reactionExpiry });  
  collector.on('collect', r => {
    if (r.emoji.name === weaponReaction) {
      msg.edit(getEquipEmbed(unit, 'icon'));
    }
    if (r.emoji.name === soulReaction) {
      msg.edit(getEquipEmbed(unit, 'soul'));
    }
  });	
  collector.on('end', collected => msg.reactions.removeAll());	
};

const sendThumbnail = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };	
  const msg = await message.channel.send(getThumbnailEmbed(unit, 'normal'));	
  await msg.react(normalReaction);
  await msg.react(awakenReaction);  
  const collector = msg.createReactionCollector(filter, { max: 10, time: reactionExpiry });  
  collector.on('collect', r => {
    if (r.emoji.name === normalReaction) {
      msg.edit(getThumbnailEmbed(unit, 'normal'));
    }
    if (r.emoji.name === awakenReaction) {
      msg.edit(getThumbnailEmbed(unit, 'awaken'));
    }
  });	
  collector.on('end', collected => msg.reactions.removeAll());	
};

const sendArt = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };	
  const msg = await message.channel.send(getArtEmbed(unit, 'normal'));	
  await msg.react(normalReaction);
  await msg.react(awakenReaction);  
  const collector = msg.createReactionCollector(filter, { max: 10, time: reactionExpiry });  
  collector.on('collect', r => {
    if (r.emoji.name === normalReaction) {
      msg.edit(getArtEmbed(unit, 'normal'));
    }
    if (r.emoji.name === awakenReaction) {
      msg.edit(getArtEmbed(unit, 'awaken'));
    }
  });	
  collector.on('end', collected => msg.reactions.removeAll());	
};

const sendAlt = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };	
  const msg = await message.channel.send(getArtEmbed(unit, 'awaken'));	
  await msg.react(normalReaction);
  await msg.react(awakenReaction);  
  const collector = msg.createReactionCollector(filter, { max: 10, time: reactionExpiry });  
  collector.on('collect', r => {
    if (r.emoji.name === normalReaction) {
      msg.edit(getArtEmbed(unit, 'normal'));
    }
    if (r.emoji.name === awakenReaction) {
      msg.edit(getArtEmbed(unit, 'awaken'));
    }
  });
  collector.on('end', collected => msg.reactions.removeAll());	
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
function getTimeUntil(diff){
	const days =  Math.floor(diff/1000/ 60 / 60 / 24);
	const hours =  Math.floor(diff/1000/ 60 / 60 - (days *24));
	const minutes = Math.floor(diff/1000/60%60);
	var timeUntil = '';
	if (days > 0){
		timeUntil+= days+'d';
	}
	if (hours > 0 || days > 0){
		timeUntil+= hours+'h';
	}
	if (minutes >0 || hours > 0 || days > 0){
		timeUntil+= minutes+'m';
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
	for (i=0; i<data.events.length;i++){
		const event = data.events[i];
		var aLength=40-event.ENName.length;
		var start = moment.tz(event.Start, "Asia/Tokyo");
		var end = moment.tz(event.End, "Asia/Tokyo");
		var now = moment.tz("Asia/Tokyo");

		if (end.isAfter(now)){

			if (aLength<0) {aLength=0};
			if (start.isBefore(now)){
				timeUntil = getTimeUntil(end.format("x")-now.format("x"));
				ongoingList += event.ENName+'\n+ End : '+event.End+' ('+timeUntil+")\n";
			}else{
				timeUntil = getTimeUntil(start.format("x")-now.format("x"));
				upcomingList += event.ENName+'\n+ Start : '+event.Start+' ('+timeUntil+")\n";
			}
		}
	}
	  /*
	var msg = '```diff\n- Ongoing Events -\n'+ongoingList+'```';
	if (upcomingList.length > 0){
		msg += '```diff\n- Upcoming Events -\n'+upcomingList+'```';
	}
    return message.channel.send(msg);*/
	var msg = new Discord.MessageEmbed()
    .addFields({name:"Ongoing Events", value: "```diff\n"+ongoingList+"```"})
	.addFields({name:"Upcoming Events", value: "```diff\n"+upcomingList+"```"})
    return message.channel.send(msg);	  
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
	  /*console.log(res)*/
	})
	.catch((error) => {
	  console.error(error)
	})
    return message.channel.send('Database updated!');
  },
}

module.exports = [guide, tls, tracker, event,character, equipment, race, whois, art, alt, update];