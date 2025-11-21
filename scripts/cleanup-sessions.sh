#!/bin/bash

# 기존 tmux 세션 정리

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

for agent in "${AGENTS[@]}"; do
    if tmux has-session -t "$agent" 2>/dev/null; then
        echo "세션 종료: $agent"
        tmux kill-session -t "$agent" 2>/dev/null || true
    fi
done

echo "모든 기존 세션 정리 완료"
