'use strict';

var mixins = {};

function EventChain(context) {
  var steps, stepsCopy, update;

  steps = [];

  // Called every frame.
  update = function() {
    if (!stepsCopy || !stepsCopy.length) {
      stepsCopy = steps.slice(0);
    }
    if (steps && steps.length) {
      steps[0]();
    }
  };

  for (var name in mixins) {
    update[name] = mixins[name](context, steps);
  }

  update.reset = function() {
    var args = [1, 0].concat(stepsCopy.slice(0));
    Array.prototype.splice.apply(steps, args);
  };

  // Returned from this factory thing.
  return update;
};

EventChain.mixin = function(name, fn) {
  mixins[name] = fn;
};

EventChain.mixin('then', function(context, steps) {
  return function(doThis) {
    steps.push(function then() {
      // Update.
      doThis.call(context);
      // End.
      steps.shift();
    });
    return this;
  };
});

EventChain.mixin('thenUntil', function(context, steps) {
  return function(doThis, predicate) {
    steps.push(function thenUntil() {
      if( !predicate.call(context) ){
        doThis.call(context);
      }

      if( predicate.call(context) ){
        steps.shift();
        var func = steps[0];
        if( func ){
          func();
        }
      }
    });
    return this;
  };
});

EventChain.mixin('waitUntil', function(context, steps) {
  return function(predicate) {
    var doThis = function() {
      return;
    };
    steps.push(function waitUntil() {
      if( !predicate.call(context) ){
        doThis.call(context);
      }

      if( predicate.call(context) ){
        steps.shift();
        var func = steps[0];
        if( func ){
          func();
        }
      }
    });
    return this;
  };
});

EventChain.mixin('wait', function(context, steps) {
  return function(secs) {
    var decrement = secs * 1000;
    var lastTime = 0;
    steps.push(function wait() {
      var delta = 0;
      if (lastTime !== 0) {
        delta = Date.now() - lastTime;
      }
      lastTime = Date.now();
      // Update.
      if (decrement) {
        decrement -= delta;
      }
      // End.
      if (decrement <= 0) {
        steps.shift();
        // Necessary because of repeat.
        decrement = secs * 1000;
      }
    });
    return this;
  };
});

EventChain.mixin('during', function(context, steps) {
  return function(doThis) {
    if (!steps) {
      throw new Error('during only works with previous step!');
    }
    var func = steps[steps.length - 1];
    steps[steps.length - 1] = function during() {
      doThis.call(context);
      func();
    };
    return this;
  };
});

EventChain.mixin('repeat', function(context, steps) {
  return function(times) {
    var stepsCopy, originalTimes;
    times = times || Infinity;
    originalTimes = times;
    steps.push(function repeat() {
      times -= 1;
      if (times > 0) {
        var args = stepsCopy.slice(0);
        // Workaround until tessel fixes https://github.com/tessel/runtime/issues/699 .
        args.unshift(0);
        args.unshift(1);
        Array.prototype.splice.apply(steps, args);
      } else {
        // For successive repeats.
        times = originalTimes;
      }
      // End.
      steps.shift();
    });
    stepsCopy = steps.slice(0);
    return this;
  };
});

EventChain.mixin('every', function(context) {
  return function(sec, doThis) {
    return this.during(
      EventChain(context)
        .wait(sec)
        .then(doThis)
        .repeat()
    );
  };
});

EventChain.mixin('orUntil', function(context, steps) {
  return function(predicate) {
    if (!steps) {
      throw new Error('orUntil only works with previous step!');
    }
    var func = steps[steps.length - 1];
    steps[steps.length - 1] = function orUntil() {
      if (predicate.call(context)) {
        steps.shift();
        return;
      }
      func();
    };
    return this;
  };
});

module.exports = EventChain;
