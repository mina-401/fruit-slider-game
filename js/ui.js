// ═══════════════════════════════════════════════════════════
//  ui.js — DOM 조작 헬퍼
// ═══════════════════════════════════════════════════════════

import { state }  from './state.js';
import { canvas } from './canvas.js';
import { COMBO_DISPLAY_TIME } from './config.js';

// ─── 목숨 UI ────────────────────────────────────────────────
export function updateLivesUI() {
  for (let i = 0; i < 3; i++) {
    document.getElementById(`life${i}`)
            .classList.toggle('lost', i >= state.lives);
  }
}

// ─── 콤보 표시 ──────────────────────────────────────────────
export function showCombo(n) {
  const el = document.getElementById('combo-display');
  el.textContent   = `${n}× COMBO! 🔥`;
  el.style.opacity = '1';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.opacity = '0'; }, COMBO_DISPLAY_TIME);
}

// ─── 오버레이: 시작 화면 ────────────────────────────────────
export function showStartOverlay() {
  document.getElementById('overlayEmoji').textContent        = '🍉 🍊 🍋 🍇 🍑';
  document.getElementById('overlayTitle').textContent        = 'Fruit Slicer';
  document.getElementById('overlayScoreLabel').style.display = 'none';
  document.getElementById('overlayScore').style.display      = 'none';
  document.getElementById('startBtn').textContent            = '게임 시작';
  document.getElementById('overlay').classList.remove('hidden');
  canvas.classList.remove('hide-cursor');
}

// ─── 오버레이: 게임 오버 ─────────────────────────────────────
export function showGameOverOverlay(score) {
  document.getElementById('overlayEmoji').textContent        = '💀';
  document.getElementById('overlayTitle').textContent        = 'Game Over';
  document.getElementById('overlayScoreLabel').style.display = 'block';
  document.getElementById('overlayScore').style.display      = 'block';
  document.getElementById('overlayScore').textContent        = score;
  document.getElementById('startBtn').textContent            = '다시 시작';
  document.getElementById('overlay').classList.remove('hidden');
  canvas.classList.remove('hide-cursor');
}

// ─── 오버레이: 숨기기 ────────────────────────────────────────
export function hideOverlay() {
  document.getElementById('overlay').classList.add('hidden');
  canvas.classList.add('hide-cursor');
}

// ─── 점수 DOM 업데이트 ───────────────────────────────────────
export function updateScoreUI(score) {
  document.getElementById('scoreValue').textContent = score;
}