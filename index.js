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
app.use(express.static('public'));
app.set('view engine', 'ejs');
const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 
const viewFolder = path.join(__dirname, './views/');

app.get('/', function(req, res){
	res.render(viewFolder+'index.ejs', {
		title: 'Eliya',
		data: {}
	});
});
app.get('/comp/:w', function(req, res){
	const canvas = createCanvas(286, 194);
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	const units = req.params.w.replace('.png','').split("-");

	var count=0;
	for (i=0;i<units.length;i++){
		loadImage('./public/img/assets/chars/'+units[i]+'/square_0.png').then((image) => {
			ctx.drawImage(image, 10+(count%3)*92, 10+Math.floor(count/3)*92, 82, 82);
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

/*http://eliya-bot.herokuapp.com/comp/ruin_girl_halfanv-ruin_girl-illusionist-starbreak_hunter-priest-prince_zero.png*/

});

var mysql = require('mysql');
var connection = mysql.createConnection(process.env.JAWSDB_URL);

connection.connect();

function Client(id, name, device) {
  this.id = id;
  this.name = name;
  this.device = device;
}
const DB = require('./data')
var data = DB.getData();

io.on('connection', function(socket){

	io.to(socket.id).emit('data',data);	

	socket.on('add url', function(list){
		connection.query('INSERT INTO short_urls SET url="'+list+'"',function(err, rows, fields) {
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