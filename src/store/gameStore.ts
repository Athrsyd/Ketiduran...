/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { GameStatus, PlayerData, Question, RobotState } from '../types/game';
import { PAI_QUESTIONS } from '../data/questions';
import { getFloorSpawnPosition } from '../utils/gameLogic';
import { sound } from '../services/soundEngine';
import { isMobileDevice } from '../utils/fullscreen';
import { MASTER_KEY_SPAWNS } from '../data/floor1Spawns';

export interface MapTransitionPopupData {
  show: boolean;
  fromFloor: number;
  toFloor: number;
  title: string;
  desc: string;
}

export interface GameState {
  status: GameStatus;
  currentFloor: number;
  roomCode: string;
  maxPlayers: number;
  isHost: boolean;
  isReady: boolean;
  myId: string;
  myName: string;
  myColor: string;
  myGender: 'male' | 'female';
  myPosition: [number, number, number];
  myYaw: number;
  myIsInGatheringZone: boolean;
  teammates: Record<string, PlayerData>;
  solvedQuestionIds: string[];
  activeQuestion: Question | null;
  hasStairKey: boolean;
  isGateUnlocked: boolean;
  hasMasterKey: boolean;
  masterKeySpawnIndex: number;
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

  // Graphics Quality (Mobile performance vs High PC)
  graphicsQuality: 'high' | 'mobile';

  // Map Transition Popup State
  mapTransitionPopup: MapTransitionPopupData | null;

  // Dedicated Map Test / Preview Route Mode
  isMapViewer: boolean;
  viewerCameraMode: 'walk' | 'fly' | 'overview';
  viewerNoclip: boolean;
  teleportTarget: [number, number, number] | null;
  demoTeammatesActive: boolean;
  toggleDemoTeammates: () => void;

  // In-Game Objective & Mission Hint Modal
  isHintOpen: boolean;

  // Supabase Cloud Realtime connection status
  isSupabaseConnected: boolean;

  // Actions
  setSupabaseConnected: (connected: boolean) => void;
  setMyGender: (gender: 'male' | 'female') => void;
  toggleHint: () => void;
  closeHint: () => void;
  setMaxPlayers: (max: number) => void;
  createWaitingRoom: (roomCode: string, name: string, color: string, gender?: 'male' | 'female') => void;
  joinWaitingRoom: (roomCode: string, name: string, color: string, gender?: 'male' | 'female') => void;
  toggleReady: () => void;
  startMultiplayerGame: (broadcast?: boolean) => void;
  leaveWaitingRoom: () => void;
  startSolo: (name: string, color: string, gender?: 'male' | 'female', skipCutscene?: boolean) => void;
  joinRoom: (roomCode: string, name: string, color: string, gender?: 'male' | 'female', maxPlayers?: number, skipCutscene?: boolean) => void;
  finishCutscene: () => void;
  playCutsceneStandalone: () => void;
  toggleGraphicsQuality: () => void;
  setMyPosition: (pos: [number, number, number], yaw: number, inZone: boolean) => void;
  updateTeammate: (data: PlayerData) => void;
  removeTeammate: (id: string) => void;
  openQuestion: (q: Question) => void;
  closeQuestion: () => void;
  solveQuestion: (id: string, broadcast?: boolean) => void;
  collectStairKey: (broadcast?: boolean) => void;
  unlockStairGate: (broadcast?: boolean) => void;
  collectMasterKey: (broadcast?: boolean) => void;
  setMasterKeySpawnIndex: (index: number) => void;
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

  // Transition & Viewer actions
  dismissMapTransitionPopup: () => void;
  setMapViewer: (active: boolean) => void;
  setViewerFloor: (floor: number) => void;
  setViewerCameraMode: (mode: 'walk' | 'fly' | 'overview') => void;
  toggleViewerNoclip: () => void;
  teleportPlayer: (pos: [number, number, number], yaw?: number) => void;
}

const generateId = () => 'p_' + Math.random().toString(36).substring(2, 9);

