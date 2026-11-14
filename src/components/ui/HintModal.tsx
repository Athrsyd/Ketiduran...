/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PAI_QUESTIONS } from '../../data/questions';
import { getMasterKeySpawn } from '../../data/floor1Spawns';
import {
  Lightbulb,
  X,
  CheckCircle2,
  Circle,
  Key,
  DoorOpen,
  ShieldAlert,
  HelpCircle,
  Compass,
  Gamepad2,
  Smartphone,
  Laptop,
} from 'lucide-react';

export const HintModal: React.FC = () => {
  const currentFloor = useGameStore((s) => s.currentFloor);
  const solvedQuestionIds = useGameStore((s) => s.solvedQuestionIds);
  const hasStairKey = useGameStore((s) => s.hasStairKey);
  const isGateUnlocked = useGameStore((s) => s.isGateUnlocked);
  const hasMasterKey = useGameStore((s) => s.hasMasterKey);
  const masterKeySpawnIndex = useGameStore((s) => s.masterKeySpawnIndex);
  const maxPlayers = useGameStore((s) => s.maxPlayers);
  const isExitGateUnlocked = useGameStore((s) => s.isExitGateUnlocked);
  const closeHint = useGameStore((s) => s.closeHint);

  // Questions on this floor
  const floorQuestions = useMemo(() => {
    return PAI_QUESTIONS.filter((q) => q.floor === currentFloor);
  }, [currentFloor]);

  const solvedCount = floorQuestions.filter((q) =>
    solvedQuestionIds.includes(q.id)
  ).length;

  const allQuestionsSolved = solvedCount >= 5;

  // 5 classrooms with question desks info
  const classroomLocations = [
    { name: 'XI RPL 1 (Software)', side: 'Sebelah Barat (Kiri)', z: 'Z: +7.8m' },
    { name: 'XI TKJ 1 (Jaringan)', side: 'Sebelah Timur (Kanan)', z: 'Z: +7.8m' },
    { name: 'XI TKJ 2 (Hardware)', side: 'Sebelah Timur (Kanan)', z: 'Z: -12.2m' },
    { name: 'XI MM 1 (Multimedia)', side: 'Sebelah Barat (Kiri)', z: 'Z: -32.2m' },
    { name: 'Lab Komputer SIJA', side: 'Sebelah Barat (Kiri)', z: 'Z: -52.2m' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
              <Lightbulb size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Panduan & Petunjuk Misi</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-mono text-emerald-400 font-bold">
                  {currentFloor > 1 ? `Lantai ${currentFloor}` : 'Lantai 1 / Halaman'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ikuti langkah-langkah di bawah untuk menyelesaikan misi lantai ini.
              </p>
            </div>
          </div>

          <button
            onClick={closeHint}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Tutup (Esc / H)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* LANTAI 4, 3, 2 OBJECTIVES */}
          {currentFloor > 1 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Compass size={14} className="text-amber-400" />
                <span>Tahapan Misi Lantai {currentFloor}</span>
              </div>

              {/* Step 1: Solve 5 Questions */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border transition ${
                  allQuestionsSolved
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {allQuestionsSolved ? (
                      <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>1. Selesaikan 5 Soal PAI di Ruang Kelas</span>
                        <span
                          className={`text-xs px-2 py-0.2 rounded-full font-bold ${
                            allQuestionsSolved
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {solvedCount} / 5 Selesai
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Masuki ruang kelas di sepanjang lorong. Dekati meja guru/soal yang memiliki suar cahaya untuk membuka soal PAI.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5 Rooms Location List */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  {classroomLocations.map((loc, idx) => {
                    const q = floorQuestions[idx];
                    const isSolved = q ? solvedQuestionIds.includes(q.id) : false;
                    return (
                      <div
                        key={loc.name}
                        className={`flex items-center justify-between p-2 rounded-xl text-[11px] ${
                          isSolved
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSolved ? (
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          ) : (
                            <HelpCircle size={14} className="text-amber-400" />
                          )}
                          <div>
                            <div className="font-bold">{loc.name}</div>
                            <div className="text-[10px] text-slate-400">{loc.side}</div>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{loc.z}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Grab Stair Key */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border transition ${
                  hasStairKey || isGateUnlocked
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : allQuestionsSolved
                    ? 'bg-amber-500/10 border-amber-400/60'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {hasStairKey || isGateUnlocked ? (
                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Key size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>2. Ambil Kunci Tangga Emas</span>
                      {hasStairKey && (
                        <span className="text-[11px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          Kunci Di Tangan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {hasStairKey || isGateUnlocked
                        ? 'Kamu telah mengantongi Kunci Tangga. Lanjutkan ke langkah 3.'
                        : allQuestionsSolved
                        ? '★ Kunci Tangga emas telah muncul mengambang di tengah koridor (dekat Z = -44)! Segera dekati dan ambil.'
                        : 'Kunci masih terkunci. Selesaikan 5 soal terlebih dahulu untuk memunculkan kunci.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Open Stair Gate */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border transition ${
                  isGateUnlocked
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : hasStairKey
                    ? 'bg-amber-500/10 border-amber-400/60'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isGateUnlocked ? (
                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <DoorOpen size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold text-white">
                      3. Buka Pintu Gerbang Tangga & Masuki Zona Hijau
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Gerbang tangga berada di ujung selatan koridor (Z = -70). Dekati gerbang dan tekan tombol Aksi untuk membuka. Setelah gerbang terbuka, masuki lingkaran hijau menyala di lantai tangga untuk turun ke lantai berikutnya!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* LANTAI 1 (HALAMAN & ROBOT) OBJECTIVES */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                <ShieldAlert size={16} />
                <span>Misi Tahap Akhir: Halaman Sekolah & Robot Pengawas</span>
              </div>

              {/* Step 1: Guard Post Master Key */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border transition ${
                  hasMasterKey || isExitGateUnlocked
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-amber-500/10 border-amber-400/60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {hasMasterKey || isExitGateUnlocked ? (
                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Key size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>1. Cari Kunci Gerbang Utama di {getMasterKeySpawn(masterKeySpawnIndex, maxPlayers > 1).name}</span>
                      {hasMasterKey && (
                        <span className="text-[11px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          Kunci Di Tangan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {getMasterKeySpawn(masterKeySpawnIndex, maxPlayers > 1).hint}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Avoid Robot */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <ShieldAlert size={16} />
                  <span>2. Waspada Robot Pengawas Sekolah!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Robot berpatroli mengelilingi lapangan olahraga dan halaman terbuka. Jangan mendekat lebih dari 5 meter! Jika sorot lampu robot berubah merah dan alarm berbunyi, segera lari menjauh sebelum tertangkap.
                </p>
              </div>

              {/* Step 3: Open Exit Gate */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border transition ${
                  isExitGateUnlocked
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : hasMasterKey
                    ? 'bg-amber-500/10 border-amber-400/60'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isExitGateUnlocked ? (
                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <DoorOpen size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold text-white">
                      3. Buka Gerbang Utama Keluar Sekolah
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Gerbang keluar sekolah yang besar berada di ujung selatan halaman (Z = -104). Gunakan Kunci Utama untuk membuka gerbang, lalu masuki zona keluar untuk menyelesaikan game dan menang!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QUICK CONTROLS REFERENCE */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Gamepad2 size={14} className="text-sky-400" />
              <span>Panduan Tombol Kontrol</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* PC Controls */}
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                  <Laptop size={14} />
                  <span>Komputer / Laptop</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 leading-relaxed">
                  <li><b className="text-white">W / A / S / D:</b> Berjalan maju/kiri/mundur/kanan</li>
                  <li><b className="text-white">Mouse:</b> Menoleh & mengarahkan kamera</li>
                  <li><b className="text-white">E / Klik Kiri:</b> Interaksi (Buka Soal / Ambil Kunci)</li>
                  <li><b className="text-white">F:</b> Nyalakan/Matikan Senter</li>
                  <li><b className="text-white">H:</b> Buka / Tutup Petunjuk Misi</li>
                </ul>
              </div>

              {/* Mobile Controls */}
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <Smartphone size={14} />
                  <span>HP / Tablet (Layar Sentuh)</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 leading-relaxed">
                  <li><b className="text-white">Joystick Kiri:</b> Geser stick untuk berjalan</li>
                  <li><b className="text-white">Layar Kanan:</b> Usap layar untuk memutar kamera</li>
                  <li><b className="text-white">Tombol Kuning [AKSI]:</b> Muncul otomatis saat dekat objek</li>
                  <li><b className="text-white">Tombol Bar Atas:</b> Akses Senter, Layar Penuh & Petunjuk</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={closeHint}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition cursor-pointer"
          >
            Mengerti, Lanjutkan Game!
          </button>
        </div>
      </div>
    </div>
  );
};
