/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Loader2 } from 'lucide-react';

export const CutscenePlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const finishCutscene = useGameStore((s) => s.finishCutscene);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const canSkipRef = useRef<boolean>(false);

  // Video source URL (encoded for safety)
  const videoSrc = '/cutscene/ketiduran-intro%20(FINAL-compressed).mp4';

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    finishCutscene();
  };

  // Prevent ghost clicks from lobby start button triggering instant skip
  useEffect(() => {
    const timer = setTimeout(() => {
      canSkipRef.current = true;
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut listener (Space, Escape, Enter)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' ||
        e.key === ' ' ||
        e.code === 'Escape' ||
        e.key === 'Escape' ||
        e.code === 'Enter' ||
        e.key === 'Enter'
      ) {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Attempt auto-play when mounted
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay with audio was prevented by browser policy
        // Try muted autoplay
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, []);

  // Direct DOM style update for 60fps smooth progress bar without React re-renders
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration > 0 && progressBarRef.current) {
      const pct = (video.currentTime / video.duration) * 100;
      progressBarRef.current.style.width = `${pct}%`;
    }
  };

  // User click on the video or screen skips the cutscene
  const handleVideoClick = () => {
    if (!canSkipRef.current) return;

    const video = videoRef.current;
    if (video && video.paused) {
      video.play().catch(() => {});
      return;
    }

    handleSkip();
  };

  return (
    <div
      onClick={handleVideoClick}
      className="fixed inset-0 z-[120] bg-black flex items-center justify-center select-none overflow-hidden touch-none cursor-pointer"
      title="Klik untuk melewati cutscene"
    >
      {/* High-Performance Hardware-Accelerated Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onEnded={handleSkip}
        className="w-full h-full object-contain pointer-events-none"
        style={{
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-emerald-400 text-xs font-semibold shadow-xl">
            <Loader2 size={16} className="animate-spin text-emerald-400" />
            <span>Memuat cutscene...</span>
          </div>
        </div>
      )}

      {/* Bottom Progress Bar & Cinematic Info */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-30 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span className="tracking-wider uppercase">Intro Cerita: Ketiduran di Sekolah...</span>
          <span className="text-slate-300 bg-black/60 border border-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm text-[10px] sm:text-xs">
            Klik video untuk melewati
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden backdrop-blur-xs">
          <div
            ref={progressBarRef}
            className="h-full bg-emerald-400 transition-all duration-100"
            style={{ width: '0%' }}
          />
        </div>
      </div>
    </div>
  );
};
