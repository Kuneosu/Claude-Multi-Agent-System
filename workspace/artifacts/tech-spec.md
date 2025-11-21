# 기술 명세서
## 3D 주사위 굴리기 웹 애플리케이션

---

## 1. 기술 스택

### Frontend Framework
- **React 18.2+** (함수형 컴포넌트 + Hooks)
  - 용도: UI 컴포넌트 기반 아키텍처
  - 번들 크기: ~45KB (gzipped)
  - 선택 이유: 컴포넌트 재사용성, Hooks를 통한 상태 관리 용이

### 3D 렌더링 라이브러리
- **Three.js r150+**
  - 용도: WebGL 기반 3D 렌더링 엔진
  - 번들 크기: ~600KB (gzipped, tree-shaking 적용)
  - 선택 이유: 산업 표준, 풍부한 생태계, 안정성

- **@react-three/fiber 8.13+**
  - 용도: React용 Three.js 선언적 래퍼
  - 번들 크기: ~70KB (gzipped)
  - 선택 이유: React 패러다임과 통합, useFrame 등 훅 제공

- **@react-three/drei 9.80+**
  - 용도: 유틸리티 컴포넌트 (OrbitControls, Text3D 등)
  - 번들 크기: ~100KB (gzipped, 선택적 import)
  - 선택 이유: 개발 속도 향상, 카메라/조명 설정 간소화

### 빌드 도구
- **Vite 4.4+**
  - 용도: 개발 서버 및 프로덕션 빌드
  - 선택 이유: 빠른 HMR, ES 모듈 기반, 최적화된 번들링
  - 플러그인: @vitejs/plugin-react

### 패키지 매니저
- **npm 9+** 또는 **yarn 1.22+**
  - 권장: npm (Node.js 18+ 기본 제공)

### 스타일링
- **CSS Modules**
  - 용도: 컴포넌트 스타일 격리
  - 번들 크기: 0KB (별도 런타임 불필요)
  - 선택 이유: Zero runtime overhead, Vite 기본 지원

### 코드 품질 도구
- **ESLint 8+** + eslint-plugin-react
  - 규칙: Airbnb JavaScript Style Guide 기반

- **Prettier 3+**
  - 설정: 세미콜론 사용, 2 스페이스 들여쓰기

### 의존성 분석

#### 총 번들 크기 (예상)
- **초기 로딩**: ~815KB (gzipped)
  - React + ReactDOM: 45KB
  - Three.js: 600KB
  - @react-three/fiber: 70KB
  - @react-three/drei (선택적): 100KB
  - 애플리케이션 코드: ~50KB (예상)

- **실제 로딩 시간** (3G 환경 기준):
  - 815KB ÷ 400KB/s ≈ **2초**
  - 목표: 3초 이내 ✅

#### 대안 검토

**Option A: Vanilla Three.js (No React)**
- 장점:
  - 번들 크기 50% 감소 (~400KB)
  - 초기 로딩 속도 향상
- 단점:
  - 컴포넌트 재사용성 저하
  - 상태 관리 복잡도 증가
  - 개발 속도 저하
- 결론: ❌ 유지보수성 떨어짐

**Option B: React + react-three-fiber (현재 선택)**
- 장점:
  - 선언적 코드로 가독성 향상
  - React 생태계 활용 가능
  - Hooks로 로직 재사용 용이
  - 빠른 프로토타입 개발
- 단점:
  - 번들 크기 증가
  - 추가 학습 곡선
- 결론: ✅ **선택** (MVP 빠른 개발 우선, 향후 확장 고려)

**Option C: Babylon.js + React**
- 장점:
  - Three.js보다 강력한 기능 (물리 엔진 내장)
  - 공식 React 통합 (@babylonjs/react)
- 단점:
  - 번들 크기 더 큼 (~1.2MB)
  - 오버스펙 (물리 엔진 미사용 요구사항)
  - 커뮤니티 규모 작음
- 결론: ❌ 불필요한 기능 포함

---

## 2. 아키텍처

### 폴더 구조

