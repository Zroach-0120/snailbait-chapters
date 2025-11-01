// ========================================
// TIME SYSTEM
// ========================================

var TimeSystem = function () {
    this.transducer = function (elapsedTime) { return elapsedTime; };
    this.timer = new AnimationTimer();
    this.lastTimeTransducerWasSet = 0;
    this.gameTime = 0;
};

TimeSystem.prototype = {
    start: function () {
        this.timer.start();
    },

    reset: function () {
        this.timer.stop();
        this.timer.reset();
        this.timer.start();
        this.lastTimeTransducerWasSet = this.gameTime;
    },

    setTransducer: function (fn, duration) {
        

        var lastTransducer = this.transducer,
            self = this;

        this.calculateGameTime();
        this.reset();
        this.transducer = fn;

        if (duration) {
            setTimeout(function (e) {
                self.setTransducer(lastTransducer);
            }, duration);
        }
    },

    calculateGameTime: function () {
        this.gameTime = this.lastTimeTransducerWasSet +
            this.transducer(this.timer.getElapsedTime());
        this.reset();

        return this.gameTime;
    }
};