#!/bin/bash

# 모든 에이전트 tmux 세션 시작 (완전 자동화 모드)
# --dangerously-skip-permissions 옵션 사용

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE="$ROOT_DIR/workspace"
AGENTS_DIR="$WORKSPACE/agents"
CONFIG_FILE="$ROOT_DIR/config.sh"

# Load configuration (includes get_model function)
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

echo "에이전트 세션 시작 중 (자동화 모드)..."

# 먼저 모든 세션 생성
for agent in "${AGENTS[@]}"; do
    AGENT_DIR="$AGENTS_DIR/$agent"
    tmux new-session -d -s "$agent" -c "$AGENT_DIR"
    echo "  ✓ $agent 세션 생성"
done

# 세션이 완전히 초기화될 때까지 대기
echo ""
echo "세션 초기화 대기 중..."
sleep 2

# 각 세션에 claude 명령어 전송
for agent in "${AGENTS[@]}"; do
    MODEL=$(get_model "$agent")

    # claude 명령어를 시스템 프롬프트와 함께 실행 (자동화 모드)
    tmux send-keys -t "$agent:0" "claude --dangerously-skip-permissions --model $MODEL --append-system-prompt \"\$(cat CLAUDE.md)\"" Enter

    echo "  ✓ $agent claude 시작 (모델: $MODEL)"
    sleep 0.3
done

# claude가 완전히 시작될 때까지 대기
echo ""
echo "Claude 초기화 대기 중..."
sleep 8

# 모든 에이전트에게 초기 지시 메시지 전송
echo ""
echo "에이전트들에게 초기 지시 전송 중..."

# Orchestrator 초기 메시지
ORCHESTRATOR_MSG='시스템 초기화 완료. 당신은 오케스트레이터입니다. CLAUDE.md에 정의된 역할과 규칙을 반드시 준수하세요. 사용자의 프로젝트 요청을 받으면 절대 직접 코드를 작성하지 말고, 전문 에이전트들에게 tmux를 통해 작업을 위임하세요.'

tmux send-keys -t "orchestrator:0" "$ORCHESTRATOR_MSG"
sleep 0.5
tmux send-keys -t "orchestrator:0" Enter
echo "  ✓ orchestrator 초기 지시 완료"

# 나머지 에이전트들에게 초기 메시지
AGENT_MSG='시스템 초기화 완료. CLAUDE.md에 정의된 역할과 규칙을 반드시 준수하세요. 작업 완료 시 반드시 시그널 파일을 생성하고 상태를 업데이트하세요.'

for agent in "${AGENTS[@]}"; do
    if [ "$agent" != "orchestrator" ]; then
        tmux send-keys -t "$agent:0" "$AGENT_MSG"
        sleep 0.3
        tmux send-keys -t "$agent:0" Enter
        echo "  ✓ $agent 초기 지시 완료"
        sleep 0.2
    fi
done

echo ""
echo "⚠️  모든 에이전트가 자동화 모드로 실행되었습니다."
echo "   사용자 확인 없이 파일이 생성/수정/삭제될 수 있습니다."
echo ""
echo "세션 확인:"
tmux list-sessions 2>/dev/null | grep -E "(orchestrator|requirement-analyst|ux-designer|tech-architect|planner|test-designer|developer|reviewer|documenter)"
