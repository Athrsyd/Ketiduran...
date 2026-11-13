/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { GameStatus, PlayerData, Question, RobotState } from '../types/game';
import { PAI_QUESTIONS } from '../data/questions';
import { getFloorSpawnPosition } from '../utils/gameLogic';
import { sound } from '../services/soundEngine';

export interface GameState {
  status: GameStatus;
  currentFloor: number;
  roomCode: string;
  maxPlayers: 1 | 2 | 3;
  myId: string;
  myName: string;
  myColor: string;
  myPosition: [number, number, number];
  myYaw: number;
  myIsInGatheringZone: boolean;
  teammates: Record<string, PlayerData>;
  solvedQuestionIds: string[];
  activeQuestion: Question | null;
  hasStairKey: boolean;
  isGateUnlocked: boolean;
  hasMasterKey: boolean;
  isExitGateUnlocked: boolean;
  robotState: RobotState;
  nearbyInteractable: {
    type: 'question' | 'stair_key' | 'stair_gate' | 'master_key' | 'exit_gate';
    id?: string;
    label: string;
    distance: number;
  } | null;
  flashlightOn: boolean;
  isMuted: boolean;
  gameOverReason: string;
  virtualJoystick: { x: number; y: number; active: boolean };
  touchLookDelta: { x: number; y: number };

  // Actions
  startSolo: (name: string, color: string) => void;
  joinRoom: (roomCode: string, name: string, color: string, maxPlayers: 1 | 2 | 3) => void;
  setMyPosition: (pos: [number, number, number], yaw: number, inZone: boolean) => void;
  updateTeammate: (data: PlayerData) => void;
  removeTeammate: (id: string) => void;
  openQuestion: (q: Question) => void;
  closeQuestion: () => void;
  solveQuestion: (id: string, broadcast?: boolean) => void;
  collectStairKey: (broadcast?: boolean) => void;
  unlockStairGate: (broadcast?: boolean) => void;
  collectMasterKey: (broadcast?: boolean) => void;
  unlockExitGate: (broadcast?: boolean) => void;
  transitionToNextFloor: (nextFloor?: number, broadcast?: boolean) => void;
  setRobotState: (update: Partial<RobotState>) => void;
  triggerGameOver: (reason: string, broadcast?: boolean) => void;
  triggerVictory: (broadcast?: boolean) => void;
  restartGame: (broadcast?: boolean) => void;
  setNearbyInteractable: (interactable: GameState['nearbyInteractable']) => void;
  toggleFlashlight: () => void;
  toggleSound: () => void;
  setJoystick: (x: number, y: number, active: boolean) => void;
  setTouchLook: (x: number, y: number) => void;
  applyFloorSync: (floor: number, solvedIds: string[], hasKey: boolean, isUnlocked: boolean) => void;
}

const generateId = () => 'p_' + Math.random().toString(36).substring(2, 9);

