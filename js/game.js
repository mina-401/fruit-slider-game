// ═══════════════════════════════════════════════════════════
//  game.js — 게임 로직
// ═══════════════════════════════════════════════════════════

import {
  MAX_PARTICLES, COMBO_TIMEOUT, SLICE_MIN_SPEED,
  MIN_SPAWN_DELAY, MAX_SPAWN_DELAY, LEVEL_INTERVAL,
} from './config.js';
import { state }   from './state.js';
import { Fruit, Particle, ScorePopup } from './classes.js';
// game.js 상단 ui.js import에 추가 필요
import {
  updateLivesUI, showCombo,
  showGameOverOverlay, hideOverlay, updateScoreUI,
} from './ui.js';
import { gameLoop } from './render.js';


// ─── 파티클 스폰 ─────────────────────────────────────────────
export function spawnParticles(x, y, color, count) {
  const available = MAX_PARTICLES - state.particles.length;
  const actual    = Math.min(count, available);
  for (let i = 0; i < actual; i++) {
    state.particles.push(new Particle(x, y, color));
  }
}

// ─── 화면 흔들림 ─────────────────────────────────────────────
export function shakeScreen() { state.shakeAmount = 12; }

// ─── 과일 스폰 ───────────────────────────────────────────────
export function spawnFruit() {
  if (state.gameState !== 'playing') return;

  const elapsed = (Date.now() - state.gameStartTime - state.totalPaused) / 1000;
  const level   = Math.floor(elapsed / LEVEL_INTERVAL);
  const count   = Math.min(1 + level, 5);

  for (let i = 0; i < count; i++) {
    state.fruits.push(new Fruit());
  }

  const delay = Math.max(MIN_SPAWN_DELAY, MAX_SPAWN_DELAY - state.score * 8);
  state.spawnTimer = setTimeout(spawnFruit, delay);
}

// ─── 목숨 감소 ───────────────────────────────────────────────
export function loseLife() {
  state.lives--;
  updateLivesUI();
  if (state.lives <= 0) gameOver();
}

// ─── 슬라이스 판정 ───────────────────────────────────────────
export function checkSlice() {
  if (state.gameState !== 'playing' || state.mouseSpeed < SLICE_MIN_SPEED) return;

  for (let i = state.fruits.length - 1; i >= 0; i--) {
    const f = state.fruits[i];
    if (f.sliced || !f.isHit(state.mouseX, state.mouseY)) continue;

    if (f.isBomb) {
      loseLife();
      f.sliced = true;
      spawnParticles(f.x, f.y, '#ff4444', 8);
      state.scorePopups.push(new ScorePopup(f.x, f.y - 20, '💥 BOMB!', '#ff4444'));
      shakeScreen();
    } else {
      const angle = Math.atan2(
        state.mouseY - state.prevMouseY,
        state.mouseX - state.prevMouseX,
      );
      f.slice(angle);
      // slice() 내부에서 파티클 생성 대신 여기서 처리 (game.js 의존성 제거)
      spawnParticles(f.x, f.y, f.color, 6);
      state.halfFruits.push(f.half1, f.half2);

      state.combo++;
      clearTimeout(state.comboTimer);
      state.comboTimer = setTimeout(() => { state.combo = 0; }, COMBO_TIMEOUT);

      const pts      = f.points * (state.combo >= 3 ? state.combo : 1);
      state.score   += pts;

      const popText  = state.combo >= 3 ? `${state.combo}x COMBO! +${pts}` : `+${pts}`;
      const popColor = state.combo >= 3 ? '#ff6b35' : '#ffe066';
      state.scorePopups.push(new ScorePopup(f.x, f.y - 30, popText, popColor));

      if (state.combo >= 3) showCombo(state.combo);
    }

    state.fruits.splice(i, 1);
  }
}

// ─── 화면 밖 과일 처리 ───────────────────────────────────────
export function handleMissed() {
  for (let i = state.fruits.length - 1; i >= 0; i--) {
    const f = state.fruits[i];
    if (!f.sliced && f.isOffScreen()) {
      if (!f.isBomb) {
        loseLife();
        spawnParticles(f.x, Math.min(f.y, 620), '#aaa', 3);
      }
      state.fruits.splice(i, 1);
    }
  }
}

// ─── 게임 시작 ───────────────────────────────────────────────
export function startGame() {
  // 상태 초기화
  state.score       = 0;
  state.prevScore   = -1;
  state.lives       = 3;
  state.combo       = 0;
  state.mouseSpeed  = 0;
  state.shakeAmount = 0;

  clearTimeout(state.comboTimer);
  state.comboTimer = null;

  state.fruits      = [];
  state.particles   = [];
  state.sliceTrail  = [];
  state.halfFruits  = [];
  state.scorePopups = [];

  state.gameStartTime = Date.now();
  state.pausedAt      = 0;
  state.totalPaused   = 0;

  updateScoreUI(0);
  updateLivesUI();
  hideOverlay();

  state.gameState = 'playing';

  clearTimeout(state.spawnTimer);
  state.spawnTimer = setTimeout(spawnFruit, 300);

  if (state.animId) cancelAnimationFrame(state.animId);
  gameLoop();
}

// ─── 일시정지 토글 ───────────────────────────────────────────
export function togglePause() {
  if (state.gameState === 'playing') {
    state.gameState = 'paused';
    state.pausedAt  = Date.now();
    clearTimeout(state.spawnTimer);

  } else if (state.gameState === 'paused') {
    state.totalPaused += Date.now() - state.pausedAt;
    state.gameState    = 'playing';
    state.spawnTimer   = setTimeout(spawnFruit, 300);
  }
}

// ─── 게임 오버 ───────────────────────────────────────────────
export function gameOver() {
  state.gameState = 'over';
  clearTimeout(state.spawnTimer);
  showGameOverOverlay(state.score);
  showNicknameInput(state.score);     // 닉네임 입력창 표시
}