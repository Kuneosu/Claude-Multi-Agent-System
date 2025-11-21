# 구현 계획서
## 3D 주사위 굴리기 웹 애플리케이션

---

## 프로젝트 개요

**목표**: Three.js와 React를 활용한 3D 주사위 굴리기 웹 애플리케이션 개발

**총 예상 기간**: 2-3주 (40-60시간)

**핵심 가치**:
- 빠른 MVP 개발로 조기 사용자 피드백 확보
- 반복적 개선을 통한 품질 향상
- 확장 가능한 아키텍처 설계

---

## Iteration 1: 환경 설정 및 기본 구조 (예상: 4-6시간)

### 목표
개발 환경을 구축하고 프로젝트 기본 구조를 확립하여 개발 준비 완료

### 작업 목록

- [ ] Task 1.1: 프로젝트 초기화
  - 설명: Vite + React 프로젝트 생성 및 기본 설정
  - 예상 시간: 30분
  - 의존성: 없음
  - 세부사항:
    - `npm create vite@latest dice-roller -- --template react`
    - package.json 의존성 추가 (react, react-dom, three, @react-three/fiber, @react-three/drei)
    - Git 초기화 및 .gitignore 설정

- [ ] Task 1.2: 개발 도구 설정
  - 설명: ESLint, Prettier 설정 및 코드 품질 도구 구성
  - 예상 시간: 1시간
  - 의존성: Task 1.1
  - 세부사항:
    - .eslintrc.cjs 생성 (Airbnb 스타일 가이드 기반)
    - .prettierrc 생성 (세미콜론, 2 스페이스)
    - VSCode 설정 파일 추가 (선택)
    - npm scripts 추가 (lint, format)

- [ ] Task 1.3: 폴더 구조 생성
  - 설명: 기술 명세서에 따른 디렉토리 구조 구축
  - 예상 시간: 30분
  - 의존성: Task 1.1
  - 세부사항:
    - src/components/ (DiceScene, Dice3D, ControlPanel, RollButton, ResultDisplay, ErrorBoundary)
    - src/hooks/ (useDiceRoll, useWebGLSupport, useResponsive)
    - src/utils/ (diceUtils, animationUtils, constants)
    - 각 폴더에 index.js 생성

- [ ] Task 1.4: 기본 스타일 설정
  - 설명: 전역 CSS 리셋 및 CSS Modules 설정
  - 예상 시간: 1시간
  - 의존성: Task 1.3
  - 세부사항:
    - src/index.css (CSS 리셋, 폰트 설정, CSS 변수)
    - App.module.css (기본 레이아웃)
    - 반응형 미디어 쿼리 기본 구조

- [ ] Task 1.5: App.jsx 기본 구조 작성
  - 설명: 루트 컴포넌트 레이아웃 구성
  - 예상 시간: 1시간
  - 의존성: Task 1.3, Task 1.4
  - 세부사항:
    - ErrorBoundary 래핑
    - DiceScene + ControlPanel 레이아웃
    - 상태 관리 기본 구조 (useState)

- [ ] Task 1.6: 개발 서버 실행 확인
  - 설명: Vite 개발 서버가 정상 작동하는지 확인
  - 예상 시간: 30분
  - 의존성: Task 1.5
  - 세부사항:
    - `npm run dev` 실행
    - 브라우저에서 localhost:5173 접속
    - HMR (Hot Module Replacement) 동작 확인

### 검증 기준
- [ ] npm run dev로 개발 서버가 정상 실행됨
- [ ] ESLint가 코드 오류를 감지함
- [ ] Prettier가 코드를 자동 포맷팅함
- [ ] 브라우저에서 기본 레이아웃이 표시됨
- [ ] 폴더 구조가 기술 명세서와 일치함

### 완료 조건
개발자가 `npm run dev`를 실행하여 개발 환경에서 기본 앱 구조를 확인할 수 있다.

---

## Iteration 2: 3D 렌더링 기본 (예상: 6-8시간)

### 목표
Three.js로 3D 주사위를 화면에 렌더링하고 기본 조명/카메라 설정 완료

### 작업 목록

