#!/bin/bash

# =============================================================================
# Multi-Agent System - Main Entry Point
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$SCRIPT_DIR/scripts"
PACKAGES_DIR="$SCRIPT_DIR/packages"
CONFIG_FILE="$SCRIPT_DIR/config.sh"

# Load configuration
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# Default values if config not loaded
DASHBOARD_PORT=${DASHBOARD_PORT:-8080}

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------

clear_screen() {
    clear
}

print_header() {
    echo -e "${CYAN}"
    echo "  ╔══════════════════════════════════════════════════════════════╗"
    echo "  ║                                                              ║"
    echo "  ║          ${BOLD}Multi-Agent Development System${NC}${CYAN}                     ║"
    echo "  ║                                                              ║"
    echo "  ╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo -e "${BOLD}  메인 메뉴${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} 터미널 실행"
    echo -e "  ${GREEN}2)${NC} 터미널 실행 ${RED}(Full-Auto)${NC}"
    echo -e "  ${GREEN}3)${NC} 웹 대시보드 실행"
    echo -e "  ${GREEN}4)${NC} 웹 대시보드 실행 ${RED}(Full-Auto)${NC}"
    echo ""
    echo -e "  ${YELLOW}5)${NC} 설정"
    echo -e "  ${YELLOW}6)${NC} 세션 상태 확인"
    echo ""
    echo -e "  ${BLUE}0)${NC} 종료"
    echo ""
}

press_enter() {
    echo ""
    echo -e "${CYAN}계속하려면 Enter를 누르세요...${NC}"
    read -r
}

confirm_auto_mode() {
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}   ⚠️  Full-Auto 모드 경고${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}이 모드는 모든 권한 확인을 건너뜁니다.${NC}"
    echo -e "${YELLOW}에이전트가 파일을 자동으로 생성/수정/삭제할 수 있습니다.${NC}"
    echo ""
    echo -n "계속하시겠습니까? (yes/no): "
    read -r confirm
    if [ "$confirm" = "yes" ]; then
        return 0
    else
        return 1
    fi
}

# -----------------------------------------------------------------------------
# Session Status Check
# -----------------------------------------------------------------------------

get_running_sessions() {
    tmux list-sessions 2>/dev/null | grep -E "(orchestrator|requirement-analyst|ux-designer|tech-architect|planner|test-designer|developer|reviewer|documenter)" | wc -l | tr -d ' '
}

is_dashboard_running() {
    lsof -i :$DASHBOARD_PORT &>/dev/null
}

get_session_mode() {
    # Check if sessions are running
    local sessions=$(get_running_sessions)
    if [ "$sessions" -eq 0 ]; then
        echo "none"
        return
    fi

    # Check if dashboard is running
    if is_dashboard_running; then
        echo "dashboard"
    else
        echo "terminal"
    fi
}

# -----------------------------------------------------------------------------
# Check Dependencies
# -----------------------------------------------------------------------------

check_dependencies() {
    local missing=()

    command -v node &>/dev/null || missing+=("node")
    command -v tmux &>/dev/null || missing+=("tmux")
    command -v claude &>/dev/null || missing+=("claude")

    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "${RED}필수 의존성이 설치되지 않았습니다:${NC}"
        for dep in "${missing[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "먼저 의존성을 설치해주세요:"
        echo "  node/npm: brew install node"
        echo "  tmux: brew install tmux"
        echo "  claude: npm install -g @anthropic-ai/claude-code"
        exit 1
    fi
}

# -----------------------------------------------------------------------------
# Setup Functions
# -----------------------------------------------------------------------------

run_setup() {
    echo -e "${BLUE}[1/4]${NC} 워크스페이스 초기화..."
    bash "$SCRIPTS_DIR/setup-workspace.sh"

    echo -e "${BLUE}[2/4]${NC} 이전 작업 정리..."
    bash "$SCRIPTS_DIR/clean-workspace.sh"

    echo -e "${BLUE}[3/4]${NC} 에이전트 설정..."
    bash "$SCRIPTS_DIR/setup-agents.sh"

    echo -e "${BLUE}[4/4]${NC} 기존 세션 정리..."
    bash "$SCRIPTS_DIR/cleanup-sessions.sh"
}

