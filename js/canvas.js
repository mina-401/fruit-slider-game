// ═══════════════════════════════════════════════════════════
//  canvas.js — 캔버스 초기화 & 배경
//  ctx, bgGradient, gridCanvas 를 export합니다.
// ═══════════════════════════════════════════════════════════

import { W, H } from './config.js';

// ─── 배경 별 ────────────────────────────────────────────────
const bgCanvas     = document.getElementById('bg-canvas');
const bgCtx        = bgCanvas.getContext('2d');


const stars = Array.from({ length: 120 }, () => ({
  x:     Math.random() * bgCanvas.width,
  y:     Math.random() * bgCanvas.height,
  r:     Math.random() * 1.5 + 0.3,
  alpha: Math.random(),
  speed: Math.random() * 0.01 + 0.003,
}));

function drawBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  stars.forEach(s => {
    s.alpha += s.speed;
    if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(255,255,255,${s.alpha * 0.6})`;
    bgCtx.fill();
  });
  requestAnimationFrame(drawBg);
}
drawBg();

// ─── 게임 캔버스 ─────────────────────────────────────────────
export const canvas = document.getElementById('gameCanvas');
export const ctx    = canvas.getContext('2d');

// ─── 배경 그라디언트 ─────────────────────────────────────────
export const bgGradient = (() => {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0,   '#0d0721');
  g.addColorStop(0.5, '#1a0a2e');
  g.addColorStop(1,   '#0d1b2a');
  return g;
})();

// ─── 격자 오프스크린 캔버스 (1회만 렌더링) ──────────────────
export const gridCanvas = (() => {
  const offscreen = document.createElement('canvas');
  offscreen.width  = W;
  offscreen.height = H;
  const gCtx = offscreen.getContext('2d');
  gCtx.strokeStyle = 'rgba(255,255,255,0.02)';
  gCtx.lineWidth   = 1;
  for (let x = 0; x < W; x += 40) {
    gCtx.beginPath(); gCtx.moveTo(x, 0); gCtx.lineTo(x, H); gCtx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    gCtx.beginPath(); gCtx.moveTo(0, y); gCtx.lineTo(W, y); gCtx.stroke();
  }
  return offscreen;
})();