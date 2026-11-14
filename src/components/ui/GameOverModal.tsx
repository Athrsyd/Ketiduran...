/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { sound } from '../../services/soundEngine';
import { multiplayerSync } from '../../services/multiplayerSync';
import { Skull, RotateCcw } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-rose-950/85 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[95vh] overflow-y-auto bg-slate-950 border-2 border-rose-600/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-[0_0_45px_rgba(225,29,72,0.35)] pointer-events-auto">
        {/* Flashing Skull Icon - Compact */}
        <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-500 mx-auto flex items-center justify-center shadow-lg animate-pulse">
          <Skull size={24} className="sm:hidden" />
          <Skull size={34} className="hidden sm:block" />
        </div>

        <div className="space-y-1">
          <div className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-rose-400">
            Peringatan Malam Sekolah
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white font-mono leading-tight">
            GAME OVER
          </h2>
          <p className="text-[11px] sm:text-xs text-rose-200/90 font-medium leading-snug">
            {gameOverReason || 'Kamu tertangkap oleh Robot Pengawas Sekolah!'}
          </p>
        </div>

        <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 text-[11px] sm:text-xs text-slate-300 space-y-1 sm:space-y-1.5">
          <div className="flex justify-between items-center">
            <span>Total Soal PAI Terjawab:</span>
            <span className="font-bold text-emerald-400">{solvedQuestionIds.length} / 15</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Status Tim:</span>
            <span className="font-semibold text-rose-400">Terdeteksi Patroli</span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/25 flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer touch-manipulation"
        >
          <RotateCcw size={16} />
          <span>ULANGI DARI LANTAI 4</span>
        </button>
      </div>
    </div>
  );
};
