#!/bin/bash

# 모든 에이전트를 하나의 tmux 윈도우에서 pane으로 표시

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# 에이전트 목록 (이름과 표시 라벨)
AGENTS=(
    "orchestrator:🎯 Orchestrator"
    "requirement-analyst:📋 Requirements"
    "ux-designer:🎨 UX Designer"
    "tech-architect:🏗️  Tech Architect"
    "planner:📊 Planner"
    "test-designer:🧪 Test Designer"
    "developer:💻 Developer"
    "reviewer:👀 Reviewer"
    "documenter:📚 Documenter"
)

SESSION_NAME="multi-agent-view"

# 기존 뷰 세션이 있으면 종료
tmux kill-session -t "$SESSION_NAME" 2>/dev/null

echo "모든 에이전트를 한 화면에 표시하는 세션을 생성합니다..."

# 새로운 세션 생성 (첫 번째 에이전트)
agent_name=$(echo "${AGENTS[0]}" | cut -d: -f1)
agent_label=$(echo "${AGENTS[0]}" | cut -d: -f2)

tmux new-session -d -s "$SESSION_NAME" -n "agents"

# 첫 번째 pane에서 orchestrator 세션 모니터링
tmux send-keys -t "$SESSION_NAME:0.0" "watch -n 1 -t 'echo \"$agent_label\"; echo \"\"; tmux capture-pane -t $agent_name -p -S -30'" Enter

# 나머지 에이전트들을 위한 pane 생성
for i in {1..8}; do
    agent_name=$(echo "${AGENTS[$i]}" | cut -d: -f1)
    agent_label=$(echo "${AGENTS[$i]}" | cut -d: -f2)

    # pane 분할
    tmux split-window -t "$SESSION_NAME:0"
    tmux select-layout -t "$SESSION_NAME:0" tiled

    # 새로 만든 pane에서 해당 에이전트 세션 모니터링
    tmux send-keys -t "$SESSION_NAME:0.$i" "watch -n 1 -t 'echo \"$agent_label\"; echo \"\"; tmux capture-pane -t $agent_name -p -S -30'" Enter
done

# 타일 레이아웃으로 정리
tmux select-layout -t "$SESSION_NAME:0" tiled

# 모든 pane을 읽기 전용으로 설정 (실수로 입력하는 것을 방지)
for i in {0..8}; do
    tmux select-pane -t "$SESSION_NAME:0.$i" -d
done

echo ""
echo "✓ 모든 에이전트 뷰가 준비되었습니다!"
echo ""
echo "접속 명령어:"
echo "  tmux attach-session -t $SESSION_NAME"
echo ""
echo "사용법:"
echo "  - 각 pane은 1초마다 해당 에이전트 세션의 최근 30줄을 표시합니다"
echo "  - Ctrl+B, 방향키: pane 간 이동"
echo "  - Ctrl+B, z: 현재 pane을 전체화면으로 토글"
echo "  - Ctrl+B, d: 세션에서 나가기 (detach)"
echo ""
echo "특정 에이전트와 직접 대화하려면:"
echo "  tmux attach-session -t <agent-name>"
echo "  (예: tmux attach-session -t orchestrator)"
echo ""

# 자동 접속
sleep 2
tmux attach-session -t "$SESSION_NAME"
