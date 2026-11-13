/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StairGateProps {
  position: [number, number, number];
  isUnlocked: boolean;
  hasKey: boolean;
  gatheringCount: number;
  totalPlayers: number;
  isExitGate?: boolean;
}

export const StairGate: React.FC<StairGateProps> = ({
  position,
  isUnlocked,
  hasKey,
  gatheringCount,
  totalPlayers,
  isExitGate = false,
}) => {
  const gateLeftRef = useRef<THREE.Group>(null);
  const gateRightRef = useRef<THREE.Group>(null);
  const zoneRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    // Smooth gate swing open when unlocked
    const targetAngle = isUnlocked ? Math.PI * 0.45 : 0;
    if (gateLeftRef.current) {
      gateLeftRef.current.rotation.y = THREE.MathUtils.damp(
        gateLeftRef.current.rotation.y,
        -targetAngle,
        4,
        delta
      );
    }
    if (gateRightRef.current) {
      gateRightRef.current.rotation.y = THREE.MathUtils.damp(
        gateRightRef.current.rotation.y,
        targetAngle,
        4,
        delta
      );
    }

    if (zoneRef.current) {
      const mat = zoneRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.35 + Math.sin(Date.now() * 0.004) * 0.15;
      }
    }
  });

  return (
    <group position={position}>
      {/* Outer Metal Frame */}
      <mesh position={[-2.1, 1.8, 0]}>
        <boxGeometry args={[0.2, 3.6, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[2.1, 1.8, 0]}>
        <boxGeometry args={[0.2, 3.6, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.6, 0]}>
        <boxGeometry args={[4.4, 0.2, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Header Sign */}
      <mesh position={[0, 3.25, 0.02]}>
        <boxGeometry args={[2.2, 0.4, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Left Gate Wing */}
      <group ref={gateLeftRef} position={[-2.0, 0, 0]}>
        <group position={[1.0, 0, 0]}>
          {/* Top & Bottom Bars */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[2.0, 0.1, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 2.9, 0]}>
            <boxGeometry args={[2.0, 0.1, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[2.0, 0.08, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Vertical Bars */}
          {[-0.8, -0.5, -0.2, 0.1, 0.4, 0.7].map((x, i) => (
            <mesh key={`l_bar_${i}`} position={[x, 1.5, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 2.9, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Right Gate Wing */}
      <group ref={gateRightRef} position={[2.0, 0, 0]}>
        <group position={[-1.0, 0, 0]}>
          {/* Top & Bottom Bars */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[2.0, 0.1, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 2.9, 0]}>
            <boxGeometry args={[2.0, 0.1, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[2.0, 0.08, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Vertical Bars */}
          {[-0.7, -0.4, -0.1, 0.2, 0.5, 0.8].map((x, i) => (
            <mesh key={`r_bar_${i}`} position={[x, 1.5, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 2.9, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Center Lock Box */}
      {!isUnlocked && (
        <group position={[0, 1.5, 0.06]}>
          <mesh>
            <boxGeometry args={[0.3, 0.4, 0.15]} />
            <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Keyhole / LED Indicator */}
          <mesh position={[0, 0, 0.08]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color={hasKey ? '#facc15' : '#ef4444'} />
          </mesh>
          <pointLight
            position={[0, 0, 0.2]}
            color={hasKey ? '#facc15' : '#ef4444'}
            intensity={1.2}
            distance={2}
          />
        </group>
      )}

      {/* Gathering Zone (Active after gate unlocked) */}
      {isUnlocked && (
        <group position={[0, 0.02, 2.2]}>
          {/* Floor pad */}
          <mesh ref={zoneRef} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 3.2]} />
            <meshBasicMaterial
              color="#22c55e"
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>

          {/* Border ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.6, 32]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>

          {/* Upward particle cylinder / light beam */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 2.4, 16, 1, true]} />
            <meshBasicMaterial
              color="#22c55e"
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          <pointLight position={[0, 1.0, 0]} color="#4ade80" intensity={2} distance={5} />
        </group>
      )}
    </group>
  );
};
