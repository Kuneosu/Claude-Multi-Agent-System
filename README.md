# Multi-Agent Development System

AI 에이전트들이 협업하여 소프트웨어 개발을 자동화하는 시스템입니다.

## 시스템 구조

```
orchestrator (중앙 제어)
    ├─> requirement-analyst  (요구사항 분석)
    ├─> ux-designer         (UX 설계)
    ├─> tech-architect      (기술 아키텍처)
    ├─> planner            (구현 계획)
    ├─> test-designer      (테스트 설계)
    ├─> developer          (코드 구현)
    ├─> reviewer           (코드 리뷰)
    └─> documenter         (문서화)
```

## 빠른 시작

### 1. 설치

```bash
# 저장소 클론
git clone <repository-url>
cd MAS

# 첫 실행 시 자동으로 설치 진행
./run.sh
```

### 2. 실행

```bash
./run.sh
```

메뉴가 표시됩니다:

```
╔════════════════════════════════════════════════════════════════════════╗
║                    Multi-Agent System                                  ║
╠════════════════════════════════════════════════════════════════════════╣
║  1) 터미널 실행          - tmux 기반 에이전트 실행                     ║
║  2) 터미널 실행 (Auto)   - 사용자 확인 없이 자동 실행                  ║
║  3) 대시보드 실행        - 웹 기반 에이전트 모니터링                   ║
║  4) 대시보드 실행 (Auto) - 웹 + 자동 실행 모드                         ║
║  5) 설정                 - 에이전트 모델/포트 설정                     ║
║  6) 전체 종료            - 모든 세션 및 프로세스 종료                  ║
║  7) 세션 상태            - 현재 실행 중인 세션 확인                    ║
║  0) 종료                                                               ║
╚════════════════════════════════════════════════════════════════════════╝
```

### 3. 설정

메뉴에서 `5) 설정`을 선택하면:

- **에이전트 모델 설정**: 각 에이전트별 Claude 모델 변경 (opus/sonnet/haiku)
- **대시보드 포트 설정**: 웹 대시보드 포트 변경 (기본: 8080)
- **ttyd 포트 설정**: 웹 터미널 시작 포트 변경 (기본: 7681)

설정은 `config.sh` 파일에 저장됩니다.

### 4. 대시보드

메뉴에서 `3) 대시보드 실행`을 선택하면 브라우저에서 `http://localhost:8080` 접속 가능

- 9개 에이전트를 한 화면에서 모니터링
- 에이전트 시작/중지/재시작
- 전반기 에이전트 종료 (구현 단계 진입 시)
- 실시간 상태 확인

## 디렉토리 구조

```
MAS/
├── README.md                # 이 파일
├── run.sh                   # 통합 실행 스크립트 (메뉴 기반)
├── config.sh                # 시스템 설정 (에이전트 모델, 포트 등)
├── package.json             # 모노레포 설정
│
├── docs/                    # 문서
│   ├── QUICKSTART.md        # 빠른 시작 가이드
│   ├── GUIDE.md             # 상세 사용법
│   ├── ARCHITECTURE.md      # 아키텍처 개요
│   ├── SYSTEM_ARCHITECTURE.md # 시스템 상세 아키텍처
│   ├── TOKEN_OPTIMIZATION.md  # 토큰 최적화
│   └── DEMO.md              # 데모 예시
│
├── scripts/                 # 내부 스크립트
│   ├── setup-workspace.sh   # 워크스페이스 초기화
│   ├── setup-agents.sh      # 에이전트 설정
│   ├── start-sessions.sh    # 세션 시작 (일반)
│   ├── start-sessions-auto.sh # 세션 시작 (자동)
│   ├── cleanup-sessions.sh  # 세션 정리
│   ├── cleanup-phase.sh     # 단계별 에이전트 종료
│   ├── stop-all.sh          # 전체 종료
│   └── view-all-agents.sh   # 멀티뷰 모니터링
│
├── packages/                # 패키지
│   └── dashboard/           # 웹 대시보드
│       ├── server.js        # 프록시 서버
│       ├── index.html       # 대시보드 UI
│       ├── js/app.js        # 프론트엔드 로직
│       └── css/style.css    # 스타일
│
└── workspace/               # 런타임 작업 공간
    ├── agents/              # 에이전트별 CLAUDE.md
    ├── status/              # 에이전트 상태
    ├── signals/             # IPC 시그널
    ├── tasks/               # 작업 큐
    ├── output/              # 완성된 프로젝트
    └── ...
```

## 실행 모드

| 모드 | 메뉴 | 에이전트 | 용도 |
|------|------|---------|------|
| 터미널 | 1) 터미널 실행 | 9개 전체 | 새 프로젝트 (수동 승인) |
| 터미널 자동화 | 2) 터미널 실행 (Auto) | 9개 전체 | 새 프로젝트 (완전 자동) |
| 대시보드 | 3) 대시보드 실행 | 9개 전체 | 웹 기반 모니터링 |
| 대시보드 자동화 | 4) 대시보드 실행 (Auto) | 9개 전체 | 웹 + 완전 자동 |

## 기본 모델 설정

`config.sh`에서 에이전트별 Claude 모델을 설정합니다:

```bash
AGENT_MODELS=(
    ["orchestrator"]="opus"      # 중앙 제어 (고성능)
    ["requirement-analyst"]="sonnet"
    ["ux-designer"]="sonnet"
    ["tech-architect"]="sonnet"
    ["planner"]="sonnet"
    ["test-designer"]="sonnet"
    ["developer"]="opus"         # 코드 구현 (고성능)
    ["reviewer"]="sonnet"
    ["documenter"]="sonnet"
)
```

## 개발 워크플로우

1. **요구사항 분석** (requirement-analyst)
2. **UX 설계** (ux-designer)
3. **기술 아키텍처** (tech-architect)
4. **구현 계획** (planner)
5. **테스트 설계** (test-designer)
6. **구현** (developer) - TDD 방식
7. **코드 리뷰** (reviewer)
8. **문서화** (documenter)

## 세션 관리

```bash
# 모든 에이전트 한 화면 표시 (3x3 그리드)
./scripts/view-all-agents.sh

# tmux 세션 목록
tmux list-sessions

# 특정 세션 접속
tmux attach-session -t orchestrator

# 세션에서 나오기 (종료하지 않고)
Ctrl+b, d
```

## 의존성

- **Node.js** >= 14.0.0
- **tmux**
- **Claude CLI** (`npm install -g @anthropic-ai/claude-code`)
- **ttyd** (대시보드용, 선택)

## 문서

- [빠른 시작](docs/QUICKSTART.md)
- [상세 가이드](docs/GUIDE.md)
- [아키텍처](docs/ARCHITECTURE.md)
- [시스템 아키텍처](docs/SYSTEM_ARCHITECTURE.md)
- [토큰 최적화](docs/TOKEN_OPTIMIZATION.md)

## 라이선스

MIT License
