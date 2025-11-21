import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CAMERA_FOV, DICE_SIZE, PHYSICS, SETTLE_DETECTION, THROW_CONFIG } from '../../utils/constants';
import styles from './DiceScene.module.css';

/**
 * 고급 나무 마룻바닥 텍스처 생성
 */
function createWoodTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 베이스 색상
  ctx.fillStyle = '#5D3A1A';
  ctx.fillRect(0, 0, size, size);

  // 나무판자 그리기
  const plankWidth = size / 5;
  for (let i = 0; i < 5; i++) {
    const x = i * plankWidth;
    const hue = 20 + Math.random() * 15;
    const sat = 50 + Math.random() * 20;
    const lightness = 25 + Math.random() * 15;

    // 판자 베이스
    const gradient = ctx.createLinearGradient(x, 0, x + plankWidth, 0);
    gradient.addColorStop(0, `hsl(${hue}, ${sat}%, ${lightness}%)`);
    gradient.addColorStop(0.5, `hsl(${hue}, ${sat}%, ${lightness + 5}%)`);
    gradient.addColorStop(1, `hsl(${hue}, ${sat}%, ${lightness - 3}%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 2, 0, plankWidth - 4, size);

    // 나무결 그리기
    ctx.strokeStyle = `hsla(${hue}, 30%, ${lightness - 8}%, 0.4)`;
    ctx.lineWidth = 1;
    for (let j = 0; j < 30; j++) {
      const y = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(x + 8, y);
      ctx.bezierCurveTo(
        x + plankWidth * 0.25, y + Math.random() * 15 - 7,
        x + plankWidth * 0.75, y + Math.random() * 15 - 7,
        x + plankWidth - 8, y + Math.random() * 8 - 4
      );
      ctx.stroke();
    }

    // 옹이 (knots)
    if (Math.random() > 0.6) {
      const knotX = x + plankWidth * (0.3 + Math.random() * 0.4);
      const knotY = Math.random() * size;
      const knotSize = 8 + Math.random() * 12;

      const knotGrad = ctx.createRadialGradient(knotX, knotY, 0, knotX, knotY, knotSize);
      knotGrad.addColorStop(0, `hsl(${hue - 5}, 40%, ${lightness - 15}%)`);
      knotGrad.addColorStop(0.7, `hsl(${hue}, 45%, ${lightness - 8}%)`);
      knotGrad.addColorStop(1, `hsl(${hue}, ${sat}%, ${lightness}%)`);
      ctx.fillStyle = knotGrad;
      ctx.beginPath();
      ctx.ellipse(knotX, knotY, knotSize, knotSize * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // 판자 경계선
    ctx.strokeStyle = '#2A1A0A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * 주사위 면에 점을 그리는 텍스처 생성 (고급 버전)
 */
function createDiceTexture(number) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 베이스 그라데이션
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#FFFFFF');
  gradient.addColorStop(1, '#F0F0F0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // 미묘한 테두리
  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = 4;
  const radius = 30;
  ctx.beginPath();
  ctx.roundRect(2, 2, size - 4, size - 4, radius);
  ctx.stroke();

  // 점 그리기 - 크기와 간격 조정
  const dotRadius = 38;
  const center = size / 2;
  const offset = size / 3.2;  // 간격 조정

  const patterns = {
    1: [[center, center]],
    2: [[center - offset, center - offset], [center + offset, center + offset]],
    3: [[center - offset, center - offset], [center, center], [center + offset, center + offset]],
    4: [
      [center - offset, center - offset], [center + offset, center - offset],
      [center - offset, center + offset], [center + offset, center + offset]
    ],
    5: [
      [center - offset, center - offset], [center + offset, center - offset],
      [center, center],
      [center - offset, center + offset], [center + offset, center + offset]
    ],
    6: [
      [center - offset, center - offset], [center + offset, center - offset],
      [center - offset, center], [center + offset, center],
      [center - offset, center + offset], [center + offset, center + offset]
    ],
  };

  (patterns[number] || []).forEach(([x, y]) => {
    // 점 그림자 (더 진하게)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(x + 3, y + 3, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // 점 메인 (순수 검정색)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // 점 하이라이트 (미묘하게)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(x - 10, y - 10, dotRadius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.center.set(0.5, 0.5);
  texture.rotation = 0;
  return texture;
}

function Floor() {
  const woodTexture = useMemo(() => createWoodTexture(), []);

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[10, 0.1, 10]} position={[0, -0.1, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.7}
          metalness={0.05}
          envMapIntensity={0.5}
        />
      </mesh>
    </RigidBody>
  );
}

function PhysicsDice({ isRolling, onSettled }) {
  const rigidBodyRef = useRef(null);
  const hasThrownRef = useRef(false);
  const settledTimeRef = useRef(null);
  const prevIsRollingRef = useRef(false);

  const materials = useMemo(() => {
    const faceOrder = [3, 4, 1, 6, 2, 5];
    return faceOrder.map(num =>
      new THREE.MeshStandardMaterial({
        map: createDiceTexture(num),
        metalness: 0.05,
        roughness: 0.4,
        envMapIntensity: 0.8,
      })
    );
  }, []);

  // 주사위 던지기 및 정지 감지
  useEffect(() => {
    // 굴리기 시작 감지
    if (isRolling && !prevIsRollingRef.current && rigidBodyRef.current) {
      hasThrownRef.current = true;
      settledTimeRef.current = null;

      // 초기 위치로 리셋
      rigidBodyRef.current.setTranslation({ x: 0, y: THROW_CONFIG.initialHeight, z: 0 }, true);

      // 랜덤 초기 회전
      const randomRotation = {
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        z: Math.random() * Math.PI * 2,
      };
      rigidBodyRef.current.setRotation(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(randomRotation.x, randomRotation.y, randomRotation.z)
        ),
        true
      );

      // 랜덤 던지기 힘
      const throwForce = {
        x: (Math.random() - 0.5) * THROW_CONFIG.horizontalForce,
        y: THROW_CONFIG.verticalForce,
        z: (Math.random() - 0.5) * THROW_CONFIG.horizontalForce,
      };
      rigidBodyRef.current.setLinvel(throwForce, true);

      // 랜덤 회전력
      const torque = {
        x: (Math.random() - 0.5) * THROW_CONFIG.torqueRange,
        y: (Math.random() - 0.5) * THROW_CONFIG.torqueRange,
        z: (Math.random() - 0.5) * THROW_CONFIG.torqueRange,
      };
      rigidBodyRef.current.setAngvel(torque, true);

      // 주사위 깨우기
      rigidBodyRef.current.wakeUp();
    }

    if (!isRolling) {
      hasThrownRef.current = false;
    }

    prevIsRollingRef.current = isRolling;

    // 주사위 정지 감지
    if (!isRolling || !hasThrownRef.current) return;

    const checkSettled = setInterval(() => {
      if (!rigidBodyRef.current) return;

      const linvel = rigidBodyRef.current.linvel();
      const angvel = rigidBodyRef.current.angvel();
      const speed = Math.sqrt(linvel.x ** 2 + linvel.y ** 2 + linvel.z ** 2);
      const angSpeed = Math.sqrt(angvel.x ** 2 + angvel.y ** 2 + angvel.z ** 2);

      if (speed < SETTLE_DETECTION.speedThreshold && angSpeed < SETTLE_DETECTION.angSpeedThreshold) {
        if (!settledTimeRef.current) {
          settledTimeRef.current = Date.now();
        } else if (Date.now() - settledTimeRef.current > SETTLE_DETECTION.settleTime) {
          // 정지 시간 동안 정지 상태 유지시 완료
          clearInterval(checkSettled);
          if (onSettled) {
            // 윗면 숫자 계산
            const rotation = rigidBodyRef.current.rotation();
            const euler = new THREE.Euler().setFromQuaternion(
              new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
            );
            const result = getTopFace(euler);
            onSettled(result);
          }
        }
      } else {
        settledTimeRef.current = null;
      }
    }, SETTLE_DETECTION.checkInterval);

    return () => clearInterval(checkSettled);
  }, [isRolling, onSettled]);

  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(DICE_SIZE, DICE_SIZE, DICE_SIZE);
  }, []);

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders="cuboid"
      restitution={PHYSICS.restitution}
      friction={PHYSICS.friction}
      linearDamping={PHYSICS.linearDamping}
      angularDamping={PHYSICS.angularDamping}
      position={[0, 1, 0]}
    >
      <mesh
        geometry={geometry}
        material={materials}
        castShadow
        receiveShadow
      />
    </RigidBody>
  );
}

/**
 * 주사위 윗면 숫자 계산
 */
function getTopFace(euler) {
  const up = new THREE.Vector3(0, 1, 0);
  const faces = [
    { normal: new THREE.Vector3(1, 0, 0), value: 3 },   // +X
    { normal: new THREE.Vector3(-1, 0, 0), value: 4 },  // -X
    { normal: new THREE.Vector3(0, 1, 0), value: 1 },   // +Y
    { normal: new THREE.Vector3(0, -1, 0), value: 6 },  // -Y
    { normal: new THREE.Vector3(0, 0, 1), value: 2 },   // +Z
    { normal: new THREE.Vector3(0, 0, -1), value: 5 },  // -Z
  ];

  const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(euler);
  let maxDot = -Infinity;
  let topValue = 1;

  faces.forEach(face => {
    const rotatedNormal = face.normal.clone().applyMatrix4(rotationMatrix);
    const dot = rotatedNormal.dot(up);
    if (dot > maxDot) {
      maxDot = dot;
      topValue = face.value;
    }
  });

  return topValue;
}

function DiceScene({ isRolling, onDiceSettled }) {
  return (
    <div className={styles.sceneContainer}>
      <Canvas
        camera={{ position: [8, 8, 8], fov: CAMERA_FOV }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: true }}
        shadows
      >
        <color attach="background" args={['#0a0a0a']} />

        <Suspense fallback={null}>
          {/* 카메라 컨트롤 - 스크롤로 줌 */}
          <OrbitControls
            enablePan={false}
            enableRotate={true}
            enableZoom={true}
            minDistance={3}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            target={[0, 0.5, 0]}
          />

          {/* 환경 조명 */}
          <Environment preset="apartment" />

          {/* 주 조명 */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-3, 5, -3]} intensity={0.5} />
          <pointLight position={[0, 8, 0]} intensity={0.4} color="#fff5e0" />

          <Physics gravity={PHYSICS.gravity}>
            <Floor />
            <PhysicsDice isRolling={isRolling} onSettled={onDiceSettled} />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default DiceScene;