export const useGameStore = create<GameState>((set, get) => ({
  status: 'lobby',
  currentFloor: 4,
  roomCode: 'KETIDURAN-11',
  maxPlayers: 1,
  myId: generateId(),
  myName: 'Siswa SMK 1',
  myColor: '#38bdf8', // Sky blue
  myPosition: [0, 1.6, 4],
  myYaw: 0,
  myIsInGatheringZone: false,
  teammates: {},
  solvedQuestionIds: [],
  activeQuestion: null,
  hasStairKey: false,
  isGateUnlocked: false,
  hasMasterKey: false,
  isExitGateUnlocked: false,
  robotState: {
    x: 0,
    z: -18,
    rotation: 0,
    isChasing: false,
    targetPlayerId: null,
  },
  nearbyInteractable: null,
  flashlightOn: true,
  isMuted: false,
  gameOverReason: '',
  virtualJoystick: { x: 0, y: 0, active: false },
  touchLookDelta: { x: 0, y: 0 },

  startSolo: (name: string, color: string) => {
    sound.startAmbience();
    const spawnPos = getFloorSpawnPosition(4);
    set({
      status: 'playing',
      currentFloor: 4,
      roomCode: 'SOLO-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      maxPlayers: 1,
      myName: name.trim() || 'Siswa SMK',
      myColor: color,
      myPosition: spawnPos,
      myYaw: 0,
      myIsInGatheringZone: false,
      teammates: {},
      solvedQuestionIds: [],
      activeQuestion: null,
      hasStairKey: false,
      isGateUnlocked: false,
      hasMasterKey: false,
      isExitGateUnlocked: false,
      gameOverReason: '',
    });
  },

  joinRoom: (roomCode: string, name: string, color: string, maxPlayers: 1 | 2 | 3) => {
    sound.startAmbience();
    const spawnPos = getFloorSpawnPosition(4);
    set({
      status: 'playing',
      currentFloor: 4,
      roomCode: roomCode.trim().toUpperCase() || 'KELAS-11',
      maxPlayers,
      myName: name.trim() || 'Siswa SMK',
      myColor: color,
      myPosition: spawnPos,
      myYaw: 0,
      myIsInGatheringZone: false,
      teammates: {},
      solvedQuestionIds: [],
      activeQuestion: null,
      hasStairKey: false,
      isGateUnlocked: false,
      hasMasterKey: false,
      isExitGateUnlocked: false,
      gameOverReason: '',
    });
  },

  setMyPosition: (pos, yaw, inZone) => {
    set({
      myPosition: pos,
      myYaw: yaw,
      myIsInGatheringZone: inZone,
    });
  },

  updateTeammate: (data) => {
    set((state) => ({
      teammates: {
        ...state.teammates,
        [data.id]: data,
      },
    }));
  },

  removeTeammate: (id) => {
    set((state) => {
      const next = { ...state.teammates };
      delete next[id];
      return { teammates: next };
    });
  },

  openQuestion: (q) => {
    sound.playInteract();
    set({ activeQuestion: q });
  },

  closeQuestion: () => {
    set({ activeQuestion: null });
  },

  solveQuestion: (id, broadcast = true) => {
    sound.playCorrect();
    set((state) => {
      if (state.solvedQuestionIds.includes(id)) return state;
      const updated = [...state.solvedQuestionIds, id];
      return {
        solvedQuestionIds: updated,
        activeQuestion: null,
      };
    });
  },

  collectStairKey: () => {
    sound.playKeyPickup();
    set({ hasStairKey: true });
  },

  unlockStairGate: () => {
    sound.playGateUnlocked();
    set({ isGateUnlocked: true });
  },

  collectMasterKey: () => {
    sound.playKeyPickup();
    set({ hasMasterKey: true });
  },

  unlockExitGate: () => {
    sound.playGateUnlocked();
    set({ isExitGateUnlocked: true });
  },

  transitionToNextFloor: (nextFloorOverride) => {
    const current = get().currentFloor;
    const next = nextFloorOverride !== undefined ? nextFloorOverride : current - 1;
    if (next < 1) return;

    sound.playInteract();
    const spawnPos = getFloorSpawnPosition(next);
    set({
      currentFloor: next,
      myPosition: spawnPos,
      myIsInGatheringZone: false,
      hasStairKey: false,
      isGateUnlocked: false,
      activeQuestion: null,
      robotState: {
        x: 0,
        z: -18,
        rotation: 0,
        isChasing: false,
        targetPlayerId: null,
      },
    });
  },

  setRobotState: (update) => {
    set((state) => ({
      robotState: { ...state.robotState, ...update },
    }));
  },

  triggerGameOver: (reason) => {
    sound.playGameOver();
    set({
      status: 'gameover',
      gameOverReason: reason || 'Tertangkap oleh Robot Pengawas!',
      activeQuestion: null,
    });
  },

  triggerVictory: () => {
    sound.playVictory();
    set({
      status: 'victory',
      activeQuestion: null,
    });
  },

  restartGame: () => {
    sound.setRobotAlarm(false);
    sound.startAmbience();
    const spawnPos = getFloorSpawnPosition(4);
    set({
      status: 'playing',
      currentFloor: 4,
      myPosition: spawnPos,
      myYaw: 0,
      myIsInGatheringZone: false,
      solvedQuestionIds: [],
      activeQuestion: null,
      hasStairKey: false,
      isGateUnlocked: false,
      hasMasterKey: false,
      isExitGateUnlocked: false,
      gameOverReason: '',
      robotState: {
        x: 0,
        z: -18,
        rotation: 0,
        isChasing: false,
        targetPlayerId: null,
      },
    });
  },

  setNearbyInteractable: (interactable) => {
    set({ nearbyInteractable: interactable });
  },

  toggleFlashlight: () => {
    sound.playInteract();
    set((state) => ({ flashlightOn: !state.flashlightOn }));
  },

  toggleSound: () => {
    const nextMuted = !get().isMuted;
    sound.setMuted(nextMuted);
    set({ isMuted: nextMuted });
  },

  setJoystick: (x, y, active) => {
    set({ virtualJoystick: { x, y, active } });
  },

  setTouchLook: (x, y) => {
    set({ touchLookDelta: { x, y } });
  },

  applyFloorSync: (floor, solvedIds, hasKey, isUnlocked) => {
    set({
      currentFloor: floor,
      solvedQuestionIds: solvedIds,
      hasStairKey: hasKey,
      isGateUnlocked: isUnlocked,
    });
  },
}));
