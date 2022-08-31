const {
  google
} = require('googleapis');

const APIKey = process.env.GOOGLE_API_KEY;
const sheets = google.sheets({
  version: "v4",
  auth: APIKey
});
var range_names = [
  "'5* Characters'!C1:HT300",
  "'4* Characters'!C1:HT300",
  "'3* Characters'!C1:HT300",
  "'1*/2* Characters'!C1:HT30",
  "'Boss/Event Weapons'!D1:BB300",
  "'Gacha/Story Weapons'!D1:BB300",
];
var range_rarity = [
  5,
  4,
  3,
  2,
]

module.exports = {
  getData: function (lang) {
    var SPREADSHEET_ID;
    SPREADSHEET_ID = '1fPRxbi4coI3fjO2iuR5NeApTZmkDL-a5J23pRm9dEzc';
    console.log('Getting data..')
    var results = [];
    var chars = [];
    var equips = [];
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
            var stats = [];
            var keys = ['LeaderBuff','Skill','Ability1','Ability2','Ability3','Ability4','Ability5','Ability6'];
            var prefixes = ['BuffNum','Type','Amount','Target','Condition','Every','EveryCond'];
            rows.forEach(function(row){
              var stat={};
              stat['DevNicknames'] = row.DevNicknames;
              for (k=0;k<keys.length;k++){
                stat[keys[k]] = {};
                stat[keys[k]]['IsMain'] = (row[keys[k]+'IsMain']==1)?true: false;
                stat[keys[k]]['Effect1'] = {};                
                stat[keys[k]]['Effect2'] = {};                
                stat[keys[k]]['Effect3'] = {};                
                stat[keys[k]]['Effect4'] = {};                
                for (p=0;p<prefixes.length;p++){
                  for (i=1;i<=4;i++){
                    if (row[keys[k]+'Type'+i]){
                      stat[keys[k]]['Effect'+i][prefixes[p]] = row[keys[k]+prefixes[p]+i];
                    }
                  }
                }                
              }

              stats.push(stat);
            });
            Array.prototype.push.apply(chars, stats)
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
            Array.prototype.push.apply(equips, rows)
          }
        
          equips.sort(function(a, b){  
            return ('' + a.DevNicknames).localeCompare(b.DevNicknames);
          });          
          equips.sort(function(a, b){  
            return equipTypes.indexOf(a.EquipType) - equipTypes.indexOf(b.EquipType);
          });           
          
          results.chars = chars;
          results.equips = equips;
        });
    });
    console.log('Complete')
    return results
  }
}