function getFloorTransitionInfo(targetFloor: number): { title: string; desc: string } {
  switch (targetFloor) {
    case 4:
      return {
        title: 'LANTAI 4 - KORIDOR KELAS XI (TAHAP 1)',
        desc: 'Kamu terbangun sendirian/bersama teman di Lantai 4. Kerjakan 5 meja soal PAI di ruang-ruang kelas untuk membuka gerbang tangga!',
      };
    case 3:
      return {
        title: 'LANTAI 3 - KELAS MULTIMEDIA & DAKWAH (TAHAP 2)',
        desc: 'Berhasil turun ke Lantai 3! Kerjakan 5 soal materi Akhlak & Syiar Islam untuk membuka tangga berikutnya.',
      };
    case 2:
      return {
        title: 'LANTAI 2 - PUSAT EKONOMI & PERPUSTAKAAN (TAHAP 3)',
        desc: 'Tinggal satu lantai lagi menuju lantai dasar! Selesaikan 5 soal Fikih Muamalah & Tokoh Pembaru Islam.',
      };
    case 1:
      return {
        title: 'LANTAI 1 & HALAMAN SEKOLAH LUAS (TAHAP AKHIR)',
        desc: 'Kamu tiba di lantai dasar & halaman terbuka! Cari Kunci Master di Pos Satpam dan lolos lewat Gerbang Utama! Hati-hati dengan Robot Pengawas!',
      };
    default:
      return {
        title: `PINDAH KE LANTAI ${targetFloor}`,
        desc: 'Teruslah menjelajahi area sekolah dan selesaikan misi bersama teman-teman.',
      };
  }
}

