import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./game-constants.js";
import { MenuScene } from "../scenes/MenuScene.js";
import { PlayScene } from "../scenes/PlayScene.js";
import { PreloadScene } from "../scenes/PreloadScene.js";

export const gameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#050214",
  render: {
    antialias: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  fps: {
    target: 60,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  input: {
    keyboard: true,
    mouse: false,
    touch: false,
    gamepad: false,
  },
  scene: [PreloadScene, MenuScene, PlayScene],
};
