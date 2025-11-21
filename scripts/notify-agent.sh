#!/bin/bash

# 특정 에이전트에게 새 작업이 있음을 알림

AGENT_NAME=$1
TASK_FILE=$2

if [ -z "$AGENT_NAME" ] || [ -z "$TASK_FILE" ]; then
    echo "사용법: $0 <agent-name> <task-file-path>"
    exit 1
fi

# tmux 세션이 존재하는지 확인
if ! tmux has-session -t "$AGENT_NAME" 2>/dev/null; then
    echo "오류: $AGENT_NAME 세션을 찾을 수 없습니다."
    exit 1
fi

# 메시지 전송 (여러 번 시도)
MESSAGE="새로운 작업이 할당되었습니다: $TASK_FILE 파일을 확인하세요."

echo "[$AGENT_NAME] 작업 알림 전송 중..."

# 1. 현재 입력 중인 내용 초기화 (Ctrl+U)
tmux send-keys -t "$AGENT_NAME:0" C-u

# 2. 메시지 입력
tmux send-keys -t "$AGENT_NAME:0" "$MESSAGE"

# 3. 짧은 대기
sleep 0.5

# 4. Enter 전송
tmux send-keys -t "$AGENT_NAME:0" Enter

echo "✓ [$AGENT_NAME] 알림 전송 완료"
