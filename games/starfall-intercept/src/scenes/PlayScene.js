import Phaser from "phaser";
import { WAVES } from "../data/waves.js";
import {
  addScore,
  applyDamage,
  canFire,
  getFireCooldown,
  isWaveClear,
} from "../game/rules.js";
import {
  COLORS,
  ENEMY_LASER_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH,
  GUNNER_FIRE_DELAY,
  GUNNER_SPEED,
  METEOR_SPEEDS,
  PLAYER_FIRE_COOLDOWN,
  PLAYER_INVULNERABLE_DURATION,
  PLAYER_LASER_SPEED,
  PLAYER_MAX_X,
  PLAYER_MIN_X,
  PLAYER_SPEED,
  PLAYER_Y,
  POWERUP_SPEED,
  RAPID_FIRE_COOLDOWN,
  RAPID_FIRE_DURATION,
  SCOUT_SPEED,
  SPAWN_DELAY,
  TOTAL_WAVES,
  WAVE_CLEAR_DELAY,
} from "../config/game-constants.js";
import { Hud } from "../ui/Hud.js";

const FONT_FAMILY = '"KenVector Future", Arial, sans-serif';

const THREAT_CONFIG = {
  scout: { key: "enemy.scout.blue", hp: 1, points: 100 },
  gunner: { key: "enemy.gunner.green", hp: 2, points: 200 },
  meteorSmall: { key: "meteor.brown.small", hp: 1, points: 25, size: "small" },
  meteorMedium: { key: "meteor.brown.medium", hp: 2, points: 50, size: "medium" },
  meteorBig: { key: "meteor.brown.big", hp: 3, points: 75, size: "big" },
};

