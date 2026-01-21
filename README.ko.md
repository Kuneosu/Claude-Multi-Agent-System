<p align="center">
  <h1 align="center">Multi-Agent System (MAS)</h1>
</p>
<p align="center">AI 에이전트들이 협업하여 소프트웨어 개발을 자동화하는 시스템</p>
<p align="center">
  <a href="https://github.com/Kuneosu/Claude-Multi-Agent-System/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/Kuneosu/Claude-Multi-Agent-System?style=flat-square" /></a>
  <a href="https://github.com/Kuneosu/Claude-Multi-Agent-System/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/Kuneosu/Claude-Multi-Agent-System?style=flat-square" /></a>
  <a href="https://github.com/Kuneosu/Claude-Multi-Agent-System/issues"><img alt="Issues" src="https://img.shields.io/github/issues/Kuneosu/Claude-Multi-Agent-System?style=flat-square" /></a>
</p>
<p align="center">
  <a href="./README.md">English</a>
</p>

<img width="2032" alt="MAS Dashboard" src="https://github.com/user-attachments/assets/cbc73a73-597b-4fe8-8a01-cab8cd0d357b" />

---

### 빠른 시작

```bash
# 저장소 클론
git clone https://github.com/Kuneosu/Claude-Multi-Agent-System.git
cd Claude-Multi-Agent-System

# 설정 (의존성 확인)
./setup.sh

# 실행
./run.sh
```

> [!TIP]
> Claude CLI가 설치되어 있어야 합니다: `npm install -g @anthropic-ai/claude-code`

### 의존성

| 의존성 | 버전 | 필수 여부 |
|--------|------|----------|
| Node.js | >= 14.0.0 | 필수 |
| tmux | 최신 | 필수 |
| Claude CLI | 최신 | 필수 |
| ttyd | 최신 | 선택 (대시보드용) |

### 에이전트

MAS는 **9개의 전문 AI 에이전트**가 협업합니다:

```
orchestrator (중앙 제어)
    ├─> requirement-analyst  (요구사항 분석)
    ├─> ux-designer         (UX 설계)
    ├─> tech-architect      (기술 아키텍처)
    ├─> planner            (구현 계획)
    ├─> test-designer      (테스트 설계 - TDD)
    ├─> developer          (코드 구현)
    ├─> reviewer           (코드 리뷰)
    └─> documenter         (문서화)
```

각 에이전트는 고유한 역할을 가지며, 파일 기반 IPC 시그널로 통신합니다.

### 실행 모드

| 모드 | 메뉴 | 설명 |
|------|------|------|
| 터미널 | 1) 터미널 실행 | 각 작업에 수동 승인 필요 |
| 터미널 (Auto) | 2) 터미널 실행 (Auto) | 완전 자동화, 확인 없음 |
| 대시보드 | 3) 웹 대시보드 | 웹 기반 모니터링 UI |
| 대시보드 (Auto) | 4) 웹 대시보드 (Auto) | 웹 UI + 완전 자동화 |

### 주요 기능

- **멀티 에이전트 협업**: 9개 에이전트가 오케스트레이션된 워크플로우로 협업
- **TDD 방식**: Test Designer → Developer → Reviewer 파이프라인
- **웹 대시보드**: `http://localhost:8080`에서 실시간 모니터링
- **모델 설정 가능**: 에이전트별 Claude 모델 설정 (opus/sonnet/haiku)
- **파일 기반 IPC**: 시그널을 통한 안정적인 에이전트 간 통신

### 문서

자세한 문서는 다음을 참고하세요:

- [빠른 시작 가이드](docs/QUICKSTART.md)
- [사용자 가이드](docs/GUIDE.md)
- [아키텍처 개요](docs/ARCHITECTURE.md)
- [시스템 아키텍처](docs/SYSTEM_ARCHITECTURE.md)

### 보안 주의사항

> [!WARNING]
> **Auto 모드**는 `--dangerously-skip-permissions` 플래그를 사용합니다. 이 모드에서는:
> - 에이전트가 확인 없이 파일을 생성/수정/삭제할 수 있습니다
> - 시스템 명령어가 자동으로 실행됩니다
> - 신뢰할 수 있는 환경에서만 사용하세요

일반 모드(1, 3번 옵션)는 모든 작업에 사용자 승인이 필요합니다.

### 기여하기

기여를 환영합니다! Pull Request를 자유롭게 제출해주세요.

1. 저장소 Fork
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 열기

### FAQ

#### MAS는 단일 AI 어시스턴트와 어떻게 다른가요?

MAS는 각 개발 단계에 전문화된 에이전트를 사용합니다. 하나의 AI가 모든 것을 처리하는 대신, 각 에이전트가 자신의 도메인에 집중합니다:
- 전문화를 통한 더 나은 품질
- 병렬 처리 가능
- 코드 리뷰와 테스트 단계 내장

#### 어떤 모델을 지원하나요?

MAS는 **Claude CLI** 기반으로 다음을 지원합니다:
- Claude Opus (orchestrator, developer에 권장)
- Claude Sonnet (균형 잡힌 성능)
- Claude Haiku (빠르고 비용 효율적)

#### 에이전트를 커스터마이징할 수 있나요?

네! 각 에이전트의 동작은 `workspace/agents/[agent-name]/CLAUDE.md`에 정의되어 있습니다. 이 프롬프트를 수정하여 에이전트 동작을 커스터마이징할 수 있습니다.

#### 비용은 얼마나 드나요?

**Claude Max ($100/월) 이상** 요금제 사용을 권장합니다. 프로젝트 복잡도에 따라 비용이 달라지지만, Max 요금제의 무제한 API 접근이 가장 좋은 경험을 제공합니다.

> [!NOTE]
> Sonnet과 Haiku 모델은 간혹 지시를 제대로 수행하지 못하는 경우가 있습니다. 안정적인 결과를 위해 **모든 에이전트에 Opus 사용**을 권장합니다.

---

**라이선스**: [MIT](LICENSE)
