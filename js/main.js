// ═══════════════════════════════════════════════════════════
//  main.js — 진입점 & 이벤트 리스너
// ═══════════════════════════════════════════════════════════

import { W, H }                               from './config.js';
import { canvas }                             from './canvas.js';
import { state }                              from './state.js';
import { checkSlice, startGame, togglePause } from './game.js';
import { gameLoop }                           from './render.js';
import { saveScore }                          from './leaderboard.js';  

// ─── 마우스 좌표 업데이트 공통 로직 ──────────────────────────
function updatePointer(clientX, clientY) {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;

  state.prevMouseX = state.mouseX;
  state.prevMouseY = state.mouseY;
  state.mouseX = (clientX - rect.left) / rect.width * canvas.width
  state.mouseY = (clientY - rect.top)  / rect.height * canvas.height

  const dx = state.mouseX - state.prevMouseX;
  const dy = state.mouseY - state.prevMouseY;
  state.mouseSpeed = Math.sqrt(dx * dx + dy * dy);

  checkSlice();
}

// ─── 일시정지 버튼 텍스트 동기화 ─────────────────────────────
function syncPauseBtn() {
  const btn = document.getElementById('devPauseBtn');
  if (btn) btn.textContent = state.gameState === 'paused' ? '▶ 재개' : '⏸ 일시정지';
}

// ─── 이벤트 리스너 ───────────────────────────────────────────
canvas.addEventListener('mousemove', (e) => {
  updatePointer(e.clientX, e.clientY);
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  updatePointer(t.clientX, t.clientY);
}, { passive: false });

document.getElementById('startBtn').addEventListener('click', () => {
  const saveBtn = document.getElementById('saveScoreBtn');
  saveBtn.dataset.saved = '';
  saveBtn.disabled      = false;
  saveBtn.textContent   = '저장';
 
  startGame();
 
  syncPauseBtn();
});

document.getElementById('rankingBtn')
  .addEventListener('click', () => {
    window.location.href = 'leaderboard.html';
  });

// ─── 저장 버튼 ───────────────────────────────────────────────
document.getElementById('saveScoreBtn').addEventListener('click', async () => {
  const btn      = document.getElementById('saveScoreBtn');
  const nickname = document.getElementById('nicknameInput').value.trim() || '익명';

  if (btn.dataset.saved) return;

  btn.textContent = '저장 중...';
  btn.disabled    = true;

  try {
    await saveScore(nickname, state.score);
    btn.textContent    = '저장됨';
    btn.dataset.saved  = 'true';
  } catch (e) {
    btn.textContent = '실패';
    btn.disabled    = false;
    console.error(e);
  }
});

// ─── 개발자용 일시정지 버튼 ──────────────────────────────────
const pauseBtn = document.getElementById('devPauseBtn');
if (pauseBtn) {
  pauseBtn.addEventListener('click', () => {
    if (state.gameState !== 'playing' && state.gameState !== 'paused') return;
    togglePause();
    syncPauseBtn();
  });
}

// ─── P 키 단축키 ─────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
  if ((e.key === 'p' || e.key === 'P') &&
      (state.gameState === 'playing' || state.gameState === 'paused')) {
    togglePause();
    syncPauseBtn();
  }
});

// ─── 초기 루프 (idle 상태 배경 애니메이션) ───────────────────
gameLoop();