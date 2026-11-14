/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { supabaseService } from '../../services/supabaseService';
import { LeaderboardEntry } from '../../types/game';
import { sound } from '../../services/soundEngine';
import {
  Trophy,
  X,
  Medal,
  RefreshCw,
  Clock,
  CheckCircle2,
  Users,
  User,
  Database,
  Cloud,
} from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCloud, setIsCloud] = useState<boolean>(false);

  const fetchScores = async () => {
    setIsLoading(true);
    try {
      const res = await supabaseService.getLeaderboard();
      setEntries(res.entries);
      setIsCloud(res.isCloud);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchScores();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}d`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center shadow-md">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-mono">
                Papan Peringkat SMK
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">
                  Skor Terbaik Pendidikan Agama Islam (PAI)
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isCloud
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  }`}
                >
                  {isCloud ? <Cloud size={10} /> : <Database size={10} />}
                  <span>{isCloud ? 'Supabase Cloud Live' : 'Database Sinkron'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playInteract();
                fetchScores();
              }}
              title="Perbarui Data"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
            </button>
            <button
              onClick={() => {
                sound.playInteract();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scores Table / List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm space-y-3">
              <RefreshCw size={24} className="animate-spin text-emerald-400 mx-auto" />
              <p>Menghubungkan ke Supabase Cloud...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Belum ada data skor. Jadilah yang pertama menyelesaikan game!
            </div>
          ) : (
            entries.map((entry, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const medalColor =
                rank === 1
                  ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                  : rank === 2
                  ? 'text-slate-200 bg-slate-200/10 border-slate-300/30'
                  : rank === 3
                  ? 'text-amber-600 bg-amber-600/10 border-amber-600/30'
                  : 'text-slate-400 bg-slate-800/50 border-slate-700/50';

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition ${
                    isTop3
                      ? 'bg-slate-950/80 border-slate-700/80'
                      : 'bg-slate-950/40 border-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border ${medalColor}`}
                    >
                      {isTop3 ? <Medal size={16} /> : `#${rank}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {entry.playerName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-400">
                          {entry.roomCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          {entry.mode === 'multiplayer' ? (
                            <Users size={12} className="text-sky-400" />
                          ) : (
                            <User size={12} className="text-emerald-400" />
                          )}
                          <span className="capitalize">{entry.mode}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          <span>{formatTime(entry.timeSeconds)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                      {entry.score}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      POIN PAI
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>
            Skor dicatat otomatis ke <b>Supabase Cloud Database</b> saat pemain lolos dari Gerbang Utama.
          </span>
          <button
            onClick={() => {
              sound.playInteract();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
