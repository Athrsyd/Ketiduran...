/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  Layers,
  Eye,
  Navigation,
  Compass,
  XCircle,
  Footprints,
  Ghost,
  Camera,
  MapPin,
  Building,
  TreePine,
  Users,
  User,
} from 'lucide-react';

export const MapViewerOverlay: React.FC = () => {
  const isMapViewer = useGameStore((s) => s.isMapViewer);
  const currentFloor = useGameStore((s) => s.currentFloor);
  const setViewerFloor = useGameStore((s) => s.setViewerFloor);
  const viewerCameraMode = useGameStore((s) => s.viewerCameraMode);
  const setViewerCameraMode = useGameStore((s) => s.setViewerCameraMode);
  const viewerNoclip = useGameStore((s) => s.viewerNoclip);
  const toggleViewerNoclip = useGameStore((s) => s.toggleViewerNoclip);
  const teleportPlayer = useGameStore((s) => s.teleportPlayer);
  const setMapViewer = useGameStore((s) => s.setMapViewer);
  const maxPlayers = useGameStore((s) => s.maxPlayers);
  const setMaxPlayers = useGameStore((s) => s.setMaxPlayers);
  const demoTeammatesActive = useGameStore((s) => s.demoTeammatesActive);
  const toggleDemoTeammates = useGameStore((s) => s.toggleDemoTeammates);
  const teammates = useGameStore((s) => s.teammates);
  const isMultiplayer = maxPlayers > 1;

  if (!isMapViewer) return null;

  // Solo mode spots
  const soloUpperSpots = [
    { label: 'Spawn Utara (Depan)', pos: [0, 1.6, 10.0] as [number, number, number] },
    { label: 'Kelas XI RPL 1', pos: [-9.5, 1.6, 6.0] as [number, number, number] },
    { label: 'Kelas XI TKJ 1', pos: [9.5, 1.6, 6.0] as [number, number, number] },
    { label: 'Lounge Tengah & Mading', pos: [0, 1.6, -24.0] as [number, number, number] },
    { label: 'Kelas XI MM 1', pos: [-9.5, 1.6, -34.0] as [number, number, number] },
    { label: 'Lab Komputer PAI', pos: [-9.5, 1.6, -54.0] as [number, number, number] },
    { label: 'Perpustakaan', pos: [9.5, 1.6, -54.0] as [number, number, number] },
    { label: 'Gerbang Tangga', pos: [0, 1.6, -67.0] as [number, number, number] },
  ];

  const soloFloor1Spots = [
    { label: 'Lobby Depan', pos: [0, 1.6, 10.0] as [number, number, number] },
    { label: 'Tiang Bendera', pos: [0, 1.6, -38.0] as [number, number, number] },
    { label: 'Lapangan Basket', pos: [22, 1.6, -48.0] as [number, number, number] },
    { label: 'Taman & Gazebo', pos: [-24, 1.6, -38.0] as [number, number, number] },
    { label: 'Pos Satpam (Master Key)', pos: [-18, 1.6, -53.0] as [number, number, number] },
    { label: 'Area Parkir Motor', pos: [24, 1.6, -80.0] as [number, number, number] },
    { label: 'Kantin Sekolah', pos: [-26, 1.6, -76.0] as [number, number, number] },
    { label: 'Gerbang Utama Keluar', pos: [0, 1.6, -100.0] as [number, number, number] },
  ];

  // Multiplayer labyrinth spots per floor
  const multiFloor4Spots = [
    { label: 'Spawn Tengah', pos: [0, 1.6, 10.0] as [number, number, number] },
    { label: 'Sayap Barat: Lab Jaringan', pos: [-28.0, 1.6, -5.0] as [number, number, number] },
    { label: 'Sayap Barat: Lab SIJA', pos: [-28.0, 1.6, -27.0] as [number, number, number] },
    { label: 'Sayap Timur: Multimedia', pos: [28.0, 1.6, -35.0] as [number, number, number] },
    { label: 'Sayap Timur: Desain Animasi', pos: [28.0, 1.6, -57.0] as [number, number, number] },
    { label: 'Ruang PAI Utara', pos: [-11.5, 1.6, 7.8] as [number, number, number] },
    { label: 'Kunci Tangga Silang', pos: [0, 1.6, -30.0] as [number, number, number] },
    { label: 'Gerbang Tangga', pos: [0, 1.6, -67.0] as [number, number, number] },
  ];

  const multiFloor3Spots = [
    { label: 'Koridor Atas Utara', pos: [0, 1.6, 8.0] as [number, number, number] },
    { label: 'Sayap Barat: XI MM 1', pos: [-27.0, 1.6, -10.2] as [number, number, number] },
    { label: 'Sayap Barat: XI MM 2', pos: [-27.0, 1.6, -46.2] as [number, number, number] },
    { label: 'Skywalk Atrium', pos: [0, 1.6, -30.0] as [number, number, number] },
    { label: 'Sayap Timur: XI DKV 1', pos: [27.0, 1.6, -10.2] as [number, number, number] },
    { label: 'Sayap Timur: XI DKV 2', pos: [27.0, 1.6, -46.2] as [number, number, number] },
    { label: 'Kunci Tangga Atrium', pos: [0, 1.6, 2.0] as [number, number, number] },
    { label: 'Gerbang Tangga', pos: [0, 1.6, -67.0] as [number, number, number] },
  ];

  const multiFloor2Spots = [
    { label: 'Start Koridor', pos: [0, 1.6, 8.0] as [number, number, number] },
    { label: 'Tikungan: Perpustakaan', pos: [-30.0, 1.6, -8.2] as [number, number, number] },
    { label: 'Sudut: Audio Visual', pos: [-30.0, 1.6, -23.2] as [number, number, number] },
    { label: 'Jembatan Penyeberangan', pos: [0, 1.6, -30.0] as [number, number, number] },
    { label: 'Sayap Timur: Ruang BK', pos: [30.0, 1.6, -36.2] as [number, number, number] },
    { label: 'Sayap Timur: OSIS', pos: [30.0, 1.6, -50.2] as [number, number, number] },
    { label: 'Kunci Tangga Zig-zag', pos: [0, 1.6, -30.0] as [number, number, number] },
    { label: 'Gerbang Tangga', pos: [0, 1.6, -67.0] as [number, number, number] },
  ];

  const multiFloor1Spots = [
    { label: 'Lobby Depan', pos: [0, 1.6, 8.0] as [number, number, number] },
    { label: 'Lapangan Futsal', pos: [26, 1.6, -40.0] as [number, number, number] },
    { label: 'Lapangan Basket', pos: [26, 1.6, -85.0] as [number, number, number] },
    { label: 'Tribune Penonton', pos: [42, 1.6, -52.0] as [number, number, number] },
    { label: 'Kanopi Parkir Motor', pos: [28, 1.6, -112.0] as [number, number, number] },
    { label: 'Pos Satpam (Master Key)', pos: [-22, 1.6, -82.0] as [number, number, number] },
    { label: 'Taman Air Mancur', pos: [0, 1.6, -85.0] as [number, number, number] },
    { label: 'Kantin Sekolah SMK', pos: [-26, 1.6, -112.0] as [number, number, number] },
    { label: 'Gerbang Utama Keluar', pos: [0, 1.6, -144.0] as [number, number, number] },
  ];

  let currentSpots = soloUpperSpots;
  if (!isMultiplayer) {
    currentSpots = currentFloor > 1 ? soloUpperSpots : soloFloor1Spots;
  } else {
    if (currentFloor === 4) currentSpots = multiFloor4Spots;
    else if (currentFloor === 3) currentSpots = multiFloor3Spots;
    else if (currentFloor === 2) currentSpots = multiFloor2Spots;
    else currentSpots = multiFloor1Spots;
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-3 sm:p-5">
      {/* Top Test Control Panel */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-auto">
        {/* Left: Mode Badge & Floor Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-emerald-500/50 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
            <Layers size={14} />
            <span>TEST MAP</span>
          </div>

          {/* Toggle Map Mode between Solo and Multiplayer */}
          <button
            onClick={() => setMaxPlayers(isMultiplayer ? 1 : 4)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              isMultiplayer
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
            }`}
            title="Ganti Mode Map yang Diuji"
          >
            {isMultiplayer ? <Users size={13} /> : <User size={13} />}
            <span>{isMultiplayer ? 'Map: Multiplayer (Labirin)' : 'Map: Solo'}</span>
          </button>

          {[
            { floor: 4, label: isMultiplayer ? 'L4 (Sayap Silang)' : 'Lantai 4' },
            { floor: 3, label: isMultiplayer ? 'L3 (Atrium U-Loop)' : 'Lantai 3' },
            { floor: 2, label: isMultiplayer ? 'L2 (Zig-Zag Maze)' : 'Lantai 2' },
            { floor: 1, label: isMultiplayer ? 'L1 (Halaman 140m)' : 'Lantai 1' },
          ].map((item) => (
            <button
              key={item.floor}
              onClick={() => setViewerFloor(item.floor)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentFloor === item.floor
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Toggle Demo Teammates */}
          <button
            onClick={toggleDemoTeammates}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              demoTeammatesActive
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-900/50 ring-2 ring-amber-300'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Tampilkan 3 Karakter Teman Demo (Budi, Siti, Rian)"
          >
            <Users size={13} />
            <span>{demoTeammatesActive ? 'Demo Teman: ON' : 'Demo Teman: OFF'}</span>
          </button>
        </div>

        {/* Right: Camera Mode & Exit */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-2xl backdrop-blur-md">
          {/* Camera walk */}
          <button
            onClick={() => setViewerCameraMode('walk')}
            title="Kamera 1st Person Normal"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewerCameraMode === 'walk' && !viewerNoclip
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Footprints size={14} />
            <span>Jalan</span>
          </button>

          {/* Camera noclip */}
          <button
            onClick={toggleViewerNoclip}
            title="Tembus Tembok / Terbang"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewerNoclip
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Ghost size={14} />
            <span>No-Clip</span>
          </button>

          {/* Camera overview / drone */}
          <button
            onClick={() => setViewerCameraMode('overview')}
            title="Tinjau Atas (Top-down Drone)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewerCameraMode === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Camera size={14} />
            <span>Drone Atas</span>
          </button>

          {/* Exit test mode */}
          <button
            onClick={() => setMapViewer(false)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-md ml-1"
          >
            <XCircle size={14} />
            <span>Tutup Test</span>
          </button>
        </div>
      </div>

      {/* Bottom Teleport Navigation Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-auto">
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-md max-w-full overflow-x-auto">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 px-1">
            <Navigation size={12} className="text-emerald-400" />
            <span>Teleport:</span>
          </div>

          {currentSpots.map((spot, idx) => (
            <button
              key={idx}
              onClick={() => teleportPlayer(spot.pos)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-500/20 hover:border-emerald-500/50 border border-slate-700/60 text-slate-200 text-[11px] font-medium transition cursor-pointer"
            >
              {spot.label}
            </button>
          ))}

          {/* Quick Friend Teleports during Demo Mode */}
          {demoTeammatesActive && (
            <div className="flex items-center gap-1 border-l border-slate-700/80 pl-2 ml-1">
              <span className="text-[11px] font-bold text-amber-400">Teman:</span>
              <button
                onClick={() => {
                  const tm = teammates['demo_budi'];
                  if (tm) teleportPlayer([tm.position[0], 1.6, tm.position[2] + 2.0], Math.PI);
                }}
                className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-bold cursor-pointer hover:bg-blue-500/30"
                title="Teleport ke Budi (RPL)"
              >
                🔵 Budi (RPL)
              </button>
              <button
                onClick={() => {
                  const tm = teammates['demo_siti'];
                  if (tm) teleportPlayer([tm.position[0], 1.6, tm.position[2] + 2.0], Math.PI);
                }}
                className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold cursor-pointer hover:bg-emerald-500/30"
                title="Teleport ke Siti (TKJ)"
              >
                🟢 Siti (TKJ)
              </button>
              <button
                onClick={() => {
                  const tm = teammates['demo_rian'];
                  if (tm) teleportPlayer([tm.position[0], 1.6, tm.position[2] + 2.0], Math.PI);
                }}
                className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold cursor-pointer hover:bg-amber-500/30"
                title="Teleport ke Rian (DKV)"
              >
                🟠 Rian (DKV)
              </button>
            </div>
          )}
        </div>

        {/* Map dimensions pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
          {isMultiplayer ? (
            currentFloor > 1 ? (
              <>
                <Building size={14} className="text-purple-400" />
                <span>Labirin Multiplayer: Sayap Cabang Unik per Lantai | 5 Meja Soal Tersebar</span>
              </>
            ) : (
              <>
                <TreePine size={14} className="text-emerald-400" />
                <span>Halaman Megah Mabar: 140m x 140m | Olahraga, Parkir 36m, Air Mancur, Kantin, Gerbang Z=-148</span>
              </>
            )
          ) : currentFloor > 1 ? (
            <>
              <Building size={14} className="text-sky-400" />
              <span>Koridor Solo: 88m x 7m | 8 Ruang Kelas & Fasilitas | 5 Meja Soal</span>
            </>
          ) : (
            <>
              <TreePine size={14} className="text-emerald-400" />
              <span>Halaman Solo: 96m x 96m | Lapangan, Taman, Gazebo, Pos Satpam, Gerbang</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

