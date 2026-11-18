// 용어 퀴즈 v3 — 요청 1: 처음 화면 · 설명 화면 · 문제 화면 (SPEC 「만드는 순서」 1)
// 저장은 아직 없다. 배운 용어는 새로고침 전까지만 기억한다 (저장·확인용 날짜·상자 규칙·하루 상한은 요청 2).
// 화면에 넣는 글(데이터의 글, 내가 쓴 답)은 모두 textContent·텍스트 노드로 넣는다. innerHTML을 쓰지 않는다.
(() => {
  'use strict';

  // ===== 데이터 (terms-data.js) =====

  const TERMS = window.TERMS.slice().sort((a, b) => a.id - b.id);
  const GROUP_NAMES = {};
  window.TERM_GROUPS.forEach((group) => {
    GROUP_NAMES[group.id] = group.name;
  });

  const SET_SIZE = 5;     // 한 세트에 꺼내는 새 용어 수
  const DAILY_NEW = 15;   // 하루에 배우는 새 용어 수. 요청 1에서는 처음 화면 글에만 쓴다 (상한은 요청 2)
  const ANSWER_MAX = 500; // 답 칸 글자 수. index.html의 maxlength와 같다

  // 설명 네 칸: [데이터 키, 칸 제목]. 빈 글(screen이 없는 용어)이면 칸 제목까지 뺀다
  const DETAIL_FIELDS = [
    ['meaning', '뜻'],
    ['scene', '내 프로젝트에서'],
    ['confusion', '헷갈리는 점'],
    ['screen', '화면에 보이는 모습'],
  ];

  // ===== 기억 (새로고침하면 사라진다) =====

  // 용어 id → 배운 날짜. 요청 2에서 저장 JSON의 terms가 된다.
  // 카드 기록({ box: 0, due: 오늘 })은 저장과 함께 요청 2에서 만든다
  const learnedOn = {};

  let lesson = [];       // 지금 세트의 용어들 (설명 화면)
  let lessonIndex = 0;   // 지금 보는 용어가 세트의 몇 번째인지
  // 문제 화면의 카드 줄. showCard가 queue[0]을 current로 꺼낸다.
  // 판정이 나면 그 카드는 줄에서 빠진다("다시"면 줄 맨 뒤로 간다). 그래서 판정 뒤의 지금 카드는 current로 본다
  let queue = [];
  let current = null;    // 지금 카드 { card, term }

  // ===== 화면 요소 =====

  const $ = (id) => document.getElementById(id);
  const homeScreen = $('home-screen');
  const learnScreen = $('learn-screen');
  const quizScreen = $('quiz-screen');
  const answerInput = $('answer-input');

  // ===== 글 넣기 =====

  // 오늘 날짜 'YYYY-MM-DD'. PC의 현지 날짜로 만든다
  // (toISOString은 세계 표준시라서 한국에서는 오전 9시 전에 어제 날짜가 나온다)
  function todayText() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return now.getFullYear() + '-' + month + '-' + day;
  }

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
    const today = todayText();
    const learnedIds = Object.keys(learnedOn);
    const learnedToday = learnedIds.filter((id) => learnedOn[id] === today).length;
    const notLearned = TERMS.length - learnedIds.length;

    $('home-date').textContent = today;
    // 요청 1에는 복습 상자가 없어서 복습할 카드와 익힌 용어는 늘 0이다 (요청 2에서 센다)
    $('home-review').textContent = '오늘 복습할 카드 0장';
    $('home-new').textContent =
      '아직 안 배운 용어 ' + notLearned + '개 (오늘 ' + learnedToday + '/' + DAILY_NEW + '개 배움)';
    $('home-mastered').textContent = '익힌 용어 0/' + TERMS.length;

    $('review-button').disabled = true;   // 요청 2에서 만든다
    $('status-button').disabled = true;   // 요청 3에서 만든다
    $('learn-button').disabled = notLearned === 0;
    showScreen(homeScreen);
  }

  // ===== 설명 화면 =====

  // [새 용어 배우기]: 아직 안 배운 용어를 id 순서로 5개까지 꺼낸다 (한 세트)
  function startLesson() {
    lesson = TERMS.filter((term) => !(term.id in learnedOn)).slice(0, SET_SIZE);
    if (lesson.length === 0) return;
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

  // [읽었어, 다음]: 이 용어를 오늘 배운 것으로 기억하고 다음 용어로.
  // 세트를 다 읽으면 그 용어들의 카드를 섞어서 바로 문제 화면으로 간다
  function finishLessonTerm() {
    const term = lesson[lessonIndex];
    learnedOn[term.id] = todayText();
    lessonIndex += 1;
    if (lessonIndex < lesson.length) {
      showLessonTerm();
      return;
    }
    const entries = [];
    lesson.forEach((t) => {
      t.cards.forEach((card) => entries.push({ card: card, term: t }));
    });
    queue = shuffle(entries);
    showCard();
  }

  // ===== 문제 화면 =====

  // 줄의 맨 앞 카드를 보여 준다. 장면만 보이고 용어 이름은 숨긴다
  function showCard() {
    current = queue[0];
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
    $('answer-area').hidden = true;
    $('my-answer').textContent = answer;
    $('my-answer-box').hidden = false;
    $('grading-guide').hidden = false;
    fillUnits(true);
    fillWrong(true);
    $('grade-done').hidden = false;
    $('grading-area').hidden = false;
  }

  // [모르겠어]: 체크칸 없이 핵심 요소·흔한 오답·설명을 보여 주고 판정은 "다시". 쓰던 글은 버린다
  function giveUp() {
    answerInput.value = '';
    $('answer-area').hidden = true;
    $('my-answer-box').hidden = true;
    $('grading-guide').hidden = true;
    fillUnits(false);
    fillWrong(false);
    $('grade-done').hidden = true;
    $('grading-area').hidden = false;
    showVerdict(false);
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
    showVerdict(ok);
  }

  // 판정과 그 카드의 용어 이름·설명을 보여 준다. "다시"면 카드를 줄 맨 뒤로 보낸다
  function showVerdict(ok) {
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
  // 그만둔 카드는 요청 1에서는 다시 나오지 않는다 (요청 2부터 복습으로 나온다)
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

  onClick($('learn-button'), startLesson);
  onClick($('learn-next'), finishLessonTerm);
  onClick($('check-button'), checkAnswer);
  onClick($('dunno-button'), giveUp);
  onClick($('grade-done'), finishGrading);
  onClick($('next-card'), nextCard);
  onClick($('quiz-home'), quitQuiz);
  guardCheck($('wrong-label'));
  answerInput.addEventListener('input', onAnswerInput);

  showHome();
})();
