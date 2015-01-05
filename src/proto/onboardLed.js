var tessel = require('tessel');

function blinkLoop(led, value) {
  led.write(value);
  setTimeout(blinkLoop, 200, led, !value);
}

// Blink all the onboard LEDs on the tessel.
tessel.led.forEach(function(led) {
  blinkLoop(led, true);
});
