// 용어 퀴즈 v2 — 기능 1(공부: 67개 전체, 틀리면 맞출 때까지 반복) + 기능 2(시험) + 기능 3(문제 화면 이동)
(() => {
  'use strict';

  // ===== 용어 데이터 =====
  // terms.md의 표를 글자 그대로 옮겼다. 원본은 terms.md이고, 여기 글자는 terms.md와 한 글자도 다르지 않게 둔다.
  // 코드 안의 \\ 는 화면에서 \ 하나로 보인다 (JS 문자열 안에 \ 를 적는 방법).

  // 용어 67개 (terms.md "용어 67개" 표). 한 줄 = 용어 하나. 묶음 번호는 오답 보기를 뽑을 때만 쓴다
  // 알아보기만: true면 문제 화면에서 용어 옆에 "(알아보기만)"을 붙인다
  const TERMS = [
    { 번호: 1, 묶음: 1, 용어: '터미널 (PowerShell)', 뜻: '마우스 대신 글자로 컴퓨터에 명령을 보내고, 결과도 글자로 돌려받는 창이다. git이나 Claude Code처럼 아이콘이 없는 도구는 이 창에서만 돌아간다.', 비유: '0단계', 알아보기만: false },
    { 번호: 2, 묶음: 1, 용어: '명령줄 맨 앞 `PS C:\\...>`', 뜻: '지금 내가 어느 폴더에 서 있는지 알려 주는 표시다. 명령은 여기 적힌 폴더 안에서 실행되므로, 치기 전에 먼저 읽는다.', 비유: '위치는 여기서 본다', 알아보기만: false },
    { 번호: 3, 묶음: 1, 용어: '`cd` / `dir` / `mkdir`', 뜻: '순서대로, 다른 폴더로 옮겨 가는 명령, 지금 폴더 안에 무엇이 있는지 보는 명령, 지금 폴더 안에 새 폴더를 만드는 명령이다.', 비유: 'cd는 나를 옮기고 dir은 방 안을 보여 준다', 알아보기만: false },
    { 번호: 4, 묶음: 1, 용어: '경로 (`C:\\Users\\...`)', 뜻: '파일이나 폴더가 어디에 있는지를 드라이브부터 차례로 적은 주소다. 집 주소처럼, 이름이 같은 파일도 이것으로 구별한다.', 비유: '—', 알아보기만: false },
    { 번호: 5, 묶음: 1, 용어: '확장자 (`.html` `.md` `.js`)', 뜻: '파일 이름 끝에 점을 찍고 붙이는 글자로, 그 파일이 어떤 종류인지 컴퓨터와 사람에게 알려 준다. 소문자로 쓰는 것이 약속이다.', 비유: 'README.MD 사건 (11-04)', 알아보기만: false },
    { 번호: 6, 묶음: 1, 용어: '`Rename-Item`', 뜻: '파일이나 폴더의 이름을 바꾸는 PowerShell 명령이다. 탐색기에서 클릭을 여러 번 할 일을 한 줄로 끝낸다.', 비유: '탐색기 대신 한 줄', 알아보기만: false },
    { 번호: 7, 묶음: 1, 용어: 'VS Code', 뜻: '코드를 쓰고 고치는 편집기다. 왼쪽 세로 줄의 아이콘은 창을 바꾸는 스위치로, 종이 두 장은 파일 탐색기, 돋보기는 검색이다.', 비유: '—', 알아보기만: false },
    { 번호: 8, 묶음: 1, 용어: 'Node.js / npm', 뜻: 'JavaScript를 브라우저 밖, 즉 내 컴퓨터에서 바로 실행하게 해 주는 프로그램과, 거기에 남이 만든 패키지를 설치하는 명령이다.', 비유: '설치만 했고 아직 안 씀', 알아보기만: true },
    { 번호: 9, 묶음: 1, 용어: 'LF / CRLF', 뜻: '줄바꿈을 나타내는, 눈에 보이지 않는 기호의 두 가지 방식이다. 앞은 Linux·Mac식, 뒤는 Windows식이며, 둘이 섞였다는 경고는 무시해도 된다.', 비유: '`.claude/launch.json` 경고', 알아보기만: false },
    { 번호: 10, 묶음: 2, 용어: 'HTML / CSS / JavaScript', 뜻: '웹 페이지를 만드는 세 가지 재료다. 순서대로 화면에 무엇이 있는지(구조), 어떻게 보이는지(모양), 눌렀을 때 무슨 일이 일어나는지(동작)를 맡는다.', 비유: 'index.html / style.css / app.js', 알아보기만: false },
    { 번호: 11, 묶음: 2, 용어: '네 덩어리', 뜻: '파일 하나로 된 웹 페이지를 읽을 때 설정 → 모양 → 화면 → 동작 순서로 나누어 보는 방법이다. 각 부분의 경계는 `<style>` `<body>` `<script>` 태그다.', 비유: '2단계 궁합 보기', 알아보기만: false },
    { 번호: 12, 묶음: 2, 용어: '함수', 뜻: '이름을 붙여 둔 동작 한 묶음이다. 한 번 만들어 두면 "버튼을 눌렀을 때"처럼 필요한 곳에서 이름만 불러 다시 쓸 수 있다.', 비유: 'app.js의 `function ...`', 알아보기만: false },
    { 번호: 13, 묶음: 2, 용어: '코드의 뼈대', 뜻: '앱 하나가 돌아가는 기본 순서다. 입력을 검사하고, 통과하면 계산하고, 결과를 화면에 보여 준다. 1단계 앱은 모두 이 세 단계로 되어 있다.', 비유: '모든 1단계 앱', 알아보기만: false },
    { 번호: 14, 묶음: 2, 용어: '입력 검증', 뜻: '사용자가 적은 값을 저장하기 전에 빈칸은 아닌지, 너무 길지 않은지, 숫자가 범위 안인지 걸러 내는 일이다. 걸러지면 저장하지 않고 이유를 보여 준다.', 비유: '「05」 A5. app.js의 `readForm`', 알아보기만: false },
    { 번호: 15, 묶음: 2, 용어: 'textContent', 뜻: '사용자가 적은 글을 화면에 넣을 때, 코드가 아니라 순수한 글자로만 다루게 하는 방법이다. 글 속에 코드가 숨어 있어도 실행되지 않아 안전하다.', 비유: '「05」 A5. app.js의 `titleEl.textContent`', 알아보기만: false },
    { 번호: 16, 묶음: 2, 용어: '확인창 (confirm)', 뜻: '삭제처럼 되돌리기 어려운 일을 하기 직전에 "정말 하시겠습니까?"라고 한 번 더 묻는 작은 창이다. 취소를 누르면 아무 일도 일어나지 않는다.', 비유: '「05」 B3. app.js의 `window.confirm`', 알아보기만: false },
    { 번호: 17, 묶음: 2, 용어: 'localStorage', 뜻: '브라우저 안에 있는 작은 저장 공간이다. 서버 없이도 데이터가 남지만, 기기와 브라우저마다 따로 있어서 다른 기기에서는 보이지 않는다.', 비유: '홀만 있는 앱의 서랍', 알아보기만: false },
    { 번호: 18, 묶음: 2, 용어: '저장 키 (`reading-log.records`)', 뜻: '브라우저 저장 공간의 칸마다 붙이는 이름이다. 같은 브라우저를 여러 앱이 함께 쓰므로, 앱마다 다른 이름을 붙여 서로의 데이터가 섞이지 않게 한다.', 비유: 'CLAUDE.md 규칙. app.js의 `STORAGE_KEY`', 알아보기만: false },
    { 번호: 19, 묶음: 2, 용어: '라벨 / 안내 글자 (placeholder)', 뜻: '입력 칸 위에 붙는 이름과, 칸 안에 흐리게 보이다가 글을 적으면 사라지는 예시 글이다. 무엇을 어떤 형식으로 적어야 하는지 알려 준다.', 비유: '쪽수 칸 피드백 (11-04)', 알아보기만: false },
    { 번호: 20, 묶음: 2, 용어: '정적 파일', 뜻: '서버가 받은 그대로 보내 주기만 하면 되는 파일이다. 요청마다 새로 계산하거나 만들 것이 없어서, 올려 두기만 하면 끝이다.', 비유: '빌드 없음의 이유', 알아보기만: false },
    { 번호: 21, 묶음: 2, 용어: '빌드', 뜻: '사람이 쓰기 편한 형태로 작성한 코드를 브라우저가 읽을 수 있는 HTML·CSS·JS로 바꾸는 변환 작업이다. 우리 앱은 처음부터 그 형태로 쓰므로 필요 없다.', 비유: '우리는 없음', 알아보기만: true },
    { 번호: 22, 묶음: 2, 용어: '프레임워크 (React 등)', 뜻: '앱을 빠르게 만들도록 틀을 잡아 주는 제작 도구다. 대신 결과물을 브라우저가 읽는 형태로 변환하는 과정이 꼭 따라붙는다.', 비유: 'Vercel의 Framework Preset', 알아보기만: true },
    { 번호: 23, 묶음: 3, 용어: '프론트엔드 / 백엔드 / DB', 뜻: '앱을 세 역할로 나눈 이름이다. 순서대로 사용자가 보고 누르는 화면, 그 뒤에서 요청을 처리하는 부분, 데이터를 쌓아 두는 곳이다.', 비유: '홀 / 주방 / 창고', 알아보기만: false },
    { 번호: 24, 묶음: 3, 용어: '서버', 뜻: '24시간 꺼지지 않고 요청을 기다리는, 인터넷 건너편의 남의 컴퓨터다. 내 기기 안에서 끝나는 일과 인터넷을 건너야 하는 일의 경계가 여기다.', 비유: '카톡 비교', 알아보기만: false },
    { 번호: 25, 묶음: 3, 용어: 'API', 뜻: '프로그램끼리 데이터를 주고받을 때 지키는 약속이다. 무엇을 어떤 형식으로 보내면 무엇이 돌아오는지가 미리 정해져 있다.', 비유: '주문서 (4단계)', 알아보기만: true },
    { 번호: 26, 묶음: 3, 용어: '패키지 (라이브러리)', 뜻: '남이 미리 만들어 둔 기능 묶음이다. 직접 만들지 않고 가져다 쓰며, 설치 명령 한 줄로 내 프로젝트에 들어온다.', 비유: '시판 소스', 알아보기만: true },
    { 번호: 27, 묶음: 3, 용어: '환경 변수 (.env)', 뜻: '비밀번호나 열쇠 같은 비밀값을 코드 파일 바깥에 따로 적어 두는 곳이다. 코드는 그 값을 이름으로만 부르고, 실제 값은 이 파일에만 있다.', 비유: '사장 수첩 (4단계)', 알아보기만: true },
    { 번호: 28, 묶음: 3, 용어: '비밀키 / API 키', 뜻: '외부 서비스가 "이 요청은 네가 보낸 것"이라고 알아보게 하는 긴 글자 열쇠다. 코드나 채팅에 붙여 넣으면 남이 내 이름으로 쓸 수 있다.', 비유: '「05」 A1', 알아보기만: true },
    { 번호: 29, 묶음: 3, 용어: '배포 ≠ 동기화', 뜻: '앱에 인터넷 주소를 만들어 주는 일과, 여러 기기에 흩어진 데이터를 하나로 합치는 일은 서로 다른 일이다. 앞은 3단계, 뒤는 4단계에서 한다.', 비유: '—', 알아보기만: false },
    { 번호: 30, 묶음: 4, 용어: 'git', 뜻: '폴더 안 파일들이 언제 어떻게 바뀌었는지 역사를 기록해 두는 프로그램이다. 덕분에 예전 상태로 되돌리거나 무엇이 달라졌는지 비교할 수 있다.', 비유: '장부 / 게임 세이브', 알아보기만: false },
    { 번호: 31, 묶음: 4, 용어: '저장소 (repository)', 뜻: '한 프로젝트의 변경 기록 전체를 가리키는 말이다. 내 PC에 하나 있고, GitHub에 올리면 거기에도 똑같은 것이 하나 더 생긴다.', 비유: '창고', 알아보기만: false },
    { 번호: 32, 묶음: 4, 용어: 'GitHub', 뜻: '변경 기록을 인터넷에 올려 두는 서비스다. 공개(Public)로 두면 누구나 보고, 비공개(Private)로 두면 나만 본다.', 비유: '클라우드', 알아보기만: false },
    { 번호: 33, 묶음: 4, 용어: '`git init`', 뜻: '폴더 하나에 변경 기록을 시작하라고 알리는 명령이다. 프로젝트 폴더마다 맨 처음 한 번만 친다.', 비유: '장부 들이기', 알아보기만: false },
    { 번호: 34, 묶음: 4, 용어: '`git add`', 뜻: '다음 저장점에 넣을 파일을 고르는 명령이다. `.`을 붙이면 바뀐 것 전부, 파일 이름을 적으면 그 파일만 고른다.', 비유: '가방에 담기 / 사진 찍기', 알아보기만: false },
    { 번호: 35, 묶음: 4, 용어: '스테이징 영역', 뜻: '다음 저장점에 넣으려고 골라 둔 파일들이 기다리는 자리다. 여기 담긴 파일만 저장점에 들어가고, 담지 않은 파일은 들어가지 않는다.', 비유: '가방', 알아보기만: false },
    { 번호: 36, 묶음: 4, 용어: '`git restore --staged`', 뜻: '골라 둔 파일을 다음 저장점 후보에서 다시 빼는 명령이다. 파일 자체는 그대로 남고, 후보 목록에서만 빠진다.', 비유: '가방에서 꺼내기', 알아보기만: false },
    { 번호: 37, 묶음: 4, 용어: '`git commit -m "메시지"`', 뜻: '후보로 담아 둔 파일들을 이름을 붙여 저장점 하나로 확정하는 명령이다. 이 저장점은 아직 내 PC에만 있다.', 비유: '세이브', 알아보기만: false },
    { 번호: 38, 묶음: 4, 용어: '커밋 메시지 / 커밋 번호', 뜻: '저장점에 붙이는 설명 글과, 저장점마다 자동으로 매겨지는 고유 번호다. 번호는 길지만 보통 앞 7자리만 쓴다.', 비유: '—', 알아보기만: false },
    { 번호: 39, 묶음: 4, 용어: '`git push`', 뜻: '내 PC에 쌓인 저장점들을 GitHub로 복사해 올리는 명령이다. 이것을 치기 전까지 GitHub는 내 PC에서 일어난 변경을 모른다.', 비유: '창고로 복사 / 클라우드 업로드', 알아보기만: false },
    { 번호: 40, 묶음: 4, 용어: '`git status`', 뜻: '지금 상태를 보고하는 명령이다. 어느 줄기에 있는지, GitHub와 같은지, 바뀌거나 담긴 파일이 있는지 알려 준다. 괄호 안 줄은 다음에 칠 명령의 안내다.', 비유: '가방 들여다보기', 알아보기만: false },
    { 번호: 41, 묶음: 4, 용어: '`git log`', 뜻: '지금까지 만든 저장점들을 최근 것부터 차례로 보여 주는 명령이다. 각 줄에 번호, 날짜, 설명 글이 보인다.', 비유: '세이브 목록', 알아보기만: false },
    { 번호: 42, 묶음: 4, 용어: '`git restore .`', 뜻: '바뀐 파일들을 마지막 저장점 상태로 되돌리는 명령이다. 되돌린 변경은 다시 가져올 수 없으니, 치기 전에 상태부터 확인한다.', 비유: '세이브 불러오기', 알아보기만: false },
    { 번호: 43, 묶음: 4, 용어: 'Untracked / modified / new file', 뜻: '상태 보고에 나오는 세 단어다. 순서대로 한 번도 기록된 적 없는 파일, 기록된 뒤 바뀐 파일, 이번에 새로 후보에 담긴 파일이다.', 비유: 'status의 세 단어', 알아보기만: false },
    { 번호: 44, 묶음: 4, 용어: '브랜치 (main, master)', 뜻: '변경 기록이 이어지는 줄기다. 여러 갈래로 나눌 수 있지만 지금은 하나뿐이고, 기본 줄기의 이름이 도구마다 달라 맞춰 주는 명령이 있다.', 비유: '아직 하나만', 알아보기만: false },
    { 번호: 45, 묶음: 4, 용어: 'remote / origin', 뜻: '내 PC의 기록이 복사될 GitHub 창고의 주소와, 그 주소에 붙인 짧은 별명이다. 별명을 붙여 두면 긴 주소를 매번 치지 않아도 된다.', 비유: '창고 주소 적기', 알아보기만: false },
    { 번호: 46, 묶음: 4, 용어: '`git push -u origin main`', 뜻: '처음 올릴 때 한 번 치는 명령이다. 기록을 GitHub로 복사하면서, 다음부터는 짧은 명령만으로 같은 곳에 올라가도록 연결해 둔다.', 비유: '—', 알아보기만: false },
    { 번호: 47, 묶음: 4, 용어: '`HEAD -> main, origin/main`', 뜻: '저장점 목록의 맨 윗줄에 이 표시가 함께 붙어 있으면, 내 PC와 GitHub가 같은 저장점까지 와 있다는 뜻이다.', 비유: '—', 알아보기만: false },
    { 번호: 48, 묶음: 4, 용어: '`error:` / `fatal:` vs `warning:`', 뜻: '명령 결과에 붙는 세 가지 머리말이다. 앞의 둘은 명령이 실패했다는 뜻이고, 마지막은 실패가 아니라 참고하라는 안내여서 무시해도 된다.', 비유: '—', 알아보기만: false },
    { 번호: 49, 묶음: 4, 용어: '`7 insertions(+), 7 deletions(-)`', 뜻: '저장점을 만든 뒤 나오는 보고로, 이번 저장점에서 더해진 줄 수와 지워진 줄 수다. 영수증처럼 얼마나 바뀌었는지 보여 준다.', 비유: '영수증', 알아보기만: false },
    { 번호: 50, 묶음: 4, 용어: 'README.md', 뜻: '프로젝트의 표지 역할을 하는 설명 파일이다. GitHub는 이 파일이 있으면 파일 목록 아래에 내용을 그대로 펼쳐 보여 준다.', 비유: '6단계 조건', 알아보기만: false },
    { 번호: 51, 묶음: 4, 용어: '.gitignore', 뜻: 'git이 기록하지 않고 못 본 척할 파일 이름을 적어 두는 목록이다. 비밀값이 든 .env 파일을 여기 넣어 실수로 올라가지 않게 한다.', 비유: '4단계', 알아보기만: true },
    { 번호: 52, 묶음: 5, 용어: 'Claude Code', 뜻: '터미널에서 말로 시키면 내 폴더의 파일을 직접 읽고 쓰는 AI 도구다. 3단계부터 3주 동안 이 도구 하나로 고정한다.', 비유: '3단계', 알아보기만: false },
    { 번호: 53, 묶음: 5, 용어: 'CLAUDE.md', 뜻: 'AI 코딩 도구가 작업을 시작할 때마다 먼저 읽는 지침 파일이다. 기술 스택, 작업 규칙, 하지 말 것을 적어 두면 매번 다시 말하지 않아도 된다.', 비유: '「04」 12번', 알아보기만: false },
    { 번호: 54, 묶음: 5, 용어: 'SPEC.md / 스펙', 뜻: '만들 앱을 글로 정해 둔 문서다. 한 줄 설명, 사용자와 상황, 기능 3개, 하지 않을 것, 기술 제약, 완료 조건으로 되어 있다.', 비유: '「02」', 알아보기만: false },
    { 번호: 55, 묶음: 5, 용어: '결정 사항', 뜻: 'AI가 묻지 않고 알아서 정해 버린 것들을 따로 뽑아, 내가 하나씩 OK 하는 목록이다. 스펙 문서에 적어 두어야 도구에 전달된다.', 비유: '수정 1회의 원인', 알아보기만: false },
    { 번호: 56, 묶음: 5, 용어: '완료 조건', 뜻: '"이렇게 해 보면 → 이것이 보여야 한다"로 바꿔 쓸 수 있는 문장이다. 이 문장이 모두 맞으면 그 기능은 끝난 것이다.', 비유: '—', 알아보기만: false },
    { 번호: 57, 묶음: 5, 용어: '계획 → OK → 코드', 뜻: '구현을 시킬 때 지키는 순서다. 무엇을 어떻게 만들지 먼저 받아 파일 수·범위·스펙 세부·화면을 검사하고, 내가 승인한 뒤에야 작성하게 한다.', 비유: '—', 알아보기만: false },
    { 번호: 58, 묶음: 5, 용어: '수정 요청', 뜻: '해결책을 지시하는 대신 "지금은 이런데 → 이렇게 되면 좋겠다 + 이것만"으로 말하는 방식이다. 범위를 좁혀야 엉뚱한 곳을 건드리지 않는다.', 비유: '—', 알아보기만: false },
    { 번호: 59, 묶음: 5, 용어: '시안', 뜻: '코드를 쓰기 전에, 화면에 무엇이 어디에 놓일지를 글로 먼저 그려 보는 것이다. 1단계에서 앱마다 먼저 만들었다.', 비유: '1단계', 알아보기만: false },
    { 번호: 60, 묶음: 5, 용어: '피드백 분류', 뜻: '다른 사람의 의견을 받으면 고칠 것, 다음 버전에 넣을 것, 하지 않을 것 세 칸으로 나누는 일이다. 전부 고치려 들지 않기 위해서다.', 비유: '친구 피드백 (11-04)', 알아보기만: false },
    { 번호: 61, 묶음: 5, 용어: '`.claude/launch.json`', 뜻: 'AI 코딩 도구가 앱 미리보기를 어떻게 켤지 적어 둔 설정 파일이다. 도구가 알아서 만들어 두며, 앱 자체와는 상관없다.', 비유: '바닥에 남은 것', 알아보기만: false },
    { 번호: 62, 묶음: 6, 용어: '배포', 뜻: '내 PC에만 있던 파일을 서버에 올려서, 누구나 브라우저로 들어올 수 있는 인터넷 주소를 받는 일이다. 이 일이 끝나야 휴대폰에서도 열린다.', 비유: '3단계', 알아보기만: false },
    { 번호: 63, 묶음: 6, 용어: 'Vercel / Netlify', 뜻: 'GitHub 저장소를 연결해 주면 파일을 서버에 올리고 인터넷 주소까지 만들어 주는 서비스다. 정적 파일이면 설정 몇 칸으로 끝난다.', 비유: '—', 알아보기만: false },
    { 번호: 64, 묶음: 6, 용어: 'URL / 도메인', 뜻: '브라우저 주소창에 치는 인터넷 주소 전체와, 그 주소 가운데 어느 서비스인지를 나타내는 이름 부분이다. 사람이 외우는 쪽은 뒤다.', 비유: '`reading-log-plum.vercel.app`', 알아보기만: false },
    { 번호: 65, 묶음: 6, 용어: 'Framework Preset = Other, Build Command 빈칸, Output Directory', 뜻: '배포 서비스에 "이 프로젝트는 변환 과정이 없으니 파일을 그대로 올려라"라고 알려 주는 설정 세 칸이다.', 비유: '—', 알아보기만: false },
    { 번호: 66, 묶음: 6, 용어: '자동 재배포', 뜻: 'GitHub에 새 저장점을 올리면 배포 서비스가 알아채고 새 파일로 다시 올려 주는 기능이다. 그래서 올리는 일이 곧 배포가 된다.', 비유: 'push = 배포', 알아보기만: false },
    { 번호: 67, 묶음: 6, 용어: '환경 변수 설정 (배포 서비스의)', 뜻: '비밀값을 코드가 아니라 서버 쪽에 따로 넣어 두는, 배포 서비스의 설정 칸이다. 지금 앱은 비밀값이 없어 비워 둔다.', 비유: '4단계', 알아보기만: true },
  ];
  // ===== 용어 데이터 끝 =====

  // ===== 화면 요소 =====
  const homeScreen = document.getElementById('home-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const resultScreen = document.getElementById('result-screen');
  const studyResultScreen = document.getElementById('study-result-screen');
  const progressEl = document.getElementById('progress');
  const prevBtn = document.getElementById('prev-button');
  const quitBtn = document.getElementById('quit-button');
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
  const studyBtn = document.getElementById('study-button');
  const examBtn = document.getElementById('exam-button');
  const resetBtn = document.getElementById('reset-button');
  const studySolvedEl = document.getElementById('study-solved');
  const studyFirstEl = document.getElementById('study-first');
  const studyRepeatNoneEl = document.getElementById('study-repeat-none');
  const studyRepeatListEl = document.getElementById('study-repeat-list');
  const studyHomeBtn = document.getElementById('study-home-button');
  const passResultEl = document.getElementById('pass-result');
  const examSaveErrorEl = document.getElementById('exam-save-error');
  const examListEl = document.getElementById('exam-list');
  const examEmptyEl = document.getElementById('exam-empty');

  // 지금 풀고 있는 한 판. "공부 시작"이나 "시험"을 누를 때마다 새로 만든다 (한 판은 저장하지 않는다)
  // 시험: { questions: 섞은 67개, index: 지금 몇 번째 문제(0부터), correct: 맞은 수,
  //        wrongNumbers: 틀린 용어 번호들, answered: 지금 문제에 답했나, isExam: true,
  //        examSaved: 시험 기록 저장에 성공했나 }
  // 공부: { queue: 줄(차례를 기다리는 용어들, 맨 앞이 지금 문제), solved: 푼 문제 수(반복 포함),
  //        counts: 용어 번호별로 나온 횟수, answered, isExam: false, correct·wrongNumbers(채점 코드가 같이 씀) }
  // 둘 다: slots: 지나간 문제 목록(나온 순서대로 { term, choices: 보기 4개 그 순서, picked: 고른 용어 번호 또는 null },
  //        맨 끝 칸이 현재 문제), view: 화면에 보이는 칸 번호 (결정 사항 8). 메모리에만 두고 저장하지 않는다
  let round = null;

  // ===== 시험 기록 저장 (localStorage) =====
  // 저장 키는 "term-quiz."로 시작한다 (더블클릭으로 연 다른 앱과 브라우저 저장 공간을 같이 쓰기 때문).
  // 지울 때도 이 앱의 칸만 지운다 (저장 공간 전체를 비우면 다른 앱 기록까지 지워진다).
  // v2에서 쓰는 저장 칸은 시험 기록 하나다. 공부 결과는 저장하지 않는다

  // 시험 기록 저장 키 (결정 사항 13). 이름은 바꾸지 않는다
  const EXAMS_KEY = 'term-quiz.exams';

  // 통과선 (결정 사항 5: 57점 = 85%). 이 점수 이상이면 통과
  const PASS_SCORE = 57;

  // 저장된 시험 기록(회차 배열, 오래된 것부터)을 읽는다. 저장 공간을 못 쓰거나 값이 망가졌으면 빈 목록.
  // 모양이 맞는 기록만 남긴다: { 날짜: '2026-11-05', 시각: '08:30', 점수: 60, 문제수: 67 }
  function loadExams() {
    let saved;
    try {
      const raw = localStorage.getItem(EXAMS_KEY);
      saved = raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
    if (!Array.isArray(saved)) return [];
    return saved
      .filter(isValidExam)
      .map((exam) => ({ 날짜: exam.날짜, 시각: exam.시각, 점수: exam.점수, 문제수: exam.문제수 }));
  }

  // 기록 한 회의 모양이 맞는지: 날짜 'YYYY-MM-DD', 시각 'HH:MM', 0 ≤ 점수 ≤ 문제수 (정수)
  function isValidExam(exam) {
    return (
      exam !== null &&
      typeof exam === 'object' &&
      typeof exam.날짜 === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(exam.날짜) &&
      typeof exam.시각 === 'string' &&
      /^\d{2}:\d{2}$/.test(exam.시각) &&
      Number.isInteger(exam.문제수) &&
      exam.문제수 > 0 &&
      Number.isInteger(exam.점수) &&
      exam.점수 >= 0 &&
      exam.점수 <= exam.문제수
    );
  }

  // 시험 기록 목록을 저장한다. 성공하면 true, 실패하면 false
  function saveExams(list) {
    try {
      localStorage.setItem(EXAMS_KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      return false;
    }
  }

  // 시험 기록 칸 하나만 지운다. 성공하면 true
  function removeExams() {
    try {
      localStorage.removeItem(EXAMS_KEY);
      return true;
    } catch (err) {
      return false;
    }
  }

  // 끝난 시험 한 회를 기록 뒤에 붙인다. 다른 탭에서 바꾼 것을 덮어쓰지 않도록 쓰기 직전에 다시 읽는다.
  // 날짜·시각은 PC 현지 시간이다 (toISOString은 세계 표준시라, 한국에서는 오전 9시 전이면 날짜가 하루 어긋나고
  // 시각은 늘 9시간 다르다). 성공하면 true
  function addExam(score, total) {
    const now = new Date();
    const record = {
      날짜: now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate()),
      시각: pad2(now.getHours()) + ':' + pad2(now.getMinutes()),
      점수: score,
      문제수: total,
    };
    return saveExams(loadExams().concat(record));
  }

  // 한 자리 숫자 앞에 0을 붙인다 (5 → '05')
  function pad2(n) {
    return String(n).padStart(2, '0');
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
  // 오답은 정답 용어와 같은 묶음의 다른 용어 뜻에서 뽑는다 (공부·시험 모두 67개 표에서 같은 묶음만 고른다).
  // 새 문제를 낼 때마다(newQuestion) 새로 뽑고 4개의 순서도 새로 섞으므로, 공부에서 다시 나온 용어도 보기가 새로 섞인다.
  // 뽑은 보기는 그 문제 칸에 저장해 두고, 같은 문제를 다시 그릴 때(답한 뒤, 이전 문제·다음)는 그대로 쓴다 (결정 사항 8)
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
  // 두 번째 누름은 포커스(키보드 위치)도 옮기지 않게 막는다. 그러지 않으면 새로 나타난 버튼에 포커스가 가서,
  // 이어서 Space·Enter를 누르면 그 버튼이 눌린다 (예: 공부 결과의 "처음으로" → 결과가 확인 없이 사라짐)
  function onClick(button, handler) {
    button.addEventListener('mousedown', (event) => {
      if (event.detail > 1) event.preventDefault();
    });
    button.addEventListener('click', (event) => {
      if (event.detail > 1) return;
      handler();
    });
  }

  // ===== 화면 =====

  // 네 화면(첫 화면, 문제, 시험 결과, 공부 결과) 중 하나만 보이게 하고 맨 위로 올린다
  function showScreen(screen) {
    homeScreen.hidden = screen !== homeScreen;
    quizScreen.hidden = screen !== quizScreen;
    resultScreen.hidden = screen !== resultScreen;
    studyResultScreen.hidden = screen !== studyResultScreen;
    window.scrollTo(0, 0);
  }

  // 첫 화면 (결정 사항 10): "공부 시작"·"시험"·"기록 초기화" 버튼은 index.html에 고정되어 있고,
  // 여기서는 시험 기록을 다시 그린다. 처음 열 때, "처음으로"를 누를 때, 초기화한 뒤에 다시 그린다
  function renderHome() {
    renderExamList();
    homeMessageEl.hidden = true;
  }

  // 첫 화면 아래 "시험 기록": 최근 것이 위로 한 줄씩 (결정 사항 6·10). 없으면 "아직 시험 기록이 없습니다"
  function renderExamList() {
    const exams = loadExams();
    examListEl.replaceChildren();
    exams
      .slice()
      .reverse()
      .forEach((exam) => {
        const item = document.createElement('li');
        item.textContent = exam.날짜 + ' ' + exam.시각 + ' — ' + exam.점수 + ' / ' + exam.문제수 + '점';
        examListEl.appendChild(item);
      });
    examListEl.hidden = exams.length === 0;
    examEmptyEl.hidden = exams.length > 0;
  }

  // "공부 시작": 67개를 섞어 줄을 만들고 맨 앞부터 낸다 (결정 사항 2). 누를 때마다 새로 시작한다
  function startStudy() {
    round = {
      queue: shuffle(TERMS), solved: 0, counts: {}, correct: 0, wrongNumbers: [], answered: false, isExam: false,
      slots: [], view: 0,
    };
    showScreen(quizScreen);
    newQuestion();
  }

  // "시험" 버튼: 67개 전체를 섞어 한 판. 이 판에만 시험 표시를 붙인다 (결정 사항 5·12)
  function startExam() {
    startRound(TERMS, true);
  }

  // 첫 화면 안내 문구를 el 자리에 띄운다. 창이 작아 문구가 화면 밖에 있으면 보이는 곳까지만 스크롤한다
  function showMessage(el, text) {
    el.textContent = text;
    el.hidden = false;
    el.scrollIntoView({ block: 'nearest' });
  }

  // "처음으로": 첫 화면을 다시 그린다 (시험 기록을 새로 읽는다)
  function goHome() {
    renderHome();
    showScreen(homeScreen);
  }

  // "기록 초기화": 확인창을 띄우고, 확인하면 시험 기록을 지운다 (결정 사항 11).
  // 지우지 못하면 첫 화면에 안내 문구를 띄운다
  function resetRecords() {
    if (!window.confirm('시험 기록을 모두 지울까요?')) return;
    const examsRemoved = removeExams();
    renderHome();
    if (!examsRemoved) showMessage(homeMessageEl, '삭제하지 못했어요. 다시 시도해 주세요.');
  }

  // 시험 한 판 시작: 67개를 섞어서 한 번씩 낸다 (startExam이 isExam = true로 부른다)
  function startRound(terms, isExam = false) {
    round = {
      questions: shuffle(terms), index: 0, correct: 0, wrongNumbers: [], answered: false, isExam, examSaved: true,
      slots: [], view: 0,
    };
    showScreen(quizScreen);
    newQuestion();
  }

  // 새 문제 하나: 용어(알아보기만이면 옆에 "(알아보기만)")와 뜻 4개. 방향은 "용어를 보고 뜻 고르기" 하나뿐이다 (결정 사항 5).
  // 공부면 줄 맨 앞 용어를 낸다. 보기는 여기서 한 번만 뽑아 지나간 문제 목록 맨 끝에 넣는다 (결정 사항 8).
  // 다시 그릴 때는 저장된 보기를 그대로 쓰므로, 지난 문제를 보고 돌아와도 보기 순서가 바뀌지 않는다
  function newQuestion() {
    const term = round.isExam ? round.questions[round.index] : round.queue[0];
    round.answered = false;
    round.slots.push({ term, choices: makeChoices(term), picked: null });
    round.view = round.slots.length - 1;
    drawSlot();
    window.scrollTo(0, 0);
  }

  // 목록에서 화면에 보이는 칸(round.view)을 그린다. 맨 끝 칸이 현재 문제이고, 그 앞은 지난 문제다.
  // 아직 답하지 않은 현재 문제만 보기를 누를 수 있다. 답한 문제는 보기를 잠그고, 정답 보기와 틀리게 고른 보기를 표시하고,
  // 맞음/틀림·정답 뜻·비유와 "다음"을 보인다. 그리기만 하고 줄·점수·기록은 바꾸지 않는다
  function drawSlot() {
    const slot = round.slots[round.view];
    const term = slot.term;
    renderProgress();
    termEl.textContent = term.용어;
    lookOnlyEl.hidden = !term.알아보기만;

    choicesEl.replaceChildren();
    slot.choices.forEach((choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.textContent = choice.뜻;
      if (slot.picked === null) {
        onClick(button, () => answer(slot, choice));
      } else {
        button.disabled = true;
        if (choice.번호 === term.번호) button.className = 'choice answer-choice';
        else if (choice.번호 === slot.picked) button.className = 'choice wrong-pick';
      }
      choicesEl.appendChild(button);
    });

    if (slot.picked === null) {
      feedbackEl.hidden = true;
      nextBtn.hidden = true;
    } else {
      const isCorrect = slot.picked === term.번호;
      verdictEl.textContent = isCorrect ? '맞음' : '틀림';
      verdictEl.className = isCorrect ? 'verdict correct' : 'verdict wrong';
      answerEl.textContent = term.뜻;
      analogyEl.textContent = term.비유;
      feedbackEl.hidden = false;
      nextBtn.hidden = false;
    }
    prevBtn.disabled = round.view === 0;
  }

  // 보기를 고르면 바로 맞음/틀림, 정답 뜻, 비유를 보여 주고 "다음" 버튼을 꺼낸다.
  // 공부면 줄을 고치고 진행 표시를 바로 바꾼다 (결정 사항 2·3).
  // 처음 고른 것만 채점한다: 고른 것을 칸에 적고, 보기 4개를 잠근 채 다시 그린다
  function answer(slot, choice) {
    if (round.answered || slot.picked !== null) return;
    round.answered = true;
    slot.picked = choice.번호;
    const term = slot.term;

    const isCorrect = choice.번호 === term.번호;
    if (isCorrect) {
      round.correct += 1;
    } else {
      round.wrongNumbers.push(term.번호);
    }

    // 시험의 마지막(67번째) 답을 고른 순간 시험이 끝난 것으로 보고 기록을 한 번 저장한다 (결정 사항 5·12).
    // 그 전에 창을 닫거나 새로고침하면 시험 기록은 남지 않는다
    if (round.isExam && round.index === round.questions.length - 1) {
      round.examSaved = addExam(round.correct, round.questions.length);
    }

    // 공부: 푼 문제 수와 나온 횟수를 세고 줄을 고친다
    if (!round.isExam) studyAnswer(isCorrect);

    drawSlot();
    nextBtn.focus();
  }

  // "다음": 지난 문제를 보는 중이면 한 칸 앞으로 간다 (결정 사항 8). 현재 문제라면 다음 문제로 가고,
  // 마지막 문제 뒤에는 결과 화면 (공부는 줄 맨 앞 용어를 내고, 줄이 비었으면 공부 결과 화면으로 간다)
  function goNext() {
    if (!round) return;
    if (round.view < round.slots.length - 1) {
      round.view += 1;
      drawSlot();
      scrollToQuestionTop();
      return;
    }
    if (!round.answered) return;
    if (!round.isExam) {
      if (round.queue.length > 0) newQuestion();
      else renderStudyResult();
      return;
    }
    round.index += 1;
    if (round.index < round.questions.length) {
      newQuestion();
    } else {
      renderResult();
    }
  }

  // "이전 문제" (결정 사항 8): 한 칸 뒤의 문제를 그린다. 첫 문제에서는 버튼이 꺼져 있다.
  // 첫 칸에 닿아 버튼이 꺼지면 키보드 위치를 "다음"으로 옮긴다 (꺼진 버튼에서는 Enter가 먹지 않으므로).
  // 이때 화면은 움직이지 않게 한다 (preventScroll: 포커스만 옮기고, 화면 아래쪽 "다음"까지 스크롤하지 않는다)
  function goPrev() {
    if (!round || round.view === 0) return;
    round.view -= 1;
    drawSlot();
    scrollToQuestionTop();
    if (prevBtn.disabled) nextBtn.focus({ preventScroll: true });
  }

  // 다른 칸으로 옮길 때 문제 맨 위가 보이게 올린다. 위 줄이 붙어 있던 자리에서 움직이지 않을 만큼만 올린다
  // (맨 꼭대기까지 올리면 위 줄이 아래로 내려가서, 같은 자리를 다시 누르면 버튼을 비켜 간다)
  function scrollToQuestionTop() {
    window.scrollTo(0, Math.min(window.scrollY, quizScreen.offsetTop));
  }

  // "처음으로" (결정 사항 7): 확인창을 띄우고, 확인하면 지금 판을 버리고 첫 화면으로 간다 (시험 중이면 기록이 남지 않는다).
  // 시험 67번째 답을 고른 뒤 기록 저장에 성공했다면 기록이 이미 남아 있으므로, 그 사실을 알리는 문구로 묻는다
  // (저장에 실패했으면 보통 문구로 묻는다. 결과 화면의 "저장하지 못했어요" 안내를 보지 않고 나가게 되므로).
  // 취소하면 아무것도 다시 그리지 않고 화면도 움직이지 않는다 (보이던 화면 그대로)
  function quitRound() {
    if (!round) return;
    const examDone = round.isExam && round.answered && round.index === round.questions.length - 1 && round.examSaved;
    const question = examDone
      ? '시험 기록은 저장되었어요. 결과를 보지 않고 처음 화면으로 갈까요?'
      : '지금까지 푼 것이 사라집니다. 처음 화면으로 갈까요?';
    if (!window.confirm(question)) {
      if (!nextBtn.hidden) nextBtn.focus({ preventScroll: true });
      return;
    }
    round = null;
    goHome();
  }

  // 진행 표시 (결정 사항 3): 공부일 때만 "남은 용어 N개 · 푼 문제 M". 시험 중에는 숨긴다
  function renderProgress() {
    progressEl.hidden = round.isExam;
    if (!round.isExam) progressEl.textContent = '남은 용어 ' + round.queue.length + '개 · 푼 문제 ' + round.solved;
  }

  // 공부에서 답 하나 (결정 사항 2): 줄 맨 앞(지금 문제)을 빼서, 맞으면 끝내고 틀리면 줄 맨 뒤에 다시 세운다.
  // 하나 남았을 때 틀리면 그 용어가 바로 다시 나온다. 푼 문제 수와 그 용어가 나온 횟수를 세고, 진행 표시를 바로 바꾼다
  function studyAnswer(isCorrect) {
    const head = round.queue.shift();
    round.solved += 1;
    round.counts[head.번호] = (round.counts[head.번호] || 0) + 1;
    if (!isCorrect) round.queue.push(head);
    renderProgress();
  }

  // 공부 결과 (결정 사항 4): 푼 문제 수(반복 포함), 한 번에 맞춘 개수(한 번만 나온 용어 수) / 67,
  // 두 번 이상 나온 용어(번호·용어, 많이 나온 순, 같으면 번호 순, 없으면 "없음"). 공부 결과는 저장하지 않는다
  function renderStudyResult() {
    const firstTry = TERMS.filter((t) => round.counts[t.번호] === 1).length;
    const repeated = TERMS.filter((t) => round.counts[t.번호] >= 2).sort(
      (a, b) => round.counts[b.번호] - round.counts[a.번호] || a.번호 - b.번호
    );
    studySolvedEl.textContent = String(round.solved);
    studyFirstEl.textContent = firstTry + ' / ' + TERMS.length;
    studyRepeatListEl.replaceChildren();
    repeated.forEach((t) => {
      const item = document.createElement('li');
      item.textContent = t.번호 + ' ' + t.용어;
      studyRepeatListEl.appendChild(item);
    });
    studyRepeatListEl.hidden = repeated.length === 0;
    studyRepeatNoneEl.hidden = repeated.length > 0;
    showScreen(studyResultScreen);
  }

  // 결과: 점수(맞은 수 / 문제 수)와 틀린 용어 번호(terms.md의 번호, 작은 순).
  // 시험일 때만 점수 뒤에 "점"을 붙이고, 통과/미통과(굵은 글씨, 색 없음)와 기록 저장 실패 줄을 보인다.
  // 결과 화면은 모든 판이 같이 쓰므로, 시험이 아닌 판에서는 이 줄들을 매번 숨긴다
  function renderResult() {
    const total = round.questions.length;
    scoreEl.textContent = round.correct + ' / ' + total + (round.isExam ? '점' : '');
    const wrong = round.wrongNumbers.slice().sort((a, b) => a - b);
    wrongListEl.textContent = wrong.length > 0 ? wrong.join(', ') : '없음';
    if (round.isExam) {
      passResultEl.textContent = round.correct >= PASS_SCORE ? '통과' : '미통과 (통과선 ' + PASS_SCORE + '점)';
      passResultEl.hidden = false;
      examSaveErrorEl.hidden = round.examSaved;
    } else {
      passResultEl.hidden = true;
      examSaveErrorEl.hidden = true;
    }
    showScreen(resultScreen);
  }

  onClick(nextBtn, goNext);
  onClick(homeBtn, goHome);
  onClick(studyHomeBtn, goHome);
  onClick(studyBtn, startStudy);
  onClick(examBtn, startExam);
  onClick(resetBtn, resetRecords);
  onClick(prevBtn, goPrev);
  onClick(quitBtn, quitRound);

  renderHome();
  showScreen(homeScreen);
})();
