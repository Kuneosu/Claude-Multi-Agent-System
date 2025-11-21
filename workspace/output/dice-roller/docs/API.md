# API 레퍼런스

## 컴포넌트

### App

루트 컴포넌트. WebGL 지원 확인, 상태 관리, 키보드 이벤트 처리.

```jsx
import App from './App';
```

**내부 상태:**
- `isRolling`: 굴리는 중 여부
- `currentResult`: 현재 결과 (1-6)

**키보드 이벤트:**
- SPACE: 주사위 굴리기

---

### DiceScene

Three.js 3D 씬 + Rapier 물리 엔진 컨테이너.

```jsx
import DiceScene from './components/DiceScene';

<DiceScene
  isRolling={boolean}
  onDiceSettled={(result: number) => void}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isRolling` | `boolean` | Yes | 주사위 굴리기 시작 트리거 |
| `onDiceSettled` | `(result: number) => void` | Yes | 주사위 정지 후 결과 콜백 |

**내부 컴포넌트:**
- `Floor`: 나무 바닥 (RigidBody fixed)
- `PhysicsDice`: 물리 주사위 (RigidBody dynamic)

---

### PhysicsDice (내부 컴포넌트)

물리 엔진 기반 주사위 컴포넌트.

```jsx
<PhysicsDice
  isRolling={boolean}
  onSettled={(result: number) => void}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isRolling` | `boolean` | Yes | 굴리기 시작 감지 |
| `onSettled` | `(result: number) => void` | No | 정지 후 콜백 |

**물리 동작:**
1. `isRolling` true 감지 시:
   - 초기 위치로 리셋 (y=5)
   - 랜덤 초기 회전 적용
   - 랜덤 던지기 힘/회전력 적용
2. 100ms 간격으로 정지 체크
3. 300ms 이상 정지 시 `onSettled` 호출

---

### Floor (내부 컴포넌트)

물리 바닥 컴포넌트.

```jsx
<Floor />
```

**특징:**
- RigidBody type: "fixed"
- CuboidCollider: [10, 0.1, 10]
- 나무 마룻바닥 텍스처

---

### RollButton

주사위 굴리기 버튼.

```jsx
import RollButton from './components/RollButton';

<RollButton
  isRolling={boolean}
  onClick={() => void}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isRolling` | `boolean` | Yes | 굴리는 중이면 버튼 비활성화 |
| `onClick` | `() => void` | Yes | 클릭 핸들러 |

---

### ResultDisplay

주사위 결과 표시 컴포넌트.

```jsx
import ResultDisplay from './components/ResultDisplay';

<ResultDisplay
  result={number | null}
  isVisible={boolean}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `result` | `number \| null` | Yes | 표시할 결과 (1-6) |
| `isVisible` | `boolean` | Yes | 표시 여부 |

---

### ErrorBoundary

에러 경계 컴포넌트.

```jsx
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <ChildComponent />
</ErrorBoundary>
```

---

## 커스텀 훅

### useWebGLSupport

WebGL 지원 여부를 확인하는 훅.

```javascript
import { useWebGLSupport } from './hooks/useWebGLSupport';

const isSupported = useWebGLSupport();
```

**반환값:** `boolean`

---

## 유틸리티 함수

### diceUtils.js

#### generateRandomNumber

1-6 범위의 무작위 정수를 생성합니다.

```javascript
import { generateRandomNumber } from './utils/diceUtils';

const result = generateRandomNumber(); // 1-6
```

**반환값:** `number` (1-6)

---

#### getTargetRotation

주사위 결과에 따른 목표 회전 각도를 반환합니다.

```javascript
import { getTargetRotation } from './utils/diceUtils';

const rotation = getTargetRotation(6); // [Math.PI, 0, 0]
```

**매개변수:**

| Param | Type | Description |
|-------|------|-------------|
| `result` | `number` | 주사위 결과 (1-6) |

**반환값:** `[number, number, number]` - [x, y, z] (라디안)

---

#### generateRandomSpin

랜덤 스핀 회전 값을 생성합니다.

```javascript
import { generateRandomSpin } from './utils/diceUtils';

const spin = generateRandomSpin();
// { x: 12.566..., y: 18.849..., z: 7.853... }
```

**반환값:** `{ x: number, y: number, z: number }`

---

### animationUtils.js

#### easeOutCubic

easeOutCubic 이징 함수.

```javascript
import { easeOutCubic } from './utils/animationUtils';

const eased = easeOutCubic(0.5); // 0.875
```

**공식:** `1 - (1 - t)³`

---

## 상수 (constants.js)

### 기본 상수

```javascript
// 애니메이션 관련
export const ANIMATION_DURATION = 1.5; // 초

// 주사위 크기
export const DICE_SIZE = 1;

