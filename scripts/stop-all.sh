#!/bin/bash

# 모든 에이전트 세션 종료

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

echo "모든 에이전트 세션을 종료합니다..."
echo ""

for agent in "${AGENTS[@]}"; do
    if tmux has-session -t "$agent" 2>/dev/null; then
        tmux kill-session -t "$agent"
        echo "  ✓ $agent 세션 종료"
    else
        echo "  - $agent 세션이 없음"
    fi
done

echo ""
echo "모든 세션 종료 완료"
