# Multi-Agent System - 토큰 최적화 분석 및 제안

> 작성일: 2025-12-10
> 목적: 토큰 소모를 줄이면서 결과물 품질을 유지하는 방안 제시

---

## 목차

1. [현재 토큰 소모 분석](#1-현재-토큰-소모-분석)
2. [주요 토큰 낭비 지점](#2-주요-토큰-낭비-지점)
3. [최적화 방안](#3-최적화-방안)
4. [구현 우선순위](#4-구현-우선순위)
5. [예상 효과](#5-예상-효과)

---

## 1. 현재 토큰 소모 분석

### 1.1 CLAUDE.md 파일 크기

각 에이전트의 시스템 프롬프트 크기:

| 에이전트 | 라인 수 | 예상 토큰 | 비고 |
|---------|---------|----------|------|
| orchestrator | 171 lines | ~1,500 tokens | **가장 큼** |
| requirement-analyst | 146 lines | ~1,200 tokens | |
| ux-designer | 77 lines | ~650 tokens | |
| tech-architect | 68 lines | ~580 tokens | |
| reviewer | 77 lines | ~650 tokens | |
| planner | 72 lines | ~620 tokens | |
| documenter | 65 lines | ~550 tokens | |
| developer | 60 lines | ~500 tokens | **최소** |
| test-designer | 46 lines | ~400 tokens | **최소** |
| **총합** | **782 lines** | **~6,650 tokens** | |

**문제:**
- 매 세션 시작 시 CLAUDE.md 전체가 시스템 프롬프트로 로드됨
- 각 에이전트가 응답할 때마다 시스템 프롬프트가 컨텍스트에 포함됨
- 9개 에이전트 × 평균 740 tokens = **~6,650 tokens** (시작 시에만)

### 1.2 에이전트별 평균 Tool 호출 횟수

**예상 워크플로우 (3 Iteration 프로젝트 기준):**

| Phase | 에이전트 | Tool 호출 | 응답 생성 | 예상 토큰/Phase |
|-------|---------|----------|-----------|----------------|
| 0 | Requirement Analyst | Bash(3), Read(2), Write(1) | 3회 | ~4,000 |
| 1 | Requirement Analyst (finalize) | Read(3), Write(1) | 2회 | ~2,500 |
| 2 | UX Designer | Read(2), Write(1) | 2회 | ~2,500 |
| 3 | Tech Architect | Read(3), Write(1) | 2회 | ~3,000 |
| 4 | Planner | Read(4), Write(1) | 2회 | ~3,500 |
| 5 | Test Designer | Read(3), Write(5) | 3회 | ~4,000 |
| 6-1 | Developer (Iter 1) | Read(5), Write(10), Bash(5) | 5회 | ~8,000 |
| 6-2 | Reviewer (Iter 1) | Read(10), Write(1) | 3회 | ~5,000 |
| 6-3 | Developer (Iter 2) | Read(5), Write(10), Bash(5) | 5회 | ~8,000 |
| 6-4 | Reviewer (Iter 2) | Read(10), Write(1) | 3회 | ~5,000 |
| 6-5 | Developer (Iter 3) | Read(5), Write(10), Bash(5) | 5회 | ~8,000 |
| 6-6 | Reviewer (Iter 3) | Read(10), Write(1) | 3회 | ~5,000 |
| 7 | Documenter | Read(15), Write(4) | 3회 | ~6,000 |
| - | **Orchestrator** | Bash(30), Read(5) | 20회 | ~15,000 |

**총 예상 토큰:** ~79,500 tokens (3 Iteration 기준)

### 1.3 토큰 소모 세부 분석

#### A. 시스템 프롬프트 로드

**중요 수정: 시스템 프롬프트는 세션당 1회만 로드됩니다!**

```
orchestrator 세션:
  - 시작 시: CLAUDE.md (1,500 tokens) 로드 × 1회 = 1,500 tokens

requirement-analyst 세션:
  - 시작 시: CLAUDE.md (1,200 tokens) 로드 × 1회 = 1,200 tokens

developer 세션:
  - 시작 시: CLAUDE.md (500 tokens) 로드 × 1회 = 500 tokens
```

**시스템 프롬프트 총합 (9개 에이전트):** ~6,650 tokens (1회만)

**단, 주의사항:**
Claude API는 매 요청마다 전체 대화 컨텍스트를 포함합니다. 따라서:
- 세션이 길어질수록 누적 컨텍스트가 증가
- orchestrator는 20번 응답 → 대화 히스토리가 계속 쌓임
- 하지만 시스템 프롬프트 자체는 1회만 카운트

#### B. 불필요한 상세 지시문

**예: Orchestrator CLAUDE.md (171 lines)**

```markdown
## 워크플로우 단계

### Phase 0: 요구사항 분석
- Agent: requirement-analyst
- 출력: requirements-draft.md
- 다음: 사용자 확인 필요

### Phase 1: 요구사항 확정
- Agent: requirement-analyst
- 출력: requirements.md
- 다음: UX 설계

### Phase 2: UX 설계
...
(계속)
```

**문제:**
- 모든 Phase 설명 포함 (50+ lines)
- 매 응답마다 컨텍스트에 포함되지만, 실제로는 현재 Phase만 필요

#### C. 예제 코드 중복

**예: Requirement Analyst CLAUDE.md**

```markdown
## 요구사항 초안 작성

다음 템플릿을 사용하세요:

```markdown
# 요구사항 분석 (초안)

## 사용자 요청
[원본 요청 그대로 기록]

## 파악된 요구사항
- 기능 1: [설명]
- 기능 2: [설명]
...
```

**문제:**
- 템플릿 전체를 시스템 프롬프트에 포함 (~30 lines)
- 실제로는 "requirements-draft.md 템플릿 참조" 정도면 충분

#### D. 산출물 중복 읽기

**예: Tech Architect**

```bash
# 1. requirements.md 읽기 (2,000 tokens)
# 2. ux-design.md 읽기 (1,500 tokens)
# 3. tech-spec.md 작성 (2,000 tokens)
```

**문제:**
- 이전 Phase의 산출물을 매번 전체 읽음
- 필요한 부분만 발췌하면 토큰 절약 가능

#### E. Orchestrator 대기 시간 동안 토큰 소모

**이전 분석 결과:**
- Bash tool 내부의 while loop는 추가 토큰 소모 없음 ✅
- 하지만 Orchestrator가 **너무 많은 작업**을 직접 수행

```bash
# Orchestrator가 하는 일:
1. 프로젝트 초기화 (Bash tool)
2. 각 에이전트에게 작업 지시 (9번 × Bash tool)
3. 각 시그널 대기 (9번 × Bash tool)
4. 시그널 파싱 (9번 × Bash tool)
5. 사용자에게 결과 전달 (9번 × 응답 생성)
```

**Orchestrator 총 Tool 호출:** ~30회
**Orchestrator 총 응답 생성:** ~20회
**예상 토큰:** ~15,000 tokens

---

## 2. 주요 토큰 낭비 지점

### 2.1 대화 히스토리 누적 (1순위 문제)

**현황:**
- Orchestrator는 20번 이상 응답 생성
- 매 응답마다 이전 대화 히스토리 포함
- 시그널 대기 중 출력도 히스토리에 누적

**예상 누적:**
```
Orchestrator 대화 히스토리 (20번 응답):
- 1번째: 시스템 프롬프트(1,500) + 사용자(100) + 응답(500) = 2,100 tokens
- 2번째: 시스템 프롬프트(1,500) + 이전 대화(2,100) + 새 대화(600) = 4,200 tokens
- 3번째: 4,200 + 600 = 4,800 tokens
- ...
- 20번째: ~15,000 tokens (누적)
```

**예상 낭비:** ~50,000 tokens (전체의 63%)

**원인:**
- Orchestrator가 너무 많은 작업 수행 (20번 응답)
- 긴 bash 출력이 히스토리에 포함
- 시그널 대기 중 "대기 중... (30초)" 같은 메시지 누적

### 2.2 산출물 전체 읽기 (2순위 문제)

**현황:**
- 각 에이전트가 이전 산출물을 전체 읽음
- Tech Architect: requirements.md + ux-design.md (전체)
- Developer: 모든 이전 문서 (전체)

**예상 낭비:** ~10,000 tokens

### 2.3 불필요한 중간 산출물 (3순위 문제)

**현황:**
- 9개 Phase × 각 산출물
- 일부는 최종 결과물에 통합 가능

**예:**
- requirements-draft.md → requirements.md (2단계)
- implementation-log.md (Developer가 작성하지만 Reviewer만 봄)

**예상 낭비:** ~5,000 tokens

### 2.4 Orchestrator 과다 작업 (4순위 문제)

**현황:**
- Orchestrator가 모든 조율 작업 수행
- 각 Phase마다 작업 지시 + 시그널 대기

**예상 낭비:** ~5,000 tokens

---

## 3. 최적화 방안

### 3.1 Orchestrator 대화 히스토리 관리 (★★★★★)

#### A. Bash 출력 최소화

**문제:**
```bash
while [ ! -f /workspace/signals/req-analysis-done ]; do
    sleep 2
    SECONDS=$((SECONDS + 2))
    echo "대기 중... (${SECONDS}초 경과)"  # ← 이게 히스토리에 쌓임!
done
```

**해결:**
```bash
# 출력 최소화
while [ ! -f /workspace/signals/req-analysis-done ]; do
    sleep 5  # 간격 늘림
done

# 완료 시에만 출력
echo "✅ requirement-analyst 완료"
```

**절감:** 불필요한 출력 제거로 히스토리 크기 50% 감소

#### B. 간결한 응답 생성

**Before: orchestrator/CLAUDE.md (171 lines)**

```markdown
# Orchestrator Agent

당신은 중앙 제어 오케스트레이터입니다.

## 핵심 역할
1. 워크플로우 관리
2. 에이전트 조율
3. 상태 추적
4. 사용자 인터랙션

## 작업 흐름

### 시작 시
사용자에게 다음과 같이 인사하세요:
```
🤖 Multi-Agent Development System...
(10 lines)
```

### 사용자 요청 수신 후
1. 프로젝트 초기화
   ```bash
   PROJECT_ID=$(date +%Y%m%d_%H%M%S)...
   (20 lines of bash code)
   ```

## 워크플로우 단계
### Phase 0: 요구사항 분석
- Agent: requirement-analyst
- 출력: requirements-draft.md
...
(50+ lines)

## 로그 형식
```
[2025-12-10 10:00:00] 프로젝트 시작...
(10 lines)
```
```

**After: orchestrator/CLAUDE.md (40 lines 목표)**

```markdown
# Orchestrator Agent

당신은 중앙 제어 오케스트레이터입니다.

## 역할
전체 개발 프로세스를 관리하고 조율합니다.

## 작업 방식
1. 사용자 요청 수신 → requirement-analyst에게 전달
2. 각 Phase 완료 시그널 대기
3. 다음 Phase 에이전트에게 작업 지시
4. 필요 시 사용자 승인 요청

## Phase 순서
requirement-analyst → ux-designer → tech-architect → planner → test-designer → developer+reviewer (반복) → documenter

## 상세 작업 절차
/workspace/docs/orchestrator-workflow.md 참조

## 중요
- 직접 분석/설계/구현 금지
- 에이전트 위임만 수행
```

**절감 예상:** 171 lines → 40 lines = **131 lines (-77%)**
**토큰 절감:** ~1,100 tokens/session → ~30,000 tokens (전체)

#### B. 상세 절차는 외부 문서로 분리

```
workspace/
├── docs/
│   ├── orchestrator-workflow.md       # 상세 워크플로우
│   ├── requirement-analyst-template.md # 템플릿
│   ├── ux-designer-examples.md        # 예제
│   └── ...
```

**장점:**
- CLAUDE.md는 핵심만 (20-50 lines)
- 필요할 때만 외부 문서를 Read tool로 참조
- Read는 1회만 발생, 시스템 프롬프트는 매 응답마다 발생

#### C. 템플릿 파일 분리

**Before: requirement-analyst/CLAUDE.md**

```markdown
## 요구사항 초안 작성

다음 템플릿을 사용하세요:

```markdown
# 요구사항 분석 (초안)

## 사용자 요청
[원본 요청]

## 파악된 요구사항
- 기능 1: [설명]
- 기능 2: [설명]

## 불명확한 사항 - 사용자 확인 필요 ❓
### 1. [질문 카테고리]
**질문**: [구체적인 질문]
**이유**: [왜 필요한지]
**옵션**:
- A) [선택지 1]
- B) [선택지 2]

## 제안 사항
- [전문가 추천]
```
(30+ lines)
```

**After: requirement-analyst/CLAUDE.md**

```markdown
## 요구사항 초안 작성

/workspace/templates/requirements-draft-template.md 참조하여 작성
```

**절감:** ~30 lines → ~1 line = **29 lines (-97%)**

### 3.2 산출물 요약본 전달 (★★★★☆)

#### A. 요약 시스템 도입

**각 Phase 완료 시 요약 생성:**

```markdown
# requirements.md (원본: 2,000 tokens)
## 프로젝트 개요
[상세 설명 50 lines]

## 기능 요구사항
### FR-1: 사용자 인증
[상세 10 lines]
### FR-2: TODO 관리
[상세 10 lines]
...
```

**요약본 생성 (200 tokens):**

```markdown
# requirements-summary.md
- 프로젝트: TODO 앱
- 주요 기능: 인증, TODO CRUD, 필터링, 검색
- 기술 제약: React 18, 브라우저 지원 Chrome/Firefox/Safari
- 성능: 로딩 < 2초
```

**다음 에이전트는 요약본만 읽기:**

```bash
# Tech Architect
cat /workspace/artifacts/requirements-summary.md  # 200 tokens
cat /workspace/artifacts/ux-design-summary.md     # 150 tokens
# 원본 읽기 시: 3,500 tokens → 요약본: 350 tokens
```

**절감:** 3,500 → 350 = **3,150 tokens/Phase** × 5 Phases = **~15,000 tokens**

#### B. 필요 시에만 원본 참조

```markdown
당신은 Tech Architect입니다.

## 입력 문서
1. requirements-summary.md 먼저 읽기 (필수)
2. 상세 정보 필요 시 requirements.md 참조 (선택)
3. ux-design-summary.md 먼저 읽기 (필수)
4. 상세 정보 필요 시 ux-design.md 참조 (선택)
```

### 3.3 Phase 통합 (★★★☆☆)

#### A. 요구사항 분석 단계 통합

**Before:**
- Phase 0: requirements-draft.md 생성 → 사용자 질문
- Phase 1: 사용자 답변 → requirements.md 생성

**After:**
- Phase 0: requirements.md 직접 생성 (질문을 포함한 초안)
  - 불명확한 부분은 "가정"으로 처리
  - 사용자에게 한 번에 확인

**절감:** 1개 Phase 제거 = **~2,500 tokens**

#### B. Developer + Reviewer 통합 가능성 검토

**현재:**
- Developer: 코드 작성
- Reviewer: 검토 및 승인/거부
- 거부 시 Developer 재작업

**대안 1: Self-Review**
```markdown
당신은 Developer입니다.

## 작업 방식
1. 테스트 확인
2. 코드 작성
3. **자체 리뷰 수행** (체크리스트 제공)
4. 모든 체크 통과 시에만 완료 시그널 전송
```

**장점:** Reviewer Phase 제거
**단점:** 품질 저하 가능성

**대안 2: 간소화된 Reviewer**
```markdown
당신은 Reviewer입니다.

## 리뷰 체크리스트 (간소화)
- [ ] 모든 테스트 통과
- [ ] ESLint 통과
- [ ] 요구사항 충족

블로킹 이슈만 확인, 개선 제안은 생략
```

**절감:** Reviewer 작업 50% 감소 = **~2,500 tokens/Iteration** × 3 = **~7,500 tokens**

### 3.4 Orchestrator 역할 분산 (★★☆☆☆)

#### A. 체인 방식 도입

**Before: Hub-Spoke 모델**

```
          Orchestrator
               ↓
        [작업 지시]
               ↓
      Requirement Analyst
               ↓
        [시그널 전송]
               ↓
          Orchestrator
               ↓
        [작업 지시]
               ↓
         UX Designer
               ↓
        [시그널 전송]
               ↓
          Orchestrator
               ...
```

**After: Chain 모델**

```
Requirement Analyst
        ↓
   [직접 호출]
        ↓
   UX Designer
        ↓
   [직접 호출]
        ↓
  Tech Architect
        ↓
      ...
```

**각 에이전트가 다음 에이전트 호출:**

```bash
# Requirement Analyst 완료 시
cat > /workspace/tasks/ux-designer/task-001.json << TASK
{
  "task_id": "ux-design-001",
  "input": "/workspace/artifacts/requirements.md",
  "output": "/workspace/artifacts/ux-design.md",
  "callback": "/workspace/signals/ux-design-done"
}
TASK

tmux send-keys -t ux-designer:0 "새 작업: task-001.json"
sleep 0.2
tmux send-keys -t ux-designer:0 C-m

echo "idle" > /workspace/status/requirement-analyst.status
```

**장점:**
- Orchestrator는 초기 설정 + 모니터링만
- 중간 조율 불필요

**단점:**
- 에러 발생 시 복구 어려움
- 각 에이전트 CLAUDE.md가 복잡해짐

**절감:** Orchestrator 작업 70% 감소 = **~10,000 tokens**

### 3.5 Model 다운그레이드 (★★★★☆)

#### A. 에이전트별 적절한 모델 사용

**현재:** 모든 에이전트가 Sonnet 4.5

**제안:**

| 에이전트 | 현재 모델 | 제안 모델 | 이유 |
|---------|----------|----------|------|
| Orchestrator | Sonnet 4.5 | **Sonnet 4.5** | 복잡한 조율 필요 |
| Requirement Analyst | Sonnet 4.5 | **Sonnet 4.5** | 고도의 분석 필요 |
| UX Designer | Sonnet 4.5 | **Haiku** | 템플릿 기반 작업 |
| Tech Architect | Sonnet 4.5 | **Sonnet 4.5** | 기술 판단 필요 |
| Planner | Sonnet 4.5 | **Haiku** | 구조화된 작업 |
| Test Designer | Sonnet 4.5 | **Haiku** | 템플릿 기반 테스트 |
| Developer | Sonnet 4.5 | **Sonnet 4.5** | 복잡한 코드 작성 |
| Reviewer | Sonnet 4.5 | **Haiku** | 체크리스트 기반 |
| Documenter | Sonnet 4.5 | **Haiku** | 문서 정리 작업 |

**Haiku 특징:**
- 속도: Sonnet의 3배 빠름
- 비용: Sonnet의 1/10
- 성능: 간단한 작업에 충분

**절감:** 5개 에이전트 × 평균 5,000 tokens = **~25,000 tokens를 Haiku로** = 비용 90% 절감

#### B. 모델 지정 방법

```bash
# start-sessions-auto.sh 수정
for agent in "${AGENTS[@]}"; do
    # 에이전트별 모델 선택
    if [[ "$agent" == "ux-designer" ]] || [[ "$agent" == "planner" ]] || [[ "$agent" == "test-designer" ]] || [[ "$agent" == "reviewer" ]] || [[ "$agent" == "documenter" ]]; then
        MODEL="haiku"
    else
        MODEL="sonnet"
    fi

    tmux send-keys -t "$agent:0" "claude --dangerously-skip-permissions --model $MODEL --append-system-prompt \"\$(cat CLAUDE.md)\""
    sleep 0.2
    tmux send-keys -t "$agent:0" C-m
done
```

### 3.6 불필요한 산출물 제거 (★★☆☆☆)

#### A. 임시 파일 최소화

**제거 대상:**

1. **requirements-draft.md** → requirements.md만 유지
2. **implementation-log.md** → 시그널 파일에 요약만
3. **test-plan.md** → tests/ 폴더의 실제 테스트로 충분

**절감:** ~3,000 tokens

#### B. 시그널 파일 간소화

**Before:**

```bash
cat > /workspace/signals/dev-iter1-done << SIGNAL
status:iteration_complete
iteration:1
tests_passed:5/5
artifacts:/workspace/src/
timestamp:$(date -Iseconds)
detailed_log:/workspace/artifacts/implementation-log.md
warnings:0
errors:0
SIGNAL
```

**After:**

```bash
cat > /workspace/signals/dev-iter1-done << SIGNAL
status:iteration_complete
iteration:1
tests_passed:5/5
SIGNAL
```

**절감:** 미미하지만 간결성 향상

---

## 4. 구현 우선순위

### 우선순위 1: 시스템 프롬프트 간소화 (즉시 구현 가능)

**작업:**
1. 각 CLAUDE.md 파일을 20-50 lines로 축소
2. 상세 절차는 `/workspace/docs/` 로 분리
3. 템플릿은 `/workspace/templates/` 로 분리

**예상 절감:** ~30,000 tokens (전체의 38%)
**난이도:** 낮음
**품질 영향:** 없음 (외부 문서 참조로 동일한 정보 제공)

**구현 예시:**

```bash
# 1. docs/ 및 templates/ 디렉토리 생성
mkdir -p workspace/docs workspace/templates

# 2. orchestrator 상세 워크플로우 분리
cat > workspace/docs/orchestrator-workflow.md << 'EOF'
# Orchestrator 상세 워크플로우

## Phase 0: 요구사항 분석
1. 사용자 요청을 /workspace/input/user_request.txt에 저장
2. requirement-analyst에게 작업 지시
   ```bash
   cat > /workspace/tasks/requirement-analyst/task-001.json << TASK
   {
     "task_id": "req-analysis-001",
     "command": "analyze_requirements",
     "input": "/workspace/input/user_request.txt",
     "output": "/workspace/artifacts/requirements-draft.md",
     "callback": "/workspace/signals/req-analysis-done"
   }
   TASK
   ```
3. 시그널 대기
   ...
EOF

# 3. requirement-analyst 템플릿 분리
cat > workspace/templates/requirements-draft-template.md << 'EOF'
# 요구사항 분석 (초안)

## 사용자 요청
[원본 요청]

## 파악된 요구사항
- 기능 1: [설명]
- 기능 2: [설명]
...
EOF

# 4. CLAUDE.md 간소화
cat > workspace/agents/orchestrator/CLAUDE.md << 'EOF'
# Orchestrator Agent

당신은 중앙 제어 오케스트레이터입니다.

## 역할
전체 개발 프로세스를 관리하고 조율합니다.

## 작업 방식
1. 사용자 요청 수신
2. 각 Phase별 에이전트에게 작업 지시
3. 시그널 대기 및 다음 Phase 진행

## 상세 워크플로우
필요 시 /workspace/docs/orchestrator-workflow.md 참조

## 중요
- 직접 분석/설계/구현 금지
- 에이전트 위임만 수행
EOF
```

### 우선순위 2: Model 다운그레이드 (즉시 구현 가능)

**작업:**
1. start-sessions-auto.sh에 모델 선택 로직 추가
2. 5개 에이전트를 Haiku로 변경

**예상 절감:** 비용 50% 감소 (토큰 수는 동일하지만 비용 절감)
**난이도:** 낮음
**품질 영향:** 낮음 (간단한 작업은 Haiku로 충분)

### 우선순위 3: 산출물 요약본 전달 (중기 구현)

**작업:**
1. 각 에이전트가 완료 시 요약본 생성
2. 다음 에이전트는 요약본 먼저 읽기
3. 필요 시에만 원본 참조

**예상 절감:** ~15,000 tokens (전체의 19%)
**난이도:** 중간
**품질 영향:** 낮음 (필요 시 원본 참조 가능)

### 우선순위 4: Phase 통합 (장기 검토)

**작업:**
1. requirements-draft + requirements 통합
2. Developer + Reviewer 간소화 (Self-Review)

**예상 절감:** ~10,000 tokens (전체의 13%)
**난이도:** 높음
**품질 영향:** 중간 (품질 저하 가능성 있음)

### 우선순위 5: Orchestrator 역할 분산 (장기 검토)

**작업:**
1. Chain 모델로 변경
2. 각 에이전트가 다음 에이전트 직접 호출

**예상 절감:** ~10,000 tokens (전체의 13%)
**난이도:** 매우 높음
**품질 영향:** 높음 (에러 복구 어려움)

---

## 5. 예상 효과

### 5.1 최적화 전/후 비교

| 항목 | 현재 | 우선순위 1+2 적용 | 전체 적용 |
|------|------|-------------------|----------|
| 시스템 프롬프트 | 6,650 tokens | **2,000 tokens** | 2,000 tokens |
| 산출물 읽기 | 25,000 tokens | 25,000 tokens | **10,000 tokens** |
| Orchestrator | 15,000 tokens | 15,000 tokens | **5,000 tokens** |
| 에이전트 작업 | 40,000 tokens | 40,000 tokens | 30,000 tokens |
| **총합** | **86,650 tokens** | **82,000 tokens (-5%)** | **47,000 tokens (-46%)** |

### 5.2 비용 절감 (Model 다운그레이드 포함)

**Sonnet 4.5 기준:**
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens

**현재 비용 (86,650 tokens, 모두 Sonnet):**
- Input: ~43,000 tokens × $3 = $0.129
- Output: ~43,000 tokens × $15 = $0.645
- **총: $0.774 / 프로젝트**

**우선순위 1+2 적용 (82,000 tokens, 5개 Haiku):**
- Sonnet Input: ~25,000 tokens × $3 = $0.075
- Sonnet Output: ~25,000 tokens × $15 = $0.375
- Haiku Input: ~16,000 tokens × $0.25 = $0.004
- Haiku Output: ~16,000 tokens × $1.25 = $0.020
- **총: $0.474 / 프로젝트 (-39%)**

**전체 최적화 적용:**
- **총: $0.250 / 프로젝트 (-68%)**

### 5.3 단계별 로드맵

#### Phase 1 (1주일)
- [ ] CLAUDE.md 간소화 (9개 에이전트)
- [ ] docs/, templates/ 디렉토리 생성
- [ ] 상세 문서 분리

**예상 효과:** 토큰 5% 절감

#### Phase 2 (1주일)
- [ ] start-sessions-auto.sh 모델 선택 로직 추가
- [ ] 5개 에이전트 Haiku로 변경
- [ ] 테스트 및 품질 확인

**예상 효과:** 비용 39% 절감

#### Phase 3 (2주일)
- [ ] 산출물 요약 시스템 구현
- [ ] 각 에이전트 요약본 생성 로직 추가
- [ ] 다음 에이전트 요약본 우선 읽기

**예상 효과:** 토큰 19% 추가 절감

#### Phase 4 (검토 후 결정)
- [ ] Phase 통합 검토
- [ ] Chain 모델 POC
- [ ] 품질 영향 분석

**예상 효과:** 토큰 25% 추가 절감 (품질 유지 시)

---

## 6. 권장 사항

### 즉시 적용 (이번 주)

1. **CLAUDE.md 간소화**
   - 작업량: 중간
   - 효과: 중간
   - 리스크: 낮음

2. **Model 다운그레이드**
   - 작업량: 낮음
   - 효과: 높음 (비용)
   - 리스크: 낮음

### 단계적 적용 (다음 달)

3. **산출물 요약본 전달**
   - 작업량: 높음
   - 효과: 높음
   - 리스크: 낮음

### 신중한 검토 필요

4. **Phase 통합**
   - 품질 저하 가능성 검토 필요
   - A/B 테스트 권장

5. **Orchestrator 역할 분산**
   - 시스템 복잡도 증가
   - 에러 처리 어려움
   - 장기 과제로 보류 권장

---

## 부록: 구현 예시

### A. 간소화된 CLAUDE.md 템플릿

```markdown
# [Agent Name] Agent

당신은 [역할]입니다.

## 역할
[1-2문장 설명]

## 입력
- [입력 파일 경로]

## 출력
- [출력 파일 경로]

## 작업 방식
1. [단계 1]
2. [단계 2]
3. [단계 3]

## 상세 문서
필요 시 /workspace/docs/[agent]-guide.md 참조

## 완료 시그널
```bash
cat > /workspace/signals/[agent]-done << 'SIGNAL'
status:completed
artifact:[출력 경로]
SIGNAL
```

**총 라인 수:** ~25 lines (기존 대비 70% 감소)
```

### B. Model 선택 로직

```bash
# scripts/start-sessions-auto.sh

# 에이전트별 모델 매핑
declare -A AGENT_MODELS=(
    ["orchestrator"]="sonnet"
    ["requirement-analyst"]="sonnet"
    ["ux-designer"]="haiku"
    ["tech-architect"]="sonnet"
    ["planner"]="haiku"
    ["test-designer"]="haiku"
    ["developer"]="sonnet"
    ["reviewer"]="haiku"
    ["documenter"]="haiku"
)

for agent in "${AGENTS[@]}"; do
    MODEL="${AGENT_MODELS[$agent]}"

    tmux new-session -d -s "$agent" -c "$AGENT_DIR"
    tmux send-keys -t "$agent:0" "claude --dangerously-skip-permissions --model $MODEL --append-system-prompt \"\$(cat CLAUDE.md)\""
    sleep 0.2
    tmux send-keys -t "$agent:0" C-m

    echo "  ✓ $agent 세션 시작 (모델: $MODEL)"
done
```

---

**문서 끝**
