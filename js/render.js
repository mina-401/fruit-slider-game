// ═══════════════════════════════════════════════════════════
//  render.js — 렌더링 루프
// ═══════════════════════════════════════════════════════════

import { W, H, TRAIL_MAX_LEN, MAX_HALF_FRUITS } from './config.js';
import { ctx, bgGradient, gridCanvas }           from './canvas.js';
import { state }                                 from './state.js';
import { TrailPoint }                            from './classes.js';
import { handleMissed }                          from './game.js';
import { updateScoreUI }                         from './ui.js';

// ─── 칼 궤적 ────────────────────────────────────────────────
function drawTrail() {
  if (state.sliceTrail.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(state.sliceTrail[0].x, state.sliceTrail[0].y);
  for (let i = 1; i < state.sliceTrail.length; i++) {
    ctx.lineTo(state.sliceTrail[i].x, state.sliceTrail[i].y);
  }
  ctx.strokeStyle = 'rgba(180, 230, 255, 0.6)';
  ctx.lineWidth   = 2;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.stroke();
}

// ─── 커서 ───────────────────────────────────────────────────
function drawCursor() {
  const speed = Math.min(state.mouseSpeed / 30, 1);
  ctx.save();
  ctx.translate(state.mouseX, state.mouseY);

  ctx.beginPath();
  ctx.arc(0, 0, 10 + speed * 4, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255,255,255,${0.4 + speed * 0.5})`;
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle   = `rgba(255,255,255,${0.7 + speed * 0.3})`;

  ctx.fill();

  ctx.restore();
}

// ─── 메인 루프 ──────────────────────────────────────────────
export function gameLoop() {
  state.animId = requestAnimationFrame(gameLoop);

  ctx.save();

  // 화면 흔들림
  if (state.shakeAmount > 0) {
    ctx.translate(
      (Math.random() - 0.5) * state.shakeAmount,
      (Math.random() - 0.5) * state.shakeAmount,
    );
    state.shakeAmount *= 0.8;
    if (state.shakeAmount < 0.5) state.shakeAmount = 0;
  }

  // 배경
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H);

  // 점수 DOM 반영
  if (state.score !== state.prevScore) {
    updateScoreUI(state.score);
    state.prevScore = state.score;
  }

  // 격자
  ctx.drawImage(gridCanvas, 0, 0);

    // ── 일시정지: 오브젝트 업데이트 없이 현재 프레임만 그림 ──
  if (state.gameState === 'paused') {
    state.fruits.forEach(f => f.draw());
    for (const h of state.halfFruits) h.draw();
    for (const p of state.particles)  p.draw();
    drawCursor();
 
    // 반투명 오버레이 + PAUSED 텍스트
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, W, H);
    ctx.font         = "bold 48px 'Fredoka One', cursive";
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = '#ffe066';

    ctx.fillText('⏸ PAUSED', W / 2, H / 2);
    ctx.font      = "18px 'Fredoka One', cursive";
    ctx.fillStyle = 'rgba(255,255,255,0.6)';

    ctx.fillText('P 키 또는 버튼으로 재개', W / 2, H / 2 + 52);
 
    ctx.restore();
    return;
  }


  // 궤적 업데이트
  state.sliceTrail.forEach(p => { p.alpha -= 0.06; });
  if (state.gameState === 'playing' && state.mouseSpeed > 3) {
    if (state.sliceTrail.length < TRAIL_MAX_LEN) {
      state.sliceTrail.push(new TrailPoint(state.mouseX, state.mouseY));
    }
  }
  while (state.sliceTrail.length > 0 && state.sliceTrail[0].alpha <= 0) {
    state.sliceTrail.shift();
  }
  drawTrail();

  // 과일
  state.fruits.forEach(f => { f.update(); f.draw(); });

  // 반쪽 조각
  if (state.halfFruits.length > MAX_HALF_FRUITS) {
    state.halfFruits.splice(0, state.halfFruits.length - MAX_HALF_FRUITS);
  }
  for (let i = state.halfFruits.length - 1; i >= 0; i--) {
    state.halfFruits[i].update();
    state.halfFruits[i].draw();
    if (state.halfFruits[i].isDead()) state.halfFruits.splice(i, 1);
  }

  // 파티클
  for (let i = state.particles.length - 1; i >= 0; i--) {
    state.particles[i].update();
    state.particles[i].draw();
    if (state.particles[i].isDead()) state.particles.splice(i, 1);
  }

  // 점수 팝업
  for (let i = state.scorePopups.length - 1; i >= 0; i--) {
    state.scorePopups[i].update();
    state.scorePopups[i].draw();
    if (state.scorePopups[i].isDead()) state.scorePopups.splice(i, 1);
  }

  drawCursor();
  ctx.restore();

  if (state.gameState === 'playing') handleMissed();
}