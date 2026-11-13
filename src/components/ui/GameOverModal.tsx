/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { sound } from '../../services/soundEngine';
import { multiplayerSync } from '../../services/multiplayerSync';
import { Skull, RotateCcw, AlertTriangle } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const gameOverReason = useGameStore((s) => s.gameOverReason);
  const restartGame = useGameStore((s) => s.restartGame);
  const solvedQuestionIds = useGameStore((s) => s.solvedQuestionIds);
  const myId = useGameStore((s) => s.myId);
  const roomCode = useGameStore((s) => s.roomCode);

  const handleRestart = () => {
    sound.playInteract();
    restartGame();
    multiplayerSync.send({
      type: 'RESTART_GAME',
      senderId: myId,
      roomCode,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="relative w-full max-w-md bg-slate-950 border-2 border-rose-600/80 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-[0_0_50px_rgba(225,29,72,0.4)]">
        {/* Flashing Skull Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-500 mx-auto flex items-center justify-center shadow-lg animate-pulse">
          <Skull size={36} />
        </div>

        <div className="space-y-1.5">
          <div className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Peringatan Malam Sekolah
          </div>
          <h2 className="text-3xl font-black text-white font-mono">
            GAME OVER
          </h2>
          <p className="text-sm text-rose-200/90 font-medium pt-1">
            {gameOverReason || 'Kamu tertangkap oleh Robot Pengawas Sekolah!'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="flex justify-between">
            <span>Total Soal PAI Terjawab:</span>
            <span className="font-bold text-emerald-400">{solvedQuestionIds.length} / 15</span>
          </div>
          <div className="flex justify-between">
            <span>Status Tim:</span>
            <span className="font-semibold text-rose-400">Terdeteksi Patroli</span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <RotateCcw size={18} />
          <span>ULANGI DARI LANTAI 4</span>
        </button>
      </div>
    </div>
  );
};
