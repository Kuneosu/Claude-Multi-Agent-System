# 아키텍처 문서

## 시스템 개요

3D Dice Roller는 React와 Three.js 기반의 클라이언트 사이드 웹 애플리케이션입니다. **Rapier 물리 엔진**을 통해 현실적인 주사위 굴림을 시뮬레이션하며, WebGL을 통해 3D 그래픽을 렌더링합니다.

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                         App (Root)                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────────────────────────────┐ │
│  │ useWebGLSupport │  │          State Management              │ │
│  │  (Hook)         │  │  - isRolling: boolean                  │ │
│  └────────────────┘  │  - currentResult: number | null         │ │
│                       │  - rollDice(): void                     │ │
│  ┌────────────────┐  │  - handleDiceSettled(result): void      │ │
│  │ Keyboard Event │  └────────────────────────────────────────┘ │
│  │ (SPACE key)    │                                             │
│  └────────────────┘                                             │
├─────────────────────────────────────────────────────────────────┤
│                    ErrorBoundary                                 │
│  ┌────────────────────────────┬───────────────────────────────┐ │
│  │      DiceScene             │       Overlay UI              │ │
│  │  ┌──────────────────────┐  │  ┌────────────────────────┐  │ │
│  │  │  <Canvas>            │  │  │  ResultDisplay         │  │ │
│  │  │  ├─ OrbitControls    │  │  │  - result              │  │ │
│  │  │  ├─ Environment      │  │  │  - isVisible           │  │ │
│  │  │  ├─ Lights           │  │  └────────────────────────┘  │ │
│  │  │  └─ Physics World    │  │  ┌────────────────────────┐  │ │
│  │  │      ├─ Floor        │  │  │  RollButton            │  │ │
│  │  │      │   └─ RigidBody│  │  │  - isRolling           │  │ │
│  │  │      └─ PhysicsDice  │  │  │  - onClick             │  │ │
│  │  │          └─ RigidBody│  │  └────────────────────────┘  │ │
│  │  └──────────────────────┘  │                              │ │
│  └────────────────────────────┴───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 물리 엔진 아키텍처

### Rapier Physics Integration

```
┌──────────────────────────────────────────────────────────────┐
│                    Physics World                              │
│                    (gravity: [0, -20, 0])                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │   Floor (Fixed)     │    │   PhysicsDice (Dynamic)     │  │
│  │   ────────────────  │    │   ─────────────────────────  │  │
│  │   RigidBody: fixed  │    │   RigidBody: dynamic        │  │
│  │   Collider: cuboid  │    │   Collider: cuboid          │  │
│  │   Position: y=0     │    │   restitution: 0.3          │  │
│  │                     │    │   friction: 0.8              │  │
│  │   Material:         │    │   linearDamping: 0.5        │  │
│  │   - Wood texture    │    │   angularDamping: 0.5       │  │
│  │   - receiveShadow   │    │                              │  │
│  └─────────────────────┘    │   Throw Force:              │  │
│                              │   - Position: y=5           │  │
│                              │   - Linear: random xy, -2z  │  │
│                              │   - Angular: random xyz     │  │
│                              └─────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 정지 감지 알고리즘

```
[주사위 던짐]
      │
      ▼
[100ms 주기로 체크] ◄──────────────────┐
      │                                 │
      ▼                                 │
[선형 속도 < 0.1 AND 각속도 < 0.1?]     │
      │                                 │
      ├─ NO ──► [settledTime = null] ───┘
      │
      ▼ YES
[settledTime 시작 or 유지]
      │
      ▼
[300ms 이상 정지 상태 유지?]
      │
      ├─ NO ───────────────────────────┘
      │
      ▼ YES
[getTopFace() 호출]
      │
      ▼
[onDiceSettled(result)]
```

### 윗면 계산 알고리즘 (getTopFace)

```javascript
function getTopFace(euler) {
  // 1. 월드 업 벡터 정의
  const up = new THREE.Vector3(0, 1, 0);

  // 2. 각 면의 로컬 노멀과 숫자 매핑
  const faces = [
    { normal: (+X), value: 3 },
    { normal: (-X), value: 4 },
    { normal: (+Y), value: 1 },
    { normal: (-Y), value: 6 },
    { normal: (+Z), value: 2 },
    { normal: (-Z), value: 5 },
  ];

  // 3. 현재 회전 적용 후 월드 좌표 노멀 계산
  // 4. 업 벡터와 가장 큰 내적값을 가진 면 = 윗면
  return topValue;
}
```

## 컴포넌트 계층

```
App
├── ErrorBoundary                 # WebGL 에러 처리
│   ├── DiceScene                 # Three.js 3D 장면
│   │   └── Canvas (@react-three/fiber)
│   │       ├── OrbitControls     # 카메라 제어
│   │       ├── Environment       # 환경 조명 (apartment preset)
│   │       ├── ambientLight
│   │       ├── directionalLight (x2)
│   │       ├── pointLight
│   │       └── Physics (@react-three/rapier)
│   │           ├── Floor         # 바닥 (RigidBody fixed)
│   │           └── PhysicsDice   # 주사위 (RigidBody dynamic)
│   │
│   └── Overlay UI
│       ├── ResultDisplay         # 결과 표시 (오버레이)
│       └── RollButton            # 굴리기 버튼 (오버레이)
│
└── SPACE hint                    # 키보드 힌트 텍스트
```

## 데이터 플로우

```
[사용자 입력]
    │
    ├─ [버튼 클릭]
    │       │
    │       ▼
    │   [rollDice()]
    │
    └─ [SPACE 키]
            │
            ▼
        [keydown handler]
            │
            ▼
        [rollDice()]
            │
            ▼
