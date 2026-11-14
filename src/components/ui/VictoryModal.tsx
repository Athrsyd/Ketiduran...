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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="relative w-full max-w-md bg-slate-950 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-[0_0_60px_rgba(16,185,129,0.4)]">
        {/* Trophy Icon */}
        <div className="w-18 h-18 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center shadow-lg animate-bounce">
          <Trophy size={42} />
        </div>

        <div className="space-y-1.5">
          <div className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            Misi Berhasil - Selamat!
          </div>
          <h2 className="text-3xl font-black text-white font-mono">
            TIM LOLOS & MENANG!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Kalian berhasil membuka semua gerbang lantai sekolah, menyelesaikan seluruh 15 teka-teki PAI Kelas 11 SMK, dan keluar melewati Gerbang Utama tanpa tertangkap!
          </p>
        </div>

        {/* Stats card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm space-y-2.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Total Soal PAI Terselesaikan:</span>
            </span>
            <span className="font-bold text-emerald-400">15 / 15 (100%)</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Award size={16} className="text-amber-400" />
              <span>Predikat Kompetensi PAI:</span>
            </span>
            <span className="font-bold text-amber-300">Siswa Teladan Unggul</span>
          </div>

          {/* Supabase status indicator */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Cloud size={13} className="text-sky-400" />
              <span>Supabase Database:</span>
            </span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Check size={12} />
              <span>{savedStatus.isCloud ? 'Tersimpan di Cloud' : 'Tersimpan di Sinkron'}</span>
            </span>
          </div>
        </div>

        <button
          onClick={handlePlayAgain}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <RotateCcw size={18} />
          <span>MAIN LAGI BERSAMA TEMAN</span>
        </button>
      </div>
    </div>
  );
};
