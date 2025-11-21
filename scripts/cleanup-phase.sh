#!/bin/bash

# 초기 단계 에이전트 세션 종료 스크립트
# 구현 단계 진입 시 불필요한 세션을 종료하여 리소스 절약

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 초기 단계 에이전트 (구현 단계 이후 불필요)
INITIAL_PHASE_AGENTS=(
    "requirement-analyst"
    "ux-designer"
    "tech-architect"
    "planner"
    "test-designer"
)

# 구현 단계 에이전트 (계속 필요)
IMPLEMENTATION_AGENTS=(
    "orchestrator"
    "developer"
    "reviewer"
    "documenter"
)

show_usage() {
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  --initial    초기 단계 에이전트 종료 (requirements, ux, architect, planner, test-designer)"
    echo "  --all        모든 에이전트 종료"
    echo "  --status     현재 세션 상태 표시"
    echo "  --help       이 도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0 --initial   # 구현 단계 진입 시 초기 에이전트만 종료"
    echo "  $0 --status    # 현재 실행 중인 세션 확인"
}

show_status() {
    echo -e "${YELLOW}현재 실행 중인 세션:${NC}"
    echo ""

    echo -e "${GREEN}초기 단계 에이전트:${NC}"
    for agent in "${INITIAL_PHASE_AGENTS[@]}"; do
        if tmux has-session -t "$agent" 2>/dev/null; then
            echo -e "  ✅ $agent - 실행 중"
        else
            echo -e "  ⬜ $agent - 종료됨"
        fi
    done

    echo ""
    echo -e "${GREEN}구현 단계 에이전트:${NC}"
    for agent in "${IMPLEMENTATION_AGENTS[@]}"; do
        if tmux has-session -t "$agent" 2>/dev/null; then
            echo -e "  ✅ $agent - 실행 중"
        else
            echo -e "  ⬜ $agent - 종료됨"
        fi
    done
    echo ""
}

cleanup_initial() {
    echo -e "${YELLOW}초기 단계 에이전트 세션 종료 중...${NC}"
    echo ""

    for agent in "${INITIAL_PHASE_AGENTS[@]}"; do
        if tmux has-session -t "$agent" 2>/dev/null; then
            tmux kill-session -t "$agent"
            echo -e "  ${RED}✗${NC} $agent 세션 종료"
        else
            echo -e "  ⬜ $agent - 이미 종료됨"
        fi
    done

    echo ""
    echo -e "${GREEN}초기 단계 에이전트 정리 완료${NC}"
    echo ""
    echo -e "${YELLOW}유지 중인 세션:${NC}"
    for agent in "${IMPLEMENTATION_AGENTS[@]}"; do
        if tmux has-session -t "$agent" 2>/dev/null; then
            echo -e "  ✅ $agent"
        fi
    done
    echo ""
}

cleanup_all() {
    echo -e "${YELLOW}모든 에이전트 세션 종료 중...${NC}"
    bash "$SCRIPT_DIR/cleanup-sessions.sh"
}

# 인자가 없으면 사용법 표시
if [ $# -eq 0 ]; then
    show_usage
    exit 0
fi

# 옵션 처리
case "$1" in
    --initial)
        cleanup_initial
        ;;
    --all)
        cleanup_all
        ;;
    --status)
        show_status
        ;;
    --help|-h)
        show_usage
        ;;
    *)
        echo -e "${RED}알 수 없는 옵션: $1${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