// 카메라 설정
export const CAMERA_POSITION = [0, 0, 5];
export const CAMERA_FOV = 50;
```

---

### ROTATION_MAP

각 숫자에 대한 회전 매핑.

```javascript
export const ROTATION_MAP = {
  1: [0, 0, 0],                  // +Y가 위
  2: [-Math.PI / 2, 0, 0],       // +Z가 위
  3: [0, 0, -Math.PI / 2],       // +X가 위
  4: [0, 0, Math.PI / 2],        // -X가 위
  5: [Math.PI / 2, 0, 0],        // -Z가 위
  6: [Math.PI, 0, 0],            // -Y가 위
};
```

---

### COLORS

색상 상수.

```javascript
export const COLORS = {
  primary: '#4A90E2',
  primaryHover: '#357ABD',
  disabled: '#CCCCCC',
  text: '#333333',
  white: '#FFFFFF',
  diceBody: '#FFFFFF',
  diceDots: '#333333',
};
```

---

### PHYSICS

물리 엔진 설정.

```javascript
export const PHYSICS = {
  gravity: [0, -20, 0],   // 중력 벡터
  restitution: 0.3,       // 반발 계수 (0-1, 높을수록 탄성적)
  friction: 0.8,          // 마찰 계수 (0-1, 높을수록 미끄러지지 않음)
  linearDamping: 0.5,     // 선형 감쇠 (이동 속도 감소)
  angularDamping: 0.5,    // 각속도 감쇠 (회전 속도 감소)
};
```

**사용처:**
- `<Physics gravity={PHYSICS.gravity}>`
- `<RigidBody restitution={PHYSICS.restitution} ...>`

---

### SETTLE_DETECTION

주사위 정지 감지 설정.

```javascript
export const SETTLE_DETECTION = {
  speedThreshold: 0.1,      // 선형 속도 임계값 (m/s)
  angSpeedThreshold: 0.1,   // 각속도 임계값 (rad/s)
  settleTime: 300,          // 정지 확인 시간 (ms)
  checkInterval: 100,       // 체크 주기 (ms)
};
```

**정지 조건:**
- 선형 속도 < `speedThreshold` AND
- 각속도 < `angSpeedThreshold`
- `settleTime`ms 동안 유지

---

### THROW_CONFIG

던지기 힘 설정.

```javascript
export const THROW_CONFIG = {
  initialHeight: 5,         // 초기 높이 (y 좌표)
  horizontalForce: 8,       // 수평 힘 범위 (±값)
  verticalForce: -2,        // 수직 힘 (아래 방향)
  torqueRange: 30,          // 회전력 범위 (±값)
};
```

**적용 방식:**
```javascript
// 초기 위치
rigidBody.setTranslation({ x: 0, y: initialHeight, z: 0 });

// 던지기 힘
rigidBody.setLinvel({
  x: (Math.random() - 0.5) * horizontalForce,
  y: verticalForce,
  z: (Math.random() - 0.5) * horizontalForce,
});

// 회전력
rigidBody.setAngvel({
  x: (Math.random() - 0.5) * torqueRange,
  y: (Math.random() - 0.5) * torqueRange,
  z: (Math.random() - 0.5) * torqueRange,
});
```

---

## 내부 함수

### getTopFace

주사위 윗면 숫자를 계산합니다.

```javascript
function getTopFace(euler: THREE.Euler): number
```

**매개변수:**
- `euler`: 주사위의 현재 회전 (Euler 각도)

**반환값:** `number` (1-6)

**알고리즘:**
1. 각 면의 로컬 노멀 벡터 정의
2. 현재 회전을 적용하여 월드 좌표 노멀 계산
3. 월드 업 벡터 (0, 1, 0)와 내적
4. 가장 큰 내적값을 가진 면 = 윗면

---

### createDiceTexture

주사위 면 텍스처를 생성합니다.

```javascript
function createDiceTexture(number: number): THREE.CanvasTexture
```

**매개변수:**
- `number`: 면에 표시할 숫자 (1-6)

**반환값:** `THREE.CanvasTexture`

---

### createWoodTexture

나무 바닥 텍스처를 생성합니다.

```javascript
function createWoodTexture(): THREE.CanvasTexture
```

**반환값:** `THREE.CanvasTexture`

---

## 타입 정의 (TypeScript 참고용)

```typescript
// Props 타입
interface DiceSceneProps {
  isRolling: boolean;
  onDiceSettled: (result: number) => void;
}

interface PhysicsDiceProps {
  isRolling: boolean;
  onSettled?: (result: number) => void;
}

interface RollButtonProps {
  isRolling: boolean;
  onClick: () => void;
}

interface ResultDisplayProps {
  result: number | null;
  isVisible: boolean;
}

// 상수 타입
interface PhysicsConfig {
  gravity: [number, number, number];
  restitution: number;
  friction: number;
  linearDamping: number;
  angularDamping: number;
}

interface SettleDetectionConfig {
  speedThreshold: number;
  angSpeedThreshold: number;
  settleTime: number;
  checkInterval: number;
}

interface ThrowConfig {
  initialHeight: number;
  horizontalForce: number;
  verticalForce: number;
  torqueRange: number;
}
```
