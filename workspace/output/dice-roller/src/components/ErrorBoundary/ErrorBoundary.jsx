import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>WebGL 미지원</h2>
          <p className={styles.errorMessage}>
            죄송합니다. 이 브라우저는 WebGL을 지원하지 않습니다.
          </p>
          <p className={styles.errorHint}>다음 브라우저를 사용해주세요:</p>
          <ul className={styles.browserList}>
            <li>Chrome (권장)</li>
            <li>Firefox</li>
            <li>Safari</li>
            <li>Edge</li>
          </ul>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
