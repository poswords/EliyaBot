// Run dotenv
require('dotenv').config();
const express = require('express');
const app = express();
const version = '0.1';
const listenport = 8080;
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
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

function Client(id, name, device) {
  this.id = id;
  this.name = name;
  this.device = device;
}
const DB = require('./data')
var data = DB.getData();

io.on('connection', function(socket){
	console.log("someone connected");
	socket.emit('connected', {});
  
});

server.listen(listenport, function(){
  console.log('-----------------------------------------');
  console.log('EliyaLib'+version);
  console.log('-----------------------------------------');
});