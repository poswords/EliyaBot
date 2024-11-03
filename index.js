// Run dotenv
require('dotenv').config();
const express = require('express');
const compression = require('compression');
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
const clone = require('clone');
const {
  createCanvas,
  loadImage
} = require('canvas');
const path = require('path');
app.use(compression());
if(process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`)
    else
      next()
  })
}
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
    preload: ['en', 'ja', 'zh-TW', 'gl'],
    fallbackLng: ['en']

  });
app.use(i18nextMiddleware.handle(i18next));
const viewFolder = path.join(__dirname, './views/');
const DB = require('./data');
var data,datagl,dataja,datazhtw;
function until(conditionFunction) {

  const poll = resolve => {
    if(conditionFunction()) resolve();
    else setTimeout(_ => poll(resolve), 2000);
  }

  return new Promise(poll).catch((error) => {});
}
function calcGauge(text){
  if (!text){
    return {
      Target: "self",
      Condition: "",
      Every: 0,      
      EveryCond: "",      
      IsMain: false,
      Amount: 0
    }
  }
  var match = text.toLowerCase().match(/hen battle begins, (own|party members\'|leader\'s|.* characters\'|other .* characters\'|other party members\') skill gauge \+(\d+.?\d+)+%/);
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
  if (!text){
    return {
      Target: "self",
      Condition: "",
      Every: 0,      
      EveryCond: "",      
      IsMain: false,
      Amount: 0
    }
  }
  var match = text.toLowerCase().match(/(.*) max skill gauge \+(\d+.?\d+)+%/);
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
  datagl = DB.getData('gl');
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
    if (i.DevNicknames == 'lazy_genious'){
      i.Gauges.Ability2 = {
        Target: 'own',
        Condition: '',
        Every: '',
        EveryCond: '',
        IsMain: '',
        Amount: 40
      }
    }
    if (i.Ability4){
      i.ManaBoard2 = true;
    }else{
      i.ManaBoard2 = false;
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
    if (i.DevNicknames == 'staff_0009'){
      i.Gauges.AwakenLv5 = {
        Target: 'own',
        Condition: '',
        Every: 0,
        EveryCond: '',
        IsMain: false,
        Amount: '50'
      }
    }       
    i.MaxGauges = {
      WeaponSkill:calcMaxGauge(i.WeaponSkill),
      AwakenLv3:calcMaxGauge(i.AwakenLv3),
      AwakenLv5:calcMaxGauge(i.AwakenLv5),
      AbilitySoul:calcMaxGauge(i.AbilitySoul)
    }        
  });  


  dataja = clone(data);

  dataja.chars.forEach(function (i) {
    var ijp = datajatemp.chars.find(e => e.DevNicknames == i.DevNicknames)
    if (ijp){
      if (ijp.ZHName!==""){i.ZHName = ijp.ZHName;}
      if (ijp.LeaderBuff!==""){i.LeaderBuff = ijp.LeaderBuff;}
      if (ijp.Skill!==""){i.Skill = ijp.Skill;}
      if (ijp.Ability1!==""){i.Ability1 = ijp.Ability1;}
      if (ijp.Ability2!==""){i.Ability2 = ijp.Ability2;}
      if (ijp.Ability3!==""){i.Ability3 = ijp.Ability3;}
      if (ijp.Ability4!==""){i.Ability4 = ijp.Ability4;}
      if (ijp.Ability5!==""){i.Ability5 = ijp.Ability5;}
      if (ijp.Ability6!==""){i.Ability6 = ijp.Ability6;}
      if (ijp.Obtain!==""){i.Obtain = ijp.Obtain;}
    }
    if (i.Obtain){
      i.Obtain = i.Obtain.replace('Limited','限定');
      i.Obtain = i.Obtain.replace('Meteor Festival Gacha', '流星祭ガチャ');
    }
  }); 
  dataja.equips.forEach(function (i) {
    var ijp = datajatemp.equips.find(e => e.DevNicknames == i.DevNicknames)
    if (ijp){
      if (ijp.WeaponSkill!==""){i.WeaponSkill = ijp.WeaponSkill;}
      if (ijp.AwakenLv3!==""){i.AwakenLv3 = ijp.AwakenLv3;}
      if (ijp.AwakenLv5!==""){i.AwakenLv5 = ijp.AwakenLv5;}
      if (ijp.AbilitySoul!==""){i.AbilitySoul = ijp.AbilitySoul;}
      if (ijp.Obtain!==""){i.Obtain = ijp.Obtain;}
    }
    if (i.Obtain){
      i.Obtain = i.Obtain.replace('Limited','限定');
    }        
  }); 

  datazhtw = clone(data);
  datazhtw.chars.forEach(function (i) {
    var itw = datazhtwtemp.chars.find(e => e.DevNicknames == i.DevNicknames)
    if (itw){
      if (itw.SubName!==""){i.SubName = itw.SubName;}
      if (itw.ZHName!==""){i.ZHName = itw.ZHName;}
      if (itw.LeaderBuff!==""){i.LeaderBuff = itw.LeaderBuff;}
      if (itw.Skill!==""){i.Skill = itw.Skill;}
      if (itw.Ability1!==""){i.Ability1 = itw.Ability1;}
      if (itw.Ability2!==""){i.Ability2 = itw.Ability2;}
      if (itw.Ability3!==""){i.Ability3 = itw.Ability3;}
      if (itw.Ability4!==""){i.Ability4 = itw.Ability4;}
      if (itw.Ability5!==""){i.Ability5 = itw.Ability5;}
      if (itw.Ability6!==""){i.Ability6 = itw.Ability6;}
      if (itw.Obtain!==""){i.Obtain = itw.Obtain;}
    }else{
      i.ZHName = "";
    }
    if (i.Obtain){
      i.Obtain = i.Obtain.replace('Limited','限定');
    }         

  }); 
  datazhtw.equips.forEach(function (i) {
    var itw = datazhtwtemp.equips.find(e => e.DevNicknames == i.DevNicknames)
    if (itw){
      i.ZHName = itw.ZHName;
      if (itw.WeaponSkill!==""){i.WeaponSkill = itw.WeaponSkill;}
      if (itw.AwakenLv3!==""){i.AwakenLv3 = itw.AwakenLv3;}
      if (itw.AwakenLv5!==""){i.AwakenLv5 = itw.AwakenLv5;}
      if (itw.AbilitySoul!==""){i.AbilitySoul = itw.AbilitySoul;}
      if (itw.Obtain!==""){i.Obtain = itw.Obtain;
        i.Obtain = i.Obtain.replace('Limited','限定');}
    }else{
      i.ZHName = "";
    }
    if (i.Obtain){
      i.Obtain = i.Obtain.replace('Limited','限定');
    }        
  });  

  datagl.chars.forEach(function (i) {
    i.Gauges = {
      LeaderBuff:calcGauge(i.LeaderBuff),
      Ability1:calcGauge(i.Ability1),
      Ability2:calcGauge(i.Ability2),
      Ability3:calcGauge(i.Ability3),
      Ability4:calcGauge(i.Ability4),
      Ability5:calcGauge(i.Ability5),
      Ability6:calcGauge(i.Ability6)
    }
    if (i.DevNicknames == 'lazy_genious'){
      i.Gauges.Ability2 = {
        Target: 'own',
        Condition: '',
        Every: '',
        EveryCond: '',
        IsMain: '',
        Amount: 40
      }
    }
    if (i.Ability4){
      i.ManaBoard2 = true;
    }else{
      i.ManaBoard2 = false;
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
  datagl.equips.forEach(function (i) {
    i.Gauges = {
      WeaponSkill:calcGauge(i.WeaponSkill),
      AwakenLv3:calcGauge(i.AwakenLv3),
      AwakenLv5:calcGauge(i.AwakenLv5),
      AbilitySoul:calcGauge(i.AbilitySoul)
    }    
    if (i.DevNicknames == 'staff_0009'){
      i.Gauges.AwakenLv5 = {
        Target: 'own',
        Condition: '',
        Every: 0,
        EveryCond: '',
        IsMain: false,
        Amount: '50'
      }
    }       
    i.MaxGauges = {
      WeaponSkill:calcMaxGauge(i.WeaponSkill),
      AwakenLv3:calcMaxGauge(i.AwakenLv3),
      AwakenLv5:calcMaxGauge(i.AwakenLv5),
      AbilitySoul:calcMaxGauge(i.AbilitySoul)
    }        
  });    
}
updateDB();
const {
  Client
} = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
})
/*client.connect();*/

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
app.get('/gl/', function (req, res) {
  res.render(viewFolder + 'indexgl.ejs', {
    title: 'Eliya',
    data: {},
    server: req.query.sv?req.query.sv:"gl"
  });
});
app.get('/gl/:id(\\d+)/', function (req, res) {
  res.render(viewFolder + 'indexgl.ejs', {
    title: 'Eliya',
    data: {
      listid: req.params.id
    },
    server: req.query.sv?req.query.sv:"gl"
  });
});
app.get('/gl/list', function (req, res) {
  res.render(viewFolder + 'indexgl.ejs', {
    title: 'Eliya',
    data: {
      listview: true
    },
    server: req.query.sv?req.query.sv:"gl"
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
  var retry = setInterval(function(){
    if (data.chars){
      res.json({
        "chars": data.chars
      });
      clearInterval(retry);
    }
  },10)
});
app.get('/data/zh-TW/chars.json', function (req, res) {
  var retry = setInterval(function(){
    if (data.chars){
      res.json({
        "chars": datazhtw.chars
      });
      clearInterval(retry);
    }
  },10)  
});
app.get('/data/ja/chars.json', function (req, res) {
  var retry = setInterval(function(){
    if (data.chars){
      res.json({
        "chars": dataja.chars
      });
      clearInterval(retry);
    }
  },10)    
});
app.get('/data/en/equips.json', function (req, res) {
  var retry = setInterval(function(){
    if (data.chars){
      res.json({
        "equips": data.equips
      });
      clearInterval(retry);
    }
  },10)   
});
app.get('/data/en/events.json', function (req, res) {
  var retry = setInterval(function(){
    if (data.events){
      res.json({
        "events": data.events
      });
      clearInterval(retry);
    }
  },10)   
});
app.get('/data/gl/chars.json', function (req, res) {
  var retry = setInterval(function(){
    if (datagl.chars){
      res.json({
        "chars": datagl.chars
      });
      clearInterval(retry);
    }
  },10)
});
app.get('/data/gl/equips.json', function (req, res) {
  var retry = setInterval(function(){
    if (datagl.chars){
      res.json({
        "equips": datagl.equips
      });
      clearInterval(retry);
    }
  },10)   
});
app.get('/data/gl/events.json', function (req, res) {
  var retry = setInterval(function(){
    if (datagl.events){
      res.json({
        "events": datagl.events
      });
      clearInterval(retry);
    }
  },10)   
});
app.get('/data/zh-TW/equips.json', function (req, res) {
  var retry = setInterval(function(){
    if (data.chars){
      res.json({
        "equips": datazhtw.equips
      });
      clearInterval(retry);
    }
  },10)     
});
app.get('/data/ja/equips.json', function (req, res) {
  var retry = setInterval(function(){
    if (data.chars){
      res.json({
        "equips": dataja.equips
      });
      clearInterval(retry);
    }
  },100)    
});
app.get('/comp/:w', function (req, res) {
  var retry = setInterval(function(){
    if (data.chars){  
      clearInterval(retry);      
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
    }
  },10)       
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
    var retry = setInterval(function(){
      if (data.chars){
        clearInterval(retry);        
        switch (lang) {
          case "ja":
            io.to(socket.id).emit('equips', dataja.equips);
            io.to(socket.id).emit('chars', dataja.chars);
            break;
          case "zh-TW":
            io.to(socket.id).emit('equips', datazhtw.equips);
            io.to(socket.id).emit('chars', datazhtw.chars);
            break;
          case "gl":
              io.to(socket.id).emit('equips', datagl.equips);
              io.to(socket.id).emit('chars', datagl.chars);
              break;            
          default:
            io.to(socket.id).emit('equips', data.equips);
            io.to(socket.id).emit('chars', data.chars);
        }
      }
    },10);
  });
  
  /*socket.on('connected-title', function (lang) {
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
  });*/


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

      var target = id - 9999980;
		
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
    var retry = setInterval(function(){
      if (data.chars){          
        clearInterval(retry);        
        const sql = "SELECT * FROM short_urls WHERE id=$1";
        const values = [id];
        client.query(sql,values).then(res => {
          io.to(socket.id).emit('url', res.rows[0]);
        })
      }
    },10);
  });

});

server.listen(listenport, function () {
  console.log('-----------------------------------------');
  console.log('EliyaLib' + version);
  console.log('-----------------------------------------');
});
