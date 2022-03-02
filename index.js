// Run dotenv
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const app = express();
const version = '0.1';
const listenport = process.env.PORT;
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
var cookieParser = require('cookie-parser');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-express-middleware');
const Backend = require('i18next-node-fs-backend');

const {
  createCanvas,
  loadImage
} = require('canvas');
const path = require('path');
app.use(express.static('public', {
  maxAge: "30d"
}));
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
i18next
  .use(i18nextMiddleware.LanguageDetector)
  .use(Backend)
  .init({
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json'
    },
    debug: false,
    detection: {
      order: ['querystring', 'cookie'],
      caches: ['cookie']
    },
    preload: ['en', 'ja', 'zh-TW'],
    fallbackLng: ['en']

  });
app.use(i18nextMiddleware.handle(i18next));
const viewFolder = path.join(__dirname, './views/');
const DB = require('./data');
var data,dataja,datazhtw;
function until(conditionFunction) {

  const poll = resolve => {
    if(conditionFunction()) resolve();
    else setTimeout(_ => poll(resolve), 2000);
  }

  return new Promise(poll).catch((error) => {});
}
function calcGauge(text){
  var match = text.toLowerCase().match(/hen battle begins, (own|party members\'|leader \'|.* characters\'|other .* characters\'|other party members\') skill gauge \+(\d+)+%/);
  if (match){
    var target = match[1].match(/(own|party|leader|other)/);
    if (target){
      target = target[1];
    }
    var condition = "";
    var count = 0;
    var counttarget = '';    
    var gauge = match[2];
    if (target == "own" || target == "leader"){
      var selfis = text.match(/f .* is .*(fire|water|wind|thunder|light|dark|human|sprite|beast|mecha|dragon|undead|youkai|plant|demon|aquatic).* character, when battle begins, .* skill gauge \+/);
      if (selfis){
        condition = selfis[1];
      }
    }else if (target == "other"){
      var otheris = text.match(/hen battle begins, .*(fire|water|wind|thunder|light|dark|human|sprite|beast|mecha|dragon|undead|youkai|plant|demon|aquatic).* character.* skill gauge \+/);
      if (otheris){
        condition = otheris[1];
      }      
    }else{
      target = "party"      
      var targetis = match[1].match(/(fire|water|wind|thunder|light|dark|human|sprite|beast|mecha|dragon|undead|youkai|plant|demon|aquatic)/);
      if (targetis){
        condition = targetis[1];
      }
    }
    if (condition !==""){
      condition = condition.charAt(0).toUpperCase() + condition.slice(1);
    }    
    var counttargets;
    if (text.includes('or every')){
      counttargets = text.match(/or every (\d) (fire|water|wind|thunder|light|dark|human|sprite|beast|mecha|dragon|undead|youkai|plant|demon|aquatic).* characters in the party, when battle begins, .* skill gauge \+/)
      if (counttargets){
        count = counttargets[1];                   
        counttarget = counttargets[2];
      }      
    }
    if (text.includes('f there are')){
      counttarget = "";
      counttargets = text.match(/f there are (\d) .*(fire|water|wind|thunder|light|dark|human|sprite|beast|mecha|dragon|undead|youkai|plant|demon|aquatic).* characters in the party, when battle begins, .* skill gauge \+/)
      if (counttargets){
        count = counttargets[1];                   
        counttarget = counttargets[2];
      }
    }
    if (counttarget !==""){
      counttarget = counttarget.charAt(0).toUpperCase() + counttarget.slice(1);
    }    
    return {
      Target: target,
      Condition: condition,
      Every: count,      
      EveryCond: counttarget,      
      IsMain: text.includes('[Main]'),
      Amount: gauge
    }
  }
}
function calcMaxGauge(text){
  var match = text.toLowerCase().match(/(.*) max skill gauge \+(\d+)+%/);
  if (match){
    var target = match[1].match(/(own|party|leader|other)/);
    if (target){
      target = target[1];
    }
    var condition = "";
    var count = 0;
    var counttarget = '';
    var gauge = match[2];
    if (target == "own" || target == "leader"){
      var selfis = text.match(/f .* is .*(fire|water|wind|thunder|light|dark|human|sprite|beast|mecha|dragon|undead|youkai|plant|demon|aquatic).* character, .* max skill gauge \+/);
      if (selfis){
        condition = selfis[1];
      }
    }else if (target == "other"){
      var otheris = text.match(/.*(fire|water|wind|thunder|light|dark|human|sprite|beast|mecha|dragon|undead|youkai|plant|demon|aquatic).* character.* max skill gauge \+/);
      if (otheris){
        condition = otheris[1];
      }      
    }else{
      target = "party"
      var targetis = match[1].match(/(fire|water|wind|thunder|light|dark|human|sprite|beast|mecha|dragon|undead|youkai|plant|demon|aquatic)/);
      if (targetis){
        condition = targetis[1];
      }
    }
    if (condition !==""){
      condition = condition.charAt(0).toUpperCase() + condition.slice(1);
    }
    var counttargets;
    if (text.includes('or every')){
      counttargets = text.match(/or every (\d) (fire|water|wind|thunder|light|dark|human|sprite|beast|mecha|dragon|undead|youkai|plant|demon|aquatic).* characters in the party, .* max skill gauge \+/);
      if (counttargets){
        count = counttargets[1];                   
        counttarget = counttargets[2];           
      }      
    }
    if (text.includes('f there are')){
      counttarget = "";
      counttargets = text.match(/f there are (\d) .*(fire|water|wind|thunder|light|dark|human|sprite|beast|mecha|dragon|undead|youkai|plant|demon|aquatic).* characters in the party, .* max skill gauge \+/);
      if (counttargets){
        count = counttargets[1];                   
        counttarget = counttargets[2];       
      }
    }
    if (counttarget !==""){
      counttarget = counttarget.charAt(0).toUpperCase() + counttarget.slice(1);
    }        
    return {
      Target: target,
      Condition: condition,
      Every: count,
      EveryCond: counttarget,
      IsMain: text.includes('[Main]'),
      Amount: gauge
    }
  }
}
async function updateDB() {

  data = DB.getData('en');
  dataja = DB.getData('en');
  datazhtw = DB.getData('en');
  var datajatemp = DB.getData('ja');
  var datazhtwtemp = DB.getData('zh-TW');

  await until(_ => data.chars && datajatemp.chars && datazhtwtemp.chars);

  data.chars.forEach(function (i) {
    var itw = datazhtwtemp.chars.find(e => e.DevNicknames == i.DevNicknames)
    if (itw){i.InTaiwan = itw.InTaiwan;}
    i.Gauges = {
      LeaderBuff:calcGauge(i.LeaderBuff),
      Ability1:calcGauge(i.Ability1),
      Ability2:calcGauge(i.Ability2),
      Ability3:calcGauge(i.Ability3),
      Ability4:calcGauge(i.Ability4),
      Ability5:calcGauge(i.Ability5),
      Ability6:calcGauge(i.Ability6)
    }
    i.MaxGauges={
      LeaderBuff:calcMaxGauge(i.LeaderBuff),
      Ability1:calcMaxGauge(i.Ability1),
      Ability2:calcMaxGauge(i.Ability2),
      Ability3:calcMaxGauge(i.Ability3),
      Ability4:calcMaxGauge(i.Ability4),
      Ability5:calcMaxGauge(i.Ability5),
      Ability6:calcMaxGauge(i.Ability6)
    }
    
  });
  data.equips.forEach(function (i) {
    var itw = datazhtwtemp.equips.find(e => e.DevNicknames == i.DevNicknames)
    if (itw){i.InTaiwan = itw.InTaiwan;}
    
    i.Gauges = {
      WeaponSkill:calcGauge(i.WeaponSkill),
      AwakenLv3:calcGauge(i.AwakenLv3),
      AwakenLv5:calcGauge(i.AwakenLv5),
      AbilitySoul:calcGauge(i.AbilitySoul)
    }    
    i.MaxGauges = {
      WeaponSkill:calcMaxGauge(i.WeaponSkill),
      AwakenLv3:calcMaxGauge(i.AwakenLv3),
      AwakenLv5:calcMaxGauge(i.AwakenLv5),
      AbilitySoul:calcMaxGauge(i.AbilitySoul)
    }        
  });  

  dataja.chars.forEach(function (i) {
    var ijp = datajatemp.chars.find(e => e.DevNicknames == i.DevNicknames)
    if (ijp){
      i.LeaderBuff = ijp.LeaderBuff;
      i.Skill = ijp.Skill;
      i.Ability1 = ijp.Ability1;
      i.Ability2 = ijp.Ability2;
      i.Ability3 = ijp.Ability3;
      i.Ability4 = ijp.Ability4;
      i.Ability5 = ijp.Ability5;
      i.Ability6 = ijp.Ability6;    
      i.SubName = ijp.SubName;
      i.Obtain = ijp.Obtain;
    }else{
      i.LeaderBuff = "";
      i.Skill = "";
      i.Ability1 = "";
      i.Ability2 = "";
      i.Ability3 = "";
      i.Ability4 = "";
      i.Ability5 = "";
      i.Ability6 = "";
      i.SubName = "";
      if (i.Obtain){
        i.Obtain = i.Obtain.replace('Limited','限定');
      }      
    }

  }); 
  dataja.equips.forEach(function (i) {
    var ijp = datajatemp.equips.find(e => e.DevNicknames == i.DevNicknames)
    if (ijp){
      i.WeaponSkill = ijp.WeaponSkill;
      i.AwakenLv3 = ijp.AwakenLv3;
      i.AwakenLv5 = ijp.AwakenLv5;
      i.AbilitySoul = ijp.AbilitySoul;
      i.Obtain = ijp.Obtain;
    }else{
      i.WeaponSkill = "";
      i.AwakenLv3 = "";
      i.AwakenLv5 = "";
      i.AbilitySoul = "";
      if (i.Obtain){
        i.Obtain = i.Obtain.replace('Limited','限定');
      }    
    }
  }); 

  datazhtw.chars.forEach(function (i) {
    var itw = datazhtwtemp.chars.find(e => e.DevNicknames == i.DevNicknames)
    if (itw){
      i.SubName = itw.SubName;      
      i.ZHName = itw.ZHName;
      i.LeaderBuff = itw.LeaderBuff;      
      i.Skill = itw.Skill;
      i.Ability1 = itw.Ability1;
      i.Ability2 = itw.Ability2;
      i.Ability3 = itw.Ability3;
      i.Ability4 = itw.Ability4;
      i.Ability5 = itw.Ability5;
      i.Ability6 = itw.Ability6;    
      i.Obtain = itw.Obtain;
    }else{
      i.LeaderBuff = "";
      i.ZHName = "";
      i.Skill = "";
      i.Ability1 = "";
      i.Ability2 = "";
      i.Ability3 = "";
      i.Ability4 = "";
      i.Ability5 = "";
      i.Ability6 = "";
      i.SubName = "";
      if (i.Obtain){
        i.Obtain = i.Obtain.replace('Limited','限定');
      }      
    }

  }); 
  datazhtw.equips.forEach(function (i) {
    var itw = datazhtwtemp.equips.find(e => e.DevNicknames == i.DevNicknames)
    if (itw){
      i.ZHName = itw.ZHName;
      i.WeaponSkill = itw.WeaponSkill;
      i.AwakenLv3 = itw.AwakenLv3;
      i.AwakenLv5 = itw.AwakenLv5;
      i.AbilitySoul = itw.AbilitySoul;
      i.Obtain = itw.Obtain;
    }else{
      i.ZHName = "";
      i.WeaponSkill = "";
      i.AwakenLv3 = "";
      i.AwakenLv5 = "";
      i.AbilitySoul = "";
      if (i.Obtain){
        i.Obtain = i.Obtain.replace('Limited','限定');
      }    
    }
  });  
}
updateDB();
const {
  Client
} = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})
client.connect();
app.get('/', function (req, res) {
  res.render(viewFolder + 'index.ejs', {
    title: 'Eliya',
    data: {},
    server: req.query.sv?req.query.sv:"jp"
  });
});
app.get('/:id(\\d+)/', function (req, res) {
  res.render(viewFolder + 'index.ejs', {
    title: 'Eliya',
    data: {
      listid: req.params.id
    },
    server: req.query.sv?req.query.sv:"jp"
  });
});
app.get('/list', function (req, res) {
  res.render(viewFolder + 'index.ejs', {
    title: 'Eliya',
    data: {
      listview: true
    },
    server: req.query.sv?req.query.sv:"jp"
  });
});
app.get('/:id(\\d+)/', function (req, res) {
  res.render(viewFolder + 'char.js', {
    title: 'Eliya',
    data: {
      listid: req.params.id
    },
    server: req.query.sv?req.query.sv:"jp"
  });
});
/*app.get('/titles', function (req, res) {
  res.render(viewFolder + 'titles.ejs', {
    title: 'Eliya',
    data: {},
    query: req.query
  });
});
app.get('/titles/list', function (req, res) {
  res.render(viewFolder + 'titles.ejs', {
    title: 'Eliya',
    data: {
      listview: true
    },
    query: req.query
  });
});*/
app.get('/data/en/chars.json', function (req, res) {
  res.json({
    "chars": data.chars
  });
});
app.get('/data/zh-TW/chars.json', function (req, res) {
  res.json({
    "chars": datazhtw.chars
  });
});
app.get('/data/ja/chars.json', function (req, res) {
  res.json({
    "chars": dataja.chars
  });
});
app.get('/data/en/equips.json', function (req, res) {
  res.json({
    "chars": data.equips
  });
});
app.get('/data/zh-TW/equips.json', function (req, res) {
  res.json({
    "chars": datazhtw.equips
  });
});
app.get('/data/ja/equips.json', function (req, res) {
  res.json({
    "chars": dataja.equips
  });
});
app.get('/data/en/titles.json', function (req, res) {
  res.json({
    "chars": data.titles
  });
});
app.get('/data/zh-TW/titles.json', function (req, res) {
  res.json({
    "chars": datazhtw.titles
  });
});
app.get('/data/ja/titles.json', function (req, res) {
  res.json({
    "chars": dataja.titles
  });
});
app.get('/comp/:w', function (req, res) {
  var url = req.params.w.replace('.png', '');
  var lang = '';
  var advanced;
  var exsraw;
  if (url.indexOf('.') > 0) {
    lang = '_' + url.split('.')[1];
    url = url.split('.')[0];
  }
  var height = 205;   
  var top = 0;
  if (url.indexOf('!') > 0) {  
    exsraw = url.split('!')[1];
    height+=10;
    top+=10;    
  }   
  if (url.indexOf('@') > 0) {
    advanced = url.split('@')[1]; 
    url = url.split('@')[0];
  } 
  const canvas = createCanvas(480, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);  
  const units = url.split("-");
  var count = 0;
  if (lang==='_') lang='';
  if (fs.existsSync('./public/img/party_full' + lang + '.png')){  
    loadImage('./public/img/party_full' + lang + '.png').then((bg) => {
      ctx.drawImage(bg, 0, top, 480, 205);
      for (i = 0; i < units.length; i++) {
        var imageUrl = '';
        if (i < 6) {
          imageUrl = './public/img/assets/chars/' + units[i] + '/square_0.png'
        } else if (i < 12) {
          if (i%2==0){
            imageUrl = './public/img/assets/item/equipment/' + units[i] + '.png'	
          }else{
            imageUrl = './public/img/assets/item/equipment/' + units[i] + '_soul.png'
          }
        }
        if (fs.existsSync(imageUrl)){  
          loadImage(imageUrl).then((image) => {
            var width = 82;
            var x, y;
            switch (count) {
              case 0:
              case 2:
              case 4:
                x = 10 + (count / 2) * 160;
                y = 10;
                break;
              case 1:
              case 3:
              case 5:
                x = 81 + ((count - 1) / 2) * 160;
                y = 110;
                width = 69;
                break;
              case 6:
              case 8:
              case 10:
                x = 96 + ((count - 6) / 2) * 160;
                y = 26;
                width = 54;
                break;
              case 7:
              case 9:
              case 11:
                x = 23 + ((count - 7) / 2) * 160;
                y = 122;
                width = 44;
                break;
              default:
                break;
            }
            ctx.drawImage(image, x, y+top, width, width);
            count++;
            if (count >= units.length && !exsraw) {
              sendimage(canvas,res);
            }
          })
        }else{
          count++;
        }
      }
      if (advanced) {
        const mb2sraw = advanced.split('!')[0];
        var mbcount = 0;      
        ctx.font = '11px Arial';
        if (mb2sraw){
          const mb2s = mb2sraw.split(',');
          for (i = 0; i < mb2s.length; i++) {
            if (mb2s[i].length>=3){
              const txt = mb2s[i][0]+' / '+mb2s[i][1] + ' / ' +mb2s[i][2];
              var x, y;
              switch (i) {
                case 0: 
                case 2: 
                case 4: 
                x = 36 + (i / 2) * 160;;
                y = 104;break;
                case 1: 
                case 3: 
                case 5: 
                x = 100 + ((i-1) / 2) * 160;
                y = 191;break;
              }
              ctx.fillStyle = '#fff';            
              ctx.fillRect(x-20, y+top-10, 60, 12);
              ctx.fillStyle = '#333';
              ctx.fillText(txt,x,y+top);
            }
            
          }
        }
        if (exsraw){
          var exs = exsraw.split(',');
          for (i = 0; i < exs.length; i++) {
            var imageUrl = './public/img/assets/sprites/ex/ex' + exs[i] + '.png'
            if (fs.existsSync(imageUrl)){  
              loadImage(imageUrl).then((image) => {
                var x, y;
                var width = 24;
                x = 102 + (Math.floor(mbcount / 4)) * 160 + (mbcount%2)*30;
                y = 4;
                ctx.fillStyle = '#fff';
                switch (mbcount) {
                  case 2: 
                  case 3: 
                  case 6: 
                  case 7: 
                  case 10: 
                  case 11:                 
                  x -= 86;
                  y += 180;
                  break;
                }
                if (mbcount%4==2){
                  ctx.fillRect(x-10, y-10, 60, 30);              
                }
                ctx.drawImage(image, x, y, width, width);
                mbcount++;
                if (mbcount >= exs.length) {
                  sendimage(canvas,res);
                }              
              });
            }else{
              mbcount++;
            }
          }        
        }
      }

    });
  }
});
function sendimage(canvas,res){
  var data = canvas.toDataURL();
  data = data.replace(/^data:image\/png;base64,/, '');
  var img = new Buffer.from(data, 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  });
  res.end(img);  
}
app.post('/update', async (req, res) => {
  updateDB();
  res.send("webapp updated!");
});

