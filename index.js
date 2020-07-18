// Run dotenv
require('dotenv').config();
const express = require('express');
const app = express();
const version = '0.1';
const listenport = process.env.PORT || 8888;
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
var data = DB.getData('en');
var dataja = DB.getData('ja');
var datazhtw = DB.getData('zh-TW');
const {
  Client
} = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})
app.get('/', function (req, res) {
  res.render(viewFolder + 'index.ejs', {
    title: 'Eliya',
    data: {}
  });
});
app.get('/:id(\\d+)/', function (req, res) {
  res.render(viewFolder + 'index.ejs', {
    title: 'Eliya',
    data: {
      listid: req.params.id
    }
  });
});
app.get('/list', function (req, res) {
  res.render(viewFolder + 'index.ejs', {
    title: 'Eliya',
    data: {
      listview: true
    }
  });
});
app.get('/:id(\\d+)/', function (req, res) {
  res.render(viewFolder + 'char.js', {
    title: 'Eliya',
    data: {
      listid: req.params.id
    }
  });
});
app.get('/titles', function (req, res) {
  res.render(viewFolder + 'titles.ejs', {
    title: 'Eliya',
    data: {}
  });
});
app.get('/titles/list', function (req, res) {
  res.render(viewFolder + 'titles.ejs', {
    title: 'Eliya',
    data: {
      listview: true
    }
  });
});
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
  const canvas = createCanvas(480, 205);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var url = req.params.w.replace('.png', '');
  var lang = '';
  if (url.indexOf('.') > 0) {
    lang = '_' + url.split('.')[1];
    url = url.split('.')[0];
  }
  const units = url.split("-");
  var count = 0;
  loadImage('./public/img/party_full' + lang + '.png').then((bg) => {
    ctx.drawImage(bg, 0, 0, 480, 205);
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
            x = 13 + ((count - 7) / 2) * 160;
            y = 135;
            width = 44;
            break;
          default:
            break;
        }
        ctx.drawImage(image, x, y, width, width);
        count++;
        if (count >= units.length) {
          var data = canvas.toDataURL();
          data = data.replace(/^data:image\/png;base64,/, '');
          var img = new Buffer.from(data, 'base64');
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
          });
          res.end(img);
        }
      })
    }
  });
});
app.post('/update', async (req, res) => {
  data = DB.getData('en');
  dataja = DB.getData('ja');
  datazhtw = DB.getData('zh-TW');
  res.send("webapp updated!");
});

var mysql = require('mysql');
var connection = mysql.createConnection(process.env.JAWSDB_URL);

connection.connect();
client.connect();
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
    client.query("INSERT INTO short_urls (url,equips) VALUES ('" + list.chars + "', '" + list.equips + "') RETURNING id", function (err, res) {
      if (err) throw err;
      var id;
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
    connection.query('SELECT * FROM short_urls WHERE id=' + id, function (err, rows, fields) {
      //if(err) throw err
      if (err) {
        console.log(err);
      } else {
        if (rows.length == 0) {
          client.query('SELECT * FROM short_urls WHERE id=' + id, function (err, res) {
            if (err) throw err;
            res.rows.forEach(function (row) {
              delete row.created_date;
            });
            io.to(socket.id).emit('url', res.rows[0]);
          })
        } else {
          rows.forEach(function (row) {
            delete row.created_date;
          });
          io.to(socket.id).emit('url', rows[0]);
        }

      }
    });

  });

});

server.listen(listenport, function () {
  console.log('-----------------------------------------');
  console.log('EliyaLib' + version);
  console.log('-----------------------------------------');
});
