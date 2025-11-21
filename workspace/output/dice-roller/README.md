# 3D Dice Roller

Three.js와 React를 활용한 인터랙티브 3D 주사위 굴리기 웹 애플리케이션입니다. **물리 엔진 기반**의 현실적인 주사위 굴림과 함께 무작위 결과(1~6)를 확인할 수 있습니다.

## 주요 기능

- **물리 엔진 기반 시뮬레이션**: Rapier 물리 엔진으로 현실적인 주사위 굴림 구현
- **3D 주사위 렌더링**: WebGL 기반 Three.js로 구현된 실감나는 6면체 주사위
- **자동 결과 감지**: 주사위 정지 시 윗면 숫자를 자동으로 계산
- **키보드 조작**: SPACE 키로 빠르게 주사위 굴리기
- **카메라 조작**: 마우스로 시점 회전 및 줌 가능 (OrbitControls)
- **고급 시각 효과**: 나무 마룻바닥, 그림자, 환경 조명
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 화면에 최적화

## 기술 스택

- **React 19** - UI 프레임워크
- **Three.js** - 3D 그래픽 라이브러리
- **@react-three/fiber** - React용 Three.js 선언적 래퍼
- **@react-three/rapier** - Rapier 물리 엔진 통합
- **@react-three/drei** - 유틸리티 컴포넌트 (OrbitControls, Environment)
- **Vite** - 빌드 도구
- **Vitest** - 테스트 프레임워크
- **CSS Modules** - 스타일링

## 시작하기

### 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd dice-roller

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`에 접속합니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 테스트 실행

```bash
# 테스트 (watch 모드)
npm run test

# 테스트 (단일 실행)
npm run test:run
```

### 코드 린트

```bash
npm run lint
```

## 프로젝트 구조

```
dice-roller/
├── public/                    # 정적 파일
├── src/
│   ├── components/            # React 컴포넌트
│   │   ├── ControlPanel/      # 컨트롤 패널 (레거시)
│   │   ├── DiceScene/         # Three.js 씬 + 물리 엔진
│   │   ├── ErrorBoundary/     # 에러 처리
│   │   ├── ResultDisplay/     # 결과 표시
│   │   └── RollButton/        # 굴리기 버튼
│   ├── hooks/
│   │   └── useWebGLSupport.js # WebGL 지원 확인
│   ├── utils/
│   │   ├── constants.js       # 상수 정의 (물리 설정 포함)
│   │   ├── constants.test.js  # 상수 테스트
│   │   ├── diceUtils.js       # 주사위 유틸리티
│   │   ├── diceUtils.test.js  # 유틸리티 테스트
│   │   └── animationUtils.js  # 애니메이션 함수
│   ├── test/                  # 테스트 설정
│   ├── App.jsx                # 루트 컴포넌트
│   ├── App.module.css         # 앱 스타일
│   └── main.jsx               # 엔트리 포인트
├── docs/                      # 문서
├── package.json
└── vite.config.js
```

## 사용 방법

### 기본 조작
1. 애플리케이션이 로드되면 나무 바닥 위에 3D 주사위가 표시됩니다.
2. **"Roll Dice"** 버튼을 클릭하거나 **SPACE** 키를 누릅니다.
3. 주사위가 물리적으로 굴러가며 자연스럽게 멈춥니다.
4. 정지 후 윗면 숫자가 자동으로 감지되어 표시됩니다.

### 카메라 조작
- **드래그**: 시점 회전
- **스크롤**: 줌 인/아웃
- **제한**: 바닥 아래로는 회전 불가

### 키보드 단축키
| 키 | 동작 |
|----|------|
| SPACE | 주사위 굴리기 |

## 물리 엔진 설정

| 설정 | 값 | 설명 |
|-----|-----|------|
| 중력 | [0, -20, 0] | Y축 방향 중력 |
| 반발 계수 | 0.3 | 바운스 정도 |
| 마찰 계수 | 0.8 | 바닥과의 마찰 |
| 선형 감쇠 | 0.5 | 이동 속도 감쇠 |
| 각속도 감쇠 | 0.5 | 회전 속도 감쇠 |

## 브라우저 지원

| 브라우저 | 최소 버전 |
|---------|----------|
| Chrome  | 90+      |
| Firefox | 88+      |
| Safari  | 14+      |
| Edge    | 90+      |

> **참고**: WebGL 지원이 필수입니다. Internet Explorer는 지원되지 않습니다.

## 문서

- [아키텍처 문서](./docs/ARCHITECTURE.md) - 시스템 구조 및 설계
- [API 레퍼런스](./docs/API.md) - 컴포넌트 및 함수 명세
- [변경 이력](./docs/CHANGELOG.md) - 버전별 변경사항

## 라이선스

MIT License

---

**Made with Three.js, Rapier & React** | v3.0
