const {
  google
} = require('googleapis');

const SPREADSHEET_ID = '1moWhlsmAFkmItRJPrhhi9qCYu8Y93sXGyS1ZBo2L38c';
const APIKey = process.env.GOOGLE_API_KEY;
const sheets = google.sheets({
  version: "v4",
  auth: APIKey
});
var range_names = [
  "'5* Characters'!A1:M300",
  "'4* Characters'!A1:M300",
  "'3* Characters'!A1:M300",
  "'1*/2* Characters'!A1:N30"
];
var range_rarity = [
  5,
  4,
  3,
  2,
]

module.exports = {
  getData: function () {
    var results = [];
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
          res.data.valueRanges.forEach(function (range, index) {
            var columnNames = range.values[0];
            var dataRows = range.values.splice(1);
            var rarity = range_rarity[index];
            var rows = dataRows.map(function (a) {
              var temp = {};
              columnNames.forEach(function (key, i) {
                temp[key.replace(/\s+/g, "")] = a[i];
              })
              return temp;
            });
            rows.forEach(function (item, index, object) {
              if (item.Picture == '2*') {
                object.splice(index, 1);
              }
              if (item.Picture == '1*') {
                object.splice(index, 1);
                rarity--;
              }
              item.Rarity = rarity;
              switch (item.Attribute) {
                case "火":
                  item.Attribute = "Fire";
                  break;
                case "水":
                  item.Attribute = "Water";
                  break;
                case "風":
                  item.Attribute = "Wind";
                  break;
                case "雷":
                  item.Attribute = "Thunder";
                  break;
                case "光":
                  item.Attribute = "Light";
                  break;
                case "闇":
                  item.Attribute = "Dark";
                  break;
              }
            });
            Array.prototype.push.apply(results, rows)

          })

        }
      );
    });
    return results
  }
}
