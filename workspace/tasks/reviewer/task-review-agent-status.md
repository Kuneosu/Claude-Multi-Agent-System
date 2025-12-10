# 코드 리뷰 요청: 에이전트 실행/종료 상태 추적 기능

## 프로젝트 경로
`/Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/project/agent-dashboard/`

## 리뷰 대상 파일
1. `js/app.js` - JavaScript 로직
2. `css/style.css` - 스타일시트

## 구현된 기능 설명
에이전트 카드에서 컨텍스트 메뉴를 통해 에이전트를 종료/실행할 때 상태를 추적하고 UI에 반영하는 기능입니다.

### 주요 변경 사항
1. **상태 관리**: `state.runningStatuses` 객체 추가로 각 에이전트의 running/stopped 상태 관리
2. **상태 폴링**: `pollAgentStatus()`에서 `/api/agent/:agentId/running` API 호출 추가
3. **UI 업데이트**:
   - 종료된 에이전트 카드에 `.stopped` 클래스 적용
   - 오버레이 투명도 0.85로 어둡게 처리
   - "종료됨" 문구 표시
4. **메인 터미널 헤더**: 우클릭 컨텍스트 메뉴 지원 추가
5. **즉시 반영**: `toggleAgentRunning()` 후 즉시 UI 업데이트

## 리뷰 포인트
1. **코드 품질**: 코드 스타일, 가독성, 일관성
2. **버그 가능성**: 잠재적 버그나 엣지 케이스
3. **성능**: 불필요한 API 호출이나 렌더링 최적화 필요성
4. **접근성**: 상태 변경에 대한 스크린 리더 지원
5. **에러 처리**: API 실패 시 처리 적절성

## 주요 코드 위치
- `state.runningStatuses`: app.js 43번째 줄
- `initializeAgentStates()`: app.js 158번째 줄
- `pollAgentStatus()`: app.js 561번째 줄 (running API 호출: 585-600)
- `createStatusCover()`: app.js 1093번째 줄
- `updateStatusCover()`: app.js 1120번째 줄
- `createTmuxHeader()`: app.js 1022번째 줄 (컨텍스트 메뉴: 1056-1060)
- `toggleAgentRunning()`: app.js 1296번째 줄
- CSS `.stopped` 스타일: style.css 793-806번째 줄

## 완료 시그널
리뷰 완료 후 아래 파일 생성:
```bash
touch /Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/signals/review-agent-status-done
```

리뷰 결과는 아래 파일에 작성:
```
/Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/artifacts/review-agent-status.md
```