# -----------------------------------------------------------------------------
# Running Session Monitor
# -----------------------------------------------------------------------------

show_session_monitor() {
    local mode=$1  # "terminal" or "dashboard"

    while true; do
        clear_screen
        print_header

        local sessions=$(get_running_sessions)
        local dashboard_status="종료됨"
        if is_dashboard_running; then
            dashboard_status="${GREEN}실행 중${NC} (http://localhost:$DASHBOARD_PORT)"
        fi

        echo -e "${BOLD}  세션 상태 모니터${NC}"
        echo ""
        echo -e "  ${CYAN}모드:${NC} $( [ "$mode" = "dashboard" ] && echo "웹 대시보드" || echo "터미널" )"
        echo -e "  ${CYAN}에이전트 세션:${NC} ${GREEN}$sessions${NC}/9 실행 중"
        if [ "$mode" = "dashboard" ]; then
            echo -e "  ${CYAN}대시보드:${NC} $dashboard_status"
        fi
        echo ""

        # Show agent status summary
        echo -e "  ${CYAN}에이전트 상태:${NC}"
        local agents=("orchestrator" "requirement-analyst" "ux-designer" "tech-architect" "planner" "test-designer" "developer" "reviewer" "documenter")
        for agent in "${agents[@]}"; do
            if tmux has-session -t "$agent" 2>/dev/null; then
                local status_file="$SCRIPT_DIR/workspace/status/${agent}.status"
                local status="idle"
                if [ -f "$status_file" ]; then
                    status=$(cat "$status_file" 2>/dev/null || echo "idle")
                fi
                if [ "$status" = "working" ]; then
                    echo -e "    ${GREEN}●${NC} $agent ${YELLOW}[작업중]${NC}"
                else
                    echo -e "    ${GREEN}●${NC} $agent"
                fi
            else
                echo -e "    ${RED}○${NC} $agent ${RED}[종료됨]${NC}"
            fi
        done

        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        if [ "$mode" = "terminal" ]; then
            echo -e "  ${GREEN}1)${NC} Orchestrator 세션 접속"
            echo -e "  ${GREEN}2)${NC} 모든 에이전트 보기 (3x3 그리드)"
        fi
        echo -e "  ${YELLOW}s)${NC} 상태 새로고침"
        echo -e "  ${RED}q)${NC} 세션 종료 및 메인 메뉴로"
        echo ""
        echo -n "  선택: "

        # Read with timeout for auto-refresh
        if read -t 10 -r choice; then
            case $choice in
                1)
                    if [ "$mode" = "terminal" ]; then
                        tmux attach-session -t orchestrator 2>/dev/null || echo -e "${RED}Orchestrator 세션이 없습니다${NC}"
                    fi
                    ;;
                2)
                    if [ "$mode" = "terminal" ]; then
                        bash "$SCRIPTS_DIR/view-all-agents.sh"
                    fi
                    ;;
                s|S)
                    # Just refresh (loop continues)
                    ;;
                q|Q)
                    stop_all_sessions_silent
                    return
                    ;;
            esac
        fi
        # Auto-refresh on timeout
    done
}

# -----------------------------------------------------------------------------
# Terminal Mode
# -----------------------------------------------------------------------------

run_terminal() {
    local auto_mode=$1

    clear_screen
    echo -e "${GREEN}터미널 모드 시작...${NC}"
    echo ""

    run_setup

    echo ""
    echo -e "${GREEN}에이전트 세션 시작...${NC}"

    if [ "$auto_mode" = "true" ]; then
        bash "$SCRIPTS_DIR/start-sessions-auto.sh"
    else
        bash "$SCRIPTS_DIR/start-sessions.sh"
    fi

    # 세션 확인
    sleep 2
    SESSIONS=$(get_running_sessions)

    echo ""
    if [ "$SESSIONS" -eq 9 ]; then
        echo -e "${GREEN}✓ 모든 에이전트 세션이 시작되었습니다 (9/9)${NC}"
    else
        echo -e "${YELLOW}⚠ $SESSIONS/9 세션이 시작되었습니다${NC}"
    fi

    sleep 2

    # Show session monitor instead of attaching directly
    show_session_monitor "terminal"
}