- [ ] Task 2.1: WebGL 지원 확인 훅 작성
  - 설명: useWebGLSupport 커스텀 훅 구현
  - 예상 시간: 1시간
  - 의존성: 없음
  - 세부사항:
    - canvas 엘리먼트 생성 및 webgl 컨텍스트 확인
    - 지원 여부를 boolean으로 반환
    - useEffect로 컴포넌트 마운트 시 자동 확인

- [ ] Task 2.2: ErrorBoundary 컴포넌트 작성
  - 설명: WebGL 미지원 시 표시할 에러 UI
  - 예상 시간: 1.5시간
  - 의존성: Task 2.1
  - 세부사항:
    - React Error Boundary 클래스 컴포넌트
    - WebGL 미지원 시 대체 UI (UX 명세 참조)
    - 권장 브라우저 목록 표시

- [ ] Task 2.3: DiceScene 컴포넌트 기본 구조
  - 설명: @react-three/fiber Canvas 설정
  - 예상 시간: 2시간
  - 의존성: Task 2.1
  - 세부사항:
    - Canvas 컴포넌트 추가 (camera, gl 설정)
    - PerspectiveCamera 설정 (fov: 50, position: [0, 0, 5])
    - ambientLight + directionalLight 추가
    - 픽셀 비율 제한 (Math.min(devicePixelRatio, 2))

- [ ] Task 2.4: Dice3D 컴포넌트 - 기본 큐브
  - 설명: 기본 정육면체 주사위 렌더링
  - 예상 시간: 2시간
  - 의존성: Task 2.3
  - 세부사항:
    - BoxGeometry (2, 2, 2)
    - MeshStandardMaterial (흰색, metalness: 0.3, roughness: 0.7)
    - useRef로 메시 참조 관리
    - React.memo로 불필요한 재렌더링 방지

- [ ] Task 2.5: 주사위 면 텍스처 추가
  - 설명: 1-6 숫자를 각 면에 표시
  - 예상 시간: 2시간
  - 의존성: Task 2.4
  - 세부사항:
    - CanvasTexture로 숫자 그리기
    - 6개 면에 각각 다른 텍스처 적용
    - 또는 @react-three/drei의 Text3D 사용 (선택)

- [ ] Task 2.6: 반응형 Canvas 크기 조정
  - 설명: 화면 크기 변경 시 Canvas 리사이즈
  - 예상 시간: 1시간
  - 의존성: Task 2.3
  - 세부사항:
    - window resize 이벤트 리스너
    - camera aspect ratio 업데이트
    - renderer 크기 조정

### 검증 기준
- [ ] 브라우저에 3D 주사위가 중앙에 표시됨
- [ ] 각 면에 1-6 숫자가 명확히 보임
- [ ] 조명과 그림자가 적절하게 렌더링됨
- [ ] 화면 크기 변경 시 주사위가 중앙에 유지됨
- [ ] WebGL 미지원 브라우저에서 에러 메시지 표시
- [ ] Chrome DevTools에서 콘솔 에러 없음

### 완료 조건
사용자가 브라우저를 열면 3D 주사위가 화면 중앙에 정적으로 표시되고, 각 면의 숫자가 명확히 보인다.

---

## Iteration 3: 주사위 굴리기 핵심 로직 (예상: 8-10시간)

### 목표
사용자가 버튼을 클릭하면 주사위가 회전하고 무작위 결과를 표시하는 핵심 기능 완성

### 작업 목록

- [ ] Task 3.1: 유틸리티 함수 작성
  - 설명: diceUtils.js 및 animationUtils.js 구현
  - 예상 시간: 2시간
  - 의존성: 없음
  - 세부사항:
    - generateRandomNumber(): 1-6 무작위 숫자 생성
    - getTargetRotation(result): 결과에 따른 회전 각도 계산
    - ROTATION_MAP 상수 정의
    - easeOutCubic(t): Easing 함수 구현

- [ ] Task 3.2: useDiceRoll 커스텀 훅
  - 설명: 주사위 굴리기 상태 관리 로직
  - 예상 시간: 2.5시간
  - 의존성: Task 3.1
  - 세부사항:
    - isRolling, currentResult, targetRotation 상태 관리
    - rollDice 함수 구현 (무작위 생성 + 상태 업데이트)
    - 애니메이션 완료 시 isRolling을 false로 변경하는 로직

