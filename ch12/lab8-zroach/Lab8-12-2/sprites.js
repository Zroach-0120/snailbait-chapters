// Sprite constructor
var Sprite = function (type, artist, behaviors) {
    var DEFAULT_WIDTH = 10,
        DEFAULT_HEIGHT = 10,
        DEFAULT_OPACITY = 1.0;

    this.artist = artist;
    this.type = type;
    this.behaviors = behaviors || [];

    this.hOffset = 0;   // Horizontal offset for scrolling
    this.left = 0;
    this.top = 0;
    this.width = DEFAULT_WIDTH;
    this.height = DEFAULT_HEIGHT;
    this.velocityX = 0;
    this.velocityY = 0;
    this.opacity = DEFAULT_OPACITY;
    this.visible = true;
};

// Sprite methods
Sprite.prototype = {
    draw: function (context) {
        context.save();
        context.globalAlpha = this.opacity;

        if (this.visible && this.artist) {
            this.artist.draw(this, context);
        }

        context.restore();
    },

    update: function (now, fps, context, lastAnimationFrameTime) {
        for (var i = 0; i < this.behaviors.length; ++i) {
            this.behaviors[i].execute(
                this, now, fps, context, lastAnimationFrameTime
            );
        }
    },

    calculateCollisionRectangle: function () {
        var game = window.snailBait;
        var margin = { top: 0, bottom: 0, left: 0, right: 0 };

        if (game && game.COLLISION_MARGINS && game.COLLISION_MARGINS[this.type]) {
            margin = game.COLLISION_MARGINS[this.type];
        }

        return {
            left: this.left + margin.left,
            right: this.left + this.width - margin.right,
            top: this.top + margin.top,
            bottom: this.top + this.height - margin.bottom,
            centerX: this.left + this.width / 2,
            centerY: this.top + this.height / 2
        };
    }
};

// Sprite sheet artist
var SpriteSheetArtist = function (spritesheet, cells) {
    this.cells = cells;
    this.spritesheet = spritesheet;
    this.cellIndex = 0;
};

SpriteSheetArtist.prototype = {
    draw: function (sprite, context) {
        var cell = this.cells[this.cellIndex];
        context.drawImage(
            this.spritesheet,
            cell.left, cell.top, cell.width, cell.height,
            sprite.left, sprite.top, cell.width, cell.height
        );
    },

    advance: function () {
        if (this.cellIndex === this.cells.length - 1) {
            this.cellIndex = 0;
        } else {
            this.cellIndex++;
        }
    }
};

// CycleBehavior - advances sprite animation frames at regular intervals
var CycleBehavior = function (duration, interval) {
    this.duration = duration || 1000;  // Total duration of animation cycle
    this.interval = interval || 50;     // Time between frame advances (milliseconds)
    this.lastAdvanceTime = 0;
};

CycleBehavior.prototype = {
    execute: function (sprite, now, fps, context, lastAnimationFrameTime) {
        if (this.lastAdvanceTime === 0) {
            this.lastAdvanceTime = now;
            return;
        }

        if (now - this.lastAdvanceTime > this.interval) {
            if (sprite.artist && sprite.artist.advance) {
                sprite.artist.advance();
            }
            this.lastAdvanceTime = now;
        }
    }
};

// RunBehavior - animates the runner when moving
var RunBehavior = function () {
    this.lastAdvanceTime = 0;
    this.ANIMATION_INTERVAL = 80; // milliseconds between frames
};

RunBehavior.prototype = {
    execute: function (sprite, now, fps, context, lastAnimationFrameTime) {
        // Only animate if on a platform and the game is scrolling
        if (!sprite.platform || sprite.runAnimationRate === 0) {
            return;
        }

        if (this.lastAdvanceTime === 0) {
            this.lastAdvanceTime = now;
            return;
        }

        if (now - this.lastAdvanceTime > this.ANIMATION_INTERVAL) {
            if (sprite.artist && sprite.artist.advance) {
                sprite.artist.advance();
            }
            this.lastAdvanceTime = now;
        }
    }
};

// SnailShootBehavior - makes snails shoot bombs periodically
var SnailShootBehavior = function () {
    this.lastShootTime = 0;
    this.SHOOT_INTERVAL = 1000; // 1 second between shots
};

SnailShootBehavior.prototype = {
    execute: function (sprite, now, fps, context, lastAnimationFrameTime) {
        var bomb;

        if (this.lastShootTime === 0) {
            this.lastShootTime = now;
            return;
        }

        // Check if it's time to shoot
        if (now - this.lastShootTime > this.SHOOT_INTERVAL) {
            // Create and shoot a snail bomb
            if (sprite.shootBomb) {
                sprite.shootBomb();
            }
            this.lastShootTime = now;
        }
    }
};