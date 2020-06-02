// Run dotenv
require('dotenv').config();
const express = require('express');
const app = express();
const version = '0.1';
const listenport = process.env.PORT || 8888;
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