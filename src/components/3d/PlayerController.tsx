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
import {
  resolveMovement,
  getUpperFloorWalls,
  getFloor1Walls,
  getMultiplayerFloorWalls,
  getMultiplayerFloor1Walls,
  WallAABB,
} from '../../utils/collision';
import { inputState } from '../../services/inputState';
import { sound } from '../../services/soundEngine';
import { multiplayerSync } from '../../services/multiplayerSync';

// Pre-allocated vectors for 0 garbage collection in useFrame
const _moveDir = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _side = new THREE.Vector3();

// Static desk positions and pre-filtered questions to prevent array allocations in useFrame
const SOLO_DESK_POSITIONS: [number, number, number][] = [
  [-11.5, 0, 7.8],
  [7.5, 0, 7.8],
  [7.5, 0, -12.2],
  [-11.5, 0, -32.2],
  [-11.5, 0, -52.2],
];

const MULTI_DESK_POSITIONS_BY_FLOOR: Record<number, [number, number, number][]> = {
  4: [
    [-26.2, 0, -4.0],
    [-29.8, 0, -24.0],
    [29.8, 0, -34.0],
    [26.2, 0, -54.0],
    [-11.5, 0, 7.8],
  ],
  3: [
    [-27.0, 0, -10.2],
    [-27.0, 0, -46.2],
    [27.0, 0, -10.2],
    [27.0, 0, -46.2],
    [0, 0, -30],
  ],
  2: [
    [-30.0, 0, -8.2],
    [-30.0, 0, -23.2],
    [0, 0, -30],
    [30.0, 0, -36.2],
    [30.0, 0, -50.2],
  ],
  1: [],
};

const QUESTIONS_BY_FLOOR: Record<number, typeof PAI_QUESTIONS> = {
  1: [],
  2: PAI_QUESTIONS.filter((q) => q.floor === 2),
  3: PAI_QUESTIONS.filter((q) => q.floor === 3),
  4: PAI_QUESTIONS.filter((q) => q.floor === 4),
};

