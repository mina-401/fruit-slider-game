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

export function showNicknameInput(score) {
  const overlay = document.getElementById('overlay');

  // 닉네임 입력 UI 동적 추가
  const form = document.createElement('div');
  form.id = 'nickname-form';
  form.innerHTML = `
    <input id="nicknameInput" maxlength="12"
      placeholder="닉네임 입력"
      style="padding:10px 16px; border-radius:50px; border:2px solid #ffe066;
             background:transparent; color:#fff; font-size:16px;
             font-family:'Fredoka One',cursive; text-align:center; outline:none;">
    <button id="submitScore"
      style="padding:10px 24px; border-radius:50px; border:none;
             background:#ffe066; color:#1a0a2e; font-family:'Fredoka One',cursive;
             font-size:16px; cursor:pointer;">
      등록
    </button>
  `;
  overlay.appendChild(form);

  document.getElementById('submitScore').addEventListener('click', async () => {
    const nickname = document.getElementById('nicknameInput').value;
    await saveScore(nickname, score);
    form.remove();
    await showLeaderboard(score);
  });
}

async function showLeaderboard(myScore) {
  const scores  = await loadScores();
  const overlay = document.getElementById('overlay');

  const board = document.createElement('div');
  board.id    = 'leaderboard';
  board.innerHTML = `
    <div style="font-family:'Fredoka One',cursive; color:#ffe066; font-size:20px; margin-bottom:8px;">
      🏆 리더보드
    </div>
    <table style="width:100%; border-collapse:collapse; font-size:14px; color:#fff;">
      ${scores.map((e, i) => `
        <tr style="${e.score === myScore ? 'background:rgba(255,224,102,0.15);border-radius:6px;' : ''}">
          <td style="padding:6px 10px; color:#ffe066;">
            ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}
          </td>
          <td style="padding:6px 10px;">${e.nickname}</td>
          <td style="padding:6px 10px; text-align:right; color:#ffe066;">${e.score}점</td>
          <td style="padding:6px 10px; color:rgba(255,255,255,0.4); font-size:12px;">${e.date}</td>
        </tr>
      `).join('')}
    </table>
  `;
  overlay.appendChild(board);
}