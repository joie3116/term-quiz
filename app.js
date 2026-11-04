// 용어 퀴즈 — 기능 1(묶음 고르기 + 객관식) + 기능 2(틀린 것만 다시 보기)
(() => {
  'use strict';

  // ===== 용어 데이터 =====
  // terms.md의 표를 글자 그대로 옮겼다. 원본은 terms.md이고, 여기 글자는 terms.md와 한 글자도 다르지 않게 둔다.
  // 코드 안의 \\ 는 화면에서 \ 하나로 보인다 (JS 문자열 안에 \ 를 적는 방법).

  // 묶음 이름 (terms.md "묶음 이름" 표). 개수는 아래 TERMS에서 센다
  const GROUPS = [
    { 묶음: 1, 이름: '터미널과 파일' },
    { 묶음: 2, 이름: '웹 페이지의 재료' },
    { 묶음: 3, 이름: '개념 — 식당 비유' },
    { 묶음: 4, 이름: 'Git과 GitHub' },
    { 묶음: 5, 이름: 'AI 도구와 일하는 방식' },
    { 묶음: 6, 이름: '배포' },
  ];

  // 용어 67개 (terms.md "용어 67개" 표). 한 줄 = 용어 하나
  // 알아보기만: true면 문제 화면에서 용어 옆에 "(알아보기만)"을 붙인다
  const TERMS = [
    { 번호: 1, 묶음: 1, 용어: '터미널 (PowerShell)', 뜻: '글자로 명령을 치는 창', 비유: '0단계', 알아보기만: false },
    { 번호: 2, 묶음: 1, 용어: '명령줄 맨 앞 `PS C:\\...>`', 뜻: '지금 내가 서 있는 폴더', 비유: '위치는 여기서 본다', 알아보기만: false },
    { 번호: 3, 묶음: 1, 용어: '`cd` / `dir` / `mkdir`', 뜻: '폴더 이동 / 안 보기 / 만들기', 비유: 'cd는 나를 옮기고 dir은 방 안을 보여 준다', 알아보기만: false },
    { 번호: 4, 묶음: 1, 용어: '경로 (`C:\\Users\\...`)', 뜻: '파일이 있는 자리의 주소', 비유: '—', 알아보기만: false },
    { 번호: 5, 묶음: 1, 용어: '확장자 (`.html` `.md` `.js`)', 뜻: '파일 종류 표시. 소문자로', 비유: 'README.MD 사건 (11-04)', 알아보기만: false },
    { 번호: 6, 묶음: 1, 용어: '`Rename-Item`', 뜻: 'PowerShell의 이름 바꾸기', 비유: '탐색기 대신 한 줄', 알아보기만: false },
    { 번호: 7, 묶음: 1, 용어: 'VS Code', 뜻: '코드 편집기. 왼쪽 아이콘은 창 스위치 (돋보기=검색, 종이 두 장=탐색기)', 비유: '—', 알아보기만: false },
    { 번호: 8, 묶음: 1, 용어: 'Node.js / npm', 뜻: 'JavaScript를 브라우저 밖에서 돌리는 프로그램 / 패키지 설치 명령', 비유: '설치만 했고 아직 안 씀', 알아보기만: true },
    { 번호: 9, 묶음: 1, 용어: 'LF / CRLF', 뜻: '줄바꿈 기호의 Linux식 / Windows식. 경고는 무해', 비유: '`.claude/launch.json` 경고', 알아보기만: false },
    { 번호: 10, 묶음: 2, 용어: 'HTML / CSS / JavaScript', 뜻: '구조(화면에 뭐가 있나) / 모양 / 동작', 비유: 'index.html / style.css / app.js', 알아보기만: false },
    { 번호: 11, 묶음: 2, 용어: '네 덩어리', 뜻: '한 파일 안의 설정·모양·화면·동작. 경계는 `<style>` `<body>` `<script>`', 비유: '2단계 궁합 보기', 알아보기만: false },
    { 번호: 12, 묶음: 2, 용어: '함수', 뜻: '동작 덩어리 하나. "버튼을 누르면" 함수가 나머지를 불러 쓴다', 비유: 'app.js의 `function ...`', 알아보기만: false },
    { 번호: 13, 묶음: 2, 용어: '코드의 뼈대', 뜻: '입력 검사 → 통과하면 계산 → 화면에 표시', 비유: '모든 1단계 앱', 알아보기만: false },
    { 번호: 14, 묶음: 2, 용어: '입력 검증', 뜻: '빈칸·길이·범위를 저장 전에 거르는 것', 비유: '「05」 A5. app.js의 `readForm`', 알아보기만: false },
    { 번호: 15, 묶음: 2, 용어: 'textContent', 뜻: '사용자가 적은 글을 "글자로만" 화면에 넣는 방법. innerHTML은 금지', 비유: '「05」 A5. app.js의 `titleEl.textContent`', 알아보기만: false },
    { 번호: 16, 묶음: 2, 용어: '확인창 (confirm)', 뜻: '삭제 전에 "정말?" 묻는 창', 비유: '「05」 B3. app.js의 `window.confirm`', 알아보기만: false },
    { 번호: 17, 묶음: 2, 용어: 'localStorage', 뜻: '브라우저 안의 저장 서랍. 기기·브라우저마다 따로', 비유: '홀만 있는 앱의 서랍', 알아보기만: false },
    { 번호: 18, 묶음: 2, 용어: '저장 키 (`reading-log.records`)', 뜻: '서랍 칸의 이름. 앱마다 다르게', 비유: 'CLAUDE.md 규칙. app.js의 `STORAGE_KEY`', 알아보기만: false },
    { 번호: 19, 묶음: 2, 용어: '라벨 / 안내 글자 (placeholder)', 뜻: '입력 칸 위 이름 / 칸 안의 흐린 예시 글', 비유: '쪽수 칸 피드백 (11-04)', 알아보기만: false },
    { 번호: 20, 묶음: 2, 용어: '정적 파일', 뜻: '서버가 계산할 것 없이 그대로 보내 주는 파일', 비유: '빌드 없음의 이유', 알아보기만: false },
    { 번호: 21, 묶음: 2, 용어: '빌드', 뜻: '사람이 쓴 코드를 브라우저가 읽는 HTML/CSS/JS로 바꾸는 변환', 비유: '우리는 없음', 알아보기만: true },
    { 번호: 22, 묶음: 2, 용어: '프레임워크 (React 등)', 뜻: '빌드가 필요한 제작 도구', 비유: 'Vercel의 Framework Preset', 알아보기만: true },
    { 번호: 23, 묶음: 3, 용어: '프론트엔드 / 백엔드 / DB', 뜻: '화면 / 처리 / 저장', 비유: '홀 / 주방 / 창고', 알아보기만: false },
    { 번호: 24, 묶음: 3, 용어: '서버', 뜻: '24시간 켜진 남의 컴퓨터. 홀/주방 경계는 "내 기기 안 / 인터넷 건너"', 비유: '카톡 비교', 알아보기만: false },
    { 번호: 25, 묶음: 3, 용어: 'API', 뜻: '프로그램끼리 데이터를 주고받는 약속', 비유: '주문서 (4단계)', 알아보기만: true },
    { 번호: 26, 묶음: 3, 용어: '패키지 (라이브러리)', 뜻: '남이 만든 기능 묶음', 비유: '시판 소스', 알아보기만: true },
    { 번호: 27, 묶음: 3, 용어: '환경 변수 (.env)', 뜻: '비밀값을 코드 밖에 두는 곳', 비유: '사장 수첩 (4단계)', 알아보기만: true },
    { 번호: 28, 묶음: 3, 용어: '비밀키 / API 키', 뜻: '외부 서비스가 나를 알아보는 열쇠. 코드·채팅에 안 넣는다', 비유: '「05」 A1', 알아보기만: true },
    { 번호: 29, 묶음: 3, 용어: '배포 ≠ 동기화', 뜻: '주소 만들기(3단계) ≠ 기기끼리 데이터 합치기(4단계)', 비유: '—', 알아보기만: false },
    { 번호: 30, 묶음: 4, 용어: 'git', 뜻: '폴더의 변경 역사를 기록하는 프로그램', 비유: '장부 / 게임 세이브', 알아보기만: false },
    { 번호: 31, 묶음: 4, 용어: '저장소 (repository)', 뜻: '한 프로젝트의 git 기록 전체. PC에 하나, GitHub에 하나', 비유: '창고', 알아보기만: false },
    { 번호: 32, 묶음: 4, 용어: 'GitHub', 뜻: '저장소를 올려 두는 서비스. Public/Private', 비유: '클라우드', 알아보기만: false },
    { 번호: 33, 묶음: 4, 용어: '`git init`', 뜻: '폴더에 git 기록 시작. 폴더마다 처음 한 번', 비유: '장부 들이기', 알아보기만: false },
    { 번호: 34, 묶음: 4, 용어: '`git add`', 뜻: '다음 커밋에 넣을 파일 고르기. `.`은 전부, 파일 이름은 그것만', 비유: '가방에 담기 / 사진 찍기', 알아보기만: false },
    { 번호: 35, 묶음: 4, 용어: '스테이징 영역', 뜻: 'add로 담긴, 다음 커밋 후보 목록', 비유: '가방', 알아보기만: false },
    { 번호: 36, 묶음: 4, 용어: '`git restore --staged`', 뜻: '담은 것 빼기 (파일은 남음)', 비유: '가방에서 꺼내기', 알아보기만: false },
    { 번호: 37, 묶음: 4, 용어: '`git commit -m "메시지"`', 뜻: '후보를 이름 붙여 저장점으로 확정. 내 PC에만', 비유: '세이브', 알아보기만: false },
    { 번호: 38, 묶음: 4, 용어: '커밋 메시지 / 커밋 번호', 뜻: '세이브 이름 / 7자리 고유 번호(`8d350a1`)', 비유: '—', 알아보기만: false },
    { 번호: 39, 묶음: 4, 용어: '`git push`', 뜻: '커밋을 GitHub로 복사', 비유: '창고로 복사 / 클라우드 업로드', 알아보기만: false },
    { 번호: 40, 묶음: 4, 용어: '`git status`', 뜻: '보고서: 어느 줄기 / GitHub와 같나 / 달라진 게 있나. 괄호 줄은 다음 명령 안내', 비유: '가방 들여다보기', 알아보기만: false },
    { 번호: 41, 묶음: 4, 용어: '`git log`', 뜻: '커밋 목록', 비유: '세이브 목록', 알아보기만: false },
    { 번호: 42, 묶음: 4, 용어: '`git restore .`', 뜻: '마지막 커밋 상태로 되돌리기. 되돌릴 수 없으니 먼저 status', 비유: '세이브 불러오기', 알아보기만: false },
    { 번호: 43, 묶음: 4, 용어: 'Untracked / modified / new file', 뜻: '한 번도 기록 안 된 파일 / 바뀐 파일 / 새로 담긴 파일', 비유: 'status의 세 단어', 알아보기만: false },
    { 번호: 44, 묶음: 4, 용어: '브랜치 (main, master)', 뜻: '기록의 줄기. `git branch -M main`은 이름 바꾸기', 비유: '아직 하나만', 알아보기만: false },
    { 번호: 45, 묶음: 4, 용어: 'remote / origin', 뜻: 'GitHub 창고 주소 / 그 주소에 붙인 별명', 비유: '창고 주소 적기', 알아보기만: false },
    { 번호: 46, 묶음: 4, 용어: '`git push -u origin main`', 뜻: '첫 push + 다음부터 `git push`만 쳐도 되게 연결', 비유: '—', 알아보기만: false },
    { 번호: 47, 묶음: 4, 용어: '`HEAD -> main, origin/main`', 뜻: 'log의 이 한 줄 = PC와 GitHub가 같은 상태', 비유: '—', 알아보기만: false },
    { 번호: 48, 묶음: 4, 용어: '`error:` / `fatal:` vs `warning:`', 뜻: '에러 / 에러. 경고는 안내', 비유: '—', 알아보기만: false },
    { 번호: 49, 묶음: 4, 용어: '`7 insertions(+), 7 deletions(-)`', 뜻: '커밋에 들어간 줄 수', 비유: '영수증', 알아보기만: false },
    { 번호: 50, 묶음: 4, 용어: 'README.md', 뜻: '저장소 표지. GitHub가 파일 목록 아래에 보여 준다', 비유: '6단계 조건', 알아보기만: false },
    { 번호: 51, 묶음: 4, 용어: '.gitignore', 뜻: 'git이 못 본 척할 파일 목록. `.env`를 넣는다', 비유: '4단계', 알아보기만: true },
    { 번호: 52, 묶음: 5, 용어: 'Claude Code', 뜻: '터미널에서 말로 시키면 파일을 쓰는 도구. 3주 고정', 비유: '3단계', 알아보기만: false },
    { 번호: 53, 묶음: 5, 용어: 'CLAUDE.md', 뜻: 'Claude Code가 매번 읽는 지침 파일 (기술 스택, 규칙, 하지 말 것)', 비유: '「04」 12번', 알아보기만: false },
    { 번호: 54, 묶음: 5, 용어: 'SPEC.md / 스펙', 뜻: '한 줄 설명 · 사용자와 상황 · 기능 3개 · 하지 않을 것 · 제약 · 완료 조건', 비유: '「02」', 알아보기만: false },
    { 번호: 55, 묶음: 5, 용어: '결정 사항', 뜻: 'AI가 임의로 정한 것을 따로 뽑아 OK 받는 목록. SPEC.md에 적어야 도구에 전달', 비유: '수정 1회의 원인', 알아보기만: false },
    { 번호: 56, 묶음: 5, 용어: '완료 조건', 뜻: '"해 볼 것 → 보여야 하는 것"으로 바꿀 수 있는 문장', 비유: '—', 알아보기만: false },
    { 번호: 57, 묶음: 5, 용어: '계획 → OK → 코드', 뜻: '구현 요청의 순서. OK는 파일 수·범위·스펙 세부·화면 검사', 비유: '—', 알아보기만: false },
    { 번호: 58, 묶음: 5, 용어: '수정 요청', 뜻: '해결책이 아니라 "지금 이렇게 → 이렇게 되면 좋겠어 + 이것만"', 비유: '—', 알아보기만: false },
    { 번호: 59, 묶음: 5, 용어: '시안', 뜻: '코드 전에 글로 그린 화면 배치', 비유: '1단계', 알아보기만: false },
    { 번호: 60, 묶음: 5, 용어: '피드백 분류', 뜻: '고칠 것 / 다음 버전 / 안 할 것', 비유: '친구 피드백 (11-04)', 알아보기만: false },
    { 번호: 61, 묶음: 5, 용어: '`.claude/launch.json`', 뜻: 'Claude Code가 미리보기를 어떻게 켤지 적은 설정 파일', 비유: '바닥에 남은 것', 알아보기만: false },
    { 번호: 62, 묶음: 6, 용어: '배포', 뜻: '파일을 서버에 올려 주소를 받는 일', 비유: '3단계', 알아보기만: false },
    { 번호: 63, 묶음: 6, 용어: 'Vercel / Netlify', 뜻: 'GitHub 저장소를 연결하면 주소를 만들어 주는 서비스', 비유: '—', 알아보기만: false },
    { 번호: 64, 묶음: 6, 용어: 'URL / 도메인', 뜻: '인터넷 주소 / 주소의 이름 부분 (`reading-log-plum.vercel.app`)', 비유: '—', 알아보기만: false },
    { 번호: 65, 묶음: 6, 용어: 'Framework Preset = Other, Build Command 빈칸, Output Directory', 뜻: '"변환 없음"을 Vercel에 말해 주는 세 칸', 비유: '—', 알아보기만: false },
    { 번호: 66, 묶음: 6, 용어: '자동 재배포', 뜻: 'push하면 Vercel이 새 파일을 알아서 다시 올림', 비유: 'push = 배포', 알아보기만: false },
    { 번호: 67, 묶음: 6, 용어: '환경 변수 설정 (배포 서비스의)', 뜻: '비밀키를 서버에 따로 넣는 칸. 우리는 비움', 비유: '4단계', 알아보기만: true },
  ];
  // ===== 용어 데이터 끝 =====

  // ===== 화면 요소 =====
  const homeScreen = document.getElementById('home-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const resultScreen = document.getElementById('result-screen');
  const groupButtonsEl = document.getElementById('group-buttons');
  const termEl = document.getElementById('term');
  const lookOnlyEl = document.getElementById('look-only');
  const choicesEl = document.getElementById('choices');
  const feedbackEl = document.getElementById('feedback');
  const verdictEl = document.getElementById('verdict');
  const answerEl = document.getElementById('answer');
  const analogyEl = document.getElementById('analogy');
  const nextBtn = document.getElementById('next-button');
  const scoreEl = document.getElementById('score');
  const wrongListEl = document.getElementById('wrong-list');
  const homeBtn = document.getElementById('home-button');
  const homeMessageEl = document.getElementById('home-message');
  const resetBtn = document.getElementById('reset-button');
  const saveErrorEl = document.getElementById('save-error');

  // 지금 풀고 있는 한 판. 묶음을 고를 때마다 새로 만든다
  // (한 판 자체는 저장하지 않는다. 틀린 것 목록은 답해서 바뀔 때 바로 저장한다)
  // { questions: 섞은 용어 목록, index: 지금 몇 번째 문제(0부터), correct: 맞은 수,
  //   wrongNumbers: 이번 판에 틀린 용어 번호들, answered: 지금 문제에 답했나 }
  let round = null;

  // ===== 틀린 것 목록 저장 (localStorage) =====

  // 저장 키. 더블클릭으로 연 다른 앱과 브라우저 저장 공간을 같이 쓰므로 "term-quiz."로 시작한다. 이름은 바꾸지 않는다
  const WRONG_KEY = 'term-quiz.wrong';

  // 저장된 틀린 것 목록(용어 번호 배열, 예: [5, 62])을 읽는다.
  // 저장 공간을 못 쓰거나 값이 망가졌으면 빈 목록. TERMS에 있는 번호만 겹치지 않게 번호 순으로 남긴다
  function loadWrong() {
    let saved;
    try {
      const raw = localStorage.getItem(WRONG_KEY);
      saved = raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
    if (!Array.isArray(saved)) return [];
    return TERMS.filter((t) => saved.includes(t.번호)).map((t) => t.번호);
  }

  // 목록을 JSON(목록을 글자로 바꾼 모양)으로 저장한다. 성공하면 true, 실패하면 false
  function saveWrong(list) {
    try {
      localStorage.setItem(WRONG_KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      return false;
    }
  }

  // 이 앱의 칸 하나만 지운다 (저장 공간 전체를 비우면 다른 앱 기록까지 지워진다). 성공하면 true
  function removeWrong() {
    try {
      localStorage.removeItem(WRONG_KEY);
      return true;
    } catch (err) {
      return false;
    }
  }

  // 채점 결과를 목록에 반영한다 (결정 사항 4): 틀리면 넣고(이미 있으면 그대로), 맞추면 뺀다.
  // 어느 모드든 answer()가 이것을 부른다. 다른 탭에서 바꾼 것을 덮어쓰지 않도록 쓰기 직전에 다시 읽고,
  // 목록이 바뀔 때만 저장한다. 저장에 실패하면 false
  function recordAnswer(number, isCorrect) {
    const list = loadWrong();
    const has = list.includes(number);
    if (isCorrect && has) return saveWrong(list.filter((n) => n !== number));
    if (!isCorrect && !has) return saveWrong(list.concat(number).sort((a, b) => a - b));
    return true;
  }

  // ===== 섞기와 보기 만들기 =====

  // 배열을 무작위 순서로 섞은 새 배열을 돌려준다 (원래 배열은 그대로 둔다).
  // 맨 뒤 칸부터 앞으로 오면서 그 칸까지의 아무 칸과 맞바꾼다. 이렇게 하면 모든 순서가 같은 확률로 나온다
  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  // 보기 4개 = 정답 1 + 오답 3 (결정 사항 1).
  // 오답은 정답 용어와 같은 묶음의 다른 용어 뜻에서 뽑는다. "전체"로 풀 때도 67개 표에서 같은 묶음만 고른다.
  // 4개의 순서도 문제마다 새로 섞는다
  function makeChoices(term) {
    const sameGroup = TERMS.filter((t) => t.묶음 === term.묶음 && t.번호 !== term.번호);
    const wrongs = shuffle(sameGroup).slice(0, 3);
    return shuffle([term].concat(wrongs));
  }

  // ===== 버튼 누르기 =====

  // 버튼을 누르면 handler를 부른다. 단, 더블클릭의 두 번째 클릭은 무시한다.
  // 클릭 한 번에 화면이 바로 바뀌기 때문에, 더블클릭하면 두 번째 클릭이 새로 나타난 버튼
  // (예: 첫 문제의 보기)을 눌러 버린다. event.detail은 연달아 누른 횟수다
  // (마우스 한 번 = 1, 더블클릭의 두 번째 = 2, 키보드 Enter·Space = 0)
  function onClick(button, handler) {
    button.addEventListener('click', (event) => {
      if (event.detail > 1) return;
      handler();
    });
  }

  // ===== 화면 =====

  // 세 화면(첫 화면, 문제, 결과) 중 하나만 보이게 하고 맨 위로 올린다
  function showScreen(screen) {
    homeScreen.hidden = screen !== homeScreen;
    quizScreen.hidden = screen !== quizScreen;
    resultScreen.hidden = screen !== resultScreen;
    window.scrollTo(0, 0);
  }

  // 첫 화면의 "틀린 것 (N개)" 버튼. renderHome()이 새로 만든다
  let wrongButtonEl = null;

  // 첫 화면: 묶음 1~6 버튼(번호, 이름, 개수), 전체 버튼, 틀린 것 버튼 (결정 사항 2).
  // 개수는 TERMS와 저장된 목록에서 센다. 처음 열 때, "처음으로"를 누를 때, 초기화한 뒤에 다시 그린다.
  // 화면 글자는 모두 textContent로 넣는다
  function renderHome() {
    groupButtonsEl.replaceChildren();
    GROUPS.forEach((group) => {
      const terms = TERMS.filter((t) => t.묶음 === group.묶음);
      addGroupButton(group.묶음 + ' ' + group.이름 + ' (' + terms.length + ')', terms);
    });
    addGroupButton('전체 (' + TERMS.length + ')', TERMS);

    wrongButtonEl = document.createElement('button');
    wrongButtonEl.type = 'button';
    onClick(wrongButtonEl, startWrongRound);
    groupButtonsEl.appendChild(wrongButtonEl);
    updateWrongButton(loadWrong().length);

    homeMessageEl.hidden = true;
  }

  function updateWrongButton(count) {
    wrongButtonEl.textContent = '틀린 것 (' + count + '개)';
  }

  function addGroupButton(label, terms) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    onClick(button, () => startRound(terms));
    groupButtonsEl.appendChild(button);
  }

  // "틀린 것" 버튼: 누르는 순간의 목록을 다시 읽어 그 용어들만 한 판으로 낸다.
  // 풀면서 맞춘 용어는 목록에서 빠지지만, 이번 판의 문제는 처음 그대로 간다.
  // 0개면 버튼 글자를 (0개)로 고치고 안내 문구를 띄운다 (버튼을 다시 만들지 않아 키보드 위치가 그대로다)
  function startWrongRound() {
    const list = loadWrong();
    if (list.length === 0) {
      updateWrongButton(0);
      showHomeMessage('틀린 것이 없어요. 묶음을 골라 풀어 보세요.');
      return;
    }
    startRound(TERMS.filter((t) => list.includes(t.번호)));
  }

  // 첫 화면 안내 문구. 창이 작아 문구가 화면 밖에 있으면 보이는 곳까지만 스크롤한다
  function showHomeMessage(text) {
    homeMessageEl.textContent = text;
    homeMessageEl.hidden = false;
    homeMessageEl.scrollIntoView({ block: 'nearest' });
  }

  // "처음으로": 틀린 것 개수를 새로 세어 첫 화면을 다시 그린다
  function goHome() {
    renderHome();
    showScreen(homeScreen);
  }

  // "기록 초기화": 확인창을 띄우고, 확인하면 틀린 것 목록을 지운다 (결정 사항 7·8).
  // 시험 기록 지우기와 확인창 문구는 기능 3에서 고친다
  function resetRecords() {
    if (!window.confirm('틀린 것 목록을 모두 지울까요?')) return;
    const removed = removeWrong();
    renderHome();
    if (!removed) showHomeMessage('삭제하지 못했어요. 다시 시도해 주세요.');
  }

  // 한 판 시작: 고른 묶음의 용어를 섞어서 한 문제씩 낸다
  function startRound(terms) {
    round = { questions: shuffle(terms), index: 0, correct: 0, wrongNumbers: [], answered: false };
    showScreen(quizScreen);
    renderQuestion();
  }

  // 문제 하나: 용어(알아보기만이면 옆에 "(알아보기만)")와 뜻 4개.
  // 방향은 "용어를 보고 뜻 고르기" 하나뿐이다 (결정 사항 3)
  function renderQuestion() {
    const term = round.questions[round.index];
    round.answered = false;
    termEl.textContent = term.용어;
    lookOnlyEl.hidden = !term.알아보기만;

    choicesEl.replaceChildren();
    const buttons = [];
    makeChoices(term).forEach((choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.textContent = choice.뜻;
      onClick(button, () => answer(term, choice, buttons));
      buttons.push(button);
      choicesEl.appendChild(button);
    });

    feedbackEl.hidden = true;
    nextBtn.hidden = true;
    window.scrollTo(0, 0);
  }

  // 보기를 고르면 바로 맞음/틀림, 정답 뜻, 비유를 보여 주고 "다음" 버튼을 꺼낸다.
  // 틀린 것 목록도 바로 고쳐 저장한다 (중간에 창을 닫아도 그때까지 남는다).
  // 처음 고른 것만 채점하도록 보기 4개를 잠근다
  function answer(term, choice, buttons) {
    if (round.answered) return;
    round.answered = true;
    buttons.forEach((button) => {
      button.disabled = true;
    });

    const isCorrect = choice.번호 === term.번호;
    if (isCorrect) {
      round.correct += 1;
    } else {
      round.wrongNumbers.push(term.번호);
    }
    const saved = recordAnswer(term.번호, isCorrect);

    verdictEl.textContent = isCorrect ? '맞음' : '틀림';
    verdictEl.className = isCorrect ? 'verdict correct' : 'verdict wrong';
    answerEl.textContent = term.뜻;
    analogyEl.textContent = term.비유;
    saveErrorEl.hidden = saved;
    feedbackEl.hidden = false;
    nextBtn.hidden = false;
    nextBtn.focus();
  }

  // "다음": 다음 문제로 간다. 마지막 문제 뒤에는 결과 화면
  function goNext() {
    if (!round || !round.answered) return;
    round.index += 1;
    if (round.index < round.questions.length) {
      renderQuestion();
    } else {
      renderResult();
    }
  }

  // 결과: 점수(맞은 수 / 문제 수)와 틀린 용어 번호(terms.md의 번호, 작은 순)
  function renderResult() {
    scoreEl.textContent = round.correct + ' / ' + round.questions.length;
    const wrong = round.wrongNumbers.slice().sort((a, b) => a - b);
    wrongListEl.textContent = wrong.length > 0 ? wrong.join(', ') : '없음';
    showScreen(resultScreen);
  }

  onClick(nextBtn, goNext);
  onClick(homeBtn, goHome);
  onClick(resetBtn, resetRecords);

  renderHome();
  showScreen(homeScreen);
})();
