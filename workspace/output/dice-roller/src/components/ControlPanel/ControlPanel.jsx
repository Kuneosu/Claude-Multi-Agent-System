import RollButton from '../RollButton';
import ResultDisplay from '../ResultDisplay';
import styles from './ControlPanel.module.css';

function ControlPanel({ isRolling, currentResult, onRoll }) {
  return (
    <section className={styles.panel} aria-label="컨트롤 패널">
      <RollButton isRolling={isRolling} onClick={onRoll} />
      <ResultDisplay result={currentResult} isVisible={!isRolling && currentResult !== null} />
    </section>
  );
}

export default ControlPanel;
