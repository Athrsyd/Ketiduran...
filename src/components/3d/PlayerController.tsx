/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { PAI_QUESTIONS } from '../../data/questions';
import { isPointInZone, checkAllPlayersInGatheringZone } from '../../utils/gameLogic';
import { sound } from '../../services/soundEngine';
import { multiplayerSync } from '../../services/multiplayerSync';

// Pre-allocated vectors for 0 garbage collection in useFrame
const _moveDir = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _side = new THREE.Vector3();

export const PlayerController: React.FC = () => {
  const { camera, gl } = useThree();

  // Keyboard keys state ref
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const yawRef = useRef<number>(0);
  const isPointerLockedRef = useRef<boolean>(false);
  const syncThrottleRef = useRef<number>(0);

  // Key event listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      keysRef.current[e.key.toLowerCase()] = true;

      // Interaction key 'E'
      if (e.code === 'KeyE' || e.key.toLowerCase() === 'e') {
        handleInteraction();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLockedRef.current) return;
      const store = useGameStore.getState();
      if (store.activeQuestion !== null || store.status !== 'playing') return;

      // STRICT Baldi's Basics: Horizontal (Yaw) only! Pitch is locked to 0!
      const sensitivity = 0.0022;
      yawRef.current -= e.movementX * sensitivity;
    };

    const onPointerLockChange = () => {
      isPointerLockedRef.current = document.pointerLockElement === gl.domElement;
    };

    const onClickCanvas = () => {
      const store = useGameStore.getState();
      if (store.activeQuestion === null && store.status === 'playing') {
        if (!isPointerLockedRef.current) {
          try {
            gl.domElement.requestPointerLock();
          } catch {}
        } else {
          // If already locked, clicking also triggers interaction!
          handleInteraction();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    gl.domElement.addEventListener('click', onClickCanvas);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      gl.domElement.removeEventListener('click', onClickCanvas);
    };
  }, [gl]);

  // Release pointer lock when question opens or game ends
  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.activeQuestion !== null || state.status !== 'playing') {
        if (document.pointerLockElement) {
          try {
            document.exitPointerLock();
          } catch {}
        }
      }
    });
    return () => unsub();
  }, []);

  const handleInteraction = () => {
    const store = useGameStore.getState();
    if (store.activeQuestion !== null || store.status !== 'playing') return;

    const nearby = store.nearbyInteractable;
    if (!nearby) return;

    switch (nearby.type) {
      case 'question': {
        const q = PAI_QUESTIONS.find((item) => item.id === nearby.id);
        if (q && !store.solvedQuestionIds.includes(q.id)) {
          store.openQuestion(q);
        }
        break;
      }
      case 'stair_key': {
        store.collectStairKey();
        multiplayerSync.send({
          type: 'KEY_COLLECTED',
          senderId: store.myId,
          roomCode: store.roomCode,
          payload: { keyType: 'stair' },
          timestamp: Date.now(),
        });
        break;
      }
      case 'stair_gate': {
        if (store.hasStairKey && !store.isGateUnlocked) {
          store.unlockStairGate();
          multiplayerSync.send({
            type: 'GATE_UNLOCKED',
            senderId: store.myId,
            roomCode: store.roomCode,
            payload: { gateType: 'stair' },
            timestamp: Date.now(),
          });
        }
        break;
      }
      case 'master_key': {
        store.collectMasterKey();
        multiplayerSync.send({
          type: 'KEY_COLLECTED',
          senderId: store.myId,
          roomCode: store.roomCode,
          payload: { keyType: 'master' },
          timestamp: Date.now(),
        });
        break;
      }
      case 'exit_gate': {
        if (store.hasMasterKey && !store.isExitGateUnlocked) {
          store.unlockExitGate();
          multiplayerSync.send({
            type: 'GATE_UNLOCKED',
            senderId: store.myId,
            roomCode: store.roomCode,
            payload: { gateType: 'exit' },
            timestamp: Date.now(),
          });
        }
        break;
      }
    }
  };

  useFrame((_, delta) => {
    const store = useGameStore.getState();
    if (store.status !== 'playing') return;

    // Freeze player when solving question
    if (store.activeQuestion !== null) return;

    // Apply touch look drag (horizontal yaw only!)
    if (store.touchLookDelta.x !== 0) {
      yawRef.current -= store.touchLookDelta.x * 0.0035;
      store.setTouchLook(0, 0); // reset delta
    }

    // 1. Process movement inputs
    _moveDir.set(0, 0, 0);

    // Keyboard inputs
    const keys = keysRef.current;
    if (keys['KeyW'] || keys['ArrowUp'] || keys['w']) _moveDir.z -= 1;
    if (keys['KeyS'] || keys['ArrowDown'] || keys['s']) _moveDir.z += 1;
    if (keys['KeyA'] || keys['ArrowLeft'] || keys['a']) _moveDir.x -= 1;
    if (keys['KeyD'] || keys['ArrowRight'] || keys['d']) _moveDir.x += 1;

    // Virtual Joystick inputs (Mobile / Tablet)
    if (store.virtualJoystick.active) {
      _moveDir.x += store.virtualJoystick.x;
      _moveDir.z -= store.virtualJoystick.y; // Y axis inverted in 3D (forward is -Z)
    }

    const currentPos = camera.position;
    const speed = 4.8; // Player speed

    // MANDATORY REQUIREMENT: directionVector.normalize() for identical diagonal speed!
    if (_moveDir.lengthSq() > 0.001) {
      _moveDir.normalize();

      // Transform direction by current horizontal yaw
      const cosYaw = Math.cos(yawRef.current);
      const sinYaw = Math.sin(yawRef.current);

      // Local Z forward is (sinYaw, 0, -cosYaw)
      _forward.set(-sinYaw, 0, -cosYaw);
      // Local X right is (cosYaw, 0, sinYaw)
      _side.set(cosYaw, 0, sinYaw);

      const dx = (_side.x * _moveDir.x + _forward.x * (-_moveDir.z)) * speed * delta;
      const dz = (_side.z * _moveDir.x + _forward.z * (-_moveDir.z)) * speed * delta;

      // Propose new position
      const nextX = currentPos.x + dx;
      const nextZ = currentPos.z + dz;

      // School Wall Collisions per Floor
      let validX = nextX;
      let validZ = nextZ;

      if (store.currentFloor > 1) {
        // Indoor corridor & classrooms boundary
        // Corridor width is x: -2.6 to 2.6. Classrooms extend to x: -13.8 to 13.8
        const minZ = store.isGateUnlocked ? -46.0 : -41.2;
        validZ = Math.max(minZ, Math.min(8.0, nextZ));

        // Lateral walls: if z is in one of the 3 classroom wings, can explore full room width
        const inClassroom =
          (validZ >= -3.5 && validZ <= 7.5) ||   // Classrooms 1 & 2
          (validZ >= -20.5 && validZ <= -9.5) ||  // Classrooms 3 & 4
          (validZ >= -35.5 && validZ <= -24.5);  // Classroom 5 & Locker Lounge

        const maxX = inClassroom ? 13.8 : 2.5;
        const minX = inClassroom ? -13.8 : -2.5;
        validX = Math.max(minX, Math.min(maxX, nextX));
      } else {
        // Floor 1 & Expansive School Yard boundaries
        const minZ = store.isExitGateUnlocked ? -64.0 : -55.0;
        validZ = Math.max(minZ, Math.min(10.0, nextZ));
        const maxX = validZ < -8.0 ? 30.5 : 3.0;
        const minX = validZ < -8.0 ? -30.5 : -3.0;
        validX = Math.max(minX, Math.min(maxX, nextX));
      }

      currentPos.x = validX;
      currentPos.z = validZ;

      sound.playFootstep();
    }

    // STRICT Baldi's Basics camera lock:
    // Eye height = 1.6m, pitch = 0, roll = 0, yaw = yawRef.current!
    currentPos.y = 1.6;
    camera.rotation.set(0, yawRef.current, 0, 'YXZ');

    // 2. Check Gathering Zone in front of the gate
    let inZone = false;
    if (store.currentFloor > 1) {
      if (store.isGateUnlocked) {
        inZone = isPointInZone(currentPos.x, currentPos.z, {
          minX: -2.2,
          maxX: 2.2,
          minZ: -41.2,
          maxZ: -37.8,
        });
      }
    } else {
      if (store.isExitGateUnlocked) {
        inZone = isPointInZone(currentPos.x, currentPos.z, {
          minX: -3.0,
          maxX: 3.0,
          minZ: -55.2,
          maxZ: -51.8,
        });
      }
    }

    // 3. Check proximity to interactables
    let closestInteractable: typeof store.nearbyInteractable = null;
    let minDist = 3.2;

    if (store.currentFloor > 1) {
      // Check 5 desks inside the spacious classrooms
      const floorQuestions = PAI_QUESTIONS.filter((q) => q.floor === store.currentFloor);
      const deskPositions = [
        [-10.9, 0, 3.8],
        [6.1, 0, 3.8],
        [-10.9, 0, -13.2],
        [6.1, 0, -13.2],
        [-10.9, 0, -28.2],
      ];

      floorQuestions.forEach((q, idx) => {
        const dpos = deskPositions[idx];
        if (dpos) {
          const dist = Math.hypot(currentPos.x - dpos[0], currentPos.z - dpos[2]);
          const isSolved = store.solvedQuestionIds.includes(q.id);
          if (dist < minDist && !isSolved) {
            minDist = dist;
            closestInteractable = {
              type: 'question',
              id: q.id,
              label: `Kerjakan ${q.title.split('-')[0].trim()}`,
              distance: dist,
            };
          }
        }
      });

      // Check Stair Key
      const allSolved = floorQuestions.every((q) => store.solvedQuestionIds.includes(q.id));
      if (allSolved && !store.hasStairKey && !store.isGateUnlocked) {
        const keyDist = Math.hypot(currentPos.x - 0, currentPos.z - (-36));
        if (keyDist < 2.5 && keyDist < minDist) {
          minDist = keyDist;
          closestInteractable = {
            type: 'stair_key',
            label: 'Ambil Kunci Tangga',
            distance: keyDist,
          };
        }
      }

      // Check Stair Gate
      if (store.hasStairKey && !store.isGateUnlocked) {
        const gateDist = Math.hypot(currentPos.x - 0, currentPos.z - (-42));
        if (gateDist < 3.2 && gateDist < minDist) {
          minDist = gateDist;
          closestInteractable = {
            type: 'stair_gate',
            label: 'Buka Pintu Gerbang Tangga',
            distance: gateDist,
          };
        }
      }
    } else {
      // Floor 1: Check Master Key in Pos Satpam (-18, 0.9, -32)
      if (!store.hasMasterKey) {
        const mKeyDist = Math.hypot(currentPos.x - (-18), currentPos.z - (-32));
        if (mKeyDist < 3.0 && mKeyDist < minDist) {
          minDist = mKeyDist;
          closestInteractable = {
            type: 'master_key',
            label: 'Ambil Kunci Gerbang Utama',
            distance: mKeyDist,
          };
        }
      }

      // Floor 1: Check Exit Gate (0, 0, -56)
      if (store.hasMasterKey && !store.isExitGateUnlocked) {
        const eGateDist = Math.hypot(currentPos.x - 0, currentPos.z - (-56));
        if (eGateDist < 3.8 && eGateDist < minDist) {
          minDist = eGateDist;
          closestInteractable = {
            type: 'exit_gate',
            label: 'Buka Gerbang Keluar Sekolah',
            distance: eGateDist,
          };
        }
      }
    }

    store.setNearbyInteractable(closestInteractable);

    // 4. Update my position & zone status in store
    store.setMyPosition(
      [currentPos.x, currentPos.y, currentPos.z],
      yawRef.current,
      inZone
    );

    // 5. Team Gathering Check:
    // If gate is unlocked and all required players are in zone, transition!
    const teammatesOnFloor = Object.values(store.teammates).filter(
      (tm) => tm.currentFloor === store.currentFloor
    );
    const playersInZoneList = [inZone, ...teammatesOnFloor.map((tm) => tm.isInGatheringZone)];
    const gatherStatus = checkAllPlayersInGatheringZone(playersInZoneList);

    if (gatherStatus.allInZone) {
      if (store.currentFloor > 1 && store.isGateUnlocked) {
        const nextFloor = store.currentFloor - 1;
        store.transitionToNextFloor(nextFloor);
        multiplayerSync.send({
          type: 'FLOOR_TRANSITION',
          senderId: store.myId,
          roomCode: store.roomCode,
          payload: { floor: nextFloor },
          timestamp: Date.now(),
        });
      } else if (store.currentFloor === 1 && store.isExitGateUnlocked) {
        store.triggerVictory();
        multiplayerSync.send({
          type: 'VICTORY',
          senderId: store.myId,
          roomCode: store.roomCode,
          timestamp: Date.now(),
        });
      }
    }

    // 6. Multiplayer position throttle sync
    syncThrottleRef.current += delta;
    if (syncThrottleRef.current > 0.08) {
      syncThrottleRef.current = 0;
      multiplayerSync.send({
        type: 'PLAYER_MOVE',
        senderId: store.myId,
        roomCode: store.roomCode,
        payload: {
          position: [currentPos.x, currentPos.y, currentPos.z],
          yaw: yawRef.current,
          isInGatheringZone: inZone,
        },
        timestamp: Date.now(),
      });
    }
  });

  return (
    <>
      {/* Player Flashlight Cone */}
      <spotLight
        position={[camera.position.x, 1.6, camera.position.z]}
        rotation={[0, yawRef.current, 0]}
        color="#ffffff"
        intensity={useGameStore((s) => s.flashlightOn) ? 2.5 : 0}
        angle={Math.PI / 4}
        penumbra={0.3}
        distance={18}
      />
    </>
  );
};