- [ ] Task 3.3: RollButton 컴포넌트
  - 설명: 주사위 굴리기 버튼 UI 및 인터랙션
  - 예상 시간: 2시간
  - 의존성: Task 3.2
  - 세부사항:
    - 버튼 상태별 스타일 (Default, Hover, Active, Disabled)
    - isRolling에 따라 텍스트 변경 ("주사위 굴리기" / "굴리는 중...")
    - onClick 이벤트 핸들러 연결
    - 키보드 접근성 (Enter, Space)
    - ARIA 속성 추가 (aria-label, aria-disabled, aria-busy)

- [ ] Task 3.4: 회전 애니메이션 구현
  - 설명: Dice3D에서 useFrame을 사용한 회전 애니메이션
  - 예상 시간: 3시간
  - 의존성: Task 3.2, Task 2.4
  - 세부사항:
    - useFrame Hook으로 매 프레임 회전 업데이트
    - 무작위 스핀 회전 (X, Y, Z축 720-1440도)
    - Easing 함수 적용 (빠르게 시작, 천천히 종료)
    - 1.5초 후 목표 면이 위로 향하도록 정렬
    - 애니메이션 완료 시 콜백 호출

- [ ] Task 3.5: ResultDisplay 컴포넌트
  - 설명: 주사위 결과를 텍스트로 표시
  - 예상 시간: 1.5시간
  - 의존성: Task 3.2
  - 세부사항:
    - "결과: [숫자]" 형식으로 표시
    - Fade-in 애니메이션 (CSS transition)
    - ARIA live region (role="status", aria-live="polite")
    - isRolling일 때는 숨김 처리

### 검증 기준
- [ ] 버튼 클릭 시 주사위가 회전함
- [ ] 회전 애니메이션이 부드럽고 자연스러움 (30 FPS 이상)
- [ ] 1.5-2초 후 애니메이션 종료
- [ ] 목표 면(1-6)이 위를 정확히 향함
- [ ] 결과가 텍스트로 명확히 표시됨
- [ ] 굴리는 동안 버튼이 비활성화됨
- [ ] Enter/Space 키로도 주사위를 굴릴 수 있음
- [ ] 여러 번 굴려도 메모리 누수 없음

### 완료 조건
사용자가 "주사위 굴리기" 버튼을 클릭하면 주사위가 회전하고, 애니메이션 종료 후 1-6 중 하나의 결과가 화면에 표시된다.

---

## Iteration 4: UI/UX 개선 및 반응형 (예상: 6-8시간)

### 목표
사용자 경험을 향상시키고 모든 디바이스에서 완벽하게 작동하도록 반응형 디자인 적용

### 작업 목록

- [ ] Task 4.1: ControlPanel 컴포넌트 레이아웃
  - 설명: 버튼과 결과 표시를 감싸는 컨테이너
  - 예상 시간: 1시간
  - 의존성: Task 3.3, Task 3.5
  - 세부사항:
    - Flexbox로 중앙 정렬
    - RollButton + ResultDisplay 배치
    - 패딩 및 간격 조정

- [ ] Task 4.2: 반응형 CSS 작성
  - 설명: Desktop, Tablet, Mobile 레이아웃
  - 예상 시간: 3시간
  - 의존성: Task 4.1
  - 세부사항:
    - Mobile First 접근 (기본 320px)
    - 미디어 쿼리 (768px, 1024px 브레이크포인트)
    - Canvas 높이 조정 (60vh → 65vh → 70vh)
    - 버튼 크기 조정 (80vw → 220px → 240px)
    - 폰트 크기 조정 (24px → 28px → 32px)
    - 가로 모드 대응 (모바일)

