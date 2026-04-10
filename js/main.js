// ═══════════════════════════════════════════════════════════
//  main.js — 진입점 & 이벤트 리스너
// ═══════════════════════════════════════════════════════════

import { W, H }           from './config.js';
import { canvas }         from './canvas.js';
import { state }          from './state.js';
import { checkSlice }     from './game.js';
import { startGame }      from './game.js';
import { gameLoop }       from './render.js';

// ─── 마우스 좌표 업데이트 공통 로직 ──────────────────────────
function updatePointer(clientX, clientY) {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;

  state.prevMouseX = state.mouseX;
  state.prevMouseY = state.mouseY;
  state.mouseX     = (clientX - rect.left) * scaleX;
  state.mouseY     = (clientY - rect.top)  * scaleY;

  const dx = state.mouseX - state.prevMouseX;
  const dy = state.mouseY - state.prevMouseY;
  state.mouseSpeed = Math.sqrt(dx * dx + dy * dy);

  checkSlice();
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
  startGame();
});

// ─── 초기 루프 (idle 상태 배경 애니메이션) ───────────────────
gameLoop();