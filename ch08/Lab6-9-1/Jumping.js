// ========================================
// STOPWATCH (Must be first!)
// ========================================

var Stopwatch = function () {
    this.startTime = 0;
    this.running = false;
    this.elapsed = undefined;
    this.paused = false;
    this.startPause = 0;
    this.totalPausedTime = 0;
};

Stopwatch.prototype = {
    start: function () {
        var now = +new Date();
        this.startTime = now;
        this.running = true;
        this.totalPausedTime = 0;
        this.startPause = 0;
    },

    stop: function () {
        var now = +new Date();
        if (this.paused) {
            this.unpause();
        }
        this.elapsed = now - this.startTime - this.totalPausedTime;
        this.running = false;
    },

    pause: function () {
        var now = +new Date();
        this.startPause = now;
        this.paused = true;
    },

    unpause: function () {
        var now = +new Date();
        if (!this.paused) {
            return;
        }
        this.totalPausedTime += now - this.startPause;
        this.startPause = 0;
        this.paused = false;
    },

    getElapsedTime: function () {
        var now = +new Date();
        if (this.running) {
            return now - this.startTime - this.totalPausedTime;
        }
        else {
            return this.elapsed;
        }
    },

    isPaused: function () {
        return this.paused;
    },

    isRunning: function () {
        return this.running;
    },

    reset: function () {
        var now = +new Date();
        this.elapsed = 0;
        this.startTime = now;
        this.running = false;
        this.totalPausedTime = 0;
        this.startPause = 0;
    }
};


// ========================================
// ANIMATION TIMER
// ========================================

var AnimationTimer = function (duration, easingFunction) {
    //this.easingFunction = easingFunction;

    if (duration !== undefined) this.duration = duration;
    else this.duration = 1000;

    this.stopwatch = new Stopwatch();
};

// Easing function factory methods
AnimationTimer.makeEaseOutEasingFunction = function (strength) {
    return function (percentComplete) {
        return 1 - Math.pow(1 - percentComplete, strength * 2);
    };
};

AnimationTimer.makeEaseInEasingFunction = function (strength) {
    return function (percentComplete) {
        return Math.pow(percentComplete, strength * 2);
    };
};

AnimationTimer.makeEaseOutInEasingFunction = function () {
    return function (percentComplete) {
        return percentComplete +
            Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI);
    };
};

AnimationTimer.makeEaseInOutEasingFunction = function () {
    return function (percentComplete) {
        return percentComplete -
            Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI);
    };
};

AnimationTimer.prototype = {
    start: function () {
        this.stopwatch.start();
    },

    stop: function () {
        this.stopwatch.stop();
    },

    pause: function () {
        this.stopwatch.pause();
    },

    unpause: function () {
        this.stopwatch.unpause();
    },

    isPaused: function () {
        return this.stopwatch.isPaused();
    },

    isRunning: function () {
        return this.stopwatch.running;
    },

    reset: function () {
        this.stopwatch.reset();
    },

    isExpired: function () {
        return this.stopwatch.getElapsedTime() > this.duration;
    },

    getElapsedTime: function (now) {
        var elapsedTime = this.stopwatch.getElapsedTime(now),
            percentComplete = elapsedTime / this.duration;

        if (this.easingFunction === undefined ||
            percentComplete === 0 ||
            percentComplete > 1) {
            return elapsedTime;
        }

        return elapsedTime *
            (this.easingFunction(percentComplete) / percentComplete);
    }
};


// ========================================
// BOUNCE BEHAVIOR
// ========================================

var BounceBehavior = function (duration, height) {
    this.duration = duration || 1000;
    this.distance = height * 2 || 100;
    this.bouncing = false;

    this.timer =
        new AnimationTimer(this.duration,
            AnimationTimer.makeEaseOutInEasingFunction());

    this.paused = false;
};

BounceBehavior.prototype = {
    execute: function (sprite, now, fps, context, lastAnimationFrameTime) {
        var elapsed, deltaY;

        if (!this.bouncing) {
            this.startBouncing(sprite);
        }
        else {
            elapsed = this.timer.getElapsedTime();

            if (this.timer.isExpired()) {
                this.resetTimer();
                return;
            }

            this.adjustVerticalPosition(sprite, elapsed);
        }
    },

    startBouncing: function (sprite) {
        this.baseline = sprite.top;
        this.bouncing = true;
        this.timer.start();
    },

    resetTimer: function () {
        this.timer.stop();
        this.timer.reset();
        this.timer.start();
    },

    adjustVerticalPosition: function (sprite, elapsed) {
        var rising = false,
            deltaY = this.timer.getElapsedTime() / this.duration *
                this.distance;

        if (elapsed < this.duration / 2)
            rising = true;

        if (rising) {
            sprite.top = this.baseline - deltaY;
        }
        else {
            sprite.top = this.baseline - this.distance + deltaY;
        }
    },

    pause: function (sprite) {
        if (!this.timer.isPaused()) {
            this.timer.pause();
        }
        this.paused = true;
    },

    unpause: function (sprite) {
        if (this.timer.isPaused()) {
            this.timer.unpause();
        }
        this.paused = false;
    }
};


// ========================================
// PULSE BEHAVIOR
// ========================================

var PulseBehavior = function (duration, opacityThreshold) {
    this.duration = duration || 1000;
    this.opacityThreshold = opacityThreshold || 0;

    this.timer =
        new AnimationTimer(this.duration,
            AnimationTimer.makeEaseInOutEasingFunction());

    this.paused = false;
    this.pulsating = false;
};

PulseBehavior.prototype = {
    pause: function (sprite, now) {
        if (!this.timer.isPaused()) {
            this.timer.pause(now);
        }
        this.paused = true;
    },

    unpause: function (sprite, now) {
        if (this.timer.isPaused()) {
            this.timer.unpause(now);
        }
        this.paused = false;
    },

    dim: function (sprite, elapsed) {
        sprite.opacity = 1 - ((1 - this.opacityThreshold) *
            (parseFloat(elapsed) / this.duration));
    },

    brighten: function (sprite, elapsed) {
        sprite.opacity += (1 - this.opacityThreshold) *
            parseFloat(elapsed) / this.duration;
    },

    startPulsing: function (sprite) {
        this.pulsating = true;
        this.timer.start();
    },

    resetTimer: function () {
        this.timer.stop();
        this.timer.reset();
        this.timer.start();
    },

    execute: function (sprite, now, fps, context, lastAnimationFrameTime) {
        var elapsed;

        if (!this.pulsating) {
            this.startPulsing(sprite);
        }
        else {
            elapsed = this.timer.getElapsedTime();

            if (this.timer.isExpired()) {
                this.resetTimer();
                return;
            }

            if (elapsed < this.duration / 2) {
                this.dim(sprite, elapsed);
            }
            else {
                this.brighten(sprite, elapsed);
            }
        }
    }
};