# 작업: 배치 API 최적화

## 프로젝트 경로
`/Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/project/agent-dashboard/`

## 배경
현재 상태 폴링에서 각 에이전트마다 2개의 API를 호출하여 총 18개 요청이 3초마다 발생합니다.
이를 하나의 배치 API로 통합하여 네트워크 효율성을 개선합니다.

## 현재 구조
```javascript
// pollAgentStatus()에서 에이전트당 2개 API 호출
GET /api/status/${agent.id}           // 작업 상태 (idle/working/error)
GET /api/agent/${agent.id}/running    // 실행 상태 (running/stopped)

// 9개 에이전트 × 2개 API = 18개 요청/3초
```

## 요구사항

### 1. 백엔드 (server.js)
새로운 배치 API 엔드포인트 추가:

```javascript
// GET /api/agents/status
// 응답 예시:
{
  "orchestrator": { "status": "idle", "running": true },
  "requirement-analyst": { "status": "working", "running": true },
  "ux-designer": { "status": "idle", "running": false },
  ...
}
```

구현 내용:
- 모든 에이전트의 상태 파일 읽기 (status)
- 모든 에이전트의 tmux 세션 상태 확인 (running)
- 하나의 JSON 객체로 반환

### 2. 프론트엔드 (app.js)
`pollStatus()` 함수 수정:

```javascript
async pollStatus() {
    try {
        const response = await fetch('/api/agents/status', {
            method: 'GET',
            cache: 'no-cache'
        });

        if (response.ok) {
            const data = await response.json();
            // data를 순회하며 각 에이전트 상태 업데이트
            for (const [agentId, status] of Object.entries(data)) {
                // agentStatuses 업데이트
                // runningStatuses 업데이트
                // UI 업데이트
            }
        }
    } catch (error) {
        // 에러 처리
    }
}
```

- 기존 `pollAgentStatus()` 함수는 제거하거나 fallback용으로 유지
- 상태 변경 시 기존처럼 `updateStatusIndicator()`, `updateStatusCover()` 호출

## 수정할 파일
1. `server.js` - 배치 API 엔드포인트 추가
2. `js/app.js` - pollStatus() 함수 수정

## 참고
- server.js 위치: `/Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/project/agent-dashboard/server.js`
- 기존 개별 API는 하위 호환성을 위해 유지

## 완료 시그널
```bash
touch /Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/signals/dev-batch-api-done
```
