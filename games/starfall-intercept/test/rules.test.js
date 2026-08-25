import test from "node:test";
import assert from "node:assert/strict";
import {
  addScore,
  applyDamage,
  canFire,
  getFireCooldown,
  isWaveClear,
} from "../src/game/rules.js";

test("addScore adds threat and wave-clear points", () => {
  assert.equal(addScore(125, 250), 375);
});

test("shield absorbs a hit without consuming a life", () => {
  assert.deepEqual(applyDamage({
    lives: 3,
    shieldActive: true,
    now: 1000,
    invulnerableUntil: 0,
    invulnerabilityDuration: 1000,
  }), {
    damaged: false,
    shieldConsumed: true,
    lives: 3,
    invulnerableUntil: 1000,
    gameOver: false,
  });
});

test("damage grants temporary invulnerability and can end the run", () => {
  const hit = applyDamage({
    lives: 1,
    shieldActive: false,
    now: 2000,
    invulnerableUntil: 0,
    invulnerabilityDuration: 1000,
  });
  assert.equal(hit.lives, 0);
  assert.equal(hit.gameOver, true);
  assert.equal(hit.invulnerableUntil, 3000);

  const ignored = applyDamage({
    lives: 2,
    shieldActive: false,
    now: 2500,
    invulnerableUntil: 3000,
    invulnerabilityDuration: 1000,
  });
  assert.equal(ignored.damaged, false);
  assert.equal(ignored.lives, 2);
});

test("rapid fire uses the short cooldown only while active", () => {
  assert.equal(getFireCooldown(5000, 6000, 260, 100), 100);
  assert.equal(getFireCooldown(6000, 6000, 260, 100), 260);
  assert.equal(canFire(1000, 900, 100), true);
  assert.equal(canFire(1000, 950, 100), false);
});

test("a wave clears only after spawning finishes and threats are gone", () => {
  assert.equal(isWaveClear({ spawningComplete: false, activeThreats: 0 }), false);
  assert.equal(isWaveClear({ spawningComplete: true, activeThreats: 1 }), false);
  assert.equal(isWaveClear({ spawningComplete: true, activeThreats: 0 }), true);
});
