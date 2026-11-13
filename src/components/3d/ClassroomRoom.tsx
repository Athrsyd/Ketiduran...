/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';

interface ClassroomRoomProps {
  roomName: string;
  position: [number, number, number];
  isLeftSide: boolean; // true = room is west of corridor (X < 0), false = east (X > 0)
  hasExamDesk?: boolean;
  examDeskElement?: React.ReactNode;
}

export const ClassroomRoom: React.FC<ClassroomRoomProps> = ({
  roomName,
  position,
  isLeftSide,
  hasExamDesk = false,
  examDeskElement,
}) => {
  const width = 11.8;
  const depth = 11.0;
  const wallH = 3.6;
  const halfW = width / 2; // 5.9
  const halfD = depth / 2; // 5.5

  // Corridor wall X coordinate in local room space:
  // If room is on left side (X < 0), corridor is at +halfW.
  // If room is on right side (X > 0), corridor is at -halfW.
  const corridorWallX = isLeftSide ? halfW : -halfW;
  const outerWallX = isLeftSide ? -halfW : halfW;

  // Doorway opening in the corridor wall (local Z = -1.2, width = 2.2, height = 2.6)
  const doorZ = -1.2;
  const doorW = 2.2;
  const doorH = 2.6;

  return (
    <group position={position}>
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

      {/* Classroom Fluorescent Tube Fixtures with Soft White Glow */}
      {[-2.8, 2.8].map((lx) =>
        [-2.0, 2.5].map((lz) => (
          <group key={`c_light_${lx}_${lz}`} position={[lx, wallH - 0.1, lz]}>
            <mesh>
              <boxGeometry args={[1.8, 0.08, 0.35]} />
              <meshStandardMaterial color="#ffffff" emissive="#f8fafc" emissiveIntensity={0.8} />
            </mesh>
            <pointLight color="#f1f5f9" intensity={0.9} distance={9} />
          </group>
        ))
      )}

      {/* ========================================================
          2. FRONT WALL & BACK WALL (WAINSCOTING INDONESIA)
          ======================================================== */}
      {/* Front Wall (Z = -halfD) where Papan Tulis is mounted */}
      <mesh position={[0, wallH / 2, -halfD]}>
        <boxGeometry args={[width, wallH, 0.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      {/* Lower Green Wainscoting on Front Wall */}
      <mesh position={[0, 0.6, -halfD + 0.11]}>
        <boxGeometry args={[width, 1.2, 0.04]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      {/* Wooden Baseboard Trim */}
      <mesh position={[0, 0.08, -halfD + 0.12]}>
        <boxGeometry args={[width, 0.16, 0.04]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>

      {/* Back Wall (Z = halfD) */}
      <mesh position={[0, wallH / 2, halfD]}>
        <boxGeometry args={[width, wallH, 0.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      {/* Lower Green Wainscoting on Back Wall */}
      <mesh position={[0, 0.6, halfD - 0.11]}>
        <boxGeometry args={[width, 1.2, 0.04]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>

      {/* ========================================================
          3. OUTER WALL WITH 3 CLEAN RECESSED WINDOWS (NO Z-FIGHTING)
          ======================================================== */}
      <group position={[outerWallX, 0, 0]}>
        {/* Wall bottom (under windows, Y: 0 to 1.1) */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.2, 1.1, depth]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
        {/* Wall top (above windows, Y: 2.8 to 3.6) */}
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[0.2, 0.8, depth]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
        {/* Wall end-caps and pillars between windows */}
        {[-halfD + 0.5, -1.8, 1.8, halfD - 0.5].map((pz, pi) => (
          <mesh key={`win_pillar_${pi}`} position={[0, 1.95, pz]}>
            <boxGeometry args={[0.22, 1.7, 0.7]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
        ))}

        {/* 3 Clean Window Openings with Inset Glass & Dark Night View */}
        {[-3.6, 0, 3.6].map((wz, wi) => (
          <group key={`clean_win_${wi}`} position={[0, 1.95, wz]}>
            {/* Wooden Frame */}
            <mesh>
              <boxGeometry args={[0.18, 1.6, 2.2]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
            {/* Dark Night Sky Glass with subtle specular reflection */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.04, 1.48, 2.08]} />
              <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
            </mesh>
            {/* Wooden Mullions / Cross dividers */}
            <mesh position={[isLeftSide ? 0.03 : -0.03, 0, 0]}>
              <boxGeometry args={[0.02, 1.48, 0.06]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
            <mesh position={[isLeftSide ? 0.03 : -0.03, 0, 0]}>
              <boxGeometry args={[0.02, 0.06, 2.08]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================
          4. CORRIDOR WALL WITH OBVIOUS DOOR FRAME, DOOR LEAF & PLAQUE
          ======================================================== */}
      <group position={[corridorWallX, 0, 0]}>
        {/* Left wall segment (Z from -halfD to doorZ - doorW/2) */}
        {(() => {
          const segLength = (doorZ - doorW / 2) - (-halfD); // distance from front to door
          const segCenterZ = -halfD + segLength / 2;
          return (
            <group position={[0, 0, segCenterZ]}>
              <mesh position={[0, wallH / 2, 0]}>
                <boxGeometry args={[0.2, wallH, segLength]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.22, 1.2, segLength]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
              </mesh>
            </group>
          );
        })()}

        {/* Right wall segment (Z from doorZ + doorW/2 to +halfD) */}
        {(() => {
          const segLength = halfD - (doorZ + doorW / 2); // distance from door to back
          const segCenterZ = halfD - segLength / 2;
          return (
            <group position={[0, 0, segCenterZ]}>
              <mesh position={[0, wallH / 2, 0]}>
                <boxGeometry args={[0.2, wallH, segLength]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.22, 1.2, segLength]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
              </mesh>
            </group>
          );
        })()}

        {/* Lintel wall above doorway */}
        <mesh position={[0, (wallH + doorH) / 2, doorZ]}>
          <boxGeometry args={[0.2, wallH - doorH, doorW]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>

        {/* ==========================================
            WOODEN DOOR FRAME (KUSEN PINTU COKELAT)
            ========================================== */}
        {/* Left Jamb */}
        <mesh position={[0, doorH / 2, doorZ - doorW / 2]}>
          <boxGeometry args={[0.24, doorH, 0.12]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
        {/* Right Jamb */}
        <mesh position={[0, doorH / 2, doorZ + doorW / 2]}>
          <boxGeometry args={[0.24, doorH, 0.12]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
        {/* Top Header Jamb */}
        <mesh position={[0, doorH - 0.06, doorZ]}>
          <boxGeometry args={[0.24, 0.12, doorW]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>

        {/* ==========================================
            WOODEN DOOR LEAF (DAUN PINTU KAYU TERBUKA)
            Pintu terbuka 75 derajat ke dalam kelas!
            ========================================== */}
        <group
          position={[
            isLeftSide ? -0.1 : 0.1,
            0,
            doorZ - doorW / 2 + 0.06,
          ]}
          rotation={[0, isLeftSide ? -Math.PI * 0.42 : Math.PI * 0.42, 0]}
        >
          {/* Main Door Panel */}
          <mesh position={[0, 1.25, 0.52]}>
            <boxGeometry args={[0.06, 2.45, 1.05]} />
            <meshStandardMaterial color="#92400e" roughness={0.7} />
          </mesh>
          {/* Door Glass Window in Top Half */}
          <mesh position={[0, 1.7, 0.52]}>
            <boxGeometry args={[0.08, 0.7, 0.55]} />
            <meshStandardMaterial color="#bae6fd" roughness={0.2} metalness={0.5} transparent opacity={0.6} />
          </mesh>
          {/* Metallic Door Handle (Gagang Pintu) */}
          <mesh position={[isLeftSide ? -0.06 : 0.06, 1.1, 0.95]}>
            <boxGeometry args={[0.04, 0.16, 0.04]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[isLeftSide ? -0.08 : 0.08, 1.15, 0.95]}>
            <boxGeometry args={[0.08, 0.02, 0.12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* ==========================================
            CLASSROOM SIGN PLAQUE (PAPAN NAMA KELAS)
            Terpasang di atas pintu menghadap koridor!
            ========================================== */}
        <group position={[isLeftSide ? 0.15 : -0.15, 2.9, doorZ]}>
          {/* Blue Signboard */}
          <mesh>
            <boxGeometry args={[0.06, 0.45, 1.8]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} />
          </mesh>
          {/* White border */}
          <mesh position={[isLeftSide ? 0.01 : -0.01, 0, 0]}>
            <boxGeometry args={[0.05, 0.42, 1.74]} />
            <meshBasicMaterial color="#ffffff" wireframe />
          </mesh>
          {/* Lamp spotlight over doorway */}
          <pointLight
            position={[isLeftSide ? 0.6 : -0.6, 0, 0]}
            color="#fef08a"
            intensity={1.2}
            distance={5}
          />
        </group>
      </group>

      {/* ========================================================
          5. PAPAN TULIS HIJAU, GARUDA PANCASILA & FOTO PRESIDEN
          ======================================================== */}
      {/* Blackboard Centered at Front Wall */}
      <group position={[0, 1.9, -halfD + 0.14]}>
        {/* Frame */}
        <mesh>
          <boxGeometry args={[6.4, 1.8, 0.06]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Green Board */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[6.2, 1.65, 0.04]} />
          <meshStandardMaterial color="#14532d" roughness={0.9} />
        </mesh>
        {/* Chalk Tray */}
        <mesh position={[0, -0.88, 0.08]}>
          <boxGeometry args={[6.2, 0.06, 0.14]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Chalk Eraser & Chalks */}
        <mesh position={[-1.2, -0.83, 0.08]}>
          <boxGeometry args={[0.22, 0.05, 0.08]} />
          <meshStandardMaterial color="#d97706" roughness={0.9} />
        </mesh>
        <mesh position={[1.2, -0.84, 0.08]}>
          <boxGeometry args={[0.15, 0.03, 0.05]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      </group>

      {/* Lambang Garuda Pancasila (Center Above Blackboard) */}
      <group position={[0, 3.12, -halfD + 0.12]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Bingkai Foto Presiden RI (Kanan) & Wakil Presiden RI (Kiri) */}
      <mesh position={[-1.6, 3.12, -halfD + 0.12]}>
        <boxGeometry args={[0.46, 0.58, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <mesh position={[1.6, 3.12, -halfD + 0.12]}>
        <boxGeometry args={[0.46, 0.58, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* ========================================================
          6. MEJA GURU (TEACHER'S DESK & HIGH CHAIR)
          ======================================================== */}
      <group position={[isLeftSide ? 3.6 : -3.6, 0, -halfD + 1.8]}>
        {/* Wooden Teacher Table */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.9, 0.08, 0.95]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
        {/* Under-desk Pedestal & Drawers */}
        <mesh position={[0.5, 0.36, 0]}>
          <boxGeometry args={[0.7, 0.68, 0.85]} />
          <meshStandardMaterial color="#92400e" roughness={0.7} />
        </mesh>
        <mesh position={[-0.75, 0.36, 0]}>
          <boxGeometry args={[0.1, 0.68, 0.85]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* White Tablecloth Runner */}
        <mesh position={[0, 0.76, 0]}>
          <planeGeometry args={[1.0, 0.96]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        {/* Textbook Stack & Pen Cup */}
        <mesh position={[-0.4, 0.84, 0.1]}>
          <boxGeometry args={[0.32, 0.14, 0.42]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
        </mesh>
        <mesh position={[0.2, 0.84, -0.2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.14, 12]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} />
        </mesh>
        {/* High-backed Teacher Chair */}
        <mesh position={[0, 0.5, -0.65]}>
          <boxGeometry args={[0.62, 0.08, 0.52]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.9, -0.88]}>
          <boxGeometry args={[0.58, 0.72, 0.08]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
      </group>

      {/* ========================================================
          7. MAJALAH DINDING (MADING KELAS DI DINDING SAMPING)
          ======================================================== */}
      <group position={[outerWallX + (isLeftSide ? 0.15 : -0.15), 2.0, 1.5]}>
        <mesh rotation={[0, isLeftSide ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <boxGeometry args={[2.8, 1.4, 0.06]} />
          <meshStandardMaterial color="#b45309" roughness={0.9} />
        </mesh>
        {/* Pinned Paper Sheets */}
        <mesh position={[0, 0.2, 0]} rotation={[0, isLeftSide ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[1.2, 0.8]} />
          <meshStandardMaterial color="#fef08a" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[0, isLeftSide ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[1.1, 0.6]} />
          <meshStandardMaterial color="#bfdbfe" roughness={0.9} />
        </mesh>
      </group>

      {/* ========================================================
          8. ROWS OF SYMMETRICAL STUDENT DESKS (RAPI & TERATUR)
          2 Kolom meja berpasangan dengan gang tengah selebar 2.4m!
          ======================================================== */}
      {/* Left Student Desk Column (X = -2.4) and Right Column (X = 2.4) */}
      {[-2.4, 2.4].map((colX, colIdx) =>
        [-0.5, 1.8, 4.0].map((rowZ, rowIdx) => {
          // If this is where the exam desk sits, don't render a dummy desk!
          const isExamSpot = hasExamDesk && colIdx === 0 && rowIdx === 1;
          if (isExamSpot) return null;

          return (
            <group key={`s_desk_${colIdx}_${rowIdx}`} position={[colX, 0, rowZ]}>
              {/* Wooden Student Tabletop */}
              <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.4, 0.06, 0.65]} />
                <meshStandardMaterial color="#b45309" roughness={0.7} />
              </mesh>
              {/* Laci Meja Siswa */}
              <mesh position={[0, 0.58, 0]}>
                <boxGeometry args={[1.3, 0.16, 0.58]} />
                <meshStandardMaterial color="#92400e" roughness={0.8} />
              </mesh>
              {/* 4 Metal Legs */}
              <mesh position={[-0.6, 0.35, -0.25]}>
                <cylinderGeometry args={[0.02, 0.02, 0.7]} />
                <meshStandardMaterial color="#334155" metalness={0.7} />
              </mesh>
              <mesh position={[0.6, 0.35, -0.25]}>
                <cylinderGeometry args={[0.02, 0.02, 0.7]} />
                <meshStandardMaterial color="#334155" metalness={0.7} />
              </mesh>
              <mesh position={[-0.6, 0.35, 0.25]}>
                <cylinderGeometry args={[0.02, 0.02, 0.7]} />
                <meshStandardMaterial color="#334155" metalness={0.7} />
              </mesh>
              <mesh position={[0.6, 0.35, 0.25]}>
                <cylinderGeometry args={[0.02, 0.02, 0.7]} />
                <meshStandardMaterial color="#334155" metalness={0.7} />
              </mesh>

              {/* Paired Wooden Chairs Behind Desk */}
              {[-0.35, 0.35].map((chairX, chairI) => (
                <group key={`chair_${chairI}`} position={[chairX, 0, 0.62]}>
                  {/* Seat */}
                  <mesh position={[0, 0.42, 0]}>
                    <boxGeometry args={[0.42, 0.04, 0.4]} />
                    <meshStandardMaterial color="#78350f" roughness={0.8} />
                  </mesh>
                  {/* Backrest */}
                  <mesh position={[0, 0.75, 0.18]}>
                    <boxGeometry args={[0.4, 0.28, 0.04]} />
                    <meshStandardMaterial color="#78350f" roughness={0.8} />
                  </mesh>
                  {/* Legs */}
                  <mesh position={[-0.18, 0.21, -0.16]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.42]} />
                    <meshStandardMaterial color="#1e293b" />
                  </mesh>
                  <mesh position={[0.18, 0.21, -0.16]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.42]} />
                    <meshStandardMaterial color="#1e293b" />
                  </mesh>
                  <mesh position={[-0.18, 0.35, 0.16]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.7]} />
                    <meshStandardMaterial color="#1e293b" />
                  </mesh>
                  <mesh position={[0.18, 0.35, 0.16]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.7]} />
                    <meshStandardMaterial color="#1e293b" />
                  </mesh>
                </group>
              ))}
            </group>
          );
        })
      )}

      {/* ========================================================
          9. LEMARI BUKU KELAS (POJOK BELAKANG) & TEMPAT SAMPAH
          ======================================================== */}
      {/* Tall Wooden Cupboard */}
      <group position={[outerWallX + (isLeftSide ? 1.4 : -1.4), 0, halfD - 0.7]}>
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[2.0, 2.7, 0.65]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Book stacks */}
        {[0.6, 1.25, 1.9].map((sy, si) => (
          <mesh key={`shelf_${si}`} position={[0, sy, 0.12]}>
            <boxGeometry args={[1.8, 0.26, 0.5]} />
            <meshStandardMaterial color={si % 2 === 0 ? '#1e3a8a' : '#14532d'} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Blue School Trash Can Near Doorway */}
      <group position={[corridorWallX + (isLeftSide ? -0.5 : 0.5), 0, doorZ + doorW / 2 + 0.6]}>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 0.56, 12]} />
          <meshStandardMaterial color="#0284c7" roughness={0.5} />
        </mesh>
      </group>

      {/* Render the Active Exam Desk if assigned to this room */}
      {examDeskElement}
    </group>
  );
};
