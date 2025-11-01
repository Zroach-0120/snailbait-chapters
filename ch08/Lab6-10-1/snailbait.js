var SnailBait = function () {
    var self = this; // used by inner closures like platformArtist

    this.canvas = document.getElementById('game-canvas');
    this.context = this.canvas.getContext('2d');

    // Constants.........................................................

    this.LEFT = 1;
    this.RIGHT = 2;

    this.SHORT_DELAY = 50; // milliseconds

    this.TRANSPARENT = 0;
    this.OPAQUE = 1.0;

    this.BACKGROUND_VELOCITY = 42;

    this.PLATFORM_HEIGHT = 8;
    this.PLATFORM_STROKE_WIDTH = 2;
    this.PLATFORM_STROKE_STYLE = 'rgb(0,0,0)';

    // Background width and height.......................................

    this.BACKGROUND_WIDTH = 1102;
    this.BACKGROUND_HEIGHT = 400;

    // Loading screen....................................................

    this.loadingElement = document.getElementById('loading');
    this.loadingTitleElement = document.getElementById('loading-title');
    this.runnerAnimatedGIFElement = document.getElementById('loading-animated-gif');

    // Track baselines...................................................

    this.TRACK_1_BASELINE = 323;
    this.TRACK_2_BASELINE = 223;
    this.TRACK_3_BASELINE = 123;

    // Platform scrolling offset (and therefore speed) is
    // PLATFORM_VELOCITY_MULTIPLIER * backgroundOffset: The
    // platforms move PLATFORM_VELOCITY_MULTIPLIER times as
    // fast as the background.

    this.PLATFORM_VELOCITY_MULTIPLIER = 4.35;

    this.STARTING_BACKGROUND_VELOCITY = 0;

    // Define starting runner track (was referenced earlier but not defined)
    this.STARTING_RUNNER_TRACK = 1;

    // Default pacing velocities (were referenced but not defined)
    this.BUTTON_PACE_VELOCITY = 20;
    this.SNAIL_PACE_VELOCITY = 25;

    this.STARTING_BACKGROUND_OFFSET = 0;
    this.STARTING_SPRITE_OFFSET = 0;

    // Jump constants....................................................
    this.JUMP_HEIGHT = 120;
    this.JUMP_DURATION = 1000; // milliseconds

    // States............................................................

    this.paused = false;
    this.PAUSED_CHECK_INTERVAL = 200;
    this.windowHasFocus = true;
    this.countdownInProgress = false;
    this.gameStarted = false;
    this.runnerJumping = false;

    // Images............................................................

    this.spritesheet = new Image();

    // Time..............................................................

    this.lastAnimationFrameTime = 0;
    this.lastFpsUpdateTime = 0;
    this.fps = 60;
    this.timeSystem = new TimeSystem();
    this.timeRate = 1.0;

    // Fps...............................................................

    this.fpsElement = document.getElementById('fps');

    // Toast.............................................................

    this.toastElement = document.getElementById('toast');

    // Instructions......................................................

    this.instructionsElement = document.getElementById('instructions');

    // Copyright.........................................................

    this.copyrightElement = document.getElementById('copyright');

    // Score.............................................................

    this.scoreElement = document.getElementById('score');

    // Sound and music...................................................

    this.soundAndMusicElement = document.getElementById('sound-and-music');

    // Runner track......................................................

    this.runnerTrack = this.STARTING_RUNNER_TRACK;

    // Translation offsets...............................................

    this.backgroundOffset = this.STARTING_BACKGROUND_OFFSET;
    this.spriteOffset = this.STARTING_SPRITE_OFFSET;

    // Velocities........................................................

    this.bgVelocity = this.STARTING_BACKGROUND_VELOCITY;
    this.platformVelocity = undefined;

    // Sprite sheet cells................................................

    this.RUNNER_CELLS_WIDTH = 50; // pixels
    this.RUNNER_CELLS_HEIGHT = 54;

    this.BAT_CELLS_HEIGHT = 34; // Bat cell width varies; not constant 

    this.BEE_CELLS_HEIGHT = 50;
    this.BEE_CELLS_WIDTH = 50;

    this.BUTTON_CELLS_HEIGHT = 20;
    this.BUTTON_CELLS_WIDTH = 31;

    this.COIN_CELLS_HEIGHT = 30;
    this.COIN_CELLS_WIDTH = 30;

    this.EXPLOSION_CELLS_HEIGHT = 62;

    this.RUBY_CELLS_HEIGHT = 30;
    this.RUBY_CELLS_WIDTH = 35;

    this.SAPPHIRE_CELLS_HEIGHT = 30;
    this.SAPPHIRE_CELLS_WIDTH = 35;

    this.SNAIL_BOMB_CELLS_HEIGHT = 20;
    this.SNAIL_BOMB_CELLS_WIDTH = 20;

    this.SNAIL_CELLS_HEIGHT = 34;
    this.SNAIL_CELLS_WIDTH = 64;

    this.batCells = [
        { left: 3, top: 0, width: 36, height: this.BAT_CELLS_HEIGHT },
        { left: 41, top: 0, width: 46, height: this.BAT_CELLS_HEIGHT },
        { left: 93, top: 0, width: 36, height: this.BAT_CELLS_HEIGHT },
        { left: 132, top: 0, width: 46, height: this.BAT_CELLS_HEIGHT }
    ];

    this.batRedEyeCells = [
        { left: 185, top: 0, width: 36, height: this.BAT_CELLS_HEIGHT },
        { left: 222, top: 0, width: 46, height: this.BAT_CELLS_HEIGHT },
        { left: 273, top: 0, width: 36, height: this.BAT_CELLS_HEIGHT },
        { left: 313, top: 0, width: 46, height: this.BAT_CELLS_HEIGHT }
    ];

    this.beeCells = [
        { left: 5, top: 234, width: this.BEE_CELLS_WIDTH, height: this.BEE_CELLS_HEIGHT },
        { left: 75, top: 234, width: this.BEE_CELLS_WIDTH, height: this.BEE_CELLS_HEIGHT },
        { left: 145, top: 234, width: this.BEE_CELLS_WIDTH, height: this.BEE_CELLS_HEIGHT }
    ];

    this.blueCoinCells = [
        { left: 5, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT },
        { left: 5 + this.COIN_CELLS_WIDTH, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT }
    ];

    this.explosionCells = [
        { left: 3, top: 48, width: 52, height: this.EXPLOSION_CELLS_HEIGHT },
        { left: 63, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
        { left: 146, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
        { left: 233, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
        { left: 308, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
        { left: 392, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
        { left: 473, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }
    ];

    // Sprite sheet cells................................................

    this.blueButtonCells = [
        { left: 10, top: 192, width: this.BUTTON_CELLS_WIDTH, height: this.BUTTON_CELLS_HEIGHT },
        { left: 53, top: 192, width: this.BUTTON_CELLS_WIDTH, height: this.BUTTON_CELLS_HEIGHT }
    ];

    this.goldCoinCells = [
        { left: 65, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT },
        { left: 96, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT },
        { left: 128, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT }
    ];

    this.goldButtonCells = [
        { left: 90, top: 190, width: this.BUTTON_CELLS_WIDTH, height: this.BUTTON_CELLS_HEIGHT },
        { left: 132, top: 190, width: this.BUTTON_CELLS_WIDTH, height: this.BUTTON_CELLS_HEIGHT }
    ];

    this.rubyCells = [
        { left: 3, top: 138, width: this.RUBY_CELLS_WIDTH, height: this.RUBY_CELLS_HEIGHT },
        { left: 39, top: 138, width: this.RUBY_CELLS_WIDTH, height: this.RUBY_CELLS_HEIGHT },
        { left: 76, top: 138, width: this.RUBY_CELLS_WIDTH, height: this.RUBY_CELLS_HEIGHT },
        { left: 112, top: 138, width: this.RUBY_CELLS_WIDTH, height: this.RUBY_CELLS_HEIGHT },
        { left: 148, top: 138, width: this.RUBY_CELLS_WIDTH, height: this.RUBY_CELLS_HEIGHT }
    ];

    this.runnerCellsRight = [
        { left: 470, top: 310, width: 60, height: this.RUNNER_CELLS_HEIGHT },
        { left: 530, top: 310, width: 45, height: this.RUNNER_CELLS_HEIGHT },
        { left: 575, top: 310, width: 53, height: this.RUNNER_CELLS_HEIGHT },
        { left: 630, top: 310, width: 50, height: this.RUNNER_CELLS_HEIGHT },
        { left: 680, top: 310, width: 45, height: this.RUNNER_CELLS_HEIGHT },
        { left: 730, top: 310, width: 46, height: this.RUNNER_CELLS_HEIGHT },
        { left: 770, top: 310, width: 60, height: this.RUNNER_CELLS_HEIGHT },
        { left: 830, top: 310, width: 45, height: this.RUNNER_CELLS_HEIGHT },
        { left: 470, top: 310, width: 60, height: this.RUNNER_CELLS_HEIGHT }
    ];

    this.runnerCellsLeft = [
        { left: 470, top: 370, width: 55, height: this.RUNNER_CELLS_HEIGHT },
        { left: 530, top: 370, width: 50, height: this.RUNNER_CELLS_HEIGHT },
        { left: 580, top: 370, width: 50, height: this.RUNNER_CELLS_HEIGHT },
        { left: 630, top: 370, width: 40, height: this.RUNNER_CELLS_HEIGHT },
        { left: 680, top: 370, width: 45, height: this.RUNNER_CELLS_HEIGHT },
        { left: 730, top: 370, width: 45, height: this.RUNNER_CELLS_HEIGHT },
        { left: 770, top: 370, width: 60, height: this.RUNNER_CELLS_HEIGHT },
        { left: 830, top: 370, width: 45, height: this.RUNNER_CELLS_HEIGHT },
        { left: 470, top: 370, width: 55, height: this.RUNNER_CELLS_HEIGHT }
    ];

    this.sapphireCells = [
        { left: 185, top: 138, width: this.SAPPHIRE_CELLS_WIDTH, height: this.SAPPHIRE_CELLS_HEIGHT },
        { left: 220, top: 138, width: this.SAPPHIRE_CELLS_WIDTH, height: this.SAPPHIRE_CELLS_HEIGHT },
        { left: 258, top: 138, width: this.SAPPHIRE_CELLS_WIDTH, height: this.SAPPHIRE_CELLS_HEIGHT },
        { left: 294, top: 138, width: this.SAPPHIRE_CELLS_WIDTH, height: this.SAPPHIRE_CELLS_HEIGHT },
        { left: 331, top: 138, width: this.SAPPHIRE_CELLS_WIDTH, height: this.SAPPHIRE_CELLS_HEIGHT }
    ];

    this.snailBombCells = [
        { left: 40, top: 512, width: 30, height: 20 },
        { left: 2, top: 512, width: 30, height: 20 }
    ];

    this.snailCells = [
        { left: 142, top: 466, width: this.SNAIL_CELLS_WIDTH, height: this.SNAIL_CELLS_HEIGHT },
        { left: 75, top: 466, width: this.SNAIL_CELLS_WIDTH, height: this.SNAIL_CELLS_HEIGHT },
        { left: 2, top: 466, width: this.SNAIL_CELLS_WIDTH, height: this.SNAIL_CELLS_HEIGHT }
    ];

    // Sprite data.......................................................

    this.batData = [
        { left: 150, top: this.TRACK_1_BASELINE - 2 * this.BAT_CELLS_HEIGHT },
        { left: 500, top: this.TRACK_2_BASELINE - this.BAT_CELLS_HEIGHT },
        { left: 800, top: this.TRACK_3_BASELINE - 2.5 * this.BAT_CELLS_HEIGHT },
        { left: 1050, top: this.TRACK_1_BASELINE - 3 * this.BAT_CELLS_HEIGHT },
        { left: 1600, top: this.TRACK_3_BASELINE - this.BAT_CELLS_HEIGHT },
        { left: 1900, top: this.TRACK_2_BASELINE - 2.5 * this.BAT_CELLS_HEIGHT },
        { left: 2100, top: this.TRACK_1_BASELINE - 2 * this.BAT_CELLS_HEIGHT },
        { left: 2450, top: this.TRACK_3_BASELINE - 3 * this.BAT_CELLS_HEIGHT }
    ];

    this.beeData = [
        { left: 300, top: this.TRACK_2_BASELINE - this.BEE_CELLS_HEIGHT * 2 },
        { left: 450, top: this.TRACK_1_BASELINE - this.BEE_CELLS_HEIGHT },
        { left: 650, top: this.TRACK_3_BASELINE - this.BEE_CELLS_HEIGHT * 1.5 },
        { left: 900, top: this.TRACK_2_BASELINE - this.BEE_CELLS_HEIGHT * 1.5 },
        { left: 1100, top: this.TRACK_1_BASELINE - this.BEE_CELLS_HEIGHT * 2 },
        { left: 1400, top: 200 },
        { left: 1700, top: 150 },
        { left: 2000, top: 100 },
        { left: 2250, top: 250 },
        { left: 2550, top: 300 }
    ];

    this.buttonData = [
        { platformIndex: 5 },
        { platformIndex: 11 }
    ];

    this.coinData = [
        { left: 200, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 420, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 550, top: this.TRACK_3_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 750, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 950, top: this.TRACK_3_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 1250, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 1550, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 1750, top: this.TRACK_3_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 1850, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 2150, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 2280, top: this.TRACK_3_BASELINE - this.COIN_CELLS_HEIGHT },
        { left: 2420, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT }
    ];

    // Platforms.........................................................

    this.platformData = [
        // Screen 1
        { left: 10, width: 200, height: this.PLATFORM_HEIGHT, fillStyle: 'rgb(150,190,255)', opacity: 1.0, track: 1, pulsate: false },
        { left: 280, width: 150, height: this.PLATFORM_HEIGHT, fillStyle: 'rgb(200,150,255)', opacity: 1.0, track: 2, pulsate: false },
        { left: 500, width: 100, height: this.PLATFORM_HEIGHT, fillStyle: 'rgb(250,100,100)', opacity: 1.0, track: 3, pulsate: false },
        { left: 700, width: 120, height: this.PLATFORM_HEIGHT, fillStyle: 'rgb(100,200,100)', opacity: 1.0, track: 1, pulsate: false },

        // Screen 2
        { left: 900, width: 80, height: this.PLATFORM_HEIGHT, fillStyle: 'rgb(255,200,50)', opacity: 1.0, track: 2, pulsate: false },
        { left: 1100, width: 140, height: this.PLATFORM_HEIGHT, fillStyle: 'rgb(80,180,230)', opacity: 1.0, track: 3, pulsate: false },
        { left: 1320, width: 100, height: this.PLATFORM_HEIGHT, fillStyle: 'cyan', opacity: 1.0, track: 2, pulsate: false },
        { left: 1500, width: 160, height: this.PLATFORM_HEIGHT, fillStyle: 'rgb(100,140,230)', opacity: 1.0, track: 1, pulsate: false },

        // Screen 3
        { left: 1750, width: 90, height: this.PLATFORM_HEIGHT, fillStyle: 'rgb(220,180,60)', opacity: 1.0, track: 3, pulsate: false },
        { left: 1920, width: 200, height: this.PLATFORM_HEIGHT, fillStyle: 'rgb(120,160,255)', opacity: 1.0, track: 1, pulsate: false },
        { left: 2150, width: 110, height: this.PLATFORM_HEIGHT, fillStyle: 'rgb(180,200,100)', opacity: 1.0, track: 2, pulsate: false },
        { left: 2300, width: 120, height: this.PLATFORM_HEIGHT, fillStyle: 'aqua', opacity: 1.0, track: 3 },

        // Screen 4
        { left: 2480, width: 180, height: this.PLATFORM_HEIGHT, fillStyle: 'gold', opacity: 1.0, track: 1 },
        { left: 2700, width: 200, height: this.PLATFORM_HEIGHT, fillStyle: '#2b950a', opacity: 1.0, track: 2, snail: true }
    ];

    this.sapphireData = [
        { left: 100, top: this.TRACK_1_BASELINE - this.SAPPHIRE_CELLS_HEIGHT },
        { left: 800, top: this.TRACK_3_BASELINE - this.SAPPHIRE_CELLS_HEIGHT },
        { left: 1000, top: this.TRACK_2_BASELINE - this.SAPPHIRE_CELLS_HEIGHT },
        { left: 1350, top: this.TRACK_2_BASELINE - this.SAPPHIRE_CELLS_HEIGHT },
        { left: 2350, top: this.TRACK_3_BASELINE - this.SAPPHIRE_CELLS_HEIGHT }
    ];

    this.rubyData = [
        { left: 600, top: this.TRACK_1_BASELINE - this.RUBY_CELLS_HEIGHT },
        { left: 1600, top: this.TRACK_1_BASELINE - this.RUBY_CELLS_HEIGHT },
        { left: 1980, top: this.TRACK_1_BASELINE - this.RUBY_CELLS_HEIGHT }
    ];

    this.smokingHoleData = [
        { left: 248, top: this.TRACK_2_BASELINE - 22 },
        { left: 688, top: this.TRACK_3_BASELINE + 5 },
        { left: 1352, top: this.TRACK_2_BASELINE - 18 }
    ];

    this.snailData = [
        { platformIndex: 13 }
    ];

    // Sprites...........................................................

    this.bats = [];
    this.bees = [];
    this.buttons = [];
    this.coins = [];
    this.platforms = [];
    this.rubies = [];
    this.sapphires = [];
    this.snails = [];

    this.sprites = []; // For convenience, contains all sprites

    this.platformArtist = {
        draw: function (sprite, context) {
            var PLATFORM_STROKE_WIDTH = 1.0,
                PLATFORM_STROKE_STYLE = 'black',
                top;

            // use the instance (self) captured above
            top = self.calculatePlatformTop(sprite.track);

            // Save context and apply opacity
            context.save();

            if (sprite.opacity !== undefined) {
                context.globalAlpha = sprite.opacity;
            }

            context.lineWidth = PLATFORM_STROKE_WIDTH;
            context.strokeStyle = PLATFORM_STROKE_STYLE;
            context.fillStyle = sprite.fillStyle;

            context.strokeRect(sprite.left, top, sprite.width, sprite.height);
            context.fillRect(sprite.left, top, sprite.width, sprite.height);

            context.restore();
        }
    };

    // Jump behavior.....................................................
    this.jumpBehavior = {
        isAscending: function (sprite) {
            return sprite.ascendTimer.isRunning();
        },

        ascend: function (sprite) {
            var elapsed = sprite.ascendTimer.getElapsedTime(),
                deltaY = elapsed / (sprite.JUMP_DURATION / 2) * sprite.JUMP_HEIGHT;

            sprite.top = sprite.verticalLaunchPosition - deltaY; // up
        },

        isDoneAscending: function (sprite) {
            return sprite.ascendTimer.getElapsedTime() > sprite.JUMP_DURATION / 2;
        },

        finishAscent: function (sprite) {
            sprite.jumpApex = sprite.top;
            sprite.ascendTimer.stop();
            sprite.descendTimer.start();
        },

        isDescending: function (sprite) {
            return sprite.descendTimer.isRunning();
        },

        descend: function (sprite) {
            var elapsed = sprite.descendTimer.getElapsedTime(),
                deltaY = elapsed / (sprite.JUMP_DURATION / 2) * sprite.JUMP_HEIGHT;

            sprite.top = sprite.jumpApex + deltaY; // Moving down
        },

        isDoneDescending: function (sprite) {
            return sprite.descendTimer.getElapsedTime() > sprite.JUMP_DURATION / 2;
        },

        finishDescent: function (sprite) {
            sprite.stopJumping();
            sprite.top = sprite.verticalLaunchPosition;
        },

        execute: function (sprite, now, fps, context, lastAnimationFrameTime) {
            if (!sprite.jumping) {
                return;
            }

            if (this.isAscending(sprite)) {
                if (!this.isDoneAscending(sprite)) {
                    this.ascend(sprite);
                } else {
                    this.finishAscent(sprite);
                }
            } else if (this.isDescending(sprite)) {
                if (!this.isDoneDescending(sprite)) {
                    this.descend(sprite);
                } else {
                    this.finishDescent(sprite);
                }
            }
        },

        pause: function (sprite) {
            if (sprite.ascendTimer.isRunning()) {
                sprite.ascendTimer.pause();
            } else if (sprite.descendTimer.isRunning()) {
                sprite.descendTimer.pause();
            }
        },

        unpause: function (sprite) {
            if (sprite.ascendTimer.isRunning()) {
                sprite.ascendTimer.unpause();
            } else if (sprite.descendTimer.isRunning()) {
                sprite.descendTimer.unpause();
            }
        }
    };
};

SnailBait.prototype = {
    createSprites: function () {
        this.createPlatformSprites();

        this.createBatSprites();
        this.createBeeSprites();
        this.createButtonSprites();
        this.createCoinSprites();
        this.createRunnerSprite();
        this.createRubySprites();
        this.createSapphireSprites();
        this.createSnailSprites();

        this.initializeSprites();

        // All sprites are also stored in a single array
        this.addSpritesToSpriteArray();
    },

    addSpritesToSpriteArray: function () {
        for (var i = 0; i < this.platforms.length; ++i) {
            this.sprites.push(this.platforms[i]);
        }

        for (var i = 0; i < this.bats.length; ++i) {
            this.sprites.push(this.bats[i]);
        }

        for (var i = 0; i < this.bees.length; ++i) {
            this.sprites.push(this.bees[i]);
        }

        for (var i = 0; i < this.buttons.length; ++i) {
            this.sprites.push(this.buttons[i]);
        }

        for (var i = 0; i < this.coins.length; ++i) {
            this.sprites.push(this.coins[i]);
        }

        for (var i = 0; i < this.rubies.length; ++i) {
            this.sprites.push(this.rubies[i]);
        }

        for (var i = 0; i < this.sapphires.length; ++i) {
            this.sprites.push(this.sapphires[i]);
        }

        for (var i = 0; i < this.snails.length; ++i) {
            this.sprites.push(this.snails[i]);
        }

        // add runner last
        this.sprites.push(this.runner);
    },

    positionSprites: function (sprites, spriteData) {
        var sprite;

        for (var i = 0; i < sprites.length; ++i) {
            sprite = sprites[i];

            if (spriteData[i] && spriteData[i].platformIndex !== undefined) {
                this.putSpriteOnPlatform(sprite, this.platforms[spriteData[i].platformIndex]);
            } else if (spriteData[i]) {
                sprite.top = spriteData[i].top;
                sprite.left = spriteData[i].left;
            }
        }
    },

    initializeSprites: function () {
        this.positionSprites(this.bats, this.batData);
        this.positionSprites(this.bees, this.beeData);
        this.positionSprites(this.buttons, this.buttonData);
        this.positionSprites(this.coins, this.coinData);
        this.positionSprites(this.rubies, this.rubyData);
        this.positionSprites(this.sapphires, this.sapphireData);
        this.positionSprites(this.snails, this.snailData);

        // Set runner's initial platform (first platform under the runner)
        this.setRunnerPlatform();
    },

    setRunnerPlatform: function () {
        // Find the platform the runner is standing on
        for (var i = 0; i < this.platforms.length; ++i) {
            var platform = this.platforms[i];

            // Check if runner is on this platform
            if (this.runner.left >= platform.left &&
                this.runner.left <= platform.left + platform.width &&
                Math.abs(this.runner.top + this.runner.height - platform.top) < 5) {
                this.runner.platform = platform;
                return;
            }
        }
    },

    createBatSprites: function () {
        var bat,
            BAT_FLAP_DURATION = 200,
            BAT_FLAP_INTERVAL = 50;

        for (var i = 0; i < this.batData.length; ++i) {
            bat = new Sprite('bat',
                new SpriteSheetArtist(this.spritesheet, this.batCells),
                [new CycleBehavior(BAT_FLAP_DURATION, BAT_FLAP_INTERVAL)]);

            // bat cell width varies; batCells[1] is widest
            bat.width = this.batCells[1].width;
            bat.height = this.BAT_CELLS_HEIGHT;

            this.bats.push(bat);
        }
    },

    createBeeSprites: function () {
        var bee,
            BEE_FLAP_DURATION = 300,
            BEE_FLAP_INTERVAL = 100;

        for (var i = 0; i < this.beeData.length; ++i) {
            bee = new Sprite('bee',
                new SpriteSheetArtist(this.spritesheet, this.beeCells),
                [new CycleBehavior(BEE_FLAP_DURATION, BEE_FLAP_INTERVAL)]);

            bee.width = this.BEE_CELLS_WIDTH;
            bee.height = this.BEE_CELLS_HEIGHT;

            this.bees.push(bee);
        }
    },

    createButtonSprites: function () {
        var button,
            BUTTON_PACE_DURATION = 400,
            BUTTON_PACE_INTERVAL = 200;

        for (var i = 0; i < this.buttonData.length; ++i) {
            if (i !== this.buttonData.length - 1) {
                button = new Sprite('button',
                    new SpriteSheetArtist(this.spritesheet, this.blueButtonCells),
                    [new CycleBehavior(BUTTON_PACE_DURATION, BUTTON_PACE_INTERVAL)]);
            } else {
                button = new Sprite('button',
                    new SpriteSheetArtist(this.spritesheet, this.goldButtonCells),
                    [new CycleBehavior(BUTTON_PACE_DURATION, BUTTON_PACE_INTERVAL)]);
            }

            button.width = this.BUTTON_CELLS_WIDTH;
            button.height = this.BUTTON_CELLS_HEIGHT;
            button.velocityX = this.BUTTON_PACE_VELOCITY;

            this.buttons.push(button);
        }
    },

    createCoinSprites: function () {
        var coin,
            COIN_SPIN_DURATION = 500,
            COIN_SPIN_INTERVAL = 100,
            BOUNCE_DURATION_BASE = 800,  // milliseconds
            BOUNCE_HEIGHT_BASE = 50;     // pixels

        for (var i = 0; i < this.coinData.length; ++i) {
            if (i % 2 === 0) {
                coin = new Sprite('coin',
                    new SpriteSheetArtist(this.spritesheet, this.goldCoinCells),
                    [
                        new CycleBehavior(COIN_SPIN_DURATION, COIN_SPIN_INTERVAL),
                        new BounceBehavior(
                            BOUNCE_DURATION_BASE + BOUNCE_DURATION_BASE * Math.random(),
                            BOUNCE_HEIGHT_BASE + BOUNCE_HEIGHT_BASE * Math.random()
                        )
                    ]);
            } else {
                coin = new Sprite('coin',
                    new SpriteSheetArtist(this.spritesheet, this.blueCoinCells),
                    [
                        new CycleBehavior(COIN_SPIN_DURATION, COIN_SPIN_INTERVAL),
                        new BounceBehavior(
                            BOUNCE_DURATION_BASE + BOUNCE_DURATION_BASE * Math.random(),
                            BOUNCE_HEIGHT_BASE + BOUNCE_HEIGHT_BASE * Math.random()
                        )
                    ]);
            }

            coin.width = this.COIN_CELLS_WIDTH;
            coin.height = this.COIN_CELLS_HEIGHT;
            coin.value = 50;

            this.coins.push(coin);
        }
    },

    createPlatformSprites: function () {
        var sprite, pd,  // Sprite, Platform data
            PULSE_DURATION = 800,
            PULSE_OPACITY_THRESHOLD = 0.1;

        for (var i = 0; i < this.platformData.length; ++i) {
            pd = this.platformData[i];

            sprite = new Sprite('platform', this.platformArtist);

            sprite.left = pd.left;
            sprite.width = pd.width;
            sprite.height = pd.height;
            sprite.fillStyle = pd.fillStyle;
            sprite.opacity = pd.opacity;
            sprite.track = pd.track;
            sprite.button = pd.button;
            sprite.pulsate = pd.pulsate;

            sprite.top = this.calculatePlatformTop(pd.track);

            if (sprite.pulsate) {
                sprite.behaviors = [new PulseBehavior(PULSE_DURATION, PULSE_OPACITY_THRESHOLD)];
            }

            this.platforms.push(sprite);
        }
    },

    createRubySprites: function () {
        var ruby,
            RUBY_SPARKLE_DURATION = 1000,
            RUBY_SPARKLE_INTERVAL = 200,
            BOUNCE_DURATION_BASE = 800,
            BOUNCE_HEIGHT_BASE = 50,
            rubyArtist = new SpriteSheetArtist(this.spritesheet, this.rubyCells);

        for (var i = 0; i < this.rubyData.length; ++i) {
            ruby = new Sprite('ruby', rubyArtist,
                [
                    new CycleBehavior(RUBY_SPARKLE_DURATION, RUBY_SPARKLE_INTERVAL),
                    new BounceBehavior(
                        BOUNCE_DURATION_BASE + BOUNCE_DURATION_BASE * Math.random(),
                        BOUNCE_HEIGHT_BASE + BOUNCE_HEIGHT_BASE * Math.random()
                    )
                ]);

            ruby.width = this.RUBY_CELLS_WIDTH;
            ruby.height = this.RUBY_CELLS_HEIGHT;
            ruby.value = 200;

            this.rubies.push(ruby);
        }
    },

    createRunnerSprite: function () {
        var RUNNER_LEFT = 50,
            RUNNER_HEIGHT = 55,
            STARTING_RUNNER_TRACK = this.STARTING_RUNNER_TRACK,
            STARTING_RUN_ANIMATION_RATE = 0;

        this.runner = new Sprite('runner',
            new SpriteSheetArtist(this.spritesheet, this.runnerCellsRight),
            [new RunBehavior(), this.jumpBehavior]);

        this.runner.runAnimationRate = STARTING_RUN_ANIMATION_RATE;
        this.runner.track = STARTING_RUNNER_TRACK;
        this.runner.left = RUNNER_LEFT;
        this.runner.width = this.RUNNER_CELLS_WIDTH;
        this.runner.height = this.RUNNER_CELLS_HEIGHT;
        this.runner.top = this.calculatePlatformTop(this.runner.track) - RUNNER_HEIGHT;

        // Initialize platform property
        this.runner.platform = null;

        // Jump-related properties
        this.runner.jumping = false;
        this.runner.JUMP_HEIGHT = this.JUMP_HEIGHT;
        this.runner.JUMP_DURATION = this.JUMP_DURATION;

        // Use AnimationTimer instead of Stopwatch
        this.runner.ascendTimer = new AnimationTimer(
            this.runner.JUMP_DURATION / 2,
            AnimationTimer.makeEaseOutEasingFunction(1.15)
        );

        this.runner.descendTimer = new AnimationTimer(
            this.runner.JUMP_DURATION / 2,
            AnimationTimer.makeEaseInEasingFunction(1.15)
        );

        var self = this;

        this.runner.jump = function () {
            if (!this.jumping) {
                this.jumping = true;
                this.runAnimationRate = 0;
                this.verticalLaunchPosition = this.top;
                // Pass game time to start()
                this.ascendTimer.start(snailBait.timeSystem.calculateGameTime());
            }
        };

        this.runner.stopJumping = function () {
            this.jumping = false;
            this.runAnimationRate = 1;
            this.ascendTimer.stop(+new Date());
            this.descendTimer.stop(+new Date());
        };
    },

    createSapphireSprites: function () {
        var sapphire,
            SAPPHIRE_SPARKLE_DURATION = 1000,
            SAPPHIRE_SPARKLE_INTERVAL = 200,
            BOUNCE_DURATION_BASE = 800,
            BOUNCE_HEIGHT_BASE = 50,
            sapphireArtist = new SpriteSheetArtist(this.spritesheet, this.sapphireCells);

        for (var i = 0; i < this.sapphireData.length; ++i) {
            sapphire = new Sprite('sapphire', sapphireArtist,
                [
                    new CycleBehavior(SAPPHIRE_SPARKLE_DURATION, SAPPHIRE_SPARKLE_INTERVAL),
                    new BounceBehavior(
                        BOUNCE_DURATION_BASE + BOUNCE_DURATION_BASE * Math.random(),
                        BOUNCE_HEIGHT_BASE + BOUNCE_HEIGHT_BASE * Math.random()
                    )
                ]);

            sapphire.width = this.SAPPHIRE_CELLS_WIDTH;
            sapphire.height = this.SAPPHIRE_CELLS_HEIGHT;
            sapphire.value = 100;

            this.sapphires.push(sapphire);
        }
    },

    createSnailSprites: function () {
        var snail,
            SNAIL_PACE_DURATION = 600,
            SNAIL_PACE_INTERVAL = 200,
            snailArtist = new SpriteSheetArtist(this.spritesheet, this.snailCells);

        for (var i = 0; i < this.snailData.length; ++i) {
            snail = new Sprite('snail', snailArtist,
                [new CycleBehavior(SNAIL_PACE_DURATION, SNAIL_PACE_INTERVAL),
                new SnailShootBehavior()]);

            snail.width = this.SNAIL_CELLS_WIDTH;
            snail.height = this.SNAIL_CELLS_HEIGHT;
            snail.velocityX = this.SNAIL_PACE_VELOCITY;

            // Add shoot method to snail
            var self = this;
            snail.shootBomb = function () {
                var bomb = self.createSnailBomb(this);
                if (bomb) {
                    self.sprites.push(bomb);
                    bomb.visible = true;
                }
            };

            this.snails.push(snail);
        }
    },

    createSnailBomb: function (snail) {
        var bomb,
            SNAIL_BOMB_VELOCITY = 150; // pixels per second

        bomb = new Sprite('snail bomb',
            new SpriteSheetArtist(this.spritesheet, this.snailBombCells),
            [new CycleBehavior(200, 100)]);

        bomb.width = this.SNAIL_BOMB_CELLS_WIDTH;
        bomb.height = this.SNAIL_BOMB_CELLS_HEIGHT;

        // Position bomb at snail's location
        bomb.left = snail.left;
        bomb.top = snail.top + snail.height / 2;
        bomb.hOffset = snail.hOffset;

        // Bomb moves left
        bomb.velocityX = -SNAIL_BOMB_VELOCITY;

        // Add simple movement behavior
        bomb.behaviors.push({
            execute: function (sprite, now, fps, context, lastAnimationFrameTime) {
                var deltaTime = (now - lastAnimationFrameTime) / 1000;
                sprite.left += sprite.velocityX * deltaTime;

                // Remove bomb if it goes off screen
                if (sprite.left < sprite.hOffset - 100) {
                    sprite.visible = false;
                }
            }
        });

        return bomb;
    },

    isSpriteInView: function (sprite) {
        // ensure hOffset has a default
        sprite.hOffset = sprite.hOffset || 0;
        return sprite.left + sprite.width > sprite.hOffset &&
            sprite.left < sprite.hOffset + this.canvas.width;
    },

    updateSprites: function (now) {
        var sprite;

        for (var i = 0; i < this.sprites.length; ++i) {
            sprite = this.sprites[i];

            if (sprite.visible && this.isSpriteInView(sprite)) {
                sprite.update(now, this.fps, this.context, this.lastAnimationFrameTime);
            }
        }
    },

    drawSprites: function () {
        var sprite;

        for (var i = 0; i < this.sprites.length; ++i) {
            sprite = this.sprites[i];

            if (sprite.visible && this.isSpriteInView(sprite)) {
                this.context.translate(-sprite.hOffset, 0);
                sprite.draw(this.context);
                this.context.translate(sprite.hOffset, 0);
            }
        }
    },

    processJump: function (now) {
        // Jump is now handled by the jumpBehavior in the sprite's behaviors array
        // This method is no longer needed but kept for compatibility
    },

    draw: function (now) {
        this.setPlatformVelocity();
        this.setOffsets(now);

        this.drawBackground();
        this.updateSprites(now);
        this.drawSprites();
    },

    setPlatformVelocity: function () {
        this.platformVelocity = this.bgVelocity * this.PLATFORM_VELOCITY_MULTIPLIER;
    },

    setOffsets: function (now) {
        this.setBackgroundOffset(now);
        this.setSpriteOffsets(now);
    },

    setBackgroundOffset: function (now) {
        this.backgroundOffset += this.bgVelocity * (now - this.lastAnimationFrameTime) / 1000;

        if (this.backgroundOffset < 0 || this.backgroundOffset > this.BACKGROUND_WIDTH) {
            this.backgroundOffset = 0;
        }
    },

    setSpriteOffsets: function (now) {
        var sprite;

        // In step with platforms
        this.spriteOffset += this.platformVelocity * (now - this.lastAnimationFrameTime) / 1000;

        for (var i = 0; i < this.sprites.length; ++i) {
            sprite = this.sprites[i];

            if ('runner' !== sprite.type) {
                sprite.hOffset = this.spriteOffset;
            }
        }
    },

    drawBackground: function () {
        var BACKGROUND_TOP_IN_SPRITESHEET = 590;

        // Translate everything by the background offset
        this.context.translate(-this.backgroundOffset, 0);

        // 2/3 onscreen initially:
        this.context.drawImage(
            this.spritesheet, 0, BACKGROUND_TOP_IN_SPRITESHEET,
            this.BACKGROUND_WIDTH, this.BACKGROUND_HEIGHT,
            0, 0,
            this.BACKGROUND_WIDTH, this.BACKGROUND_HEIGHT);

        // Initially offscreen:
        this.context.drawImage(
            this.spritesheet, 0, BACKGROUND_TOP_IN_SPRITESHEET,
            this.BACKGROUND_WIDTH, this.BACKGROUND_HEIGHT,
            this.BACKGROUND_WIDTH, 0,
            this.BACKGROUND_WIDTH, this.BACKGROUND_HEIGHT);

        // Translate back to the original location
        this.context.translate(this.backgroundOffset, 0);
    },

    calculateFps: function (now) {
        var fps = 1 / (now - this.lastAnimationFrameTime) *
            1000 * this.timeRate;

        if (now - this.lastFpsUpdateTime > 1000) {
            this.lastFpsUpdateTime = now;
            this.fpsElement.innerHTML = fps.toFixed(0) + ' fps';
        }
        return fps;
    },

    setTimeRate: function (rate) {
        this.timeRate = rate;

        this.timeSystem.setTransducer(function (now) {
            return now * snailBait.timeRate;
        });
    },

    putSpriteOnPlatform: function (sprite, platformSprite) {
        sprite.top = platformSprite.top - sprite.height;
        sprite.left = platformSprite.left;
        sprite.platform = platformSprite;
    },

    calculatePlatformTop: function (track) {
        if (track === 1) { return this.TRACK_1_BASELINE; }
        else if (track === 2) { return this.TRACK_2_BASELINE; }
        else if (track === 3) { return this.TRACK_3_BASELINE; }
    },

    turnLeft: function () {
        this.bgVelocity = -this.BACKGROUND_VELOCITY;
        this.runner.runAnimationRate = 1; // Enable running animation
        this.runner.artist.cells = this.runnerCellsLeft; // Change to left-facing cells
    },

    turnRight: function () {
        this.bgVelocity = this.BACKGROUND_VELOCITY;
        this.runner.runAnimationRate = 1; // Enable running animation
        this.runner.artist.cells = this.runnerCellsRight; // Change to right-facing cells
    },

    fadeInElements: function () {
        var args = arguments;
        var self = this;

        for (var i = 0; i < args.length; ++i) {
            args[i].style.display = 'block';
        }

        setTimeout(function () {
            for (var i = 0; i < args.length; ++i) {
                args[i].style.opacity = self.OPAQUE;
            }
        }, this.SHORT_DELAY);
    },

    fadeOutElements: function () {
        var args = arguments,
            fadeDuration = args[args.length - 1]; // Last argument

        for (var i = 0; i < args.length - 1; ++i) {
            args[i].style.opacity = this.TRANSPARENT;
        }

        setTimeout(function () {
            for (var i = 0; i < args.length - 1; ++i) {
                args[i].style.display = 'none';
            }
        }, fadeDuration);
    },

    hideToast: function () {
        var TOAST_TRANSITION_DURATION = 450;

        this.fadeOutElements(this.toastElement, TOAST_TRANSITION_DURATION);
    },

    startToastTransition: function (text, duration) {
        this.toastElement.innerHTML = text;
        this.fadeInElements(this.toastElement);
    },

    revealToast: function (text, duration) {
        var DEFAULT_TOAST_DURATION = 1000;

        duration = duration || DEFAULT_TOAST_DURATION;

        this.startToastTransition(text, duration);

        var self = this;
        setTimeout(function () {
            self.hideToast();
        }, duration);
    },

    // Animation.........................................................

    animate: function (now) {
        var self = this;

        // Replace browser time with game time
        now = snailBait.timeSystem.calculateGameTime();

        if (snailBait.paused) {
            setTimeout(function () {
                requestNextAnimationFrame(snailBait.animate);
            }, snailBait.PAUSED_CHECK_INTERVAL);
        } else {
            snailBait.fps = snailBait.calculateFps(now);
            snailBait.draw(now);
            snailBait.lastAnimationFrameTime = now;
            requestNextAnimationFrame(snailBait.animate);
        }
    },

    togglePausedStateOfAllBehaviors: function (now) {
        var sprite, behavior;

        for (var i = 0; i < this.sprites.length; ++i) {
            sprite = this.sprites[i];

            for (var j = 0; j < sprite.behaviors.length; ++j) {
                behavior = sprite.behaviors[j];

                if (this.paused) {
                    if (behavior.pause) {
                        behavior.pause(sprite, now);
                    }
                } else {
                    if (behavior.unpause) {
                        behavior.unpause(sprite, now);
                    }
                }
            }
        }
    },

    togglePaused: function () {
        var now = this.timeSystem.calculateGameTime();

        this.paused = !this.paused;

        this.togglePausedStateOfAllBehaviors(now);

        if (this.paused) {
            this.pauseStartTime = now;
        } else {
            this.lastAnimationFrameTime += (now - this.pauseStartTime);
        }
    },

    // ------------------------- INITIALIZATION ----------------------------

    backgroundLoaded: function () {
        var LOADING_SCREEN_TRANSITION_DURATION = 2000;

        this.fadeOutElements(this.loadingElement, LOADING_SCREEN_TRANSITION_DURATION);

        var self = this;
        setTimeout(function () {
            self.startGame();
            self.gameStarted = true;
        }, LOADING_SCREEN_TRANSITION_DURATION);
    },

    loadingAnimationLoaded: function () {
        if (!this.gameStarted) {
            this.fadeInElements(this.runnerAnimatedGIFElement, this.loadingTitleElement);
        }
    },

    initializeImages: function () {
        this.spritesheet.src = 'images/spritesheet.png';
        this.runnerAnimatedGIFElement.src = 'images/snail.gif';

        var self = this;
        this.spritesheet.onload = function () {
            self.backgroundLoaded();
        };

        this.runnerAnimatedGIFElement.onload = function () {
            self.loadingAnimationLoaded();
        };
    },

    dimControls: function () {
        var FINAL_OPACITY = 0.5;

        this.instructionsElement.style.opacity = FINAL_OPACITY;
        this.soundAndMusicElement.style.opacity = FINAL_OPACITY;
    },

    revealCanvas: function () {
        this.fadeInElements(this.canvas);
    },

    revealTopChrome: function () {
        this.fadeInElements(this.fpsElement, this.scoreElement);
    },

    revealTopChromeDimmed: function () {
        var DIM = 0.25;

        this.scoreElement.style.display = 'block';
        this.fpsElement.style.display = 'block';

        var self = this;
        setTimeout(function () {
            self.scoreElement.style.opacity = DIM;
            self.fpsElement.style.opacity = DIM;
        }, this.SHORT_DELAY);
    },

    revealBottomChrome: function () {
        this.fadeInElements(this.soundAndMusicElement, this.instructionsElement, this.copyrightElement);
    },

    revealGame: function () {
        var DIM_CONTROLS_DELAY = 5000;

        this.revealTopChromeDimmed();
        this.revealCanvas();
        this.revealBottomChrome();

        var self = this;
        setTimeout(function () {
            self.dimControls();
            self.revealTopChrome();
        }, DIM_CONTROLS_DELAY);
    },

    revealInitialToast: function () {
        var INITIAL_TOAST_DELAY = 1500,
            INITIAL_TOAST_DURATION = 3000;

        var self = this;
        setTimeout(function () {
            self.revealToast('Collide with coins and jewels. Avoid bats and bees.', INITIAL_TOAST_DURATION);
        }, INITIAL_TOAST_DELAY);
    },

    startGame: function () {
        this.timeSystem.start();  // Start the time system
        this.revealGame();
        this.revealInitialToast();
        requestNextAnimationFrame(this.animate);
    }
};

// Event handlers.......................................................

window.onkeydown = function (e) {
    var key = e.keyCode;
    var SLOW_MOTION_RATE = 0.3; // 30% of normal speed
    var NORMAL_MOTION_RATE = 1.0; // 100% of normal speed

    if (key === 65 || key === 37) { // 'A' or left arrow
        snailBait.turnLeft(); // run left animation
    } else if (key === 68 || key === 39) { // 'D' or right arrow
        snailBait.turnRight(); // run right animation
    } else if (key === 80) { // 'P'
        snailBait.togglePaused();
    } else if (key === 87 || key === 38 || key === 32) { // 'W' or up arrow or spacebar
        snailBait.runner.jump();
    } else if (key === 83) { // 'S' key for slow motion
        if (snailBait.timeRate === SLOW_MOTION_RATE) {
            // Already in slow motion, return to normal speed
            snailBait.setTimeRate(NORMAL_MOTION_RATE);
        } else {
            // Enter slow motion
            snailBait.setTimeRate(SLOW_MOTION_RATE);
        }
    }
};

window.onblur = function () {  // pause if unpaused
    snailBait.windowHasFocus = false;

    if (!snailBait.paused) {
        snailBait.togglePaused();
    }
};

window.onfocus = function () {  // unpause if paused
    var originalFont = snailBait.toastElement.style.fontSize,
        DIGIT_DISPLAY_DURATION = 1000; // milliseconds

    snailBait.windowHasFocus = true;
    snailBait.countdownInProgress = true;

    if (snailBait.paused) {
        snailBait.toastElement.style.font = '128px fantasy'; // Large font

        if (snailBait.windowHasFocus && snailBait.countdownInProgress) {
            snailBait.revealToast('3', 500); // Display 3 for 0.5 seconds
        }

        setTimeout(function () {
            if (snailBait.windowHasFocus && snailBait.countdownInProgress) {
                snailBait.revealToast('2', 500); // Display 2 for 0.5 seconds
            }

            setTimeout(function () {
                if (snailBait.windowHasFocus && snailBait.countdownInProgress) {
                    snailBait.revealToast('1', 500); // Display 1 for 0.5 seconds
                }

                setTimeout(function () {
                    if (snailBait.windowHasFocus && snailBait.countdownInProgress) {
                        snailBait.togglePaused();
                    }

                    if (snailBait.windowHasFocus && snailBait.countdownInProgress) {
                        snailBait.toastElement.style.fontSize = originalFont;
                    }

                    snailBait.countdownInProgress = false;

                }, DIGIT_DISPLAY_DURATION);

            }, DIGIT_DISPLAY_DURATION);

        }, DIGIT_DISPLAY_DURATION);
    }
};

// Launch game.........................................................

var snailBait = new SnailBait();

snailBait.initializeImages();
snailBait.createSprites();

// Debug information

console.log("=== SNAIL BAIT DEBUG INFO ===");
console.log("Game object created:", snailBait);
console.log("Canvas:", snailBait.canvas);
console.log("Context:", snailBait.context);
console.log("Spritesheet loaded:", snailBait.spritesheet.complete);
console.log("Number of platforms:", snailBait.platforms.length);
console.log("Number of coins:", snailBait.coins.length);
console.log("Number of rubies:", snailBait.rubies.length);
console.log("Number of sapphires:", snailBait.sapphires.length);
console.log("Total sprites:", snailBait.sprites.length);
console.log("Runner:", snailBait.runner);
console.log("Game started:", snailBait.gameStarted);

// Check if AnimationTimer exists
console.log("AnimationTimer defined:", typeof AnimationTimer !== 'undefined');
console.log("BounceBehavior defined:", typeof BounceBehavior !== 'undefined');
console.log("PulseBehavior defined:", typeof PulseBehavior !== 'undefined');

// Test creating behaviors
try {
    var testTimer = new AnimationTimer(1000, AnimationTimer.makeEaseInEasingFunction(1.0));
    console.log("AnimationTimer test successful:", testTimer);
} catch (e) {
    console.error("AnimationTimer test failed:", e);
}

try {
    var testBounce = new BounceBehavior(800, 50);
    console.log("BounceBehavior test successful:", testBounce);
} catch (e) {
    console.error("BounceBehavior test failed:", e);
}

try {
    var testPulse = new PulseBehavior(800, 0.1);
    console.log("PulseBehavior test successful:", testPulse);
} catch (e) {
    console.error("PulseBehavior test failed:", e);
}

// Check first few sprites
if (snailBait.sprites.length > 0) {
    console.log("First sprite:", snailBait.sprites[0]);
    console.log("First sprite behaviors:", snailBait.sprites[0].behaviors);
}

if (snailBait.coins.length > 0) {
    console.log("First coin:", snailBait.coins[0]);
    console.log("First coin behaviors:", snailBait.coins[0].behaviors);
}

console.log("=== END DEBUG INFO ===");