// ═══════════════════════════════════════════════════════════
//  ui.js — DOM 조작 헬퍼
// ═══════════════════════════════════════════════════════════

import { state }  from './state.js';
import { canvas } from './canvas.js';
import { COMBO_DISPLAY_TIME } from './config.js';
import { saveScore, loadScores } from './leaderboard.js';

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

  document.getElementById('nicknameInput').classList.add('visible');
  document.getElementById('saveScoreBtn').classList.add('visible');

  // 저장 버튼 클릭 시 Firebase에 저장
  const saveBtn = document.getElementById('saveScoreBtn');
  
  document.querySelector('.guide').classList.add('hidden');   // 설명 숨기기
  document.querySelector('.save').classList.add('visible');   // 저장 폼 보이기


}

// ─── 오버레이: 숨기기 ────────────────────────────────────────
export function hideOverlay() {
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('nicknameInput').classList.remove('visible');
  document.getElementById('saveScoreBtn').classList.remove('visible');
  // 입력창 초기화
  canvas.classList.add('hide-cursor');


  document.querySelector('.guide').classList.remove('hidden');  // 설명 복구
  document.querySelector('.save').classList.remove('visible');  // 저장 폼 숨기기
  document.getElementById('nicknameInput').value = '';   
}

// ─── 점수 DOM 업데이트 ───────────────────────────────────────
export function updateScoreUI(score) {
  document.getElementById('scoreValue').textContent = score;
}

