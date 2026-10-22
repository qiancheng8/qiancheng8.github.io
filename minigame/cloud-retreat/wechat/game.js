'use strict';
const Platform = require('./src/platform.js');
const Game = require('./src/game.js');
const platform = Platform.create({ api: wx });
const game = new Game.Game(platform);
game.start();
