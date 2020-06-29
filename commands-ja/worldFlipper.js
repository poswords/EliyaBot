const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const DB = require('../data')
var data = DB.getData('ja');
const wanakana = require('wanakana');
const moment = require('moment-timezone');
const assetPath = 'http://eliya-bot.herokuapp.com/img/assets/';
const group = path.parse(__filename).name;
const reactionExpiry = 30000;
const normalReaction = '🙂';
const awakenReaction = '😤';
const weaponReaction = '⚔️';	
const soulReaction = '📀';
const numberReactions = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];

const tls={
"RaceAquatic": "水棲",  
"RaceBeast": "獣",  
"RaceDemon": "魔",  
"RaceDragon": "ドラゴン",
"RaceHuman": "人",  
"RaceMecha": "機械",
"RacePlant": "植物",  
"RaceSprite": "精霊",
"RaceUndead": "不死",  
"RaceYoukai": "妖",
"RoleSword": "剣士",
"RoleFist": "格闘",
"RoleBow": "射撃",
"RoleSupport": "補助",
"RoleSpecial": "特殊",
"GenderMale": "男性",
"GenderFemale": "女性",
"GenderUnknown": "不明",
"AttributeFire": "火",
"AttributeWater": "水",
"AttributeWind": "風",
"AttributeThunder": "雷",
"AttributeLight": "光",
"AttributeDark": "闇",
"AttributeAll": "全",	
}
function getTls(skey){
	for (const [key, value] of Object.entries(tls)) {
	  if(skey == key) return value;
	}
}	

const getInfoEmbed = (unit, flag)  => {
  var footer = getTls("Role"+unit.Role) + ' - ' + getTls("Gender"+unit.Gender) + ' - ';
  var races = unit.Race.split(' / ');
	var tls =[];
	for (i=0;i<races.length;i++){
		tls.push(getTls("Race"+races[i]));
	}
  footer+= tls.join(' / ');	
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  if (unit.Obtain) {
    footer = footer + ' - ' + unit.Obtain;
  }
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.SubName + ' ' + unit.JPName)
    .setDescription('**属性: **' + getTls("Attribute"+unit.Attribute)
      + '\n**レアリティ: **' + rarity
      + '\n**リーダー特性: **' + unit.LeaderBuff
      + '\n**スキル: **' + unit.Skill
	  + '\n**スキルウェイト: **' + unit.SkillWait)
    .addField('アビリティ1', unit.Ability1, true)
    .addField('アビリティ2', unit.Ability2, true)
    .addField('アビリティ3', unit.Ability3, true)
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
    .setTitle(unit.JPName)
    .addField('入手方法', unit.Obtain, true);
	if (flag == 'soul'){
    	msg.setDescription('**属性: **' + getTls("Attribute"+unit.Attribute)
      + '\n**レアリティ: **' + rarity
      + '\n**アビリティソウル: **' + unit.AbilitySoul)
    	msg.setThumbnail(assetPath + 'item/equipment/' + unit.DevNicknames + '_soul.png')   		
	}else{
		msg.setDescription('**属性: **' + getTls("Attribute"+unit.Attribute)
      + '\n**レアリティ: **' + rarity
	  + '\n**HP: **'+unit.MaxHP+ '　　**ATK: **'+unit.MaxATK
      + '\n**装備効果: **' + unit.WeaponSkill)
		msg.setThumbnail(assetPath + 'item/equipment/' + unit.DevNicknames + '.png') 
	}	
  return msg;
}; 

const getThumbnailEmbed =(unit, flag) => {
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
	console.log(flag);
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.SubName + ' ' + unit.JPName)
    .setDescription('**属性: **' + getTls("Attribute"+unit.Attribute)
      + '\n**レアリティ: **' + rarity)
  	.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_0.png');
	if (flag == 'awaken'){
    	msg.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_1.png')   		
	}else{
		msg.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_0.png')
	}			
  return msg;
};

const getArtEmbed = (unit, flag)=> {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.SubName + ' ' + unit.JPName);
	if (flag == 'awaken'){
    	msg.setImage(assetPath + 'chars/' + unit.DevNicknames + '/full_shot_1.png')  		
	}else{
		msg.setImage(assetPath + 'chars/' + unit.DevNicknames + '/full_shot_0.png')  
	}		
  return msg;

};

const getAnimationEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.SubName + ' ' + unit.JPName)
  	.setImage(assetPath + 'chars/' + unit.DevNicknames + '/front.gif');
  return msg;

};

const getSpecialEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.SubName + ' ' + unit.JPName)
  	.setImage(assetPath + 'chars/' + unit.DevNicknames + '/special.gif');
  return msg;
};
const sendList = async (units, message, type) => {
  const filter = (reaction, user) => {
    return numberReactions.includes(reaction.emoji.name) && user.id === message.author.id;
  };
  const msg = await message.channel.send('検索結果:\n```diff\n' + units.map((char, index) => (`${parseInt(index, 10) + 1}: ${(char.SubName)?char.SubName+' '+char.JPName:char.JPName}`)).join('\n') + '```');
  var num = units.length;
  if (units.length > 10) num=10;
  for (i=0;i<num;i++){
	await msg.react(numberReactions[i]);  
  }
  const collector = msg.createReactionCollector(filter, { max: 10, time: reactionExpiry });  
  collector.on('collect', r => {
	  for (i=0;i<num;i++){
		if (r.emoji.name === numberReactions[i]) {
			switch (type){
				case 'c':					
					sendMessage(units[i],message);
				 	break;
  				case 'w':
					sendThumbnail(units[i],message);
				 	break;
  				case 'e':
					sendEquip(units[i],message);
				 	break;	
  				case 'art':
					sendArt(units[i],message);
				 	break;	
  				case 'alt':
					sendAlt(units[i],message);
				 	break;						
			}
			msg.reactions.removeAll();
		}		  
	  }	  
  });	
  collector.on('end', collected => msg.reactions.removeAll());
};

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
/*    if (typeof item.DevNicknames !== 'undefined') {
      if (item.DevNicknames.toLowerCase() === chara) {
        return true;
      }
    }*/
  });
  if (result.length <= 0) {

    result = data.chars.filter(function (item) {
      var res;
      if (res != true) {		  
        if (item.JPName.toLowerCase().indexOf(wanakana.toKatakana(chara)) !== -1) {
          res = true;
        }
        if (item.ENName.toLowerCase().indexOf(chara) !== -1) {
          res = true;
        }
        if (typeof item.OtherCommonNames !== 'undefined') {
          if (item.OtherCommonNames.toLowerCase().indexOf(chara) !== -1) {
            res = true;
          }
          if (item.OtherCommonNames.toLowerCase().indexOf(wanakana.toKatakana(chara)) !== -1) {
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
/*    if (typeof item.DevNicknames !== 'undefined') {
      if (item.DevNicknames.toLowerCase() === chara) {
        return true;
      }
    }*/
  });
  if (result.length <= 0) {

    result = data.equips.filter(function (item) {
      var res;
      if (res != true) {
        if (item.JPName.toLowerCase().indexOf(wanakana.toKatakana(chara)) !== -1) {
          res = true;
        }
        if (item.ENName.toLowerCase().indexOf(chara) !== -1) {
          res = true;
        }		  
        if (typeof item.OtherCommonNames !== 'undefined') {
          if (item.OtherCommonNames.toLowerCase().indexOf(wanakana.toKatakana(chara)) !== -1) {
            res = true;
          }
        }
      }
      return res
    });
  }
  return result;
};
/*
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
  description: "Link to Eliya Bot's translation webapp",
  execute(message) {
    const tlDocLink = 'http://eliya-bot.herokuapp.com/list';
    return message.channel.send(`The translation webapp can be found here:\n${tlDocLink}`);
  },
};*/
function getTimeUntil(diff){
	const days =  Math.floor(diff/1000/ 60 / 60 / 24);
	const hours =  Math.floor(diff/1000/ 60 / 60 - (days *24));
	const minutes = Math.floor(diff/1000/60%60);
	var timeUntil = '';
	if (days > 0){
		timeUntil+= days+'日';
	}
	if (hours > 0 || days > 0){
		timeUntil+= hours+'時間';
	}
	if (minutes >0 || hours > 0 || days > 0){
		timeUntil+= minutes+'分';
	}	
	return timeUntil;
}
const event = {
  name: 'event',
  group,
  aliases: ['ev', 'events'],
  description: '開催中・開催決定のイベントを表示',
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
				ongoingList += event.ENName+'\n+ 終了 : '+event.End+' ('+timeUntil+")\n";
			}else{
				timeUntil = getTimeUntil(start.format("x")-now.format("x"));
				upcomingList += event.ENName+'\n+ 開始 : '+event.Start+' ('+timeUntil+")\n";
			}
		}
	}
	var msg = new Discord.MessageEmbed();
    
	if (ongoingList.length>0){
		msg.addFields({name:"開催中", value: "```diff\n"+ongoingList+"```"});
	}else{
		msg.addFields({name:"開催中", value: "```diff\nなし```"})
	}	  
	if (upcomingList.length>0){
		msg.addFields({name:"開催決定", value: "```diff\n"+upcomingList+"```"})
	}else{
		msg.addFields({name:"開催決定", value: "```diff\nなし```"})
	}
	
    return message.channel.send(msg);	  
  },
};

