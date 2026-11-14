/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

interface StairGateProps {
  position: [number, number, number];
  isUnlocked: boolean;
  hasKey: boolean;
  gatheringCount: number;
  totalPlayers: number;
  isExitGate?: boolean;
}

export const StairGate = React.memo<StairGateProps>(({
  position,
  isUnlocked,
  hasKey,
  gatheringCount,
  totalPlayers,
  isExitGate = false,
}) => {
  const graphicsQuality = useGameStore((s) => s.graphicsQuality);
  const isMobile = graphicsQuality === 'mobile';
  const gateLeftRef = useRef<THREE.Group>(null);
  const gateRightRef = useRef<THREE.Group>(null);
  const zoneRef = useRef<THREE.Mesh>(null);

  const totalWidth = isExitGate ? 9.0 : 7.0;
  const halfWidth = totalWidth / 2;
  const wingWidth = halfWidth - 0.25;

  useFrame((_, delta) => {
    // Only animate when gate needs to swing or zone pulses
    if (!isUnlocked && gateLeftRef.current?.rotation.y === 0) return;

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
      {/* Outer Metal / Stone Pillars */}
      <mesh position={[-halfWidth, 2.0, 0]}>
        <boxGeometry args={[0.5, 4.0, 0.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[halfWidth, 2.0, 0]}>
        <boxGeometry args={[0.5, 4.0, 0.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.0, 0]}>
        <boxGeometry args={[totalWidth + 0.5, 0.3, 0.3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Header Sign (EXIT / PINTU TANGGA) */}
      <mesh position={[0, 3.65, 0.04]}>
        <boxGeometry args={[isExitGate ? 4.8 : 3.2, 0.5, 0.06]} />
        <meshStandardMaterial color={isExitGate ? '#15803d' : '#0f172a'} roughness={0.7} />
      </mesh>
      {/* Illuminated Exit Lamp (Desktop PC only) */}
      {!isMobile && (
        <pointLight
          position={[0, 3.65, 0.4]}
          color={isExitGate ? '#4ade80' : '#38bdf8'}
          intensity={1.2}
          distance={6}
        />
      )}

      {/* Left Gate Wing */}
      <group ref={gateLeftRef} position={[-halfWidth + 0.2, 0, 0]}>
        <group position={[wingWidth / 2, 0, 0]}>
          {/* Top & Bottom Bars */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[wingWidth, 0.12, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <boxGeometry args={[wingWidth, 0.12, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[wingWidth, 0.08, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Vertical Bars */}
          {Array.from({ length: Math.floor(wingWidth / 0.32) }).map((_, i) => {
            const x = -wingWidth / 2 + 0.2 + i * 0.32;
            return (
              <mesh key={`l_bar_${i}`} position={[x, 1.6, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 3.2, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* Right Gate Wing */}
      <group ref={gateRightRef} position={[halfWidth - 0.2, 0, 0]}>
        <group position={[-wingWidth / 2, 0, 0]}>
          {/* Top & Bottom Bars */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[wingWidth, 0.12, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <boxGeometry args={[wingWidth, 0.12, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[wingWidth, 0.08, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Vertical Bars */}
          {Array.from({ length: Math.floor(wingWidth / 0.32) }).map((_, i) => {
            const x = -wingWidth / 2 + 0.2 + i * 0.32;
            return (
              <mesh key={`r_bar_${i}`} position={[x, 1.6, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 3.2, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* Center Lock Box */}
      {!isUnlocked && (
        <group position={[0, 1.6, 0.06]}>
          <mesh>
            <boxGeometry args={[0.35, 0.45, 0.16]} />
            <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Keyhole / LED Indicator */}
          <mesh position={[0, 0, 0.09]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color={hasKey ? '#facc15' : '#ef4444'} />
          </mesh>
          {!isMobile && (
            <pointLight
              position={[0, 0, 0.2]}
              color={hasKey ? '#facc15' : '#ef4444'}
              intensity={1.4}
              distance={3}
            />
          )}
        </group>
      )}

      {/* Gathering Zone (Active after gate unlocked) */}
      {isUnlocked && (
        <group position={[0, 0.02, 2.5]}>
          {/* Floor pad */}
          <mesh ref={zoneRef} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[isExitGate ? 5.0 : 4.0, isExitGate ? 4.5 : 3.6]} />
            <meshBasicMaterial
              color="#22c55e"
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>

          {/* Border ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.8, 1.95, 32]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>

          {/* Upward particle cylinder / light beam */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[1.8, 1.8, 2.4, 16, 1, true]} />
            <meshBasicMaterial
              color="#22c55e"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {!isMobile && (
            <pointLight position={[0, 1.0, 0]} color="#4ade80" intensity={2} distance={6} />
          )}
        </group>
      )}
    </group>
  );
});