```
dice-roller/
├── public/
│   ├── index.html              # HTML 진입점
│   └── favicon.ico             # 파비콘
│
├── src/
│   ├── components/
│   │   ├── DiceScene/
│   │   │   ├── DiceScene.jsx        # Three.js 3D 장면 컨테이너
│   │   │   ├── DiceScene.module.css # 장면 스타일
│   │   │   └── index.js             # Export
│   │   │
│   │   ├── Dice3D/
│   │   │   ├── Dice3D.jsx           # 주사위 3D 메시 컴포넌트
│   │   │   ├── diceGeometry.js      # 주사위 형상 정의
│   │   │   └── index.js
│   │   │
│   │   ├── ControlPanel/
│   │   │   ├── ControlPanel.jsx     # UI 컨트롤 패널
│   │   │   ├── ControlPanel.module.css
│   │   │   └── index.js
│   │   │
│   │   ├── RollButton/
│   │   │   ├── RollButton.jsx       # 굴리기 버튼
│   │   │   ├── RollButton.module.css
│   │   │   └── index.js
│   │   │
│   │   ├── ResultDisplay/
│   │   │   ├── ResultDisplay.jsx    # 결과 표시 UI
│   │   │   ├── ResultDisplay.module.css
│   │   │   └── index.js
│   │   │
│   │   └── ErrorBoundary/
│   │       ├── ErrorBoundary.jsx    # WebGL 미지원 에러 처리
│   │       └── index.js
│   │
│   ├── hooks/
│   │   ├── useDiceRoll.js           # 주사위 굴림 로직 커스텀 훅
│   │   ├── useWebGLSupport.js       # WebGL 지원 확인 훅
│   │   └── useResponsive.js         # 반응형 크기 조정 훅
│   │
│   ├── utils/
│   │   ├── diceUtils.js             # 주사위 관련 유틸리티 함수
│   │   │                            # - getTargetRotation(result)
│   │   │                            # - generateRandomNumber(1-6)
│   │   ├── animationUtils.js        # 애니메이션 Easing 함수
│   │   └── constants.js             # 상수 정의 (애니메이션 시간 등)
│   │
│   ├── App.jsx                      # 루트 컴포넌트
│   ├── App.module.css               # 전역 레이아웃 스타일
│   ├── main.jsx                     # ReactDOM 렌더링 진입점
│   └── index.css                    # 전역 스타일 (리셋, 폰트)
│
├── package.json                     # 의존성 관리
├── vite.config.js                   # Vite 설정
├── .eslintrc.cjs                    # ESLint 규칙
├── .prettierrc                      # Prettier 설정
├── .gitignore
└── README.md                        # 프로젝트 문서
```

### 컴포넌트 계층 구조

```
App (Root)
│
├── ErrorBoundary
│   └── [에러 발생 시 대체 UI]
│
├── DiceScene (Canvas 기반 3D 장면)
│   ├── <Canvas> (@react-three/fiber)
│   │   ├── <PerspectiveCamera />
│   │   ├── <ambientLight />
│   │   ├── <directionalLight />
│   │   └── <Dice3D /> (주사위 메시)
│   │       └── <mesh> + <boxGeometry> + <meshStandardMaterial>
│
└── ControlPanel (UI 컨트롤)
    ├── RollButton (굴리기 버튼)
    └── ResultDisplay (결과 표시)
```

### 데이터 플로우

```
[사용자 액션]
      ↓
[RollButton onClick]
      ↓
[useDiceRoll Hook 호출]
      ↓
[상태 업데이트: isRolling = true]
      ↓
[무작위 숫자 생성 (1-6)]
      ↓
[Dice3D 컴포넌트에 애니메이션 트리거 전달]
      ↓
[useFrame Hook 내부에서 회전 애니메이션 실행]
      ↓
[1.5초 후 애니메이션 완료]
      ↓
[상태 업데이트: isRolling = false, currentResult = [숫자]]
      ↓
[ResultDisplay 렌더링 (Fade-in)]
      ↓
[RollButton 재활성화]
```

### 상태 관리 전략

#### 전역 상태 (App.jsx)
```javascript
// React useState 사용 (Redux 불필요)
const [isRolling, setIsRolling] = useState(false);
const [currentResult, setCurrentResult] = useState(null);
const [targetRotation, setTargetRotation] = useState([0, 0, 0]);
```

#### Props Drilling
```
App
 ├─> DiceScene ({ isRolling, targetRotation })
 │    └─> Dice3D ({ isRolling, targetRotation })
 │
 └─> ControlPanel
      ├─> RollButton ({ isRolling, onRoll })
      └─> ResultDisplay ({ currentResult, isRolling })
```

---

## 3. 성능 고려사항

### 렌더링 최적화

#### 1. React 렌더링 최적화
```javascript
// React.memo로 불필요한 재렌더링 방지
export default React.memo(ResultDisplay);

// useMemo로 비싼 계산 캐싱
const diceGeometry = useMemo(() => new THREE.BoxGeometry(2, 2, 2), []);
```

