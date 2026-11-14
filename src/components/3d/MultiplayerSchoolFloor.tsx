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
import { getMasterKeySpawn } from '../../data/floor1Spawns';

export const MultiplayerSchoolFloor: React.FC = () => {
  const currentFloor = useGameStore((s) => s.currentFloor);
  const solvedQuestionIds = useGameStore((s) => s.solvedQuestionIds);
  const hasStairKey = useGameStore((s) => s.hasStairKey);
  const isGateUnlocked = useGameStore((s) => s.isGateUnlocked);
  const hasMasterKey = useGameStore((s) => s.hasMasterKey);
  const masterKeySpawnIndex = useGameStore((s) => s.masterKeySpawnIndex);
  const isExitGateUnlocked = useGameStore((s) => s.isExitGateUnlocked);
  const nearbyQuestionId = useGameStore((s) =>
    s.nearbyInteractable?.type === 'question' ? s.nearbyInteractable.id : null
  );
  const isStairKeyNearby = useGameStore((s) => s.nearbyInteractable?.type === 'stair_key');
  const isMasterKeyNearby = useGameStore((s) => s.nearbyInteractable?.type === 'master_key');
  const teammates = useGameStore((s) => s.teammates);
  const myIsInGatheringZone = useGameStore((s) => s.myIsInGatheringZone);

  // Questions on this floor
  const floorQuestions = useMemo(() => {
    return PAI_QUESTIONS.filter((q) => q.floor === currentFloor);
  }, [currentFloor]);

  const solvedCountOnFloor = floorQuestions.filter((q) =>
    solvedQuestionIds.includes(q.id)
  ).length;
  const allFloorQuestionsSolved = solvedCountOnFloor >= 5;

  // Gathering status
  const teammatesOnFloor = Object.values(teammates).filter((tm) => tm.currentFloor === currentFloor);
  const totalActivePlayers = teammatesOnFloor.length + 1;
  const gatheringCount =
    (myIsInGatheringZone ? 1 : 0) +
    teammatesOnFloor.filter((tm) => tm.isInGatheringZone).length;

  return (
    <group>
      {/* Teammates on this floor */}
      {teammatesOnFloor.map((tm) => (
        <TeammateModel key={tm.id} player={tm} />
      ))}

      {/* =========================================================================
          LANTAI 4: SAYAP SILANG (CROSS-WINGS LAYOUT)
          Koridor Tengah + Sayap Barat di Z=-16 + Sayap Timur di Z=-46
          ========================================================================= */}
      {currentFloor === 4 && (
        <group>
          {/* Main Central Corridor (X: -3.5 to +3.5, Z: +14 to -74, Length: 88m) */}
          <mesh position={[0, 0, -30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[7.0, 88]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          <mesh position={[0, 3.8, -30]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 88]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* West Wing Corridor (Z: -19 to -13, X: -3.5 to -36, Width: 6m, Length: 32.5m) */}
          <mesh position={[-19.75, 0, -16]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[32.5, 6.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          <mesh position={[-19.75, 3.8, -16]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[32.5, 6.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* East Wing Corridor (Z: -49 to -43, X: +3.5 to +36, Width: 6m, Length: 32.5m) */}
          <mesh position={[19.75, 0, -46]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[32.5, 6.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          <mesh position={[19.75, 3.8, -46]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[32.5, 6.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* Corridor Fluorescent Ceiling Lights (Zero GC Unlit) */}
          {[10, 0, -16, -30, -46, -60].map((z, i) => (
            <mesh key={`l4_c_light_${i}`} position={[0, 3.75, z]}>
              <boxGeometry args={[1.8, 0.08, 0.35]} />
              <meshBasicMaterial color="#e0f2fe" />
            </mesh>
          ))}
          {/* Wing Lights */}
          {[-10, -20, -30].map((x, i) => (
            <mesh key={`l4_ww_light_${i}`} position={[x, 3.75, -16]}>
              <boxGeometry args={[0.35, 0.08, 1.8]} />
              <meshBasicMaterial color="#e0f2fe" />
            </mesh>
          ))}
          {[10, 20, 30].map((x, i) => (
            <mesh key={`l4_ew_light_${i}`} position={[x, 3.75, -46]}>
              <boxGeometry args={[0.35, 0.08, 1.8]} />
              <meshBasicMaterial color="#e0f2fe" />
            </mesh>
          ))}

          {/* Soft Downlights for Atmosphere */}
          {[
            [0, 3.5, 6],
            [-22, 3.5, -16],
            [0, 3.5, -30],
            [22, 3.5, -46],
            [0, 3.5, -64],
          ].map(([lx, ly, lz], i) => (
            <pointLight
              key={`l4_soft_${i}`}
              position={[lx, ly, lz]}
              color="#bae6fd"
              intensity={1.2}
              distance={24}
              decay={2}
            />
          ))}

          {/* Perimeter Boundary & Solid Dividing Walls */}
          {/* North Back Wall */}
          <mesh position={[0, 1.9, 14]}>
            <boxGeometry args={[7.0, 3.8, 0.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* South Back Wall (Z = -74, X: -3.5 to 3.5) */}
          <mesh position={[0, 1.9, -74]}>
            <boxGeometry args={[7.0, 3.8, 0.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* Seamless Doorway Threshold Floor Plates (Zero Gap Connectors) */}
          <mesh position={[-29.2, 0.005, -13.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 0.8]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          <mesh position={[-26.8, 0.005, -19.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 0.8]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          <mesh position={[26.8, 0.005, -43.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 0.8]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          <mesh position={[29.2, 0.005, -49.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 0.8]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          <mesh position={[-3.5, 0.005, 4.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 3.2]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>

          {/* Central Corridor West Walls (with openings for Room 4 at Z: [3.5, 6.5] and West Wing at Z: [-19, -13]) */}
          <mesh position={[-3.5, 1.9, 10.25]}>
            <boxGeometry args={[0.3, 3.8, 7.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-3.5, 1.9, -4.75]}>
            <boxGeometry args={[0.3, 3.8, 16.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-3.5, 1.9, -46.5]}>
            <boxGeometry args={[0.3, 3.8, 55]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* Central Corridor East Walls (except opening for East Wing at Z: -49 to -43) */}
          <mesh position={[3.5, 1.9, -14.5]}>
            <boxGeometry args={[0.3, 3.8, 57]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[3.5, 1.9, -61.5]}>
            <boxGeometry args={[0.3, 3.8, 25]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* West Wing Corridor Walls (with openings for Room 0 at X: [-30.5, -27.5] and Room 1 at X: [-28, -25]) */}
          <mesh position={[-15.5, 1.9, -13]}>
            <boxGeometry args={[24.0, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-33.25, 1.9, -13]}>
            <boxGeometry args={[5.5, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-14.25, 1.9, -19]}>
            <boxGeometry args={[21.5, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-32.0, 1.9, -19]}>
            <boxGeometry args={[8.0, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-36, 1.9, -16]}>
            <boxGeometry args={[0.3, 3.8, 6.0]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* East Wing Corridor Walls (with openings for Room 2 at X: [25.5, 28.5] and Room 3 at X: [27.5, 30.5]) */}
          <mesh position={[14.5, 1.9, -43]}>
            <boxGeometry args={[22.0, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[32.25, 1.9, -43]}>
            <boxGeometry args={[7.5, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[15.5, 1.9, -49]}>
            <boxGeometry args={[24.0, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[33.25, 1.9, -49]}>
            <boxGeometry args={[5.5, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[36, 1.9, -46]}>
            <boxGeometry args={[0.3, 3.8, 6.0]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* Wayfinding Directional Signs on Floor 4 */}
          <group position={[0, 3.0, -15.8]}>
            <mesh>
              <boxGeometry args={[3.2, 0.6, 0.05]} />
              <meshStandardMaterial color="#0284c7" />
            </mesh>
          </group>

          {/* 5 Distinct Classrooms with Question Desks */}
          {/* Room 0: Lab Jaringan di Ujung Sayap Barat [-28, 0, -7] */}
          <ClassroomRoom
            roomName="Lab Jaringan & Cloud (Sayap Barat)"
            position={[-28, 0, -7]}
            rotation={[0, Math.PI / 2, 0]}
            isLeftSide={true}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[0] ? (
                <QuestionDesk
                  question={floorQuestions[0]}
                  position={[-2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[0].id)}
                  isNearby={nearbyQuestionId === floorQuestions[0].id}
                />
              ) : null
            }
          />

          {/* Room 1: Lab Server di Ujung Sayap Barat [-28, 0, -25] */}
          <ClassroomRoom
            roomName="Lab Server & SIJA (Sayap Barat)"
            position={[-28, 0, -25]}
            rotation={[0, -Math.PI / 2, 0]}
            isLeftSide={true}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[1] ? (
                <QuestionDesk
                  question={floorQuestions[1]}
                  position={[2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[1].id)}
                  isNearby={nearbyQuestionId === floorQuestions[1].id}
                />
              ) : null
            }
          />

          {/* Room 2: Lab Multimedia di Ujung Sayap Timur [28, 0, -37] */}
          <ClassroomRoom
            roomName="Lab Multimedia & Audio (Sayap Timur)"
            position={[28, 0, -37]}
            rotation={[0, Math.PI / 2, 0]}
            isLeftSide={true}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[2] ? (
                <QuestionDesk
                  question={floorQuestions[2]}
                  position={[-2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[2].id)}
                  isNearby={nearbyQuestionId === floorQuestions[2].id}
                />
              ) : null
            }
          />

          {/* Room 3: Lab Desain Grafis di Ujung Sayap Timur [28, 0, -55] */}
          <ClassroomRoom
            roomName="Lab Desain & Animasi (Sayap Timur)"
            position={[28, 0, -55]}
            rotation={[0, -Math.PI / 2, 0]}
            isLeftSide={true}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[3] ? (
                <QuestionDesk
                  question={floorQuestions[3]}
                  position={[2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[3].id)}
                  isNearby={nearbyQuestionId === floorQuestions[3].id}
                />
              ) : null
            }
          />

          {/* Room 4: Ruang Teori PAI di Koridor Tengah [-9.5, 0, 6] */}
          <ClassroomRoom
            roomName="Ruang PAI & Karakter (Utara)"
            position={[-9.5, 0, 6]}
            isLeftSide={true}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[4] ? (
                <QuestionDesk
                  question={floorQuestions[4]}
                  position={[-2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[4].id)}
                  isNearby={nearbyQuestionId === floorQuestions[4].id}
                />
              ) : null
            }
          />

          {/* Stair Key in Cross-Wing Center [0, 1.0, -30] */}
          {allFloorQuestionsSolved && !hasStairKey && !isGateUnlocked && (
            <KeyItem position={[0, 1.0, -30]} isNearby={isStairKeyNearby} />
          )}

          {/* Stair Gate at Z = -70 */}
          <StairGate
            position={[0, 0, -70]}
            isUnlocked={isGateUnlocked}
            hasKey={hasStairKey}
            gatheringCount={gatheringCount}
            totalPlayers={totalActivePlayers}
          />
        </group>
      )}

      {/* =========================================================================
          LANTAI 3: ATRIUM MELINGKAR (U-LOOP RING & COURTYARD VOID)
          Koridor Bercabang Barat & Timur mengelilingi Atrium Tengah Terbuka
          ========================================================================= */}
      {currentFloor === 3 && (
        <group>
          {/* North Connector Corridor (Z: +14 to 0, X: -19 to +19) */}
          <mesh position={[0, 0, 7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[38, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          <mesh position={[0, 3.8, 7]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[38, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* West Branch Corridor (X: -16, Z: 0 to -60, Width: 6m, Length: 60m) */}
          <mesh position={[-16, 0, -30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[6.0, 60]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          <mesh position={[-16, 3.8, -30]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.0, 60]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* East Branch Corridor (X: +16, Z: 0 to -60, Width: 6m, Length: 60m) */}
          <mesh position={[16, 0, -30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[6.0, 60]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          <mesh position={[16, 3.8, -30]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.0, 60]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* Central Connecting Skywalk Bridge (Z: -30, X: -13 to +13, Width: 5m) */}
          <mesh position={[0, 0.05, -30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[26, 5.0]} />
            <meshStandardMaterial color="#334155" roughness={0.4} />
          </mesh>

          {/* South Connector Corridor (Z: -60 to -74, X: -19 to +19) */}
          <mesh position={[0, 0, -67]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[38, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          <mesh position={[0, 3.8, -67]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[38, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* Central Open Atrium Garden Void (X: -13 to +13, Z: -2.5 to -57.5) */}
          <group position={[0, 0, -30]}>
            {/* Gravel / Garden Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[26, 55]} />
              <meshStandardMaterial color="#020617" roughness={0.9} />
            </mesh>
            {/* Atrium Fountain / Center Monument */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[2.5, 3.0, 0.8, 16]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.6} />
            </mesh>
            {/* Soft Atrium Sky Light */}
            <pointLight position={[0, 6.0, 0]} color="#38bdf8" intensity={1.8} distance={35} />
          </group>

          {/* Fluorescent Lights across U-loop */}
          {[-16, 16].map((x) =>
            [5, -15, -30, -45, -65].map((z, i) => (
              <mesh key={`l3_light_${x}_${z}`} position={[x, 3.75, z]}>
                <boxGeometry args={[1.8, 0.08, 0.35]} />
                <meshBasicMaterial color="#e0f2fe" />
              </mesh>
            ))
          )}

          {/* ========================================================
              LANTAI 3 SOLID CORRIDOR & ATRIUM WALLS
              ======================================================== */}
          {/* North Back Wall (Z = 14, X: -19 to 19) */}
          <mesh position={[0, 1.9, 14]}>
            <boxGeometry args={[38, 3.8, 0.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* North Hallway West & East End Walls */}
          <mesh position={[-19, 1.9, 7]}>
            <boxGeometry args={[0.3, 3.8, 14]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[19, 1.9, 7]}>
            <boxGeometry args={[0.3, 3.8, 14]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* North Wall facing Garden Atrium (Z = 0, X: -13 to 13) */}
          <mesh position={[0, 1.9, 0]}>
            <boxGeometry args={[26, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* West Branch Corridor Outer Walls (X = -19, with door gaps for Room 0 & Room 1) */}
          <mesh position={[-19, 1.9, -6.0]}>
            <boxGeometry args={[0.3, 3.8, 12.0]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-19, 1.9, -31.2]}>
            <boxGeometry args={[0.3, 3.8, 33.6]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-19, 1.9, -55.2]}>
            <boxGeometry args={[0.3, 3.8, 9.6]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* West Branch Corridor Inner Walls (X = -13, facing Garden Atrium, with opening for Skywalk at Z: -32.5 to -27.5) */}
          <mesh position={[-13, 1.9, -13.75]}>
            <boxGeometry args={[0.3, 3.8, 27.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-13, 1.9, -46.25]}>
            <boxGeometry args={[0.3, 3.8, 27.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* East Branch Corridor Outer Walls (X = 19, with door gaps for Room 2 & Room 3) */}
          <mesh position={[19, 1.9, -6.0]}>
            <boxGeometry args={[0.3, 3.8, 12.0]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[19, 1.9, -31.2]}>
            <boxGeometry args={[0.3, 3.8, 33.6]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[19, 1.9, -55.2]}>
            <boxGeometry args={[0.3, 3.8, 9.6]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* East Branch Corridor Inner Walls (X = 13, facing Garden Atrium, with opening for Skywalk at Z: -32.5 to -27.5) */}
          <mesh position={[13, 1.9, -13.75]}>
            <boxGeometry args={[0.3, 3.8, 27.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[13, 1.9, -46.25]}>
            <boxGeometry args={[0.3, 3.8, 27.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* Central Skywalk Bridge Railings (Z: -27.5 and -32.5, X: -13 to 13) */}
          <mesh position={[0, 1.1, -27.5]}>
            <boxGeometry args={[26, 2.2, 0.2]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.1, -32.5]}>
            <boxGeometry args={[26, 2.2, 0.2]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* South Connector Corridor Walls */}
          {/* South Wall facing Garden Atrium (Z = -60, X: -13 to 13) */}
          <mesh position={[0, 1.9, -60]}>
            <boxGeometry args={[26, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* South Hallway West & East End Walls */}
          <mesh position={[-19, 1.9, -67]}>
            <boxGeometry args={[0.3, 3.8, 14]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[19, 1.9, -67]}>
            <boxGeometry args={[0.3, 3.8, 14]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* South End Wall (Z = -74, X: -19 to 19) */}
          <mesh position={[0, 1.9, -74]}>
            <boxGeometry args={[38, 3.8, 0.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* 5 Rooms on Outer Edges of Atrium */}
          {/* Room 0: XI MM 1 di Sisi Barat Luar [-25, 0, -12] */}
          <ClassroomRoom
            roomName="XI MM 1 (Animasi 3D)"
            position={[-25, 0, -12]}
            isLeftSide={true}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[0] ? (
                <QuestionDesk
                  question={floorQuestions[0]}
                  position={[-2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[0].id)}
                  isNearby={nearbyQuestionId === floorQuestions[0].id}
                />
              ) : null
            }
          />

          {/* Room 1: XI MM 2 di Sisi Barat Luar [-25, 0, -48] */}
          <ClassroomRoom
            roomName="XI MM 2 (Broadcasting)"
            position={[-25, 0, -48]}
            isLeftSide={true}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[1] ? (
                <QuestionDesk
                  question={floorQuestions[1]}
                  position={[-2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[1].id)}
                  isNearby={nearbyQuestionId === floorQuestions[1].id}
                />
              ) : null
            }
          />

          {/* Room 2: XI DKV 1 di Sisi Timur Luar [25, 0, -12] */}
          <ClassroomRoom
            roomName="XI DKV 1 (Ilustrasi)"
            position={[25, 0, -12]}
            isLeftSide={false}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[2] ? (
                <QuestionDesk
                  question={floorQuestions[2]}
                  position={[2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[2].id)}
                  isNearby={nearbyQuestionId === floorQuestions[2].id}
                />
              ) : null
            }
          />

          {/* Room 3: XI DKV 2 di Sisi Timur Luar [25, 0, -48] */}
          <ClassroomRoom
            roomName="XI DKV 2 (Tipografi)"
            position={[25, 0, -48]}
            isLeftSide={false}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[3] ? (
                <QuestionDesk
                  question={floorQuestions[3]}
                  position={[2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[3].id)}
                  isNearby={nearbyQuestionId === floorQuestions[3].id}
                />
              ) : null
            }
          />

          {/* Room 4: Skywalk Atrium Center Pavilion [0, 0, -30] */}
          {floorQuestions[4] && (
            <QuestionDesk
              question={floorQuestions[4]}
              position={[0, 0, -30]}
              isSolved={solvedQuestionIds.includes(floorQuestions[4].id)}
              isNearby={nearbyQuestionId === floorQuestions[4].id}
            />
          )}

          {/* Stair Key at North Atrium Entrance [0, 1.0, 2] */}
          {allFloorQuestionsSolved && !hasStairKey && !isGateUnlocked && (
            <KeyItem position={[0, 1.0, 2]} isNearby={isStairKeyNearby} />
          )}

          {/* Stair Gate at South End [0, 0, -70] */}
          <StairGate
            position={[0, 0, -70]}
            isUnlocked={isGateUnlocked}
            hasKey={hasStairKey}
            gatheringCount={gatheringCount}
            totalPlayers={totalActivePlayers}
          />
        </group>
      )}

      {/* =========================================================================
          LANTAI 2: LORONG BERLIKU (ZIG-ZAG LABYRINTH WINGS)
          Koridor Berliku Tajam S-Shape Melintasi Sayap Barat & Timur
          ========================================================================= */}
      {currentFloor === 2 && (
        <group>
          {/* Segment 1: North Center (Z: +14 to 0, X: -3.5 to +3.5) */}
          <mesh position={[0, 0, 7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[7.0, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>

          {/* Turn 1: West Cross Hallway (Z: -3.5 to +3.5, X: -22 to +3.5) */}
          <mesh position={[-9.25, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[25.5, 7.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>

          {/* Segment 2: West South Hallway (X: -22 to -15, Z: 0 to -30) */}
          <mesh position={[-18.5, 0, -15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[7.0, 30]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>

          {/* Turn 2: Central Transverse Bridge (Z: -33.5 to -26.5, X: -22 to +22) */}
          <mesh position={[0, 0, -30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[44, 7.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>

          {/* Segment 3: East South Hallway (X: +15 to +22, Z: -30 to -60) */}
          <mesh position={[18.5, 0, -45]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[7.0, 30]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>

          {/* Turn 3: Return to Center (Z: -63.5 to -56.5, X: -3.5 to +22) */}
          <mesh position={[9.25, 0, -60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[25.5, 7.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>

          {/* Segment 4: South Gate Hallway (X: -3.5 to +3.5, Z: -60 to -74) */}
          <mesh position={[0, 0, -67]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[7.0, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>

          {/* Ceilings for every corridor segment in Floor 2 */}
          <mesh position={[0, 3.8, 7]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[-9.25, 3.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[25.5, 7.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[-18.5, 3.8, -15]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 30]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.8, -30]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[44, 7.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[18.5, 3.8, -45]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 30]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[9.25, 3.8, -60]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[25.5, 7.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.8, -67]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* Corridor Fluorescent Ceiling Lights */}
          {[
            [0, 3.75, 7],
            [-9.25, 3.75, 0],
            [-18.5, 3.75, -8],
            [-18.5, 3.75, -22],
            [-10, 3.75, -30],
            [0, 3.75, -30],
            [10, 3.75, -30],
            [18.5, 3.75, -38],
            [18.5, 3.75, -52],
            [9.25, 3.75, -60],
            [0, 3.75, -67],
          ].map(([lx, ly, lz], i) => (
            <mesh key={`l2_light_${i}`} position={[lx, ly, lz]}>
              <boxGeometry args={[1.8, 0.08, 0.35]} />
              <meshBasicMaterial color="#e0f2fe" />
            </mesh>
          ))}

          {/* ========================================================
              LANTAI 2 SOLID WALLS (ZIG-ZAG LABYRINTH CORRIDORS)
              ======================================================== */}
          {/* North Back Wall (Z = 14, X: -3.5 to 3.5) */}
          <mesh position={[0, 1.9, 14]}>
            <boxGeometry args={[7.0, 3.8, 0.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* East Wall of Segment 1 (X = 3.5, Z: 14 to -3.5) */}
          <mesh position={[3.5, 1.9, 5.25]}>
            <boxGeometry args={[0.3, 3.8, 17.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* West Wall of Segment 1 (X = -3.5, Z: 14 to 3.5) */}
          <mesh position={[-3.5, 1.9, 8.75]}>
            <boxGeometry args={[0.3, 3.8, 10.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* Turn 1 North Wall (Z = 3.5, X: -22 to -3.5) */}
          <mesh position={[-12.75, 1.9, 3.5]}>
            <boxGeometry args={[18.5, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Turn 1 South Wall (Z = -3.5, X: -15 to 3.5) */}
          <mesh position={[-5.75, 1.9, -3.5]}>
            <boxGeometry args={[18.5, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* Segment 2 West Outer Wall (X = -22, with door gaps for Room 0 & Room 1) */}
          <mesh position={[-22, 1.9, -3.25]}>
            <boxGeometry args={[0.3, 3.8, 13.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-22, 1.9, -18.7]}>
            <boxGeometry args={[0.3, 3.8, 12.6]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-22, 1.9, -30.45]}>
            <boxGeometry args={[0.3, 3.8, 6.1]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Segment 2 East Inner Wall (X = -15, Z: -3.5 to -26.5) */}
          <mesh position={[-15, 1.9, -15]}>
            <boxGeometry args={[0.3, 3.8, 23]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* Turn 2 Central Transverse Bridge North Wall (Z = -26.5, X: -15 to 22) - Seals East corner against void */}
          <mesh position={[3.5, 1.9, -26.5]}>
            <boxGeometry args={[37, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Turn 2 Central Transverse Bridge South Wall (Z = -33.5, X: -22 to 15) */}
          <mesh position={[-3.5, 1.9, -33.5]}>
            <boxGeometry args={[37, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* Segment 3 East Corridor Inner West Wall (X = 15, Z: -33.5 to -56.5) */}
          <mesh position={[15, 1.9, -45]}>
            <boxGeometry args={[0.3, 3.8, 23]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Segment 3 East Corridor Outer East Wall (X = 22, with door gaps for Room 3 & Room 4) */}
          <mesh position={[22, 1.9, -32.25]}>
            <boxGeometry args={[0.3, 3.8, 11.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[22, 1.9, -46.2]}>
            <boxGeometry args={[0.3, 3.8, 11.6]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[22, 1.9, -58.95]}>
            <boxGeometry args={[0.3, 3.8, 9.1]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* Turn 3 North Wall (Z = -56.5, X: -3.5 to 15) - Seals North boundary completely */}
          <mesh position={[5.75, 1.9, -56.5]}>
            <boxGeometry args={[18.5, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Turn 3 South Wall (Z = -63.5, X: 3.5 to 22) - Completely open at X: [-3.5, 3.5] for Gate Hallway */}
          <mesh position={[12.75, 1.9, -63.5]}>
            <boxGeometry args={[18.5, 3.8, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* Segment 4 South Gate Hallway West Wall (X = -3.5, Z: -56.5 to -74) */}
          <mesh position={[-3.5, 1.9, -65.25]}>
            <boxGeometry args={[0.3, 3.8, 17.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Segment 4 South Gate Hallway East Wall (X = 3.5, Z: -63.5 to -74) - Open to Turn 3 at Z: [-63.5, -56.5] */}
          <mesh position={[3.5, 1.9, -68.75]}>
            <boxGeometry args={[0.3, 3.8, 10.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* South Back Wall (Z = -74, X: -3.5 to 3.5) */}
          <mesh position={[0, 1.9, -74]}>
            <boxGeometry args={[7.0, 3.8, 0.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* 5 Rooms inside the Zigzag maze */}
          {/* Room 0: Perpustakaan SMK di Belokan Barat 1 [-28, 0, -10] */}
          <ClassroomRoom
            roomName="Perpustakaan SMK (Sayap Barat)"
            position={[-28, 0, -10]}
            isLeftSide={true}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[0] ? (
                <QuestionDesk
                  question={floorQuestions[0]}
                  position={[-2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[0].id)}
                  isNearby={nearbyQuestionId === floorQuestions[0].id}
                />
              ) : null
            }
          />

          {/* Room 1: Ruang Audio Visual di Sudut Barat [-28, 0, -25] */}
          <ClassroomRoom
            roomName="Ruang Audio Visual (Sudut Barat)"
            position={[-28, 0, -25]}
            isLeftSide={true}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[1] ? (
                <QuestionDesk
                  question={floorQuestions[1]}
                  position={[-2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[1].id)}
                  isNearby={nearbyQuestionId === floorQuestions[1].id}
                />
              ) : null
            }
          />

          {/* Room 2: Meja Soal di Penyeberangan Tengah [0, 0, -30] */}
          {floorQuestions[2] && (
            <QuestionDesk
              question={floorQuestions[2]}
              position={[0, 0, -30]}
              isSolved={solvedQuestionIds.includes(floorQuestions[2].id)}
              isNearby={nearbyQuestionId === floorQuestions[2].id}
            />
          )}

          {/* Room 3: Ruang BK di Sayap Timur [28, 0, -38] */}
          <ClassroomRoom
            roomName="Ruang BK (Bimbingan Konseling)"
            position={[28, 0, -38]}
            isLeftSide={false}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[3] ? (
                <QuestionDesk
                  question={floorQuestions[3]}
                  position={[2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[3].id)}
                  isNearby={nearbyQuestionId === floorQuestions[3].id}
                />
              ) : null
            }
          />

          {/* Room 4: Ruang OSIS di Sayap Timur [28, 0, -52] */}
          <ClassroomRoom
            roomName="Sekretariat OSIS & MPK"
            position={[28, 0, -52]}
            isLeftSide={false}
            hasExamDesk={true}
            examDeskElement={
              floorQuestions[4] ? (
                <QuestionDesk
                  question={floorQuestions[4]}
                  position={[2.0, 0, 1.8]}
                  isSolved={solvedQuestionIds.includes(floorQuestions[4].id)}
                  isNearby={nearbyQuestionId === floorQuestions[4].id}
                />
              ) : null
            }
          />

          {/* Stair Key in Center of Maze [0, 1.0, -30] */}
          {allFloorQuestionsSolved && !hasStairKey && !isGateUnlocked && (
            <KeyItem position={[0, 1.0, -30]} isNearby={isStairKeyNearby} />
          )}

          {/* Stair Gate at South End [0, 0, -70] */}
          <StairGate
            position={[0, 0, -70]}
            isUnlocked={isGateUnlocked}
            hasKey={hasStairKey}
            gatheringCount={gatheringCount}
            totalPlayers={totalActivePlayers}
          />
        </group>
      )}

      {/* =========================================================================
          LANTAI 1: HALAMAN SEKOLAH MASIF (140M X 140M DENGAN BANYAK ORNAMEN)
          Kompleks Olahraga + Parkir Megah + Taman Air Mancur + Kantin + Pos Satpam
          ========================================================================= */}
      {currentFloor === 1 && (
        <group>
          {/* Ground Floor Entrance Hallway (X: -3.5 to +3.5, Z: +14 to -16) */}
          <mesh position={[0, 0, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[7.0, 30]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          <mesh position={[0, 3.8, -1]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 30]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* Grand School Yard Ground (140m x 140m, Z: -16 to -156, X: -70 to +70) */}
          <mesh position={[0, 0, -86]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[140, 140]} />
            <meshStandardMaterial color="#1e5429" roughness={0.85} />
          </mesh>

          {/* Perimeter Boundary Walls (Height 4.5m) */}
          {/* North Facade Wall (Z = -16, with center exit opening) */}
          <mesh position={[-38.5, 2.25, -16]}>
            <boxGeometry args={[63, 4.5, 0.4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[38.5, 2.25, -16]}>
            <boxGeometry args={[63, 4.5, 0.4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* West Outer Perimeter (X = -70, Z: -16 to -156) */}
          <mesh position={[-70, 2.25, -86]}>
            <boxGeometry args={[0.5, 4.5, 140]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* East Outer Perimeter (X = 70, Z: -16 to -156) */}
          <mesh position={[70, 2.25, -86]}>
            <boxGeometry args={[0.5, 4.5, 140]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* South Outer Perimeter (Z = -156, left and right of Grand Gate) */}
          <mesh position={[-38.5, 2.25, -156]}>
            <boxGeometry args={[63, 4.5, 0.5]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[38.5, 2.25, -156]}>
            <boxGeometry args={[63, 4.5, 0.5]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* ========================================================
              1. PUSAT OLAHRAGA (SPORTS COMPLEX) AT EAST YARD
              Lapangan Futsal + Lapangan Basket + Tribune Penonton
              ======================================================== */}
          {/* Futsal Arena [36, 0.02, -50] */}
          <group position={[36, 0.02, -50]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[26, 38]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* White Court Lines */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[3.8, 4.0, 32]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* North Soccer Goal */}
            <mesh position={[0, 1.2, -18.5]}>
              <boxGeometry args={[5.0, 2.4, 0.1]} />
              <meshStandardMaterial color="#ffffff" wireframe />
            </mesh>
            {/* South Soccer Goal */}
            <mesh position={[0, 1.2, 18.5]}>
              <boxGeometry args={[5.0, 2.4, 0.1]} />
              <meshStandardMaterial color="#ffffff" wireframe />
            </mesh>
          </group>

          {/* Basketball Court [36, 0.02, -98] */}
          <group position={[36, 0.02, -98]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[26, 36]} />
              <meshStandardMaterial color="#1d4ed8" roughness={0.7} />
            </mesh>
            {/* Basketball Hoops */}
            <mesh position={[0, 2.5, -17.5]}>
              <cylinderGeometry args={[0.08, 0.1, 5.0, 8]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <mesh position={[0, 2.5, 17.5]}>
              <cylinderGeometry args={[0.08, 0.1, 5.0, 8]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>

          {/* Concrete Spectator Tribune [56, 0, -74] */}
          <group position={[56, 0, -74]}>
            {[1, 2, 3].map((step) => (
              <mesh key={`tribune_${step}`} position={[step * 1.0, step * 0.45, 0]}>
                <boxGeometry args={[1.2, 0.9, 70]} />
                <meshStandardMaterial color="#475569" roughness={0.8} />
              </mesh>
            ))}
          </group>

          {/* ========================================================
              2. AREA PARKIR LUAS & KANOPI (PARKING PLAZA)
              Kanopi Parkir Motor Siswa 36m + Area Parkir Mobil Guru
              ======================================================== */}
          <group position={[-42, 0, -100]}>
            {/* Double Steel Canopy */}
            <mesh position={[0, 3.2, 0]}>
              <boxGeometry args={[24, 0.15, 36]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Steel Pillars */}
            {[-10, 0, 10].map((px) =>
              [-16, 0, 16].map((pz) => (
                <mesh key={`canopy_pil_${px}_${pz}`} position={[px, 1.6, pz]}>
                  <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
                  <meshStandardMaterial color="#64748b" metalness={0.9} />
                </mesh>
              ))
            )}
            {/* Low-poly Motorbikes row */}
            {[-8, -4, 0, 4, 8].map((mx) =>
              [-12, -4, 4, 12].map((mz) => (
                <mesh key={`moto_${mx}_${mz}`} position={[mx, 0.45, mz]}>
                  <boxGeometry args={[0.6, 0.9, 1.8]} />
                  <meshStandardMaterial color={mx % 2 === 0 ? '#dc2626' : '#2563eb'} />
                </mesh>
              ))
            )}
          </group>

          {/* Teacher Car Parking Markings [-42, 0.02, -60] */}
          <group position={[-42, 0.02, -60]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[24, 26]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
          </group>

          {/* ========================================================
              3. TAMAN SEKOLAH & AIR MANCUR BESAR (CENTRAL GARDEN)
              Kolam Air Mancur 14m + 2 Gazebo + Tugu Prestasi
              ======================================================== */}
          <group position={[0, 0, -68]}>
            {/* Grand Circular Pond Fountain */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[7.0, 7.5, 0.6, 24]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[6.5, 6.5, 0.2, 24]} />
              <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.8} />
            </mesh>
            {/* Water Jets / Central Column */}
            <mesh position={[0, 1.6, 0]}>
              <cylinderGeometry args={[0.6, 0.8, 2.2, 12]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <pointLight position={[0, 3.0, 0]} color="#38bdf8" intensity={2.0} distance={20} />
          </group>

          {/* 2 Traditional Wooden Gazebos */}
          {[-18, 18].map((gx) => (
            <group key={`multi_gaz_${gx}`} position={[gx, 0, -46]}>
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[5.5, 0.6, 5.5]} />
                <meshStandardMaterial color="#78350f" roughness={0.8} />
              </mesh>
              {/* Roof */}
              <mesh position={[0, 3.8, 0]}>
                <coneGeometry args={[4.8, 2.0, 4]} />
                <meshStandardMaterial color="#991b1b" roughness={0.7} />
              </mesh>
              <pointLight position={[0, 2.6, 0]} color="#fef08a" intensity={1.5} distance={9} />
            </group>
          ))}

          {/* ========================================================
              4. KANTIN SEKOLAH TERBUKA (SMK FOOD COURT)
              Stan Makanan Panjang 28m + Deretan Meja Makan Kayu
              ======================================================== */}
          <group position={[-42, 0, -32]}>
            <mesh position={[0, 2.0, 0]}>
              <boxGeometry args={[26, 4.0, 9.0]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            {/* Canopy */}
            <mesh position={[0, 4.2, 0]}>
              <boxGeometry args={[28, 0.3, 11.0]} />
              <meshStandardMaterial color="#b45309" roughness={0.7} />
            </mesh>
            {/* Dining tables */}
            {[-8, -2, 4, 10].map((tx) => (
              <mesh key={`canteen_table_${tx}`} position={[tx, 0.75, 7.5]}>
                <boxGeometry args={[3.2, 0.1, 1.4]} />
                <meshStandardMaterial color="#78350f" />
              </mesh>
            ))}
          </group>

          {/* ========================================================
              5. PODIUM UPACARA & TIANG BENDERA [0, 0, -32]
              ======================================================== */}
          <group position={[0, 0, -32]}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[2.5, 3.0, 0.6, 16]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
            <mesh position={[0, 7.0, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 14, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            {/* Indonesian Flag */}
            <group position={[1.0, 13.0, 0]}>
              <mesh position={[0, 0.45, 0]}>
                <boxGeometry args={[2.0, 0.9, 0.02]} />
                <meshStandardMaterial color="#dc2626" />
              </mesh>
              <mesh position={[0, -0.45, 0]}>
                <boxGeometry args={[2.0, 0.9, 0.02]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
            </group>
          </group>

          {/* ========================================================
              6. POS SATPAM 2 LANTAI & MASTER KEY [-22, 0, -85]
              ======================================================== */}
          <group position={[-22, 0, -85]}>
            {/* Building 2 Floors */}
            <mesh position={[0, 2.5, 0]}>
              <boxGeometry args={[5.5, 5.0, 5.5]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
            <mesh position={[0, 5.2, 0]}>
              <boxGeometry args={[6.2, 0.4, 6.2]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
            </mesh>
            {/* Desk */}
            <mesh position={[0, 0.75, 0]}>
              <boxGeometry args={[2.2, 0.1, 1.2]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            <pointLight position={[0, 3.0, 0]} color="#fef08a" intensity={2.5} distance={12} />
          </group>

          {/* MASTER KEY DENGAN RANDOM LANDMARK SPAWN */}
          {!hasMasterKey && (
            <KeyItem
              position={getMasterKeySpawn(masterKeySpawnIndex, true).position}
              isMasterKey={true}
              isNearby={isMasterKeyNearby}
            />
          )}

          {/* ========================================================
              7. GRAND SCHOOL EXIT GATE AT Z = -148 (South Yard)
              ======================================================== */}
          <StairGate
            position={[0, 0, -148]}
            isUnlocked={isExitGateUnlocked}
            hasKey={hasMasterKey}
            gatheringCount={gatheringCount}
            totalPlayers={totalActivePlayers}
            isExitGate={true}
          />

          {/* 16 Area Trees dotted strategically across 140m yard */}
          {[
            [-18, -26],
            [18, -26],
            [-52, -45],
            [52, -45],
            [-22, -65],
            [22, -65],
            [-56, -95],
            [16, -95],
            [-18, -125],
            [18, -125],
            [-45, -135],
            [45, -135],
          ].map(([tx, tz], i) => (
            <group key={`multi_tree_${i}`} position={[tx, 0, tz]}>
              <mesh position={[0, 1.8, 0]}>
                <cylinderGeometry args={[0.3, 0.45, 3.6, 8]} />
                <meshStandardMaterial color="#78350f" />
              </mesh>
              <mesh position={[0, 4.8, 0]}>
                <coneGeometry args={[2.6, 5.0, 8]} />
                <meshStandardMaterial color="#14532d" />
              </mesh>
            </group>
          ))}

          {/* AI ROBOT SUPERVISOR PATROLLING 140M YARD */}
          <RobotSupervisor />
        </group>
      )}
    </group>
  );
};
