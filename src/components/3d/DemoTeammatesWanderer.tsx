/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';

export const DemoTeammatesWanderer: React.FC = () => {
  const demoActive = useGameStore((s) => s.demoTeammatesActive);
  const currentFloor = useGameStore((s) => s.currentFloor);
  const timeRef = useRef<number>(0);

  useFrame((_, delta) => {
    if (!demoActive) return;
    timeRef.current += delta;
    const t = timeRef.current;
    const store = useGameStore.getState();

    // Wander routes based on current floor
    if (currentFloor === 2) {
      // Floor 2 (Zig-Zag Labyrinth)
      // Budi patrols along West corridor (Segment 2) Z: [-22, -10]
      const budiZ = -16.0 + Math.sin(t * 0.8) * 6.5;
      const budiYaw = Math.cos(t * 0.8) >= 0 ? 0 : Math.PI;

      // Siti patrols along Central Bridge (Turn 2) X: [-10, 10]
      const sitiX = Math.sin(t * 0.9) * 9.0;
      const sitiYaw = Math.cos(t * 0.9) >= 0 ? Math.PI / 2 : -Math.PI / 2;

      // Rian patrols along East corridor (Segment 3) Z: [-52, -38]
      const rianZ = -45.0 + Math.sin(t * 0.75) * 6.5;
      const rianYaw = Math.cos(t * 0.75) >= 0 ? 0 : Math.PI;

      store.updateTeammate({
        id: 'demo_budi',
        name: 'Budi (RPL)',
        gender: 'male',
        color: '#3b82f6',
        position: [-18.5, 1.6, budiZ],
        yaw: budiYaw,
        currentFloor: 2,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
      store.updateTeammate({
        id: 'demo_siti',
        name: 'Siti (TKJ)',
        gender: 'female',
        color: '#10b981',
        position: [sitiX, 1.6, -30.0],
        yaw: sitiYaw,
        currentFloor: 2,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
      store.updateTeammate({
        id: 'demo_rian',
        name: 'Rian (DKV)',
        gender: 'male',
        color: '#f59e0b',
        position: [18.5, 1.6, rianZ],
        yaw: rianYaw,
        currentFloor: 2,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
    } else if (currentFloor === 3) {
      // Floor 3 (Atrium U-Loop)
      const budiX = Math.sin(t * 0.8) * 8.0;
      const budiYaw = Math.cos(t * 0.8) >= 0 ? Math.PI / 2 : -Math.PI / 2;

      const sitiZ = -30.0 + Math.sin(t * 0.7) * 12.0;
      const sitiYaw = Math.cos(t * 0.7) >= 0 ? 0 : Math.PI;

      const rianZ = -35.0 + Math.sin(t * 0.85) * 12.0;
      const rianYaw = Math.cos(t * 0.85) >= 0 ? 0 : Math.PI;

      store.updateTeammate({
        id: 'demo_budi',
        name: 'Budi (RPL)',
        gender: 'male',
        color: '#3b82f6',
        position: [budiX, 1.6, -30.0],
        yaw: budiYaw,
        currentFloor: 3,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
      store.updateTeammate({
        id: 'demo_siti',
        name: 'Siti (TKJ)',
        gender: 'female',
        color: '#10b981',
        position: [-16.0, 1.6, sitiZ],
        yaw: sitiYaw,
        currentFloor: 3,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
      store.updateTeammate({
        id: 'demo_rian',
        name: 'Rian (DKV)',
        gender: 'male',
        color: '#f59e0b',
        position: [16.0, 1.6, rianZ],
        yaw: rianYaw,
        currentFloor: 3,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
    } else if (currentFloor === 4) {
      // Floor 4 (Sayap Silang)
      const budiX = -18.0 + Math.sin(t * 0.8) * 10.0;
      const budiYaw = Math.cos(t * 0.8) >= 0 ? Math.PI / 2 : -Math.PI / 2;

      const sitiX = 18.0 + Math.sin(t * 0.75) * 10.0;
      const sitiYaw = Math.cos(t * 0.75) >= 0 ? Math.PI / 2 : -Math.PI / 2;

      const rianZ = -28.0 + Math.sin(t * 0.9) * 14.0;
      const rianYaw = Math.cos(t * 0.9) >= 0 ? 0 : Math.PI;

      store.updateTeammate({
        id: 'demo_budi',
        name: 'Budi (RPL)',
        gender: 'male',
        color: '#3b82f6',
        position: [budiX, 1.6, -16.0],
        yaw: budiYaw,
        currentFloor: 4,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
      store.updateTeammate({
        id: 'demo_siti',
        name: 'Siti (TKJ)',
        gender: 'female',
        color: '#10b981',
        position: [sitiX, 1.6, -46.0],
        yaw: sitiYaw,
        currentFloor: 4,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
      store.updateTeammate({
        id: 'demo_rian',
        name: 'Rian (DKV)',
        gender: 'male',
        color: '#f59e0b',
        position: [0, 1.6, rianZ],
        yaw: rianYaw,
        currentFloor: 4,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
    } else {
      // Floor 1 (Halaman 140m)
      const budiX = 26.0 + Math.sin(t * 0.8) * 8.0;
      const budiZ = -45.0 + Math.cos(t * 0.8) * 12.0;

      const sitiX = -26.0 + Math.sin(t * 0.7) * 8.0;
      const sitiZ = -82.0 + Math.cos(t * 0.7) * 8.0;

      const rianX = Math.sin(t * 0.85) * 10.0;
      const rianZ = -45.0 + Math.cos(t * 0.85) * 6.0;

      store.updateTeammate({
        id: 'demo_budi',
        name: 'Budi (RPL)',
        gender: 'male',
        color: '#3b82f6',
        position: [budiX, 1.6, budiZ],
        yaw: t * 0.8 + Math.PI / 2,
        currentFloor: 1,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
      store.updateTeammate({
        id: 'demo_siti',
        name: 'Siti (TKJ)',
        gender: 'female',
        color: '#10b981',
        position: [sitiX, 1.6, sitiZ],
        yaw: t * 0.7 + Math.PI / 2,
        currentFloor: 1,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
      store.updateTeammate({
        id: 'demo_rian',
        name: 'Rian (DKV)',
        gender: 'male',
        color: '#f59e0b',
        position: [rianX, 1.6, rianZ],
        yaw: t * 0.85 + Math.PI / 2,
        currentFloor: 1,
        isInGatheringZone: false,
        lastActive: Date.now(),
      });
    }
  });

  return null;
};
