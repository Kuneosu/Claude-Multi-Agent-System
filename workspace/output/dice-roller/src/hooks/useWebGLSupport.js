import { useSyncExternalStore } from 'react';

/**
 * WebGL 지원 여부를 확인하는 함수
 */
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

// 서버 사이드 렌더링 및 초기 값
const isSupported = typeof window !== 'undefined' ? checkWebGLSupport() : true;

/**
 * WebGL 지원 여부를 확인하는 커스텀 훅
 * @returns {boolean} WebGL 지원 여부
 */
export function useWebGLSupport() {
  return useSyncExternalStore(
    () => () => {}, // subscribe (변경되지 않음)
    () => isSupported, // getSnapshot
    () => true // getServerSnapshot
  );
}
