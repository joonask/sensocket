var _ = require('lodash');
var async = require('async');
var SensorTag = require('sensortag');
var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter();

function magnetoChange(x, y, z) {
  var data = {x: x, y: y, z: z};
  events.emit('magneto', data);
}
function humidityChange(t, h) {
  var data = {temperature: t, humidity: h};
  events.emit('humidity', data);
}
function disconnected() {
  events.emit('disconnected');
}
function connected(name) {
  events.emit('connected', name);
};

events.on('connect', startDiscover);


function startDiscover() {
  console.log("Starting discover..");
  SensorTag.discover(function(st) {
    st.once('disconnect', function() {
      disconnected();
    });

    events.once('disconnect', function() {
      st.disconnect();
    });

    st.on('magnetometerChange', magnetoChange);
    st.on('humidityChange', humidityChange);

    async.series([
      function(callback) {
        st.connect(callback);
      },
      function(cb) {
        //console.log("st.discoverServicesAndCharacteristics");
        st.discoverServicesAndCharacteristics(cb);
      },
      function(callback) {
        console.log('readDeviceName');
        st.readDeviceName(function(deviceName) {
          connected(deviceName);
          callback();
        });
      },
      function(cb) {
        st.enableMagnetometer(cb);
      },
      function(cb) {
        st.setMagnetometerPeriod(500, cb);
      },
      function(cb) {
        st.notifyMagnetometer(cb);
      },
      function(cb) {
        st.enableHumidity(cb);
      },
      function(cb) {
        st.notifyHumidity(cb);
      }

    ]);
  });
};

module.exports = events;