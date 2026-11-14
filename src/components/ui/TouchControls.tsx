/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PAI_QUESTIONS } from '../../data/questions';
import { multiplayerSync } from '../../services/multiplayerSync';
import { requestGameFullscreen, exitGameFullscreen } from '../../utils/fullscreen';
import { inputState } from '../../services/inputState';
import { Key, DoorOpen, HelpCircle, Maximize, Minimize } from 'lucide-react';

export const TouchControls: React.FC = () => {
  const activeQuestion = useGameStore((s) => s.activeQuestion);
  const status = useGameStore((s) => s.status);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);
  const openQuestion = useGameStore((s) => s.openQuestion);
  const collectStairKey = useGameStore((s) => s.collectStairKey);
  const unlockStairGate = useGameStore((s) => s.unlockStairGate);
  const collectMasterKey = useGameStore((s) => s.collectMasterKey);
  const unlockExitGate = useGameStore((s) => s.unlockExitGate);
  const hasStairKey = useGameStore((s) => s.hasStairKey);
  const isGateUnlocked = useGameStore((s) => s.isGateUnlocked);
  const hasMasterKey = useGameStore((s) => s.hasMasterKey);
  const isExitGateUnlocked = useGameStore((s) => s.isExitGateUnlocked);
  const myId = useGameStore((s) => s.myId);
  const roomCode = useGameStore((s) => s.roomCode);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement
        )
      );
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (isFullscreen) {
      exitGameFullscreen();
    } else {
      requestGameFullscreen();
    }
  };

  // Joystick touch tracking (Pure DOM manipulation - NO React state re-renders!)
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const joystickTouchIdRef = useRef<number | null>(null);

  // Look touch tracking
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookXRef = useRef<number>(0);

  // Detect touch device
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!isTouchDevice || status !== 'playing' || activeQuestion !== null) {
    return null;
  }

  // Joystick touch handlers
  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        if (knobRef.current) {
          knobRef.current.style.transform = 'translate(0px, 0px)';
          knobRef.current.style.transition = 'transform 0.15s ease-out';
        }
        inputState.setJoystick(0, 0, false);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    if (knobRef.current) {
      knobRef.current.style.transition = 'none';
      knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    // Direct inputState update (0 React re-renders)
    const normX = dx / maxRadius;
    const normY = -(dy / maxRadius);
    inputState.setJoystick(normX, normY, true);
  };

  // Look Touch Drag Handlers (Right half of the screen)
  const handleLookStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    lookTouchIdRef.current = touch.identifier;
    lastLookXRef.current = touch.clientX;
  };

  const handleLookMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        const deltaX = touch.clientX - lastLookXRef.current;
        lastLookXRef.current = touch.clientX;
        // Direct inputState accumulation
        inputState.addLookDelta(deltaX);
        break;
      }
    }
  };

  const handleLookEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        break;
      }
    }
  };

  // Action Button Trigger
  const handleAction = () => {
    if (!nearbyInteractable) return;
    switch (nearbyInteractable.type) {
      case 'question': {
        const q = PAI_QUESTIONS.find((item) => item.id === nearbyInteractable.id);
        if (q) openQuestion(q);
        break;
      }
      case 'stair_key': {
        collectStairKey();
        multiplayerSync.send({
          type: 'KEY_COLLECTED',
          senderId: myId,
          roomCode,
          payload: { keyType: 'stair' },
          timestamp: Date.now(),
        });
        break;
      }
      case 'stair_gate': {
        if (hasStairKey && !isGateUnlocked) {
          unlockStairGate();
          multiplayerSync.send({
            type: 'GATE_UNLOCKED',
            senderId: myId,
            roomCode,
            payload: { gateType: 'stair' },
            timestamp: Date.now(),
          });
        }
        break;
      }
      case 'master_key': {
        collectMasterKey();
        multiplayerSync.send({
          type: 'KEY_COLLECTED',
          senderId: myId,
          roomCode,
          payload: { keyType: 'master' },
          timestamp: Date.now(),
        });
        break;
      }
      case 'exit_gate': {
        if (hasMasterKey && !isExitGateUnlocked) {
          unlockExitGate();
          multiplayerSync.send({
            type: 'GATE_UNLOCKED',
            senderId: myId,
            roomCode,
            payload: { gateType: 'exit' },
            timestamp: Date.now(),
          });
        }
        break;
      }
    }
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none select-none overflow-hidden touch-none">
      {/* Right Screen: Touch-Drag Area for Horizontal Turning */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-auto touch-none"
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        onTouchCancel={handleLookEnd}
      />

      {/* Bottom-Left: Virtual Joystick */}
      <div className="absolute bottom-6 left-6 pointer-events-auto touch-none">
        <div
          ref={joystickBaseRef}
          className="w-32 h-32 rounded-full border-2 border-emerald-500/50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center shadow-lg"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
        >
          {/* Inner stick knob */}
          <div
            ref={knobRef}
            className="w-14 h-14 rounded-full border-2 border-emerald-300 bg-emerald-500/90 text-slate-950 flex items-center justify-center pointer-events-none shadow-md"
          >
            <div className="w-4 h-4 rounded-full bg-white/60" />
          </div>
        </div>
      </div>

      {/* Floating Fullscreen Pill Button for Mobile */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto sm:hidden">
        <button
          onClick={handleToggleFullscreen}
          className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 text-[11px] font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition"
        >
          {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
          <span>{isFullscreen ? 'Normal' : 'Layar Penuh'}</span>
        </button>
      </div>

      {/* Bottom-Right: Large Action Button when Near Object */}
      {nearbyInteractable && (
        <div className="absolute bottom-8 right-8 pointer-events-auto animate-in zoom-in duration-150">
          <button
            onClick={handleAction}
            className="w-20 h-20 rounded-2xl bg-amber-500 active:bg-amber-400 text-slate-950 font-black shadow-2xl shadow-amber-500/40 flex flex-col items-center justify-center gap-1 active:scale-95 transition cursor-pointer border-2 border-amber-300"
          >
            {nearbyInteractable.type === 'question' && <HelpCircle size={28} />}
            {(nearbyInteractable.type === 'stair_key' ||
              nearbyInteractable.type === 'master_key') && <Key size={28} />}
            {(nearbyInteractable.type === 'stair_gate' ||
              nearbyInteractable.type === 'exit_gate') && <DoorOpen size={28} />}
            <span className="text-[10px] uppercase font-bold leading-none text-center px-1">
              Aksi
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
