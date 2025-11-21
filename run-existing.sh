#!/bin/bash

# Multi-Agent Development System Launcher (기존 프로젝트 모드)
# 기존 프로젝트에 대한 기능 추가, 버그 수정, 리팩토링 등을 위한 간소화된 워크플로우

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="$SCRIPT_DIR/workspace"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Multi-Agent Development System${NC}"
echo -e "${CYAN}   📁 기존 프로젝트 모드${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 필수 에이전트만 사용 (간소화된 워크플로우)
AGENTS=(
    "orchestrator"
    "developer"
    "reviewer"
    "documenter"
)

# 1. 워크스페이스 디렉토리 생성
echo -e "${YELLOW}[1/4]${NC} 워크스페이스 초기화 중..."
bash "$SCRIPT_DIR/scripts/setup-workspace.sh"
echo -e "${GREEN}✓${NC} 워크스페이스 준비 완료"
echo ""

# 2. 에이전트 환경 설정
echo -e "${YELLOW}[2/4]${NC} 에이전트 환경 설정 중..."
bash "$SCRIPT_DIR/scripts/setup-agents.sh"
echo -e "${GREEN}✓${NC} 에이전트 준비 완료"
echo ""

# 3. 기존 세션 정리
echo -e "${YELLOW}[3/4]${NC} 기존 세션 정리 중..."
bash "$SCRIPT_DIR/scripts/cleanup-sessions.sh"
echo -e "${GREEN}✓${NC} 정리 완료"
echo ""

# 4. 필수 에이전트만 시작
echo -e "${YELLOW}[4/4]${NC} 필수 에이전트 세션 시작 중..."

AGENTS_DIR="$WORKSPACE/agents"

for agent in "${AGENTS[@]}"; do
    AGENT_DIR="$AGENTS_DIR/$agent"

    # tmux 세션 생성
    tmux new-session -d -s "$agent" -c "$AGENT_DIR"

    # claude 명령어를 시스템 프롬프트와 함께 실행
    tmux send-keys -t "$agent:0" "claude --system-prompt \"\$(cat CLAUDE.md)\"" Enter

    echo "  ✓ $agent 세션 시작"
    sleep 0.3
done

echo -e "${GREEN}✓${NC} 에이전트 세션 시작 완료"
echo ""

# 상태 확인
SESSIONS=$(tmux list-sessions 2>/dev/null | grep -E "(orchestrator|developer|reviewer|documenter)" | wc -l | tr -d ' ')

if [ "$SESSIONS" -eq 4 ]; then
    echo -e "${GREEN}✓${NC} 4개 에이전트 세션 모두 실행 중"
else
    echo -e "${RED}✗${NC} 경고: $SESSIONS/4 세션만 실행 중"
fi
echo ""

# 시스템 정보 출력
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}기존 프로젝트 모드가 준비되었습니다!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📍 활성 세션 (4개만 사용):"
for agent in "${AGENTS[@]}"; do
    echo "  - $agent"
done
echo ""
echo -e "${YELLOW}이 모드는 다음 작업에 적합합니다:${NC}"
echo "  - 기능 추가"
echo "  - 버그 수정"
echo "  - 리팩토링"
echo "  - 코드 개선"
echo ""
echo -e "${YELLOW}오케스트레이터에 접속 후:${NC}"
echo "  1. 기존 프로젝트 경로를 입력하세요"
echo "  2. 수행할 작업을 설명하세요"
echo ""
echo -e "${YELLOW}다음 명령어로 오케스트레이터에 접속하세요:${NC}"
echo -e "  ${GREEN}tmux attach-session -t orchestrator${NC}"
echo ""
echo -e "${YELLOW}모든 세션 종료:${NC}"
echo -e "  ${GREEN}bash scripts/stop-all.sh${NC}"
echo ""

# 오케스트레이터 세션으로 자동 접속
echo -e "${BLUE}5초 후 오케스트레이터 세션에 자동 접속합니다...${NC}"
echo "(Ctrl+C로 취소 가능)"
sleep 5

tmux attach-session -t orchestrator
