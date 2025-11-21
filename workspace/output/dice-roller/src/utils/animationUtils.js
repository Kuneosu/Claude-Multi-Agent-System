/**
 * easeOutCubic 이징 함수
 * 빠르게 시작하여 천천히 종료
 * @param {number} t - 진행률 (0-1)
 * @returns {number} 이징이 적용된 값 (0-1)
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * easeOutQuad 이징 함수
 * @param {number} t - 진행률 (0-1)
 * @returns {number} 이징이 적용된 값 (0-1)
 */
export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

/**
 * 선형 보간 함수
 * @param {number} start - 시작 값
 * @param {number} end - 끝 값
 * @param {number} t - 진행률 (0-1)
 * @returns {number} 보간된 값
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}
