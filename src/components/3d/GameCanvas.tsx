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
        shadows
        dpr={[1, 1.25]}
        camera={{ position: [0, 1.6, 10], fov: 75 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Atmospheric School Night Fog */}
        <color attach="background" args={[currentFloor === 1 ? '#020617' : '#030712']} />
        <fog
          attach="fog"
          args={[
            currentFloor === 1 ? '#020617' : '#030712',
            currentFloor === 1 ? 12 : 8,
            currentFloor === 1 ? 88 : 72,
          ]}
        />

        {/* Ambient & Soft Sky Lighting */}
        <ambientLight intensity={currentFloor === 1 ? 0.32 : 0.22} />
        <hemisphereLight
          color="#93c5fd"
          groundColor="#020617"
          intensity={currentFloor === 1 ? 0.45 : 0.28}
        />

        {/* Directional Moonlight with Soft Atmospheric Shadows */}
        <directionalLight
          position={currentFloor === 1 ? [24, 40, -10] : [0, 3.7, 0]}
          intensity={currentFloor === 1 ? 0.45 : 0.15}
          color="#93c5fd"
          castShadow={currentFloor === 1}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        <Suspense fallback={null}>
          <SchoolFloor />
          <PlayerController />
        </Suspense>
      </Canvas>
    </div>
  );
};
