# 🦞 OpenClaw mini — 나만의 Claude AI 비서

오픈소스 비서 [OpenClaw](https://github.com/openclaw/openclaw)에서 영감을 받아 만든 **미니 개인 AI 비서**입니다.
두뇌는 **Claude (Opus 4.8)** 를 쓰고, 두 가지 방식으로 대화할 수 있어요.

1. **터미널 채팅** — 지금 바로 컴퓨터에서 대화
2. **카카오톡 챗봇** — 카카오 i 오픈빌더에 붙여서, 카톡으로 비서 부르기 ("카톡 위에 올라타기" 전략)

> 이건 "감을 잡기 위한 작은 시작점"이에요. 진짜 OpenClaw처럼 내 PC 파일을 직접 조작하진
> 않지만, 대화·정리·번역·글쓰기·코딩 도움은 잘 해냅니다. 여기서 키워나가면 됩니다.

---

## 빠르게 시작하기

### 1. 준비물
- **Node.js 18 이상** (윈도우는 WSL/Ubuntu 권장)
- **Claude API 키** — https://platform.claude.com 에서 발급

### 2. 설치
```bash
npm install
cp .env.example .env      # 윈도우 cmd: copy .env.example .env
```
`.env` 파일을 열어 본인 API 키를 넣으세요:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. 점검 (API 키 없이도 됨)
```bash
npm run smoke
```
설정·기억 저장이 정상인지 확인합니다.

### 4. 터미널에서 대화 🗣️
```bash
npm run chat
```
```
🦞 OpenClaw mini — Claude 비서 '클로'
   종료: exit  |  기억 비우기: /reset

나 > 내 이름은 지윤이야
클로 > 반가워요 지윤님! ...
나 > 내 이름이 뭐였지?
클로 > 지윤님이에요 🙂   ← 이전 대화를 기억합니다
```

---

## 카카오톡에 붙이기 🟡

카카오는 개인 친구 채팅은 봇이 못 읽지만, **카카오 채널(비즈니스) + i 오픈빌더 챗봇**은
열려 있습니다. 그 챗봇의 "스킬 서버"로 이 프로젝트를 연결하면 됩니다.

### 1. 웹훅 서버 실행
```bash
npm run kakao
# → http://localhost:3000/kakao/skill
```

### 2. 외부에서 접속 가능하게 (개발용)
카카오가 내 서버로 접속해야 하므로 공개 주소가 필요합니다. 가장 쉬운 건 [ngrok](https://ngrok.com):
```bash
ngrok http 3000
# → https://xxxx.ngrok.io 같은 주소가 생김
```

### 3. 오픈빌더에 등록
[카카오 i 오픈빌더](https://i.kakao.com)에서 챗봇 생성 → 스킬 추가 →
**스킬 URL**에 `https://xxxx.ngrok.io/kakao/skill` 입력 → 폴백 블록에 이 스킬 연결.

이제 카카오 채널에 말을 걸면 Claude가 답합니다.

> ⚠️ 카카오 오픈빌더는 응답을 **5초 안에** 받아야 해서, 카카오 경로는 자동으로 *빠른 모드*
> (thinking 끔 + effort 낮춤)로 동작합니다. 더 긴 답이 필요하면 오픈빌더의 "콜백" 기능을
> 써야 하는데, 그건 다음 단계 숙제로 남겨뒀어요.

---

## 프로젝트 구조
```
src/
  config.ts      설정 + 비서 성격(시스템 프롬프트)
  memory.ts      대화 기억 (data/<id>.json 파일에 저장)
  assistant.ts   Claude 호출 핵심 (캐싱·적응형 thinking·스트리밍)
  cli.ts         터미널 채팅
  kakao.ts       카카오 i 오픈빌더 웹훅 서버
  smoke.ts       API 키 없이 돌리는 점검
```

## 설정값 (.env)
| 변수 | 기본값 | 설명 |
|------|--------|------|
| `ANTHROPIC_API_KEY` | (필수) | Claude API 키 |
| `OPENCLAW_MODEL` | `claude-opus-4-8` | 사용할 모델 |
| `OPENCLAW_EFFORT` | `high` | 사고 깊이 (low/medium/high/max) |
| `OPENCLAW_MAX_TOKENS` | `8000` | 답변 최대 길이 |
| `OPENCLAW_MAX_TURNS` | `20` | 기억할 최근 대화 턴 수 |
| `PORT` | `3000` | 카카오 웹훅 서버 포트 |

## 비용 안내 💰
프로그램은 무료지만 Claude API는 사용량만큼 과금됩니다(가볍게 쓰면 월 $10~30 수준).
프롬프트 캐싱을 적용해 반복 호출 비용을 줄여뒀습니다.

---

## 다음 단계 아이디어
- [ ] 카카오 콜백(callback)으로 긴 답변/스트리밍 지원
- [ ] 웹 검색·날씨 등 "도구(tool)" 붙이기 → 진짜 행동하는 비서로
- [ ] 사용자별 메모리를 DB로 옮기기
- [ ] 음성(STT/TTS) 추가
