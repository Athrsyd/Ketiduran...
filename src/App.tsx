/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { GameCanvas } from './components/3d/GameCanvas';
import { HUD } from './components/ui/HUD';
import { TouchControls } from './components/ui/TouchControls';
import { QuestionModal } from './components/ui/QuestionModal';
import { LobbyScreen } from './components/ui/LobbyScreen';
import { GameOverModal } from './components/ui/GameOverModal';
import { VictoryModal } from './components/ui/VictoryModal';
import { LandscapeAlert } from './components/ui/LandscapeAlert';

export default function App() {
  const status = useGameStore((s) => s.status);
  const activeQuestion = useGameStore((s) => s.activeQuestion);

  // Prevent default pull-to-refresh on mobile
  useEffect(() => {
    const preventOverscroll = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventOverscroll, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventOverscroll);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans select-none">
      {/* 3D Game Canvas */}
      <GameCanvas />

      {/* In-Game HUD (crosshair, objective, gathering status, player list) */}
      {status === 'playing' && <HUD />}

      {/* Mobile / Tablet Touch Controls (Joystick, Touch-look drag, Action button) */}
      {status === 'playing' && <TouchControls />}

      {/* Interactive PAI Question Modal */}
      {activeQuestion !== null && <QuestionModal question={activeQuestion} />}

      {/* Game Over Modal */}
      {status === 'gameover' && <GameOverModal />}

      {/* Victory Modal */}
      {status === 'victory' && <VictoryModal />}

      {/* Atmospheric Start Lobby */}
      {status === 'lobby' && <LobbyScreen />}

      {/* Automatic Landscape Orientation Warning Overlay */}
      <LandscapeAlert />
    </div>
  );
}