# -----------------------------------------------------------------------------
# Dashboard Mode
# -----------------------------------------------------------------------------

run_dashboard() {
    local auto_mode=$1

    clear_screen
    echo -e "${GREEN}웹 대시보드 모드 시작...${NC}"
    echo ""

    run_setup

    echo ""
    echo -e "${GREEN}에이전트 세션 시작...${NC}"

    if [ "$auto_mode" = "true" ]; then
        bash "$SCRIPTS_DIR/start-sessions-auto.sh"
    else
        bash "$SCRIPTS_DIR/start-sessions.sh"
    fi

    # ttyd 확인
    if ! command -v ttyd &>/dev/null; then
        echo ""
        echo -e "${RED}ttyd가 설치되지 않았습니다.${NC}"
        echo "설치: brew install ttyd"
        press_enter
        return
    fi

    echo ""
    echo -e "${GREEN}대시보드 서버 시작...${NC}"

    # Export config for server.js
    export MAS_ROOT="$SCRIPT_DIR"

    cd "$PACKAGES_DIR/dashboard"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "npm 의존성 설치 중..."
        npm install --silent
    fi

    # Start dashboard
    bash ./start-dashboard.sh

    cd "$SCRIPT_DIR"

    sleep 2

    # Show session monitor
    show_session_monitor "dashboard"
}

# -----------------------------------------------------------------------------
# Settings Menu
# -----------------------------------------------------------------------------

show_settings() {
    while true; do
        clear_screen
        print_header

        echo -e "${BOLD}  설정${NC}"
        echo ""
        echo -e "  ${GREEN}1)${NC} 에이전트별 모델 설정"
        echo -e "  ${GREEN}2)${NC} 대시보드 포트 설정"
        echo -e "  ${GREEN}3)${NC} 현재 설정 보기"
        echo ""
        echo -e "  ${BLUE}0)${NC} 메인 메뉴로 돌아가기"
        echo ""
        echo -n "  선택: "
        read -r choice

        case $choice in
            1) configure_models ;;
            2) configure_dashboard_port ;;
            3) show_current_config ;;
            0) return ;;
            *) echo -e "${RED}잘못된 선택입니다${NC}"; sleep 1 ;;
        esac
    done
}

configure_models() {
    clear_screen
    echo -e "${BOLD}에이전트별 모델 설정${NC}"
    echo ""
    echo "사용 가능한 모델: opus, sonnet, haiku"
    echo ""
    echo "현재 설정:"
    echo ""

    # Read current models from config
    local agents=("orchestrator" "requirement-analyst" "ux-designer" "tech-architect" "planner" "test-designer" "developer" "reviewer" "documenter")

    local i=1
    for agent in "${agents[@]}"; do
        local var_name="MODEL_${agent//-/_}"
        local model=$(grep "^${var_name}=" "$CONFIG_FILE" 2>/dev/null | sed 's/.*="\([^"]*\)".*/\1/' || echo "opus")
        echo "  $i) $agent: $model"
        ((i++))
    done

    echo ""
    echo "변경할 에이전트 번호를 입력하세요 (0: 취소, a: 전체 변경): "
    read -r choice

    if [ "$choice" = "0" ]; then
        return
    elif [ "$choice" = "a" ]; then
        echo ""
        echo "모든 에이전트에 적용할 모델 (opus/sonnet/haiku): "
        read -r new_model

        if [[ "$new_model" =~ ^(opus|sonnet|haiku)$ ]]; then
            for agent in "${agents[@]}"; do
                local var_name="MODEL_${agent//-/_}"
                sed -i '' "s/^${var_name}=.*/${var_name}=\"${new_model}\"/" "$CONFIG_FILE"
            done
            echo -e "${GREEN}모든 에이전트 모델이 $new_model 로 변경되었습니다${NC}"
        else
            echo -e "${RED}잘못된 모델입니다${NC}"
        fi
    elif [[ "$choice" =~ ^[1-9]$ ]] && [ "$choice" -le "${#agents[@]}" ]; then
        local agent="${agents[$((choice-1))]}"
        local var_name="MODEL_${agent//-/_}"
        echo ""
        echo "$agent 의 새 모델 (opus/sonnet/haiku): "
        read -r new_model

        if [[ "$new_model" =~ ^(opus|sonnet|haiku)$ ]]; then
            sed -i '' "s/^${var_name}=.*/${var_name}=\"${new_model}\"/" "$CONFIG_FILE"
            echo -e "${GREEN}$agent 모델이 $new_model 로 변경되었습니다${NC}"
        else
            echo -e "${RED}잘못된 모델입니다${NC}"
        fi
    fi

    press_enter
}

