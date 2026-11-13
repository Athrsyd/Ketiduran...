/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SchoolFloor } from './SchoolFloor';
import { PlayerController } from './PlayerController';
import { useGameStore } from '../../store/gameStore';

export const GameCanvas: React.FC = () => {
  const currentFloor = useGameStore((s) => s.currentFloor);

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden select-none">
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 1.6, 0], fov: 75 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Night School Fog */}
        <color attach="background" args={[currentFloor === 1 ? '#020617' : '#030712']} />
        <fog
          attach="fog"
          args={[
            currentFloor === 1 ? '#020617' : '#030712',
            4,
            currentFloor === 1 ? 58 : 46,
          ]}
        />

        {/* Ambient & Night Sky Lighting */}
        <ambientLight intensity={currentFloor === 1 ? 0.35 : 0.25} />
        <hemisphereLight
          color="#93c5fd"
          groundColor="#020617"
          intensity={currentFloor === 1 ? 0.5 : 0.3}
        />

        <Suspense fallback={null}>
          <SchoolFloor />
          <PlayerController />
        </Suspense>
      </Canvas>
    </div>
  );
};
