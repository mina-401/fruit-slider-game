// ═══════════════════════════════════════════════════════════
//  FRUIT SLICER — script.js
// ═══════════════════════════════════════════════════════════

// ─── 배경 별 ────────────────────────────────────────────────
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx    = bgCanvas.getContext('2d');
bgCanvas.width  = window.innerWidth;
bgCanvas.height = window.innerHeight;

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
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ─── 상태 변수 ───────────────────────────────────────────────
let gameState  = 'idle';   // 현재 게임 상태 ('idle': 시작 전 | 'playing': 게임 중 | 'over': 게임 오버)
let score      = 0;        // 현재 점수
let prevScore = -1;
let lives      = 3;        // 남은 목숨 (0이 되면 게임 오버)
let combo      = 0;        // 연속으로 과일을 벤 횟수 (3 이상이면 콤보 배수 점수)
let comboTimer = null;     // 콤보 초기화 타이머 ID (일정 시간 안에 못 베면 combo = 0)
let gameStartTime = 0;     // 게임 시작 시각 (ms)

let fruits      = [];      // 현재 화면에 존재하는 Fruit 객체 배열
let particles   = [];      // 과일을 벨 때 튀는 파티클 객체 배열
let halfFruits  = [];      // 슬라이스된 과일의 반쪽 조각(FruitHalf) 객체 배열
let scorePopups = [];      // "+1", "3x COMBO!" 같은 점수 팝업 텍스트 배열
let sliceTrail  = [];      // 마우스 궤적 점(TrailPoint) 배열 — 칼 자국 시각 효과

let mouseX = 0, mouseY = 0;       // 캔버스 기준 현재 마우스 좌표
let prevMouseX = 0, prevMouseY = 0; // 이전 프레임의 마우스 좌표 (슬라이스 방향 계산에 사용)
let mouseSpeed = 0;               // 마우스 이동 속도 (이 값이 8 이상일 때만 슬라이스 판정)

let animId;      // requestAnimationFrame의 ID (루프 취소 시 사용)
let spawnTimer;  // 과일 스폰 setTimeout ID (게임 리셋 시 취소용)

let shakeAmount = 0;  // 화면 흔들림 강도 (폭탄 폭발 시 12로 설정 후 점점 감소)
let bgGradient;       // 캔버스 배경 그라디언트 객체 (createBg()에서 생성)

// ─── 과일 데이터 ─────────────────────────────────────────────
const FRUIT_TYPES = [

    //이모지, 컬러, 겹치는 컬러, 획득가능한 포인트
  { emoji: '🍉', color: '#ff4d6d', inner: '#c9f0a0', points: 1 },
  { emoji: '🍊', color: '#ff9f1c', inner: '#fff3b0', points: 1 },
  { emoji: '🍋', color: '#ffee32', inner: '#fff9c4', points: 1 },
  { emoji: '🍇', color: '#9b5de5', inner: '#e0bbff', points: 2 },
  { emoji: '🍑', color: '#ff6b6b', inner: '#ffd6a5', points: 1 },
  { emoji: '🍓', color: '#e63946', inner: '#ffc8dd', points: 1 },
  { emoji: '🥝',  color: '#80b918', inner: '#d8f3dc', points: 2 },
  { emoji: '🍍', color: '#f4a261', inner: '#ffe5a0', points: 2 },
];
const BOMB = { emoji: '💣', color: '#333', inner: '#666', isBomb: true };

// ─── 배경 그라디언트 ─────────────────────────────────────────
function createBg() {

  // 캔버스 좌상단(0,0) → 우하단(W,H) 방향의 대각선 그라디언트 생성
  bgGradient = ctx.createLinearGradient(0, 0, W, H);
  bgGradient.addColorStop(0,   '#0d0721');
  bgGradient.addColorStop(0.5, '#1a0a2e');
  bgGradient.addColorStop(1,   '#0d1b2a');
}
createBg();

// ─── 격자 오프스크린 캔버스 (1회만 렌더링) ──────────────────


function createGridCanvas() {
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
}

const gridCanvas = createGridCanvas();

// ═══════════════════════════════════════════════════════════
//  클래스 정의
// ═══════════════════════════════════════════════════════════