#### 2. Three.js 렌더링 최적화
- **픽셀 비율 제한**: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
  - 모바일에서 과도한 픽셀 비율 방지 (배터리 절약)

- **프레임 스킵**: 30 FPS 미만 감지 시 애니메이션 품질 자동 하향

- **LOD (Level of Detail) 미사용**: 주사위 1개만 렌더링하므로 불필요

#### 3. 번들 최적화
```javascript
// Vite 설정: Tree-shaking + Code splitting
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
};
```

### 병목 지점 분석

#### 병목 1: Three.js 초기 로딩 (~600KB)
- **영향도**: High
- **완화 방안**:
  - Lazy loading (Canvas 컴포넌트 지연 로드)
  - CDN 사용 (Cloudflare/jsDelivr)
  - HTTP/2 푸시 (서버 설정)
  - 로딩 인디케이터 표시

#### 병목 2: 모바일 디바이스 GPU 성능
- **영향도**: Medium
- **완화 방안**:
  - 픽셀 비율 제한 (최대 2x)
  - Antialiasing 선택적 비활성화
  - 그림자 품질 단계별 조정
  - `prefers-reduced-motion` 감지 시 애니메이션 간소화

#### 병목 3: 애니메이션 중 CPU 사용률
- **영향도**: Low
- **완화 방안**:
  - `requestAnimationFrame` 사용 (Three.js 기본)
  - 불필요한 상태 업데이트 최소화
  - useFrame Hook 최적화 (조건부 실행)

### 메모리 관리

```javascript
// 컴포넌트 언마운트 시 Three.js 리소스 정리
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}, []);
```

---

## 4. 리스크 분석

### ⚠️ Risk 1: WebGL 미지원 브라우저
- **영향도**: High
- **확률**: Low (최신 브라우저 95% 지원)
- **완화 방안**:
  - `useWebGLSupport` 훅으로 진입 시 확인
  - ErrorBoundary 컴포넌트로 대체 UI 표시
  - 명확한 안내 메시지 + 권장 브라우저 목록

```javascript
// useWebGLSupport.js
export function useWebGLSupport() {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setIsSupported(!!gl);
  }, []);

  return isSupported;
}
```

### ⚠️ Risk 2: 낮은 프레임레이트 (< 30 FPS)
- **영향도**: Medium
- **확률**: Medium (저사양 모바일)
- **완화 방안**:
  - 성능 감지 시 렌더링 품질 자동 조정
  - 사용자에게 성능 경고 표시 (선택)
  - 애니메이션 지속 시간 단축 옵션

### ⚠️ Risk 3: 번들 크기로 인한 느린 로딩
- **영향도**: Medium
- **확률**: Low (평균 네트워크 속도 향상)
- **완화 방안**:
  - Lighthouse 점수 모니터링 (목표: 90+)
  - 로딩 인디케이터로 사용자 이탈 방지
  - Progressive Web App (PWA) 캐싱 (향후)

### ⚠️ Risk 4: 메모리 누수
- **영향도**: Low
- **확률**: Low (React + Three.js 안정성)
- **완화 방안**:
  - useEffect cleanup 철저히 구현
  - Chrome DevTools Memory Profiler로 테스트
  - 장시간 사용 시뮬레이션 (100회 이상 굴리기)

### ⚠️ Risk 5: 크로스 브라우저 호환성 이슈
- **영향도**: Low
- **확률**: Medium (Safari 특이사항)
- **완화 방안**:
  - BrowserStack으로 실제 디바이스 테스트
  - Polyfill 추가 (필요 시)
  - Safari 특화 CSS 미디어 쿼리

---

## 5. 브라우저 지원

### 최소 요구사항
- **WebGL 1.0** 지원 필수
- **ES6+** 지원 (async/await, 화살표 함수 등)
- **CSS Grid & Flexbox** 지원

### 지원 브라우저 버전

| 브라우저 | 최소 버전 | 권장 버전 | 비고 |
|---------|----------|----------|------|
| **Chrome** | 90+ | 최신 | ✅ 최적화됨 |
| **Firefox** | 88+ | 최신 | ✅ 완전 지원 |
| **Safari** | 14+ | 최신 | ⚠️ 일부 CSS 제약 |
| **Edge** | 90+ | 최신 | ✅ Chrome 기반 |
| **Opera** | 76+ | 최신 | ✅ Chrome 기반 |
| **Samsung Internet** | 14+ | 최신 | ⚠️ 성능 테스트 필요 |

