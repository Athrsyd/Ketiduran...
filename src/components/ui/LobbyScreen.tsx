/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { multiplayerSync } from '../../services/multiplayerSync';
import { sound } from '../../services/soundEngine';
import { Moon, Users, User, Play, Sparkles, BookOpen, Smartphone, Laptop, ShieldAlert } from 'lucide-react';

const AVATAR_COLORS = [
  { label: 'Biru OSIS', value: '#38bdf8' },
  { label: 'Hijau Toska', value: '#10b981' },
  { label: 'Merah Marun', value: '#f43f5e' },
  { label: 'Kuning Kunyit', value: '#fbbf24' },
  { label: 'Ungu Elektrik', value: '#a855f7' },
];

export const LobbyScreen: React.FC = () => {
  const startSolo = useGameStore((s) => s.startSolo);
  const joinRoom = useGameStore((s) => s.joinRoom);

  const [name, setName] = useState<string>('Siswa SMK');
  const [selectedColor, setSelectedColor] = useState<string>('#38bdf8');
  const [playerMode, setPlayerMode] = useState<1 | 2 | 3>(1);
  const [roomCode, setRoomCode] = useState<string>('KELAS-11');

  const handleStart = () => {
    sound.playInteract();
    if (playerMode === 1) {
      startSolo(name, selectedColor);
    } else {
      joinRoom(roomCode, name, selectedColor, playerMode);
      multiplayerSync.init(roomCode.trim().toUpperCase() || 'KELAS-11');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 overflow-y-auto">
      {/* Background Decorative Eerie Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0%,rgba(2,6,23,0.95)_100%)] pointer-events-none" />

      <div className="relative w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider uppercase">
            <Moon size={14} />
            <span>Game 3D Edukatif PAI Kelas 11 SMK</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            "Ketiduran..."
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Kamu dan teman-teman ketiduran di ruang kelas Lantai 4 hingga larut malam. Selesaikan 15 teka-teki PAI SMK untuk membuka gerbang tangga, turun ke halaman, dan lolos dari kejaran Robot Pengawas!
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Player Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Nama Siswa:
            </label>
            <input
              type="text"
              value={name}
              maxLength={16}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama siswa..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold text-sm focus:outline-hidden focus:border-emerald-500 transition"
            />
          </div>

          {/* Avatar Backpack Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Warna Tas / Avatar:
            </label>
            <div className="flex items-center gap-3">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setSelectedColor(col.value)}
                  className={`w-9 h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                    selectedColor === col.value
                      ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col.value }}
                  title={col.label}
                />
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Mode Petualangan:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { count: 1, label: 'Solo (1 Siswa)', desc: 'Jelajah Sendiri' },
                { count: 2, label: 'Duo (2 Siswa)', desc: 'Kerjasama 2 Tab' },
                { count: 3, label: 'Trio (3 Siswa)', desc: 'Tim 3 Tab' },
              ].map((m) => (
                <button
                  key={m.count}
                  type="button"
                  onClick={() => setPlayerMode(m.count as any)}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    playerMode === m.count
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-bold">{m.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Room Code (if 2 or 3 players) */}
          {playerMode > 1 && (
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 animate-in fade-in">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Kode Room Tim:</span>
                <span className="text-[10px] text-emerald-400 lowercase font-normal">
                  (buka tab lain dengan kode sama untuk mabar)
                </span>
              </label>
              <input
                type="text"
                value={roomCode}
                maxLength={12}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="KELAS-11"
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 font-mono font-bold text-sm tracking-wider uppercase focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Controls Summary */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Laptop size={16} className="text-sky-400 flex-shrink-0" />
            <span><strong>Laptop:</strong> WASD jalan, Mouse tengok, [E]/Klik interaksi.</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-400 flex-shrink-0" />
            <span><strong>HP/Tablet:</strong> Virtual Joystick jalan, geser layar tengok, tombol aksi.</span>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Play size={20} className="fill-slate-950" />
          <span>MULAI PETUALANGAN MALAM HARI</span>
        </button>
      </div>
    </div>
  );
};
