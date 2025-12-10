# 작업: 에이전트 실행/종료 상태 추적 기능 구현

## 프로젝트 경로
`/Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/project/agent-dashboard/`

## 배경
현재 에이전트 카드에서 컨텍스트 메뉴를 통해 에이전트(tmux session 및 claude code)를 종료/실행할 수 있습니다. 하지만 종료 후에도 에이전트 카드에서 "대기 중"으로 표시되는 문제가 있습니다.

## 요구사항

### 1. 에이전트 실행/종료 상태 추적
- `state` 객체에 `runningStatuses` 추가하여 각 에이전트의 실행 상태(running/stopped) 추적
- 상태 폴링(`pollStatus`) 시 `/api/agent/:agentId/running` API도 함께 호출하여 실행 상태 업데이트
- `toggleAgentRunning()` 함수에서 상태 변경 후 즉시 `runningStatuses` 업데이트

### 2. 종료된 에이전트 카드 UI 변경
- 종료된 에이전트의 Status Cover에서:
  - 검은색 오버레이 투명도를 더 낮춤 (현재 0.6 → 0.85 정도로 더 어둡게)
  - "종료됨" 문구 표시
  - 새로운 CSS 클래스 `.status-cover.stopped` 추가
- `createStatusCover()` 및 `updateStatusCover()` 함수 수정

### 3. 메인 터미널 헤더에 컨텍스트 메뉴 추가
- `tmux-command-header`에 우클릭 컨텍스트 메뉴 지원 추가
- 또는 헤더에 종료/실행 버튼 직접 추가
- 메인 터미널의 에이전트도 컨텍스트 메뉴로 제어 가능하도록

## 수정할 파일
1. `js/app.js` - 상태 관리 및 로직
2. `css/style.css` - 종료 상태 스타일

## 참고 코드 위치
- `state` 객체: app.js 40번째 줄 근처
- `pollAgentStatus()`: app.js 561번째 줄 근처
- `toggleAgentRunning()`: app.js 1296번째 줄 근처
- `createStatusCover()`: app.js 1093번째 줄 근처
- `updateStatusCover()`: app.js 1120번째 줄 근처
- `createTmuxHeader()`: app.js 1022번째 줄 근처
- Status Cover CSS: style.css 761번째 줄 근처

## 완료 시그널
작업 완료 후 아래 파일 생성:
```bash
touch /Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/signals/dev-agent-status-done
```
