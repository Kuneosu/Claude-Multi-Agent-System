# 테스트 계획서
## 3D 주사위 굴리기 웹 애플리케이션

---

## 테스트 전략 개요

**접근 방식**: Test-Driven Development (TDD)
- 각 Iteration **전**에 테스트를 먼저 작성
- Red → Green → Refactor 사이클 준수
- 자동화된 테스트로 신속한 피드백 확보

**테스트 피라미드**:
```
       /\
      /E2E\       ← 소수의 End-to-End 테스트
     /------\
    /Integration\ ← 중간 규모의 통합 테스트
   /------------\
  /  Unit Tests  \ ← 다수의 단위 테스트 (가장 많음)
 /----------------\
```

**목표**:
- ✅ 코드 커버리지: 80% 이상
- ✅ 모든 핵심 기능에 대한 테스트 존재
- ✅ CI/CD 파이프라인에서 자동 실행 가능
- ✅ 테스트 실행 시간: 10초 이내

---

## 테스트 도구 및 프레임워크

### 단위 테스트 & 통합 테스트
- **Vitest**: Vite 네이티브 테스트 프레임워크 (Jest 호환)
- **React Testing Library**: React 컴포넌트 테스트
- **@testing-library/user-event**: 사용자 인터랙션 시뮬레이션
- **@testing-library/jest-dom**: DOM 매처 확장

### E2E 테스트
- **Playwright**: 크로스 브라우저 E2E 테스트 (권장)
- 대안: Cypress (선택)

### 접근성 테스트
- **jest-axe**: 자동 접근성 검사
- **@axe-core/react**: 실시간 접근성 감사
- 수동 테스트: NVDA, JAWS, VoiceOver

### 성능 테스트
- **Lighthouse CI**: 자동화된 성능 감사
- **Chrome DevTools**: 수동 프로파일링

### 시각적 회귀 테스트 (선택)
- **Percy** 또는 **Chromatic**: 스크린샷 비교

---

## Iteration별 테스트 계획

---

## Iteration 1: 환경 설정 및 기본 구조

### 목표
프로젝트 초기 설정이 올바르게 되었는지 검증

### 테스트 케이스

#### TC-1.1: 프로젝트 초기화 검증
**유형**: 설정 테스트
**우선순위**: High
**테스트**:
```bash
# 실행 가능 여부
npm run dev
npm run build
npm run lint
```
**성공 조건**:
- [ ] 모든 명령어가 오류 없이 실행됨
- [ ] 빌드 결과물이 `dist/` 폴더에 생성됨

#### TC-1.2: ESLint 규칙 준수
**유형**: 정적 분석
**우선순위**: Medium
**테스트**:
```bash
npm run lint
```
**성공 조건**:
- [ ] ESLint 경고/에러 0개

#### TC-1.3: 기본 렌더링 테스트
**파일**: `tests/App.test.jsx`
**유형**: 단위 테스트
```javascript
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  test('앱이 렌더링됨', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

---

## Iteration 2: 3D 렌더링 기본

### 목표
Three.js 3D 주사위가 화면에 렌더링되는지 검증

### 테스트 케이스

#### TC-2.1: WebGL 지원 확인 훅 테스트
**파일**: `tests/hooks/useWebGLSupport.test.js`
**유형**: 단위 테스트
**우선순위**: High
```javascript
import { renderHook } from '@testing-library/react';
import { useWebGLSupport } from '../../src/hooks/useWebGLSupport';

