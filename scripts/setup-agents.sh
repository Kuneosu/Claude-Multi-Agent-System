#!/bin/bash

# 에이전트 디렉토리 확인 및 생성 (CLAUDE.md는 기존 파일 사용)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE="$ROOT_DIR/workspace"
AGENTS_DIR="$WORKSPACE/agents"

# 에이전트 목록
AGENTS=(
    "orchestrator"
    "requirement-analyst"
    "ux-designer"
    "tech-architect"
    "planner"
    "test-designer"
    "developer"
    "reviewer"
    "documenter"
)

# 각 에이전트 디렉토리 확인
for agent in "${AGENTS[@]}"; do
    AGENT_DIR="$AGENTS_DIR/$agent"

    # 디렉토리가 없으면 생성
    if [ ! -d "$AGENT_DIR" ]; then
        mkdir -p "$AGENT_DIR"
        echo "에이전트 디렉토리 생성: $agent"
    fi

    # CLAUDE.md 존재 여부 확인
    if [ ! -f "$AGENT_DIR/CLAUDE.md" ]; then
        echo "⚠️  경고: $agent/CLAUDE.md 파일이 없습니다."
    fi
done

echo "에이전트 디렉토리 확인 완료"
