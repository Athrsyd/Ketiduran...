/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { PAI_QUESTIONS } from '../../data/questions';
import { ClassroomRoom } from './ClassroomRoom';
import { QuestionDesk } from './QuestionDesk';
import { KeyItem } from './KeyItem';
import { StairGate } from './StairGate';
import { RobotSupervisor } from './RobotSupervisor';
import { TeammateModel } from './TeammateModel';

export const SchoolFloor: React.FC = () => {
  const currentFloor = useGameStore((s) => s.currentFloor);
  const solvedQuestionIds = useGameStore((s) => s.solvedQuestionIds);
  const hasStairKey = useGameStore((s) => s.hasStairKey);
  const isGateUnlocked = useGameStore((s) => s.isGateUnlocked);
  const hasMasterKey = useGameStore((s) => s.hasMasterKey);
  const isExitGateUnlocked = useGameStore((s) => s.isExitGateUnlocked);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);
  const teammates = useGameStore((s) => s.teammates);
  const myIsInGatheringZone = useGameStore((s) => s.myIsInGatheringZone);

  // Questions for this floor
  const floorQuestions = useMemo(() => {
    return PAI_QUESTIONS.filter((q) => q.floor === currentFloor);
  }, [currentFloor]);

  // Desk placement coordinates: each sits precisely at the designated exam spot
  // Room 1 (XI RPL 1): [-10.9, 0, 3.8]
  // Room 2 (XI TKJ 1): [6.1, 0, 3.8]
  // Room 3 (XI MM 1): [-10.9, 0, -13.2]
  // Room 4 (XI OTKP 1): [6.1, 0, -13.2]
  // Room 5 (Lab Komputer & PAI): [-10.9, 0, -28.2]
  const deskPositions: [number, number, number][] = useMemo(() => [
    [-10.9, 0, 3.8],
    [6.1, 0, 3.8],
    [-10.9, 0, -13.2],
    [6.1, 0, -13.2],
    [-10.9, 0, -28.2],
  ], []);

  // Solved count on current floor
  const solvedCountOnFloor = floorQuestions.filter((q) =>
    solvedQuestionIds.includes(q.id)
  ).length;
  const allFloorQuestionsSolved = solvedCountOnFloor >= 5;

  // Gathering zone count
  const teammatesOnFloor = Object.values(teammates).filter((tm) => tm.currentFloor === currentFloor);
  const totalActivePlayers = teammatesOnFloor.length + 1;
  const gatheringCount = (myIsInGatheringZone ? 1 : 0) +
    teammatesOnFloor.filter((tm) => tm.isInGatheringZone).length;

  return (
    <group>
      {/* ========================================================
          RENDER TEAMMATES ON THIS FLOOR
          ======================================================== */}
      {teammatesOnFloor.map((tm) => (
        <TeammateModel key={tm.id} player={tm} />
      ))}

      {/* ========================================================
          LANTAI 4, 3, 2 (SPACIOUS SCHOOL CORRIDOR & CLEAN CLASSROOMS)
          ======================================================== */}
      {currentFloor > 1 && (
        <group>
          {/* Main Corridor Floor (Width = 5.2m, from X = -2.6 to +2.6, Length = 54m) */}
          <mesh position={[0, 0, -18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[5.2, 54]} />
            <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.1} />
          </mesh>

          {/* Corridor Ceiling */}
          <mesh position={[0, 3.6, -18]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5.2, 54]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* Corridor Ceiling Fluorescent Lights */}
          {[6, 0, -6, -12, -18, -24, -30, -36].map((z, i) => (
            <group key={`c_light_${i}`} position={[0, 3.5, z]}>
              <mesh>
                <boxGeometry args={[1.4, 0.08, 0.35]} />
                <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={0.8} />
              </mesh>
              <pointLight color="#bae6fd" intensity={1.1} distance={9} />
            </group>
          ))}

          {/* Corridor Back Wall (Z = 8.8) */}
          <mesh position={[0, 1.8, 8.8]}>
            <boxGeometry args={[5.2, 3.6, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* School Clock on Corridor Back Wall */}
          <group position={[0, 2.8, 8.68]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.05, 24]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
          </group>

          {/* Corridor Connecting Walls (between classrooms to close all gaps) */}
          {/* Left wall connector between Room 1 and Room 3 (Z: -3.5 to -9.5) */}
          <group position={[-2.6, 0, -6.5]}>
            <mesh position={[0, 1.8, 0]}>
              <boxGeometry args={[0.2, 3.6, 6.0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[0.02, 0.6, 0]}>
              <boxGeometry args={[0.2, 1.2, 6.0]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          </group>

          {/* Right wall connector between Room 2 and Room 4 (Z: -3.5 to -9.5) */}
          <group position={[2.6, 0, -6.5]}>
            <mesh position={[0, 1.8, 0]}>
              <boxGeometry args={[0.2, 3.6, 6.0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[-0.02, 0.6, 0]}>
              <boxGeometry args={[0.2, 1.2, 6.0]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          </group>

          {/* Left wall connector between Room 3 and Room 5 (Z: -20.5 to -24.5) */}
          <group position={[-2.6, 0, -22.5]}>
            <mesh position={[0, 1.8, 0]}>
              <boxGeometry args={[0.2, 3.6, 4.0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[0.02, 0.6, 0]}>
              <boxGeometry args={[0.2, 1.2, 4.0]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          </group>

          {/* Left wall connector from Room 5 to Stair Gate (Z: -35.5 to -42.0) */}
          <group position={[-2.6, 0, -38.75]}>
            <mesh position={[0, 1.8, 0]}>
              <boxGeometry args={[0.2, 3.6, 6.5]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[0.02, 0.6, 0]}>
              <boxGeometry args={[0.2, 1.2, 6.5]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          </group>

          {/* Right wall connector from Room 4 to Stair Gate (Z: -20.5 to -42.0) */}
          <group position={[2.6, 0, -31.25]}>
            <mesh position={[0, 1.8, 0]}>
              <boxGeometry args={[0.2, 3.6, 21.5]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[-0.02, 0.6, 0]}>
              <boxGeometry args={[0.2, 1.2, 21.5]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* Lockers along this long corridor wall */}
            {[-6, -2, 2, 6].map((lz) => (
              <mesh key={`corr_locker_${lz}`} position={[-0.3, 1.2, lz]}>
                <boxGeometry args={[0.45, 2.4, 1.6]} />
                <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.3} />
              </mesh>
            ))}
          </group>

          {/* Corridor Benches */}
          {[-6.5, -22.5].map((bz) => (
            <group key={`c_bench_${bz}`} position={[-2.2, 0, bz]}>
              <mesh position={[0, 0.42, 0]}>
                <boxGeometry args={[0.5, 0.08, 1.8]} />
                <meshStandardMaterial color="#78350f" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.21, -0.7]}>
                <cylinderGeometry args={[0.02, 0.02, 0.42]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0, 0.21, 0.7]}>
                <cylinderGeometry args={[0.02, 0.02, 0.42]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
            </group>
          ))}

          {/* ========================================================
              5 DETAILED INDONESIAN CLASSROOMS
              ======================================================== */}
          {/* CLASSROOM 1: XI RPL 1 (Kiri Depan) */}
          <ClassroomRoom
            roomName="KELAS XI RPL 1"
            position={[-8.5, 0, 2]}
            isLeftSide={true}
            hasExamDesk={true}
          />

          {/* CLASSROOM 2: XI TKJ 1 (Kanan Depan) */}
          <ClassroomRoom
            roomName="KELAS XI TKJ 1"
            position={[8.5, 0, 2]}
            isLeftSide={false}
            hasExamDesk={true}
          />

          {/* CLASSROOM 3: XI MM 1 (Kiri Tengah) */}
          <ClassroomRoom
            roomName="KELAS XI MM 1"
            position={[-8.5, 0, -15]}
            isLeftSide={true}
            hasExamDesk={true}
          />

          {/* CLASSROOM 4: XI OTKP 1 (Kanan Tengah) */}
          <ClassroomRoom
            roomName="KELAS XI OTKP 1"
            position={[8.5, 0, -15]}
            isLeftSide={false}
            hasExamDesk={true}
          />

          {/* CLASSROOM 5: LAB KOMPUTER & PAI (Kiri Belakang) */}
          <ClassroomRoom
            roomName="LAB KOMPUTER & PAI"
            position={[-8.5, 0, -30]}
            isLeftSide={true}
            hasExamDesk={true}
          />

          {/* ========================================================
              5 INTERACTIVE QUESTION DESKS
              ======================================================== */}
          {floorQuestions.map((q, idx) => {
            const pos = deskPositions[idx] || [0, 0, 0];
            const isSolved = solvedQuestionIds.includes(q.id);
            const isNearby = nearbyInteractable?.id === q.id;
            return (
              <QuestionDesk
                key={q.id}
                question={q}
                position={pos}
                isSolved={isSolved}
                isNearby={isNearby}
              />
            );
          })}

          {/* ========================================================
              STAIR KEY (Spawns in corridor after 5 questions)
              ======================================================== */}
          {allFloorQuestionsSolved && !hasStairKey && !isGateUnlocked && (
            <KeyItem
              position={[0, 1.0, -36]}
              isNearby={nearbyInteractable?.type === 'stair_key'}
            />
          )}

          {/* ========================================================
              STAIR GATE & GATHERING ZONE AT END OF CORRIDOR (Z = -42)
              ======================================================== */}
          <StairGate
            position={[0, 0, -42]}
            isUnlocked={isGateUnlocked}
            hasKey={hasStairKey}
            gatheringCount={gatheringCount}
            totalPlayers={totalActivePlayers}
          />
        </group>
      )}

      {/* ========================================================
          LANTAI 1 & HALAMAN SEKOLAH LUAS (EXPANSIVE FINAL STAGE)
          ======================================================== */}
      {currentFloor === 1 && (
        <group>
          {/* Ground floor main corridor (Width = 5.2m, Length = 20m) */}
          <mesh position={[0, 0, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[5.2, 20]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          <mesh position={[-2.6, 1.8, 2]}>
            <boxGeometry args={[0.2, 3.6, 20]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[2.6, 1.8, 2]}>
            <boxGeometry args={[0.2, 3.6, 20]} />
            <meshStandardMaterial color="#475569" />
          </mesh>

          {/* School Yard Outdoor Ground (Halaman Sekolah Luas 64m x 64m) */}
          <mesh position={[0, 0, -34]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[64, 64]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* Outer Perimeter Wall */}
          <mesh position={[0, 2.2, -66]}>
            <boxGeometry args={[64, 4.4, 0.4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          <mesh position={[-32, 2.2, -34]}>
            <boxGeometry args={[0.4, 4.4, 64]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          <mesh position={[32, 2.2, -34]}>
            <boxGeometry args={[0.4, 4.4, 64]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>

          {/* Basketball Court Floor Lines (Lapangan Olahraga Sekolah) */}
          <group position={[12, 0.02, -32]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[18, 28]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
            </mesh>
            {/* Center circle */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.8, 3.0, 32]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Basketball Hoop Poles */}
            <group position={[0, 0, -13.5]}>
              <mesh position={[0, 2.0, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 4.0, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
              </mesh>
              <mesh position={[0, 3.8, 0.4]}>
                <boxGeometry args={[1.8, 1.2, 0.04]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
            </group>
            <group position={[0, 0, 13.5]}>
              <mesh position={[0, 2.0, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 4.0, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
              </mesh>
              <mesh position={[0, 3.8, -0.4]}>
                <boxGeometry args={[1.8, 1.2, 0.04]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
            </group>
          </group>

          {/* Center Flagpole (Tiang Bendera Merah Putih) */}
          <group position={[0, 0, -26]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[1.2, 1.5, 0.5, 16]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
            </mesh>
            <mesh position={[0, 5.5, 0]}>
              <cylinderGeometry args={[0.05, 0.08, 11, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Indonesian Flag (Merah Putih) */}
            <group position={[0.8, 10.2, 0]}>
              <mesh position={[0, 0.35, 0]}>
                <boxGeometry args={[1.5, 0.65, 0.02]} />
                <meshStandardMaterial color="#dc2626" roughness={0.6} />
              </mesh>
              <mesh position={[0, -0.35, 0]}>
                <boxGeometry args={[1.5, 0.65, 0.02]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.6} />
              </mesh>
            </group>
          </group>

          {/* Security Guard Post / Pos Satpam (Where Master Key is hidden!) */}
          <group position={[-18, 0, -32]}>
            {/* Guard Post Building */}
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[3.8, 3.0, 3.8]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
            {/* Post Roof */}
            <mesh position={[0, 3.1, 0]}>
              <boxGeometry args={[4.4, 0.35, 4.4]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
            </mesh>
            {/* Door opening */}
            <mesh position={[1.75, 1.2, 0]}>
              <boxGeometry args={[0.4, 2.4, 1.4]} />
              <meshBasicMaterial color="#020617" />
            </mesh>
            {/* Interior Guard Desk */}
            <mesh position={[0, 0.65, 0]}>
              <boxGeometry args={[1.5, 0.1, 0.9]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            <pointLight position={[0, 2.2, 0]} color="#fef08a" intensity={1.8} distance={6} />
          </group>

          {/* MASTER EXIT KEY IN POS SATPAM */}
          {!hasMasterKey && (
            <KeyItem
              position={[-18, 0.9, -32]}
              isMasterKey={true}
              isNearby={nearbyInteractable?.type === 'master_key'}
            />
          )}

          {/* School Yard Yard Lamps */}
          {[-16, 0, 16].map((x) =>
            [-16, -34, -50].map((z) => (
              <group key={`yard_lamp_${x}_${z}`} position={[x, 0, z]}>
                <mesh position={[0, 2.8, 0]}>
                  <cylinderGeometry args={[0.07, 0.09, 5.6, 8]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.8} />
                </mesh>
                <mesh position={[0, 5.7, 0]}>
                  <sphereGeometry args={[0.24, 12, 12]} />
                  <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={0.8} />
                </mesh>
                <pointLight position={[0, 5.6, 0]} color="#fef08a" intensity={1.6} distance={16} />
              </group>
            ))
          )}

          {/* School Trees (Procedural Low-poly) */}
          {[
            [-10, -14],
            [10, -14],
            [-24, -20],
            [-24, -46],
            [24, -20],
            [24, -46],
            [-8, -50],
            [8, -50],
          ].map(([tx, tz], i) => (
            <group key={`tree_${i}`} position={[tx, 0, tz]}>
              <mesh position={[0, 1.4, 0]}>
                <cylinderGeometry args={[0.25, 0.35, 2.8, 8]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
              </mesh>
              <mesh position={[0, 3.8, 0]}>
                <coneGeometry args={[1.8, 3.6, 8]} />
                <meshStandardMaterial color="#14532d" roughness={0.8} />
              </mesh>
            </group>
          ))}

          {/* MAIN SCHOOL EXIT GATE (Gerbang Utama Sekolah) at z = -56 */}
          <StairGate
            position={[0, 0, -56]}
            isUnlocked={isExitGateUnlocked}
            hasKey={hasMasterKey}
            gatheringCount={gatheringCount}
            totalPlayers={totalActivePlayers}
            isExitGate={true}
          />

          {/* ROBOT SUPERVISOR AI ENEMY */}
          <RobotSupervisor />
        </group>
      )}
    </group>
  );
};
