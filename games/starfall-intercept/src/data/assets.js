import backgroundUrl from "../../assets/backgrounds/darkPurple.png?url";
import shieldEffectUrl from "../../assets/effects/shield1.png?url";
import scoutUrl from "../../assets/enemies/enemyBlue1.png?url";
import gunnerUrl from "../../assets/enemies/enemyGreen2.png?url";
import fontUrl from "../../assets/fonts/kenvector_future.ttf?url";
import meteorBigUrl from "../../assets/meteors/meteorBrown_big1.png?url";
import meteorMediumUrl from "../../assets/meteors/meteorBrown_med1.png?url";
import meteorSmallUrl from "../../assets/meteors/meteorBrown_small1.png?url";
import boltUrl from "../../assets/powerups/powerupBlue_bolt.png?url";
import shieldPowerupUrl from "../../assets/powerups/powerupBlue_shield.png?url";
import playerLaserUrl from "../../assets/projectiles/laserGreen04.png?url";
import enemyLaserUrl from "../../assets/projectiles/laserRed04.png?url";
import playerUrl from "../../assets/ships/playerShip1_blue.png?url";
import lifeUrl from "../../assets/ui/playerLife1_blue.png?url";
import playerLaserAudioUrl from "../../assets/audio/sfx_laser1.ogg?url";
import loseAudioUrl from "../../assets/audio/sfx_lose.ogg?url";
import shieldDownAudioUrl from "../../assets/audio/sfx_shieldDown.ogg?url";
import shieldUpAudioUrl from "../../assets/audio/sfx_shieldUp.ogg?url";
import twoToneAudioUrl from "../../assets/audio/sfx_twoTone.ogg?url";
import zapAudioUrl from "../../assets/audio/sfx_zap.ogg?url";

export const ASSETS = {
  images: {
    background: ["bg.darkPurple", backgroundUrl],
    player: ["ship.player.blue", playerUrl],
    scout: ["enemy.scout.blue", scoutUrl],
    gunner: ["enemy.gunner.green", gunnerUrl],
    playerLaser: [
      "projectile.laser.player",
      playerLaserUrl,
    ],
    enemyLaser: [
      "projectile.laser.enemy",
      enemyLaserUrl,
    ],
    meteorSmall: [
      "meteor.brown.small",
      meteorSmallUrl,
    ],
    meteorMedium: [
      "meteor.brown.medium",
      meteorMediumUrl,
    ],
    meteorBig: ["meteor.brown.big", meteorBigUrl],
    bolt: ["powerup.bolt", boltUrl],
    shieldPowerup: [
      "powerup.shield",
      shieldPowerupUrl,
    ],
    shieldEffect: ["fx.shield", shieldEffectUrl],
    life: ["ui.life.blue", lifeUrl],
  },
  audio: {
    playerLaser: ["sfx.laser.player", playerLaserAudioUrl],
    zap: ["sfx.zap", zapAudioUrl],
    twoTone: ["sfx.twoTone", twoToneAudioUrl],
    shieldUp: ["sfx.shield.up", shieldUpAudioUrl],
    shieldDown: ["sfx.shield.down", shieldDownAudioUrl],
    lose: ["sfx.lose", loseAudioUrl],
  },
  font: ["font.future", fontUrl],
};

export const loadImageAssets = (loader) => {
  Object.values(ASSETS.images).forEach(([key, url]) => loader.image(key, url));
};

export const loadAudioAssets = (loader) => {
  Object.values(ASSETS.audio).forEach(([key, url]) => loader.audio(key, url));
};
