var EventEmitter = require('events').EventEmitter;

var RandomTimer = function(min, max) {

    this.min = min;
    this.max = max;

    function randomDelay(min, max) {

        return Math.floor(Math.random() * (max - min + 1) + min);

    }

    var self = this;

    var nextTick = function() {

        self.emit('tick');

        setTimeout(nextTick, randomDelay(self.min, self.max));

    }

    nextTick();

};

RandomTimer.prototype = new EventEmitter;

module.exports = RandomTimer;