configure_dashboard_port() {
    clear_screen
    echo -e "${BOLD}대시보드 포트 설정${NC}"
    echo ""
    echo "현재 포트: $DASHBOARD_PORT"
    echo ""
    echo "새 포트 번호 (1024-65535, 0: 취소): "
    read -r new_port

    if [ "$new_port" = "0" ]; then
        return
    elif [[ "$new_port" =~ ^[0-9]+$ ]] && [ "$new_port" -ge 1024 ] && [ "$new_port" -le 65535 ]; then
        sed -i '' "s/DASHBOARD_PORT=.*/DASHBOARD_PORT=$new_port/" "$CONFIG_FILE"
        DASHBOARD_PORT=$new_port
        echo -e "${GREEN}대시보드 포트가 $new_port 로 변경되었습니다${NC}"
    else
        echo -e "${RED}잘못된 포트 번호입니다${NC}"
    fi

    press_enter
}

show_current_config() {
    clear_screen
    echo -e "${BOLD}현재 설정${NC}"
    echo ""

    local agents=("orchestrator" "requirement-analyst" "ux-designer" "tech-architect" "planner" "test-designer" "developer" "reviewer" "documenter")

    echo -e "${CYAN}에이전트 모델:${NC}"
    for agent in "${agents[@]}"; do
        local var_name="MODEL_${agent//-/_}"
        local model=$(grep "^${var_name}=" "$CONFIG_FILE" 2>/dev/null | sed 's/.*="\([^"]*\)".*/\1/' || echo "opus")
        echo "  $agent: $model"
    done
    echo ""
    echo -e "${CYAN}대시보드 설정:${NC}"
    echo "  포트: $DASHBOARD_PORT"
    echo ""

    press_enter
}

# -----------------------------------------------------------------------------
# Session Management
# -----------------------------------------------------------------------------

stop_all_sessions_silent() {
    echo ""
    echo -e "${YELLOW}모든 세션을 종료합니다...${NC}"

    bash "$SCRIPTS_DIR/stop-all.sh" 2>/dev/null || true

    # Also stop dashboard if running
    local dashboard_pid=$(lsof -ti :$DASHBOARD_PORT 2>/dev/null || true)
    if [ -n "$dashboard_pid" ]; then
        echo "대시보드 서버 종료..."
        kill $dashboard_pid 2>/dev/null || true
    fi

    # Stop ttyd processes
    pkill -f "ttyd.*768[1-9]" 2>/dev/null || true

    echo -e "${GREEN}모든 세션이 종료되었습니다${NC}"
    sleep 1
}

stop_all_sessions() {
    clear_screen
    stop_all_sessions_silent
    press_enter
}

show_session_status() {
    clear_screen
    print_header

    echo -e "${BOLD}  세션 상태${NC}"
    echo ""

    local sessions=$(get_running_sessions)
    echo -e "  ${CYAN}에이전트 세션:${NC} $sessions/9 실행 중"

    if is_dashboard_running; then
        echo -e "  ${CYAN}대시보드:${NC} ${GREEN}실행 중${NC} (http://localhost:$DASHBOARD_PORT)"
    else
        echo -e "  ${CYAN}대시보드:${NC} 종료됨"
    fi

    echo ""
    echo -e "  ${CYAN}에이전트 상태:${NC}"
    local agents=("orchestrator" "requirement-analyst" "ux-designer" "tech-architect" "planner" "test-designer" "developer" "reviewer" "documenter")
    for agent in "${agents[@]}"; do
        if tmux has-session -t "$agent" 2>/dev/null; then
            local status_file="$SCRIPT_DIR/workspace/status/${agent}.status"
            local status="idle"
            if [ -f "$status_file" ]; then
                status=$(cat "$status_file" 2>/dev/null || echo "idle")
            fi
            if [ "$status" = "working" ]; then
                echo -e "    ${GREEN}●${NC} $agent ${YELLOW}[작업중]${NC}"
            else
                echo -e "    ${GREEN}●${NC} $agent"
            fi
        else
            echo -e "    ${RED}○${NC} $agent"
        fi
    done

    press_enter
}

