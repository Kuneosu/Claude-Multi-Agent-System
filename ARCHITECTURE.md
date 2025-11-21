# Multi-Agent System Architecture

## 시스템 개요

이 시스템은 9개의 전문화된 AI 에이전트가 협업하여 소프트웨어 개발을 자동화합니다.

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         User (사용자)                            │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                         │
│                    │  Orchestrator    │ ◄─── 중앙 제어          │
│                    │  (오케스트레이터)  │                         │
│                    └──────────────────┘                         │
│                              │                                  │
│        ┌─────────────────────┼─────────────────────┐           │
│        ▼                     ▼                     ▼           │
│  ┌─────────┐          ┌─────────┐          ┌─────────┐        │
│  │ Req.    │          │   UX    │          │  Tech   │        │
│  │ Analyst │──────►   │Designer │──────►   │Architect│        │
│  └─────────┘          └─────────┘          └─────────┘        │
│        │                     │                     │           │
│        └─────────────────────┼─────────────────────┘           │
│                              ▼                                  │
│                        ┌─────────┐                             │
│                        │ Planner │                             │
│                        └─────────┘                             │
│                              │                                  │
│                    ┌─────────┴─────────┐                       │
│                    ▼                   ▼                       │
│              ┌──────────┐        ┌──────────┐                 │
│              │   Test   │        │Developer │                 │
│              │ Designer │        │          │                 │
│              └──────────┘        └──────────┘                 │
│                                        │                       │
│                                        ▼                       │
│                                  ┌──────────┐                 │
│                                  │ Reviewer │                 │
│                                  └──────────┘                 │
│                                        │                       │
│                                        ▼                       │
│                                 ┌───────────┐                 │
│                                 │Documenter │                 │
│                                 └───────────┘                 │
│                                        │                       │
│                                        ▼                       │
│                                  Final Output                  │
└─────────────────────────────────────────────────────────────────┘
```

## 에이전트 역할 상세

### 1. Orchestrator (오케스트레이터)
**책임**: 전체 워크플로우 관리

**주요 작업**:
- 사용자 요청 수신
- 각 에이전트에게 작업 지시
- 에이전트 상태 모니터링
- 다음 단계 결정
- 사용자 승인 요청

**통신**:
- 입력: 사용자 요청, 에이전트 시그널
- 출력: 작업 지시 파일, tmux 명령

### 2. Requirement Analyst (요구사항 분석가)
**책임**: 요구사항 명확화

**주요 작업**:
- 사용자 요청 분석
- 불명확한 부분 질문 생성
- 최종 요구사항 문서 작성

**산출물**:
- `requirements-draft.md` (초안)
- `requirements.md` (최종)

### 3. UX Designer (UX 설계자)
**책임**: 사용자 경험 설계

**주요 작업**:
- 사용자 플로우 정의
- 화면 구성 설계
- 인터랙션 정의

**산출물**:
- `ux-design.md`

### 4. Tech Architect (기술 아키텍트)
**책임**: 기술 결정

**주요 작업**:
- 기술 스택 선정
- 아키텍처 설계
- 의존성 분석
- 리스크 평가

**산출물**:
- `tech-spec.md`

### 5. Planner (계획 수립자)
**책임**: 구현 계획

**주요 작업**:
- 전체 작업을 Iteration으로 분할
- 각 단계별 작업 목록 작성
- 예상 시간 산정

**산출물**:
- `implementation-plan.md`

### 6. Test Designer (테스트 설계자)
**책임**: 테스트 작성

**주요 작업**:
- TDD 방식으로 테스트 먼저 작성
- 단위/통합/E2E 테스트 설계

**산출물**:
- `test-plan.md`
- `tests/*.test.js`

### 7. Developer (개발자)
**책임**: 코드 구현

**주요 작업**:
- 계획에 따라 코드 작성
- 테스트 통과 확인
- 구현 로그 작성

**산출물**:
- `src/*`
- `implementation-log.md`

### 8. Reviewer (리뷰어)
**책임**: 코드 품질 검증

**주요 작업**:
- 코드 리뷰
- 설계 준수 확인
- 성능 검증

**산출물**:
- `review-comments.md`

### 9. Documenter (문서 작성자)
**책임**: 프로젝트 문서화

**주요 작업**:
- README 작성
- API 문서 생성
- 아키텍처 문서 작성

**산출물**:
- `README.md`
- `ARCHITECTURE.md`
- `API.md`

## 통신 메커니즘

### 파일 기반 통신

```
workspace/
├── tasks/           # 작업 큐 (Orchestrator → Agent)
│   └── [agent]/
│       └── task-001.json
├── signals/         # 완료 시그널 (Agent → Orchestrator)
│   └── [task]-done
└── status/          # 에이전트 상태
    └── [agent].status
```

### 작업 지시 형식

```json
{
  "task_id": "req-analysis-001",
  "command": "analyze_requirements",
  "input": "/workspace/input/user_request.txt",
  "output": "/workspace/artifacts/requirements-draft.md",
  "callback": "/workspace/signals/req-analysis-done",
  "timeout": 600
}
```

### 시그널 형식

```
status:completed|need_user_input|error
artifact:/workspace/artifacts/file.md
timestamp:2024-01-15T10:00:00Z
[optional fields...]
```

## 상태 머신

### 에이전트 상태

```
┌──────┐     작업 수신     ┌─────────┐
│ idle │ ────────────────► │ working │
└──────┘                   └─────────┘
   ▲                            │
   │          작업 완료           │
   └────────────────────────────┘
                 │
                 │ 사용자 입력 필요
                 ▼
        ┌─────────────────┐
        │ waiting_approval│
        └─────────────────┘
```

### 워크플로우 상태

```
start → requirement_analysis → ux_design → tech_architecture
    → planning → test_design → implementation → review
    → documentation → completed
```

## 동기화 메커니즘

### 1. 상태 확인 (Polling)

Orchestrator는 2초마다 다음을 확인:
- `/workspace/signals/` 디렉토리 (새 시그널)
- `/workspace/status/` 디렉토리 (에이전트 상태)

### 2. 작업 대기

에이전트에게 작업 지시 전:
```bash
while [ "$(cat /workspace/status/[agent].status)" != "idle" ]; do
    sleep 2
done
```

### 3. 블로킹 방지

- 타임아웃 설정 (기본 10분)
- 무응답 시 에러 처리
- 사용자에게 알림

## 확장성

### 새 에이전트 추가

1. `scripts/setup-agents.sh`에 에이전트 추가
2. CLAUDE.md 작성
3. Orchestrator 워크플로우에 통합

### 워크플로우 커스터마이징

Orchestrator의 CLAUDE.md를 수정하여:
- 단계 추가/제거
- 승인 포인트 조정
- 병렬 실행 설정

## 성능 최적화

### 병렬 처리

독립적인 작업은 동시 실행 가능:
```
tech-architect + ux-designer (병렬)
    ↓
planner
```

### 캐싱

반복되는 질문/답변은 캐시:
```
workspace/cache/
└── common-qa.json
```

## 보안 고려사항

1. **입력 검증**: 모든 사용자 입력 sanitize
2. **파일 권한**: workspace는 제한된 권한
3. **타임아웃**: 무한 대기 방지
4. **로그 관리**: 민감 정보 필터링

## 모니터링

### 실시간 모니터링

```bash
# 모든 에이전트 상태
watch -n 2 'cat workspace/status/*.status'

# 활성 작업
watch -n 2 'ls workspace/tasks/*/'