class Fruit {
  constructor() {
    const isBomb = Math.random() < 0.12; //랜덤으로 폭탄 생성
    const type   = isBomb ? BOMB : FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)]; // 이모지 객체 정하기
    Object.assign(this, type); //오브젝트에 할당하기
    this.isBomb = !!isBomb; 

    this.r        = 34 + Math.random() * 10; //과일 반지름
    this.x        = this.r + Math.random() * (W - this.r * 2); //랜덤 x 위치
    this.y        = -this.r - 20; //화면 위쪽에서 시작.
    this.vy       = 1.2 + Math.random() * 2.5; //아래로 떨어지는 속도
    this.vx       = (Math.random() - 0.5) * 1.5; //좌우 랜덤 이동
    this.rotation = 0; //현재 회전 각도 
    this.rotSpeed = (Math.random() - 0.5) * 0.05; //현재 회전 속도
    this.sliced   = false;
    this.alpha    = 1; //투명도 
    this.half1    = null; //반쪽난 뒤 한쪽 저장
    this.half2    = null; //반쪽난 뒤 한쪽 저장
    this.sliceAngle = 0; //베인 각도
    this.fontSize = this.r * 1.6; //이모지 크기 

    const elapsed = (Date.now() - gameStartTime) / 1000; // 경과 시간 (초)
    const level   = Math.floor(elapsed / 15);             // 20초마다 레벨 업

    this.vy       = (1.2 + Math.random() * 2.5) + level * 0.3;  // 초기 낙하 속도 증가
    this.gravity  = 0.035 + level * 0.008;                       // 중력 가속도 증가
  }


  //좌, 우, 중력이동, 회전
  update() {
    if (this.sliced) return; //반쪽 났으면 리턴
    this.x  += this.vx;
    this.y  += this.vy;
    this.vy += this.gravity;
    this.rotation += this.rotSpeed;
  }

  draw() {
    if (this.sliced) return; //반쪽 났으면 리턴
    ctx.save();
    ctx.translate(this.x, this.y); //위치 이동
    ctx.rotate(this.rotation);
    ctx.globalAlpha  = this.alpha;
    ctx.font         = `${this.fontSize}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }

  slice(angle) {
    if (this.sliced) return;  //반쪽 났으면 리턴
    this.sliced     = true;
    this.sliceAngle = angle; //슬라이스 각도
    this.half1 = new FruitHalf(this,  1); //조각 생성
    this.half2 = new FruitHalf(this, -1); // 조각 생성
    spawnParticles(this.x, this.y, this.color, this.emoji, 6);//파티클 생성
  }

  isHit(px, py) {
    const dx = px - this.x, dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.r * 1.1;
  }

  isOffScreen() {
    return this.y > H + 100 || this.x < -100 || this.x > W + 100;
  }
}

// ───────────────────────────────────────────────────────────

class FruitHalf {
  constructor(parent, dir) {
    this.emoji    = parent.emoji;
    this.color    = parent.inner;
    this.x        = parent.x;
    this.y        = parent.y;
    this.r        = parent.r;
    this.fontSize = parent.fontSize;
    this.rotation = parent.rotation;
    this.dir      = dir;

    const perpAngle = parent.sliceAngle + Math.PI / 2;
    this.vx       = Math.cos(perpAngle) * dir * 3 + parent.vx;
    this.vy       = Math.sin(perpAngle) * dir * 3 + parent.vy;
    this.rotSpeed = dir * 0.08;
    this.alpha    = 1;
    this.fadeRate = 0.04;
  }

  update() {

    this.x        += this.vx; 
    this.y        += this.vy;
    this.vy       += 0.08;
    this.rotation += this.rotSpeed;
    this.alpha    -= this.fadeRate;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;

    ctx.beginPath();
    ctx.arc(0, 0, this.r * 1.2, 0, Math.PI * 2);


    ctx.beginPath();
    ctx.arc(this.dir * this.r * 0.2, 0, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + '99';
    ctx.fill();

    ctx.font         = `${this.fontSize * 0.8}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, this.dir * 8, 0);

    ctx.restore();
  }

  isDead() { return this.alpha <= 0 || this.y > H + 80; }
}

// ───────────────────────────────────────────────────────────

