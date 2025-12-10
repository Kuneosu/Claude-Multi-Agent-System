#!/bin/bash

# =============================================================================
# Multi-Agent Terminal Dashboard - Start Script
# =============================================================================
# This script starts ttyd instances for all 9 agents
# Each ttyd connects to its corresponding tmux session
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

# Check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        return 1
    fi
    return 0
}

# Check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is in use
    fi
    return 1  # Port is free
}

# Check if tmux session exists
check_tmux_session() {
    local session=$1
    if tmux has-session -t "$session" 2>/dev/null; then
        return 0  # Session exists
    fi
    return 1  # Session doesn't exist
}

# =============================================================================
# Pre-flight Checks
# =============================================================================

preflight_checks() {
    log_info "Running pre-flight checks..."

    # Check required commands
    local missing_deps=()

    if ! check_command "ttyd"; then
        missing_deps+=("ttyd (brew install ttyd)")
    fi

    if ! check_command "tmux"; then
        missing_deps+=("tmux (brew install tmux)")
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

    # Check for port conflicts
    local port_conflicts=()
    for agent_config in "${AGENTS[@]}"; do
        IFS=':' read -r name port session <<< "$agent_config"
        if check_port $port; then
            port_conflicts+=("$port ($name)")
        fi
    done

    if [ ${#port_conflicts[@]} -gt 0 ]; then
        log_warning "Ports already in use:"
        for conflict in "${port_conflicts[@]}"; do
            echo "  - Port $conflict"
        done
        echo ""
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    # Check tmux sessions
    local missing_sessions=()
    for agent_config in "${AGENTS[@]}"; do
        IFS=':' read -r name port session <<< "$agent_config"
        if ! check_tmux_session "$session"; then
            missing_sessions+=("$session")
        fi
    done

    if [ ${#missing_sessions[@]} -gt 0 ]; then
        log_warning "Missing tmux sessions:"
        for session in "${missing_sessions[@]}"; do
            echo "  - $session"
        done
        echo ""
        log_info "Creating missing sessions..."
        for session in "${missing_sessions[@]}"; do
            tmux new-session -d -s "$session"
            # Disable mouse mode for terminal scrollback
            tmux set-option -t "$session" mouse off
            log_success "Created session: $session (mouse off)"
        done
    fi

    # Disable mouse mode for all existing sessions (for scrollback)
    log_info "Disabling tmux mouse mode for scrollback support..."
    for agent_config in "${AGENTS[@]}"; do
        IFS=':' read -r name port session <<< "$agent_config"
        if tmux has-session -t "$session" 2>/dev/null; then
            tmux set-option -t "$session" mouse off 2>/dev/null || true
        fi
    done
    log_success "Mouse mode disabled for all sessions"

    log_success "Pre-flight checks complete"
}

# =============================================================================
# Start ttyd Instances
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

        # Start ttyd (bind to all interfaces for localhost access)
        # Redirect output to /dev/null to suppress verbose logs
        ttyd --port $port \
             --writable \
             tmux attach-session -t "$session" > /dev/null 2>&1 &

        local pid=$!
        echo "$pid:$name:$port" >> "$PID_FILE"

        log_success "Started $name on port $port (PID: $pid)"
        ((started++))

        # Small delay to avoid race conditions
        sleep 0.2
    done

    echo ""
    log_info "Started: $started, Skipped: $skipped"
}

# =============================================================================
# Start Node.js Proxy Server for Dashboard
# =============================================================================

start_http_server() {
    if check_port $DASHBOARD_PORT; then
        log_warning "Dashboard port $DASHBOARD_PORT already in use, skipping HTTP server"
        return
    fi

    log_info "Starting Node.js proxy server for dashboard..."

    # Use Node.js proxy server (same-origin for iframe access)
    if command -v node &> /dev/null; then
        cd "$SCRIPT_DIR"

        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            log_info "Installing npm dependencies..."
            npm install --silent
        fi

        node server.js 2>/dev/null &
        local pid=$!
        echo "$pid:dashboard:$DASHBOARD_PORT" >> "$PID_FILE"
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
    echo "========================================"
    echo "  Multi-Agent Terminal Dashboard"
    echo "========================================"
    echo ""

    preflight_checks
    echo ""

    start_ttyd_instances
    echo ""

    start_http_server
    echo ""

    echo "========================================"
    echo -e "${GREEN}Dashboard is ready!${NC}"
    echo "========================================"
    echo ""
    echo "Open in browser: http://localhost:$DASHBOARD_PORT"
    echo ""
    echo "Agent terminals available at:"
    for agent_config in "${AGENTS[@]}"; do
        IFS=':' read -r name port session <<< "$agent_config"
        echo "  - $name: http://localhost:$port"
    done
    echo ""
    ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
    echo "To stop: $ROOT_DIR/stop.sh"
    echo ""
}

# Run main
main "$@"
