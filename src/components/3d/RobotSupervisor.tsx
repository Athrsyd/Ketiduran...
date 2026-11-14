/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { sound } from '../../services/soundEngine';
import { multiplayerSync } from '../../services/multiplayerSync';

// Floor 1 patrol waypoints across the expansive 96m x 96m school courtyard
const PATROL_WAYPOINTS: [number, number][] = [
  [0, -22],
  [18, -34],
  [24, -58],
  [12, -78],
  [0, -96],
  [-16, -82],
  [-26, -56],
  [-22, -32],
  [0, -42],
  [0, -18],
];

export const RobotSupervisor: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const spotTargetRef = useRef<THREE.Object3D>(null);

  // Mutable internal state (NO useState in useFrame!)
  const stateRef = useRef({
    currentWaypointIndex: 0,
    speed: 3.4,
    chaseSpeed: 5.6,
    isChasing: false,
    isRecharging: false,
    rechargeTimer: 0,
    lastRechargeSec: 0,
    lastAlarmTime: 0,
    syncThrottle: 0,
  });

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const store = useGameStore.getState();
    if (store.status !== 'playing' || store.currentFloor !== 1) return;

    const s = stateRef.current;
    const robotPos = group.position;

    // --- RECHARGING STATE (3 SECONDS AFTER CATCHING A PLAYER) ---
    if (s.isRecharging) {
      s.rechargeTimer -= delta;
      const secLeft = Math.max(0, Math.ceil(s.rechargeTimer));
      if (s.lastRechargeSec !== secLeft) {
        s.lastRechargeSec = secLeft;
        store.setRobotState({ isChasing: false, isRecharging: true, rechargeSecondsLeft: secLeft });
      }

      // Visuals during recharge: amber/cyan electrical pulse
      if (eyeLeftRef.current && eyeRightRef.current) {
        const flicker = Math.sin(Date.now() * 0.03) > 0 ? '#f59e0b' : '#38bdf8';
        (eyeLeftRef.current.material as THREE.MeshBasicMaterial).color.set(flicker);
        (eyeRightRef.current.material as THREE.MeshBasicMaterial).color.set(flicker);
      }
      if (spotlightRef.current) {
        spotlightRef.current.color.set('#f59e0b');
        spotlightRef.current.intensity = 2.0 + Math.sin(Date.now() * 0.02) * 1.5;
      }

      if (s.rechargeTimer <= 0) {
        // 3 seconds elapsed: Robot recharges complete and respawns at a random patrol waypoint!
        s.isRecharging = false;
        const randomWpIndex = Math.floor(Math.random() * PATROL_WAYPOINTS.length);
        s.currentWaypointIndex = randomWpIndex;
        const [randX, randZ] = PATROL_WAYPOINTS[randomWpIndex];
        robotPos.x = randX;
        robotPos.z = randZ;

        store.setRobotState({
          x: randX,
          z: randZ,
          isChasing: false,
          isRecharging: false,
          rechargeSecondsLeft: 0,
        });

        multiplayerSync.send({
          type: 'ROBOT_STATE',
          senderId: store.myId,
          roomCode: store.roomCode,
          payload: {
            x: randX,
            z: randZ,
            isChasing: false,
            isRecharging: false,
            rechargeSecondsLeft: 0,
          },
          timestamp: Date.now(),
        });
      }
      return; // Do not move or chase while charging!
    }

    // 1. Gather all ACTIVE player positions on Floor 1 (ignoring already stunned players)
    const players: { id: string; x: number; z: number }[] = [];
    if (!store.isStunned) {
      players.push({
        id: store.myId,
        x: store.myPosition[0],
        z: store.myPosition[2],
      });
    }

    Object.values(store.teammates).forEach((tm) => {
      if (tm.currentFloor === 1 && !tm.isStunned) {
        players.push({
          id: tm.id,
          x: tm.position[0],
          z: tm.position[2],
        });
      }
    });

    // 2. Find nearest active player
    let nearestPlayer: { id: string; x: number; z: number } | null = null;
    let minDistance = Infinity;

    for (const p of players) {
      const dx = p.x - robotPos.x;
      const dz = p.z - robotPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDistance) {
        minDistance = dist;
        nearestPlayer = p;
      }
    }

    // 3. Catch check! If distance < 1.35 and not in map viewer
    if (minDistance < 1.35 && !store.isMapViewer && nearestPlayer) {
      const isMultiplayer = store.maxPlayers > 1 || Object.keys(store.teammates).length > 0;

      if (!isMultiplayer) {
        // Solo mode: immediate Game Over
        sound.setRobotAlarm(false);
        store.triggerGameOver('Siswa tertangkap oleh Robot Pengawas Sekolah!');
        return;
      }

      // Multiplayer mode: Stun caught player!
      if (nearestPlayer.id === store.myId) {
        store.stunLocalPlayer();
      } else {
        store.stunTeammate(nearestPlayer.id);
      }

      multiplayerSync.send({
        type: 'PLAYER_STUNNED',
        senderId: store.myId,
        roomCode: store.roomCode,
        payload: { playerId: nearestPlayer.id },
        timestamp: Date.now(),
      });

      // Check if ALL players on Floor 1 are now stunned
      const myStunned = (nearestPlayer.id === store.myId) ? true : store.isStunned;
      const teammatesOnFloor = Object.values(store.teammates).filter((tm) => tm.currentFloor === 1);
      const allTeammatesStunned = teammatesOnFloor.every((tm) =>
        tm.id === nearestPlayer.id ? true : !!tm.isStunned
      );
      const allStunned = myStunned && (teammatesOnFloor.length === 0 || allTeammatesStunned);

      if (allStunned) {
        // Everyone is down -> Full Game Over!
        sound.setRobotAlarm(false);
        store.triggerGameOver('Seluruh anggota tim tertangkap oleh Robot Pengawas!');
        multiplayerSync.send({
          type: 'GAME_OVER',
          senderId: store.myId,
          roomCode: store.roomCode,
          payload: { reason: 'Seluruh anggota tim tertangkap oleh Robot Pengawas!' },
          timestamp: Date.now(),
        });
        return;
      }

      // Someone is still active! Robot recharges for 3 seconds then spawns randomly
      s.isRecharging = true;
      s.rechargeTimer = 3.0;
      s.lastRechargeSec = 3;
      s.isChasing = false;
      sound.setRobotAlarm(false);

      store.setRobotState({
        isChasing: false,
        isRecharging: true,
        rechargeSecondsLeft: 3,
      });

      multiplayerSync.send({
        type: 'ROBOT_STATE',
        senderId: store.myId,
        roomCode: store.roomCode,
        payload: {
          isChasing: false,
          isRecharging: true,
          rechargeSecondsLeft: 3,
        },
        timestamp: Date.now(),
      });
      return;
    }

    // 4. Vision & Detection logic
    let targetX = 0;
    let targetZ = 0;
    let shouldChase = false;

    if (nearestPlayer && !store.isMapViewer) {
      const dx = nearestPlayer.x - robotPos.x;
      const dz = nearestPlayer.z - robotPos.z;
      const forwardAngle = group.rotation.y;
      const angleToPlayer = Math.atan2(dx, dz);
      let angleDiff = Math.abs(forwardAngle - angleToPlayer);
      while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - 2 * Math.PI);

      // Vision cone: within 18m and 65 degrees, OR close proximity < 5.5m
      if (minDistance < 5.5 || (minDistance < 18.0 && angleDiff < 0.7)) {
        shouldChase = true;
        targetX = nearestPlayer.x;
        targetZ = nearestPlayer.z;
      }
    }

    // 5. Update alarm & chase state
    if (shouldChase !== s.isChasing) {
      s.isChasing = shouldChase;
      sound.setRobotAlarm(shouldChase);
      store.setRobotState({ isChasing: shouldChase });
    }

    // 6. Navigation towards target
    if (!shouldChase) {
      // Patrol waypoints
      const wp = PATROL_WAYPOINTS[s.currentWaypointIndex];
      targetX = wp[0];
      targetZ = wp[1];

      const toWpDist = Math.hypot(targetX - robotPos.x, targetZ - robotPos.z);
      if (toWpDist < 1.4) {
        s.currentWaypointIndex = (s.currentWaypointIndex + 1) % PATROL_WAYPOINTS.length;
      }
    }

    // Move robot
    const moveDx = targetX - robotPos.x;
    const moveDz = targetZ - robotPos.z;
    const moveDist = Math.hypot(moveDx, moveDz);

    if (moveDist > 0.1) {
      const targetAngle = Math.atan2(moveDx, moveDz);
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetAngle, 5, delta);

      const moveSpeed = (shouldChase ? s.chaseSpeed : s.speed) * delta;
      const step = Math.min(moveSpeed, moveDist);
      robotPos.x += (moveDx / moveDist) * step;
      robotPos.z += (moveDz / moveDist) * step;
    }

    // Head scanner animation
    if (headRef.current) {
      if (shouldChase) {
        headRef.current.rotation.y = 0;
      } else {
        headRef.current.rotation.y = Math.sin(Date.now() * 0.003) * 0.5;
      }
    }

    // Eye and spotlight pulsing in chase
    if (eyeLeftRef.current && eyeRightRef.current) {
      const eyeMatLeft = eyeLeftRef.current.material as THREE.MeshBasicMaterial;
      const eyeMatRight = eyeRightRef.current.material as THREE.MeshBasicMaterial;
      if (eyeMatLeft && eyeMatRight) {
        if (shouldChase) {
          const eyeFlicker = Math.sin(Date.now() * 0.02) > 0 ? '#ff0000' : '#ff5555';
          eyeMatLeft.color.set(eyeFlicker);
          eyeMatRight.color.set(eyeFlicker);
        } else {
          eyeMatLeft.color.set('#f43f5e');
          eyeMatRight.color.set('#f43f5e');
        }
      }
    }

    // Spotlight direction
    if (spotlightRef.current && spotTargetRef.current) {
      const lookDist = shouldChase ? 8 : 6;
      spotTargetRef.current.position.set(
        robotPos.x + Math.sin(group.rotation.y) * lookDist,
        0,
        robotPos.z + Math.cos(group.rotation.y) * lookDist
      );
      spotlightRef.current.target = spotTargetRef.current;
    }

    // Periodic sync
    s.syncThrottle += delta;
    if (s.syncThrottle > 0.25) {
      s.syncThrottle = 0;
      multiplayerSync.send({
        type: 'ROBOT_STATE',
        senderId: store.myId,
        roomCode: store.roomCode,
        payload: {
          x: robotPos.x,
          z: robotPos.z,
          rotation: group.rotation.y,
          isChasing: shouldChase,
        },
        timestamp: Date.now(),
      });
    }
  });

  return (
    <>
      <object3D ref={spotTargetRef} />
      <group ref={groupRef} position={[0, 0, -36]}>
        {/* Track Base / Tank treads */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1.1, 0.45, 1.3]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[-0.6, 0.22, 0]}>
          <boxGeometry args={[0.22, 0.42, 1.35]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[0.6, 0.22, 0]}>
          <boxGeometry args={[0.22, 0.42, 1.35]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* Heavy Torso */}
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[0.9, 0.9, 0.8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Hazard warning stripes on torso */}
        <mesh position={[0, 0.95, 0.41]}>
          <planeGeometry args={[0.8, 0.4]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        <mesh position={[0, 0.95, 0.42]}>
          <planeGeometry args={[0.7, 0.3]} />
          <meshBasicMaterial color="#000000" wireframe />
        </mesh>

        {/* Mechanical Arms */}
        <mesh position={[-0.55, 0.95, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[0.55, 0.95, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>

        {/* Swiveling Head */}
        <group ref={headRef} position={[0, 1.65, 0]}>
          <mesh>
            <boxGeometry args={[0.65, 0.45, 0.55]} />
            <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Glowing Red Sensor Eyes */}
          <mesh ref={eyeLeftRef} position={[-0.16, 0.02, 0.28]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh ref={eyeRightRef} position={[0.16, 0.02, 0.28]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>

          {/* Siren light on top with rotating beam */}
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.18, 12]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          <pointLight position={[0, 0.4, 0]} color="#ef4444" intensity={2.5} distance={6} />

          {/* Forward Red Spotlight */}
          <spotLight
            ref={spotlightRef}
            position={[0, 0.1, 0.3]}
            color="#ff1111"
            intensity={4.5}
            angle={Math.PI / 5}
            penumbra={0.4}
            distance={22}
          />
        </group>
      </group>
    </>
  );
};