# -----------------------------------------------------------------------------
# First-time Setup
# -----------------------------------------------------------------------------

first_time_setup() {
    echo -e "${BLUE}[설치]${NC} 필요한 의존성을 확인합니다..."
    echo ""

    local missing=()

    if ! command -v node &>/dev/null; then
        missing+=("Node.js: brew install node")
    else
        echo -e "  ${GREEN}✓${NC} Node.js: $(node --version)"
    fi

    if ! command -v tmux &>/dev/null; then
        missing+=("tmux: brew install tmux")
    else
        echo -e "  ${GREEN}✓${NC} tmux: $(tmux -V)"
    fi

    if ! command -v claude &>/dev/null; then
        missing+=("Claude CLI: npm install -g @anthropic-ai/claude-code")
    else
        echo -e "  ${GREEN}✓${NC} Claude CLI: 설치됨"
    fi

    if ! command -v ttyd &>/dev/null; then
        echo -e "  ${YELLOW}!${NC} ttyd: 미설치 (대시보드 사용시 필요)"
        echo "      brew install ttyd"
    else
        echo -e "  ${GREEN}✓${NC} ttyd: 설치됨"
    fi

    if [ ${#missing[@]} -gt 0 ]; then
        echo ""
        echo -e "${RED}다음 의존성을 먼저 설치해주세요:${NC}"
        for dep in "${missing[@]}"; do
            echo "  $dep"
        done
        exit 1
    fi

    echo ""
    echo -e "${BLUE}[설치]${NC} 대시보드 의존성 설치 중..."
    cd "$PACKAGES_DIR/dashboard"
    npm install --silent 2>/dev/null || npm install

    echo ""
    echo -e "${GREEN}설치 완료!${NC}"
}

# -----------------------------------------------------------------------------
# Main Menu Loop
# -----------------------------------------------------------------------------

main_menu() {
    check_dependencies

    while true; do
        # Check if sessions are already running
        local mode=$(get_session_mode)

        if [ "$mode" != "none" ]; then
            # Sessions are running, show monitor
            show_session_monitor "$mode"
            continue
        fi

        # No sessions running, show main menu
        clear_screen
        print_header
        print_menu

        echo -n "  선택: "
        read -r choice

        case $choice in
            1)
                run_terminal "false"
                ;;
            2)
                if confirm_auto_mode; then
                    run_terminal "true"
                fi
                ;;
            3)
                run_dashboard "false"
                ;;
            4)
                if confirm_auto_mode; then
                    run_dashboard "true"
                fi
                ;;
            5)
                show_settings
                ;;
            6)
                show_session_status
                ;;
            0)
                clear_screen
                echo -e "${GREEN}안녕히 가세요!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}잘못된 선택입니다${NC}"
                sleep 1
                ;;
        esac
    done
}

# -----------------------------------------------------------------------------
# Entry Point
# -----------------------------------------------------------------------------

case "${1:-}" in
    --setup)
        first_time_setup
        ;;
    --stop)
        check_dependencies
        stop_all_sessions
        ;;
    --status)
        check_dependencies
        clear_screen
        echo -e "${BOLD}세션 상태${NC}"
        echo ""
        local sessions=$(get_running_sessions)
        echo -e "에이전트 세션: $sessions/9"
        if is_dashboard_running; then
            echo -e "대시보드: ${GREEN}실행 중${NC} (포트 $DASHBOARD_PORT)"
        else
            echo -e "대시보드: ${RED}종료됨${NC}"
        fi
        ;;
    --help|-h)
        echo "Multi-Agent Development System"
        echo ""
        echo "사용법: ./run.sh [옵션]"
        echo ""
        echo "옵션:"
        echo "  (없음)    메뉴 화면 표시"
        echo "  --setup   의존성 설치"
        echo "  --stop    모든 세션 종료"
        echo "  --status  세션 상태 확인"
        echo "  --help    이 도움말 표시"
        ;;
    *)
        main_menu
        ;;
esac