### 미지원 환경
- ❌ Internet Explorer (전 버전)
- ❌ Opera Mini
- ❌ WebGL 비활성화된 브라우저
- ❌ 10년 이상 된 모바일 디바이스

### Feature Detection
```javascript
// 진입 시 자동 확인
const isWebGLSupported = checkWebGLSupport();
const isES6Supported = typeof Promise !== 'undefined';

if (!isWebGLSupported || !isES6Supported) {
  // 에러 UI 표시
}
```

---

## 6. 주요 알고리즘

### 6.1 무작위 숫자 생성
```javascript
// utils/diceUtils.js
export function generateRandomNumber() {
  return Math.floor(Math.random() * 6) + 1; // 1-6
}
```

### 6.2 목표 회전 계산
```javascript
// 각 면이 위를 향하도록 하는 회전 각도 (라디안)
const ROTATION_MAP = {
  1: [0, 0, 0],                    // 1이 위
  2: [0, Math.PI, 0],              // 2가 위
  3: [0, 0, -Math.PI / 2],         // 3이 위
  4: [0, 0, Math.PI / 2],          // 4가 위
  5: [Math.PI / 2, 0, 0],          // 5가 위
  6: [-Math.PI / 2, 0, 0],         // 6이 위
};

export function getTargetRotation(result) {
  return ROTATION_MAP[result];
}
```

### 6.3 Easing 함수 (easeOutCubic)
```javascript
// utils/animationUtils.js
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// 사용 예시
const progress = (currentTime - startTime) / duration;
const easedProgress = easeOutCubic(progress);
```

### 6.4 회전 애니메이션 로직
```javascript
// components/Dice3D/Dice3D.jsx
useFrame(({ clock }) => {
  if (!isRolling) return;

  const elapsed = clock.getElapsedTime() - startTime;
  const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

  if (progress < 1) {
    // 회전 단계 (0 - 0.8)
    const t = easeOutCubic(progress);
    meshRef.current.rotation.x = spinRotation.x * t;
    meshRef.current.rotation.y = spinRotation.y * t;
    meshRef.current.rotation.z = spinRotation.z * t;
  } else {
    // 정착 단계 (0.8 - 1.0)
    meshRef.current.rotation.set(...targetRotation);
    setIsRolling(false);
  }
});
```

---

## 7. API 명세 (내부 인터페이스)

### 7.1 커스텀 훅: `useDiceRoll`

```javascript
/**
 * 주사위 굴리기 로직을 관리하는 커스텀 훅
 * @returns {Object}
 */
export function useDiceRoll() {
  return {
    isRolling: boolean,           // 굴리는 중 여부
    currentResult: number | null, // 현재 결과 (1-6)
    rollDice: () => void,         // 주사위 굴리기 함수
    targetRotation: [x, y, z],    // 목표 회전 각도
  };
}
```

### 7.2 컴포넌트 Props

#### Dice3D
```typescript
interface Dice3DProps {
  isRolling: boolean;
  targetRotation: [number, number, number];
  onAnimationComplete?: () => void;
}
```

#### RollButton
```typescript
interface RollButtonProps {
  isRolling: boolean;
  onClick: () => void;
}
```

#### ResultDisplay
```typescript
interface ResultDisplayProps {
  result: number | null;
  isVisible: boolean;
}
```

---

## 8. 배포 및 빌드

### 개발 환경
```bash
npm run dev
# Vite dev server: http://localhost:5173
# HMR 활성화, Source maps 제공
```

### 프로덕션 빌드
```bash
npm run build
# 출력: dist/ 폴더
# 번들 크기 분석: dist/assets/
```

### 배포 플랫폼 (권장)
- **Vercel**: Zero-config, 자동 HTTPS
- **Netlify**: 무료 티어, CDN
- **GitHub Pages**: 정적 호스팅

---

## 9. 테스트 전략

### 9.1 단위 테스트 (선택)
- **도구**: Vitest (Vite 네이티브)
- **대상**:
  - `generateRandomNumber()` - 1-6 범위 확인
  - `getTargetRotation()` - 올바른 각도 반환
  - `easeOutCubic()` - 수학 함수 정확성

### 9.2 통합 테스트 (선택)
- **도구**: React Testing Library
- **대상**:
  - 버튼 클릭 시 `isRolling` 상태 변경
  - 애니메이션 완료 후 결과 표시