const tracker = {
  name: 'tracker',
  group,
  aliases: ['tr', 'track'],
  description: 'ワーフリ所有率チェッカーへリンク',
  execute(message) {
    const tlDocLink = 'http://eliya-bot.herokuapp.com/';
    return message.channel.send(`ワーフリ所有率チェッカーはこちら: \n${tlDocLink}`);
  },
};
const character = {
  name: 'character',
  group,
  args: true,
  usage: '<chara name>',
  aliases: ['c', 'char'],
  description: 'キャラクターを検索',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('検索ワードは２文字以上お願いします!');
    }		
	var arrFound = searchCharByName(chara);

	if (arrFound.length === 0) {
	  return message.channel.send('キャラが見つかりません!');
	}
	if (arrFound.length > 30) {
	  return message.channel.send('結果'+arrFound.length + '件! 検索ワードを絞り込んでください');
	}
	if (arrFound.length === 1) {
	  sendMessage(arrFound[0], message);
	} else {
	  sendList(arrFound,message, 'c');
	}
	
  },
};

const equipment = {
  name: 'equipment',
  group,
  args: true,
  usage: '<equipment name>',
  aliases: ['e', 'equip'],
  description: '装備を検索',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('検索ワードは２文字以上お願いします!');
    }else{
		var arrFound = searchEquipByName(chara);

		if (arrFound.length === 0) {
		  return message.channel.send('装備が見つかりません!');
		}
		if (arrFound.length > 30) {
		  return message.channel.send('結果'+arrFound.length + '件! 検索ワードを絞り込んでください');
		}
		if (arrFound.length === 1) {
		  sendEquip(arrFound[0], message);
		} else {
		  sendList(arrFound,message, 'e');
		}
	}
  },
};
/*
const race = {
  name: 'race',
  group,
  args: true,
  usage: '<chara race>',
  aliases: ['r'],
  description: 'キャラクターを検索',
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
      sendList(arrFound,message, 'c');
    }

  },
};
*/
const whois = {
  name: 'whois',
  group,
  args: true,
  usage: '<chara thumbnail>',
  aliases: ['w', 'tn'],
  description: 'キャラクターのサムネイルを表示',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
	  
    if (chara.length < 2) {
      return message.channel.send('検索ワードは２文字以上お願いします!');
    }
	if (chara == 'malte'){
	  sendEquip(searchEquipByName(chara)[0], message);
	}else{
		var arrFound = searchCharByName(chara);

		if (arrFound.length === 0) {
		  return message.channel.send('キャラが見つかりません!');
		}
		if (arrFound.length > 30) {
		  return message.channel.send('結果'+arrFound.length + '件! 検索ワードを絞り込んでください');
		}
		if (arrFound.length === 1) {
		  sendThumbnail(arrFound[0], message);
		} else {
		  sendList(arrFound,message, 'w');
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
  description: 'キャラクターのイラストを表示',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('検索ワードは２文字以上お願いします!');
    }
    var arrFound = searchCharByName(chara);

    if (arrFound.length === 0) {
      return message.channel.send('キャラが見つかりません!');
    }
    if (arrFound.length > 30) {
      return message.channel.send('結果'+arrFound.length + '件! 検索ワードを絞り込んでください');
    }
    if (arrFound.length === 1) {
      sendArt(arrFound[0], message);
    } else {
      sendList(arrFound,message, 'art');
    }
  },
};
const alt = {
  name: 'alt',
  group,
  args: true,
  usage: '<chara alt>',
  aliases: ['al'],
  description: 'キャラクターの進化後イラストを表示',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('検索ワードは２文字以上お願いします!');
    }
    var arrFound = searchCharByName(chara);

    if (arrFound.length === 0) {
      return message.channel.send('キャラが見つかりません!');
    }
    if (arrFound.length > 30) {
      return message.channel.send('結果'+arrFound.length + '件! 検索ワードを絞り込んでください');
    }
    if (arrFound.length === 1) {
      sendAlt(arrFound[0], message);
    } else {
      sendList(arrFound,message, 'alt');
    }
  },
};

const update = {
  name: 'update',
  group,
  usage: '<update>',
  description: 'データ更新（管理者用）',
  execute(message, args) {
    data = DB.getData('ja');
	const axios = require('axios');	  
	 axios.post('http://eliya-bot.herokuapp.com/update', {
	})
	.then((res) => {
	  
	})
	.catch((error) => {
	  console.error(error)
	})
    return message.channel.send('データベース更新しました!');
  },
}

module.exports = [tracker, event,character, equipment, whois, art, alt,update];