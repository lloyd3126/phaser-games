export const ASSETS = {
  images: {
    background: ["bg.darkPurple", "assets/backgrounds/darkPurple.png"],
    player: ["ship.player.blue", "assets/ships/playerShip1_blue.png"],
    scout: ["enemy.scout.blue", "assets/enemies/enemyBlue1.png"],
    gunner: ["enemy.gunner.green", "assets/enemies/enemyGreen2.png"],
    playerLaser: [
      "projectile.laser.player",
      "assets/projectiles/laserGreen04.png",
    ],
    enemyLaser: [
      "projectile.laser.enemy",
      "assets/projectiles/laserRed04.png",
    ],
    meteorSmall: [
      "meteor.brown.small",
      "assets/meteors/meteorBrown_small1.png",
    ],
    meteorMedium: [
      "meteor.brown.medium",
      "assets/meteors/meteorBrown_med1.png",
    ],
    meteorBig: ["meteor.brown.big", "assets/meteors/meteorBrown_big1.png"],
    bolt: ["powerup.bolt", "assets/powerups/powerupBlue_bolt.png"],
    shieldPowerup: [
      "powerup.shield",
      "assets/powerups/powerupBlue_shield.png",
    ],
    shieldEffect: ["fx.shield", "assets/effects/shield1.png"],
    life: ["ui.life.blue", "assets/ui/playerLife1_blue.png"],
  },
  audio: {
    playerLaser: ["sfx.laser.player", "assets/audio/sfx_laser1.ogg"],
    zap: ["sfx.zap", "assets/audio/sfx_zap.ogg"],
    twoTone: ["sfx.twoTone", "assets/audio/sfx_twoTone.ogg"],
    shieldUp: ["sfx.shield.up", "assets/audio/sfx_shieldUp.ogg"],
    shieldDown: ["sfx.shield.down", "assets/audio/sfx_shieldDown.ogg"],
    lose: ["sfx.lose", "assets/audio/sfx_lose.ogg"],
  },
  font: ["font.future", "assets/fonts/kenvector_future.ttf"],
};

export const loadImageAssets = (loader) => {
  Object.values(ASSETS.images).forEach(([key, url]) => loader.image(key, url));
};

export const loadAudioAssets = (loader) => {
  Object.values(ASSETS.audio).forEach(([key, url]) => loader.audio(key, url));
};
