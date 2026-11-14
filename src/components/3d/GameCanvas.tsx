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
  const graphicsQuality = useGameStore((s) => s.graphicsQuality);
  const status = useGameStore((s) => s.status);
  const isMobile = graphicsQuality === 'mobile';
  const isCutscene = status === 'cutscene';

  return (
    <div
      className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden select-none"
      style={{
        visibility: isCutscene ? 'hidden' : 'visible',
        pointerEvents: isCutscene ? 'none' : 'auto',
      }}
    >
      <Canvas
        frameloop={isCutscene ? 'never' : 'always'}
        shadows={!isMobile}
        dpr={isMobile ? [0.75, 1.0] : [1, 1.25]}
        camera={{ position: [0, 1.6, 10], fov: 75, near: 0.1, far: 110 }}
        gl={{
          antialias: !isMobile,
          powerPreference: 'high-performance',
          precision: isMobile ? 'mediump' : 'highp',
        }}
      >
        {/* Atmospheric School Night Fog */}
        <color attach="background" args={[currentFloor === 1 ? '#020617' : '#030712']} />
        <fog
          attach="fog"
          args={[
            currentFloor === 1 ? '#020617' : '#030712',
            currentFloor === 1 ? 14 : 8,
            currentFloor === 1 ? 84 : 70,
          ]}
        />

        {/* Ambient & Soft Sky Lighting */}
        <ambientLight intensity={currentFloor === 1 ? 0.38 : 0.28} />
        <hemisphereLight
          color="#93c5fd"
          groundColor="#020617"
          intensity={currentFloor === 1 ? 0.48 : 0.32}
        />

        {/* Directional Moonlight */}
        <directionalLight
          position={currentFloor === 1 ? [24, 40, -10] : [0, 3.7, 0]}
          intensity={currentFloor === 1 ? 0.45 : 0.15}
          color="#93c5fd"
          castShadow={!isMobile && currentFloor === 1}
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