io.on('connection', function (socket) {
  socket.on('connected', function (lang) {
    switch (lang) {
      case "ja":
        io.to(socket.id).emit('equips', dataja.equips);
        io.to(socket.id).emit('chars', dataja.chars);
        break;
      case "zh-TW":
        io.to(socket.id).emit('equips', datazhtw.equips);
        io.to(socket.id).emit('chars', datazhtw.chars);
        break;
      default:
        io.to(socket.id).emit('equips', data.equips);
        io.to(socket.id).emit('chars', data.chars);
    }
  });
  socket.on('connected-title', function (lang) {
    switch (lang) {
      case "ja":
        io.to(socket.id).emit('titles', dataja.titles);
        break;
      case "zh-TW":
        io.to(socket.id).emit('titles', datazhtw.titles);
        break;
      default:
        io.to(socket.id).emit('titles', data.titles);
    }
  });


  socket.on('add url', function (list) {
    const sql = "INSERT INTO short_urls (url, equips) VALUES ($1, $2) RETURNING id";
    const values = [list.chars,list.equips];

    client.query(sql,values).then(res=> {
      var id;
		  id = res.rows[0].id;
      io.to(socket.id).emit('url added', {
        id: res.rows[0].id,
        url: list
      });
      var target = id - 9980;
		
      if (target > 0) {
        client.query('Delete FROM short_urls WHERE id < ' + target, function (err, rows, fields) {
          if (err) {
            console.log(err);
          } else {}
        });
      }

    })
  });
  socket.on('get url', function (id) {
      const sql = "SELECT * FROM short_urls WHERE id=$1";
      const values = [id];

      client.query(sql,values).then(res => {
        io.to(socket.id).emit('url', res.rows[0]);
      })
  });

});

server.listen(listenport, function () {
  console.log('-----------------------------------------');
  console.log('EliyaLib' + version);
  console.log('-----------------------------------------');
});
