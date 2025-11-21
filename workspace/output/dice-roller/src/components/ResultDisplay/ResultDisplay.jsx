import { memo } from 'react';
import styles from './ResultDisplay.module.css';

function ResultDisplay({ result, isVisible }) {
  if (!result) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.placeholder}
      />
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`${styles.result} ${isVisible ? styles.visible : styles.hidden}`}
      style={!isVisible ? { visibility: 'hidden' } : {}}
    >
      Result
      <span className={styles.number}>{result}</span>
    </div>
  );
}

export default memo(ResultDisplay);
