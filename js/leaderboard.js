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

// -- 점수 저장 ---- 
export async function saveScore(nickname, score) {
  console.log('saveScore 호출됨:', nickname, score);  // 함수 진입 확인
  
  try {
    await push(ref(db, 'scores'), {
      nickname: nickname.trim().slice(0, 12) || '익명',
      score,
      date: new Date().toLocaleDateString('ko-KR'),
      timestamp: Date.now(),
    });
    console.log('Firebase 저장 성공');  // 여기까지 오면 저장 완료
  } catch (e) {
    console.error('Firebase 저장 실패:', e);  // 에러 내용 확인
  }
}

export async function loadScores() {
  try {
    const snap = await get(ref(db, 'scores'));
    if (!snap.exists()) return [];

    // forEach 대신 Object.values 사용
    const scores = Object.values(snap.val());
    console.log('불러온 점수:', scores);

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

  } catch (e) {
    console.error('Firebase 불러오기 실패:', e);
    return [];
  }
}