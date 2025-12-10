# 작업: 에이전트 실행 상태 추적 버그 수정

## 프로젝트 경로
`/Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/project/agent-dashboard/`

## 문제 현상
1. 종료된 에이전트가 새로고침 후 "대기중"으로 표시됨
2. 우클릭 시 "실행" 표시되지만 실행이 안됨
3. 실제 상태와 캐시된 상태 불일치

## 원인 분석
1. `initializeAgentStates()`에서 `runningStatuses[agent.id] = true`로 초기화
   - 새로고침 시 모든 에이전트가 running=true로 시작
   - 실제 tmux 세션 상태와 무관하게 "대기중" 표시

2. `toggleAgentRunning()`에서 캐시된 값 사용
   - 초기값 true → 실제 종료된 에이전트도 running으로 인식
   - stop 명령 실행 시도 (이미 종료된 상태에서)

3. 첫 폴링(3초) 전에 UI가 렌더링되어 잘못된 상태 표시

## 해결 방안

### 1. 앱 초기화 시 즉시 상태 동기화
`init()` 함수에서 `startPolling()` 호출 전에 즉시 한 번 폴링 실행:

```javascript
init() {
    // ... 기존 초기화 코드 ...

    // 즉시 상태 동기화 (폴링 시작 전)
    this.pollStatus();  // 첫 폴링 즉시 실행

    // Start status polling
    this.startPolling();

    // ... 나머지 코드 ...
}
```

### 2. 초기값을 null로 설정
`initializeAgentStates()`에서:

```javascript
initializeAgentStates() {
    this.config.agents.forEach(agent => {
        this.state.agentStatuses[agent.id] = 'idle';
        this.state.runningStatuses[agent.id] = null; // unknown until first poll
        this.state.connectionStatus[agent.id] = 'unknown';
        this.state.reconnectAttempts[agent.id] = 0;
    });
}
```

### 3. createStatusCover() 수정
null 상태 처리 추가:

```javascript
createStatusCover(agent) {
    const status = this.state.agentStatuses[agent.id] || 'idle';
    const runningState = this.state.runningStatuses[agent.id];
    // null이면 아직 확인 안됨, false면 종료됨
    const isRunning = runningState !== false;
    const statusLabel = runningState === null ? '확인 중...' :
                        runningState === false ? '종료됨' :
                        this.getStatusLabel(status);
    // ...
}
```

### 4. updateStatusCover() 수정
동일하게 null 상태 처리

### 5. toggleAgentRunning() 수정
캐시 대신 실제 API 호출로 상태 확인:

```javascript
async toggleAgentRunning() {
    const agentId = this.state.contextMenuAgentId;
    if (!agentId) return;

    this.hideContextMenu();

    try {
        // 실제 API로 현재 상태 확인 (캐시 사용 안함)
        const checkResponse = await fetch(`/api/agent/${agentId}/running`);
        const checkData = await checkResponse.json();
        const isRunning = checkData.running;

        // Toggle
        const action = isRunning ? 'stop' : 'start';
        // ...
    }
}
```

## 수정할 파일
- `js/app.js`

## 수정할 함수
1. `init()` - 즉시 폴링 추가
2. `initializeAgentStates()` - 초기값 null로 변경
3. `createStatusCover()` - null 상태 처리
4. `updateStatusCover()` - null 상태 처리
5. `toggleAgentRunning()` - 실제 API 호출로 변경

## 완료 시그널
```bash
touch /Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/signals/dev-fix-running-done
```
