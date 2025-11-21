#!/bin/bash

# Multi-Agent Development System Launcher
# 모든 에이전트 세션을 초기화하고 시작합니다

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="$SCRIPT_DIR/workspace"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Multi-Agent Development System${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. 워크스페이스 디렉토리 생성
echo -e "${YELLOW}[1/5]${NC} 워크스페이스 초기화 중..."
bash "$SCRIPT_DIR/scripts/setup-workspace.sh"
echo -e "${GREEN}✓${NC} 워크스페이스 준비 완료"
echo ""

# 2. 각 에이전트 디렉토리 및 CLAUDE.md 생성
echo -e "${YELLOW}[2/5]${NC} 에이전트 환경 설정 중..."
bash "$SCRIPT_DIR/scripts/setup-agents.sh"
echo -e "${GREEN}✓${NC} 모든 에이전트 준비 완료"
echo ""

# 3. 기존 tmux 세션 정리
echo -e "${YELLOW}[3/5]${NC} 기존 세션 정리 중..."
bash "$SCRIPT_DIR/scripts/cleanup-sessions.sh"
echo -e "${GREEN}✓${NC} 정리 완료"
echo ""

# 4. 모든 에이전트 tmux 세션 시작
echo -e "${YELLOW}[4/5]${NC} 에이전트 세션 시작 중..."
bash "$SCRIPT_DIR/scripts/start-sessions.sh"
echo -e "${GREEN}✓${NC} 모든 세션 시작 완료"
echo ""

# 5. 상태 확인
echo -e "${YELLOW}[5/5]${NC} 시스템 상태 확인 중..."
sleep 2

SESSIONS=$(tmux list-sessions 2>/dev/null | grep -E "(orchestrator|requirement-analyst|ux-designer|tech-architect|planner|test-designer|developer|reviewer|documenter)" | wc -l)

if [ "$SESSIONS" -eq 9 ]; then
    echo -e "${GREEN}✓${NC} 9개 에이전트 세션 모두 실행 중"
else
    echo -e "${RED}✗${NC} 경고: $SESSIONS/9 세션만 실행 중"
fi
echo ""

# 시스템 정보 출력
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}시스템이 준비되었습니다!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📍 활성 세션:"
tmux list-sessions 2>/dev/null | grep -E "(orchestrator|requirement-analyst|ux-designer|tech-architect|planner|test-designer|developer|reviewer|documenter)" || echo "세션 없음"
echo ""
echo -e "${YELLOW}다음 명령어로 오케스트레이터에 접속하세요:${NC}"
echo -e "  ${GREEN}tmux attach-session -t orchestrator${NC}"
echo ""
echo -e "${YELLOW}모든 에이전트를 한 화면에 표시:${NC}"
echo -e "  ${GREEN}bash scripts/view-all-agents.sh${NC}"
echo "  (9개 에이전트를 3x3 그리드로 실시간 모니터링)"
echo ""
echo -e "${YELLOW}접속 후 사용법:${NC}"
echo "  1. Claude가 로드되면 아무 메시지나 입력하세요 (예: 'hello' 또는 'start')"
echo "  2. 오케스트레이터가 환영 메시지를 출력하고 프로젝트 설명을 요청합니다"
echo "  3. 프로젝트 설명을 입력하면 개발 프로세스가 시작됩니다"
echo ""
echo -e "${YELLOW}세션 간 이동:${NC}"
echo "  - 세션 나가기 (detach): Ctrl+B, 그 다음 D"
echo "  - 다른 세션 접속: tmux attach-session -t <agent-name>"
echo "  - Pane 확대/축소: Ctrl+B, z (전체화면 토글)"
echo ""
echo -e "${YELLOW}모든 세션 종료:${NC}"
echo -e "  ${GREEN}bash scripts/stop-all.sh${NC}"
echo ""

# 오케스트레이터 세션으로 자동 접속
echo -e "${BLUE}5초 후 오케스트레이터 세션에 자동 접속합니다...${NC}"
echo "(Ctrl+C로 취소 가능)"
sleep 5

tmux attach-session -t orchestrator