export class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
  }

  init() {
    this.phase = "running";
    this.score = 0;
    this.lives = 3;
    this.waveIndex = 1;
    this.lastShotAt = -Infinity;
    this.rapidFireUntil = 0;
    this.shieldActive = false;
    this.playerInvulnerableUntil = 0;
    this.spawnCursor = 0;
    this.spawningComplete = false;
    this.spawnTimer = null;
    this.gunnerFireTimer = null;
    this.dropTimer = null;
    this.waveAdvanceTimer = null;
    this.statusTimer = null;
  }

  create() {
    this.physics.world.resume();

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "bg.darkPurple")
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.scouts = this.physics.add.group();
    this.gunners = this.physics.add.group();
    this.meteors = this.physics.add.group();
    this.powerups = this.physics.add.group();

    this.player = this.physics.add.sprite(GAME_WIDTH / 2, PLAYER_Y, "ship.player.blue")
      .setDepth(10);
    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(60, 42, true);

    this.bottomExitZone = this.add.zone(GAME_WIDTH / 2, GAME_HEIGHT + 8, GAME_WIDTH, 16);
    this.physics.add.existing(this.bottomExitZone, true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.hud = new Hud(this);
    this.hud.setLives(this.lives);
    this.hud.setWave(this.waveIndex, TOTAL_WAVES);

    this.shieldFx = this.add.image(this.player.x, this.player.y, "fx.shield")
      .setScale(0.58)
      .setDepth(9)
      .setVisible(false);

    this.createCollisions();
    this.gunnerFireTimer = this.time.addEvent({
      delay: GUNNER_FIRE_DELAY,
      loop: true,
      callback: this.fireGunnerLasers,
      callbackScope: this,
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.startWave(this.waveIndex);
    this.emitEvent("run-started");
  }

  update() {
    if (this.phase === "running") {
      this.updatePlayer();
      this.updateGunners();
      this.updateShield();
      this.tryFirePlayer();
      this.cullProjectilesAndPowerups();
    } else if ((this.phase === "won" || this.phase === "gameOver") && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.scene.restart();
    }

    this.updatePlayerInvulnerability();
  }

  createCollisions() {
    this.physics.add.overlap(this.playerBullets, this.scouts, this.onPlayerBulletHitsThreat, null, this);
    this.physics.add.overlap(this.playerBullets, this.gunners, this.onPlayerBulletHitsThreat, null, this);
    this.physics.add.overlap(this.playerBullets, this.meteors, this.onPlayerBulletHitsThreat, null, this);

    this.physics.add.overlap(this.enemyBullets, this.player, this.onEnemyLaserHitsPlayer, null, this);
    this.physics.add.overlap(this.scouts, this.player, this.onThreatHitsPlayer, null, this);
    this.physics.add.overlap(this.gunners, this.player, this.onThreatHitsPlayer, null, this);
    this.physics.add.overlap(this.meteors, this.player, this.onThreatHitsPlayer, null, this);

    this.physics.add.overlap(this.scouts, this.bottomExitZone, this.onThreatEscaped, null, this);
    this.physics.add.overlap(this.gunners, this.bottomExitZone, this.onThreatEscaped, null, this);
    this.physics.add.overlap(this.meteors, this.bottomExitZone, this.onThreatEscaped, null, this);
    this.physics.add.overlap(this.powerups, this.player, this.onPowerupCollected, null, this);
  }

  updatePlayer() {
    let direction = 0;
    if (this.cursors.left.isDown || this.aKey.isDown) direction -= 1;
    if (this.cursors.right.isDown || this.dKey.isDown) direction += 1;

    this.player.setVelocityX(direction * PLAYER_SPEED);
    this.player.x = Phaser.Math.Clamp(this.player.x, PLAYER_MIN_X, PLAYER_MAX_X);
    this.player.y = PLAYER_Y;
  }

  updateGunners() {
    this.gunners.children.forEach((gunner) => {
      if (!gunner.active) return;

      if (gunner.y < 72) {
        gunner.setVelocity(0, GUNNER_SPEED);
        return;
      }

      if (gunner.x <= 75) gunner.strafeDirection = 1;
      if (gunner.x >= GAME_WIDTH - 75) gunner.strafeDirection = -1;
      gunner.setVelocityX(gunner.strafeDirection * GUNNER_SPEED);
    });
  }

  updateShield() {
    this.shieldFx.setPosition(this.player.x, this.player.y);
    this.shieldFx.setVisible(this.shieldActive && this.phase === "running");
  }

  updatePlayerInvulnerability() {
    if (!this.player?.active) return;
    if (this.time.now < this.playerInvulnerableUntil) {
      this.player.setAlpha(Math.floor(this.time.now / 90) % 2 === 0 ? 0.35 : 1);
    } else {
      this.player.setAlpha(1);
    }
  }

  tryFirePlayer() {
    if (!this.spaceKey.isDown) return;

    const cooldown = getFireCooldown(
      this.time.now,
      this.rapidFireUntil,
      PLAYER_FIRE_COOLDOWN,
      RAPID_FIRE_COOLDOWN,
    );
    if (!canFire(this.time.now, this.lastShotAt, cooldown)) return;

    this.lastShotAt = this.time.now;
    const laser = this.physics.add.sprite(this.player.x, this.player.y - 42, "projectile.laser.player")
      .setDepth(8);
    laser.body.allowGravity = false;
    laser.body.setSize(6, 24, true);
    this.playerBullets.add(laser);
    laser.setVelocityY(PLAYER_LASER_SPEED);
    this.safePlay("sfx.laser.player", 0.3);
    this.emitEvent("player-fired");
  }

  startWave(waveNumber) {
    const wave = WAVES[waveNumber - 1];
    if (!wave) return;

    this.phase = "running";
    this.waveIndex = waveNumber;
    this.spawnCursor = 0;
    this.spawningComplete = false;
    this.hud.setWave(waveNumber, TOTAL_WAVES);
    this.showTemporaryStatus(`WAVE ${waveNumber}`, COLORS.accent, 900);
    this.emitEvent("wave-started", { wave: waveNumber });

    this.spawnNextEntry(wave);
    if (wave.entries.length > 1) {
      this.spawnTimer = this.time.addEvent({
        delay: SPAWN_DELAY,
        repeat: wave.entries.length - 2,
        callback: () => this.spawnNextEntry(wave),
        callbackScope: this,
      });
    }

    if (wave.drop) {
      this.dropTimer = this.time.delayedCall(1800, () => this.spawnPowerup(wave.drop));
    }
  }

  spawnNextEntry(wave) {
    const entry = wave.entries[this.spawnCursor];
    if (!entry) {
      this.spawningComplete = true;
      this.checkWaveCompletion();
      return;
    }

    this.spawnCursor += 1;
    if (entry.type === "scout") this.spawnThreat("scout", entry.x);
    if (entry.type === "gunner") this.spawnThreat("gunner", entry.x);
    if (entry.type === "meteorSmall") this.spawnThreat("meteorSmall", entry.x);
    if (entry.type === "meteorMedium") this.spawnThreat("meteorMedium", entry.x);
    if (entry.type === "meteorBig") this.spawnThreat("meteorBig", entry.x);

    if (this.spawnCursor >= wave.entries.length) this.spawningComplete = true;
  }

  spawnThreat(type, x) {
    const config = THREAT_CONFIG[type];
    const group = type === "scout" ? this.scouts : type === "gunner" ? this.gunners : this.meteors;
    const threat = this.physics.add.sprite(x, -52, config.key).setDepth(5);
    threat.body.allowGravity = false;
    threat.threatType = type;
    threat.hitPoints = config.hp;
    threat.scoreValue = config.points;
    group.add(threat);

    if (type === "scout") {
      threat.body.setSize(58, 50, true);
      threat.setVelocityY(SCOUT_SPEED);
    } else if (type === "gunner") {
      threat.body.setSize(64, 50, true);
      threat.strafeDirection = x < GAME_WIDTH / 2 ? 1 : -1;
      threat.setVelocityY(GUNNER_SPEED);
    } else {
      const meteorSize = config.size;
      const bodySize = meteorSize === "big" ? { width: 70, height: 58 } : meteorSize === "medium" ? { width: 30, height: 30 } : { width: 18, height: 18 };
      threat.body.setSize(bodySize.width, bodySize.height, true);
      threat.setVelocityY(METEOR_SPEEDS[meteorSize]);
      threat.setAngularVelocity(meteorSize === "big" ? 12 : 28);
    }

    return threat;
  }

  fireGunnerLasers() {
    if (this.phase !== "running") return;

    this.gunners.children.forEach((gunner) => {
      if (!gunner.active || gunner.y < 40 || gunner.y > GAME_HEIGHT - 100) return;
      const laser = this.physics.add.sprite(gunner.x, gunner.y + 40, "projectile.laser.enemy").setDepth(7);
      laser.body.allowGravity = false;
      laser.body.setSize(6, 24, true);
      this.enemyBullets.add(laser);
      laser.setVelocityY(ENEMY_LASER_SPEED);
    });
  }

  spawnPowerup(effect) {
    if (this.phase !== "running") return;
    const key = effect === "bolt" ? "powerup.bolt" : "powerup.shield";
    const powerup = this.physics.add.sprite(GAME_WIDTH / 2, -30, key).setDepth(6);
    powerup.body.allowGravity = false;
    powerup.body.setSize(24, 24, true);
    powerup.powerupType = effect;
    this.powerups.add(powerup);
    powerup.setVelocityY(POWERUP_SPEED);
  }

  onPlayerBulletHitsThreat(bullet, threat) {
    if (this.phase !== "running" || !bullet.active || !threat.active) return;

    bullet.disableBody(true, true);
    threat.hitPoints -= 1;
    this.emitEvent("enemy-hit", { type: threat.threatType });
    if (threat.hitPoints > 0) return;

    threat.disableBody(true, true);
    this.score = addScore(this.score, threat.scoreValue);
    this.hud.setScore(this.score);
    this.safePlay("sfx.zap", 0.35);
    this.emitEvent("threat-destroyed", { type: threat.threatType, points: threat.scoreValue });
    this.checkWaveCompletion();
  }

  onEnemyLaserHitsPlayer(laser) {
    if (this.phase !== "running" || !laser.active) return;
    laser.disableBody(true, true);
    this.applyPlayerDamage("enemy-laser");
  }

  onThreatHitsPlayer(threat) {
    if (this.phase !== "running" || !threat || !threat.active) return;
    threat.disableBody(true, true);
    this.applyPlayerDamage(threat.threatType);
    this.checkWaveCompletion();
  }

  onThreatEscaped(firstObject, secondObject) {
    const threat = firstObject?.threatType ? firstObject : secondObject;
    if (this.phase !== "running" || !threat || !threat.active) return;
    threat.disableBody(true, true);
    this.applyPlayerDamage("escaped-threat");
    this.checkWaveCompletion();
  }

  applyPlayerDamage(source) {
    const result = applyDamage({
      lives: this.lives,
      shieldActive: this.shieldActive,
      now: this.time.now,
      invulnerableUntil: this.playerInvulnerableUntil,
      invulnerabilityDuration: PLAYER_INVULNERABLE_DURATION,
    });

    if (result.shieldConsumed) {
      this.shieldActive = false;
      this.shieldFx.setVisible(false);
      this.safePlay("sfx.shield.down", 0.45);
      this.showTemporaryStatus("SHIELD ABSORBED HIT", COLORS.accent, 850);
      this.emitEvent("player-damaged", { source, shield: true });
      return;
    }
    if (!result.damaged) return;

    this.lives = result.lives;
    this.playerInvulnerableUntil = result.invulnerableUntil;
    this.hud.setLives(this.lives);
    this.emitEvent("player-damaged", { source, shield: false, lives: this.lives });

    if (result.gameOver) {
      this.finishGameOver();
    } else {
      this.showTemporaryStatus("HIT", COLORS.danger, 500);
    }
  }

  onPowerupCollected(powerup) {
    if (this.phase !== "running" || !powerup.active) return;
    powerup.disableBody(true, true);

    if (powerup.powerupType === "bolt") {
      this.rapidFireUntil = Math.max(this.rapidFireUntil, this.time.now) + RAPID_FIRE_DURATION;
      this.safePlay("sfx.twoTone", 0.45);
      this.showTemporaryStatus("RAPID FIRE", COLORS.success, 850);
    } else {
      this.shieldActive = true;
      this.safePlay("sfx.shield.up", 0.45);
      this.showTemporaryStatus("SHIELD READY", COLORS.accent, 850);
    }
    this.emitEvent("powerup-collected", { type: powerup.powerupType });
  }

  checkWaveCompletion() {
    if (this.phase !== "running") return;
    const activeThreats = [this.scouts, this.gunners, this.meteors]
      .reduce((count, group) => count + group.countActive(true), 0);
    if (!isWaveClear({ spawningComplete: this.spawningComplete, activeThreats })) return;

    if (this.dropTimer) {
      this.dropTimer.remove(false);
      this.dropTimer = null;
    }
    this.phase = "waveClear";
    this.score = addScore(this.score, 250);
    this.hud.setScore(this.score);
    this.safePlay("sfx.twoTone", 0.3);
    this.showTemporaryStatus("WAVE CLEAR +250", COLORS.success, WAVE_CLEAR_DELAY);
    this.emitEvent("wave-cleared", { wave: this.waveIndex });

    this.waveAdvanceTimer = this.time.delayedCall(WAVE_CLEAR_DELAY, () => {
      if (this.waveIndex < TOTAL_WAVES) {
        this.startWave(this.waveIndex + 1);
      } else {
        this.finishWin();
      }
    });
  }

  finishWin() {
    if (this.phase === "won") return;
    this.phase = "won";
    this.stopRunTimers();
    this.stopMovingObjects();
    this.showResult("MISSION COMPLETE", "PRESS ENTER TO RESTART", COLORS.success);
    this.emitEvent("mission-won");
  }

  finishGameOver() {
    if (this.phase === "gameOver") return;
    this.phase = "gameOver";
    this.stopRunTimers();
    this.stopMovingObjects();
    this.safePlay("sfx.lose", 0.5);
    this.showResult("GAME OVER", "PRESS ENTER TO RESTART", COLORS.danger);
    this.emitEvent("game-over", { score: this.score, wave: this.waveIndex });
  }

  showResult(title, subtitle, color) {
    this.resultTitle?.destroy();
    this.resultHint?.destroy();
    this.resultTitle = this.add.text(GAME_WIDTH / 2, 156, title, {
      fontFamily: FONT_FAMILY,
      fontSize: "27px",
      color,
      stroke: "#050214",
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(120);
    this.resultHint = this.add.text(GAME_WIDTH / 2, 204, subtitle, {
      fontFamily: FONT_FAMILY,
      fontSize: "13px",
      color: COLORS.text,
      stroke: "#050214",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(120);
    this.hud.showStatus("");
  }

  showTemporaryStatus(message, color, duration) {
    this.hud.showStatus(message, color);
    if (this.statusTimer) this.statusTimer.remove(false);
    this.statusTimer = this.time.delayedCall(duration, () => {
      if (this.phase === "running") this.hud.showStatus("");
    });
  }

  cullProjectilesAndPowerups() {
    [this.playerBullets, this.enemyBullets].forEach((group) => {
      group.children.forEach((object) => {
        if (object.active && (object.y < -40 || object.y > GAME_HEIGHT + 40)) object.disableBody(true, true);
      });
    });
    this.powerups.children.forEach((powerup) => {
      if (powerup.active && powerup.y > GAME_HEIGHT + 30) powerup.disableBody(true, true);
    });
  }

  stopMovingObjects() {
    [this.playerBullets, this.enemyBullets, this.scouts, this.gunners, this.meteors, this.powerups]
      .forEach((group) => group.children.forEach((object) => {
        if (object.active) object.setVelocity(0, 0);
      }));
    this.player.setVelocity(0, 0);
  }

  stopRunTimers() {
    ["spawnTimer", "gunnerFireTimer", "dropTimer", "waveAdvanceTimer", "statusTimer"].forEach((name) => {
      if (this[name]) {
        this[name].remove(false);
        this[name] = null;
      }
    });
  }

  safePlay(key, volume) {
    try {
      this.sound.play(key, { volume });
    } catch {
      // Audio is feedback only; game logic remains playable when a browser blocks OGG.
    }
  }

  emitEvent(name, payload = {}) {
    this.events.emit(name, payload);
  }

  handleShutdown() {
    this.stopRunTimers();
    this.hud?.destroy();
    this.resultTitle?.destroy();
    this.resultHint?.destroy();
  }
}
