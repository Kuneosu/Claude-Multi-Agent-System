#!/bin/bash

# =============================================================================
# Multi-Agent Terminal Dashboard - Stop Script
# =============================================================================
# This script stops:
# - All ttyd instances
# - Dashboard HTTP server
# - All agent tmux sessions
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# PID file for tracking started processes
PID_FILE="${SCRIPT_DIR}/.dashboard.pids"

# Agent list
AGENTS=(
    "orchestrator"
    "requirement-analyst"
    "ux-designer"
    "tech-architect"
    "planner"
    "test-designer"
    "developer"
    "reviewer"
    "documenter"
)

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

# =============================================================================
# Stop Processes from PID File
# =============================================================================

stop_from_pid_file() {
    if [ -f "$PID_FILE" ]; then
        log_info "Stopping processes from PID file..."

        while IFS=':' read -r pid name port; do
            if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null && \
                    log_success "Stopped $name (PID: $pid, Port: $port)" || \
                    log_warning "Could not stop $name (PID: $pid)"
            else
                log_warning "Process $name (PID: $pid) not running"
            fi
        done < "$PID_FILE"

        # Remove PID file
        rm -f "$PID_FILE"
    else
        log_info "No PID file found"
    fi
}

# =============================================================================
# Stop All ttyd Processes
# =============================================================================

stop_ttyd_processes() {
    log_info "Stopping all ttyd processes on ports 7681-7689..."

    # Find and kill ttyd processes on our ports
    local killed=0

    for port in 7681 7682 7683 7684 7685 7686 7687 7688 7689; do
        local pid=$(lsof -ti :$port 2>/dev/null)
        if [ -n "$pid" ]; then
            # Check if it's a ttyd process
            if ps -p $pid -o comm= 2>/dev/null | grep -q ttyd; then
                kill $pid 2>/dev/null && \
                    log_success "Killed ttyd on port $port (PID: $pid)" || \
                    log_warning "Could not kill process on port $port"
                ((killed++))
            fi
        fi
    done

    # Also kill any remaining ttyd processes that might be orphaned
    if pgrep -f "ttyd.*768[1-9]" > /dev/null 2>&1; then
        pkill -f "ttyd.*768[1-9]" 2>/dev/null && \
            log_success "Killed remaining ttyd processes" || \
            log_warning "Some ttyd processes could not be killed"
    fi

    if [ $killed -eq 0 ]; then
        log_info "No ttyd processes found on ports 7681-7689"
    fi
}

# =============================================================================
# Stop HTTP Server
# =============================================================================

stop_http_server() {
    log_info "Stopping HTTP server on port 8080..."

    local pid=$(lsof -ti :8080 2>/dev/null)
    if [ -n "$pid" ]; then
        # Check if it's a Python HTTP server
        if ps -p $pid -o comm= 2>/dev/null | grep -q python; then
            kill $pid 2>/dev/null && \
                log_success "Stopped HTTP server (PID: $pid)" || \
                log_warning "Could not stop HTTP server"
        fi
    else
        log_info "No HTTP server running on port 8080"
    fi
}

# =============================================================================
# Cleanup Zombie Processes
# =============================================================================

cleanup_zombies() {
    log_info "Cleaning up any zombie processes..."

    # Kill any orphaned ttyd processes
    if pgrep -x ttyd > /dev/null 2>&1; then
        local count=$(pgrep -x ttyd | wc -l)
        pkill -x ttyd 2>/dev/null && \
            log_success "Cleaned up $count orphaned ttyd process(es)" || \
            log_warning "Could not clean up some ttyd processes"
    fi
}

# =============================================================================
# Stop tmux Sessions
# =============================================================================

stop_tmux_sessions() {
    log_info "Stopping all agent tmux sessions..."

    local stopped=0

    for agent in "${AGENTS[@]}"; do
        if tmux has-session -t "$agent" 2>/dev/null; then
            tmux kill-session -t "$agent" 2>/dev/null && \
                log_success "Killed session: $agent" || \
                log_warning "Could not kill session: $agent"
            ((stopped++))
        fi
    done

    if [ $stopped -eq 0 ]; then
        log_info "No agent sessions were running"
    else
        log_success "Stopped $stopped agent session(s)"
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo ""
    echo "========================================"
    echo "  Stopping Multi-Agent Dashboard"
    echo "========================================"
    echo ""

    # 1. 먼저 모든 tmux 세션 종료 (에이전트들이 먼저 종료되어야 함)
    stop_tmux_sessions
    echo ""

    # 2. tmux 세션 종료 대기 (완전히 종료될 때까지)
    log_info "Waiting for tmux sessions to fully terminate..."
    sleep 2
    echo ""

    # 3. ttyd 프로세스 종료
    stop_ttyd_processes
    echo ""

    # 4. Cleanup any zombies
    cleanup_zombies
    echo ""

    # 5. PID 파일에서 프로세스 종료
    stop_from_pid_file
    echo ""

    # 6. 마지막으로 HTTP server 종료 (대시보드가 가장 마지막에 종료)
    stop_http_server
    echo ""

    echo "========================================"
    echo -e "${GREEN}Dashboard and all sessions stopped${NC}"
    echo "========================================"
    echo ""
}

# Run main
main "$@"
