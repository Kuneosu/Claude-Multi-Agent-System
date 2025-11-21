#!/bin/bash

# Orchestrator 세션만 테스트

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE="$ROOT_DIR/workspace"
AGENTS_DIR="$WORKSPACE/agents"

agent="orchestrator"
AGENT_DIR="$AGENTS_DIR/$agent"

# 기존 세션 종료
tmux kill-session -t "$agent" 2>/dev/null

# 새 세션 생성
tmux new-session -d -s "$agent" -c "$AGENT_DIR"

# Claude 실행
tmux send-keys -t "$agent:0" "claude --system-prompt \"\$(cat CLAUDE.md)\"" Enter

echo "Claude 로드 대기 중..."

# Claude가 준비될 때까지 대기
retries=0
while [ $retries -lt 20 ]; do
    if tmux capture-pane -t "$agent:0" -p | grep -q "for shortcuts"; then
        echo "Claude 준비 완료"
        sleep 1
        # 초기 메시지 전송
        tmux send-keys -t "$agent:0" "시스템이 시작되었습니다. 사용자를 환영해주세요." Enter
        echo "초기 메시지 전송 완료"
        break
    fi
    sleep 0.5
    retries=$((retries + 1))
done

echo "완료: retries=$retries"

# 세션 확인
echo ""
echo "세션 내용:"
sleep 3
tmux capture-pane -t "$agent:0" -p -S -50
