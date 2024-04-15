const {
  google
} = require('googleapis');
const fs = require('fs');
const APIKey = process.env.GOOGLE_API_KEY;
const sheets = google.sheets({
  version: "v4",
  auth: APIKey
});
let chardata = JSON.parse(fs.readFileSync('data/chars.json'));
let equipdata = JSON.parse(fs.readFileSync('data/equips.json'));
let chardatagl = fixDevNicknames(JSON.parse(fs.readFileSync('datagl/chars.json')));
let equipdatagl = JSON.parse(fs.readFileSync('datagl/equips.json'));

var range_names = [
  "'5* Characters'!A1:Z300",
  "'4* Characters'!A1:Z300",
  "'3* Characters'!A1:Z300",
  "'1*/2* Characters'!A1:Z30",
  "'Boss/Event Weapons'!C1:Z400",
  "'Gacha/Story Weapons'!B1:Z300",
  "'Events'!A1:G700"
];
var range_rarity = [
  5,
  4,
  3,
  2,
]

// hotfix for typo in sheet
const fixDevNicknames = (data) => data.map(char => Object.assign(char, { DevNicknames: char['DevNicknames'].replaceAll('/', '') }));

const mergeData = (target, source) => {
  source.forEach(sourceElement => {
    let targetElement = target.find(targetElement => {
      return sourceElement['DevNicknames'] === targetElement['DevNicknames'];
    })
    
    if (targetElement) Object.assign(targetElement, sourceElement);
  })
}
module.exports = {
  getData: function (lang) {

    var SPREADSHEET_ID;
    switch (lang) {
      case 'zh-TW':
        SPREADSHEET_ID = '1ufgoiam83634LwZwj1ECNmyMd6cAdHz8u4YX7k62-6w';
        break;
      case 'gl': 
        SPREADSHEET_ID = '1zNa_FwDyy-vHzY-bmCbkjjDBFU_-2EKRcHlqRsN6TUg';
        break;
      case 'ja':
        SPREADSHEET_ID = '1FfHbq_ZJpWh7QhMzltAdzoyCSDtYlXXvb7EnboPsitM';
        break;
      default:
        SPREADSHEET_ID = '1moWhlsmAFkmItRJPrhhi9qCYu8Y93sXGyS1ZBo2L38c';
        break;
    }
    console.log('Getting data..')
    var results = [];
    var chars = [];
    var equips = [];
    var events = [];
    sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    }, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      sheets.spreadsheets.values.batchGet({
          spreadsheetId: SPREADSHEET_ID,
          ranges: range_names
        },
        (err, res) => {
          if (err) {
            console.error(err);
            return;
          }
          for (r = 0; r < 4; r++) {
            var range = res.data.valueRanges[r];
            var columnNames = range.values[0];
            var dataRows = range.values.splice(1);
            var type = 'char'
            var rarity = range_rarity[r];
            var rows = dataRows.map(function (a) {
              var temp = {};
              columnNames.forEach(function (key, i) {
                temp[key.replace(/\s+/g, "")] = a[i];
              })
              return temp;
            });
            for (i = 0; i < rows.length; i++) {
              if (rows[i].Picture == '2*') {
                rows.splice(i, 1);
                i--;
              } else if (rows[i].Picture == '1*') {
                rows.splice(i, 1);
                i--;
                rarity--;
              } else {
                rows[i].Rarity = rarity;
                switch (rows[i].Attribute) {
                  case "火":
                    rows[i].Attribute = "Fire";
                    break;
                  case "水":
                    rows[i].Attribute = "Water";
                    break;
                  case "風":
                    rows[i].Attribute = "Wind";
                    break;
                  case "雷":
                    rows[i].Attribute = "Thunder";
                    break;
                  case "光":
                    rows[i].Attribute = "Light";
                    break;
                  case "闇":
                    rows[i].Attribute = "Dark";
                    break;
                }
              }
              if (rows[i]){
                if ("InTaiwan" in rows[i]){
                  if (rows[i].InTaiwan=='Y') {
                    rows[i].InTaiwan = true;
                  }else{
                    rows[i].InTaiwan = false;
                  }
                }
              }
            }
            Array.prototype.push.apply(chars, rows)
            if (lang=="gl"){
              mergeData(chars, chardatagl , 'DevNicknames');
            }else{
              mergeData(chars, chardata , 'DevNicknames');
            }
          }


          var equipTypes = ["main_story_orb", "practice_trophy", "sword", "axe", "spear", "bow", "book", "staff", "fist", "shield", "acce", "gun", "unknown"];
          for (r = 4; r < 6; r++) {
            var range = res.data.valueRanges[r];
            var columnNames = range.values[0];
            var dataRows = range.values.splice(1);
            var type = 'equip'
            var rows = dataRows.map(function (a) {
              var temp = {};
              columnNames.forEach(function (key, i) {
                temp[key.replace(/\s+/g, "")] = a[i];
              })
              return temp;
            });
            for (i = 0; i < rows.length; i++) {
              rows[i].Rarity = rows[i].Rarity.replace('*', '');
              switch (rows[i].Attribute) {
                case "火":
                  rows[i].Attribute = "Fire";
                  break;
                case "水":
                  rows[i].Attribute = "Water";
                  break;
                case "風":
                  rows[i].Attribute = "Wind";
                  break;
                case "雷":
                  rows[i].Attribute = "Thunder";
                  break;
                case "光":
                  rows[i].Attribute = "Light";
                  break;
                case "闇":
                  rows[i].Attribute = "Dark";
                  break;
                case "全":
                  rows[i].Attribute = "All";
                  break;
              }
              for (t = 0; t < equipTypes.length; t++) {
                if (rows[i].DevNicknames){
                  if (rows[i].DevNicknames.includes(equipTypes[t])){
                    rows[i].EquipType = equipTypes[t]
                  }
                }else{
                  rows[i].EquipType == "unknown"
                }
              }
            }
            Array.prototype.push.apply(equips, rows)
            equips.sort(function(a, b){  
              return ('' + a.DevNicknames).localeCompare(b.DevNicknames);
            });          
            equips.sort(function(a, b){  
              return equipTypes.indexOf(a.EquipType) - equipTypes.indexOf(b.EquipType);
            });           
            
            if (lang=="gl"){
              mergeData(equips, equipdatagl , 'DevNicknames');   
            }else{
              mergeData(equips, equipdata , 'DevNicknames');   
            }            
                     
          }
          for (r = 6; r < 7; r++) {
            var range = res.data.valueRanges[r];
            var columnNames = range.values[0];
            var dataRows = range.values.splice(1);
            var type = 'event'
            var rows = dataRows.map(function (a) {
              var temp = {};
              columnNames.forEach(function (key, i) {
                temp[key.replace(/\s+/g, "")] = a[i];
              })
              return temp;
            });
            for (i = 0; i < rows.length; i++) {
              if (rows[i].End == ''){
                rows[i].End = '2099-12-31'
                rows[i].EndsIn = '1400d 10h 14m'
              }
            }                    
            Array.prototype.push.apply(events, rows)
          }/*
          for (r = 7; r < 8; r++) {
            var range = res.data.valueRanges[r];
            var columnNames = range.values[0];
            var dataRows = range.values.splice(1);
            var type = 'title'
            var rows = dataRows.map(function (a) {
              var temp = {};
              columnNames.forEach(function (key, i) {
                temp[key.replace(/\s+/g, "")] = a[i];
              })
              return temp;
            });
            Array.prototype.push.apply(titles, rows)
          }*/

          results.chars = chars;
          results.equips = equips;
          results.events = events;
         /* results.titles = titles;*/
        });
    });
    console.log('Complete')
    return results
  }
}
