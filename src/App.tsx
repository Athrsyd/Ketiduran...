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
import { FloorTransitionModal } from './components/ui/FloorTransitionModal';
import { MapViewerOverlay } from './components/ui/MapViewerOverlay';
import { CutscenePlayer } from './components/ui/CutscenePlayer';
import { isMobileDevice, requestGameFullscreen } from './utils/fullscreen';

export default function App() {
  const status = useGameStore((s) => s.status);
  const activeQuestion = useGameStore((s) => s.activeQuestion);
  const isMapViewer = useGameStore((s) => s.isMapViewer);
  const setMapViewer = useGameStore((s) => s.setMapViewer);

  // Check URL query parameters or hash on initial mount for map viewer route
  // e.g.: http://localhost:3000/?view=map or /#map-viewer
  useEffect(() => {
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (
      search.includes('view=map') ||
      search.includes('test=map') ||
      search.includes('map-viewer') ||
      hash.includes('map-viewer')
    ) {
      setMapViewer(true);
    }
  }, [setMapViewer]);

  // Automatic fullscreen on mobile devices on user interaction
  useEffect(() => {
    if (!isMobileDevice()) return;

    const handleFirstTouch = () => {
      requestGameFullscreen();
    };

    window.addEventListener('touchstart', handleFirstTouch, { passive: true });
    window.addEventListener('click', handleFirstTouch, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
  }, []);

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

      {/* Dedicated Map Test / Preview Route Overlay */}
      {isMapViewer && <MapViewerOverlay />}

      {/* Floor & Level Transition Popup Banner */}
      <FloorTransitionModal />

      {/* Interactive PAI Question Modal */}
      {activeQuestion !== null && <QuestionModal question={activeQuestion} />}

      {/* Game Over Modal */}
      {status === 'gameover' && <GameOverModal />}

      {/* Victory Modal */}
      {status === 'victory' && <VictoryModal />}

      {/* Introductory Story Cutscene */}
      {status === 'cutscene' && <CutscenePlayer />}

      {/* Atmospheric Start Lobby */}
      {status === 'lobby' && !isMapViewer && <LobbyScreen />}

      {/* Automatic Landscape Orientation Warning Overlay */}
      <LandscapeAlert />
    </div>
  );
}
