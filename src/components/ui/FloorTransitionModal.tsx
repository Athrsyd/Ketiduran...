/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { sound } from '../../services/soundEngine';
import { MapPin, ArrowDownCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const FloorTransitionModal: React.FC = () => {
  const popup = useGameStore((s) => s.mapTransitionPopup);
  const dismiss = useGameStore((s) => s.dismissMapTransitionPopup);
  const isMapViewer = useGameStore((s) => s.isMapViewer);
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    if (!popup) return;
    sound.playInteract();

    setProgress(100);
    const duration = isMapViewer ? 2000 : 3200;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          dismiss();
          return 0;
        }
        return Math.max(0, prev - step);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [popup, dismiss, isMapViewer]);

  if (!popup) return null;

  const isFloor1 = popup.toFloor === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[95vh] overflow-y-auto bg-slate-900/95 border-2 border-emerald-500/60 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl shadow-emerald-500/20 text-center space-y-2.5 sm:space-y-3.5 pointer-events-auto">
        {/* Floating Icon with pulse - Scaled */}
        <div className="relative mx-auto w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-emerald-400/20 animate-ping opacity-35" />
          {isFloor1 ? (
            <>
              <ShieldAlert size={22} className="text-amber-400 sm:hidden" />
              <ShieldAlert size={32} className="text-amber-400 hidden sm:block" />
            </>
          ) : (
            <>
              <ArrowDownCircle size={22} className="text-emerald-400 sm:hidden" />
              <ArrowDownCircle size={32} className="text-emerald-400 hidden sm:block" />
            </>
          )}
        </div>

        {/* Level Tag */}
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] sm:text-xs font-bold text-slate-300">
          <MapPin size={11} className="text-emerald-400 shrink-0" />
          <span>
            {popup.fromFloor === popup.toFloor
              ? `Lokasi: Lantai ${popup.toFloor}`
              : `Berpindah: Lantai ${popup.fromFloor} → Lantai ${popup.toFloor}`}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-0.5 sm:space-y-1">
          <h2 className="text-base sm:text-xl font-black tracking-wide text-white font-mono leading-tight">
            {popup.title}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300 leading-snug font-medium">
            {popup.desc}
          </p>
        </div>

        {/* Progress timer bar */}
        <div className="w-full h-1 sm:h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dismiss Button */}
        <button
          onClick={dismiss}
          className="w-full py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition touch-manipulation"
        >
          <CheckCircle2 size={15} />
          <span>Lanjutkan Eksplorasi</span>
        </button>
      </div>
    </div>
  );
};
