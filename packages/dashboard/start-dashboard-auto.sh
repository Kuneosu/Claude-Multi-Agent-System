#!/bin/bash

# =============================================================================
# Multi-Agent Terminal Dashboard - Auto Start Script
# =============================================================================
# This script:
# 1. Initializes workspace
# 2. Sets up agents
# 3. Starts tmux sessions with Claude Code (auto mode)
# 4. Starts ttyd instances for web terminals
# 5. Starts dashboard HTTP server
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory (dashboard project)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Root directory of multi-agent-system (packages/dashboard -> root)
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
WORKSPACE="$ROOT_DIR/workspace"
AGENTS_DIR="$WORKSPACE/agents"

# Agent configurations: "name:port:tmux_session"
AGENTS=(
    "orchestrator:7681:orchestrator"
    "requirement-analyst:7682:requirement-analyst"
    "ux-designer:7683:ux-designer"
    "tech-architect:7684:tech-architect"
    "planner:7685:planner"
    "test-designer:7686:test-designer"
    "developer:7687:developer"
    "reviewer:7688:reviewer"
    "documenter:7689:documenter"
)

# Dashboard port
DASHBOARD_PORT=8080

# PID file for tracking started processes
PID_FILE="${SCRIPT_DIR}/.dashboard.pids"

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        return 1
    fi
    return 0
}

check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is in use
    fi
    return 1  # Port is free
}

# =============================================================================
# Pre-flight Checks
# =============================================================================

preflight_checks() {
    log_info "Running pre-flight checks..."

    local missing_deps=()

    if ! check_command "ttyd"; then
        missing_deps+=("ttyd (brew install ttyd)")
    fi

    if ! check_command "tmux"; then
        missing_deps+=("tmux (brew install tmux)")
    fi

    if ! check_command "claude"; then
        missing_deps+=("claude (Claude Code CLI)")
    fi

    if ! check_command "node"; then
        missing_deps+=("node (brew install node)")
    fi

    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        exit 1
    fi

    log_success "All dependencies installed"
}

# =============================================================================
# Step 1: Initialize Workspace
# =============================================================================

init_workspace() {
    log_info "Initializing workspace..."

    if [ -f "$ROOT_DIR/scripts/setup-workspace.sh" ]; then
        bash "$ROOT_DIR/scripts/setup-workspace.sh"
        log_success "Workspace initialized"
    else
        log_warning "setup-workspace.sh not found, skipping"
    fi
}

# =============================================================================
# Step 2: Clean Previous Workspace
# =============================================================================

clean_workspace() {
    log_info "Cleaning previous workspace..."

    if [ -f "$ROOT_DIR/scripts/clean-workspace.sh" ]; then
        bash "$ROOT_DIR/scripts/clean-workspace.sh"
        log_success "Workspace cleaned"
    else
        log_warning "clean-workspace.sh not found, skipping"
    fi
}

# =============================================================================
# Step 3: Setup Agents
# =============================================================================

setup_agents() {
    log_info "Setting up agents..."

    if [ -f "$ROOT_DIR/scripts/setup-agents.sh" ]; then
        bash "$ROOT_DIR/scripts/setup-agents.sh"
        log_success "Agents setup complete"
    else
        log_warning "setup-agents.sh not found, skipping"
    fi
}

# =============================================================================
# Step 4: Cleanup Existing Sessions
# =============================================================================

cleanup_sessions() {
    log_info "Cleaning up existing sessions..."

    local agent_names=("orchestrator" "requirement-analyst" "ux-designer" "tech-architect" "planner" "test-designer" "developer" "reviewer" "documenter")

    for agent in "${agent_names[@]}"; do
        if tmux has-session -t "$agent" 2>/dev/null; then
            tmux kill-session -t "$agent" 2>/dev/null || true
            log_success "Killed existing session: $agent"
        fi
    done

    log_success "Cleanup complete"
}

# =============================================================================
# Step 5: Start Agent Sessions with Claude Code (Auto Mode)
# =============================================================================

start_agent_sessions() {
    log_info "Starting agent sessions with Claude Code (auto mode)..."

    local agent_names=("orchestrator" "requirement-analyst" "ux-designer" "tech-architect" "planner" "test-designer" "developer" "reviewer" "documenter")

    for agent in "${agent_names[@]}"; do
        AGENT_DIR="$AGENTS_DIR/$agent"

        # Create tmux session
        tmux new-session -d -s "$agent" -c "$AGENT_DIR"

        # Disable mouse mode for terminal scrollback
        tmux set-option -t "$agent" mouse off

        # Send Claude command with auto mode
        tmux send-keys -t "$agent:0" "claude --dangerously-skip-permissions --model opus --append-system-prompt \"\$(cat CLAUDE.md)\""
        sleep 0.2
        tmux send-keys -t "$agent:0" C-m

        log_success "Started $agent session (auto mode, mouse off)"
        sleep 0.3
    done

    log_success "All agent sessions started"
}

