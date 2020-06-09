// Run dotenv
require('dotenv').config();
const express = require('express');
const app = express();
const version = '0.1';
const listenport = process.env.PORT || 8888;
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
const { createCanvas, loadImage } = require('canvas')
const path = require('path');
app.use(express.static('public', {maxAge: "30d"}));
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 
const viewFolder = path.join(__dirname, './views/');
const DB = require('./data')
var data = DB.getData();

app.get('/', function(req, res){
	res.render(viewFolder+'index.ejs', {
		title: 'Eliya',
		data: {}
	});
});
app.get('/:id(\\d+)/', function(req, res){
	res.render(viewFolder+'index.ejs', {
		title: 'Eliya',
		data: {listid: req.params.id }
	});
});
app.get('/list', function(req, res){
	res.render(viewFolder+'index.ejs', {
		title: 'Eliya',
		data: {listview: true}
	});
});
app.get('/comp/:w', function(req, res){
	const canvas = createCanvas(480, 205);
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	const units = req.params.w.replace('.png','').split("-");

	var count=0;
	loadImage('./public/img/party_full.png').then((bg) => {
		ctx.drawImage(bg, 0,0, 480, 205);
		for (i=0;i<units.length;i++){
			var imageUrl = '';
			if (i<6){
				imageUrl = './public/img/assets/chars/'+units[i]+'/square_0.png'
			}else{ 
				imageUrl = './public/img/assets/item/equipment/'+units[i]+'.png'
			}
			loadImage(imageUrl).then((image) => {
				var width = 82;
				var x,y;
				switch(count){
					case 0:
					case 2:
					case 4:
						x = 10+Math.floor(count/2)*160;
						y = 10;
						break;
					case 1:
					case 3:
					case 5:
						x = 81+Math.floor(count/2)*160;
						y = 110;
						width= 69;
						break;
					case 6:
					case 8:
					case 10:						
						x = 96+Math.floor(count/2)*160;
						y = 26;
						width= 54;						
						break;
					default:
						x = 8+Math.floor(count/2)*160;
						y = 123;
						width= 54;						
						break;						
				}
				ctx.drawImage(image, x, y, width, width);
				count++;
				if (count >= units.length){
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
	data = DB.getData();
	res.send("webapp updated!");
});

var mysql = require('mysql');
var connection = mysql.createConnection(process.env.JAWSDB_URL);

connection.connect();

function Client(id, name, device) {
  this.id = id;
  this.name = name;
  this.device = device;
}

io.on('connection', function(socket){
	io.to(socket.id).emit('equips',data.equips);	
	io.to(socket.id).emit('chars',data.chars);	

	socket.on('add url', function(list){
		connection.query('INSERT INTO short_urls SET url="'+list.chars+'", equips="'+list.equips+'"',function(err, rows, fields) {
				//if(err) throw err
				if (err) {
					console.log(err);
				} else {
					io.to(socket.id).emit('url added', {id:rows.insertId, url:list});
				}
			  });	 
		});
	socket.on('get url', function(id){
		connection.query('SELECT * FROM short_urls WHERE id='+id,function(err, rows, fields) {			
				//if(err) throw err
				if (err) {
					console.log(err);
				} else {
					rows.forEach(function(row){
						delete row.created_date;
					});
					io.to(socket.id).emit('url', rows[0]);
				}
			  });	 
		});	
	
});

server.listen(listenport, function(){
  console.log('-----------------------------------------');
  console.log('EliyaLib'+version);
  console.log('-----------------------------------------');
});