[State 업데이트]
    │
    ├─→ setIsRolling(true)
    └─→ setCurrentResult(null)
            │
            ▼
[DiceScene receives: isRolling=true]
            │
            ▼
[PhysicsDice useEffect 감지]
            │
            ├─→ 초기 위치 설정 (y=5)
            ├─→ 랜덤 초기 회전
            ├─→ 랜덤 던지기 힘 적용
            └─→ 랜덤 회전력 적용
            │
            ▼
[물리 시뮬레이션 실행]
            │
            ▼
[100ms 간격 정지 체크]
            │
            ▼
[300ms 이상 정지 감지]
            │
            ▼
[getTopFace() → result]
            │
            ▼
[onDiceSettled(result)]
            │
            ├─→ setCurrentResult(result)
            └─→ setIsRolling(false)
            │
            ▼
[UI 업데이트]
    ├─→ ResultDisplay: 결과 표시
    └─→ RollButton: 활성화
```

## 상태 관리

### App 컴포넌트 상태

| 상태 | 타입 | 설명 |
|-----|------|------|
| `isRolling` | boolean | 주사위 굴리는 중 여부 |
| `currentResult` | number \| null | 현재 결과 (1-6) |

### 키보드 이벤트 처리

```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.code === 'Space' && !isRolling) {
      e.preventDefault();
      rollDice();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isRolling, rollDice]);
```

## Three.js 씬 구성

### 카메라 설정
- **타입**: PerspectiveCamera
- **위치**: [8, 8, 8]
- **FOV**: 50°
- **타겟**: [0, 0.5, 0]

### OrbitControls
- **Pan**: 비활성화
- **Rotate**: 활성화
- **Zoom**: 활성화 (3~20 거리)
- **Polar Angle**: π/6 ~ π/2.5 (바닥 아래 제한)

### 조명 설정
| 조명 | 위치 | 강도 | 역할 |
|-----|------|------|------|
| Environment | - | preset: apartment | IBL 조명 |
| Ambient | - | 0.3 | 전체 기본 조명 |
| Directional | [5, 10, 5] | 1.5 | 주 광원 + 그림자 |
| Directional | [-3, 5, -3] | 0.5 | 보조 광원 |
| Point | [0, 8, 0] | 0.4 | 따뜻한 포인트 조명 |

### 텍스처 생성

#### 나무 바닥 (createWoodTexture)
- Canvas 크기: 1024x1024
- 5개 판자 패턴
- 나무결, 옹이(knots) 포함
- 반복 타일링: 4x4

#### 주사위 면 (createDiceTexture)
- Canvas 크기: 512x512
- 그라데이션 배경
- 점 + 그림자 + 하이라이트
- 둥근 모서리 테두리

## 물리 엔진 상수

### PHYSICS
```javascript
{
  gravity: [0, -20, 0],  // 중력
  restitution: 0.3,       // 반발 계수
  friction: 0.8,          // 마찰 계수
  linearDamping: 0.5,     // 선형 감쇠
  angularDamping: 0.5,    // 각속도 감쇠
}
```

### SETTLE_DETECTION
```javascript
{
  speedThreshold: 0.1,    // 선형 속도 임계값
  angSpeedThreshold: 0.1, // 각속도 임계값
  settleTime: 300,        // 정지 확인 시간 (ms)
  checkInterval: 100,     // 체크 주기 (ms)
}
```

### THROW_CONFIG
```javascript
{
  initialHeight: 5,       // 초기 높이
  horizontalForce: 8,     // 수평 힘 범위
  verticalForce: -2,      // 수직 힘
  torqueRange: 30,        // 회전력 범위
}
```

## 테스트 아키텍처

### 테스트 도구
- **Vitest**: 테스트 러너
- **@testing-library/react**: React 컴포넌트 테스트
- **@testing-library/jest-dom**: DOM 매처
- **jsdom**: 브라우저 환경 시뮬레이션

### 테스트 파일 구조
```
src/
├── utils/
│   ├── constants.js
│   ├── constants.test.js    # 상수 검증 테스트
│   ├── diceUtils.js
│   └── diceUtils.test.js    # 유틸리티 함수 테스트
└── test/
    └── setup.js             # 테스트 설정
```

## 성능 최적화

### Three.js 최적화
- 픽셀 비율 제한: `Math.min(devicePixelRatio, 2)`
- 텍스처 메모이제이션 (useMemo)
- 그림자 맵 해상도: 2048x2048

### React 최적화
- useCallback으로 함수 메모이제이션
- useMemo로 materials/geometry 캐싱

### 물리 엔진 최적화
- 정지 감지로 불필요한 계산 방지
- 단순 cuboid 콜라이더 사용

## 에러 처리

### WebGL 미지원
```javascript
function useWebGLSupport() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') ||
             canvas.getContext('experimental-webgl');
  return !!gl;
}
```

### ErrorBoundary
- Three.js/Rapier 렌더링 에러 캐치
- 사용자 친화적 에러 메시지 표시

## 향후 확장 고려사항

- **여러 주사위**: PhysicsDice 배열 렌더링
- **다면체 주사위**: geometry 팩토리 + 콜라이더 변경
- **결과 이력**: localStorage 또는 Context API
- **사운드 효과**: 충돌 이벤트에 오디오 연결
