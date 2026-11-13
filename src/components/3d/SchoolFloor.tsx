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

  // 5 Strategic Question Desk Placements in the expanded rooms:
  // Desk 0: Room 1 (XI RPL 1, Left) -> [-11.5, 0, 7.8]
  // Desk 1: Room 2 (XI TKJ 1, Right) -> [7.5, 0, 7.8]
  // Desk 2: Room 4 (XI TKJ 2, Right) -> [7.5, 0, -12.2]
  // Desk 3: Room 5 (XI MM 1, Left) -> [-11.5, 0, -32.2]
  // Desk 4: Room 7 (Lab Komputer, Left) -> [-11.5, 0, -52.2]
  const deskPositions: [number, number, number][] = useMemo(() => [
    [-11.5, 0, 7.8],
    [7.5, 0, 7.8],
    [7.5, 0, -12.2],
    [-11.5, 0, -32.2],
    [-11.5, 0, -52.2],
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
          LANTAI 4, 3, 2 (EXPANSIVE 88M CORRIDOR & 8 FULL ROOMS)
          ======================================================== */}
      {currentFloor > 1 && (
        <group>
          {/* Main Corridor Floor (Width = 7.0m, from X = -3.5 to +3.5, Length = 88m from Z = 14 to -74) */}
          <mesh position={[0, 0, -30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[7.0, 88]} />
            <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.1} />
          </mesh>

          {/* Corridor Ceiling */}
          <mesh position={[0, 3.8, -30]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 88]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* Corridor Ceiling Fluorescent Lights every 6m */}
          {[10, 4, -2, -8, -14, -20, -26, -32, -38, -44, -50, -56, -62, -68].map((z, i) => (
            <group key={`c_light_${i}`} position={[0, 3.72, z]}>
              <mesh>
                <boxGeometry args={[1.8, 0.08, 0.35]} />
                <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={0.85} />
              </mesh>
              <pointLight color="#bae6fd" intensity={1.1} distance={10} decay={2} />
            </group>
          ))}

          {/* Corridor North Back Wall (Z = 14) */}
          <mesh position={[0, 1.9, 14]}>
            <boxGeometry args={[7.0, 3.8, 0.3]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Big School Clock on Corridor North Back Wall */}
          <group position={[0, 2.9, 13.82]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.06, 24]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
          </group>

          {/* ========================================================
              CORRIDOR CONNECTING WALLS & LOCKERS
              ======================================================== */}
          {/* North connector (Z: 11.5 to 14.0) */}
          <mesh position={[-3.5, 1.9, 12.75]}>
            <boxGeometry args={[0.3, 3.8, 2.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
          <mesh position={[3.5, 1.9, 12.75]}>
            <boxGeometry args={[0.3, 3.8, 2.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>

          {/* Connector between Room 1/2 and Room 3/4 (Z: -8.5 to 0.5, length = 9.0) */}
          <group position={[-3.5, 0, -4.0]}>
            <mesh position={[0, 1.9, 0]}>
              <boxGeometry args={[0.3, 3.8, 9.0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[0.02, 0.65, 0]}>
              <boxGeometry args={[0.32, 1.3, 9.0]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* Student lockers */}
            {[-2.5, 0, 2.5].map((lz) => (
              <mesh key={`lockers_w1_${lz}`} position={[0.3, 1.2, lz]}>
                <boxGeometry args={[0.45, 2.4, 1.8]} />
                <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
          </group>

          <group position={[3.5, 0, -4.0]}>
            <mesh position={[0, 1.9, 0]}>
              <boxGeometry args={[0.3, 3.8, 9.0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[-0.02, 0.65, 0]}>
              <boxGeometry args={[0.32, 1.3, 9.0]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* Corridor bench */}
            <mesh position={[-0.4, 0.42, 0]}>
              <boxGeometry args={[0.6, 0.08, 2.4]} />
              <meshStandardMaterial color="#78350f" roughness={0.7} />
            </mesh>
          </group>

          {/* ========================================================
              CENTRAL CORRIDOR LOUNGE & LOBBY (Z: -28.5 to -19.5)
              ======================================================== */}
          <group position={[-3.5, 0, -24.0]}>
            <mesh position={[0, 1.9, 0]}>
              <boxGeometry args={[0.3, 3.8, 9.0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[0.02, 0.65, 0]}>
              <boxGeometry args={[0.32, 1.3, 9.0]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* Grand School Bulletin Board (Mading Sekolah) */}
            <mesh position={[0.18, 2.0, 0]}>
              <boxGeometry args={[0.06, 1.6, 4.0]} />
              <meshStandardMaterial color="#b45309" roughness={0.9} />
            </mesh>
          </group>

          <group position={[3.5, 0, -24.0]}>
            <mesh position={[0, 1.9, 0]}>
              <boxGeometry args={[0.3, 3.8, 9.0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[-0.02, 0.65, 0]}>
              <boxGeometry args={[0.32, 1.3, 9.0]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* Glass Trophy Cabinet (Lemari Piala Sekolah) */}
            <group position={[-0.35, 1.4, 0]}>
              <mesh>
                <boxGeometry args={[0.5, 2.6, 3.2]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
              {/* Glass door */}
              <mesh position={[-0.26, 0, 0]}>
                <boxGeometry args={[0.04, 2.4, 3.0]} />
                <meshStandardMaterial color="#bae6fd" roughness={0.1} metalness={0.9} transparent opacity={0.5} />
              </mesh>
              {/* Golden trophies inside */}
              {[-0.9, 0, 0.9].map((tx, ti) => (
                <mesh key={`trophy_${ti}`} position={[-0.1, 0.1, tx]}>
                  <cylinderGeometry args={[0.1, 0.06, 0.45, 12]} />
                  <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
                </mesh>
              ))}
            </group>
          </group>

          {/* Connector between Room 5/6 and Room 7/8 (Z: -48.5 to -39.5) */}
          <group position={[-3.5, 0, -44.0]}>
            <mesh position={[0, 1.9, 0]}>
              <boxGeometry args={[0.3, 3.8, 9.0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[0.02, 0.65, 0]}>
              <boxGeometry args={[0.32, 1.3, 9.0]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          </group>

          <group position={[3.5, 0, -44.0]}>
            <mesh position={[0, 1.9, 0]}>
              <boxGeometry args={[0.3, 3.8, 9.0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[-0.02, 0.65, 0]}>
              <boxGeometry args={[0.32, 1.3, 9.0]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* Lockers */}
            {[-2.0, 2.0].map((lz) => (
              <mesh key={`lockers_w3_${lz}`} position={[-0.3, 1.2, lz]}>
                <boxGeometry args={[0.45, 2.4, 1.8]} />
                <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
          </group>

          {/* South connector from Room 7/8 to Stair Gate (Z: -74 to -59.5) */}
          <mesh position={[-3.5, 1.9, -66.75]}>
            <boxGeometry args={[0.3, 3.8, 14.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
          <mesh position={[3.5, 1.9, -66.75]}>
            <boxGeometry args={[0.3, 3.8, 14.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>

          {/* Potted plants in corridor corners */}
          {[-2.8, 2.8].map((px) =>
            [-18, -30].map((pz) => (
              <group key={`plant_${px}_${pz}`} position={[px, 0, pz]}>
                <mesh position={[0, 0.35, 0]}>
                  <cylinderGeometry args={[0.3, 0.22, 0.7, 12]} />
                  <meshStandardMaterial color="#92400e" roughness={0.7} />
                </mesh>
                <mesh position={[0, 1.0, 0]}>
                  <coneGeometry args={[0.6, 1.2, 8]} />
                  <meshStandardMaterial color="#15803d" roughness={0.8} />
                </mesh>
              </group>
            ))
          )}

          {/* ========================================================
              8 FULLY REALIZED ROOMS ACROSS WINGS
              ======================================================== */}
          {/* WING 1: FRONT (Z = 6) */}
          <ClassroomRoom
            roomName="KELAS XI RPL 1"
            position={[-9.5, 0, 6]}
            isLeftSide={true}
            hasExamDesk={true}
          />
          <ClassroomRoom
            roomName="KELAS XI TKJ 1"
            position={[9.5, 0, 6]}
            isLeftSide={false}
            hasExamDesk={true}
          />

          {/* WING 2: MID-FRONT (Z = -14) */}
          <ClassroomRoom
            roomName="KELAS XI RPL 2"
            position={[-9.5, 0, -14]}
            isLeftSide={true}
            hasExamDesk={false}
          />
          <ClassroomRoom
            roomName="KELAS XI TKJ 2"
            position={[9.5, 0, -14]}
            isLeftSide={false}
            hasExamDesk={true}
          />

          {/* WING 3: MID-BACK (Z = -34) */}
          <ClassroomRoom
            roomName="KELAS XI MM 1 (DKV)"
            position={[-9.5, 0, -34]}
            isLeftSide={true}
            hasExamDesk={true}
          />
          <ClassroomRoom
            roomName="KELAS XI OTKP"
            position={[9.5, 0, -34]}
            isLeftSide={false}
            hasExamDesk={false}
          />

          {/* WING 4: BACK (Z = -54) */}
          <ClassroomRoom
            roomName="LAB KOMPUTER & PAI"
            position={[-9.5, 0, -54]}
            isLeftSide={true}
            hasExamDesk={true}
          />
          <ClassroomRoom
            roomName="PERPUSTAKAAN SEKOLAH"
            position={[9.5, 0, -54]}
            isLeftSide={false}
            hasExamDesk={false}
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
              STAIR KEY (Spawns in corridor at Z = -44 after 5 questions)
              ======================================================== */}
          {allFloorQuestionsSolved && !hasStairKey && !isGateUnlocked && (
            <KeyItem
              position={[0, 1.0, -44]}
              isNearby={nearbyInteractable?.type === 'stair_key'}
            />
          )}

          {/* ========================================================
              STAIR GATE & GATHERING ZONE AT END OF CORRIDOR (Z = -70)
              ======================================================== */}
          <StairGate
            position={[0, 0, -70]}
            isUnlocked={isGateUnlocked}
            hasKey={hasStairKey}
            gatheringCount={gatheringCount}
            totalPlayers={totalActivePlayers}
          />
        </group>
      )}

      {/* ========================================================
          LANTAI 1 & HALAMAN SEKOLAH LUAS (96M X 96M EXPANSIVE STAGE)
          ======================================================== */}
      {currentFloor === 1 && (
        <group>
          {/* Ground floor school entrance lobby / hallway (Width = 7.0m, Length = 30m, Z: 14 to -16) */}
          <mesh position={[0, 0, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[7.0, 30]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          <mesh position={[0, 3.8, -1]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 30]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.9, 14]}>
            <boxGeometry args={[7.0, 3.8, 0.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-3.5, 1.9, -1]}>
            <boxGeometry args={[0.3, 3.8, 30]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[3.5, 1.9, -1]}>
            <boxGeometry args={[0.3, 3.8, 30]} />
            <meshStandardMaterial color="#475569" />
          </mesh>

          {/* School Welcome Banner in Lobby */}
          <group position={[0, 3.1, 13.8]}>
            <mesh>
              <boxGeometry args={[5.2, 0.9, 0.05]} />
              <meshStandardMaterial color="#0284c7" roughness={0.4} />
            </mesh>
            <pointLight position={[0, 0, 0.4]} color="#bae6fd" intensity={1.5} distance={6} />
          </group>

          {/* School Building South Facade facing outdoor yard at Z = -16 */}
          <mesh position={[-25.75, 2.5, -16]}>
            <boxGeometry args={[44.5, 5.0, 0.4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[25.75, 2.5, -16]}>
            <boxGeometry args={[44.5, 5.0, 0.4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>

          {/* School Yard Outdoor Ground (Halaman Sekolah Luas 96m x 96m, Z: -16 to -112) */}
          <mesh position={[0, 0, -64]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[96, 96]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* Yard Outer Perimeter Boundary Walls */}
          {/* South Wall (Z = -108, left and right of gate at X in [-4.5, 4.5]) */}
          <mesh position={[-26.25, 2.2, -108]}>
            <boxGeometry args={[43.5, 4.4, 0.4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          <mesh position={[26.25, 2.2, -108]}>
            <boxGeometry args={[43.5, 4.4, 0.4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* West Wall (X = -48) */}
          <mesh position={[-48, 2.2, -64]}>
            <boxGeometry args={[0.4, 4.4, 96]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* East Wall (X = 48) */}
          <mesh position={[48, 2.2, -64]}>
            <boxGeometry args={[0.4, 4.4, 96]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>

          {/* Center Flagpole (Tiang Bendera Merah Putih) at [0, 0, -42] */}
          <group position={[0, 0, -42]}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[1.5, 1.8, 0.6, 16]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
            </mesh>
            <mesh position={[0, 6.5, 0]}>
              <cylinderGeometry args={[0.06, 0.09, 13, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Indonesian Flag */}
            <group position={[0.9, 12.0, 0]}>
              <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[1.8, 0.8, 0.02]} />
                <meshStandardMaterial color="#dc2626" roughness={0.6} />
              </mesh>
              <mesh position={[0, -0.4, 0]}>
                <boxGeometry args={[1.8, 0.8, 0.02]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.6} />
              </mesh>
            </group>
          </group>

          {/* Basketball / Futsal Sports Court at [22, 0, -48] */}
          <group position={[22, 0.02, -48]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[22, 32]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[3.2, 3.4, 32]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* North Basketball Hoop */}
            <group position={[0, 0, -15.5]}>
              <mesh position={[0, 2.2, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 4.4, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
              </mesh>
              <mesh position={[0, 4.0, 0.5]}>
                <boxGeometry args={[2.0, 1.3, 0.04]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
            </group>
            {/* South Basketball Hoop */}
            <group position={[0, 0, 15.5]}>
              <mesh position={[0, 2.2, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 4.4, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
              </mesh>
              <mesh position={[0, 4.0, -0.5]}>
                <boxGeometry args={[2.0, 1.3, 0.04]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
            </group>
          </group>

          {/* School Gazebo & Green Garden at [-24, 0, -38] */}
          <group position={[-24, 0, -38]}>
            {/* Gazebo floor */}
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[5.0, 0.5, 5.0]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            {/* 4 Pillars */}
            {[-2.2, 2.2].map((gx) =>
              [-2.2, 2.2].map((gz) => (
                <mesh key={`gaz_pil_${gx}_${gz}`} position={[gx, 1.6, gz]}>
                  <cylinderGeometry args={[0.08, 0.08, 2.8, 8]} />
                  <meshStandardMaterial color="#78350f" roughness={0.7} />
                </mesh>
              ))
            )}
            {/* Gazebo Roof */}
            <mesh position={[0, 3.6, 0]}>
              <coneGeometry args={[4.2, 1.6, 4]} />
              <meshStandardMaterial color="#991b1b" roughness={0.7} />
            </mesh>
            {/* Low-hanging lantern inside gazebo */}
            <pointLight position={[0, 2.6, 0]} color="#fef08a" intensity={1.5} distance={8} />
          </group>

          {/* Student Motorbike Parking Canopy at [24, 0, -82] */}
          <group position={[24, 0, -82]}>
            {/* Canopy roof */}
            <mesh position={[0, 2.8, 0]}>
              <boxGeometry args={[18, 0.1, 8.0]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
            </mesh>
            {/* Steel pillars */}
            {[-8, 0, 8].map((px) =>
              [-3.6, 3.6].map((pz) => (
                <mesh key={`park_pil_${px}_${pz}`} position={[px, 1.4, pz]}>
                  <cylinderGeometry args={[0.06, 0.06, 2.8, 8]} />
                  <meshStandardMaterial color="#64748b" metalness={0.9} />
                </mesh>
              ))
            )}
          </group>

          {/* Kantin Sekolah / Open Cafeteria at [-26, 0, -78] */}
          <group position={[-26, 0, -78]}>
            <mesh position={[0, 1.6, 0]}>
              <boxGeometry args={[14, 3.2, 7.0]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            <mesh position={[0, 3.3, 0]}>
              <boxGeometry args={[15, 0.25, 8.0]} />
              <meshStandardMaterial color="#b45309" roughness={0.7} />
            </mesh>
            {/* Warm light */}
            <pointLight position={[0, 2.4, 0]} color="#fde047" intensity={1.5} distance={10} />
          </group>

          {/* Security Guard Post / Pos Satpam (Master Key is hidden here!) at [-18, 0, -56] */}
          <group position={[-18, 0, -56]}>
            {/* Building */}
            <mesh position={[0, 1.6, 0]}>
              <boxGeometry args={[4.4, 3.2, 4.4]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 3.3, 0]}>
              <boxGeometry args={[5.0, 0.35, 5.0]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
            </mesh>
            {/* Door opening on East side */}
            <mesh position={[2.05, 1.3, 0]}>
              <boxGeometry args={[0.4, 2.6, 1.6]} />
              <meshBasicMaterial color="#020617" />
            </mesh>
            {/* Guard Desk */}
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[1.8, 0.1, 1.1]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            {/* Warm interior desk lamp */}
            <pointLight position={[0, 2.4, 0]} color="#fef08a" intensity={2.0} distance={7} />
          </group>

          {/* MASTER EXIT KEY IN POS SATPAM */}
          {!hasMasterKey && (
            <KeyItem
              position={[-18, 0.9, -56]}
              isMasterKey={true}
              isNearby={nearbyInteractable?.type === 'master_key'}
            />
          )}

          {/* Yard Streetlamps across the expanded 96m yard */}
          {[-30, 0, 30].map((x) =>
            [-30, -54, -78, -96].map((z) => (
              <group key={`yard_lamp_${x}_${z}`} position={[x, 0, z]}>
                <mesh position={[0, 3.2, 0]}>
                  <cylinderGeometry args={[0.08, 0.1, 6.4, 8]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.8} />
                </mesh>
                <mesh position={[0, 6.5, 0]}>
                  <sphereGeometry args={[0.26, 12, 12]} />
                  <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={0.85} />
                </mesh>
                <pointLight position={[0, 6.4, 0]} color="#fef08a" intensity={1.8} distance={18} decay={2} />
              </group>
            ))
          )}

          {/* Lush Low-poly Trees dotted around courtyard */}
          {[
            [-12, -22],
            [12, -22],
            [-36, -26],
            [-36, -50],
            [36, -26],
            [36, -50],
            [-38, -96],
            [38, -96],
            [-12, -98],
            [12, -98],
          ].map(([tx, tz], i) => (
            <group key={`tree_${i}`} position={[tx, 0, tz]}>
              <mesh position={[0, 1.6, 0]}>
                <cylinderGeometry args={[0.28, 0.4, 3.2, 8]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
              </mesh>
              <mesh position={[0, 4.2, 0]}>
                <coneGeometry args={[2.2, 4.2, 8]} />
                <meshStandardMaterial color="#14532d" roughness={0.8} />
              </mesh>
            </group>
          ))}

          {/* MAIN SCHOOL EXIT GATE (Gerbang Utama Sekolah) at Z = -104 */}
          <StairGate
            position={[0, 0, -104]}
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
