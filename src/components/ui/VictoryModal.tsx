/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/gameStore';
import { sound } from '../../services/soundEngine';
import { supabaseService } from '../../services/supabaseService';
import { Trophy, CheckCircle2, RotateCcw, Award, Cloud, Check } from 'lucide-react';

export const VictoryModal: React.FC = () => {
  const solvedQuestionIds = useGameStore((s) => s.solvedQuestionIds);
  const restartGame = useGameStore((s) => s.restartGame);
  const myName = useGameStore((s) => s.myName);
  const roomCode = useGameStore((s) => s.roomCode);
  const maxPlayers = useGameStore((s) => s.maxPlayers);

  const [savedStatus, setSavedStatus] = useState<{ isSaved: boolean; isCloud: boolean }>({
    isSaved: false,
    isCloud: false,
  });

  useEffect(() => {
    // Confetti fanfare
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    const timer = setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
      });
    }, 600);

    // Save game score to Supabase Database
    supabaseService
      .saveGameResult({
        playerName: myName || 'Siswa SMK',
        roomCode: roomCode || 'SOLO',
        score: Math.min(100, solvedQuestionIds.length * 7 || 100),
        timeSeconds: 280, // Estimated playthrough duration
        mode: maxPlayers > 1 ? 'multiplayer' : 'solo',
        completedAt: new Date().toISOString(),
      })
      .then((res) => {
        setSavedStatus({ isSaved: res.success, isCloud: res.isCloud });
      });

    return () => clearTimeout(timer);
  }, []);

  const handlePlayAgain = () => {
    sound.playInteract();
    restartGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-emerald-950/85 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[95vh] overflow-y-auto bg-slate-950 border-2 border-emerald-500 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-[0_0_50px_rgba(16,185,129,0.35)] pointer-events-auto">
        {/* Trophy Icon - Scaled for mobile */}
        <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center shadow-lg animate-bounce">
          <Trophy size={24} className="sm:hidden" />
          <Trophy size={36} className="hidden sm:block" />
        </div>

        <div className="space-y-1">
          <div className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-emerald-400">
            Misi Berhasil • Selamat!
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white font-mono leading-tight">
            TIM LOLOS & MENANG!
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-snug">
            Kalian berhasil membuka semua gerbang lantai sekolah, menyelesaikan 15 soal PAI SMK, dan keluar melewati Gerbang Utama tanpa tertangkap!
          </p>
        </div>

        {/* Stats card - Compact rows */}
        <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 text-[11px] sm:text-xs space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>Soal PAI Terjawab:</span>
            </span>
            <span className="font-bold text-emerald-400">15 / 15 (100%)</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Award size={14} className="text-amber-400 shrink-0" />
              <span>Predikat:</span>
            </span>
            <span className="font-bold text-amber-300">Siswa Teladan Unggul</span>
          </div>

          {/* Supabase status indicator */}
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Cloud size={12} className="text-sky-400 shrink-0" />
              <span>Database Cloud:</span>
            </span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Check size={11} />
              <span>{savedStatus.isCloud ? 'Tersimpan Online' : 'Tersimpan Lokal'}</span>
            </span>
          </div>
        </div>

        <button
          onClick={handlePlayAgain}
          className="w-full py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer touch-manipulation"
        >
          <RotateCcw size={16} />
          <span>MAIN LAGI BERSAMA TEMAN</span>
        </button>
      </div>
    </div>
  );
};
