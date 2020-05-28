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
  "'5* Characters'!A1:O300",
  "'4* Characters'!A1:O300",
  "'3* Characters'!A1:O300",
  "'1*/2* Characters'!A1:P30"
];
var range_rarity = [
  5,
  4,
  3,
  2,
]

module.exports = {
  getData: function () {
	  console.log('Getting data..')
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
			for (i = 0; i<rows.length; i++){
				  if (rows[i].Picture == '2*') {
					rows.splice(i, 1);
					i--;
				  }else if (rows[i].Picture == '1*') {
					rows.splice(i, 1);
					i--;
					rarity--;
				  }else {rows[i].Rarity = rarity;
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
			}
            Array.prototype.push.apply(results, rows)

          })

        }
      );
    });
	console.log('Complete')
    return results
  }
}
