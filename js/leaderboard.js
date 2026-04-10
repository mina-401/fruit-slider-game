// leaderboard.js
import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js';
import { getDatabase, ref, push, get, query, orderByChild, limitToLast }
  from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js';

//나중에 수정해야함
const firebaseConfig = {
    apiKey: "AIzaSyD7OQTnCKYiCzd1mxxyMc7c60FNORN8TvE",
    authDomain: "fruitslicer.firebaseapp.com",
    databaseURL: "https://fruitslicer-default-rtdb.firebaseio.com",
    projectId: "fruitslicer",
    storageBucket: "fruitslicer.firebasestorage.app",
    messagingSenderId: "1019746311988",
    appId: "1:1019746311988:web:d78f71e9752b4e0214cf61",
    measurementId: "G-V7F9HR9KZY"
};


const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ─── 점수 저장 ───────────────────────────────────────────────
export async function saveScore(nickname, score) {
  await push(ref(db, 'scores'), {
    nickname: nickname.trim().slice(0, 12) || '익명',
    score,
    date: new Date().toLocaleDateString('ko-KR'),
    timestamp: Date.now(),
  });
}

// ─── 상위 10개 불러오기 ──────────────────────────────────────
export async function loadScores() {
  const q      = query(ref(db, 'scores'), orderByChild('score'), limitToLast(5));
  const snap   = await get(q);
  if (!snap.exists()) return [];

  const scores = [];
  snap.forEach(child => scores.push(child.val()));
  return scores.sort((a, b) => b.score - a.score);
}