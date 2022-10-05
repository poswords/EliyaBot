const fs = require('fs');

let jsonFolder = "json/";
//let actionsFolder = jsonFolder+"action";

let characters = JSON.parse(fs.readFileSync(jsonFolder+'character/character.json'));
let characterStats = JSON.parse(fs.readFileSync(jsonFolder+'character/character_status.json'));
let characterSkills = JSON.parse(fs.readFileSync(jsonFolder+'skill/action_skill.json'));
let characterTexts = JSON.parse(fs.readFileSync(jsonFolder+'character/character_text.json'));

let equipments = JSON.parse(fs.readFileSync(jsonFolder+'item/equipment.json'));
let souls = JSON.parse(fs.readFileSync(jsonFolder+'item/item.json'));
let equipmentStats = JSON.parse(fs.readFileSync(jsonFolder+'item/equipment_status.json'));

let maxLvBonus = { "1": 12*0.004, "2": 10*0.005, "3": 8*0.008, "4":6*0.015, "5":4*0.03 }
let awakenStats = {"1": ["30","150"],"2": ["40","200"],"3": ["50","250"],"4": ["54","270"],"5": ["60","300"]};

let elements = {"0":'Fire',"1":'Water',"2":'Thunder',"3":'Wind',"4":'Light',"5":'Dark',"0,3,2,1,4,5": "All"};
let roles = ['Sword','Fist','Bow','Support','Special'];

chars = [];
equips = [];

for (const [charid, character] of Object.entries(characters)) {
    let rarity = character[2];
    let skillData = characterSkills[character[0]][2];
    var char = {
        DevNicknames: character[0],
        SubName: characterTexts[charid][3],
        JPName: characterTexts[charid][1],
        Rarity: parseInt(rarity),
        Attribute: elements[character[3]],
        Role: roles[character[6]],
        Race: character[4].replace(","," / ").replace("Mystery","Youkai").replace("Element","Sprite").replace("Element","Sprite").replace("Machine","Mecha").replace("Plants","Plant").replace("Devil","Demon"),
        Stance: character[26],
        Gender: character[7].replace("Ririi","Lily"),
        MaxHP: Math.ceil(characterStats[charid][100][0]*(1+maxLvBonus[rarity])) + parseInt(awakenStats[rarity][1]),
        MaxATK: Math.ceil(characterStats[charid][100][1]*(1+maxLvBonus[rarity])) + parseInt(awakenStats[rarity][0]),
    }
    if (skillData){
        char["SkillWait"] = skillData[5];
        char["SkillIcon"] = skillData[2].replace("dynamic/skill/","");
        char["SkillRange"] = skillData.slice(8,16);
    }
    /*let actionJSONFileName = actionsFolder+'rare'+rarity+'/'+character[0]+'$'+character[0]+'_2.action.dsl.json';
    if (fs.existsSync(actionJSONFileName)) { 
        let characterSkill = JSON.parse(fs.readFileSync(actionJSONFileName));
    }*/
    chars.push(char);
  }

  for (const [equipid, equipment] of Object.entries(equipments)) {
    var equip = {
        DevNicknames: equipment[0],
        JPName: equipment[1],
        Rarity: equipment[11],
        Attribute: elements[souls[equipid][11]],
        MaxHP: equipmentStats[equipid]['5']?equipmentStats[equipid]['5'][0]:equipmentStats[equipid]['1'][0],
        MaxATK: equipmentStats[equipid]['5']?equipmentStats[equipid]['5'][1]:equipmentStats[equipid]['1'][1]
    }
    equips.push(equip);
  }
fs.writeFileSync('data/chars.json', JSON.stringify(chars));
fs.writeFileSync('data/equips.json', JSON.stringify(equips));