export const PlayerController: React.FC = () => {
  const { camera, gl } = useThree();

  // Keyboard keys state ref
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const yawRef = useRef<number>(0);
  const isPointerLockedRef = useRef<boolean>(false);
  const syncThrottleRef = useRef<number>(0);

  // Flashlight and SpotLight Target Ref
  const spotTargetRef = useRef<THREE.Object3D>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const fillLightRef = useRef<THREE.PointLight>(null);

  // Performance Optimization Refs (0 unnecessary React state changes)
  const posThrottleRef = useRef<number>(0);
  const lastInteractableIdRef = useRef<string>('');
  const lastInteractableTypeRef = useRef<string>('');

  // Key event listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      keysRef.current[e.key.toLowerCase()] = true;

      // Interaction key 'E'
      if (e.code === 'KeyE' || e.key.toLowerCase() === 'e') {
        handleInteraction();
      }

      // Flashlight toggle 'F'
      if (e.code === 'KeyF' || e.key.toLowerCase() === 'f') {
        useGameStore.getState().toggleFlashlight();
      }

      // Mission Hint toggle 'H'
      if (e.code === 'KeyH' || e.key.toLowerCase() === 'h') {
        useGameStore.getState().toggleHint();
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

      // Horizontal Yaw camera turning
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
          // If already locked, clicking triggers interaction
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

  // Release pointer lock when question opens, hint opens, or game ends
  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.activeQuestion !== null || state.isHintOpen || state.status !== 'playing') {
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

    // Freeze player movement when solving question or reading hint
    if (store.activeQuestion !== null || store.isHintOpen) return;

    // Handle Teleport Target from Map Viewer
    if (store.teleportTarget) {
      camera.position.set(
        store.teleportTarget[0],
        store.teleportTarget[1],
        store.teleportTarget[2]
      );
      useGameStore.setState({ teleportTarget: null });
    }

    // Apply high-performance touch look drag from inputState (0 React overhead)
    const lookDelta = inputState.consumeLookDelta();
    if (lookDelta !== 0) {
      yawRef.current -= lookDelta * 0.0035;
    }

    // 1. Process movement inputs
    _moveDir.set(0, 0, 0);

    // Keyboard inputs
    const keys = keysRef.current;
    if (keys['KeyW'] || keys['ArrowUp'] || keys['w']) _moveDir.z -= 1;
    if (keys['KeyS'] || keys['ArrowDown'] || keys['s']) _moveDir.z += 1;
    if (keys['KeyA'] || keys['ArrowLeft'] || keys['a']) _moveDir.x -= 1;
    if (keys['KeyD'] || keys['ArrowRight'] || keys['d']) _moveDir.x += 1;

    // Virtual Joystick inputs from lightweight inputState
    if (inputState.joystick.active) {
      _moveDir.x += inputState.joystick.x;
      _moveDir.z -= inputState.joystick.y; // Y axis inverted in 3D (forward is -Z)
    }

    const currentPos = camera.position;
    const isOverview = store.isMapViewer && store.viewerCameraMode === 'overview';
    const isNoclip = store.isMapViewer && store.viewerNoclip;
    const speed = isOverview ? 14.0 : isNoclip ? 12.0 : 5.0;

    if (_moveDir.lengthSq() > 0.001) {
      _moveDir.normalize();

      if (isOverview) {
        // Top-down camera: movement is world aligned (W = -Z, S = +Z, A = -X, D = +X)
        currentPos.x += _moveDir.x * speed * delta;
        currentPos.z += _moveDir.z * speed * delta;
      } else {
        // Transform direction by current horizontal yaw
        const cosYaw = Math.cos(yawRef.current);
        const sinYaw = Math.sin(yawRef.current);

        // Forward vector: looking along -Z transformed by yaw
        _forward.set(-sinYaw, 0, -cosYaw);

        // Right vector: cross product Forward x Up = (cosYaw, 0, -sinYaw)
        _side.set(cosYaw, 0, -sinYaw);

        const dx = (_side.x * _moveDir.x + _forward.x * (-_moveDir.z)) * speed * delta;
        const dz = (_side.z * _moveDir.x + _forward.z * (-_moveDir.z)) * speed * delta;

        const targetX = currentPos.x + dx;
        const targetZ = currentPos.z + dz;

        if (isNoclip) {
          // In noclip mode, bypass collision completely
          currentPos.x = targetX;
          currentPos.z = targetZ;
        } else {
          // Exact AABB wall collision with separate X and Z sliding
          const playerRadius = 0.35;
          const isMultiplayer = store.maxPlayers > 1;
          let walls: WallAABB[];
          let bounds: { minX: number; maxX: number; minZ: number; maxZ: number };

          if (isMultiplayer) {
            if (store.currentFloor > 1) {
              walls = getMultiplayerFloorWalls(store.currentFloor, store.isGateUnlocked);
              bounds = {
                minX: -38.0,
                maxX: 38.0,
                minZ: -74.0,
                maxZ: 14.0,
              };
            } else {
              walls = getMultiplayerFloor1Walls(store.isExitGateUnlocked);
              bounds = {
                minX: -70.0,
                maxX: 70.0,
                minZ: -156.0,
                maxZ: 14.0,
              };
            }
          } else {
            if (store.currentFloor > 1) {
              walls = getUpperFloorWalls(store.isGateUnlocked);
              bounds = {
                minX: -16.0,
                maxX: 16.0,
                minZ: -74.0,
                maxZ: 14.0,
              };
            } else {
              walls = getFloor1Walls(store.isExitGateUnlocked);
              bounds = {
                minX: -48.0,
                maxX: 48.0,
                minZ: -108.0,
                maxZ: 14.0,
              };
            }
          }

          const [validX, validZ] = resolveMovement(
            currentPos.x,
            currentPos.z,
            targetX,
            targetZ,
            playerRadius,
            walls,
            bounds
          );

          currentPos.x = validX;
          currentPos.z = validZ;
        }

        sound.playFootstep();
      }
    }

    // Camera height & rotation
    if (isOverview) {
      currentPos.y = 36.0;
      camera.rotation.set(-Math.PI / 2, 0, 0, 'YXZ');
    } else {
      currentPos.y = 1.6;
      camera.rotation.set(0, yawRef.current, 0, 'YXZ');
    }

    // Orient Flashlight beam & direct position updates
    if (spotLightRef.current) {
      spotLightRef.current.position.set(currentPos.x, 1.55, currentPos.z);
    }
    if (fillLightRef.current) {
      fillLightRef.current.position.set(currentPos.x, 1.5, currentPos.z);
    }
    if (spotTargetRef.current && spotLightRef.current) {
      spotTargetRef.current.position.set(
        currentPos.x - Math.sin(yawRef.current) * 14,
        1.2,
        currentPos.z - Math.cos(yawRef.current) * 14
      );
      spotLightRef.current.target = spotTargetRef.current;
    }

    // 2. Check Gathering Zone in front of the gate
    const isMultiplayer = store.maxPlayers > 1;
    let inZone = false;
    if (isMultiplayer) {
      if (store.currentFloor > 1) {
        if (store.isGateUnlocked) {
          inZone = isPointInZone(currentPos.x, currentPos.z, {
            minX: -3.5,
            maxX: 3.5,
            minZ: -69.5,
            maxZ: -66.0,
          });
        }
      } else {
        if (store.isExitGateUnlocked) {
          inZone = isPointInZone(currentPos.x, currentPos.z, {
            minX: -4.5,
            maxX: 4.5,
            minZ: -147.5,
            maxZ: -143.5,
          });
        }
      }
    } else {
      if (store.currentFloor > 1) {
        if (store.isGateUnlocked) {
          inZone = isPointInZone(currentPos.x, currentPos.z, {
            minX: -3.0,
            maxX: 3.0,
            minZ: -69.5,
            maxZ: -66.0,
          });
        }
      } else {
        if (store.isExitGateUnlocked) {
          inZone = isPointInZone(currentPos.x, currentPos.z, {
            minX: -4.2,
            maxX: 4.2,
            minZ: -103.5,
            maxZ: -99.5,
          });
        }
      }
    }

    // 3. Check proximity to interactables
    let closestInteractable: typeof store.nearbyInteractable = null;
    let minDist = 3.4;

    if (store.currentFloor > 1) {
      // Check 5 desks inside the expanded classrooms using zero-allocation cached structures
      const floorQuestions = QUESTIONS_BY_FLOOR[store.currentFloor] || [];
      const deskList = isMultiplayer
        ? (MULTI_DESK_POSITIONS_BY_FLOOR[store.currentFloor] || [])
        : SOLO_DESK_POSITIONS;

      for (let idx = 0; idx < floorQuestions.length; idx++) {
        const q = floorQuestions[idx];
        const dpos = deskList[idx];
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
      }

      // Check Stair Key
      const allSolved = floorQuestions.every((q) => store.solvedQuestionIds.includes(q.id));
      if (allSolved && !store.hasStairKey && !store.isGateUnlocked) {
        const keyPos = isMultiplayer
          ? (store.currentFloor === 3 ? [0, 2] : [0, -30])
          : [0, -44];
        const keyDist = Math.hypot(currentPos.x - keyPos[0], currentPos.z - keyPos[1]);
        if (keyDist < 2.8 && keyDist < minDist) {
          minDist = keyDist;
          closestInteractable = {
            type: 'stair_key',
            label: 'Ambil Kunci Tangga',
            distance: keyDist,
          };
        }
      }

      // Check Stair Gate (Z = -70)
      if (store.hasStairKey && !store.isGateUnlocked) {
        const gateDist = Math.hypot(currentPos.x - 0, currentPos.z - (-70));
        if (gateDist < 3.8 && gateDist < minDist) {
          minDist = gateDist;
          closestInteractable = {
            type: 'stair_gate',
            label: 'Buka Pintu Gerbang Tangga',
            distance: gateDist,
          };
        }
      }
    } else {
      // Floor 1: Check Master Key
      const masterKeyPos = isMultiplayer ? [-22, -85] : [-18, -56];
      const exitGateZ = isMultiplayer ? -148 : -104;

      if (!store.hasMasterKey) {
        const mKeyDist = Math.hypot(currentPos.x - masterKeyPos[0], currentPos.z - masterKeyPos[1]);
        if (mKeyDist < 3.2 && mKeyDist < minDist) {
          minDist = mKeyDist;
          closestInteractable = {
            type: 'master_key',
            label: 'Ambil Kunci Gerbang Utama',
            distance: mKeyDist,
          };
        }
      }

      // Floor 1: Check Exit Gate
      if (store.hasMasterKey && !store.isExitGateUnlocked) {
        const eGateDist = Math.hypot(currentPos.x - 0, currentPos.z - exitGateZ);
        if (eGateDist < 4.2 && eGateDist < minDist) {
          minDist = eGateDist;
          closestInteractable = {
            type: 'exit_gate',
            label: 'Buka Gerbang Keluar Sekolah',
            distance: eGateDist,
          };
        }
      }
    }

    // 3. Proximity interactable update (ONLY on actual id/type change - eliminates 60 re-renders/sec!)
    const interactableId = closestInteractable?.id || '';
    const interactableType = closestInteractable?.type || '';
    if (
      interactableId !== lastInteractableIdRef.current ||
      interactableType !== lastInteractableTypeRef.current
    ) {
      lastInteractableIdRef.current = interactableId;
      lastInteractableTypeRef.current = interactableType;
      store.setNearbyInteractable(closestInteractable);
    }

    // 4. Update my position & zone status in store (Throttled to 20Hz - saves 66% store overhead)
    posThrottleRef.current += delta;
    if (posThrottleRef.current > 0.05) {
      posThrottleRef.current = 0;
      store.setMyPosition(
        [currentPos.x, currentPos.y, currentPos.z],
        yawRef.current,
        inZone
      );
    }

    // 5. Team Gathering Check (Instant evaluation for Solo - eliminates array allocation)
    if (!store.isMapViewer) {
      const isSolo = store.maxPlayers === 1;
      let allInZone = false;

      if (isSolo) {
        allInZone = inZone;
      } else {
        const teammatesOnFloor = Object.values(store.teammates).filter(
          (tm) => tm.currentFloor === store.currentFloor
        );
        const playersInZoneList = [inZone, ...teammatesOnFloor.map((tm) => tm.isInGatheringZone)];
        allInZone = checkAllPlayersInGatheringZone(playersInZoneList).allInZone;
      }

      if (allInZone) {
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

  const flashlightOn = useGameStore((s) => s.flashlightOn);

  return (
    <>
      <object3D ref={spotTargetRef} />

      {/* Realistic Player Flashlight with Aim Target */}
      <spotLight
        ref={spotLightRef}
        color="#ffffff"
        intensity={flashlightOn ? 3.0 : 0}
        angle={Math.PI / 5}
        penumbra={0.45}
        distance={26}
        decay={2}
      />

      {/* Subtle Personal Ambient Fill Light around player */}
      <pointLight
        ref={fillLightRef}
        color="#fef08a"
        intensity={flashlightOn ? 0.35 : 0.08}
        distance={5}
      />
    </>
  );
};
