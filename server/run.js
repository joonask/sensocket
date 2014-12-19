var express = require('express')

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sensorSocket = io.of('/sensortag');

var sensor = require('../sensor');


var config = {
  pub: __dirname + "/../public",
  port: 8080
};

server.listen(config.port, function() {
  console.log("server listening on http://localhost:" + config.port + " serving " + config.pub);
  sensor.emit('connect');
});

sensor.on('connected', function(name) {
  console.log("Sensor connected to " + name);
  sensorSocket.emit('connected', name);
});
sensor.on('disconnected', function() {
  console.log("Sensor disconnected");
  sensorSocket.emit('disconnected');
});

sensor.on('humidity', function(data) {
  console.log("humidity", data);
  sensorSocket.emit('humidity', data);
});

sensor.on('magneto', function(data) {
  console.log("magneto", data);
  sensorSocket.emit('magneto', data);
});

app.use(express.static(config.pub));
sensorSocket.on('connection', function (socket) {
  console.log("client connected");
  socket.on('stop', function() {
    sensor.emit('disconnect');
  });

  socket.on('start', function() {
    sensor.emit('connect');
  });
});
