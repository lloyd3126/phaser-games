import { COLORS } from "../config/game-constants.js";

const FONT_FAMILY = '"KenVector Future", Arial, sans-serif';

export class Hud {
  constructor(scene) {
    this.scene = scene;
    this.scoreText = scene.add.text(16, 12, "SCORE: 000000", {
      fontFamily: FONT_FAMILY,
      fontSize: "14px",
      color: COLORS.text,
      stroke: "#050214",
      strokeThickness: 3,
    }).setDepth(100);

    this.waveText = scene.add.text(320, 12, "WAVE 1/3", {
      fontFamily: FONT_FAMILY,
      fontSize: "14px",
      color: COLORS.accent,
      stroke: "#050214",
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(100);

    this.lifeIcon = scene.add.image(520, 22, "ui.life.blue")
      .setScale(0.8)
      .setDepth(100);

    this.livesText = scene.add.text(544, 12, "x3", {
      fontFamily: FONT_FAMILY,
      fontSize: "14px",
      color: COLORS.text,
      stroke: "#050214",
      strokeThickness: 3,
    }).setDepth(100);

    this.statusText = scene.add.text(320, 52, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "16px",
      color: COLORS.success,
      stroke: "#050214",
      strokeThickness: 4,
      align: "center",
    }).setOrigin(0.5).setDepth(100);
  }

  setScore(score) {
    this.scoreText.setText(`SCORE: ${String(score).padStart(6, "0")}`);
  }

  setWave(wave, total = 3) {
    this.waveText.setText(`WAVE ${wave}/${total}`);
  }

  setLives(lives) {
    this.livesText.setText(`x${lives}`);
  }

  showStatus(message, color = COLORS.success) {
    this.statusText.setText(message).setColor(color).setVisible(Boolean(message));
  }

  destroy() {
    [this.scoreText, this.waveText, this.lifeIcon, this.livesText, this.statusText]
      .forEach((object) => object.destroy());
  }
}
