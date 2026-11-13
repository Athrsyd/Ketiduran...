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

  if (!isMapViewer) return null;

  const upperFloorSpots = [
    { label: 'Spawn Utara (Depan)', pos: [0, 1.6, 10.0] as [number, number, number] },
    { label: 'Kelas XI RPL 1', pos: [-9.5, 1.6, 6.0] as [number, number, number] },
    { label: 'Kelas XI TKJ 1', pos: [9.5, 1.6, 6.0] as [number, number, number] },
    { label: 'Lounge Tengah & Mading', pos: [0, 1.6, -24.0] as [number, number, number] },
    { label: 'Kelas XI MM 1', pos: [-9.5, 1.6, -34.0] as [number, number, number] },
    { label: 'Lab Komputer PAI', pos: [-9.5, 1.6, -54.0] as [number, number, number] },
    { label: 'Perpustakaan', pos: [9.5, 1.6, -54.0] as [number, number, number] },
    { label: 'Gerbang Tangga', pos: [0, 1.6, -67.0] as [number, number, number] },
  ];

  const floor1Spots = [
    { label: 'Lobby Depan', pos: [0, 1.6, 10.0] as [number, number, number] },
    { label: 'Tiang Bendera', pos: [0, 1.6, -38.0] as [number, number, number] },
    { label: 'Lapangan Basket', pos: [22, 1.6, -48.0] as [number, number, number] },
    { label: 'Taman & Gazebo', pos: [-24, 1.6, -38.0] as [number, number, number] },
    { label: 'Pos Satpam (Master Key)', pos: [-18, 1.6, -53.0] as [number, number, number] },
    { label: 'Area Parkir Motor', pos: [24, 1.6, -80.0] as [number, number, number] },
    { label: 'Kantin Sekolah', pos: [-26, 1.6, -76.0] as [number, number, number] },
    { label: 'Gerbang Utama Keluar', pos: [0, 1.6, -100.0] as [number, number, number] },
  ];

  const currentSpots = currentFloor > 1 ? upperFloorSpots : floor1Spots;

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

          {[
            { floor: 4, label: 'Lantai 4 (Start Solo/Mabar)' },
            { floor: 3, label: 'Lantai 3' },
            { floor: 2, label: 'Lantai 2' },
            { floor: 1, label: 'Lantai 1 & Halaman' },
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
        </div>

        {/* Map dimensions pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
          {currentFloor > 1 ? (
            <>
              <Building size={14} className="text-sky-400" />
              <span>Koridor: 88m x 7m | 8 Ruang Kelas & Fasilitas | 5 Meja Soal</span>
            </>
          ) : (
            <>
              <TreePine size={14} className="text-emerald-400" />
              <span>Halaman Luas: 96m x 96m | Lapangan, Taman, Gazebo, Pos Satpam, Gerbang</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

