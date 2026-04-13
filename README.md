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
fruit-slider-game/ <br>
├── index.html # 메인 게임 화면 <br>
├── leaderboard.html # 리더보드 화면<br>
├── css/<br>
│ &nbsp;&nbsp;&nbsp;&nbsp;├── style.css<br>
│ &nbsp;&nbsp;&nbsp;&nbsp;└── leaderboard.css<br>
└── js/<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── main.js # 진입점 & 이벤트 처리<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── game.js # 게임 핵심 로직<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── config.js # 설정값 및 상수<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── state.js # 전역 상태 관리<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── classes.js # Fruit, Particle 클래스<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── render.js # 렌더링 루프<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── canvas.js # 캔버스 초기화<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── ui.js # UI 업데이트<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── leaderboard.js # Firebase 연동<br>

## 주의
Firebase API 키가 하드코딩되어 있음

