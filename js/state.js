// ═══════════════════════════════════════════════════════════
//  state.js — 전역 게임 상태
//  모든 모듈이 이 객체를 import해서 읽고 씁니다.
// ═══════════════════════════════════════════════════════════

export const state = {
  // ── 게임 흐름 ──────────────────────────────────────────
  gameState:     'idle',  // 'idle' | 'playing' | 'over'
  score:         0,
  prevScore:     -1,
  lives:         3,
  combo:         0,
  comboTimer:    null,
  gameStartTime: 0,

  // ── 오브젝트 배열 ───────────────────────────────────────
  fruits:      [],
  particles:   [],
  halfFruits:  [],
  scorePopups: [],
  sliceTrail:  [],

  // ── 마우스 / 터치 ────────────────────────────────────────
  mouseX:     0,
  mouseY:     0,
  prevMouseX: 0,
  prevMouseY: 0,
  mouseSpeed: 0,

  // ── 렌더링 ───────────────────────────────────────────────
  animId:      undefined,
  spawnTimer:  undefined,
  shakeAmount: 0,
};