var tessel = require('tessel');

// Switch connected to GP3, LED connected to GP4;
var gpio = tessel.port['GPIO'];
var button = gpio.pin['G3'];
var led = gpio.pin['G4'];

button.input();
led.output();

var lightPin = false;
var stopCheck = false;

function checkPin() {
  var val = button.read();
  // Pin is HIGH when button isn't depressed.
  if (val) {
    stopCheck = false;
  } else if (!stopCheck) {
    lightPin = !lightPin;
    stopCheck = true;
  }
  led.write(lightPin);
}

setInterval(checkPin, 10);