class Particle {
  constructor(x, y, color, emoji) {
    this.x      = x;
    this.y      = y;
    this.color  = color;
    this.emoji  = emoji;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    this.vx       = Math.cos(angle) * speed;
    this.vy       = Math.sin(angle) * speed - 2;
    this.alpha    = 1;
    this.r        = 3 + Math.random() * 4;
    this.useEmoji = Math.random() < 0.1;
    this.fontSize = 14 + Math.random() * 10;
  }

  update() {
    this.x     += this.vx;
    this.y     += this.vy;
    this.vy    += 0.15;
    this.alpha -= 0.03;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    if (this.useEmoji) {
      ctx.font         = `${this.fontSize}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨', this.x, this.y);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle    = this.color;
      ctx.fill();
    }
    ctx.restore();
  }

  isDead() { return this.alpha <= 0; }
}

// ───────────────────────────────────────────────────────────

class TrailPoint {
  constructor(x, y) {
    this.x     = x;
    this.y     = y;
    this.alpha = 1;
  }
}

// ───────────────────────────────────────────────────────────

class ScorePopup {
  constructor(x, y, text, color) {
    this.x        = x;
    this.y        = y;
    this.text     = text;
    this.color    = color || '#ffe066';
    this.alpha    = 1;
    this.vy       = -2;
    this.fontSize = 28;
  }

  update() {
    this.y     += this.vy;
    this.vy    *= 0.95;
    this.alpha -= 0.025;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha  = this.alpha;
    ctx.font         = `bold ${this.fontSize}px 'Fredoka One', cursive`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = this.color;

    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }

  isDead() { return this.alpha <= 0; }
}

// ═══════════════════════════════════════════════════════════
//  헬퍼 함수
// ═══════════════════════════════════════════════════════════

function spawnParticles(x, y, color, emoji, count) {
  const MAX_PARTICLES = 80;
  const available = MAX_PARTICLES - particles.length;
  const actual = Math.min(count, available);
  for (let i = 0; i < actual; i++) {
    particles.push(new Particle(x, y, color, emoji));
  }
}

function shakeScreen() { shakeAmount = 12; }

function updateLivesUI() {
  for (let i = 0; i < 3; i++) {
    document.getElementById(`life${i}`).classList.toggle('lost', i >= lives);
  }
}

function showCombo(n) {
  const el = document.getElementById('combo-display');
  el.textContent = `${n}× COMBO! 🔥`;
  el.style.opacity = '1';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.opacity = '0'; }, 800);
}

// ═══════════════════════════════════════════════════════════
//  게임 흐름
// ═══════════════════════════════════════════════════════════

//주기적으로 과일 생성하기
function spawnFruit() {

  if (gameState !== 'playing') return;

  const elapsed = (Date.now() - gameStartTime) / 1000;
  const level   = Math.floor(elapsed / 20);

  // 레벨마다 스폰 개수 증가 (1 → 2 → 3 → ...)
  const count = Math.min(1 + level, 5); // 최대 5개 동시 스폰
  for (let i = 0; i < count; i++) {
    fruits.push(new Fruit());
  }

  // 스폰 간격도 점점 짧아짐
  const delay = Math.max(600, 1500 - score * 8);
  spawnTimer = setTimeout(spawnFruit, delay);

}


function loseLife() {
  lives--;
  updateLivesUI();
  if (lives <= 0) gameOver();
}

function checkSlice() {
  if (gameState !== 'playing' || mouseSpeed < 8) return;

  for (let i = fruits.length - 1; i >= 0; i--) {
    const f = fruits[i];
    if (f.sliced || !f.isHit(mouseX, mouseY)) continue;

    if (f.isBomb) {
      loseLife();
      f.sliced = true;
      spawnParticles(f.x, f.y, '#ff4444', '💥', 8);
      scorePopups.push(new ScorePopup(f.x, f.y - 20, '💥 BOMB!', '#ff4444'));
      shakeScreen();
    } else {
      const angle = Math.atan2(mouseY - prevMouseY, mouseX - prevMouseX); //슬라이스 각도
      f.slice(angle);
      halfFruits.push(f.half1, f.half2);

      combo++;
      clearTimeout(comboTimer);
      comboTimer = setTimeout(() => { combo = 0; }, 1200);

      const pts      = f.points * (combo >= 3 ? combo : 1);
      score         += pts;
    

      const popText  = combo >= 3 ? `${combo}x COMBO! +${pts}` : `+${pts}`;
      const popColor = combo >= 3 ? '#ff6b35' : '#ffe066';
      scorePopups.push(new ScorePopup(f.x, f.y - 30, popText, popColor));

      if (combo >= 3) showCombo(combo);
    }

    fruits.splice(i, 1);
  }
}

//화면 아래로 떨어진 과일 검사
function handleMissed() {
  for (let i = fruits.length - 1; i >= 0; i--) {
    const f = fruits[i];

    //베지못한 과일
    if (!f.sliced && f.isOffScreen()) {
      if (!f.isBomb) { //폭탄 아님
        loseLife(); //생명 떨어짐
        spawnParticles(f.x, Math.min(f.y, H - 20), '#aaa', '💨', 3); //파티클 효과
      }
      fruits.splice(i, 1); //배열에서 제거
    }
  }
}

function startGame() {
  score  = 0; lives = 3; combo = 0; prevScore = -1; mouseSpeed = 0; shakeAmount = 0;
  
  fruits = []; particles = []; sliceTrail = [];
  halfFruits = []; scorePopups = [];

  gameStartTime = Date.now();

  //콤보 타이머 초기화
  clearTimeout(comboTimer);
  comboTimer = null;
  combo = 0;


  document.getElementById('scoreValue').textContent = 0;
  updateLivesUI();

  // 오버레이 내용 초기 상태로 복구
  document.getElementById('overlayEmoji').textContent        = '🍉 🍊 🍋 🍇 🍑';
  document.getElementById('overlayTitle').textContent        = 'Fruit Slicer'; // h1 id 필요
  document.getElementById('overlayScoreLabel').style.display = 'none';
  document.getElementById('overlayScore').style.display      = 'none';
  document.getElementById('startBtn').textContent            = '게임 시작';

  document.getElementById('overlay').classList.add('hidden');

  gameState = 'playing';
  clearTimeout(spawnTimer);
  spawnTimer = setTimeout(spawnFruit, 300);
  if (animId) cancelAnimationFrame(animId);
  gameLoop();
}

function gameOver() {
  gameState = 'over';
  clearTimeout(spawnTimer);

  document.getElementById('overlayEmoji').textContent      = '💀';
  document.getElementById('overlayTitle').textContent      = 'Game Over';
  document.getElementById('overlayScoreLabel').style.display = 'block';
  document.getElementById('overlayScore').style.display      = 'block';
  document.getElementById('overlayScore').textContent        = score;
  document.getElementById('startBtn').textContent            = '다시 시작';

  document.getElementById('overlay').classList.remove('hidden');

  canvas.classList.remove('hide-cursor');
}
// ═══════════════════════════════════════════════════════════
//  렌더링
// ═══════════════════════════════════════════════════════════


function drawTrail() {
  if (sliceTrail.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(sliceTrail[0].x, sliceTrail[0].y);
  for (let i = 1; i < sliceTrail.length; i++) {
    ctx.lineTo(sliceTrail[i].x, sliceTrail[i].y); //점들을 선들로 연결
  }
  ctx.strokeStyle = 'rgba(180, 230, 255, 0.6)';
  ctx.lineWidth   = 2;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.stroke(); //한번에 그리기
}



// 마우스 커서 그리기, 이펙트 효과 
function drawCursor() {
  const speed = Math.min(mouseSpeed / 30, 1);
  ctx.save(); // 캔버스 상태 저장
  ctx.translate(mouseX, mouseY);//좌표계 마우스 위치로 이동해서 마우스 위치를 (0,0) 으로 변경

  ctx.beginPath();
  ctx.arc(0, 0, 10 + speed * 4, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255,255,255,${0.4 + speed * 0.5})`;
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle   = `rgba(255,255,255,${0.7 + speed * 0.3})`;
  ctx.shadowColor = 'white'; //Glow 효과
  ctx.shadowBlur  = 10;
  ctx.fill();

  ctx.restore(); //translate, shadow 설정 제거. 캔버스 상태 복구
}

//game loop

function gameLoop() {

  animId = requestAnimationFrame(gameLoop);


  ctx.save(); //현재 캔버스 설정 (좌표, 색상) 설정

  // 화면 흔들림
  if (shakeAmount > 0) {

    // 폭탄이 터지면 shakeAmount = 12 로 설정됨
    ctx.translate(
      (Math.random() - 0.5) * shakeAmount,
      (Math.random() - 0.5) * shakeAmount
    );
    shakeAmount *= 0.8; //프레임 지날수록 적게 흔들리도록 함
    if (shakeAmount < 0.5) shakeAmount = 0;
  }

  // 배경
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H); // 캔버스 전체를 배경색으로 덮어서 이전 프레임 지우기


  //스코어 변경시에 스코어 바꾸기
  if (score !== prevScore) {
   document.getElementById('scoreValue').textContent = score;
    prevScore = score;
  }

  // 격자 패턴 (오프스크린에서 복사)
  ctx.drawImage(gridCanvas, 0, 0);
  
  // 궤적 업데이트 & 그리기
  sliceTrail.forEach(p => { p.alpha -= 0.06; });
  if (gameState === 'playing' && mouseSpeed > 3) { 
    //어느정도 움직임이 있을 때만 trail 표시
    if (sliceTrail.length < 30) sliceTrail.push(new TrailPoint(mouseX, mouseY));
  }
  while (sliceTrail.length > 0 && sliceTrail[0].alpha <= 0) sliceTrail.shift(); //제일 오래된 마우스 포인트(칸) 삭제
  drawTrail();

  // 과일. 생성되면 그리는 용도
  fruits.forEach(f => { f.update(); f.draw(); });

  // 반쪽 조각 — 최대 20개 초과 시 오래된 것부터 제거
  if (halfFruits.length > 20) halfFruits.splice(0, halfFruits.length - 20);

  // 반쪽 조각
  for (let i = halfFruits.length - 1; i >= 0; i--) {
    halfFruits[i].update();
    halfFruits[i].draw();
    if (halfFruits[i].isDead()) halfFruits.splice(i, 1);
  }

  // 파티클
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].isDead()) particles.splice(i, 1);
  }

  // 점수 팝업
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    scorePopups[i].update();
    scorePopups[i].draw();
    if (scorePopups[i].isDead()) scorePopups.splice(i, 1);
  }

  drawCursor();

  ctx.restore(); //save 시점으로 되돌림 

  if (gameState === 'playing') handleMissed();



}