- [ ] Task 4.3: 버튼 상태별 스타일링
  - 설명: UX 명세서에 따른 버튼 시각적 피드백
  - 예상 시간: 1.5시간
  - 의존성: Task 3.3
  - 세부사항:
    - Default: #4A90E2 배경, 흰색 텍스트
    - Hover: #357ABD, scale(1.05)
    - Active: scale(0.95)
    - Disabled: #CCCCCC, opacity 0.6
    - CSS transition (0.2s ease)
    - 포커스 아웃라인 (2px solid #4A90E2)

- [ ] Task 4.4: 접근성 개선
  - 설명: WCAG 2.1 AA 기준 준수
  - 예상 시간: 2시간
  - 의존성: Task 4.1, Task 4.3
  - 세부사항:
    - 시맨틱 HTML (<main>, <section>)
    - ARIA 레이블 추가
    - 색상 대비 확인 (4.5:1 이상)
    - 키보드 포커스 표시 명확화
    - 터치 타겟 크기 확인 (최소 44x44px)

- [ ] Task 4.5: 모션 감소 모드 지원
  - 설명: prefers-reduced-motion 미디어 쿼리
  - 예상 시간: 1시간
  - 의존성: Task 3.4
  - 세부사항:
    - CSS에서 애니메이션 시간 단축 (0.3초)
    - 또는 애니메이션 완전 비활성화
    - 여전히 결과는 정확히 표시

- [ ] Task 4.6: 타이틀 및 푸터 추가
  - 설명: 앱 타이틀과 간단한 푸터
  - 예상 시간: 30분
  - 의존성: 없음
  - 세부사항:
    - "3D Dice Roller" 타이틀
    - "Made with Three.js & React" 푸터
    - 반응형 폰트 크기

### 검증 기준
- [ ] iPhone SE (320px)에서 정상 작동
- [ ] iPad (768px)에서 레이아웃 최적화
- [ ] Desktop (1920px)에서 중앙 정렬
- [ ] 가로/세로 모드 전환이 자연스러움
- [ ] 버튼이 터치하기 쉬운 크기 (44px 이상)
- [ ] 색상 대비가 WCAG AA 기준 통과
- [ ] Tab 키로 버튼 포커스 이동 가능
- [ ] Enter/Space로 버튼 활성화 가능
- [ ] 스크린 리더가 상태 변화를 읽음

### 완료 조건
앱이 모든 디바이스(모바일, 태블릿, 데스크톱)에서 적절한 레이아웃으로 표시되고, 키보드와 스크린 리더로 완전히 사용 가능하다.

---

## Iteration 5: 성능 최적화 및 폴리싱 (예상: 4-6시간)

### 목표
성능을 최적화하고 사용자 경험을 세밀하게 다듬어 프로덕션 준비 완료

### 작업 목록

- [ ] Task 5.1: React 렌더링 최적화
  - 설명: React.memo, useMemo 적용
  - 예상 시간: 1.5시간
  - 의존성: 모든 컴포넌트 완성
  - 세부사항:
    - ResultDisplay, RollButton에 React.memo 적용
    - Dice3D의 geometry, material을 useMemo로 캐싱
    - useCallback으로 이벤트 핸들러 최적화

- [ ] Task 5.2: Three.js 메모리 관리
  - 설명: 리소스 정리 및 메모리 누수 방지
  - 예상 시간: 1시간
  - 의존성: Task 2.4, Task 2.5
  - 세부사항:
    - useEffect cleanup에서 geometry.dispose()
    - material.dispose(), texture.dispose()
    - renderer.dispose() (ErrorBoundary에서)

- [ ] Task 5.3: 번들 크기 최적화
  - 설명: Vite 빌드 설정 최적화
  - 예상 시간: 1.5시간
  - 의존성: 없음
  - 세부사항:
    - vite.config.js에서 manualChunks 설정
    - Tree-shaking 확인
    - @react-three/drei에서 필요한 것만 import
    - `npm run build` 후 번들 크기 확인 (목표: 850KB 이하)

- [ ] Task 5.4: 로딩 인디케이터 추가
  - 설명: Three.js 로딩 중 표시할 스피너
  - 예상 시간: 1시간
  - 의존성: Task 2.3
  - 세부사항:
    - Suspense + Fallback UI
    - "3D 주사위를 준비하는 중..." 메시지
    - CSS 스피너 애니메이션

- [ ] Task 5.5: 에러 처리 강화
  - 설명: 예외 상황 대응
  - 예상 시간: 1시간
  - 의존성: Task 2.2
  - 세부사항:
    - Three.js 로딩 실패 시 에러 메시지
    - 네트워크 타임아웃 처리 (10초)
    - 재시도 버튼 제공 (선택)

### 검증 기준
- [ ] Chrome DevTools Lighthouse 성능 점수 90 이상
- [ ] FCP (First Contentful Paint) 1.5초 이내
- [ ] TTI (Time to Interactive) 3초 이내
- [ ] 번들 크기 850KB 이하 (gzipped)
- [ ] 100회 이상 주사위 굴려도 메모리 사용량 안정적
- [ ] 콘솔에 에러/경고 없음
- [ ] 모든 브라우저(Chrome, Firefox, Safari, Edge)에서 정상 작동

### 완료 조건
앱이 Lighthouse 성능 점수 90 이상을 달성하고, 모든 타겟 브라우저에서 오류 없이 부드럽게 작동한다.

---

## Iteration 6: 테스트 및 배포 (예상: 4-6시간)

### 목표
철저한 테스트를 거쳐 프로덕션 환경에 배포하고 최종 QA 완료

### 작업 목록

- [ ] Task 6.1: 크로스 브라우저 테스트
  - 설명: 주요 브라우저에서 수동 테스트
  - 예상 시간: 2시간
  - 의존성: Iteration 5 완료
  - 세부사항:
    - Chrome (최신), Firefox (최신), Safari (최신), Edge (최신)
    - 주사위 굴리기 10회씩 테스트
    - 결과가 정확히 표시되는지 확인
    - 애니메이션이 부드러운지 확인

- [ ] Task 6.2: 모바일 디바이스 테스트
  - 설명: 실제 모바일 기기에서 테스트
  - 예상 시간: 1.5시간
  - 의존성: Task 6.1
  - 세부사항:
    - iPhone (iOS Safari)
    - Android (Chrome)
    - 터치 인터랙션 확인
    - 가로/세로 모드 전환 확인
    - 성능 (프레임레이트) 확인

- [ ] Task 6.3: 접근성 감사
  - 설명: 스크린 리더 및 키보드 테스트
  - 예상 시간: 1시간
  - 의존성: Task 4.4
  - 세부사항:
    - NVDA 또는 VoiceOver로 테스트
    - Tab 키로 네비게이션 확인
    - Enter/Space로 버튼 작동 확인
    - ARIA 레이블이 올바르게 읽히는지 확인

- [ ] Task 6.4: Lighthouse 감사
  - 설명: Chrome DevTools Lighthouse 실행
  - 예상 시간: 30분
  - 의존성: Iteration 5 완료
  - 세부사항:
    - Performance, Accessibility, Best Practices, SEO 점수 확인
    - 목표: Performance 90+, Accessibility 100
    - 개선 제안 사항 검토 및 적용

- [ ] Task 6.5: README 작성
  - 설명: 프로젝트 문서화
  - 예상 시간: 1시간
  - 의존성: 없음
  - 세부사항:
    - 프로젝트 소개
    - 설치 방법 (npm install, npm run dev)
    - 빌드 방법 (npm run build)
    - 기술 스택 설명
    - 라이선스 (MIT)

- [ ] Task 6.6: 프로덕션 배포
  - 설명: Vercel 또는 Netlify에 배포
  - 예상 시간: 1시간
  - 의존성: Task 6.4
  - 세부사항:
    - `npm run build` 실행
    - Vercel CLI 또는 GitHub 연동
    - 배포 URL 확인
    - HTTPS 작동 확인
    - 프로덕션 환경에서 최종 테스트

### 검증 기준
- [ ] 모든 타겟 브라우저에서 오류 없음
- [ ] 모바일 디바이스에서 정상 작동
- [ ] Lighthouse 점수 목표 달성 (Performance 90+, Accessibility 100)
- [ ] 스크린 리더로 완전히 사용 가능
- [ ] README가 명확하고 완전함
- [ ] 프로덕션 URL이 공개적으로 접근 가능
- [ ] HTTPS로 안전하게 제공됨

### 완료 조건
앱이 프로덕션 환경에 배포되어 공개 URL로 접근 가능하고, 모든 디바이스와 브라우저에서 완벽하게 작동한다.

---

## 전체 타임라인

```
Week 1 (5일, 40시간):
├─ Day 1-2: Iteration 1 (환경 설정) + Iteration 2 (3D 렌더링) [10-14시간]
├─ Day 3-4: Iteration 3 (주사위 굴리기 핵심 로직) [8-10시간]
└─ Day 5: Iteration 4 시작 (UI/UX 개선) [6시간]

Week 2 (5일, 40시간):
├─ Day 6: Iteration 4 완료 (반응형) [2시간]
├─ Day 7: Iteration 5 (성능 최적화) [4-6시간]
├─ Day 8-9: Iteration 6 (테스트 및 배포) [4-6시간]
└─ Day 10: 버퍼 (예상치 못한 이슈 대응, 추가 폴리싱)

총 예상 시간: 40-60시간 (2-3주)
```

### 마일스톤

| 마일스톤 | 완료 예정일 | 설명 |
|---------|-----------|------|
| **M1: 개발 환경 준비** | Day 1 | Iteration 1 완료 |
| **M2: 3D 렌더링 작동** | Day 2 | Iteration 2 완료 |
| **M3: MVP 기능 완성** | Day 4 | Iteration 3 완료 (핵심 기능) |
| **M4: 반응형 완료** | Day 6 | Iteration 4 완료 |
| **M5: 성능 목표 달성** | Day 7 | Iteration 5 완료 |
| **M6: 프로덕션 배포** | Day 9 | Iteration 6 완료 |

---

## 리스크 관리

### Risk 1: Three.js 학습 곡선
- **영향도**: High
- **확률**: Medium
- **완화 방안**:
  - react-three/fiber 공식 문서와 예제 적극 활용
  - drei 유틸리티 컴포넌트로 복잡도 낮춤
  - 간단한 프로토타입부터 시작하여 점진적 개선
  - 문제 발생 시 Three.js 커뮤니티(Discord, Stack Overflow) 활용

### Risk 2: 낮은 프레임레이트 (모바일)
- **영향도**: Medium
- **확률**: Medium
- **완화 방안**:
  - 초기부터 픽셀 비율 제한 적용
  - 실제 모바일 기기에서 조기 테스트
  - 성능 모니터링 (Chrome DevTools Performance 탭)
  - 필요 시 애니메이션 품질 자동 조정 로직 추가

### Risk 3: 크로스 브라우저 호환성 이슈 (Safari)
- **영향도**: Medium
- **확률**: Low
- **완화 방안**:
  - Safari에서 자주 발생하는 이슈 사전 조사
  - BrowserStack 무료 체험으로 실제 Safari 테스트
  - Polyfill 준비 (필요 시)
  - Iteration 6에서 집중적으로 테스트

### Risk 4: 일정 지연
- **영향도**: Medium
- **확률**: Medium
- **완화 방안**:
  - Day 10을 버퍼로 확보
  - 각 Iteration별 시간 초과 시 즉시 우선순위 재조정
  - 필수 기능(FR-1~FR-4) 우선, 선택 기능 후순위
  - 일일 진행상황 체크 및 조기 경보

### Risk 5: 번들 크기 초과
- **영향도**: Low
- **확률**: Low
- **완화 방안**:
  - Iteration 5에서 번들 크기 집중 점검
  - drei에서 필요한 것만 선택적 import
  - Tree-shaking 효과 확인
  - 필요 시 Lazy loading 적용

---

## 성공 기준 (Definition of Done)

### 기능적 성공 기준
- [x] 사용자가 버튼을 클릭하면 주사위가 회전한다
- [x] 회전 후 1~6 중 하나의 결과가 무작위로 표시된다
- [x] 결과 숫자가 화면에 명확히 보인다
- [x] 모바일/태블릿/데스크톱 모두에서 정상 작동한다
- [x] 회전 애니메이션이 자연스럽고 부드럽다 (30 FPS 이상)
- [x] 굴리는 동안 중복 클릭이 방지된다

### 기술적 성공 기준
- [x] Three.js로 3D 주사위가 렌더링된다
- [x] React 컴포넌트 기반으로 구조화되어 있다
- [x] 최신 모던 브라우저(Chrome, Firefox, Safari, Edge)에서 오류 없이 실행된다
- [x] WebGL이 지원되지 않는 환경에서 적절한 에러 메시지 표시
- [x] 코드가 ESLint 규칙을 준수한다
- [x] Lighthouse Performance 점수 90 이상
- [x] 번들 크기 850KB 이하 (gzipped)

### 사용성 성공 기준
- [x] 첫 방문 사용자가 5초 이내에 사용법을 이해한다
- [x] 버튼이 터치/클릭하기 쉬운 크기다 (최소 44x44px)
- [x] 애니메이션이 1~2초 이내로 완료된다
- [x] 키보드(Tab, Enter, Space)만으로 완전히 사용 가능하다
- [x] 스크린 리더로 완전히 사용 가능하다
- [x] Lighthouse Accessibility 점수 100

---

## 의존성 및 외부 라이브러리

### 핵심 의존성
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
    "eslint-plugin-react": "^7.32.0",
    "prettier": "^3.0.0"
  }
}
```

### 총 예상 번들 크기
- React + ReactDOM: 45KB (gzipped)
- Three.js: 600KB (gzipped)
- @react-three/fiber: 70KB (gzipped)
- @react-three/drei: 100KB (gzipped, 선택적)
- 애플리케이션 코드: ~50KB
- **총합**: ~815KB (gzipped) ✅ 목표 850KB 이내

---

## 품질 보증 체크리스트

### 코드 품질
- [ ] 모든 컴포넌트에 PropTypes 또는 TypeScript 타입 정의 (선택)
- [ ] ESLint 경고 0개
- [ ] Prettier로 모든 파일 포맷팅
- [ ] 주요 함수에 JSDoc 주석 작성
- [ ] 매직 넘버를 상수로 추출 (constants.js)

### 성능
- [ ] React DevTools Profiler로 불필요한 재렌더링 확인
- [ ] Chrome DevTools Performance 탭으로 프레임 드롭 확인
- [ ] Memory Profiler로 메모리 누수 확인
- [ ] Network 탭으로 번들 크기 확인

### 접근성
- [ ] axe DevTools로 자동 접근성 검사
- [ ] WAVE 확장 프로그램으로 WCAG 준수 확인
- [ ] 실제 스크린 리더(NVDA/JAWS)로 수동 테스트
- [ ] 키보드만으로 완전한 네비게이션 테스트

### 보안
- [ ] `npm audit`로 취약점 확인
- [ ] CSP (Content Security Policy) 헤더 설정 (Vercel 자동)
- [ ] HTTPS 강제 (Vercel/Netlify 자동)
- [ ] 민감한 정보 하드코딩 없음 확인

---

## 다음 단계 (Post-MVP)

Iteration 6 완료 후 고려할 추가 기능:

### Phase 2 (향후 확장)
1. **결과 이력 저장**
   - localStorage로 최근 10개 결과 저장
   - 간단한 통계 (평균, 최빈값)

2. **다크 모드**
   - `prefers-color-scheme` 감지
   - 수동 토글 스위치

3. **여러 개 주사위**
   - 1-5개 주사위 선택 옵션
   - 동시 굴리기 애니메이션

4. **사운드 효과**
   - 주사위 굴리는 소리 (ON/OFF 토글)
   - Web Audio API 사용

5. **공유 기능**
   - 결과 스크린샷 다운로드
   - Twitter/Facebook 공유

---

## 참고 문서

- 요구사항 명세서: `/workspace/artifacts/requirements.md`
- UX 설계 문서: `/workspace/artifacts/ux-design.md`
- 기술 명세서: `/workspace/artifacts/tech-spec.md`

---

## 문서 정보

- **버전**: 1.0
- **작성일**: 2024년
- **담당**: Planner Agent
- **상태**: 최종 승인 대기
- **다음 단계**: Developer Agent에게 전달하여 구현 시작

---

**구현 계획서 작성 완료** ✅

이 계획서는 6개의 Iteration으로 구성되어 있으며, 각 Iteration은 명확한 목표, 작업 목록, 검증 기준, 완료 조건을 가지고 있습니다. 전체 예상 기간은 2-3주(40-60시간)이며, 점진적으로 기능을 추가하는 반복적 개발 방식을 따릅니다.
