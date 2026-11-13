/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Question } from '../../types/game';

interface QuestionDeskProps {
  question: Question;
  position: [number, number, number];
  rotation?: [number, number, number];
  isSolved: boolean;
  isNearby: boolean;
}

export const QuestionDesk: React.FC<QuestionDeskProps> = ({
  question,
  position,
  rotation = [0, 0, 0],
  isSolved,
  isNearby,
}) => {
  const glowRef = useRef<THREE.Mesh>(null);
  const paperRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (glowRef.current) {
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 3) * 0.08;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Desk Tabletop */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.06, 0.7]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Desk Metal Legs */}
      <mesh position={[-0.52, 0.36, -0.27]}>
        <cylinderGeometry args={[0.02, 0.02, 0.72]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.52, 0.36, -0.27]}>
        <cylinderGeometry args={[0.02, 0.02, 0.72]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-0.52, 0.36, 0.27]}>
        <cylinderGeometry args={[0.02, 0.02, 0.72]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.52, 0.36, 0.27]}>
        <cylinderGeometry args={[0.02, 0.02, 0.72]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Chair */}
      <group position={[0, 0, 0.55]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.45]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.75, 0.2]}>
          <boxGeometry args={[0.48, 0.3, 0.03]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Chair legs */}
        <mesh position={[-0.2, 0.22, -0.18]}>
          <cylinderGeometry args={[0.015, 0.015, 0.44]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
        <mesh position={[0.2, 0.22, -0.18]}>
          <cylinderGeometry args={[0.015, 0.015, 0.44]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
        <mesh position={[-0.2, 0.35, 0.18]}>
          <cylinderGeometry args={[0.015, 0.015, 0.7]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
        <mesh position={[0.2, 0.35, 0.18]}>
          <cylinderGeometry args={[0.015, 0.015, 0.7]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
      </group>

      {/* Exam Sheet / Textbook */}
      <group ref={paperRef} position={[0, 0.76, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0.08]}>
          <planeGeometry args={[0.42, 0.55]} />
          <meshStandardMaterial
            color={isSolved ? '#bbf7d0' : '#fef08a'}
            roughness={0.9}
          />
        </mesh>

        {/* Small Pen */}
        <mesh position={[0.26, 0.01, 0]} rotation={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.22]} />
          <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.2} />
        </mesh>

        {/* Floating Indicator / Beacon */}
        <mesh
          ref={glowRef}
          position={[0, 0.35, 0]}
        >
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial
            color={isSolved ? '#22c55e' : isNearby ? '#38bdf8' : '#eab308'}
            wireframe={!isSolved}
          />
        </mesh>

        {/* Subtle point light over the desk */}
        <pointLight
          position={[0, 0.5, 0]}
          color={isSolved ? '#4ade80' : '#fde047'}
          intensity={isNearby ? 1.5 : 0.8}
          distance={3}
        />
      </group>
    </group>
  );
};
