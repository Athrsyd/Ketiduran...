/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerData } from '../../types/game';

interface TeammateModelProps {
  player: PlayerData;
}

export const TeammateModel: React.FC<TeammateModelProps> = ({ player }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    // Smoothly interpolate position towards target
    g.position.x = THREE.MathUtils.damp(g.position.x, player.position[0], 12, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, player.position[1] - 1.6, 12, delta); // ground offset
    g.position.z = THREE.MathUtils.damp(g.position.z, player.position[2], 12, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, player.yaw, 12, delta);
  });

  return (
    <group ref={groupRef} position={[player.position[0], player.position[1] - 1.6, player.position[2]]}>
      {/* Shoes */}
      <mesh position={[-0.15, 0.05, 0.02]}>
        <boxGeometry args={[0.14, 0.1, 0.28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <mesh position={[0.15, 0.05, 0.02]}>
        <boxGeometry args={[0.14, 0.1, 0.28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Grey Trousers (Celana Abu-abu SMK) */}
      <mesh position={[-0.15, 0.45, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.75, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      <mesh position={[0.15, 0.45, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.75, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Torso - White Uniform Shirt (Baju OSIS SMK Putih) */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.55, 0.65, 0.32]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* OSIS Pocket badge */}
      <mesh position={[-0.14, 1.25, 0.17]}>
        <planeGeometry args={[0.08, 0.1]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>

      {/* Student Backpack */}
      <mesh position={[0, 1.15, -0.22]}>
        <boxGeometry args={[0.42, 0.5, 0.2]} />
        <meshStandardMaterial color={player.color || '#3b82f6'} roughness={0.6} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[0.34, 0.36, 0.34]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.6} />
      </mesh>

      {/* Student Hair */}
      <mesh position={[0, 1.82, -0.04]}>
        <boxGeometry args={[0.36, 0.12, 0.38]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Nametag billboard indicator */}
      <group position={[0, 2.15, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.28]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        {/* Color accent bar */}
        <mesh position={[0, -0.12, 0.01]}>
          <planeGeometry args={[1.1, 0.04]} />
          <meshBasicMaterial color={player.color || '#38bdf8'} />
        </mesh>
      </group>
    </group>
  );
};
