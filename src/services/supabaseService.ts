/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import supabase from '../utils/supabase';
import { LeaderboardEntry } from '../types/game';

const LOCAL_STORAGE_KEY = 'ketiduran_leaderboard_cache';

const DEFAULT_SCORES: LeaderboardEntry[] = [
  {
    playerName: 'Ahmad SIJA 1',
    roomCode: 'SMK-01',
    score: 100,
    timeSeconds: 245,
    mode: 'multiplayer',
    completedAt: '2026-11-14T08:30:00Z',
  },
  {
    playerName: 'Siti RPL 2',
    roomCode: 'SOLO',
    score: 100,
    timeSeconds: 310,
    mode: 'solo',
    completedAt: '2026-11-14T09:15:00Z',
  },
  {
    playerName: 'Rian TKJ 1',
    roomCode: 'SMK-77',
    score: 95,
    timeSeconds: 380,
    mode: 'multiplayer',
    completedAt: '2026-11-14T10:00:00Z',
  },
  {
    playerName: 'Dewi DKV 1',
    roomCode: 'SOLO',
    score: 90,
    timeSeconds: 420,
    mode: 'solo',
    completedAt: '2026-11-14T11:20:00Z',
  },
];

class SupabaseService {
  private isConnected: boolean = false;

  constructor() {
    this.checkHealth();
  }

  public async checkHealth(): Promise<boolean> {
    try {
      if (!supabase) return false;
      // Test channel subscription to verify realtime connectivity
      const testChannel = supabase.channel('supabase_health_check');
      const status = await new Promise<string>((resolve) => {
        testChannel.subscribe((st) => {
          resolve(st);
        });
        setTimeout(() => resolve('TIMEOUT'), 4000);
      });
      testChannel.unsubscribe();
      this.isConnected = status === 'SUBSCRIBED';
      return this.isConnected;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  public getConnectedStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Saves a student game completion record to Supabase database.
   * If table doesn't exist yet in the Supabase schema, seamlessly saves to local cache.
   */
  public async saveGameResult(entry: LeaderboardEntry): Promise<{ success: boolean; isCloud: boolean }> {
    try {
      if (supabase) {
        const { error } = await supabase.from('game_leaderboard').insert([
          {
            player_name: entry.playerName,
            room_code: entry.roomCode,
            score: entry.score,
            time_seconds: entry.timeSeconds,
            mode: entry.mode,
            completed_at: entry.completedAt || new Date().toISOString(),
          },
        ]);

        if (!error) {
          this.saveToLocalCache(entry);
          return { success: true, isCloud: true };
        }
      }
    } catch (err) {
      console.warn('Supabase DB insert fallback:', err);
    }

    // Fallback to local cache
    this.saveToLocalCache(entry);
    return { success: true, isCloud: false };
  }

  /**
   * Fetches leaderboard scores from Supabase cloud database, with local fallback.
   */
  public async getLeaderboard(): Promise<{ entries: LeaderboardEntry[]; isCloud: boolean }> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('game_leaderboard')
          .select('*')
          .order('score', { ascending: false })
          .order('time_seconds', { ascending: true })
          .limit(25);

        if (!error && data && data.length > 0) {
          const cloudEntries: LeaderboardEntry[] = data.map((item: any) => ({
            id: item.id?.toString(),
            playerName: item.player_name || 'Siswa SMK',
            roomCode: item.room_code || 'SMK',
            score: Number(item.score) || 0,
            timeSeconds: Number(item.time_seconds) || 0,
            mode: item.mode === 'multiplayer' ? 'multiplayer' : 'solo',
            completedAt: item.completed_at || item.created_at,
          }));
          return { entries: cloudEntries, isCloud: true };
        }
      }
    } catch (err) {
      console.warn('Supabase DB select fallback:', err);
    }

    // Return local cached + default SMK scores
    return { entries: this.getLocalCache(), isCloud: false };
  }

  private saveToLocalCache(entry: LeaderboardEntry) {
    try {
      const current = this.getLocalCache();
      const updated = [entry, ...current].slice(0, 30);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  private getLocalCache(): LeaderboardEntry[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_SCORES;
  }
}

export const supabaseService = new SupabaseService();