### 9.3 E2E 테스트 (선택)
- **도구**: Playwright
- **시나리오**:
  - 사용자가 버튼 클릭 → 2초 후 결과 표시
  - 키보드 (Space/Enter)로 주사위 굴리기

### 9.4 수동 테스트 (필수)
- ✅ Chrome DevTools Lighthouse (성능 점수)
- ✅ BrowserStack (크로스 브라우저)
- ✅ 실제 모바일 디바이스 (iOS, Android)
- ✅ 느린 네트워크 시뮬레이션 (3G)

---

## 10. 보안 고려사항

### XSS 방지
- React의 기본 XSS 보호 활용 (JSX 자동 이스케이프)
- `dangerouslySetInnerHTML` 사용 금지

### CSP (Content Security Policy)
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

### HTTPS 필수
- 프로덕션 환경에서 HTTPS 강제 (Vercel/Netlify 자동 제공)

---

## 11. 확장성 고려사항

### 향후 추가 기능 대비 설계

#### 1. 다면체 주사위 (D4, D8, D12, D20)
- `diceGeometry.js`에 `createDiceGeometry(sides)` 함수 추가
- `ROTATION_MAP` 확장

#### 2. 여러 개 주사위 동시 굴리기
- 상태를 배열로 변경: `currentResults: number[]`
- `Dice3D` 컴포넌트를 `map()`으로 렌더링

#### 3. 결과 이력 저장
- `localStorage` 활용
- 새로운 `ResultHistory` 컴포넌트 추가

#### 4. 다크모드
- CSS 변수 활용
- `prefers-color-scheme` 미디어 쿼리

---

## 12. 성공 지표 (Technical Metrics)

### 성능 목표
- ✅ **Lighthouse Performance Score**: 90 이상
- ✅ **First Contentful Paint (FCP)**: 1.5초 이내
- ✅ **Time to Interactive (TTI)**: 3초 이내
- ✅ **프레임레이트**: 30 FPS 이상 (모바일), 60 FPS (데스크톱)

### 번들 크기 목표
- ✅ **초기 로딩**: 850KB 이하 (gzipped)
- ✅ **JavaScript**: 750KB 이하
- ✅ **CSS**: 10KB 이하

### 접근성 목표
- ✅ **Lighthouse Accessibility Score**: 100
- ✅ **WCAG 2.1 Level AA**: 완전 준수

---

## 13. 개발 우선순위 (Implementation Roadmap)

### Sprint 1: 핵심 기능 (1주차)
1. ✅ Vite + React 프로젝트 초기화
2. ✅ Three.js 환경 설정 (Camera, Light)
3. ✅ 기본 Dice3D 컴포넌트 (정육면체)
4. ✅ RollButton + 클릭 이벤트
5. ✅ 무작위 숫자 생성 로직

### Sprint 2: 애니메이션 (1주차)
1. ✅ 회전 애니메이션 구현 (useFrame)
2. ✅ Easing 함수 적용
3. ✅ 목표 면 정렬 로직
4. ✅ 버튼 상태 관리 (비활성화/활성화)

### Sprint 3: UI/UX (3-4일)
1. ✅ 반응형 레이아웃 (CSS Modules)
2. ✅ ResultDisplay 컴포넌트 + Fade-in
3. ✅ 접근성 개선 (ARIA, 키보드)
4. ✅ 주사위 텍스처 추가 (1-6 숫자)

### Sprint 4: 최적화 & 테스트 (2-3일)
1. ✅ 성능 최적화 (React.memo, useMemo)
2. ✅ WebGL 미지원 에러 처리
3. ✅ 크로스 브라우저 테스트
4. ✅ Lighthouse 감사

### Sprint 5: 배포 (1일)
1. ✅ 프로덕션 빌드 최적화
2. ✅ Vercel 배포
3. ✅ 최종 QA

---

## 14. 참고 자료

### 공식 문서
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)

### 예제 코드
- [React Three Fiber Examples](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)
- [Three.js Dice Example](https://threejs.org/examples/#misc_animation_keys)

### 라이브러리 버전
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.150.0",
    "@react-three/fiber": "^8.13.0",
    "@react-three/drei": "^9.80.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 문서 정보

- **버전**: 1.0
- **작성일**: 2024년
- **담당**: Tech Architect Agent
- **상태**: 최종 완료 ✅
- **참조 문서**:
  - requirements.md (요구사항)
  - ux-design.md (UX 설계)
- **다음 단계**: Developer Agent에게 전달하여 구현 시작

---

**기술 명세서 작성 완료** ✅
