const path = require('path');
const Discord = require('discord.js');
const data = require('../data').getData();

const group = path.parse(__filename).name;

const getInfoEmbed = unit => {
  var	 footer = unit.Role + ' - ' +unit.Gender + ' - ' +unit.Race ;
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  if (unit.DropLocation ){
	  footer = footer + ' - ' +unit.DropLocation;
  }
  footer += '           ' + unit.DevNicknames
  return new Discord.MessageEmbed()
		.setTitle(unit.ENName + ' ' + unit.JPName)
		.setDescription('**Attribute: **' + unit.Attribute
		  + '\n**Leader Skill: **' + unit.LeaderBuff
		  + '\n**Active Skill: **' + unit.Skill
		  + '\n**Rarity: **' + rarity)
		.addField('Ability 1', unit.Ability1, true)
		.addField('Ability 2', unit.Ability2, true)
		.addField('Ability 3', unit.Ability3, true)
		.setFooter(footer);
};

const sendMessage = async (unit, message) => {
	await message.channel.send(getInfoEmbed(unit))
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
	console.log(data);
	var arrFound = data.filter(function(item) {
		var res; 
		if (typeof item.DevNicknames!== 'undefined'){
			if (item.DevNicknames.toLowerCase() == chara ){
				return true;
			}
		}
		
		if (item.ENName.toLowerCase().indexOf(chara) !== -1 ){
			res = true;			
		}
		if (typeof item.OtherCommonNames!== 'undefined'){
			if(item.OtherCommonNames.toLowerCase().indexOf(chara) !== -1){
				res = true;	
			}
		}

		return res
	});					

    if (arrFound.length === 0) {
      return message.channel.send('No character found!');
    }
	if (arrFound.length > 30) {
      return message.channel.send(arrFound.length + 'found! Please narrow your search');
    }	  
	if (arrFound.length === 1) {	 
	  sendMessage(arrFound[0], message);
	}else{
		message.channel.send('Found potential matches:\n```diff\n' + arrFound.map((char, index) => (`${parseInt(index, 10) + 1}: ${char.ENName} \n!c ${char.DevNicknames}`)).join('\n') + '```');
	}

  },
};

const race = {
  name: 'race',
  group,
  args: true,
  usage: '<chara race>',
  aliases: ['r', 'race'],
  description: 'Lists characters with the given race.',
  async execute(message, args) {
    const race = args.length ? args.join(' ').toLowerCase() : null;
    if (race.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
	
	var arrFound = data.filter(function(item) {
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
	}else{
		message.channel.send('Found matches:\n```diff\n' + arrFound.map((char, index) => (`${parseInt(index, 10) + 1}: ${char.ENName} \n!c ${char.DevNicknames}`)).join('\n') + '```');
	}

  },
};
/*${char.Rarity}${char.Attribute.substring(0,2).toUpperCase()}*/

module.exports = [ guide, tls, character, race];
