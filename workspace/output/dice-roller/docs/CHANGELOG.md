# 변경 이력 (CHANGELOG)

이 문서는 3D Dice Roller 프로젝트의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

---

## [3.0.0] - 2024-11-21

### 추가됨 (Added)

#### 테스트 환경
- **Vitest** 테스트 프레임워크 도입
- **@testing-library/react** React 컴포넌트 테스트 라이브러리
- **@testing-library/jest-dom** DOM 매처 확장
- **jsdom** 브라우저 환경 시뮬레이션
- `npm run test` / `npm run test:run` 스크립트 추가
- `constants.test.js` - 상수 검증 테스트
- `diceUtils.test.js` - 유틸리티 함수 테스트

#### 코드 정리
- 불필요한 useDiceRoll 훅 제거 (물리 엔진으로 대체)
- 컴포넌트 구조 단순화
- 상태 관리를 App 컴포넌트로 통합

### 변경됨 (Changed)
- 물리 엔진 파라미터 최적화
- 정지 감지 알고리즘 개선
- 코드 주석 정리

### 기술 스택 (v3.0)

| 패키지 | 버전 |
|-------|------|
| React | ^19.2.0 |
| Three.js | ^0.181.2 |
| @react-three/fiber | ^9.4.0 |
| @react-three/rapier | ^2.2.0 |
| @react-three/drei | ^10.7.7 |
| Vite | ^7.2.4 |
| Vitest | ^3.2.4 |
| @testing-library/react | ^16.3.0 |

---

## [2.0.0] - 2024-11-21

### 추가됨 (Added)

#### 물리 엔진
- **@react-three/rapier** Rapier 물리 엔진 통합
- 현실적인 중력, 반발, 마찰 시뮬레이션
- RigidBody 기반 주사위 물리
- 물리 바닥 (Floor) 컴포넌트

#### 물리 상수
- `PHYSICS` - 물리 엔진 설정 (중력, 반발, 마찰, 감쇠)
- `SETTLE_DETECTION` - 정지 감지 설정 (속도 임계값, 확인 시간)
- `THROW_CONFIG` - 던지기 힘 설정 (초기 높이, 힘 범위)

#### 정지 감지 시스템
- 선형/각속도 기반 정지 감지
- 100ms 간격 체크
- 300ms 정지 유지 시 결과 확정

#### 윗면 계산
- `getTopFace()` 함수 추가
- Euler 각도에서 윗면 숫자 계산
- 노멀 벡터 내적 방식

#### 키보드 조작
- SPACE 키로 주사위 굴리기
- keydown 이벤트 리스너
- 굴리는 중 중복 입력 방지

#### 카메라 조작
- OrbitControls 추가
- 마우스 드래그로 시점 회전
- 스크롤로 줌 인/아웃
- Polar Angle 제한 (바닥 아래 방지)

#### 시각 효과 개선
- 나무 마룻바닥 텍스처 (createWoodTexture)
- 고급 주사위 텍스처 (그라데이션, 그림자, 하이라이트)
- Environment preset (apartment) 조명
- 다중 광원 설정

### 변경됨 (Changed)
- DiceScene props 변경: `onDiceSettled` 콜백 방식
- 상태 관리 단순화 (App에서 직접 관리)
- UI 오버레이 방식으로 변경
- "Press SPACE to roll" 힌트 텍스트 추가

### 제거됨 (Removed)
- 기존 애니메이션 기반 회전 (useFrame 보간)
- Dice3D 독립 컴포넌트 (DiceScene에 통합)

---

## [1.0.0] - 2024-11-21

### 추가됨 (Added)

#### 핵심 기능
- Three.js 기반 3D 주사위 렌더링 구현
- React Three Fiber를 활용한 선언적 3D 컴포넌트 구조
- easeOutCubic 이징을 적용한 자연스러운 회전 애니메이션
- 1-6 무작위 결과 생성 및 표시
- 버튼 클릭으로 주사위 굴리기

#### 컴포넌트
- `App` - 루트 컴포넌트 및 상태 관리
- `DiceScene` - Three.js Canvas 컨테이너
- `Dice3D` - 3D 주사위 메시 (6면 텍스처 포함)
- `ControlPanel` - 버튼 및 결과 표시 컨테이너
- `RollButton` - 주사위 굴리기 버튼
- `ResultDisplay` - 결과 숫자 표시
- `ErrorBoundary` - 에러 처리

#### 커스텀 훅
- `useDiceRoll` - 주사위 굴리기 로직 관리
- `useWebGLSupport` - WebGL 지원 확인

#### 유틸리티
- `diceUtils.js` - 무작위 생성, 회전 매핑
- `animationUtils.js` - 이징 함수
- `constants.js` - 상수 정의

#### UI/UX
- 반응형 디자인 (모바일/태블릿/데스크톱)
- CSS Modules 기반 스타일링
- 굴리는 중 버튼 비활성화
- 결과 표시 Fade-in 애니메이션
- 주사위 점(dots) 텍스처 자동 생성

#### 접근성
- 키보드 네비게이션 지원
- ARIA 레이블 및 역할 적용
- 포커스 표시 스타일
- WCAG 2.1 AA 색상 대비 준수

#### 개발 환경
- Vite 기반 빌드 설정
- ESLint 코드 품질 검사
- React 19 + Three.js 통합

---

## 버전별 주요 차이점

| 기능 | v1.0 | v2.0 | v3.0 |
|-----|------|------|------|
| 주사위 회전 | 애니메이션 보간 | 물리 엔진 | 물리 엔진 |
| 결과 결정 | 미리 생성 | 물리 시뮬레이션 | 물리 시뮬레이션 |
| 키보드 조작 | Enter/Space (버튼) | SPACE (전역) | SPACE (전역) |
| 카메라 | 고정 | OrbitControls | OrbitControls |
| 바닥 | 없음 | 나무 텍스처 | 나무 텍스처 |
| 테스트 | 없음 | 없음 | Vitest |

---

## 개발 로드맵

### 향후 계획 (미정)

#### v3.1.0 (예정)
- [ ] 사운드 효과 (충돌, 결과)
- [ ] 진동 피드백 (모바일)

#### v4.0.0 (예정)
- [ ] 여러 주사위 동시 굴리기
- [ ] 다면체 주사위 (D4, D8, D12, D20)
- [ ] 결과 이력 표시

#### 장기 계획
- [ ] 다크 모드
- [ ] 주사위 커스터마이징 (색상, 재질)
- [ ] 공유 기능
- [ ] PWA 지원

---

## 기여자

- **Multi-Agent System**
  - Planner Agent - 요구사항 분석
  - UX Designer Agent - UX 설계
  - Tech Architect Agent - 기술 명세
  - Developer Agent - 코드 구현
  - Test Designer Agent - 테스트 설계
  - Reviewer Agent - 코드 리뷰
  - Documenter Agent - 문서화

---

## 참조 문서

- [요구사항 명세서](../../artifacts/requirements.md)
- [기술 명세서](../../artifacts/tech-spec.md)
- [UX 설계 문서](../../artifacts/ux-design.md)
