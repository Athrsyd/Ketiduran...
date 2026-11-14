/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

interface KeyItemProps {
  position: [number, number, number];
  isMasterKey?: boolean;
  isNearby: boolean;
}

export const KeyItem = React.memo<KeyItemProps>(({
  position,
  isMasterKey = false,
  isNearby,
}) => {
  const graphicsQuality = useGameStore((s) => s.graphicsQuality);
  const isMobile = graphicsQuality === 'mobile';
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 2;
      groupRef.current.position.y = position[1] + Math.sin(t * 3) * 0.08;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(t * 4) * 0.15;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  const mainColor = isMasterKey ? '#f59e0b' : '#fbbf24';

  return (
    <group ref={groupRef} position={position}>
      {/* Key Ring / Bow */}
      <mesh position={[0, 0.22, 0]}>
        <torusGeometry args={[0.08, 0.02, 12, 24]} />
        <meshStandardMaterial
          color={mainColor}
          metalness={0.9}
          roughness={0.2}
          emissive={mainColor}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Key Shaft */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.26, 12]} />
        <meshStandardMaterial
          color={mainColor}
          metalness={0.9}
          roughness={0.2}
          emissive={mainColor}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Key Bits / Teeth */}
      <mesh position={[0.04, -0.04, 0]}>
        <boxGeometry args={[0.06, 0.03, 0.02]} />
        <meshStandardMaterial
          color={mainColor}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0.05, 0.01, 0]}>
        <boxGeometry args={[0.08, 0.03, 0.02]} />
        <meshStandardMaterial
          color={mainColor}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Glowing aura */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial
          color={isMasterKey ? '#f97316' : '#facc15'}
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Point light (on mobile only active when player is nearby) */}
      {(!isMobile || isNearby) && (
        <pointLight
          color={isMasterKey ? '#fb923c' : '#fde047'}
          intensity={isNearby ? 2.5 : 1.5}
          distance={isMobile ? 3 : 4}
        />
      )}
    </group>
  );
});