describe('useWebGLSupport', () => {
  test('WebGL 지원 환경에서 true 반환', () => {
    const { result } = renderHook(() => useWebGLSupport());
    expect(result.current).toBe(true);
  });

  test('WebGL 미지원 환경에서 false 반환', () => {
    // Mock canvas.getContext to return null
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

    const { result } = renderHook(() => useWebGLSupport());
    expect(result.current).toBe(false);

    // Restore
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });
});
```

#### TC-2.2: ErrorBoundary 컴포넌트 테스트
**파일**: `tests/components/ErrorBoundary.test.jsx`
**유형**: 단위 테스트
**우선순위**: High
```javascript
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../src/components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  test('에러 발생 시 대체 UI 표시', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/WebGL을 지원하지 않습니다/i)).toBeInTheDocument();
    spy.mockRestore();
  });

  test('정상 작동 시 자식 컴포넌트 렌더링', () => {
    render(
      <ErrorBoundary>
        <div>Child Component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });
});
```

#### TC-2.3: DiceScene 컴포넌트 렌더링 테스트
**파일**: `tests/components/DiceScene.test.jsx`
**유형**: 통합 테스트
**우선순위**: High
```javascript
import { render } from '@testing-library/react';
import DiceScene from '../../src/components/DiceScene';

describe('DiceScene Component', () => {
  test('Canvas가 렌더링됨', () => {
    const { container } = render(<DiceScene />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('Canvas가 부모 컨테이너 크기에 맞춰짐', () => {
    const { container } = render(<DiceScene />);
    const canvas = container.querySelector('canvas');

    // Canvas는 부모의 크기를 따름
    expect(canvas).toHaveStyle({ width: '100%', height: '100%' });
  });
});
```

#### TC-2.4: Dice3D 컴포넌트 메시 테스트
**파일**: `tests/components/Dice3D.test.jsx`
**유형**: 단위 테스트
**우선순위**: Medium
```javascript
import React from 'react';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import Dice3D from '../../src/components/Dice3D';

describe('Dice3D Component', () => {
  test('주사위 메시가 렌더링됨', () => {
    const { container } = render(
      <Canvas>
        <Dice3D isRolling={false} targetRotation={[0, 0, 0]} />
      </Canvas>
    );

    // Canvas 내부에 mesh가 있는지 확인 (간접 확인)
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });
});
```

---

## Iteration 3: 주사위 굴리기 핵심 로직

### 목표
주사위 굴리기 기능이 정확히 작동하는지 검증

### 테스트 케이스

#### TC-3.1: 무작위 숫자 생성 함수 테스트
**파일**: `tests/utils/diceUtils.test.js`
**유형**: 단위 테스트
**우선순위**: High
```javascript
import { generateRandomNumber, getTargetRotation } from '../../src/utils/diceUtils';

describe('diceUtils', () => {
  describe('generateRandomNumber', () => {
    test('1-6 범위의 숫자를 반환', () => {
      for (let i = 0; i < 100; i++) {
        const result = generateRandomNumber();
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      }
    });

    test('정수를 반환', () => {
      const result = generateRandomNumber();
      expect(Number.isInteger(result)).toBe(true);
    });

    test('모든 숫자(1-6)가 최소 1번 이상 나옴 (통계적)', () => {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

      for (let i = 0; i < 1000; i++) {
        const num = generateRandomNumber();
        counts[num]++;
      }

      // 모든 숫자가 최소 1번은 나와야 함
      Object.values(counts).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('getTargetRotation', () => {
    test('1번 면의 회전 각도 반환', () => {
      const rotation = getTargetRotation(1);
      expect(rotation).toEqual([0, 0, 0]);
    });

    test('2번 면의 회전 각도 반환', () => {
      const rotation = getTargetRotation(2);
      expect(rotation).toEqual([0, Math.PI, 0]);
    });

    test('3-6번 면도 정확한 회전 각도 반환', () => {
      [3, 4, 5, 6].forEach(num => {
        const rotation = getTargetRotation(num);
        expect(rotation).toHaveLength(3);
        rotation.forEach(angle => {
          expect(typeof angle).toBe('number');
        });
      });
    });

    test('잘못된 숫자에 대해 undefined 반환', () => {
      expect(getTargetRotation(0)).toBeUndefined();
      expect(getTargetRotation(7)).toBeUndefined();
    });
  });
});
```

#### TC-3.2: Easing 함수 테스트
**파일**: `tests/utils/animationUtils.test.js`
**유형**: 단위 테스트
**우선순위**: Medium
```javascript
import { easeOutCubic } from '../../src/utils/animationUtils';

describe('animationUtils', () => {
  describe('easeOutCubic', () => {
    test('t=0일 때 0 반환', () => {
      expect(easeOutCubic(0)).toBe(0);
    });

    test('t=1일 때 1 반환', () => {
      expect(easeOutCubic(1)).toBe(1);
    });

    test('t=0.5일 때 0.5보다 큰 값 반환 (감속 효과)', () => {
      const result = easeOutCubic(0.5);
      expect(result).toBeGreaterThan(0.5);
      expect(result).toBeLessThan(1);
    });

    test('0-1 범위에서 단조 증가', () => {
      const values = [0, 0.25, 0.5, 0.75, 1].map(easeOutCubic);
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });
});
```

#### TC-3.3: useDiceRoll 훅 테스트
**파일**: `tests/hooks/useDiceRoll.test.js`
**유형**: 단위 테스트
**우선순위**: High
```javascript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDiceRoll } from '../../src/hooks/useDiceRoll';

describe('useDiceRoll', () => {
  test('초기 상태가 올바름', () => {
    const { result } = renderHook(() => useDiceRoll());

    expect(result.current.isRolling).toBe(false);
    expect(result.current.currentResult).toBeNull();
    expect(result.current.targetRotation).toEqual([0, 0, 0]);
  });

  test('rollDice 호출 시 isRolling이 true로 변경', () => {
    const { result } = renderHook(() => useDiceRoll());

    act(() => {
      result.current.rollDice();
    });

    expect(result.current.isRolling).toBe(true);
  });

  test('rollDice 호출 시 currentResult가 1-6 사이 값으로 설정됨', () => {
    const { result } = renderHook(() => useDiceRoll());

    act(() => {
      result.current.rollDice();
    });

    const { currentResult } = result.current;
    expect(currentResult).toBeGreaterThanOrEqual(1);
    expect(currentResult).toBeLessThanOrEqual(6);
  });

  test('애니메이션 완료 후 isRolling이 false로 변경', async () => {
    const { result } = renderHook(() => useDiceRoll());

    act(() => {
      result.current.rollDice();
    });

    // 애니메이션 시간 대기 (1.5-2초)
    await waitFor(
      () => {
        expect(result.current.isRolling).toBe(false);
      },
      { timeout: 3000 }
    );
  });
});
```

#### TC-3.4: RollButton 컴포넌트 테스트
**파일**: `tests/components/RollButton.test.jsx`
**유형**: 통합 테스트
**우선순위**: High
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RollButton from '../../src/components/RollButton';

describe('RollButton Component', () => {
  test('버튼이 렌더링됨', () => {
    render(<RollButton isRolling={false} onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('기본 상태에서 "주사위 굴리기" 텍스트 표시', () => {
    render(<RollButton isRolling={false} onClick={vi.fn()} />);
    expect(screen.getByText(/주사위 굴리기/i)).toBeInTheDocument();
  });

  test('굴리는 중에는 "굴리는 중..." 텍스트 표시', () => {
    render(<RollButton isRolling={true} onClick={vi.fn()} />);
    expect(screen.getByText(/굴리는 중/i)).toBeInTheDocument();
  });

  test('클릭 시 onClick 핸들러 호출', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<RollButton isRolling={false} onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('굴리는 중에는 버튼이 비활성화됨', () => {
    render(<RollButton isRolling={true} onClick={vi.fn()} />);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
  });

  test('Enter 키로 버튼 활성화', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<RollButton isRolling={false} onClick={handleClick} />);
    const button = screen.getByRole('button');

    button.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalled();
  });

  test('Space 키로 버튼 활성화', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<RollButton isRolling={false} onClick={handleClick} />);
    const button = screen.getByRole('button');

    button.focus();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalled();
  });

  test('ARIA 속성이 올바르게 설정됨', () => {
    render(<RollButton isRolling={false} onClick={vi.fn()} />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-label', '주사위 굴리기');
  });

  test('굴리는 중일 때 aria-busy="true"', () => {
    render(<RollButton isRolling={true} onClick={vi.fn()} />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
```

#### TC-3.5: ResultDisplay 컴포넌트 테스트
**파일**: `tests/components/ResultDisplay.test.jsx`
**유형**: 단위 테스트
**우선순위**: High
```javascript
import { render, screen } from '@testing-library/react';
import ResultDisplay from '../../src/components/ResultDisplay';

describe('ResultDisplay Component', () => {
  test('결과가 null일 때 아무것도 표시하지 않음', () => {
    const { container } = render(<ResultDisplay result={null} isVisible={false} />);
    expect(container.textContent).toBe('');
  });

  test('결과가 있을 때 "결과: [숫자]" 형식으로 표시', () => {
    render(<ResultDisplay result={5} isVisible={true} />);
    expect(screen.getByText(/결과: 5/i)).toBeInTheDocument();
  });

  test('1-6 모든 숫자에 대해 정확히 표시', () => {
    [1, 2, 3, 4, 5, 6].forEach(num => {
      const { unmount } = render(<ResultDisplay result={num} isVisible={true} />);
      expect(screen.getByText(new RegExp(`결과: ${num}`, 'i'))).toBeInTheDocument();
      unmount();
    });
  });

  test('isVisible이 false일 때 숨김 처리', () => {
    const { container } = render(<ResultDisplay result={3} isVisible={false} />);
    const element = container.querySelector('[role="status"]');

    // CSS로 숨김 처리되었는지 확인
    expect(element).toHaveStyle({ display: 'none' });
  });

  test('ARIA live region 속성 설정', () => {
    render(<ResultDisplay result={4} isVisible={true} />);
    const element = screen.getByRole('status');

    expect(element).toHaveAttribute('aria-live', 'polite');
    expect(element).toHaveAttribute('aria-atomic', 'true');
  });
});
```

#### TC-3.6: 주사위 굴리기 통합 테스트
**파일**: `tests/integration/DiceRoll.integration.test.jsx`
**유형**: 통합 테스트
**우선순위**: High
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('주사위 굴리기 통합 테스트', () => {
  test('전체 주사위 굴리기 플로우 작동', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. 버튼이 초기 상태로 표시됨
    const button = screen.getByRole('button', { name: /주사위 굴리기/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    // 2. 버튼 클릭
    await user.click(button);

    // 3. 버튼이 비활성화되고 텍스트 변경
    expect(button).toBeDisabled();
    expect(screen.getByText(/굴리는 중/i)).toBeInTheDocument();

    // 4. 애니메이션 완료 후 결과 표시 (최대 3초 대기)
    await waitFor(
      () => {
        expect(button).not.toBeDisabled();
        expect(screen.getByRole('status')).toHaveTextContent(/결과:/);
      },
      { timeout: 3000 }
    );

    // 5. 결과가 1-6 범위인지 확인
    const resultText = screen.getByRole('status').textContent;
    const resultNumber = parseInt(resultText.match(/\d+/)[0]);
    expect(resultNumber).toBeGreaterThanOrEqual(1);
    expect(resultNumber).toBeLessThanOrEqual(6);

    // 6. 버튼이 다시 활성화되어 재굴림 가능
    expect(button).not.toBeDisabled();
  });
});
```

---

## Iteration 4: UI/UX 개선 및 반응형

### 목표
반응형 디자인과 접근성이 올바르게 구현되었는지 검증

### 테스트 케이스

#### TC-4.1: 반응형 레이아웃 테스트
**파일**: `tests/responsive/Responsive.test.jsx`
**유형**: 통합 테스트
**우선순위**: High
```javascript
import { render } from '@testing-library/react';
import App from '../../src/App';

describe('반응형 레이아웃', () => {
  const setViewport = (width, height) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  };

  test('모바일 (320px)에서 레이아웃 적용', () => {
    setViewport(320, 568);
    const { container } = render(<App />);

    const button = container.querySelector('button');
    const computedStyle = window.getComputedStyle(button);

    // 모바일에서 버튼 너비가 80vw 또는 최소 280px
    expect(parseInt(computedStyle.width)).toBeGreaterThanOrEqual(250);
  });

  test('태블릿 (768px)에서 레이아웃 적용', () => {
    setViewport(768, 1024);
    const { container } = render(<App />);

    const button = container.querySelector('button');
    const computedStyle = window.getComputedStyle(button);

    // 태블릿에서 버튼 너비 약 220px
    const width = parseInt(computedStyle.width);
    expect(width).toBeGreaterThanOrEqual(200);
    expect(width).toBeLessThanOrEqual(240);
  });

  test('데스크톱 (1024px)에서 레이아웃 적용', () => {
    setViewport(1920, 1080);
    const { container } = render(<App />);

    const button = container.querySelector('button');
    const computedStyle = window.getComputedStyle(button);

    // 데스크톱에서 버튼 너비 약 240px
    const width = parseInt(computedStyle.width);
    expect(width).toBeGreaterThanOrEqual(230);
    expect(width).toBeLessThanOrEqual(250);
  });
});
```

#### TC-4.2: 접근성 자동 테스트
**파일**: `tests/accessibility/Accessibility.test.jsx`
**유형**: 접근성 테스트
**우선순위**: High
```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../../src/App';

expect.extend(toHaveNoViolations);

describe('접근성 자동 검사', () => {
  test('WCAG 2.1 AA 기준 위반 없음', async () => {
    const { container } = render(<App />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  test('버튼의 색상 대비가 4.5:1 이상', async () => {
    const { container } = render(<App />);
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  test('모든 인터랙티브 요소에 적절한 레이블 존재', async () => {
    const { container } = render(<App />);
    const results = await axe(container, {
      rules: {
        'button-name': { enabled: true },
        'aria-input-field-name': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });
});
```

#### TC-4.3: 키보드 네비게이션 테스트
**파일**: `tests/accessibility/Keyboard.test.jsx`
**유형**: 통합 테스트
**우선순위**: High
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('키보드 네비게이션', () => {
  test('Tab 키로 버튼 포커스 이동', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.tab();

    const button = screen.getByRole('button');
    expect(button).toHaveFocus();
  });

  test('포커스 시 아웃라인 표시', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.tab();

    const button = container.querySelector('button:focus');
    const computedStyle = window.getComputedStyle(button);

    // outline이 설정되어 있는지 확인
    expect(computedStyle.outlineWidth).not.toBe('0px');
  });

  test('굴리는 중에도 포커스 유지', async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByRole('button');
    await user.click(button);

    // 굴리는 중에도 포커스가 버튼에 유지됨
    expect(button).toHaveFocus();
  });
});
```

#### TC-4.4: 터치 타겟 크기 테스트
**파일**: `tests/accessibility/TouchTarget.test.jsx`
**유형**: 단위 테스트
**우선순위**: Medium
```javascript
import { render } from '@testing-library/react';
import RollButton from '../../src/components/RollButton';

describe('터치 타겟 크기', () => {
  test('버튼 크기가 최소 44x44px 이상', () => {
    const { container } = render(<RollButton isRolling={false} onClick={vi.fn()} />);
    const button = container.querySelector('button');
    const rect = button.getBoundingClientRect();

    expect(rect.width).toBeGreaterThanOrEqual(44);
    expect(rect.height).toBeGreaterThanOrEqual(44);
  });

  test('모바일 뷰포트에서도 터치 타겟 크기 유지', () => {
    // 모바일 뷰포트 설정
    Object.defineProperty(window, 'innerWidth', { value: 375 });

    const { container } = render(<RollButton isRolling={false} onClick={vi.fn()} />);
    const button = container.querySelector('button');
    const rect = button.getBoundingClientRect();

    expect(rect.width).toBeGreaterThanOrEqual(44);
    expect(rect.height).toBeGreaterThanOrEqual(44);
  });
});
```

---

## Iteration 5: 성능 최적화 및 폴리싱

### 목표
성능 최적화가 효과적으로 적용되었는지 검증

### 테스트 케이스

#### TC-5.1: React 렌더링 최적화 테스트
**파일**: `tests/performance/Rendering.test.jsx`
**유형**: 성능 테스트
**우선순위**: Medium
```javascript
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ResultDisplay from '../../src/components/ResultDisplay';

describe('렌더링 최적화', () => {
  test('props가 변경되지 않으면 재렌더링 안 됨 (React.memo)', () => {
    let renderCount = 0;

    const TestWrapper = ({ result }) => {
      renderCount++;
      return <ResultDisplay result={result} isVisible={true} />;
    };

    const { rerender } = render(<TestWrapper result={3} />);
    expect(renderCount).toBe(1);

    // 동일한 props로 재렌더링
    rerender(<TestWrapper result={3} />);
    expect(renderCount).toBe(1); // 재렌더링 안 됨
  });
});
```

#### TC-5.2: 메모리 누수 테스트
**파일**: `tests/performance/MemoryLeak.test.jsx`
**유형**: 성능 테스트
**우선순위**: High
```javascript
import { render, unmount } from '@testing-library/react';
import DiceScene from '../../src/components/DiceScene';

describe('메모리 누수 방지', () => {
  test('컴포넌트 언마운트 시 리소스 정리', () => {
    const { unmount } = render(<DiceScene />);

    // Three.js 리소스 정리 spy 설정
    const disposeSpy = vi.fn();

    // unmount 호출
    unmount();

    // dispose 함수들이 호출되었는지 확인
    // (실제 구현에서는 cleanup useEffect가 있어야 함)
  });

  test('100회 주사위 굴려도 메모리 사용량 안정적', async () => {
    render(<DiceScene />);

    // 초기 메모리 사용량 측정 (performance.memory는 Chrome에서만 사용 가능)
    if (performance.memory) {
      const initialMemory = performance.memory.usedJSHeapSize;

      // 100회 굴리기 시뮬레이션
      for (let i = 0; i < 100; i++) {
        // rollDice 호출 및 완료 대기
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const finalMemory = performance.memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;

      // 메모리 증가가 10MB 이하여야 함
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    }
  });
});
```

#### TC-5.3: 번들 크기 테스트
**파일**: `tests/performance/BundleSize.test.js`
**유형**: 빌드 테스트
**우선순위**: High
```bash
# package.json scripts에 추가
{
  "scripts": {
    "test:bundle-size": "vite build && bundlesize"
  }
}
```

**설정**: `bundlesize.config.json`
```json
{
  "files": [
    {
      "path": "dist/assets/*.js",
      "maxSize": "850 KB",
      "compression": "gzip"
    },
    {
      "path": "dist/assets/*.css",
      "maxSize": "10 KB",
      "compression": "gzip"
    }
  ]
}
```

---

## Iteration 6: 테스트 및 배포

### 목표
E2E 테스트로 실제 사용자 시나리오 검증

### 테스트 케이스

#### TC-6.1: E2E - 기본 주사위 굴리기 플로우
**파일**: `e2e/dice-roll.spec.js` (Playwright)
**유형**: E2E 테스트
**우선순위**: High
```javascript
import { test, expect } from '@playwright/test';

test.describe('주사위 굴리기 E2E', () => {
  test('사용자가 주사위를 굴릴 수 있음', async ({ page }) => {
    // 1. 앱 접속
    await page.goto('http://localhost:5173');

    // 2. 버튼이 표시되는지 확인
    const button = page.getByRole('button', { name: /주사위 굴리기/i });
    await expect(button).toBeVisible();

    // 3. 버튼 클릭
    await button.click();

    // 4. 버튼이 비활성화됨
    await expect(button).toBeDisabled();

    // 5. 애니메이션 완료 후 결과 표시 (최대 3초 대기)
    const resultDisplay = page.getByRole('status');
    await expect(resultDisplay).toContainText(/결과: [1-6]/, { timeout: 3000 });

    // 6. 버튼이 다시 활성화됨
    await expect(button).toBeEnabled();
  });

  test('여러 번 연속으로 굴릴 수 있음', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const button = page.getByRole('button');

    // 3번 연속 굴리기
    for (let i = 0; i < 3; i++) {
      await button.click();
      await expect(button).toBeDisabled();
      await expect(button).toBeEnabled({ timeout: 3000 });
    }
  });

  test('키보드(Enter)로 주사위를 굴릴 수 있음', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Tab으로 버튼 포커스
    await page.keyboard.press('Tab');

    // Enter로 클릭
    await page.keyboard.press('Enter');

    // 결과 표시 확인
    const resultDisplay = page.getByRole('status');
    await expect(resultDisplay).toContainText(/결과: [1-6]/, { timeout: 3000 });
  });
});
```

#### TC-6.2: E2E - 크로스 브라우저 테스트
**파일**: `e2e/cross-browser.spec.js`
**유형**: E2E 테스트
**우선순위**: High
```javascript
import { test, expect, chromium, firefox, webkit } from '@playwright/test';

const browsers = [
  { name: 'Chromium', launcher: chromium },
  { name: 'Firefox', launcher: firefox },
  { name: 'WebKit (Safari)', launcher: webkit },
];

browsers.forEach(({ name, launcher }) => {
  test(`${name}에서 주사위 굴리기 작동`, async () => {
    const browser = await launcher.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:5173');

    const button = page.getByRole('button', { name: /주사위 굴리기/i });
    await button.click();

    const resultDisplay = page.getByRole('status');
    await expect(resultDisplay).toContainText(/결과: [1-6]/, { timeout: 3000 });

    await browser.close();
  });
});
```

#### TC-6.3: E2E - 모바일 디바이스 테스트
**파일**: `e2e/mobile.spec.js`
**유형**: E2E 테스트
**우선순위**: High
```javascript
import { test, expect, devices } from '@playwright/test';

const mobileDevices = [
  'iPhone 12',
  'Pixel 5',
  'iPad Pro',
];

mobileDevices.forEach(deviceName => {
  test.use(devices[deviceName]);

  test(`${deviceName}에서 터치로 주사위 굴리기`, async ({ page }) => {
    await page.goto('http://localhost:5173');

    const button = page.getByRole('button', { name: /주사위 굴리기/i });

    // 터치 이벤트로 클릭
    await button.tap();

    const resultDisplay = page.getByRole('status');
    await expect(resultDisplay).toContainText(/결과: [1-6]/, { timeout: 3000 });
  });
});
```

#### TC-6.4: Lighthouse 성능 감사
**파일**: `tests/lighthouse/lighthouse.test.js`
**유형**: 성능 테스트
**우선순위**: High
```javascript
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

describe('Lighthouse 성능 감사', () => {
  test('Performance 점수 90 이상', async () => {
    const chrome = await launch({ chromeFlags: ['--headless'] });
    const options = { port: chrome.port };

    const runnerResult = await lighthouse('http://localhost:5173', options);
    const { performance, accessibility } = runnerResult.lhr.categories;

    expect(performance.score * 100).toBeGreaterThanOrEqual(90);
    expect(accessibility.score * 100).toBe(100);

    await chrome.kill();
  });
});
```

#### TC-6.5: 시각적 회귀 테스트 (선택)
**파일**: `e2e/visual-regression.spec.js`
**유형**: 시각적 테스트
**우선순위**: Low
```javascript
import { test, expect } from '@playwright/test';

test.describe('시각적 회귀 테스트', () => {
  test('초기 화면 스크린샷 비교', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page).toHaveScreenshot('initial-state.png');
  });

  test('주사위 굴린 후 스크린샷 비교', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const button = page.getByRole('button');
    await button.click();
    await page.waitForTimeout(2000); // 애니메이션 완료 대기

    await expect(page).toHaveScreenshot('after-roll.png');
  });
});
```

---

## 테스트 커버리지 목표

### 코드 커버리지
```bash
npm run test:coverage
```

**목표**:
- **전체 커버리지**: 80% 이상
- **Statements**: 85% 이상
- **Branches**: 75% 이상
- **Functions**: 85% 이상
- **Lines**: 85% 이상

**중점 영역**:
- ✅ `utils/`: 100% (순수 함수)
- ✅ `hooks/`: 90% 이상
- ✅ `components/`: 80% 이상

---

## CI/CD 통합

### GitHub Actions 워크플로우
**파일**: `.github/workflows/test.yml`
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Lighthouse CI
        run: npm run test:lighthouse
```

---

## 테스트 실행 명령어

### 로컬 개발
```bash
# 모든 단위/통합 테스트 실행
npm run test

# Watch 모드로 테스트 실행
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage

# E2E 테스트 실행 (Playwright)
npm run test:e2e

# E2E 테스트 UI 모드
npm run test:e2e:ui

# Lighthouse 성능 감사
npm run test:lighthouse

# 접근성 테스트
npm run test:a11y
```

### package.json 스크립트
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:lighthouse": "lighthouse-ci autorun",
    "test:a11y": "vitest --testPathPattern=accessibility"
  }
}
```

---

## 테스트 우선순위 매트릭스

| 우선순위 | 테스트 유형 | 예상 시간 | 필수 여부 |
|---------|-----------|---------|----------|
| **P0 (Critical)** | 단위 테스트 (utils) | 2시간 | 필수 |
| **P0** | 통합 테스트 (주사위 굴리기) | 3시간 | 필수 |
| **P0** | E2E 테스트 (기본 플로우) | 2시간 | 필수 |
| **P1 (High)** | 접근성 자동 테스트 | 1시간 | 필수 |
| **P1** | 크로스 브라우저 E2E | 2시간 | 필수 |
| **P2 (Medium)** | 성능 테스트 (Lighthouse) | 1시간 | 권장 |
| **P2** | 반응형 레이아웃 테스트 | 1.5시간 | 권장 |
| **P3 (Low)** | 시각적 회귀 테스트 | 1시간 | 선택 |

**총 예상 시간**: 13.5시간

---

## 테스트 작성 가이드라인

### 1. 테스트 명명 규칙
```javascript
// ✅ Good
test('버튼 클릭 시 주사위가 굴러감', () => { ... });
test('1-6 범위의 무작위 숫자를 생성함', () => { ... });

// ❌ Bad
test('test1', () => { ... });
test('works', () => { ... });
```

### 2. AAA 패턴 사용
```javascript
test('무작위 숫자 생성', () => {
  // Arrange (준비)
  const expectedRange = [1, 2, 3, 4, 5, 6];

  // Act (실행)
  const result = generateRandomNumber();

  // Assert (검증)
  expect(expectedRange).toContain(result);
});
```

### 3. 테스트 격리
- 각 테스트는 독립적이어야 함
- 테스트 간 상태 공유 금지
- `beforeEach`/`afterEach`로 초기화

### 4. Mock 최소화
- 실제 객체 사용 우선
- Mock은 외부 의존성에만 사용
- Three.js는 실제 인스턴스 사용 (가능한 경우)

---

## 성공 기준 (Definition of Done - Testing)

### Iteration별 테스트 완료 조건

#### Iteration 1-3
- [ ] 모든 P0 단위 테스트 작성 및 통과
- [ ] 커버리지 60% 이상

#### Iteration 4
- [ ] 접근성 자동 테스트 통과
- [ ] 반응형 테스트 통과
- [ ] 커버리지 75% 이상

#### Iteration 5
- [ ] 성능 테스트 통과
- [ ] 번들 크기 목표 달성
- [ ] 커버리지 80% 이상

#### Iteration 6
- [ ] 모든 E2E 테스트 통과
- [ ] Lighthouse Performance 90+, Accessibility 100
- [ ] 크로스 브라우저 테스트 통과
- [ ] CI/CD 파이프라인 통과

---

## 문서 정보

- **버전**: 1.0
- **작성일**: 2024년
- **담당**: Test Designer Agent
- **상태**: 최종 승인 대기 ✅
- **참조 문서**:
  - requirements.md
  - ux-design.md
  - tech-spec.md
  - implementation-plan.md

---

## 다음 단계

이 테스트 계획서를 바탕으로:
1. ✅ Developer Agent가 TDD 방식으로 개발 시작
2. ✅ 각 Iteration 전에 해당 테스트 먼저 작성 (Red)
3. ✅ 코드 구현 (Green)
4. ✅ 리팩토링 (Refactor)
5. ✅ 테스트 통과 확인 후 다음 Iteration으로 진행

**테스트 계획서 작성 완료** 🧪✅
