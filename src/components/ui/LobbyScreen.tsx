/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { multiplayerSync } from '../../services/multiplayerSync';
import { sound } from '../../services/soundEngine';
import { isMobileDevice, requestGameFullscreen } from '../../utils/fullscreen';
import {
  Moon,
  Users,
  User,
  Play,
  Smartphone,
  Laptop,
  Layers,
  Film,
  Gauge,
  Sparkles,
  Lock,
  PlusCircle,
  LogIn,
  Trophy,
  Shield,
  BookOpen,
  Key,
  Flame,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';
import { LeaderboardModal } from './LeaderboardModal';

const AVATAR_COLORS = [
  { label: 'Biru OSIS', value: '#38bdf8' },
  { label: 'Hijau Toska', value: '#10b981' },
  { label: 'Merah Marun', value: '#f43f5e' },
  { label: 'Kuning Kunyit', value: '#fbbf24' },
  { label: 'Ungu Elektrik', value: '#a855f7' },
];

export const LobbyScreen: React.FC = () => {
  const startSolo = useGameStore((s) => s.startSolo);
  const createWaitingRoom = useGameStore((s) => s.createWaitingRoom);
  const joinWaitingRoom = useGameStore((s) => s.joinWaitingRoom);
  const setMapViewer = useGameStore((s) => s.setMapViewer);
  const playCutsceneStandalone = useGameStore((s) => s.playCutsceneStandalone);
  const graphicsQuality = useGameStore((s) => s.graphicsQuality);
  const toggleGraphicsQuality = useGameStore((s) => s.toggleGraphicsQuality);
  const isSupabaseConnected = useGameStore((s) => s.isSupabaseConnected);

  const isMobile = typeof window !== 'undefined' && isMobileDevice();

  const [name, setName] = useState<string>('Siswa SMK');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedColor, setSelectedColor] = useState<string>('#38bdf8');
  // 2 modes: 'solo' or 'multiplayer' (Mobile users forced to 'solo')
  const [gameMode, setGameMode] = useState<'solo' | 'multiplayer'>('solo');
  const [multiplayerAction, setMultiplayerAction] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState<string>('SMK-' + Math.floor(10 + Math.random() * 90));
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  const handleStart = () => {
    requestGameFullscreen();
    sound.playInteract();

    if (gameMode === 'solo' || isMobile) {
      startSolo(name, selectedColor, gender);
    } else {
      // Multiplayer flow: enter Waiting Room
      const finalCode = roomCode.trim().toUpperCase() || 'SMK-11';
      if (multiplayerAction === 'create') {
        createWaitingRoom(finalCode, name, selectedColor, gender);
      } else {
        joinWaitingRoom(finalCode, name, selectedColor, gender);
      }
      multiplayerSync.init(finalCode);
    }
  };

  const handleOpenMapViewer = () => {
    requestGameFullscreen();
    sound.playInteract();
    setMapViewer(true);
  };

  const handlePlayCutscene = () => {
    requestGameFullscreen();
    playCutsceneStandalone();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 select-none">
      {/* Immersive Dark Night Atmosphere with Eerie Spotlight Gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.6)_0%,rgba(2,6,23,0.98)_100%)] pointer-events-none" />

      {/* Main Content Scroll Wrapper (Centers vertically when enough space, never clips top or bottom) */}
      <div className="min-h-full w-full flex flex-col justify-center items-center py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl my-auto space-y-4">

          {/* Top Status & Atmospheric Info Bar */}
          <header className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
                <Clock size={13} className="text-amber-400" />
                <span>00:15 WIB</span>
                <span className="text-slate-600">|</span>
                <span className="text-rose-400 uppercase tracking-wider text-[11px] font-sans">
                  Gedung Terkunci & Lampu Padam
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Supabase status badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isSupabaseConnected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'
                  }`}
                />
                <span>{isSupabaseConnected ? 'Cloud Online' : 'Lokal Siap'}</span>
              </div>

              {/* Leaderboard Shortcut Button */}
              <button
                type="button"
                onClick={() => {
                  sound.playInteract();
                  setIsLeaderboardOpen(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                title="Lihat Papan Peringkat Siswa"
              >
                <Trophy size={13} className="text-amber-400" />
                <span>Peringkat</span>
              </button>
            </div>
          </header>

          {/* Main 2-Column Responsive Dashboard Layout */}
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">

            {/* ========================================================
                LEFT COLUMN (LORE, ATMOSPHERE & MISSION BRIEFING)
                ======================================================== */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-md space-y-4">
              <div className="space-y-4">
                {/* School Header Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-[11px] font-bold tracking-wider uppercase">
                  <Moon size={13} />
                  <span>SMKN SIJA • Edu-Game PAI Kelas 11</span>
                </div>

                {/* Game Title with Eerie Glow */}
                <div className="space-y-1">
                  <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white font-mono drop-shadow-[0_4px_16px_rgba(56,189,248,0.25)]">
                    "Ketiduran..."
                  </h1>
                  <p className="text-xs font-bold text-emerald-400 tracking-wide uppercase">
                    Misteri Terjebak di Gedung Sekolah Tengah Malam
                  </p>
                </div>

                {/* Narrative Lore Hook */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-1.5 shadow-inner">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                    <Flame size={13} />
                    <span>Latar Belakang Misi:</span>
                  </div>
                  <p className="text-slate-400 text-[11.5px] leading-relaxed">
                    Kamu ketiduran di ruang kelas saat mengerjakan tugas praktik hingga larut malam. Saat terbangun, gerbang utama terkunci rantai dan Robot Pengawas berpatroli dalam kegelapan.
                  </p>
                </div>

                {/* 3 Step Mission Guide */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass size={13} className="text-sky-400" />
                    <span>Objektif Pelarianmu:</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-300">
                      <div className="p-1 rounded-md bg-sky-500/20 text-sky-400 mt-0.5">
                        <BookOpen size={12} />
                      </div>
                      <div>
                        <strong className="text-sky-300">1. Meja Soal PAI:</strong> Jawab 5 soal di meja kelas untuk membuka Kunci Tangga.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-300">
                      <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 mt-0.5">
                        <Key size={12} />
                      </div>
                      <div>
                        <strong className="text-emerald-300">2. Turun Lantai:</strong> Buka gerbang tangga & kumpul di lingkaran hijau bersama teman.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-300">
                      <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 mt-0.5">
                        <Shield size={12} />
                      </div>
                      <div>
                        <strong className="text-amber-300">3. Lantai 1 & Kabur:</strong> Hindari Robot Pengawas, ambil Master Key di Pos Satpam, lalu kabur!
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Feature Quick Links */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePlayCutscene}
                  className="py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
                >
                  <Film size={14} />
                  <span>Intro Cutscene</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenMapViewer}
                  className="py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
                >
                  <Layers size={14} />
                  <span>Preview Map 3D</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                RIGHT COLUMN (STUDENT ID, MODE & LAUNCH CONTROL)
                ======================================================== */}
            <div className="lg:col-span-7 flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-md space-y-4">
              
              <div className="space-y-4">
                {/* Character Customization Box (Styled as Student Card) */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-inner space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Kartu Pelajar & Seragam Siswa</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                      ID: SIJA-2026-X11
                    </span>
                  </div>

                  {/* Player Name Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Nama Siswa:
                    </label>
                    <input
                      type="text"
                      value={name}
                      maxLength={18}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama siswa..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm font-medium focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>

                  {/* Gender / Skin Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Pilihan Gender & Skin Model 3D:</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Male / Siswa */}
                      <button
                        type="button"
                        onClick={() => {
                          sound.playInteract();
                          setGender('male');
                          if (name === 'Siswi SMK') setName('Siswa SMK');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                          gender === 'male'
                            ? 'bg-sky-500/15 border-sky-400 text-white ring-1 ring-sky-400/50 shadow-md'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                            <User size={14} className={gender === 'male' ? 'text-sky-400' : 'text-slate-400'} />
                            <span>Siswa (Laki-laki)</span>
                          </div>
                          {gender === 'male' && <CheckCircle2 size={13} className="text-sky-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                          Kemeja putih OSIS, dasi, celana abu-abu SMK, rambut hitam rapi.
                        </div>
                      </button>

                      {/* Female / Siswi */}
                      <button
                        type="button"
                        onClick={() => {
                          sound.playInteract();
                          setGender('female');
                          if (name === 'Siswa SMK') setName('Siswi SMK');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                          gender === 'female'
                            ? 'bg-emerald-500/15 border-emerald-400 text-white ring-1 ring-emerald-400/50 shadow-md'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                            <Sparkles size={14} className={gender === 'female' ? 'text-emerald-400' : 'text-slate-400'} />
                            <span>Siswi (Perempuan)</span>
                          </div>
                          {gender === 'female' && <CheckCircle2 size={13} className="text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                          Kerudung putih OSIS berwajah terbuka, kemeja & rok panjang SMK.
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Backpack Accent Color Selection */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Warna Tas Ransel:
                    </span>
                    <div className="flex items-center gap-2">
                      {AVATAR_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            sound.playInteract();
                            setSelectedColor(c.value);
                          }}
                          className={`w-7 h-7 rounded-lg transition flex items-center justify-center cursor-pointer ${
                            selectedColor === c.value
                              ? 'ring-2 ring-white scale-110 shadow-md'
                              : 'opacity-65 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Game Mode Selection (Solo vs Multiplayer) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Mode Permainan:
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {isMobile ? 'Perangkat: Mobile / HP' : 'Perangkat: PC / Laptop'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option 1: Solo */}
                    <button
                      type="button"
                      onClick={() => setGameMode('solo')}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        gameMode === 'solo'
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <User size={15} className={gameMode === 'solo' ? 'text-emerald-400' : 'text-slate-400'} />
                        <span>Mode Solo (Sendiri)</span>
                      </div>
                      <div className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                        Jelajah mandiri. Sangat lancar 60 FPS untuk HP & PC.
                      </div>
                    </button>

                    {/* Option 2: Multiplayer */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!isMobile) setGameMode('multiplayer');
                      }}
                      disabled={isMobile}
                      className={`p-3 rounded-2xl border text-left transition relative ${
                        isMobile
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                          : gameMode === 'multiplayer'
                          ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10 ring-1 ring-sky-500/40 cursor-pointer'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                          <Users size={15} className={gameMode === 'multiplayer' ? 'text-sky-400' : 'text-slate-400'} />
                          <span>Mabar (Teman)</span>
                        </div>
                        {isMobile && <Lock size={13} className="text-amber-400" />}
                      </div>
                      <div className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                        {isMobile ? (
                          <span className="text-amber-400/90 font-medium">Khusus PC/Laptop (Map Labirin 4 Lantai)</span>
                        ) : (
                          'Bekerjasama di Map Labirin masif dengan Ruang Tunggu.'
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Multiplayer Options Panel (PC only) */}
                {!isMobile && gameMode === 'multiplayer' && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-sky-500/35 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={13} />
                        <span>Koneksi Ruang Tunggu (Lobby)</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setMultiplayerAction('create')}
                        className={`py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          multiplayerAction === 'create'
                            ? 'bg-sky-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <PlusCircle size={13} />
                        <span>Buat Room Baru</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMultiplayerAction('join')}
                        className={`py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          multiplayerAction === 'join'
                            ? 'bg-sky-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <LogIn size={13} />
                        <span>Gabung Room Teman</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={roomCode}
                        maxLength={12}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="SMK-84"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 font-mono font-bold text-sm tracking-widest uppercase focus:outline-hidden focus:border-sky-500"
                      />
                    </div>
                  </div>
                )}

                {/* Quality & Controls Compact Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Gauge size={14} className="text-amber-400" />
                    <span>Mode Grafis:</span>
                    <strong className={graphicsQuality === 'mobile' ? 'text-emerald-400' : 'text-sky-400'}>
                      {graphicsQuality === 'mobile' ? 'Ringan 60 FPS (HP)' : 'Kualitas Tinggi (PC)'}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleGraphicsQuality}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10.5px] font-bold text-slate-300 transition cursor-pointer"
                    >
                      Ubah
                    </button>
                  </div>
                </div>
              </div>

              {/* High-Impact Launch Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStart}
                  className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base tracking-wide shadow-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 ${
                    gameMode === 'multiplayer' && !isMobile
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                  }`}
                >
                  <Play size={18} className="fill-slate-950" />
                  <span>
                    {gameMode === 'multiplayer' && !isMobile
                      ? multiplayerAction === 'create'
                        ? 'BUAT ROOM & MASUK RUANG TUNGGU'
                        : 'GABUNG KE RUANG TUNGGU TEMAN'
                      : 'MASUK KE GEDUNG SEKOLAH (SOLO)'}
                  </span>
                </button>
              </div>

            </div>
          </main>

        </div>
      </div>

      {/* Supabase Cloud Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
};
