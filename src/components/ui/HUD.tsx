/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PAI_QUESTIONS } from '../../data/questions';
import { requestGameFullscreen, exitGameFullscreen } from '../../utils/fullscreen';
import {
  Key,
  Flashlight,
  Volume2,
  VolumeX,
  Users,
  DoorOpen,
  ShieldAlert,
  Maximize,
  Minimize,
  Gauge,
  Lightbulb,
} from 'lucide-react';

export const HUD: React.FC = () => {
  const isMapViewer = useGameStore((s) => s.isMapViewer);
  const currentFloor = useGameStore((s) => s.currentFloor);
  const toggleHint = useGameStore((s) => s.toggleHint);
  const graphicsQuality = useGameStore((s) => s.graphicsQuality);
  const toggleGraphicsQuality = useGameStore((s) => s.toggleGraphicsQuality);
  const solvedQuestionIds = useGameStore((s) => s.solvedQuestionIds);
  const hasStairKey = useGameStore((s) => s.hasStairKey);
  const isGateUnlocked = useGameStore((s) => s.isGateUnlocked);
  const hasMasterKey = useGameStore((s) => s.hasMasterKey);
  const isExitGateUnlocked = useGameStore((s) => s.isExitGateUnlocked);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);
  const flashlightOn = useGameStore((s) => s.flashlightOn);
  const toggleFlashlight = useGameStore((s) => s.toggleFlashlight);
  const isMuted = useGameStore((s) => s.isMuted);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const myName = useGameStore((s) => s.myName);
  const myColor = useGameStore((s) => s.myColor);
  const myIsInGatheringZone = useGameStore((s) => s.myIsInGatheringZone);
  const teammates = useGameStore((s) => s.teammates);
  const roomCode = useGameStore((s) => s.roomCode);
  const robotState = useGameStore((s) => s.robotState);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement
        )
      );
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (isFullscreen) {
      exitGameFullscreen();
    } else {
      requestGameFullscreen();
    }
  };

  // Solved count on current floor
  const floorQuestions = useMemo(() => {
    return PAI_QUESTIONS.filter((q) => q.floor === currentFloor);
  }, [currentFloor]);

  const solvedOnFloor = floorQuestions.filter((q) =>
    solvedQuestionIds.includes(q.id)
  ).length;

  // Gathering Zone status
  const teammatesOnFloor = Object.values(teammates).filter((tm) => tm.currentFloor === currentFloor);
  const totalActivePlayers = teammatesOnFloor.length + 1;
  const playersInZoneCount = (myIsInGatheringZone ? 1 : 0) +
    teammatesOnFloor.filter((tm) => tm.isInGatheringZone).length;

  const showGatheringIndicator =
    !isMapViewer &&
    ((currentFloor > 1 && isGateUnlocked) ||
      (currentFloor === 1 && isExitGateUnlocked));

  // If map viewer is active, don't show the standard HUD to prevent clutter
  if (isMapViewer) {
    return (
      <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-3 sm:p-5">
        {/* Center Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-white/60 bg-white/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-40 flex flex-col justify-between p-3 sm:p-5">
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Floor & Objective Badge */}
        <div className="space-y-1.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs sm:text-sm font-bold text-white shadow-lg flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              {currentFloor > 1 ? `Lantai ${currentFloor}` : 'Lantai 1 & Halaman Luas'}
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] sm:text-xs font-semibold text-slate-300">
              Room: {roomCode}
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xs text-xs sm:text-sm max-w-xs shadow-lg">
            {currentFloor > 1 ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-medium">Soal PAI Lantai {currentFloor}:</span>
                  <span className="font-bold text-emerald-400">
                    {solvedOnFloor} / 5
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(solvedOnFloor / 5) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 pt-0.5">
                  {solvedOnFloor < 5 ? (
                    'Cari 5 meja soal di ruang-ruang kelas.'
                  ) : !hasStairKey && !isGateUnlocked ? (
                    <span className="text-amber-400 font-semibold animate-pulse">
                      ★ Kunci tangga muncul di koridor tengah! Ambil kuncinya.
                    </span>
                  ) : !isGateUnlocked ? (
                    <span className="text-amber-300 font-semibold">
                      Gunakan kunci untuk membuka pintu gerbang tangga di ujung koridor.
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">
                      Gerbang terbuka! Masuk ke Zona Hijau Tangga.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-slate-200">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert size={14} />
                  <span>Tahap Akhir (Halaman 96m x 96m)</span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-300 leading-snug">
                  {!hasMasterKey ? (
                    'Cari Kunci Gerbang Utama di Pos Satpam halaman sekolah.'
                  ) : !isExitGateUnlocked ? (
                    <span className="text-amber-300 font-semibold">
                      Bawa Kunci ke Gerbang Utama Sekolah di ujung halaman!
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">
                      Gerbang Utama terbuka! Kumpul di gerbang untuk lolos!
                    </span>
                  )}
                </div>
                {robotState.isChasing && (
                  <div className="text-[11px] font-bold text-rose-400 animate-pulse flex items-center gap-1">
                    <span>⚠ WASPADA: ROBOT PENGAWAS MENGEJAR!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Key Status & Quick Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto relative z-40 touch-manipulation">
          {/* Mission Objective Hint Button */}
          <button
            onClick={toggleHint}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-400/60 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer touch-manipulation animate-pulse hover:animate-none"
            title="Buka Petunjuk Misi (H)"
          >
            <Lightbulb size={16} className="text-amber-400 fill-amber-400/30" />
            <span>Petunjuk</span>
            <span className="hidden sm:inline-block px-1 py-0.2 rounded bg-amber-500/30 text-[10px] font-mono">
              H
            </span>
          </button>

          {/* Key Inventory Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-lg ${
              (currentFloor > 1 && (hasStairKey || isGateUnlocked)) ||
              (currentFloor === 1 && (hasMasterKey || isExitGateUnlocked))
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500'
            }`}
          >
            <Key size={16} className={hasStairKey || hasMasterKey ? 'text-amber-400 animate-bounce' : ''} />
            <span>
              {currentFloor > 1
                ? hasStairKey || isGateUnlocked
                  ? 'Kunci Tangga'
                  : 'Belum Ada Kunci'
                : hasMasterKey || isExitGateUnlocked
                ? 'Kunci Gerbang'
                : 'Cari Kunci Pos'}
            </span>
          </div>

          {/* Flashlight Button */}
          <button
            onClick={toggleFlashlight}
            className={`p-2 rounded-xl border transition shadow-lg cursor-pointer touch-manipulation ${
              flashlightOn
                ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Senter (F)"
          >
            <Flashlight size={18} />
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition shadow-lg cursor-pointer touch-manipulation ${
              !isMuted
                ? 'bg-slate-900/80 border-slate-800 text-emerald-400'
                : 'bg-rose-500/20 border-rose-400/50 text-rose-300'
            }`}
            title="Suara Game"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Graphics Quality Toggle Button */}
          <button
            onClick={toggleGraphicsQuality}
            className={`p-2 rounded-xl border transition shadow-lg cursor-pointer touch-manipulation ${
              graphicsQuality === 'mobile'
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-sky-500/20 border-sky-400/50 text-sky-300'
            }`}
            title={graphicsQuality === 'mobile' ? 'Mode Performa HP (60 FPS)' : 'Mode Grafis Tinggi (PC)'}
          >
            <Gauge size={18} />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl border bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white transition shadow-lg cursor-pointer touch-manipulation"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Fullscreen)'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Middle Banner: MANDATORY GATHERING ZONE INDICATOR */}
      {showGatheringIndicator && (
        <div className="mx-auto my-2 pointer-events-auto animate-in slide-in-from-top duration-300">
          <div
            className={`px-4 py-2.5 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-md ${
              playersInZoneCount >= totalActivePlayers
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : 'bg-amber-950/90 border-amber-500 text-amber-200'
            }`}
          >
            <DoorOpen size={20} className={playersInZoneCount >= totalActivePlayers ? 'text-emerald-400' : 'text-amber-400'} />
            <div className="text-xs sm:text-sm font-bold">
              {playersInZoneCount >= totalActivePlayers ? (
                <span>Semua siswa telah berkumpul! Berpindah lantai...</span>
              ) : (
                <span>
                  Menunggu teman di pintu tangga ({playersInZoneCount}/{totalActivePlayers} pemain)...
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Center Screen: Baldi's Basics Crosshair with Proximity prompt */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex flex-col items-center">
          {/* Crosshair Dot & Ring */}
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
              nearbyInteractable
                ? 'scale-150 border-amber-400 bg-amber-400/40 shadow-lg shadow-amber-400/50'
                : 'border-white/60 bg-white/20'
            }`}
          />

          {/* Desktop Interaction Prompt */}
          {nearbyInteractable && (
            <div className="hidden sm:flex mt-4 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-xl items-center gap-1.5 animate-in fade-in">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-[10px]">
                E / KLIK
              </span>
              <span>{nearbyInteractable.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Teammates / Player Name List (Centered horizontally to prevent overlap with bottom-left analog joystick) */}
      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 pointer-events-auto z-40 max-w-[85vw] overflow-x-auto">
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/85 border border-slate-800/80 shadow-2xl backdrop-blur-md text-[11px] sm:text-xs whitespace-nowrap">
          <Users size={14} className="text-slate-400 ml-1 shrink-0" />
          {/* Self */}
          <span
            className="px-2 py-0.5 rounded-md font-semibold text-slate-200 flex items-center gap-1 shrink-0"
            style={{ borderLeft: `3px solid ${myColor}` }}
          >
            <span>{myName} (Kamu)</span>
            {myIsInGatheringZone && <span className="text-[10px] text-emerald-400">★</span>}
          </span>

          {/* Others */}
          {Object.values(teammates).map((tm) => (
            <span
              key={tm.id}
              className="px-2 py-0.5 rounded-md font-medium text-slate-300 flex items-center gap-1 shrink-0"
              style={{ borderLeft: `3px solid ${tm.color || '#f43f5e'}` }}
            >
              <span>{tm.name}</span>
              {tm.isInGatheringZone && <span className="text-[10px] text-emerald-400">★</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
