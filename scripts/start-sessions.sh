#!/bin/bash

# 모든 에이전트 tmux 세션 시작

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

echo "에이전트 세션 시작 중..."

for agent in "${AGENTS[@]}"; do
    AGENT_DIR="$AGENTS_DIR/$agent"

    # tmux 세션 생성
    tmux new-session -d -s "$agent" -c "$AGENT_DIR"

    # CLAUDE.md 파일을 시스템 프롬프트로 사용하여 claude 실행
    # 파일 내용을 직접 전달하면 길이 제한 문제가 있으므로 --append-system-prompt 사용
    # 메시지와 Enter를 분리하여 전송 (버퍼 문제 방지)
    # orchestrator만 Haiku, 나머지는 Opus 모델 사용
    if [[ "$agent" == "orchestrator" ]]; then
        tmux send-keys -t "$agent:0" "claude --model haiku --append-system-prompt \"\$(cat CLAUDE.md)\""
    else
        tmux send-keys -t "$agent:0" "claude --model opus --append-system-prompt \"\$(cat CLAUDE.md)\""
    fi
    sleep 0.2
    tmux send-keys -t "$agent:0" C-m

    echo "  ✓ $agent 세션 시작"
    sleep 0.3
done

echo ""
echo "모든 에이전트 세션이 시작되었습니다."
echo ""
echo "세션 확인:"
tmux list-sessions 2>/dev/null | grep -E "(orchestrator|requirement-analyst|ux-designer|tech-architect|planner|test-designer|developer|reviewer|documenter)"
