# Multi-Agent Terminal Dashboard

웹 브라우저에서 9개 AI 에이전트의 터미널을 모니터링하고 제어할 수 있는 대시보드입니다.

## 프로젝트 소개

Multi-Agent Terminal Dashboard는 멀티 에이전트 시스템을 웹 브라우저에서 접근 가능하게 하는 대시보드입니다. ttyd를 통해 각 에이전트의 tmux 세션을 웹으로 노출하고, 탭 기반 UI로 에이전트 간 전환 및 실시간 상태 모니터링이 가능합니다.

### 주요 기능

- **웹 터미널**: ttyd로 9개 에이전트 tmux 세션을 웹 노출
- **탭 기반 UI**: 에이전트 간 전환 가능한 대시보드
- **상태 모니터링**: idle/working/error 상태 표시 (3초 폴링)
- **자동 재연결**: 연결 끊김 시 자동 재연결 (최대 3회 시도)
- **다크 테마**: 터미널 환경에 최적화된 다크 모드 UI

### 에이전트 목록

| # | 에이전트 | 포트 | 역할 |
|---|----------|------|------|
| 1 | Orchestrator | 7681 | 전체 조율 |
| 2 | Requirement Analyst | 7682 | 요구사항 분석 |
| 3 | UX Designer | 7683 | UX 설계 |
| 4 | Tech Architect | 7684 | 기술 설계 |
| 5 | Planner | 7685 | 작업 계획 |
| 6 | Test Designer | 7686 | 테스트 설계 |
| 7 | Developer | 7687 | 개발 |
| 8 | Reviewer | 7688 | 코드 리뷰 |
| 9 | Documenter | 7689 | 문서화 |

---

## 필수 요구사항 (Prerequisites)

### 시스템 요구사항

- **RAM**: 4GB 이상
- **OS**: macOS, Linux

### 소프트웨어

| 소프트웨어 | 버전 | 설치 방법 |
|------------|------|-----------|
| ttyd | 최신 | `brew install ttyd` (macOS) |
| tmux | 최신 | 기존 시스템에 설치됨 |

### 지원 브라우저

| 브라우저 | 최소 버전 |
|----------|-----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### 사전 조건

- 9개 에이전트의 tmux 세션이 실행 중이어야 합니다
- 세션 이름: `orchestrator`, `requirement-analyst`, `ux-designer`, `tech-architect`, `planner`, `test-designer`, `developer`, `reviewer`, `documenter`

---

## 설치 방법

### 1. ttyd 설치

```bash
# macOS
brew install ttyd

# Linux (Ubuntu/Debian)
sudo apt install ttyd
```

### 2. 프로젝트 구조 확인

```
agent-dashboard/
├── index.html          # 메인 대시보드 페이지
├── css/
│   └── style.css       # 다크 테마 스타일시트
├── js/
│   └── app.js          # 애플리케이션 로직
├── start-dashboard.sh  # ttyd 인스턴스 시작 스크립트
└── stop-dashboard.sh   # ttyd 인스턴스 종료 스크립트
```

---

## 사용 방법

### 대시보드 시작

```bash
# 1. 프로젝트 디렉토리로 이동
cd agent-dashboard

# 2. 대시보드 시작 (ttyd 인스턴스 실행)
./start-dashboard.sh

# 3. HTTP 서버 시작 (필수)
python3 -m http.server 8081

# 4. 브라우저에서 접속
# http://localhost:8081 으로 접속
```

> **중요**: 반드시 HTTP 서버를 통해 접속해야 합니다. `file://` 프로토콜로 직접 index.html을 열면 iframe 보안 정책으로 인해 ttyd 터미널이 로드되지 않습니다.

### 대시보드 종료

```bash
# HTTP 서버 종료: Ctrl+C

# ttyd 인스턴스 종료
./stop-dashboard.sh
```

### 기본 워크플로우

1. `./start-dashboard.sh` 실행
2. `python3 -m http.server 8081` 실행
3. 브라우저에서 `http://localhost:8081` 접속
4. Orchestrator 탭에서 프로젝트 요청 입력
5. 다른 탭 클릭하여 각 에이전트 작업 실시간 확인
6. 필요시 특정 에이전트 터미널에 직접 입력
7. 작업 종료 후 HTTP 서버(Ctrl+C) 및 `./stop-dashboard.sh` 실행

### 상태 표시

- **● idle (회색)**: 에이전트 대기 중
- **● working (녹색, 깜빡임)**: 에이전트 작업 중
- **● error (빨강)**: 에러 발생

---

## 키보드 단축키

| 단축키 | 동작 |
|--------|------|
| `Ctrl + 1~9` | 해당 번호 에이전트 탭으로 전환 |
| `Ctrl + Tab` | 다음 탭으로 이동 |
| `Ctrl + Shift + Tab` | 이전 탭으로 이동 |
| `Tab` | 탭 간 포커스 이동 |
| `Enter` / `Space` | 탭 활성화 |

---

## 문제 해결

### 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :7681-7689

# 충돌하는 프로세스 종료
kill -9 <PID>
```

### ttyd 프로세스가 시작되지 않음

```bash
# ttyd 설치 확인
which ttyd

# 설치되어 있지 않다면
brew install ttyd
```

### tmux 세션이 없음

```bash
# 에이전트 세션 목록 확인
tmux list-sessions

# 세션이 없다면 먼저 에이전트 시스템 시작 필요
```

### 터미널 연결 끊김

- 대시보드가 자동으로 3회 재연결을 시도합니다
- 실패 시 화면에 "재연결" 버튼이 표시됩니다
- 버튼 클릭 또는 페이지 새로고침으로 재연결

### iframe 차단 문제 / 터미널이 로드되지 않음

`file://` 프로토콜로 index.html을 직접 열면 브라우저 보안 정책으로 인해 ttyd iframe이 차단됩니다.

**해결 방법**: 반드시 HTTP 서버를 통해 접속하세요.

```bash
# 프로젝트 디렉토리에서
python3 -m http.server 8081

# 브라우저에서 http://localhost:8081 접속
```

### 메모리 사용량 높음

9개 iframe이 동시에 로드되면 약 300-500MB 메모리를 사용합니다. 메모리가 부족한 경우:

- 사용하지 않는 브라우저 탭 닫기
- 대시보드를 닫고 개별 터미널 사용 고려

---

## 라이선스

MIT License

---

*작성일: 2024-12-02*
*작성자: Documenter Agent*
