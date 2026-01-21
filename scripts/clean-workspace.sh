#!/bin/bash

# workspace 내 작업 결과물 초기화
# agents/, project/ 폴더는 유지하고 그 외 작업 결과물만 삭제

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE="$ROOT_DIR/workspace"

echo "🧹 Workspace 초기화 중..."

# 초기화할 디렉토리 목록 (project는 제외 - 결과물 보존)
DIRS_TO_CLEAN=(
    "artifacts"
    "input"
    "signals"
    "logs"
    "src"
    "tests"
    "docs"
    "state"
    "callbacks"
)

# 각 디렉토리 내용 삭제 (디렉토리 자체는 유지)
for dir in "${DIRS_TO_CLEAN[@]}"; do
    TARGET="$WORKSPACE/$dir"
    if [ -d "$TARGET" ]; then
        rm -rf "$TARGET"/*
        echo "  ✓ $dir/ 초기화됨"
    fi
done

# tasks/ 하위 디렉토리 내용만 삭제 (에이전트별 폴더는 유지)
if [ -d "$WORKSPACE/tasks" ]; then
    for agent_task_dir in "$WORKSPACE/tasks"/*; do
        if [ -d "$agent_task_dir" ]; then
            rm -f "$agent_task_dir"/*.json 2>/dev/null
        fi
    done
    echo "  ✓ tasks/ 초기화됨"
fi

# status/ 파일들을 idle로 리셋
if [ -d "$WORKSPACE/status" ]; then
    for status_file in "$WORKSPACE/status"/*.status; do
        if [ -f "$status_file" ]; then
            echo "idle" > "$status_file"
        fi
    done
    # 프로젝트 관련 파일 삭제
    rm -f "$WORKSPACE/status/current_project.id" 2>/dev/null
    rm -f "$WORKSPACE/status/current_project.name" 2>/dev/null
    rm -f "$WORKSPACE/status/current_project.path" 2>/dev/null
    echo "  ✓ status/ 초기화됨 (모두 idle)"
fi

echo ""
echo "✅ Workspace 초기화 완료"
echo "   유지됨: agents/, project/ (프로젝트 결과물 보관)"
echo "   초기화됨: artifacts/, input/, signals/, logs/, src/, tests/, docs/, state/, callbacks/, tasks/, status/"
