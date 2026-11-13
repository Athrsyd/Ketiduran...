/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, Maximize } from 'lucide-react';
import { requestGameFullscreen } from '../../utils/fullscreen';

export const LandscapeAlert: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if mobile or tablet screen in portrait mode
      const isMobileScreen = window.innerWidth < 900;
      const isPortraitOrientation = window.innerHeight > window.innerWidth;
      setIsPortrait(isMobileScreen && isPortraitOrientation);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md text-white text-center select-none animate-in fade-in">
      <div className="max-w-xs space-y-4 flex flex-col items-center">
        {/* Animated Rotating Phone Graphic */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 animate-ping opacity-30" />
          <Smartphone size={48} className="text-emerald-400 rotate-90 transition-transform duration-500" />
          <RotateCw size={24} className="absolute -bottom-1 -right-1 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black tracking-wide text-white font-mono">
            PUTAR HP ANDA
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Putar HP Anda ke <strong>Posisi Landscape (Mendatar)</strong> untuk mengontrol kamera dan Virtual Joystick dengan nyaman.
          </p>
        </div>

        <button
          onClick={() => requestGameFullscreen()}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition"
        >
          <Maximize size={14} />
          <span>Layar Penuh (Fullscreen)</span>
        </button>

        <div className="text-[11px] px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          Orientasi Layar Terdeteksi: Tegak (Portrait)
        </div>
      </div>
    </div>
  );
};
