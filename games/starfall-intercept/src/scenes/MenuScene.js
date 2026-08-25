import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/game-constants.js";

const FONT_FAMILY = '"KenVector Future", Arial, sans-serif';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "bg.darkPurple")
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07031b, 0.35);

    this.add.text(GAME_WIDTH / 2, 98, "STARFALL INTERCEPT", {
      fontFamily: FONT_FAMILY,
      fontSize: "28px",
      color: COLORS.text,
      stroke: "#14092d",
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 145, "HOLD THE LINE THROUGH THREE WAVES", {
      fontFamily: FONT_FAMILY,
      fontSize: "12px",
      color: COLORS.accent,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 224, [
      "A / D or ARROWS  MOVE",
      "HOLD SPACE  FIRE",
      "ENTER  START",
    ], {
      fontFamily: FONT_FAMILY,
      fontSize: "15px",
      color: COLORS.text,
      align: "center",
      lineSpacing: 9,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 334, "PRESS ENTER TO LAUNCH", {
      fontFamily: FONT_FAMILY,
      fontSize: "13px",
      color: COLORS.success,
    }).setOrigin(0.5);

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.scene.start("PlayScene");
    }
  }
}
