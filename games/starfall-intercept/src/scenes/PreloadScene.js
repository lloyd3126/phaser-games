import Phaser from "phaser";
import { loadAudioAssets, loadImageAssets, ASSETS } from "../data/assets.js";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/game-constants.js";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    const title = this.add.text(GAME_WIDTH / 2, 140, "STARFALL INTERCEPT", {
      fontFamily: "Arial, sans-serif",
      fontSize: "22px",
      color: COLORS.text,
    }).setOrigin(0.5);
    const label = this.add.text(GAME_WIDTH / 2, 230, "LOADING 0%", {
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      color: COLORS.mutedText,
    }).setOrigin(0.5);

    progressBox.fillStyle(0x191235, 0.9);
    progressBox.fillRect(150, 260, 340, 24);

    this.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x68e6ff, 1);
      progressBar.fillRect(154, 264, 332 * value, 16);
      label.setText(`LOADING ${Math.round(value * 100)}%`);
    });

    this.load.on("loaderror", (file) => {
      label.setText(`LOAD ERROR: ${file.key}`).setColor(COLORS.danger);
      console.error(`[Starfall Intercept] Failed to load ${file.key}: ${file.src}`);
    });

    this.load.once("complete", () => {
      progressBox.destroy();
      progressBar.destroy();
      title.destroy();
      label.destroy();
    });

    loadImageAssets(this.load);
    loadAudioAssets(this.load);
    this.load.font(ASSETS.font[0], ASSETS.font[1], "truetype");
  }

  create() {
    this.game.canvas.setAttribute("tabindex", "0");
    this.game.canvas.focus();
    this.scene.start("MenuScene");
  }
}
