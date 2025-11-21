import { memo } from 'react';
import styles from './RollButton.module.css';

function RollButton({ isRolling, onClick }) {
  return (
    <button
      className={`${styles.button} ${isRolling ? styles.disabled : ''}`}
      onClick={onClick}
      disabled={isRolling}
      aria-label="주사위 굴리기"
      aria-disabled={isRolling}
      aria-busy={isRolling}
    >
      {isRolling ? '굴리는 중...' : '🎲 주사위 굴리기'}
    </button>
  );
}

export default memo(RollButton);
