export function addScore(currentScore, points) {
  return currentScore + points;
}

export function getFireCooldown(now, rapidFireUntil, normalCooldown, rapidCooldown) {
  return now < rapidFireUntil ? rapidCooldown : normalCooldown;
}

export function canFire(now, lastShotAt, cooldown) {
  return now - lastShotAt >= cooldown;
}

export function applyDamage({ lives, shieldActive, now, invulnerableUntil, invulnerabilityDuration }) {
  if (now < invulnerableUntil) {
    return {
      damaged: false,
      shieldConsumed: false,
      lives,
      invulnerableUntil,
      gameOver: lives <= 0,
    };
  }

  if (shieldActive) {
    return {
      damaged: false,
      shieldConsumed: true,
      lives,
      invulnerableUntil: now,
      gameOver: false,
    };
  }

  const nextLives = Math.max(0, lives - 1);
  return {
    damaged: true,
    shieldConsumed: false,
    lives: nextLives,
    invulnerableUntil: now + invulnerabilityDuration,
    gameOver: nextLives === 0,
  };
}

export function isWaveClear({ spawningComplete, activeThreats }) {
  return spawningComplete && activeThreats === 0;
}
