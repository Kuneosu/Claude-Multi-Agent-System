// 애니메이션 관련 상수
export const ANIMATION_DURATION = 1.5; // 초

// 주사위 크기
export const DICE_SIZE = 1;

// 카메라 설정
export const CAMERA_POSITION = [0, 0, 5];
export const CAMERA_FOV = 50;

// 각 면이 위를 향하도록 하는 회전 각도 (라디안)
// Three.js BoxGeometry 면 순서: +X(3), -X(4), +Y(1), -Y(6), +Z(2), -Z(5)
export const ROTATION_MAP = {
  1: [0, 0, 0],                           // 1이 위 (+Y가 위)
  2: [-Math.PI / 2, 0, 0],                // 2가 위 (+Z가 위)
  3: [0, 0, -Math.PI / 2],                // 3이 위 (+X가 위)
  4: [0, 0, Math.PI / 2],                 // 4가 위 (-X가 위)
  5: [Math.PI / 2, 0, 0],                 // 5가 위 (-Z가 위)
  6: [Math.PI, 0, 0],                     // 6이 위 (-Y가 위)
};

// 색상
export const COLORS = {
  primary: '#4A90E2',
  primaryHover: '#357ABD',
  disabled: '#CCCCCC',
  text: '#333333',
  white: '#FFFFFF',
  diceBody: '#FFFFFF',
  diceDots: '#333333',
};

// 물리 엔진 설정
export const PHYSICS = {
  gravity: [0, -20, 0],
  restitution: 0.3,       // 반발 계수
  friction: 0.8,          // 마찰 계수
  linearDamping: 0.5,     // 선형 감쇠
  angularDamping: 0.5,    // 각속도 감쇠
};

// 주사위 정지 감지 설정
export const SETTLE_DETECTION = {
  speedThreshold: 0.1,      // 선형 속도 임계값
  angSpeedThreshold: 0.1,   // 각속도 임계값
  settleTime: 300,          // 정지 확인 시간 (ms)
  checkInterval: 100,       // 체크 주기 (ms)
};

// 던지기 힘 설정
export const THROW_CONFIG = {
  initialHeight: 5,         // 초기 높이
  horizontalForce: 8,       // 수평 힘 범위
  verticalForce: -2,        // 수직 힘
  torqueRange: 30,          // 회전력 범위
};
