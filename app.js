// 용어 퀴즈 v3 — 요청 1(처음 화면 · 설명 화면 · 문제 화면) + 요청 2(저장 · 날짜 · 복습 상자 · 하루 상한 · 확인용 날짜)
// 현황 화면은 요청 3이다 ([현황 보기]는 아직 눌리지 않는다).
// 화면에 넣는 글(데이터의 글, 내가 쓴 답, 주소의 글)은 모두 textContent·텍스트 노드로 넣는다. innerHTML을 쓰지 않는다.
(() => {
  'use strict';

  // ===== 데이터 (terms-data.js) =====

  const TERMS = window.TERMS.slice().sort((a, b) => a.id - b.id);
  const GROUP_NAMES = {};
  window.TERM_GROUPS.forEach((group) => {
    GROUP_NAMES[group.id] = group.name;
  });

  const SET_SIZE = 5;       // 한 세트에 꺼내는 새 용어 수
  const DAILY_NEW = 15;     // 하루에 배우는 새 용어 수 (하루 상한)
  const ANSWER_MAX = 500;   // 답 칸 글자 수. index.html의 maxlength와 같다
  const MASTERED_BOX = 4;   // 상자 4 = 익힘 (더 나오지 않는다)
  const REVIEW_GAP = { 1: 1, 2: 2, 3: 4 };   // 맞혀서 상자 1·2·3이 되면 며칠 뒤에 다시 나오는지

  // 설명 네 칸: [데이터 키, 칸 제목]. 빈 글(screen이 없는 용어)이면 칸 제목까지 뺀다
  const DETAIL_FIELDS = [
    ['meaning', '뜻'],
    ['scene', '내 프로젝트에서'],
    ['confusion', '헷갈리는 점'],
    ['screen', '화면에 보이는 모습'],
  ];

  // ===== 날짜 =====
  // 날짜는 'YYYY-MM-DD' 글자로 다룬다. 이 꼴은 글자 순서가 날짜 순서와 같아서 글자끼리 비교한다

  // Date → 'YYYY-MM-DD'. PC의 현지 날짜로 만든다
  // (toISOString은 세계 표준시라서 한국에서는 오전 9시 전에 어제 날짜가 나온다)
  function dateText(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
  }

  // 'YYYY-MM-DD'에 n일을 더한다. 글자를 new Date('2026-12-01')에 그대로 넣으면 세계 표준시로 읽히므로,
  // 연·월·일 숫자로 쪼개 현지 날짜로 만든다 (달·해가 넘어가는 것은 Date가 맞춰 준다)
  function addDays(text, n) {
    const [year, month, day] = text.split('-').map(Number);
    return dateText(new Date(year, month - 1, day + n));
  }

  // 'YYYY-MM-DD' 꼴이고 달력에 있는 날짜인지 (2026-12-1, 2026-02-30 같은 것은 아니다)
  function isDateText(text) {
    return /^\d{4}-\d{2}-\d{2}$/.test(text) && addDays(text, 0) === text;
  }

  // 주소 끝의 ?today=는 페이지를 열 때 한 번만 읽는다 (SPEC 「저장과 날짜」). 보는 곳은 ? 뒤부터 # 앞까지다
  //   ? 뒤가 비었으면(?가 없거나 ?만 있으면) → 진짜 기록: 오늘은 PC 날짜, 저장 키 term-quiz.v3
  //   ? 뒤가 꼭 today=YYYY-MM-DD 하나이면    → 확인용 기록: 오늘은 그 날짜, 저장 키 term-quiz.v3.test
  //   ? 뒤가 그 밖의 글이면                  → 멈춤: 저장을 읽지도 쓰지도 않는다
  //     (잘못 친 주소가 진짜 기록에 닿지 않게. today를 두 번 붙이거나 & 뒤에 다른 글이 섞여도 멈춘다)
  const QUERY = window.location.search;
  const QUERY_MATCH = /^\?today=(\d{4}-\d{2}-\d{2})$/.exec(QUERY);
  const TEST_DAY = QUERY_MATCH !== null && isDateText(QUERY_MATCH[1]) ? QUERY_MATCH[1] : '';
  const BAD_ADDRESS = QUERY !== '' && TEST_DAY === '';
  const STORE_KEY = TEST_DAY ? 'term-quiz.v3.test' : 'term-quiz.v3';

  // 멈춤 안내에 보여 줄 주소 글. 주소창처럼 한글(%EC%98… 같은 글자)만 풀고,
  // 그 밖의 %글자(띄어쓰기 %20, 일부러 바꿔 쓴 %32 등)와 잘못 쓰인 %는 받은 그대로 보인다
  function addressText() {
    return QUERY.replace(/(?:%[89A-Fa-f][0-9A-Fa-f])+/g, (part) => {
      try {
        return decodeURIComponent(part);
      } catch (error) {
        return part;
      }
    });
  }

  // 오늘 날짜. 확인용이면 그 날짜, 아니면 부를 때마다 PC 시계를 새로 읽는다 (밤 12시가 지나면 바로 다음 날이다)
  function today() {
    return TEST_DAY || dateText(new Date());
  }

  // ===== 화면 요소 =====

  const $ = (id) => document.getElementById(id);
  const homeScreen = $('home-screen');
  const learnScreen = $('learn-screen');
  const quizScreen = $('quiz-screen');
  const answerInput = $('answer-input');

  // ===== 지금 상태 =====

  let lesson = [];          // 지금 세트의 용어들 (설명 화면)
  let lessonIndex = 0;      // 지금 보는 용어가 세트의 몇 번째인지
  // 문제 화면의 카드 줄. 한 칸 = { card, term, judged }. judged는 이 줄에서 판정이 한 번 났는지다.
  // showCard가 queue[0]을 current로 꺼낸다. 판정이 나면 그 카드는 줄에서 빠진다("다시"면 줄 맨 뒤로 간다).
  // 그래서 판정 뒤의 지금 카드는 current로 본다
  let queue = [];
  let current = null;       // 지금 카드
  let currentAnswer = '';   // 지금 카드에 쓴 답 ([답 확인]을 누를 때 적어 둔다)
  let homeDay = '';         // 처음 화면에 지금 적혀 있는 날짜
  let halted = false;       // 멈췄는지 (멈추면 아무것도 저장하지 않는다)

  // ===== 저장 (localStorage, SPEC 「저장과 날짜」) =====
  // 값: { terms: { 용어 id: 배운 날짜 }, cards: { 카드 id: { box, due, day, answer, ok } } }
  // 기록은 메모리에 들고 있지 않는다. 쓸 때마다 저장소에서 새로 읽고, 한 건만 고쳐 바로 쓴다
  // (탭을 두 개 열어도 한쪽이 다른 쪽의 기록을 덮어쓰지 않게). v2의 키 term-quiz.exams는 건드리지 않는다

  const STORAGE_TROUBLE = '기록을 읽거나 저장하지 못했어. 저장된 기록은 그대로 뒀어.';
  const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

  // 기록의 모양이 SPEC 43줄과 같은지: terms의 값은 날짜이고,
  // 카드 기록은 { box: 0~4 정수, due: 날짜, day: 빈 글이나 날짜, answer: 글, ok: 참·거짓 }이다
  function isRecord(record) {
    if (!isObject(record) || !isObject(record.terms) || !isObject(record.cards)) return false;
    const isDay = (value) => typeof value === 'string' && isDateText(value);
    return Object.keys(record.terms).every((id) => isDay(record.terms[id]))
      && Object.keys(record.cards).every((id) => {
        const saved = record.cards[id];
        return isObject(saved)
          && Number.isInteger(saved.box) && saved.box >= 0 && saved.box <= MASTERED_BOX
          && isDay(saved.due)
          && (saved.day === '' || isDay(saved.day))
          && typeof saved.answer === 'string'
          && typeof saved.ok === 'boolean';
      });
  }

  // 저장된 기록을 읽는다. 아직 없으면 빈 기록, 읽지 못하면(저장소가 막힘, 글이 깨짐, 모양이 SPEC과 다름) null
  function loadRecord() {
    let record;
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw === null) return { terms: {}, cards: {} };
      record = JSON.parse(raw);
    } catch (error) {
      return null;
    }
    return isRecord(record) ? record : null;
  }

  // 기록을 새로 읽어 change(record)로 고치고 바로 쓴다. change가 false를 돌려주면 쓰지 않는다.
  // 읽거나 쓰지 못하면 기록을 건드리지 않고 멈춘다 (돌려주는 값 false)
  function updateRecord(change) {
    const record = loadRecord();
    if (record === null) {
      halt(STORAGE_TROUBLE);
      return false;
    }
    if (change(record) === false) return true;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(record));
    } catch (error) {
      halt(STORAGE_TROUBLE);
      return false;
    }
    return true;
  }

  // 카드 기록 하나 (없으면 null)
  function cardRecord(record, cardId) {
    return has(record.cards, cardId) ? record.cards[cardId] : null;
  }

  // 오늘 복습할 카드: 상자 0~3이고 due가 오늘이거나 지난 카드 (SPEC 「복습 상자 규칙」)
  function reviewEntries(record, day) {
    const entries = [];
    TERMS.forEach((term) => {
      term.cards.forEach((card) => {
        const saved = cardRecord(record, card.id);
        if (saved !== null && saved.box >= 0 && saved.box < MASTERED_BOX && saved.due <= day) {
          entries.push({ card: card, term: term, judged: false });
        }
      });
    });
    return entries;
  }

  // 아직 안 배운 용어들 (id 순서)
  function notLearnedTerms(record) {
    return TERMS.filter((term) => !has(record.terms, term.id));
  }

  // 그날 배운 용어 수
  function learnedOnCount(record, day) {
    return TERMS.filter((term) => record.terms[term.id] === day).length;
  }

  // 익힌 용어 수: 용어의 상태는 그 용어 카드 중 가장 낮은 상자라서, 카드가 모두 상자 4여야 익힘이다
  function masteredCount(record) {
    return TERMS.filter((term) => term.cards.every((card) => {
      const saved = cardRecord(record, card.id);
      return saved !== null && saved.box === MASTERED_BOX;
    })).length;
  }

  // ===== 멈춤 =====
  // 확인용 주소가 잘못됐거나 기록을 읽거나 저장하지 못하면, 맨 위에 안내를 띄우고 처음 화면의 버튼을 모두 막는다.
  // 그 뒤로는 아무것도 저장하지 않는다 (주소를 고치거나 새로고침하면 처음부터 다시 본다)
  function halt(message) {
    halted = true;
    queue = [];
    current = null;
    const alertLine = $('alert');
    alertLine.textContent = message;
    alertLine.hidden = false;
    $('home-date').hidden = true;
    $('home-counts').hidden = true;
    ['review-button', 'learn-button', 'status-button'].forEach((id) => {
      $(id).disabled = true;
    });
    showScreen(homeScreen);
  }

  // ===== 글 넣기 =====

  // 데이터의 글을 el에 넣는다. 백틱(`)으로 감싼 구간은 code 요소로 만든다.
  // 모두 텍스트 노드·textContent로 넣으므로 <b>, <script> 같은 글자도 글자 그대로 보인다
  function setDataText(el, text) {
    el.replaceChildren();
    const parts = text.split('`');
    parts.forEach((part, i) => {
      // 0부터 센 번호 i가 홀수인 조각(두 번째, 네 번째 …)이 백틱 안쪽이다.
      // 닫는 백틱이 없는 마지막 조각은 백틱째 글자로 둔다 (지금 데이터에는 없다)
      if (i % 2 === 1 && i < parts.length - 1) {
        const code = document.createElement('code');
        code.textContent = part;
        el.appendChild(code);
      } else {
        const plain = i % 2 === 1 ? '`' + part : part;
        if (plain !== '') el.appendChild(document.createTextNode(plain));
      }
    });
  }

  // 용어 이름. 알아보기만 용어는 이름 옆에 꼬리표를 붙인다
  function setTermName(el, term) {
    setDataText(el, term.term);
    if (term.watchOnly) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = '알아보기만';
      el.appendChild(tag);
    }
  }

  // 설명 네 칸: 뜻 / 내 프로젝트에서 / 헷갈리는 점 / 화면에 보이는 모습(있을 때만)
  function setDetails(box, term) {
    box.replaceChildren();
    DETAIL_FIELDS.forEach(([key, title]) => {
      if (term[key] === '') return;
      const field = document.createElement('section');
      field.className = 'detail';
      const heading = document.createElement('h3');
      heading.className = 'label';
      heading.textContent = title;
      const body = document.createElement('p');
      setDataText(body, term[key]);
      field.append(heading, body);
      box.appendChild(field);
    });
  }

  // ===== 버튼 누르기 =====

  // 버튼을 누르면 handler를 부른다. 더블클릭의 두 번째 클릭은 무시한다 (v2와 같다).
  // 클릭 한 번에 화면이 바로 바뀌어서, 두 번째 클릭이 그 자리에 새로 나타난 것을 눌러 버리기 때문이다.
  // event.detail은 연달아 누른 횟수다 (마우스 한 번 = 1, 더블클릭의 두 번째 = 2, 키보드 Enter·Space = 0)
  let pressedAt = -Infinity;   // 버튼이 마지막으로 눌린 때 (event.timeStamp, 밀리초)

  function onClick(button, handler) {
    button.addEventListener('click', (event) => {
      if (event.detail > 1) return;
      pressedAt = event.timeStamp;
      handler();
    });
  }

  // 버튼을 더블클릭했을 때의 두 번째 누름은, 그 자리에 무엇이 새로 나타났든 포커스와 글자 선택을 바꾸지 않는다.
  // 그러지 않으면 [다음 카드]를 더블클릭했을 때 두 번째 누름이 새 카드의 빈 곳을 눌러 답 칸의 커서가 빠진다
  document.addEventListener('mousedown', (event) => {
    if (event.detail > 1 && event.timeStamp - pressedAt < 1000) event.preventDefault();
  }, true);

  // 체크칸: 더블클릭의 두 번째 클릭으로는 체크가 바뀌지 않는다.
  // [답 확인]을 더블클릭하면 두 번째 클릭이 그 자리에 열린 체크칸을 누르기 때문이다
  function guardCheck(label) {
    label.addEventListener('click', (event) => {
      if (event.detail > 1) event.preventDefault();
    });
  }

  // ===== 화면 =====

  // 세 화면 중 하나만 보이게 하고 맨 위로 올린다
  function showScreen(screen) {
    [homeScreen, learnScreen, quizScreen].forEach((s) => {
      s.hidden = s !== screen;
    });
    window.scrollTo(0, 0);
  }

  // ===== 처음 화면 =====

  function showHome() {
    renderHome();
    showScreen(homeScreen);
  }

  // 처음 화면의 날짜·숫자·버튼을 저장된 기록으로 다시 계산한다
  function renderHome() {
    if (halted) return;
    const record = loadRecord();
    if (record === null) {
      halt(STORAGE_TROUBLE);
      return;
    }
    const day = today();
    const reviewCount = reviewEntries(record, day).length;
    const learnedToday = learnedOnCount(record, day);
    const notLearned = notLearnedTerms(record).length;

    homeDay = day;
    $('home-date').textContent = day;
    $('home-review').textContent = '오늘 복습할 카드 ' + reviewCount + '장';
    $('home-new').textContent =
      '아직 안 배운 용어 ' + notLearned + '개 (오늘 ' + learnedToday + '/' + DAILY_NEW + '개 배움)';
    $('home-mastered').textContent = '익힌 용어 ' + masteredCount(record) + '/' + TERMS.length;

    // 할 것이 없는 버튼은 눌리지 않는다
    $('review-button').disabled = reviewCount === 0;
    $('learn-button').disabled = notLearned === 0 || learnedToday >= DAILY_NEW;
    $('status-button').disabled = true;   // 현황 화면은 요청 3에서 만든다
  }

  // 처음 화면이 떠 있는 동안: 탭·창으로 돌아오면 기록을 다시 읽어 그리고(다른 탭에서 푼 것도 반영된다),
  // 1분마다 날짜가 바뀌었는지 보고 바뀌었으면 다시 그린다 (켜 둔 채 밤을 넘겨도 [복습 시작]이 막혀 있지 않게)
  function refreshHome() {
    if (!halted && !homeScreen.hidden) renderHome();
  }

  // ===== 설명 화면 =====

  // [새 용어 배우기]: 아직 안 배운 용어를 id 순서로 꺼낸다 (한 세트).
  // 한 세트는 5개까지이고, 하루 15개를 넘지 않게 오늘 남은 몫까지만 꺼낸다 (오늘 13개를 배웠으면 2개)
  function startLesson() {
    const record = loadRecord();
    if (record === null) {
      halt(STORAGE_TROUBLE);
      return;
    }
    const room = DAILY_NEW - learnedOnCount(record, today());
    lesson = notLearnedTerms(record).slice(0, Math.max(0, Math.min(SET_SIZE, room)));
    if (lesson.length === 0) {
      showHome();   // 그사이 다른 탭에서 배웠으면 처음 화면만 새로 그린다
      return;
    }
    lessonIndex = 0;
    showLessonTerm();
  }

  function showLessonTerm() {
    const term = lesson[lessonIndex];
    $('learn-progress').textContent = '새 용어 ' + (lessonIndex + 1) + '/' + lesson.length;
    $('learn-group').textContent = GROUP_NAMES[term.group];
    setTermName($('learn-term'), term);
    setDetails($('learn-details'), term);
    showScreen(learnScreen);
  }

  // [읽었어, 다음]: 이 용어를 오늘 배운 것으로 저장하고, 그 용어의 카드마다 { box: 0, due: 오늘 }을 만든다
  // (다른 탭에서 이미 배운 용어면 그 기록을 그대로 둔다).
  // 세트를 다 읽으면 그 용어들의 카드를 섞어서 바로 문제 화면으로 간다
  function finishLessonTerm() {
    const term = lesson[lessonIndex];
    const day = today();
    const saved = updateRecord((record) => {
      if (!has(record.terms, term.id)) record.terms[term.id] = day;
      term.cards.forEach((card) => {
        if (!has(record.cards, card.id)) {
          record.cards[card.id] = { box: 0, due: day, day: '', answer: '', ok: false };
        }
      });
    });
    if (!saved) return;
    lessonIndex += 1;
    if (lessonIndex < lesson.length) {
      showLessonTerm();
      return;
    }
    const entries = [];
    lesson.forEach((t) => {
      t.cards.forEach((card) => entries.push({ card: card, term: t, judged: false }));
    });
    startQueue(entries);
  }

  // ===== 복습 =====

  // [복습 시작]: 오늘 복습할 카드를 섞어서 낸다
  function startReview() {
    const record = loadRecord();
    if (record === null) {
      halt(STORAGE_TROUBLE);
      return;
    }
    const entries = reviewEntries(record, today());
    if (entries.length === 0) {
      showHome();   // 그사이 다른 탭에서 풀었으면 처음 화면만 새로 그린다
      return;
    }
    startQueue(entries);
  }

  // 그날의 첫 시도만 상자를 움직인다 (SPEC 「복습 상자 규칙」, 결정 5·6).
  // - 카드의 day가 오늘이 아니면 첫 시도다: day·answer·ok를 적고 상자를 옮긴다.
  //   맞음 → 상자 +1 (상자 1·2·3이 되면 1·2·4일 뒤에 다시 나오고, 상자 4는 익힘이라 due는 그대로 둔다)
  //   다시 → 상자 1, 내일 다시
  // - day가 오늘이면 다시 풀기라서 저장된 값을 바꾸지 않는다
  // - 같은 줄에서 이미 판정이 난 카드("다시"로 뒤에 보낸 카드)는 그사이 밤 12시가 지났어도 다시 풀기다
  //   (답을 본 직후에 다시 맞힌 것은 치지 않는다)
  // 돌려주는 값: 저장했거나 저장할 것이 없으면 true, 저장하지 못해 멈췄으면 false
  function recordFirstTry(entry, ok, answer) {
    if (entry.judged) return true;
    entry.judged = true;
    const day = today();
    return updateRecord((record) => {
      const saved = cardRecord(record, entry.card.id);
      if (saved === null || saved.day === day) return false;
      saved.day = day;
      saved.answer = answer;
      saved.ok = ok;
      if (ok) {
        saved.box = Math.min(saved.box + 1, MASTERED_BOX);
        if (saved.box < MASTERED_BOX) saved.due = addDays(day, REVIEW_GAP[saved.box]);
      } else {
        saved.box = 1;
        saved.due = addDays(day, 1);
      }
      return true;
    });
  }

  // ===== 문제 화면 (새 카드와 복습 카드가 같다) =====

  function startQueue(entries) {
    queue = shuffle(entries);
    showCard();
  }

  // 줄의 맨 앞 카드를 보여 준다. 장면만 보이고 용어 이름은 숨긴다
  function showCard() {
    current = queue[0];
    currentAnswer = '';
    showRemaining();
    setDataText($('quiz-prompt'), current.card.prompt);

    answerInput.value = '';
    $('answer-limit').hidden = true;
    $('check-button').disabled = true;
    $('answer-area').hidden = false;
    $('grading-area').hidden = true;
    $('result-area').hidden = true;

    showScreen(quizScreen);
    answerInput.focus({ preventScroll: true });
  }

  // 남은 카드 = 이 줄에서 아직 "맞음"이 안 된 카드 수 (지금 카드 포함)
  function showRemaining() {
    $('quiz-remaining').textContent = '남은 카드 ' + queue.length + '장';
  }

  // 답 칸: 비어 있으면(띄어쓰기·줄바꿈만 있어도) [답 확인]을 막고, 500자에 닿으면 안내 문구를 띄운다
  function onAnswerInput() {
    const value = answerInput.value;
    $('check-button').disabled = value.trim() === '';
    $('answer-limit').hidden = value.length < ANSWER_MAX;
  }

  // [답 확인]: 같은 화면에 채점 칸을 연다. 내가 쓴 답은 고칠 수 없는 글로 남긴다
  function checkAnswer() {
    const answer = answerInput.value;
    if (answer.trim() === '') return;
    currentAnswer = answer;
    $('answer-area').hidden = true;
    $('my-answer').textContent = answer;
    $('my-answer-box').hidden = false;
    $('grading-guide').hidden = false;
    fillUnits(true);
    fillWrong(true);
    $('grade-done').hidden = false;
    $('grading-area').hidden = false;
  }

  // [모르겠어]: 체크칸 없이 핵심 요소·흔한 오답·설명을 보여 주고 판정은 "다시". 쓰던 글은 버린다 (저장되는 답은 빈 글)
  function giveUp() {
    answerInput.value = '';
    $('answer-area').hidden = true;
    $('my-answer-box').hidden = true;
    $('grading-guide').hidden = true;
    fillUnits(false);
    fillWrong(false);
    $('grade-done').hidden = true;
    $('grading-area').hidden = false;
    showVerdict(false, '');
  }

  // 핵심 요소. withChecks면 요소마다 체크칸을 붙인다
  function fillUnits(withChecks) {
    const list = $('unit-list');
    list.replaceChildren();
    list.classList.toggle('plain', !withChecks);
    current.card.units.forEach((unit) => {
      const item = document.createElement('li');
      if (withChecks) {
        const label = document.createElement('label');
        label.className = 'check';
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.className = 'unit-check';
        const text = document.createElement('span');
        setDataText(text, unit);
        label.append(box, text);
        guardCheck(label);
        item.appendChild(label);
      } else {
        setDataText(item, unit);
      }
      list.appendChild(item);
    });
  }

  // 흔한 오답 (빈 글이면 칸째로 숨긴다). withCheck면 "내 답이 이쪽이었어" 체크칸을 보인다
  function fillWrong(withCheck) {
    const wrong = current.card.wrong;
    const check = $('wrong-check');
    check.checked = false;
    check.disabled = false;
    $('wrong-box').hidden = wrong === '';
    $('wrong-label').hidden = !withCheck;
    setDataText($('wrong-text'), wrong);
  }

  // [채점 끝]: 핵심 요소에 전부 체크했고 "내 답이 이쪽이었어"에 체크하지 않았으면 "맞음", 아니면 "다시".
  // 채점이 끝나면 체크칸은 바꿀 수 없다
  function finishGrading() {
    const unitChecks = Array.from($('unit-list').querySelectorAll('.unit-check'));
    const wrongCheck = $('wrong-check');
    const pickedWrong = current.card.wrong !== '' && wrongCheck.checked;
    const ok = unitChecks.every((box) => box.checked) && !pickedWrong;
    unitChecks.forEach((box) => {
      box.disabled = true;
    });
    wrongCheck.disabled = true;
    $('grade-done').hidden = true;
    showVerdict(ok, currentAnswer);
  }

  // 판정을 저장하고(그날의 첫 시도일 때만), 판정과 그 카드의 용어 이름·설명을 보여 준다.
  // "다시"면 카드를 줄 맨 뒤로 보낸다. 저장하지 못하면 멈춘다
  function showVerdict(ok, answer) {
    if (!recordFirstTry(current, ok, answer)) return;
    queue.shift();
    if (!ok) queue.push(current);
    showRemaining();

    const verdict = $('verdict');
    verdict.textContent = ok ? '맞음' : '다시';
    verdict.className = ok ? 'verdict ok' : 'verdict again';
    setTermName($('result-term'), current.term);
    setDetails($('result-details'), current.term);
    $('result-area').hidden = false;
  }

  // [다음 카드]: 줄이 비었으면 처음 화면으로 돌아간다
  function nextCard() {
    if (queue.length === 0) {
      showHome();
      return;
    }
    showCard();
  }

  // [처음으로]: 확인창에서 확인을 누르면 이 줄을 그만두고 처음 화면으로 간다.
  // 한 번도 안 푼 카드는 기록이 그대로라서, due가 오늘이거나 지났으면 "오늘 복습할 카드"로 남는다
  function quitQuiz() {
    if (!window.confirm('풀던 카드를 그만두고 처음 화면으로 갈까?')) return;
    queue = [];
    current = null;
    showHome();
  }

  // 카드 섞기 (피셔-예이츠: 모든 순서가 같은 확률로 나온다)
  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // ===== 시작 =====

  onClick($('review-button'), startReview);
  onClick($('learn-button'), startLesson);
  onClick($('learn-next'), finishLessonTerm);
  onClick($('check-button'), checkAnswer);
  onClick($('dunno-button'), giveUp);
  onClick($('grade-done'), finishGrading);
  onClick($('next-card'), nextCard);
  onClick($('quiz-home'), quitQuiz);
  guardCheck($('wrong-label'));
  answerInput.addEventListener('input', onAnswerInput);

  window.addEventListener('focus', refreshHome);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshHome();
  });
  window.setInterval(() => {
    if (homeDay !== today()) refreshHome();
  }, 60 * 1000);

  // 확인용 날짜는 모든 화면 맨 위에 띄운다
  if (TEST_DAY) {
    $('test-date').textContent = '확인용 날짜: ' + TEST_DAY;
    $('test-date').hidden = false;
  }

  if (BAD_ADDRESS) {
    halt('확인용 주소가 잘못됐어: ' + addressText() + ' — 끝을 ?today=2026-12-01처럼 써 줘');
  } else {
    showHome();
  }
})();
