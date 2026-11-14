/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SyncMessage, PlayerData } from '../types/game';
import { useGameStore } from '../store/gameStore';
import supabase from '../utils/supabase';

class MultiplayerSyncService {
  private channel: BroadcastChannel | null = null;
  private supabaseChannel: any = null;
  private currentRoomCode: string = '';
  private heartbeatTimer: number | null = null;
  private cleanupTimer: number | null = null;

  public init(roomCode: string) {
    if (this.currentRoomCode === roomCode && (this.channel || this.supabaseChannel)) return;

    this.disconnect();
    this.currentRoomCode = roomCode;

    // 1. BroadcastChannel for local tabs on same device
    try {
      this.channel = new BroadcastChannel(`ketiduran_${roomCode}`);
      this.channel.onmessage = this.handleMessage.bind(this);
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    // 2. Supabase Realtime Broadcast & Presence for cross-device online multiplayer
    try {
      if (supabase) {
        const store = useGameStore.getState();
        this.supabaseChannel = supabase.channel(`ketiduran_room_${roomCode}`, {
          config: {
            broadcast: { self: false },
            presence: { key: store.myId },
          },
        });

        this.supabaseChannel
          .on('broadcast', { event: 'sync' }, (payload: any) => {
            if (payload && payload.payload) {
              this.handleDirectMessage(payload.payload);
            }
          })
          .on('presence', { event: 'sync' }, () => {
            const presenceState = this.supabaseChannel.presenceState();
            const currentStore = useGameStore.getState();
            Object.keys(presenceState).forEach((peerKey) => {
              if (peerKey !== currentStore.myId) {
                const presences = presenceState[peerKey] as any[];
                if (presences && presences.length > 0) {
                  const p = presences[0];
                  currentStore.updateTeammate({
                    id: peerKey,
                    name: p.name || 'Teman',
                    color: p.color || '#f43f5e',
                    gender: p.gender || 'male',
                    position: p.position || [0, 1.6, 0],
                    yaw: p.yaw || 0,
                    currentFloor: p.currentFloor || currentStore.currentFloor,
                    isInGatheringZone: !!p.isInGatheringZone,
                    isHost: !!p.isHost,
                    isReady: !!p.isReady,
                    lastActive: Date.now(),
                  });
                }
              }
            });
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
            const currentStore = useGameStore.getState();
            if (key !== currentStore.myId && newPresences && newPresences.length > 0) {
              const p = newPresences[0];
              currentStore.updateTeammate({
                id: key,
                name: p.name || 'Teman',
                color: p.color || '#f43f5e',
                gender: p.gender || 'male',
                position: p.position || [0, 1.6, 0],
                yaw: p.yaw || 0,
                currentFloor: p.currentFloor || currentStore.currentFloor,
                isInGatheringZone: !!p.isInGatheringZone,
                isHost: !!p.isHost,
                isReady: !!p.isReady,
                lastActive: Date.now(),
              });
            }
          })
          .on('presence', { event: 'leave' }, ({ key }: any) => {
            const currentStore = useGameStore.getState();
            if (key !== currentStore.myId) {
              currentStore.removeTeammate(key);
            }
          })
          .subscribe(async (status: string) => {
            const currentStore = useGameStore.getState();
            if (status === 'SUBSCRIBED') {
              currentStore.setSupabaseConnected(true);
              try {
                await this.supabaseChannel.track({
                  id: currentStore.myId,
                  name: currentStore.myName,
                  color: currentStore.myColor,
                  gender: currentStore.myGender,
                  isHost: currentStore.isHost,
                  isReady: currentStore.isReady,
                  currentFloor: currentStore.currentFloor,
                });
              } catch {}
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              currentStore.setSupabaseConnected(false);
            }
          });
      }
    } catch (e) {
      console.warn('Supabase Realtime channel error:', e);
      useGameStore.getState().setSupabaseConnected(false);
    }

    // Start periodic heartbeat
    this.heartbeatTimer = window.setInterval(() => {
      this.sendHeartbeat();
    }, 500);

    // Cleanup inactive teammates
    this.cleanupTimer = window.setInterval(() => {
      this.pruneStaleTeammates();
    }, 2500);

    // Send initial join
    const store = useGameStore.getState();
    this.send({
      type: 'PLAYER_JOIN',
      senderId: store.myId,
      roomCode,
      payload: {
        name: store.myName,
        color: store.myColor,
        gender: store.myGender,
        position: store.myPosition,
        yaw: store.myYaw,
        currentFloor: store.currentFloor,
        isInGatheringZone: store.myIsInGatheringZone,
        isStunned: store.isStunned,
        isHost: store.isHost,
        isReady: store.isReady,
      },
      timestamp: Date.now(),
    });
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
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.unsubscribe();
      } catch {}
      this.supabaseChannel = null;
      useGameStore.getState().setSupabaseConnected(false);
    }
  }

  public send(msg: SyncMessage) {
    // Send to local BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {}
    }
    // Send to Supabase Realtime channel for network peers
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'sync',
          payload: msg,
        });
      } catch {}
    }
  }

  private sendHeartbeat() {
    const store = useGameStore.getState();
    if (store.status !== 'playing' && store.status !== 'waiting_room') return;

    this.send({
      type: 'PLAYER_HEARTBEAT',
      senderId: store.myId,
      roomCode: this.currentRoomCode,
      payload: {
        name: store.myName,
        color: store.myColor,
        gender: store.myGender,
        position: store.myPosition,
        yaw: store.myYaw,
        currentFloor: store.currentFloor,
        isInGatheringZone: store.myIsInGatheringZone,
        isStunned: store.isStunned,
        isHost: store.isHost,
        isReady: store.isReady,
        solvedQuestionIds: store.solvedQuestionIds,
        hasStairKey: store.hasStairKey,
        isGateUnlocked: store.isGateUnlocked,
      },
      timestamp: Date.now(),
    });
  }

  private handleMessage(event: MessageEvent<SyncMessage>) {
    this.handleDirectMessage(event.data);
  }

  private handleDirectMessage(msg: SyncMessage) {
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
          gender: payload.gender || 'male',
          position: payload.position || [0, 1.6, 0],
          yaw: payload.yaw || 0,
          currentFloor: payload.currentFloor || store.currentFloor,
          isInGatheringZone: !!payload.isInGatheringZone,
          isStunned: !!payload.isStunned,
          isHost: !!payload.isHost,
          isReady: !!payload.isReady,
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

      case 'PLAYER_READY': {
        const payload = msg.payload;
        if (!payload) break;
        const existing = store.teammates[msg.senderId];
        if (existing) {
          store.updateTeammate({
            ...existing,
            isReady: !!payload.isReady,
            lastActive: Date.now(),
          });
        }
        break;
      }

      case 'GAME_START': {
        // Host started the game, transition from waiting room into cutscene / playing
        if (store.status === 'waiting_room') {
          store.startMultiplayerGame(false);
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
        if (typeof msg.payload?.masterKeySpawnIndex === 'number') {
          store.setMasterKeySpawnIndex(msg.payload.masterKeySpawnIndex);
        }
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

      case 'PLAYER_STUNNED': {
        const targetId = msg.payload?.playerId;
        if (targetId === store.myId) {
          store.stunLocalPlayer();
        } else if (targetId) {
          store.stunTeammate(targetId);
        }
        break;
      }

      case 'PLAYER_REVIVED': {
        const targetId = msg.payload?.playerId;
        if (targetId === store.myId) {
          store.reviveLocalPlayer();
        } else if (targetId) {
          store.reviveTeammate(targetId);
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
