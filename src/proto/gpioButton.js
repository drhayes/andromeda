var tessel = require('tessel');

// Switch connected to GP3.
var gpio = tessel.port['GPIO'];
var pin = gpio.pin['G3'];

pin.input();

function checkPin() {
  var val = pin.read();
  tessel.led[1].write(val);
  setInterval(checkPin, 200);
}

checkPin();
