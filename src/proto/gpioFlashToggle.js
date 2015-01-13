var tessel = require('tessel');
var EventChain = require('../../lib/eventChain');

// Switch connected to GP3, LED connected to GP4;
var gpio = tessel.port['GPIO'];
var button = gpio.pin['G3'];
var led = gpio.pin['G4'];

button.input();
led.output();

var lightPin = false;
var finalValue = false;
var stopCheck = false;
var buttonChain;

function makeButtonChain() {
  console.log('make chain');
  buttonChain = new EventChain()
    .then(function() {
      lightPin = finalValue = !finalValue;
      led.write(lightPin);
    })
    .wait(.5)
    .every(.1, function() {
      lightPin = !lightPin;
      led.write(lightPin);
    })
    .then(function() {
      lightPin = finalValue;
      buttonChain = null;
      led.write(lightPin);
    })
}

function checkPin() {
  var val = button.read();
  // Pin is HIGH when button isn't depressed.
  // Pin is LOW when button is pushed.
  if (!val && !buttonChain) {
    makeButtonChain();
  }
  if (buttonChain) {
    buttonChain();
  }
}

setInterval(checkPin, 10);