# =============================================================================
# Step 5.5: Initialize Orchestrator with Dispatcher Prompt
# =============================================================================

init_orchestrator_prompt() {
    log_info "Sending initial dispatcher prompt to orchestrator..."

    sleep 2  # Wait for claude to fully start

    local INIT_MESSAGE="당신은 디스패처(Dispatcher)입니다. 사용자의 프로젝트 요청을 받으면, 절대 직접 코드를 작성하지 말고 반드시 전문 에이전트들(requirement-analyst, ux-designer, tech-architect, planner, test-designer, developer, reviewer, documenter)에게 tmux를 통해 작업을 위임하세요. 각 에이전트에게 작업 지시 시 반드시 status 파일을 working/idle로 업데이트하고, 시그널 대기를 수행하세요."

    tmux send-keys -t "orchestrator:0" "$INIT_MESSAGE"
    sleep 0.3
    tmux send-keys -t "orchestrator:0" C-m

    log_success "Orchestrator initial dispatcher prompt sent"
}

# =============================================================================
# Step 6: Start ttyd Instances
# =============================================================================

start_ttyd_instances() {
    log_info "Starting ttyd instances..."

    # Clear old PID file
    > "$PID_FILE"

    local started=0
    local skipped=0

    for agent_config in "${AGENTS[@]}"; do
        IFS=':' read -r name port session <<< "$agent_config"

        # Skip if port is already in use
        if check_port $port; then
            log_warning "Skipping $name - port $port already in use"
            ((skipped++))
            continue
        fi

        # Start ttyd
        ttyd --port $port \
             --writable \
             tmux attach-session -t "$session" &

        local pid=$!
        echo "$pid:$name:$port" >> "$PID_FILE"

        log_success "Started ttyd for $name on port $port (PID: $pid)"
        ((started++))

        sleep 0.2
    done

    log_info "Started: $started, Skipped: $skipped"
}

# =============================================================================
# Step 7: Start Node.js Proxy Server for Dashboard
# =============================================================================

start_http_server() {
    if check_port $DASHBOARD_PORT; then
        log_warning "Dashboard port $DASHBOARD_PORT already in use, skipping HTTP server"
        return
    fi

    log_info "Starting Node.js proxy server for dashboard..."

    if command -v node &> /dev/null; then
        cd "$SCRIPT_DIR"

        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            log_info "Installing npm dependencies..."
            npm install --silent
        fi

        node server.js &
        local pid=$!
        echo "$pid:dashboard:$DASHBOARD_PORT" >> "$PID_FILE"
        log_success "Dashboard proxy server started on port $DASHBOARD_PORT (PID: $pid)"
    else
        log_error "Node.js not found. Please install Node.js (brew install node)"
        exit 1
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}   Multi-Agent Dashboard (AUTO MODE)${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}This mode skips all permission checks.${NC}"
    echo -e "${YELLOW}Agents can create/modify/delete files without confirmation.${NC}"
    echo ""
    echo -e "${RED}Continue? (yes/no)${NC}"
    read -r CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        echo "Cancelled."
        exit 0
    fi

    echo ""
    echo -e "${BLUE}[1/7]${NC} Pre-flight checks..."
    preflight_checks
    echo ""

    echo -e "${BLUE}[2/7]${NC} Initializing workspace..."
    init_workspace
    echo ""

    echo -e "${BLUE}[3/7]${NC} Cleaning workspace..."
    clean_workspace
    echo ""

    echo -e "${BLUE}[4/7]${NC} Setting up agents..."
    setup_agents
    echo ""

    echo -e "${BLUE}[5/7]${NC} Cleaning existing sessions..."
    cleanup_sessions
    echo ""

    echo -e "${BLUE}[6/7]${NC} Starting agent sessions..."
    start_agent_sessions
    init_orchestrator_prompt
    echo ""

    echo -e "${BLUE}[7/7]${NC} Starting ttyd and dashboard..."
    start_ttyd_instances
    echo ""
    start_http_server
    echo ""

    # Verify sessions
    SESSIONS=$(tmux list-sessions 2>/dev/null | grep -E "(orchestrator|requirement-analyst|ux-designer|tech-architect|planner|test-designer|developer|reviewer|documenter)" | wc -l)

    if [ "$SESSIONS" -eq 9 ]; then
        echo -e "${GREEN}All 9 agent sessions running${NC}"
    else
        echo -e "${RED}Warning: $SESSIONS/9 sessions running${NC}"
    fi

    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Dashboard is ready!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Open in browser: http://localhost:$DASHBOARD_PORT"
    echo ""
    echo "Agent terminals available at:"
    for agent_config in "${AGENTS[@]}"; do
        IFS=':' read -r name port session <<< "$agent_config"
        echo "  - $name: http://localhost:$port"
    done
    echo ""
    echo "To stop everything: $ROOT_DIR/stop.sh"
    echo ""
}

# Run main
main "$@"
