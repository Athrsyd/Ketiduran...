/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { multiplayerSync } from '../../services/multiplayerSync';
import { sound } from '../../services/soundEngine';
import { requestGameFullscreen } from '../../utils/fullscreen';
import {
  Users,
  Copy,
  Check,
  Play,
  LogOut,
  Crown,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';

export const WaitingRoomScreen: React.FC = () => {
  const roomCode = useGameStore((s) => s.roomCode);
  const myName = useGameStore((s) => s.myName);
  const myColor = useGameStore((s) => s.myColor);
  const myGender = useGameStore((s) => s.myGender);
  const isHost = useGameStore((s) => s.isHost);
  const isReady = useGameStore((s) => s.isReady);
  const teammates = useGameStore((s) => s.teammates);
  const myId = useGameStore((s) => s.myId);
  const isSupabaseConnected = useGameStore((s) => s.isSupabaseConnected);
  const toggleReady = useGameStore((s) => s.toggleReady);
  const startMultiplayerGame = useGameStore((s) => s.startMultiplayerGame);
  const leaveWaitingRoom = useGameStore((s) => s.leaveWaitingRoom);

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    sound.playInteract();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    sound.playInteract();
    toggleReady();
    multiplayerSync.send({
      type: 'PLAYER_READY',
      senderId: myId,
      roomCode,
      payload: { isReady: !isReady },
      timestamp: Date.now(),
    });
  };

  const handleStartGame = () => {
    requestGameFullscreen();
    sound.playInteract();
    // Broadcast GAME_START to all connected players in the room
    multiplayerSync.send({
      type: 'GAME_START',
      senderId: myId,
      roomCode,
      timestamp: Date.now(),
    });
    // Start locally
    startMultiplayerGame(true);
  };

  const handleLeave = () => {
    sound.playInteract();
    multiplayerSync.disconnect();
    leaveWaitingRoom();
  };

  const teammateList = Object.values(teammates);
  const totalPlayers = 1 + teammateList.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 overflow-y-auto select-none">
      {/* Dark Eerie Foggy Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0%,rgba(2,6,23,0.98)_100%)] pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Users size={14} />
              <span>Ruang Tunggu Kelas SMK (Multiplayer)</span>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                isSupabaseConnected
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'
                }`}
              />
              <span>
                {isSupabaseConnected
                  ? 'Supabase Cloud: Terhubung'
                  : 'Sinkronisasi Realtime Aktif'}
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-md">
            Lobby Bersama
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Ajak temanmu bergabung dengan kode room di bawah. Pembuat room dapat memulai permainan saat teman sudah masuk!
          </p>
        </div>

        {/* Room Code Card with One-Click Copy */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Shield size={20} />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Kode Room Labirin:
              </div>
              <div className="text-2xl font-black tracking-widest text-emerald-400 font-mono">
                {roomCode}
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-400" />
                <span className="text-emerald-300">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Salin Kode Room</span>
              </>
            )}
          </button>
        </div>

        {/* Player List Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>DAFTAR SISWA ({totalPlayers} Bergabung)</span>
            <span className="text-slate-500">Mode: Map Labirin Bercabang</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Host / Self Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border-2 border-emerald-500/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md"
                  style={{ backgroundColor: myColor }}
                >
                  {myName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                    <span>{myName} (Kamu)</span>
                    {isHost && <Crown size={14} className="text-amber-400 fill-amber-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="text-emerald-400 font-medium">
                      {myGender === 'female' ? 'Siswi (Kerudung OSIS)' : 'Siswa (OSIS)'}
                    </span>
                    <span>•</span>
                    <span>{isHost ? 'Pembuat Room (Host)' : 'Pemain'}</span>
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Siap</span>
              </span>
            </div>

            {/* Teammates Cards */}
            {teammateList.map((tm) => (
              <div
                key={tm.id}
                className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md"
                    style={{ backgroundColor: tm.color }}
                  >
                    {tm.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                      <span>{tm.name}</span>
                      {tm.isHost && <Crown size={14} className="text-amber-400 fill-amber-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="text-sky-400 font-medium">
                        {tm.gender === 'female' ? 'Siswi' : 'Siswa'}
                      </span>
                      <span>•</span>
                      <span>{tm.isHost ? 'Pembuat Room' : 'Teman Sekelas'}</span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Online</span>
                </span>
              </div>
            ))}

            {/* Empty Slots */}
            {totalPlayers < 4 && (
              <div className="p-3.5 rounded-2xl bg-slate-950/30 border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs gap-2 py-4">
                <Clock size={16} className="animate-spin text-slate-600" />
                <span>Menunggu teman lain bergabung...</span>
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights for Multiplayer */}
        <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2.5">
          <Layers size={18} className="text-amber-400 flex-shrink-0" />
          <span>
            <b>Map Labirin Khusus PC:</b> Lantai 4 (Sayap Silang), Lantai 3 (Atrium Melingkar), Lantai 2 (Lorong Berliku), dan Lantai 1 (Halaman Megah 140m). Berbagilah tugas dengan teman untuk mencari 5 meja soal!
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleLeave}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Keluar ke Menu</span>
          </button>

          {isHost ? (
            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto flex-1 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-2xl transition active:scale-95 cursor-pointer shadow-emerald-500/20 animate-pulse hover:animate-none"
            >
              <Play size={18} className="fill-slate-950" />
              <span>Mulai Petualangan Labirin Bersama!</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto flex-1 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-medium text-center flex items-center justify-center gap-2">
              <Clock size={16} className="text-amber-400 animate-spin" />
              <span>Menunggu Pembuat Room (Host) memulai permainan...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
