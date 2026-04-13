# 🍉 Fruit Slider Game

![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![Firebase](https://img.shields.io/badge/Firebase-RealtimeDB-blue)

> 마우스로 과일을 슬라이스하는 웹 기반 캐주얼 게임

![gameplay](./screenshot.gif) <!-- 스크린샷 or GIF 추가 -->

## 게임 링크

<p align="left">
  <a href="https://mina-401.github.io/fruit-slider-game/">
    <img src="https://img.shields.io/badge/▶️ Play Now-Fruit Slider Game-green?style=for-the-badge&logo=github" />
  </a>
</p>

## 🎮 플레이 방법

- 마우스를 빠르게 휘둘러 과일을 슬라이스하세요
- **폭탄은 피해야 합니다**
- 하트 3개 → 모두 잃으면 게임 오버
- 콤보 시스템  
- 3연속 이상 성공 시 → 점수 배수 증가
- (개발자 모드) p 또는 일시정지 버튼으로 일시정지 가능

---

## 게임 특징

- 🍉🍊🍋🍇🍑🍓🥝🍍 8종 과일 + 💣 폭탄
- 15초마다 난이도 상승 (레벨업 시스템)
- 콤보 & 점수 팝업 효과
- 마우스 궤적
- 파티클 & 화면 흔들림 이펙트
- Firebase 실시간 리더보드

---

## 🛠 기술 스택

- HTML5 Canvas
- JavaScript (ES Modules)
- CSS
- Firebase Realtime Database

---

## 📁 파일 구조
```
fruit-slider-game/ 
├── index.html # 메인 게임 화면 
├── leaderboard.html # 리더보드 화면
├── css/
│     ├── style.css
│     └── leaderboard.css
└── js/
     ├── main.js # 진입점 & 이벤트 처리
     ├── game.js # 게임 핵심 로직
     ├── config.js # 설정값 및 상수
     ├── state.js # 전역 상태 관리
     ├── classes.js # Fruit, Particle 클래스
     ├── render.js # 렌더링 루프
     ├── canvas.js # 캔버스 초기화
     ├── ui.js # UI 업데이트
     └── leaderboard.js # Firebase 연동
```

## 문제 해결
### 고해상도 디스플레이에서 과일과 커서가 크게 보이는 문제

**원인**  
디스플레이 `devicePixelRatio`가 2 이상으로, CSS `1px`이 실제 물리 `2px`로 렌더링됨.  
버퍼 크기를 CSS 크기와 동일하게 설정하면 브라우저가 버퍼를 늘려서 표시하여 모든 게 커 보임.

**해결**  
버퍼는 `dpr`배로 키우고, CSS 표시 크기는 고정, `ctx.scale(dpr, dpr)`로 좌표계 보정.

```js
const dpr = window.devicePixelRatio || 1;
canvas.width        = W * dpr;
canvas.height       = H * dpr;
canvas.style.width  = W + 'px';
canvas.style.height = H + 'px';
ctx.scale(dpr, dpr);
```

## 주의
- Firebase API 키가 클라이언트 코드에 노출되는 구조  
- 보안은 규칙(Security Rules)과 도메인 제한으로 관리  
- 해결책:
  - Firebase Authentication 및 Realtime Database Rules 설정
  - 승인된 도메인에서만 요청 허용