# 최신 로그
tail -f workspace/logs/orchestrator.log
```

### 메트릭

- 에이전트별 평균 처리 시간
- 에러 발생 빈도
- 사용자 승인 대기 시간

## 장애 복구

### 에이전트 실패 시

1. 에러 시그널 수신
2. 로그 분석
3. 재시도 (최대 3회)
4. 실패 시 사용자에게 알림

### 시스템 재시작

```bash
# 상태 복원
cat workspace/status/current_project.id
cat workspace/logs/last_completed_phase.txt

# 해당 단계부터 재시작
```

## 테스트

### 단위 테스트

각 에이전트의 출력 형식 검증

### 통합 테스트

전체 워크플로우 end-to-end 테스트

### 부하 테스트

동시 다중 프로젝트 처리 능력

## 알려진 제약사항

1. **동시 프로젝트**: 현재 1개만 지원
2. **네트워크**: Claude API 의존
3. **메모리**: 큰 프로젝트는 메모리 소모
4. **비용**: Claude API 호출 비용

## 향후 개선 방향

1. 웹 대시보드 추가
2. 멀티 프로젝트 지원
3. 에이전트 간 직접 통신
4. 학습 기능 (과거 프로젝트 참고)
5. 자동 롤백 메커니즘

## 참고 자료

- Claude API: https://docs.anthropic.com/
- Tmux: https://github.com/tmux/tmux
- 맥도날드식 개발: https://yozm.wishket.com/magazine/detail/3457/