export function getDemoTeammatesForFloor(floor: number): Record<string, PlayerData> {
  switch (floor) {
    case 4:
      return {
        demo_budi: {
          id: 'demo_budi',
          name: 'Budi (RPL)',
          gender: 'male',
          color: '#3b82f6',
          position: [-18.0, 1.6, -16.0],
          yaw: Math.PI / 2,
          currentFloor: 4,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
        demo_siti: {
          id: 'demo_siti',
          name: 'Siti (TKJ)',
          gender: 'female',
          color: '#10b981',
          position: [18.0, 1.6, -46.0],
          yaw: -Math.PI / 2,
          currentFloor: 4,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
        demo_rian: {
          id: 'demo_rian',
          name: 'Rian (DKV)',
          gender: 'male',
          color: '#f59e0b',
          position: [0, 1.6, -28.0],
          yaw: 0,
          currentFloor: 4,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
      };
    case 3:
      return {
        demo_budi: {
          id: 'demo_budi',
          name: 'Budi (RPL)',
          gender: 'male',
          color: '#3b82f6',
          position: [0, 1.6, -30.0],
          yaw: 0,
          currentFloor: 3,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
        demo_siti: {
          id: 'demo_siti',
          name: 'Siti (TKJ)',
          gender: 'female',
          color: '#10b981',
          position: [-16.0, 1.6, -30.0],
          yaw: Math.PI,
          currentFloor: 3,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
        demo_rian: {
          id: 'demo_rian',
          name: 'Rian (DKV)',
          gender: 'male',
          color: '#f59e0b',
          position: [16.0, 1.6, -35.0],
          yaw: 0,
          currentFloor: 3,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
      };
    case 2:
      return {
        demo_budi: {
          id: 'demo_budi',
          name: 'Budi (RPL)',
          gender: 'male',
          color: '#3b82f6',
          position: [-18.5, 1.6, -16.0],
          yaw: 0,
          currentFloor: 2,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
        demo_siti: {
          id: 'demo_siti',
          name: 'Siti (TKJ)',
          gender: 'female',
          color: '#10b981',
          position: [0, 1.6, -30.0],
          yaw: Math.PI / 2,
          currentFloor: 2,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
        demo_rian: {
          id: 'demo_rian',
          name: 'Rian (DKV)',
          gender: 'male',
          color: '#f59e0b',
          position: [18.5, 1.6, -45.0],
          yaw: 0,
          currentFloor: 2,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
      };
    case 1:
    default:
      return {
        demo_budi: {
          id: 'demo_budi',
          name: 'Budi (RPL)',
          gender: 'male',
          color: '#3b82f6',
          position: [26.0, 1.6, -45.0],
          yaw: -Math.PI / 2,
          currentFloor: 1,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
        demo_siti: {
          id: 'demo_siti',
          name: 'Siti (TKJ)',
          gender: 'female',
          color: '#10b981',
          position: [-26.0, 1.6, -82.0],
          yaw: Math.PI / 2,
          currentFloor: 1,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
        demo_rian: {
          id: 'demo_rian',
          name: 'Rian (DKV)',
          gender: 'male',
          color: '#f59e0b',
          position: [0, 1.6, -45.0],
          yaw: 0,
          currentFloor: 1,
          isInGatheringZone: false,
          lastActive: Date.now(),
        },
      };
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  status: 'lobby',
  currentFloor: 4,
  roomCode: 'KETIDURAN-11',
  maxPlayers: 1,
  isHost: false,
  isReady: false,
  myId: generateId(),
  myName: 'Siswa SMK 1',
  myColor: '#38bdf8', // Sky blue
  myGender: 'male',
  setMyGender: (gender: 'male' | 'female') => set({ myGender: gender }),
  myPosition: [0, 1.6, 10.0],
  myYaw: 0,
  myIsInGatheringZone: false,
  teammates: {},
  solvedQuestionIds: [],
  activeQuestion: null,
  hasStairKey: false,
  isGateUnlocked: false,
  hasMasterKey: false,
  masterKeySpawnIndex: Math.floor(Math.random() * MASTER_KEY_SPAWNS.length),
  setMasterKeySpawnIndex: (index: number) => set({ masterKeySpawnIndex: index }),
  isExitGateUnlocked: false,
  robotState: {
    x: 0,
    z: -36,
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

  // Default to 'mobile' (60 FPS optimized) if mobile device detected, else 'high'
  graphicsQuality: typeof window !== 'undefined' && isMobileDevice() ? 'mobile' : 'high',

  mapTransitionPopup: null,
  isMapViewer: false,
  viewerCameraMode: 'walk',
  viewerNoclip: false,
  teleportTarget: null,
  demoTeammatesActive: false,
  isHintOpen: false,
  isSupabaseConnected: false,

  setSupabaseConnected: (connected: boolean) => {
    set({ isSupabaseConnected: connected });
  },

  createWaitingRoom: (roomCode: string, name: string, color: string, gender: 'male' | 'female' = 'male') => {
    const finalRoomCode = roomCode.trim().toUpperCase() || 'SMK-' + Math.floor(10 + Math.random() * 90);
    set({
      status: 'waiting_room',
      roomCode: finalRoomCode,
      maxPlayers: 2, // Flag indicating Multiplayer mode (> 1)
      isHost: true,
      isReady: true,
      myName: name.trim() || 'Ketua Kelas',
      myColor: color,
      myGender: gender,
      teammates: {},
    });
  },

  joinWaitingRoom: (roomCode: string, name: string, color: string, gender: 'male' | 'female' = 'male') => {
    const finalRoomCode = roomCode.trim().toUpperCase() || 'KELAS-11';
    set({
      status: 'waiting_room',
      roomCode: finalRoomCode,
      maxPlayers: 2, // Flag indicating Multiplayer mode (> 1)
      isHost: false,
      isReady: false,
      myName: name.trim() || 'Siswa SMK',
      myColor: color,
      myGender: gender,
      teammates: {},
    });
  },

  toggleReady: () => {
    const nextReady = !get().isReady;
    set({ isReady: nextReady });
  },

  startMultiplayerGame: (broadcast = true) => {
    const spawnPos = getFloorSpawnPosition(4);
    const info = getFloorTransitionInfo(4);

    set({
      status: 'cutscene',
      currentFloor: 4,
      myPosition: spawnPos,
      myYaw: 0,
      myIsInGatheringZone: false,
      solvedQuestionIds: [],
      activeQuestion: null,
      hasStairKey: false,
      isGateUnlocked: false,
      hasMasterKey: false,
      masterKeySpawnIndex: Math.floor(Math.random() * MASTER_KEY_SPAWNS.length),
      isExitGateUnlocked: false,
      gameOverReason: '',
      isMapViewer: false,
      mapTransitionPopup: null,
    });
  },

  setMaxPlayers: (max: number) => {
    set({ maxPlayers: max });
  },

  leaveWaitingRoom: () => {
    set({
      status: 'lobby',
      isHost: false,
      isReady: false,
      teammates: {},
    });
  },

  startSolo: (name: string, color: string, gender: 'male' | 'female' = 'male', skipCutscene = false) => {
    const spawnPos = getFloorSpawnPosition(4);
    const info = getFloorTransitionInfo(4);

    if (skipCutscene) {
      sound.startAmbience();
    }

    set({
      status: skipCutscene ? 'playing' : 'cutscene',
      currentFloor: 4,
      roomCode: 'SOLO-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      maxPlayers: 1,
      myName: name.trim() || (gender === 'female' ? 'Siswi SMK' : 'Siswa SMK'),
      myColor: color,
      myGender: gender,
      myPosition: spawnPos,
      myYaw: 0,
      myIsInGatheringZone: false,
      teammates: {},
      solvedQuestionIds: [],
      activeQuestion: null,
      hasStairKey: false,
      isGateUnlocked: false,
      hasMasterKey: false,
      masterKeySpawnIndex: Math.floor(Math.random() * MASTER_KEY_SPAWNS.length),
      isExitGateUnlocked: false,
      gameOverReason: '',
      isMapViewer: false,
      mapTransitionPopup: skipCutscene
        ? {
            show: true,
            fromFloor: 4,
            toFloor: 4,
            title: info.title,
            desc: info.desc,
          }
        : null,
    });
  },

  joinRoom: (roomCode: string, name: string, color: string, gender: 'male' | 'female' = 'male', maxPlayers: number = 3, skipCutscene = false) => {
    const spawnPos = getFloorSpawnPosition(4);
    const info = getFloorTransitionInfo(4);

    if (skipCutscene) {
      sound.startAmbience();
    }

    set({
      status: skipCutscene ? 'playing' : 'cutscene',
      currentFloor: 4,
      roomCode: roomCode.trim().toUpperCase() || 'KELAS-11',
      maxPlayers,
      myName: name.trim() || (gender === 'female' ? 'Siswi SMK' : 'Siswa SMK'),
      myColor: color,
      myGender: gender,
      myPosition: spawnPos,
      myYaw: 0,
      myIsInGatheringZone: false,
      teammates: {},
      solvedQuestionIds: [],
      activeQuestion: null,
      hasStairKey: false,
      isGateUnlocked: false,
      hasMasterKey: false,
      masterKeySpawnIndex: Math.floor(Math.random() * MASTER_KEY_SPAWNS.length),
      isExitGateUnlocked: false,
      gameOverReason: '',
      isMapViewer: false,
      mapTransitionPopup: skipCutscene
        ? {
            show: true,
            fromFloor: 4,
            toFloor: 4,
            title: info.title,
            desc: info.desc,
          }
        : null,
    });
  },

  finishCutscene: () => {
    sound.startAmbience();
    const current = get().currentFloor;
    const info = getFloorTransitionInfo(current);
    set({
      status: 'playing',
      mapTransitionPopup: {
        show: true,
        fromFloor: current,
        toFloor: current,
        title: info.title,
        desc: info.desc,
      },
    });
  },

  playCutsceneStandalone: () => {
    sound.stopAmbience();
    set({ status: 'cutscene' });
  },

  toggleGraphicsQuality: () => {
    set((state) => ({
      graphicsQuality: state.graphicsQuality === 'mobile' ? 'high' : 'mobile',
    }));
  },

  setMyPosition: (pos, yaw, inZone) => {
    set((state) => {
      const prev = state.myPosition;
      const dx = prev[0] - pos[0];
      const dy = prev[1] - pos[1];
      const dz = prev[2] - pos[2];
      const dyaw = Math.abs(state.myYaw - yaw);
      if (
        dx * dx + dy * dy + dz * dz < 0.005 &&
        dyaw < 0.03 &&
        state.myIsInGatheringZone === inZone
      ) {
        return state;
      }
      return {
        myPosition: pos,
        myYaw: yaw,
        myIsInGatheringZone: inZone,
      };
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

  toggleHint: () => {
    sound.playInteract();
    set((state) => ({ isHintOpen: !state.isHintOpen }));
  },

  closeHint: () => {
    set({ isHintOpen: false });
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

    sound.playGateUnlocked();
    const spawnPos = getFloorSpawnPosition(next);
    const info = getFloorTransitionInfo(next);
    const nextSpawnIndex = next === 1 ? Math.floor(Math.random() * MASTER_KEY_SPAWNS.length) : get().masterKeySpawnIndex;

    set({
      currentFloor: next,
      myPosition: spawnPos,
      myIsInGatheringZone: false,
      hasStairKey: false,
      isGateUnlocked: false,
      masterKeySpawnIndex: nextSpawnIndex,
      activeQuestion: null,
      mapTransitionPopup: {
        show: true,
        fromFloor: current,
        toFloor: next,
        title: info.title,
        desc: info.desc,
      },
      robotState: {
        x: 0,
        z: -36,
        rotation: 0,
        isChasing: false,
        targetPlayerId: null,
      },
    });
  },

  dismissMapTransitionPopup: () => {
    set({ mapTransitionPopup: null });
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
    const info = getFloorTransitionInfo(4);
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
      masterKeySpawnIndex: Math.floor(Math.random() * MASTER_KEY_SPAWNS.length),
      isExitGateUnlocked: false,
      gameOverReason: '',
      mapTransitionPopup: {
        show: true,
        fromFloor: 4,
        toFloor: 4,
        title: info.title,
        desc: info.desc,
      },
      robotState: {
        x: 0,
        z: -36,
        rotation: 0,
        isChasing: false,
        targetPlayerId: null,
      },
    });
  },

  setNearbyInteractable: (interactable) => {
    set((state) => {
      const prev = state.nearbyInteractable;
      if (!prev && !interactable) return state;
      if (
        prev &&
        interactable &&
        prev.type === interactable.type &&
        prev.id === interactable.id &&
        prev.label === interactable.label
      ) {
        return state;
      }
      return { nearbyInteractable: interactable };
    });
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
    const prev = get().currentFloor;
    const info = getFloorTransitionInfo(floor);
    set({
      currentFloor: floor,
      solvedQuestionIds: solvedIds,
      hasStairKey: hasKey,
      isGateUnlocked: isUnlocked,
      mapTransitionPopup:
        prev !== floor
          ? {
              show: true,
              fromFloor: prev,
              toFloor: floor,
              title: info.title,
              desc: info.desc,
            }
          : get().mapTransitionPopup,
    });
  },

  // Map Viewer Actions
  setMapViewer: (active) => {
    if (active) {
      sound.startAmbience();
      set({
        isMapViewer: true,
        status: 'playing',
        viewerCameraMode: 'walk',
        viewerNoclip: false,
        activeQuestion: null,
      });
    } else {
      set((state) => {
        const next = { ...state.teammates };
        delete next['demo_budi'];
        delete next['demo_siti'];
        delete next['demo_rian'];
        return {
          isMapViewer: false,
          status: 'lobby',
          viewerCameraMode: 'walk',
          viewerNoclip: false,
          demoTeammatesActive: false,
          teammates: next,
        };
      });
    }
  },

  setViewerFloor: (floor) => {
    const spawnPos = getFloorSpawnPosition(floor);
    const info = getFloorTransitionInfo(floor);
    const isDemoActive = get().demoTeammatesActive;
    const demos = isDemoActive ? getDemoTeammatesForFloor(floor) : {};

    set((state) => ({
      currentFloor: floor,
      myPosition: spawnPos,
      hasStairKey: true,
      isGateUnlocked: true,
      hasMasterKey: true,
      isExitGateUnlocked: true,
      teleportTarget: spawnPos,
      teammates: isDemoActive ? { ...state.teammates, ...demos } : state.teammates,
      mapTransitionPopup: {
        show: true,
        fromFloor: floor,
        toFloor: floor,
        title: `[TEST MODE] ${info.title}`,
        desc: `Melihat isi map lantai ${floor}. Kamu dapat bebas menjelajah atau berganti kamera.`,
      },
    }));
  },

  toggleDemoTeammates: () => {
    const current = get().demoTeammatesActive;
    if (current) {
      set((state) => {
        const next = { ...state.teammates };
        delete next['demo_budi'];
        delete next['demo_siti'];
        delete next['demo_rian'];
        return { demoTeammatesActive: false, teammates: next };
      });
    } else {
      const demos = getDemoTeammatesForFloor(get().currentFloor);
      set((state) => ({
        demoTeammatesActive: true,
        teammates: {
          ...state.teammates,
          ...demos,
        },
      }));
    }
  },

  setViewerCameraMode: (mode) => {
    set({ viewerCameraMode: mode });
  },

  toggleViewerNoclip: () => {
    set((state) => ({ viewerNoclip: !state.viewerNoclip }));
  },

  teleportPlayer: (pos, yaw) => {
    set({
      myPosition: pos,
      teleportTarget: pos,
      myYaw: yaw !== undefined ? yaw : get().myYaw,
    });
  },
}));
