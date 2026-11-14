/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

interface ClassroomRoomProps {
  roomName: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  isLeftSide: boolean; // true = room is west of corridor (X < 0), false = east (X > 0)
  hasExamDesk?: boolean;
  examDeskElement?: React.ReactNode;
}

export const ClassroomRoom = React.memo<ClassroomRoomProps>(({
  roomName,
  position,
  rotation,
  isLeftSide,
  hasExamDesk = false,
  examDeskElement,
}) => {
  const graphicsQuality = useGameStore((s) => s.graphicsQuality);
  const isMobile = graphicsQuality === 'mobile';

  const width = 12.0;
  const depth = 11.0;
  const wallH = 3.8;
  const halfW = width / 2; // 6.0
  const halfD = depth / 2; // 5.5

  // Corridor wall X coordinate in local room space:
  const corridorWallX = isLeftSide ? halfW : -halfW;
  const outerWallX = isLeftSide ? -halfW : halfW;

  // Doorway opening in the corridor wall (local Z = -1.2, width = 2.4, height = 2.8)
  const doorZ = -1.2;
  const doorW = 2.4;
  const doorH = 2.8;

  return (
    <group position={position} rotation={rotation}>
      {/* ========================================================
          1. CLASSROOM FLOOR & CEILING
          ======================================================== */}
      {/* Ceramic Tile Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, wallH, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Glowing Emissive Tube Fixtures (Optimized for 60fps on mobile) */}
      {(isMobile ? [0] : [-2.8, 2.8]).map((lx) =>
        (isMobile ? [0] : [-2.0, 2.5]).map((lz) => (
          <mesh key={`c_light_${lx}_${lz}`} position={[lx, wallH - 0.08, lz]}>
            <boxGeometry args={[1.8, 0.08, 0.35]} />
            <meshStandardMaterial color="#ffffff" emissive="#f8fafc" emissiveIntensity={1.2} />
          </mesh>
        ))
      )}

      {/* Single Soft Accent Light only in rooms with exam desk on desktop */}
      {hasExamDesk && !isMobile && (
        <pointLight position={[0, wallH - 0.4, 0]} color="#f1f5f9" intensity={0.9} distance={14} decay={2} />
      )}

      {/* ========================================================
          2. FRONT WALL & BACK WALL (WAINSCOTING INDONESIA)
          ======================================================== */}
      {/* Front Wall */}
      <mesh position={[0, wallH / 2, -halfD]}>
        <boxGeometry args={[width, wallH, 0.25]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      {/* Lower Green Wainscoting on Front Wall */}
      <mesh position={[0, 0.65, -halfD + 0.14]}>
        <boxGeometry args={[width, 1.3, 0.04]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, wallH / 2, halfD]}>
        <boxGeometry args={[width, wallH, 0.25]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      {/* Lower Green Wainscoting on Back Wall */}
      <mesh position={[0, 0.65, halfD - 0.14]}>
        <boxGeometry args={[width, 1.3, 0.04]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>

      {/* ========================================================
          3. OUTER WALL WITH 3 CLEAN WINDOWS
          ======================================================== */}
      <group position={[outerWallX, 0, 0]}>
        {/* Wall bottom (under windows) */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.25, 1.1, depth]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
        {/* Wall top (above windows) */}
        <mesh position={[0, 3.3, 0]}>
          <boxGeometry args={[0.25, 1.0, depth]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
        {/* Pillars between windows */}
        {[-halfD + 0.5, -1.8, 1.8, halfD - 0.5].map((pz, pi) => (
          <mesh key={`win_pillar_${pi}`} position={[0, 1.95, pz]}>
            <boxGeometry args={[0.27, 1.7, 0.7]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
        ))}

        {/* 3 Low-Poly Window Openings */}
        {[-3.6, 0, 3.6].map((wz, wi) => (
          <group key={`clean_win_${wi}`} position={[0, 1.95, wz]}>
            {/* Wooden Frame */}
            <mesh>
              <boxGeometry args={[0.22, 1.6, 2.2]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
            {/* Glass panel */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.04, 1.48, 2.08]} />
              <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================
          4. CORRIDOR WALL WITH DOOR FRAME & OPEN DOOR LEAF
          ======================================================== */}
      <group position={[corridorWallX, 0, 0]}>
        {/* Left wall segment */}
        <group position={[0, 0, -3.95]}>
          <mesh position={[0, wallH / 2, 0]}>
            <boxGeometry args={[0.25, wallH, 3.1]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[0.27, 1.3, 3.1]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
          </mesh>
        </group>

        {/* Right wall segment */}
        <group position={[0, 0, 2.75]}>
          <mesh position={[0, wallH / 2, 0]}>
            <boxGeometry args={[0.25, wallH, 5.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[0.27, 1.3, 5.5]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
          </mesh>
        </group>

        {/* Lintel wall above doorway */}
        <mesh position={[0, (wallH + doorH) / 2, doorZ]}>
          <boxGeometry args={[0.25, wallH - doorH, doorW]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>

        {/* Door Jambs */}
        <mesh position={[0, doorH / 2, doorZ - doorW / 2]}>
          <boxGeometry args={[0.28, doorH, 0.12]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
        <mesh position={[0, doorH / 2, doorZ + doorW / 2]}>
          <boxGeometry args={[0.28, doorH, 0.12]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>

        {/* Open Door Leaf Swung into Classroom */}
        <group
          position={[
            isLeftSide ? -0.15 : 0.15,
            0,
            doorZ - doorW / 2 + 0.08,
          ]}
          rotation={[0, isLeftSide ? -Math.PI * 0.45 : Math.PI * 0.45, 0]}
        >
          <mesh position={[0, 1.3, 0.55]}>
            <boxGeometry args={[0.06, 2.55, 1.15]} />
            <meshStandardMaterial color="#92400e" roughness={0.7} />
          </mesh>
        </group>

        {/* Classroom Sign Plaque over Doorway */}
        <group position={[isLeftSide ? 0.18 : -0.18, 3.1, doorZ]}>
          <mesh>
            <boxGeometry args={[0.06, 0.48, 2.0]} />
            <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.3} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          5. PAPAN TULIS HIJAU & GARUDA PANCASILA
          ======================================================== */}
      <group position={[0, 2.0, -halfD + 0.16]}>
        <mesh>
          <boxGeometry args={[6.6, 1.9, 0.06]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[6.4, 1.75, 0.04]} />
          <meshStandardMaterial color="#14532d" roughness={0.9} />
        </mesh>
      </group>

      {/* Garuda Pancasila */}
      <mesh position={[0, 3.25, -halfD + 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 12]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ========================================================
          6. MEJA GURU (TEACHER'S DESK)
          ======================================================== */}
      <group position={[isLeftSide ? 3.6 : -3.6, 0, -halfD + 1.8]}>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[1.9, 0.08, 0.95]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
        <mesh position={[0.5, 0.36, 0]}>
          <boxGeometry args={[0.7, 0.68, 0.85]} />
          <meshStandardMaterial color="#92400e" roughness={0.7} />
        </mesh>
        <mesh position={[-0.75, 0.36, 0]}>
          <boxGeometry args={[0.1, 0.68, 0.85]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Teacher Chair */}
        <mesh position={[0, 0.45, -0.65]}>
          <boxGeometry args={[0.6, 0.08, 0.5]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 0.85, -0.88]}>
          <boxGeometry args={[0.56, 0.7, 0.08]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      </group>

      {/* ========================================================
          7. HIGH-PERFORMANCE LOW-POLY STUDENT DESKS & CHAIRS
          (Rendered only in rooms with exam desk on mobile)
          ======================================================== */}
      {(!isMobile || hasExamDesk) &&
        (isMobile ? [-2.4, 2.4] : [-2.4, 2.4]).map((colX, colIdx) =>
          (isMobile ? [1.8] : [-0.5, 1.8, 4.0]).map((rowZ, rowIdx) => {
            const isExamSpot = hasExamDesk && colIdx === 0 && (isMobile ? true : rowIdx === 1);
            if (isExamSpot) return null;

            return (
              <group key={`s_desk_${colIdx}_${rowIdx}`} position={[colX, 0, rowZ]}>
                {/* Desk Tabletop & Drawer */}
                <mesh position={[0, 0.68, 0]}>
                  <boxGeometry args={[1.4, 0.16, 0.65]} />
                  <meshStandardMaterial color="#b45309" roughness={0.7} />
                </mesh>
                {/* Sturdy Side Leg Panels */}
                <mesh position={[-0.62, 0.32, 0]}>
                  <boxGeometry args={[0.06, 0.64, 0.55]} />
                  <meshStandardMaterial color="#334155" metalness={0.7} />
                </mesh>
                <mesh position={[0.62, 0.32, 0]}>
                  <boxGeometry args={[0.06, 0.64, 0.55]} />
                  <meshStandardMaterial color="#334155" metalness={0.7} />
                </mesh>

                {/* Student Chairs (1 on mobile, 2 on PC) */}
                {(isMobile ? [0] : [-0.35, 0.35]).map((chairX, chairI) => (
                  <group key={`chair_${chairI}`} position={[chairX, 0, 0.62]}>
                    {/* Seat & Legs */}
                    <mesh position={[0, 0.42, 0]}>
                      <boxGeometry args={[0.42, 0.04, 0.4]} />
                      <meshStandardMaterial color="#78350f" roughness={0.8} />
                    </mesh>
                    {!isMobile && (
                      <mesh position={[0, 0.21, 0]}>
                        <boxGeometry args={[0.38, 0.42, 0.35]} />
                        <meshStandardMaterial color="#1e293b" />
                      </mesh>
                    )}
                    {/* Backrest */}
                    <mesh position={[0, 0.72, 0.18]}>
                      <boxGeometry args={[0.4, 0.24, 0.04]} />
                      <meshStandardMaterial color="#78350f" roughness={0.8} />
                    </mesh>
                  </group>
                ))}
              </group>
            );
          })
        )}

      {/* ========================================================
          8. BOOKSHELF & TRASH CAN (Omitted on mobile in empty rooms)
          ======================================================== */}
      {(!isMobile || hasExamDesk) && (
        <group position={[outerWallX + (isLeftSide ? 1.4 : -1.4), 0, halfD - 0.7]}>
          <mesh position={[0, 1.45, 0]}>
            <boxGeometry args={[2.0, 2.9, 0.65]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          {[0.6, 1.3, 2.1].map((sy, si) => (
            <mesh key={`shelf_${si}`} position={[0, sy, 0.12]}>
              <boxGeometry args={[1.8, 0.32, 0.5]} />
              <meshStandardMaterial color={si % 2 === 0 ? '#1e3a8a' : '#14532d'} roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* Trash Can */}
      {!isMobile && (
        <mesh position={[corridorWallX + (isLeftSide ? -0.5 : 0.5), 0.28, doorZ + doorW / 2 + 0.6]}>
          <cylinderGeometry args={[0.22, 0.18, 0.56, 8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.5} />
        </mesh>
      )}

      {/* Render Active Exam Desk */}
      {examDeskElement}
    </group>
  );
});
