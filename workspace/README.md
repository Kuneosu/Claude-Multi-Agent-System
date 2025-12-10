# Multi-Agent Development System Workspace

## 디렉토리 구조

```
workspace/
├── agents/           # 각 에이전트의 작업 디렉토리
├── artifacts/        # 생성된 산출물 (requirements.md, design.md 등)
├── tasks/           # 에이전트별 작업 큐
├── signals/         # 에이전트 간 통신용 시그널 파일
├── status/          # 각 에이전트의 상태 파일
├── logs/            # 실행 로그
├── input/           # 사용자 입력
├── output/          # 최종 결과물
├── tests/           # 테스트 파일
├── docs/            # 문서
└── src/             # 소스 코드
```

## 상태 파일 형식

각 에이전트의 상태:
- `idle`: 대기 중
- `working`: 작업 중
- `waiting_approval`: 사용자 승인 대기
- `completed`: 작업 완료
- `error`: 오류 발생

## 시그널 파일 형식

```
status:completed
artifact:/workspace/artifacts/requirements.md
timestamp:2025-12-10T10:00:00Z
```
