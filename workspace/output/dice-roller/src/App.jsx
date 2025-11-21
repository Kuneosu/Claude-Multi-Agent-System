import { useState, useCallback, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import DiceScene from './components/DiceScene';
import RollButton from './components/RollButton';
import ResultDisplay from './components/ResultDisplay';
import { useWebGLSupport } from './hooks/useWebGLSupport';
import styles from './App.module.css';

function App() {
  const isWebGLSupported = useWebGLSupport();
  const [isRolling, setIsRolling] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  const rollDice = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    setCurrentResult(null);
  }, [isRolling]);

  const handleDiceSettled = useCallback((result) => {
    setCurrentResult(result);
    setIsRolling(false);
  }, []);

  // Keyboard control - SPACE to roll
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

  if (!isWebGLSupported) {
    return (
      <div className={styles.errorContainer}>
        <h2>WebGL이 지원되지 않습니다</h2>
        <p>Chrome, Firefox, Safari 또는 Edge의 최신 버전을 사용해주세요.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={styles.app}>
        <main className={styles.main}>
          <DiceScene
            isRolling={isRolling}
            onDiceSettled={handleDiceSettled}
          />
        </main>

        <div className={styles.overlay}>
          <div className={styles.resultOverlay}>
            <ResultDisplay result={currentResult} isVisible={!isRolling && currentResult !== null} />
          </div>

          <div className={styles.controlOverlay}>
            <RollButton isRolling={isRolling} onClick={rollDice} />
          </div>
        </div>

        <span className={styles.hint}>Press SPACE to roll</span>
      </div>
    </ErrorBoundary>
  );
}

export default App;
