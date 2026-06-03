# 🦞 OpenClaw mini — 가게용 카카오 AI 상담봇

동네 가게(미용실·학원·병원·헬스장 등)의 **카카오톡 손님 문의를 24시간 자동 응대**하는 AI 상담봇입니다.
두뇌는 **Claude (Opus 4.8)**, 가게 사장님은 **`business.json` 파일에 가게 정보만 채우면** 끝.

> OpenClaw(오픈소스 개인 AI 비서)에서 영감을 받아, **"팔 수 있는 제품"** 으로 좁힌 버전이에요.
> 카카오와 싸우지 말고 **카카오 위에 올라타는** 전략입니다.

---

## 무엇을 하나요?
- 손님이 카톡 채널로 "영업시간 언제예요?", "커트 얼마예요?", "주차 되나요?" 물으면 → **AI가 가게 정보로 즉시 답변**
- 모르는 건 지어내지 않고 **전화 연결**을 안내
- 사장님은 잠잘 때도 손님 문의가 자동으로 처리됨

## 빠른 시작 (5분 테스트)
```bash
npm install
cp .env.example .env            # 윈도우: copy .env.example .env
cp business.example.json business.json
```
1. `.env` 에 Claude API 키 넣기 → `ANTHROPIC_API_KEY=sk-ant-...`
2. `business.json` 에 **내 가게 정보** 채우기 (상호·시간·메뉴·FAQ)
3. 손님인 척 대화해보기:
```bash
npm run chat
```
```
나 > 커트 얼마예요?
클로 > 커트는 15,000원입니다 :) 예약 도와드릴까요?
```

> 📖 **처음이라 막막하다면** → `docs/01-내컴퓨터에서-실행하기.md` 부터 보세요. 클릭 하나하나 안내합니다.

## 카카오에 연결
```bash
npm run kakao    # 웹훅 서버 (localhost:3000/kakao/skill)
```
카카오 i 오픈빌더 스킬 서버로 연결 → 카톡 채널에서 바로 작동.
자세한 건 👉 `docs/02-카카오에-연결하기.md`

---

## 폴더 안내
```
business.example.json   가게 정보 양식 (복사해서 business.json 으로 채우기)
src/
  business.ts    가게 정보 → "이 가게 전용 상담직원" 프롬프트 생성
  config.ts      모델·설정
  memory.ts      대화 기억 (data/<id>.json)
  assistant.ts   Claude 호출 핵심 (캐싱·스트리밍)
  cli.ts         터미널 테스트 채팅
  kakao.ts       카카오 i 오픈빌더 웹훅 서버
  smoke.ts       API 키 없이 돌리는 점검
docs/
  01-내컴퓨터에서-실행하기.md   ← 초보용 실행 가이드
  02-카카오에-연결하기.md       ← 카카오 연결 가이드
  사업킷/                      ← 영업 멘트·가격·수익계산·로드맵
```

## 설정 (.env)
| 변수 | 기본값 | 설명 |
|------|--------|------|
| `ANTHROPIC_API_KEY` | (필수) | Claude API 키 |
| `OPENCLAW_MODEL` | `claude-opus-4-8` | 모델 |
| `OPENCLAW_EFFORT` | `high` | 사고 깊이 |
| `OPENCLAW_MAX_TOKENS` | `8000` | 답변 최대 길이 |
| `PORT` | `3000` | 웹훅 포트 |

## 💰 사업으로 키우기
가게당 **설치비 + 월 구독료** 모델. 영업 멘트·가격표·수익 계산은 `docs/사업킷/` 폴더에 있어요.

## 비용 안내
프로그램은 무료지만 Claude API는 사용량만큼 과금됩니다. 프롬프트 캐싱으로 비용을 줄여뒀어요.
가게당 손님 응대 비용은 보통 월 몇 천원 수준 → 구독료에서 충분히 남습니다.
