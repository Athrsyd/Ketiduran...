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
  Cloud,
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
  // Only 2 modes: 'solo' or 'multiplayer' (Mobile users forced to 'solo')
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
      const finalCode = roomCode.trim().toUpperCase() || 'KELAS-11';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 overflow-y-auto select-none">
      {/* Background Decorative Eerie Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0%,rgba(2,6,23,0.95)_100%)] pointer-events-none" />

      <div className="relative w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider uppercase">
              <Moon size={14} />
              <span>Game 3D Edukatif PAI Kelas 11 SMK</span>
            </div>

            {/* Supabase Leaderboard Button */}
            <button
              type="button"
              onClick={() => {
                sound.playInteract();
                setIsLeaderboardOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition cursor-pointer shadow-sm"
              title="Lihat Papan Peringkat Siswa"
            >
              <Trophy size={14} className="text-amber-400" />
              <span>Papan Peringkat</span>
            </button>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            "Ketiduran..."
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Kamu ketiduran di ruang kelas SMK hingga larut malam. Selesaikan teka-teki PAI SMK untuk membuka gerbang tangga, turun ke halaman, dan lolos dari kejaran Robot Pengawas!
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Character Customization Box */}
        <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Kustomisasi Karakter Siswa</span>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/90 text-emerald-400 font-medium border border-slate-700/60">
              {gender === 'female' ? 'Siswi (Kerudung Putih OSIS)' : 'Siswa (Rambut Hitam Rapi)'}
            </span>
          </div>

          {/* Player Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nama Siswa:
            </label>
            <input
              type="text"
              value={name}
              maxLength={16}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan namamu..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-hidden focus:border-emerald-500 transition"
            />
          </div>

          {/* Gender / Skin Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pilihan Gender & Skin Seragam:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playInteract();
                  setGender('male');
                  if (name === 'Siswi SMK') setName('Siswa SMK');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  gender === 'male'
                    ? 'bg-sky-500/15 border-sky-400 text-white ring-1 ring-sky-400/50 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <User size={15} className={gender === 'male' ? 'text-sky-400' : 'text-slate-400'} />
                  <span>Laki-laki (Siswa)</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Rambut hitam rapi, kemeja OSIS putih, celana panjang abu-abu SMK.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playInteract();
                  setGender('female');
                  if (name === 'Siswa SMK') setName('Siswi SMK');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  gender === 'female'
                    ? 'bg-emerald-500/15 border-emerald-400 text-white ring-1 ring-emerald-400/50 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Sparkles size={15} className={gender === 'female' ? 'text-emerald-400' : 'text-slate-400'} />
                  <span>Perempuan (Siswi)</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Kerudung putih OSIS, kemeja panjang, rok panjang abu-abu SMK.
                </div>
              </button>
            </div>
          </div>

          {/* Backpack / Seragam Accent Color Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Warna Tas Ransel Profil:</span>
              <span className="text-[10px] text-slate-500">Tampil pada ransel model 3D</span>
            </label>
            <div className="flex items-center gap-2.5">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    sound.playInteract();
                    setSelectedColor(c.value);
                  }}
                  className={`w-9 h-9 rounded-xl transition flex items-center justify-center cursor-pointer ${
                    selectedColor === c.value
                      ? 'ring-2 ring-white scale-110 shadow-lg'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

          {/* Mode Selection: Exactly 2 Choices (Solo & Multiplayer) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Pilihan Mode Permainan:</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {isMobile ? 'Perangkat HP aktif' : 'PC / Komputer aktif'}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Solo Mode */}
              <button
                type="button"
                onClick={() => setGameMode('solo')}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  gameMode === 'solo'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <User size={16} className={gameMode === 'solo' ? 'text-emerald-400' : 'text-slate-400'} />
                  <span>Main Sendiri (Solo)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Jelajahi map sekolah sendiri. Optimal & sangat lancar untuk HP & PC.
                </div>
              </button>

              {/* Option 2: Multiplayer Mode (Disabled for mobile) */}
              <button
                type="button"
                onClick={() => {
                  if (!isMobile) {
                    setGameMode('multiplayer');
                  }
                }}
                disabled={isMobile}
                className={`p-3.5 rounded-2xl border text-left transition relative ${
                  isMobile
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                    : gameMode === 'multiplayer'
                    ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg shadow-sky-500/10 cursor-pointer'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Users size={16} className={gameMode === 'multiplayer' ? 'text-sky-400' : 'text-slate-400'} />
                    <span>Main dengan Teman</span>
                  </div>
                  {isMobile && <Lock size={14} className="text-amber-400" />}
                </div>

                <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {isMobile ? (
                    <span className="text-amber-400/90 font-medium">
                      Khusus PC/Laptop (Map Labirin Masif 4 Lantai)
                    </span>
                  ) : (
                    'Bekerjasama di Map Labirin luas dengan Ruang Tunggu bersama.'
                  )}
                </div>
              </button>
            </div>

            {/* Mobile Multiplayer Info Notice */}
            {isMobile && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed flex items-center gap-2">
                <Smartphone size={16} className="text-amber-400 flex-shrink-0" />
                <span>
                  Di HP kamu dapat memainkan <b>Mode Solo</b> dengan lancar 60 FPS. Mode Multiplayer memiliki Map Labirin masif yang dirancang untuk layar PC/Laptop.
                </span>
              </div>
            )}
          </div>

          {/* Multiplayer Options (Room Creation / Joining for PC) */}
          {!isMobile && gameMode === 'multiplayer' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <Users size={14} />
                <span>Pengaturan Room Bersama</span>
              </div>

              {/* Sub-tab: Buat Room vs Gabung Room */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMultiplayerAction('create')}
                  className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    multiplayerAction === 'create'
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PlusCircle size={14} />
                  <span>Buat Room Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMultiplayerAction('join')}
                  className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    multiplayerAction === 'join'
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn size={14} />
                  <span>Gabung Room Teman</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {multiplayerAction === 'create' ? 'Kode Room Baru Kamu:' : 'Masukkan Kode Room Teman:'}
                </label>
                <input
                  type="text"
                  value={roomCode}
                  maxLength={12}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="SMK-84"
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 font-mono font-bold text-sm tracking-widest uppercase focus:outline-hidden focus:border-sky-500"
                />
                <p className="text-[10px] text-slate-500">
                  {multiplayerAction === 'create'
                    ? 'Setelah membuat room, kamu akan masuk ke Ruang Tunggu dan bisa menunggu teman siap.'
                    : 'Masukkan kode yang diberikan temanmu untuk masuk ke Ruang Tunggu mereka.'}
                </p>
              </div>
            </div>
          )}

          {/* Quality Mode Setting */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Gauge size={16} className="text-amber-400" />
              <span>Mode Grafis:</span>
              <span className={`font-bold ${graphicsQuality === 'mobile' ? 'text-emerald-400' : 'text-sky-400'}`}>
                {graphicsQuality === 'mobile' ? 'Performa HP (Smooth 60 FPS)' : 'Kualitas Tinggi (PC)'}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleGraphicsQuality}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 transition cursor-pointer"
            >
              Ubah
            </button>
          </div>
        </div>

        {/* Controls Summary */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Laptop size={16} className="text-sky-400 flex-shrink-0" />
            <span><strong>PC/Laptop:</strong> WASD jalan, Mouse tengok, [E]/Klik interaksi, [H] petunjuk.</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-400 flex-shrink-0" />
            <span><strong>HP:</strong> Joystick jalan, usap layar tengok, tombol Aksi, tombol Petunjuk.</span>
          </div>
        </div>

        {/* Start Button & Secondary Options */}
        <div className="space-y-2.5">
          <button
            onClick={handleStart}
            className={`w-full py-3.5 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 ${
              gameMode === 'multiplayer' && !isMobile
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/25'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
            }`}
          >
            <Play size={20} className="fill-slate-950" />
            <span>
              {gameMode === 'multiplayer' && !isMobile
                ? multiplayerAction === 'create'
                  ? 'BUAT ROOM & MASUK RUANG TUNGGU'
                  : 'GABUNG KE RUANG TUNGGU TEMAN'
                : 'MULAI MAIN (MODE SOLO)'}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Watch Cutscene Button */}
            <button
              type="button"
              onClick={handlePlayCutscene}
              className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Film size={15} />
              <span>Tonton Intro Cutscene</span>
            </button>

            {/* Dedicated Map Test Route Button */}
            <button
              type="button"
              onClick={handleOpenMapViewer}
              className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Layers size={15} />
              <span>Test & Preview Map</span>
            </button>
          </div>
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
