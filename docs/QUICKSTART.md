# Quick Start Guide

## 1단계: 시스템 시작

```bash
cd MAS  # 프로젝트 디렉토리로 이동
./run.sh
```

메뉴가 표시되면 `1) 터미널 실행` 또는 `3) 웹 대시보드`를 선택합니다.

실행 시 다음 과정이 자동으로 진행됩니다:

1. ✅ 워크스페이스 초기화
2. ✅ 이전 작업 정리
3. ✅ 9개 에이전트 환경 설정 (각 CLAUDE.md 생성)
4. ✅ 기존 세션 정리
5. ✅ 9개 tmux 세션 시작 (각 세션마다 Claude 실행)

세션이 시작되면 **세션 모니터 화면**이 표시됩니다.

## 2단계: 오케스트레이터와 대화

세션 모니터에서 `1`을 눌러 Orchestrator 세션에 접속합니다.

오케스트레이터가 프로젝트 요청을 기다리고 있습니다:

```
어떤 프로젝트를 시작하시겠습니까?
예시:
- "3D 주사위 굴리기 웹 앱"
- "TODO 리스트 애플리케이션"
- "데이터 시각화 대시보드"

프로젝트 설명을 입력해주세요:
```

## 3단계: 프로젝트 설명 입력

예시:
```
"3D로 주사위를 굴릴 수 있는 웹 만들어줘"
```

## 4단계: 자동 진행

시스템이 자동으로:

1. **requirement-analyst**가 요구사항 분석
   - 불명확한 부분 질문
   - 사용자 답변 대기

2. **ux-designer**가 UI/UX 설계
   - 사용자 플로우 정의
   - 화면 구성

3. **tech-architect**가 기술 스택 결정
   - 라이브러리 선택
   - 아키텍처 설계

4. **planner**가 구현 계획 수립
   - 3개 iteration으로 분할
   - 사용자 승인 대기

5. **test-designer**가 테스트 작성
   - TDD 방식

6. **developer**가 구현
   - Iteration 1 → reviewer 검토
   - Iteration 2 → reviewer 검토
   - Iteration 3 → reviewer 검토

7. **documenter**가 문서화
   - README, API 문서 생성

## 5단계: 결과 확인

완성된 프로젝트는 다음 위치에 저장됩니다:

```
workspace/
├── project/         # 최종 결과물
├── src/            # 소스 코드
├── tests/          # 테스트 파일
├── docs/           # 문서
└── artifacts/      # 중간 산출물
```

## tmux 단축키

### 세션 관리
- `Ctrl+b, d` : 세션에서 나가기 (종료하지 않음)
- `Ctrl+b, s` : 세션 목록 보기
- `Ctrl+b, w` : 윈도우 목록 보기

### 다른 세션 보기
```bash
# orchestrator → developer 세션으로 전환
tmux attach-session -t developer

# 다시 orchestrator로
tmux attach-session -t orchestrator
```

### 모든 세션 종료
```bash
# 세션 모니터에서 q 키를 누르면 모든 세션이 종료됩니다
# 또는 직접 실행:
./scripts/stop-all.sh
```

## 디버깅

### 상태 확인
```bash
# 모든 에이전트 상태
cat workspace/status/*.status

# 특정 에이전트
cat workspace/status/developer.status
```

### 로그 확인
```bash
# 오케스트레이터 로그
cat workspace/logs/orchestrator.log
```

### 시그널 확인
```bash
# 대기 중인 시그널
ls workspace/signals/

# 시그널 내용
cat workspace/signals/req-analysis-done
```

## 문제 해결

### Q: 세션이 시작되지 않아요
```bash
./scripts/stop-all.sh
./run.sh
```

### Q: 특정 에이전트가 응답하지 않아요
```bash
# 세션 모니터에서 해당 에이전트 번호 입력
# 또는 직접 접속
tmux attach-session -t [agent-name]

# 상태 확인
cat workspace/status/[agent-name].status
```

### Q: 작업이 멈춘 것 같아요
```bash
# 1. 대기 중인 작업 확인
ls workspace/tasks/*/

# 2. 시그널 파일 확인
ls workspace/signals/

# 3. 세션 모니터에서 s 키로 상태 새로고침
```

## 고급 사용법

### 수동으로 특정 단계만 실행

```bash
# 1. 워크스페이스만 초기화
bash scripts/setup-workspace.sh

# 2. 특정 에이전트만 시작
tmux new-session -d -s developer -c workspace/agents/developer
tmux send-keys -t developer:0 "claude -p CLAUDE.md" Enter
```

### 작업 파일 직접 생성

```bash
# requirement-analyst에게 직접 작업 지시
cat > workspace/tasks/requirement-analyst/task-custom.json << EOF
{
  "task_id": "custom-001",
  "command": "analyze_requirements",
  "input": "/workspace/input/my_request.txt",
  "output": "/workspace/artifacts/my_requirements.md",
  "callback": "/workspace/signals/custom-done"
}
EOF

# 에이전트에게 알림
tmux send-keys -t requirement-analyst:0 "새 작업이 있습니다" Enter
```

## 예상 소요 시간

- **간단한 웹 앱** (TODO 리스트): 1-2시간
- **중간 복잡도** (3D 주사위): 3-4시간
- **복잡한 앱** (대시보드): 5-8시간

*실제 시간은 요구사항 복잡도에 따라 다릅니다*

## 다음 단계

시스템이 작동하는 것을 확인했다면:

1. 간단한 프로젝트로 테스트
2. 각 에이전트의 CLAUDE.md 커스터마이징
3. 워크플로우 단계 추가/수정
4. 자동화 레벨 조정

## 피드백

문제가 있거나 개선 제안이 있으면 알려주세요!
