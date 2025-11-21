#!/bin/bash

# 워크스페이스 디렉토리 구조 생성

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE="$ROOT_DIR/workspace"

# 워크스페이스 디렉토리 구조
mkdir -p "$WORKSPACE"/{agents,artifacts,tasks,signals,status,logs,input,output,tests,docs,src}

# 각 에이전트별 작업 큐 디렉토리
mkdir -p "$WORKSPACE/tasks"/{orchestrator,requirement-analyst,ux-designer,tech-architect,planner,test-designer,developer,reviewer,documenter}

# 상태 파일 초기화
for agent in orchestrator requirement-analyst ux-designer tech-architect planner test-designer developer reviewer documenter; do
    echo "idle" > "$WORKSPACE/status/${agent}.status"
    echo "$(date -Iseconds)" > "$WORKSPACE/status/${agent}.last_update"
done

# README 생성
cat > "$WORKSPACE/README.md" << 'EOF'
# Multi-Agent Development System Workspace

## 디렉토리 구조

```
workspace/
├── agents/           # 각 에이전트의 작업 디렉토리
├── artifacts/        # 생성된 산출물 (requirements.md, design.md 등)
├── tasks/           # 에이전트별 작업 큐
├── signals/         # 에이전트 간 통신용 시그널 파일
├── status/          # 각 에이전트의 상태 파일
├── logs/            # 실행 로그
├── input/           # 사용자 입력
├── output/          # 최종 결과물
├── tests/           # 테스트 파일
├── docs/            # 문서
└── src/             # 소스 코드
```

## 상태 파일 형식

각 에이전트의 상태:
- `idle`: 대기 중
- `working`: 작업 중
- `waiting_approval`: 사용자 승인 대기
- `completed`: 작업 완료
- `error`: 오류 발생

## 시그널 파일 형식

```
status:completed
artifact:/workspace/artifacts/requirements.md
timestamp:2024-01-15T10:00:00Z
```
EOF

echo "워크스페이스 초기화 완료: $WORKSPACE"
