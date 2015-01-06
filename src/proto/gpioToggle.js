var tessel = require('tessel');

// Switch connected to GP3.
var gpio = tessel.port['GPIO'];
var pin = gpio.pin['G3'];

pin.input();

var lightPin = false;
var stopCheck = false;

function checkPin() {
  var val = pin.read();
  // Pin is HIGH when button isn't depressed.
  if (val) {
    stopCheck = false;
  } else if (!stopCheck) {
    lightPin = !lightPin;
    stopCheck = true;
  }
  tessel.led[1].write(lightPin ? 1 : 0);
}

setInterval(checkPin, 10);
