/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SyncMessage, PlayerData } from '../types/game';
import { useGameStore } from '../store/gameStore';

class MultiplayerSyncService {
  private channel: BroadcastChannel | null = null;
  private currentRoomCode: string = '';
  private heartbeatTimer: number | null = null;
  private cleanupTimer: number | null = null;

  public init(roomCode: string) {
    if (this.channel && this.currentRoomCode === roomCode) return;

    this.disconnect();
    this.currentRoomCode = roomCode;

    try {
      this.channel = new BroadcastChannel(`ketiduran_${roomCode}`);
      this.channel.onmessage = this.handleMessage.bind(this);

      // Start periodic heartbeat
      this.heartbeatTimer = window.setInterval(() => {
        this.sendHeartbeat();
      }, 500);

      // Cleanup inactive teammates
      this.cleanupTimer = window.setInterval(() => {
        this.pruneStaleTeammates();
      }, 2000);

      // Send initial join
      const store = useGameStore.getState();
      this.send({
        type: 'PLAYER_JOIN',
        senderId: store.myId,
        roomCode,
        payload: {
          name: store.myName,
          color: store.myColor,
          position: store.myPosition,
          yaw: store.myYaw,
          currentFloor: store.currentFloor,
          isInGatheringZone: store.myIsInGatheringZone,
        },
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('BroadcastChannel not supported or error:', e);
    }
  }

  public disconnect() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    if (this.channel) {
      const store = useGameStore.getState();
      this.send({
        type: 'PLAYER_LEAVE',
        senderId: store.myId,
        roomCode: this.currentRoomCode,
        timestamp: Date.now(),
      });
      this.channel.close();
      this.channel = null;
    }
  }

  public send(msg: SyncMessage) {
    if (!this.channel) return;
    try {
      this.channel.postMessage(msg);
    } catch {}
  }

  private sendHeartbeat() {
    const store = useGameStore.getState();
    if (store.status !== 'playing') return;

    this.send({
      type: 'PLAYER_HEARTBEAT',
      senderId: store.myId,
      roomCode: this.currentRoomCode,
      payload: {
        name: store.myName,
        color: store.myColor,
        position: store.myPosition,
        yaw: store.myYaw,
        currentFloor: store.currentFloor,
        isInGatheringZone: store.myIsInGatheringZone,
        solvedQuestionIds: store.solvedQuestionIds,
        hasStairKey: store.hasStairKey,
        isGateUnlocked: store.isGateUnlocked,
      },
      timestamp: Date.now(),
    });
  }

  private handleMessage(event: MessageEvent<SyncMessage>) {
    const msg = event.data;
    if (!msg || !msg.type) return;

    const store = useGameStore.getState();
    if (msg.senderId === store.myId) return; // Ignore self

    switch (msg.type) {
      case 'PLAYER_JOIN':
      case 'PLAYER_HEARTBEAT': {
        const payload = msg.payload;
        if (!payload) break;

        const teammateData: PlayerData = {
          id: msg.senderId,
          name: payload.name || 'Teman',
          color: payload.color || '#f43f5e',
          position: payload.position || [0, 1.6, 0],
          yaw: payload.yaw || 0,
          currentFloor: payload.currentFloor || store.currentFloor,
          isInGatheringZone: !!payload.isInGatheringZone,
          lastActive: Date.now(),
        };
        store.updateTeammate(teammateData);

        // Sync floor state if teammate is on same floor and has newer info
        if (payload.currentFloor === store.currentFloor && payload.solvedQuestionIds) {
          const mergedSolved = Array.from(
            new Set([...store.solvedQuestionIds, ...payload.solvedQuestionIds])
          );
          if (mergedSolved.length > store.solvedQuestionIds.length) {
            useGameStore.setState({ solvedQuestionIds: mergedSolved });
          }
        }
        break;
      }

      case 'PLAYER_MOVE': {
        const payload = msg.payload;
        if (!payload) break;
        const existing = store.teammates[msg.senderId];
        if (existing) {
          store.updateTeammate({
            ...existing,
            position: payload.position,
            yaw: payload.yaw,
            isInGatheringZone: !!payload.isInGatheringZone,
            lastActive: Date.now(),
          });
        }
        break;
      }

      case 'PLAYER_LEAVE': {
        store.removeTeammate(msg.senderId);
        break;
      }

      case 'QUESTION_SOLVED': {
        const questionId = msg.payload?.questionId;
        if (questionId) {
          store.solveQuestion(questionId, false);
        }
        break;
      }

      case 'KEY_COLLECTED': {
        if (msg.payload?.keyType === 'master') {
          store.collectMasterKey(false);
        } else {
          store.collectStairKey(false);
        }
        break;
      }

      case 'GATE_UNLOCKED': {
        if (msg.payload?.gateType === 'exit') {
          store.unlockExitGate(false);
        } else {
          store.unlockStairGate(false);
        }
        break;
      }

      case 'FLOOR_TRANSITION': {
        const nextFloor = msg.payload?.floor;
        if (nextFloor && nextFloor !== store.currentFloor) {
          store.transitionToNextFloor(nextFloor, false);
        }
        break;
      }

      case 'ROBOT_STATE': {
        if (store.currentFloor === 1 && msg.payload) {
          store.setRobotState(msg.payload);
        }
        break;
      }

      case 'GAME_OVER': {
        if (store.status === 'playing') {
          store.triggerGameOver(msg.payload?.reason || 'Teman tertangkap oleh Robot Pengawas!', false);
        }
        break;
      }

      case 'VICTORY': {
        if (store.status === 'playing') {
          store.triggerVictory(false);
        }
        break;
      }

      case 'RESTART_GAME': {
        store.restartGame(false);
        break;
      }
    }
  }

  private pruneStaleTeammates() {
    const store = useGameStore.getState();
    const now = Date.now();
    Object.values(store.teammates).forEach((tm) => {
      if (now - tm.lastActive > 5000) {
        store.removeTeammate(tm.id);
      }
    });
  }
}

export const multiplayerSync = new MultiplayerSyncService();
