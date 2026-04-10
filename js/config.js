// ═══════════════════════════════════════════════════════════
//  config.js — 상수 & 데이터
// ═══════════════════════════════════════════════════════════

export const W = 680;  // 실제 원하는 캔버스 너비
export const H = 500;  // 실제 원하는 캔버스 높이

export const FRUIT_TYPES = [
  { emoji: '🍉', color: '#ff4d6d', inner: '#c9f0a0', points: 1 },
  { emoji: '🍊', color: '#ff9f1c', inner: '#fff3b0', points: 1 },
  { emoji: '🍋', color: '#ffee32', inner: '#fff9c4', points: 1 },
  { emoji: '🍇', color: '#9b5de5', inner: '#e0bbff', points: 2 },
  { emoji: '🍑', color: '#ff6b6b', inner: '#ffd6a5', points: 1 },
  { emoji: '🍓', color: '#e63946', inner: '#ffc8dd', points: 1 },
  { emoji: '🥝',  color: '#80b918', inner: '#d8f3dc', points: 2 },
  { emoji: '🍍', color: '#f4a261', inner: '#ffe5a0', points: 2 },
];

export const BOMB = { emoji: '💣', color: '#333', inner: '#666', isBomb: true };

export const MAX_PARTICLES  = 80;
export const MAX_HALF_FRUITS = 20;
export const TRAIL_MAX_LEN  = 30;
export const COMBO_TIMEOUT  = 1200;  // ms — 이 시간 안에 못 베면 콤보 리셋
export const COMBO_DISPLAY_TIME = 800; // ms — 콤보 UI 표시 시간
export const BOMB_CHANCE    = 0.12;
export const LEVEL_INTERVAL = 15;    // 초 — 레벨업 주기
export const MIN_SPAWN_DELAY = 600;  // ms
export const MAX_SPAWN_DELAY = 1500; // ms
export const SLICE_MIN_SPEED = 8;    // 이 속도 이상일 때만 슬라이스 판정