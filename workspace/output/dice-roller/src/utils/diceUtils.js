import { ROTATION_MAP } from './constants';

/**
 * 1-6 범위의 무작위 정수를 생성합니다.
 * @returns {number} 1-6 사이의 정수
 */
export function generateRandomNumber() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * 주사위 결과에 따른 목표 회전 각도를 반환합니다.
 * @param {number} result - 주사위 결과 (1-6)
 * @returns {[number, number, number] | undefined} [x, y, z] 회전 각도 (라디안)
 */
export function getTargetRotation(result) {
  return ROTATION_MAP[result];
}

/**
 * 랜덤 스핀 회전 값을 생성합니다.
 * @returns {Object} x, y, z 축 회전 값
 */
export function generateRandomSpin() {
  const minRotation = Math.PI * 4; // 720도
  const maxRotation = Math.PI * 8; // 1440도

  return {
    x: minRotation + Math.random() * (maxRotation - minRotation),
    y: minRotation + Math.random() * (maxRotation - minRotation),
    z: Math.PI * 2 + Math.random() * Math.PI * 2, // 360-720도
  };
}