// ═══════════════════════════════════════════════════════════
//  이벤트 리스너
// ═══════════════════════════════════════════════════════════

//플레이어 칼질 시 호출
canvas.addEventListener('mousemove', (e) => {
  const rect   = canvas.getBoundingClientRect(); //브라우저 화면에서 실제 크기 가져옴
  const scaleX = W / rect.width; //좌표 변환
  const scaleY = H / rect.height;
  prevMouseX = mouseX; //이전 마우스 포인트 저장
  prevMouseY = mouseY;
  mouseX = (e.clientX - rect.left) * scaleX; // 마우스 좌표 계산
  mouseY = (e.clientY - rect.top)  * scaleY;

  const dx = mouseX - prevMouseX, dy = mouseY - prevMouseY; //움직임 차이
  mouseSpeed = Math.sqrt(dx * dx + dy * dy); //마우스가 이전위치에서 현재 위치로 실제로 얼마나 이동했는가? 한프레임동안 움직인 속도로 이용
  checkSlice(); //마우스 지나간 경로에 과일 있으면 자른다
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect   = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  const t      = e.touches[0]; //첫번째 손가락
  prevMouseX = mouseX;
  prevMouseY = mouseY;
  mouseX = (t.clientX - rect.left) * scaleX;
  mouseY = (t.clientY - rect.top)  * scaleY;

  const dx = mouseX - prevMouseX, dy = mouseY - prevMouseY;
  mouseSpeed = Math.sqrt(dx * dx + dy * dy);
  checkSlice();
}, { passive: false });

document.getElementById('startBtn').addEventListener('click', () => {
  canvas.classList.add('hide-cursor');
  startGame();
});



// ─── 초기 루프 (idle 상태 배경 애니메이션) ──────────────────
gameLoop();