// ═══════════════════════════════════════════════════════════
//  classes.js — 게임 오브젝트 클래스
// ═══════════════════════════════════════════════════════════

import { W, H, FRUIT_TYPES, BOMB, BOMB_CHANCE, LEVEL_INTERVAL } from './config.js';
import { ctx }   from './canvas.js';
import { state } from './state.js';

// ─── Fruit ──────────────────────────────────────────────────
export class Fruit {
  constructor() {
    const isBomb = Math.random() < BOMB_CHANCE;
    const type   = isBomb
      ? BOMB
      : FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];

    Object.assign(this, type);
    this.isBomb = !!isBomb;

    this.r          = 34 + Math.random() * 10;
    this.x          = this.r + Math.random() * (W - this.r * 2);
    this.y          = -this.r - 20;
    this.vx         = (Math.random() - 0.5) * 1.5;
    this.rotation   = 0;
    this.rotSpeed   = (Math.random() - 0.5) * 0.05;
    this.sliced     = false;
    this.alpha      = 1;
    this.half1      = null;
    this.half2      = null;
    this.sliceAngle = 0;
    this.fontSize   = this.r * 1.6;

    const elapsed  = (Date.now() - state.gameStartTime) / 1000;
    const level    = Math.floor(elapsed / LEVEL_INTERVAL);

    this.vy      = (1.2 + Math.random() * 2.5) + level * 0.3;
    this.gravity = 0.035 + level * 0.008;
  }

  update() {
    if (this.sliced) return;
    this.x        += this.vx;
    this.y        += this.vy;
    this.vy       += this.gravity;
    this.rotation += this.rotSpeed;
  }

  draw() {
    if (this.sliced) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha  = this.alpha;
    ctx.font         = `${this.fontSize}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }

  slice(angle) {
    if (this.sliced) return;
    this.sliced     = true;
    this.sliceAngle = angle;
    this.half1 = new FruitHalf(this,  1);
    this.half2 = new FruitHalf(this, -1);
  }

  isHit(px, py) {
    const dx = px - this.x, dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.r * 1.1;
  }

  isOffScreen() {
    return this.y > H + 100 || this.x < -100 || this.x > W + 100;
  }
}

// ─── FruitHalf ──────────────────────────────────────────────
export class FruitHalf {
  constructor(parent, dir) {
    this.emoji    = parent.emoji;
    this.color    = parent.inner;
    this.x        = parent.x;
    this.y        = parent.y;
    this.r        = parent.r;
    this.fontSize = parent.fontSize;
    this.rotation = parent.rotation;
    this.dir      = dir;

    const perpAngle = parent.sliceAngle + Math.PI / 2;
    this.vx       = Math.cos(perpAngle) * dir * 3 + parent.vx;
    this.vy       = Math.sin(perpAngle) * dir * 3 + parent.vy;
    this.rotSpeed = dir * 0.08;
    this.alpha    = 1;
    this.fadeRate = 0.04;
  }

  update() {
    this.x        += this.vx;
    this.y        += this.vy;
    this.vy       += 0.08;
    this.rotation += this.rotSpeed;
    this.alpha    -= this.fadeRate;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;

    ctx.beginPath();
    ctx.arc(this.dir * this.r * 0.2, 0, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + '99';
    ctx.fill();

    ctx.font         = `${this.fontSize * 0.8}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, this.dir * 8, 0);
    ctx.restore();
  }

  isDead() { return this.alpha <= 0 || this.y > H + 80; }
}

// ─── Particle ───────────────────────────────────────────────
export class Particle {
  constructor(x, y, color) {
    this.x     = x;
    this.y     = y;
    this.color = color;

    const angle   = Math.random() * Math.PI * 2;
    const speed   = 2 + Math.random() * 5;
    this.vx       = Math.cos(angle) * speed;
    this.vy       = Math.sin(angle) * speed - 2;
    this.alpha    = 1;
    this.r        = 3 + Math.random() * 4;
    this.useEmoji = Math.random() < 0.1;
    this.fontSize = 14 + Math.random() * 10;
  }

  update() {
    this.x     += this.vx;
    this.y     += this.vy;
    this.vy    += 0.15;
    this.alpha -= 0.03;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    if (this.useEmoji) {
      ctx.font         = `${this.fontSize}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨', this.x, this.y);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    ctx.restore();
  }

  isDead() { return this.alpha <= 0; }
}

// ─── TrailPoint ─────────────────────────────────────────────
export class TrailPoint {
  constructor(x, y) {
    this.x     = x;
    this.y     = y;
    this.alpha = 1;
  }
}

// ─── ScorePopup ─────────────────────────────────────────────
export class ScorePopup {
  constructor(x, y, text, color = '#ffe066') {
    this.x        = x;
    this.y        = y;
    this.text     = text;
    this.color    = color;
    this.alpha    = 1;
    this.vy       = -2;
    this.fontSize = 28;
  }

  update() {
    this.y     += this.vy;
    this.vy    *= 0.95;
    this.alpha -= 0.025;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha  = this.alpha;
    ctx.font         = `bold ${this.fontSize}px 'Fredoka One', cursive`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = this.color;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }

  isDead() { return this.alpha <= 0; }
}