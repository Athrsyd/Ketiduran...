/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WallAABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * Resolves player movement against a list of axis-aligned bounding boxes (AABBs).
 * Uses continuous sub-stepped Circle-vs-AABB relaxation with closest-point projection.
 * Strictly prevents penetration, tunneling past corners, or passing through thin walls,
 * while allowing buttery-smooth sliding along surfaces and around corners.
 */
export function resolveMovement(
  currentX: number,
  currentZ: number,
  targetX: number,
  targetZ: number,
  radius: number,
  walls: WallAABB[],
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
): [number, number] {
  const totalDx = targetX - currentX;
  const totalDz = targetZ - currentZ;
  const totalDist = Math.hypot(totalDx, totalDz);

  if (totalDist < 1e-6) {
    return [currentX, currentZ];
  }

  // Substep if moving further than 0.12m to prevent tunneling at any framerate / lag spike
  const maxStep = Math.min(radius * 0.5, 0.12);
  const steps = Math.max(1, Math.min(48, Math.ceil(totalDist / maxStep)));
  const stepDx = totalDx / steps;
  const stepDz = totalDz / steps;

  let x = currentX;
  let z = currentZ;

  for (let s = 0; s < steps; s++) {
    x += stepDx;
    z += stepDz;

    // Relaxation passes: 3 passes guarantee resolving complex corners and touching walls
    for (let pass = 0; pass < 3; pass++) {
      // 1. Boundary clamp
      x = Math.max(bounds.minX + radius, Math.min(bounds.maxX - radius, x));
      z = Math.max(bounds.minZ + radius, Math.min(bounds.maxZ - radius, z));

      // 2. Circle vs AABB collision against each wall
      for (let i = 0; i < walls.length; i++) {
        const w = walls[i];

        // Find closest point on AABB to circle center (x, z)
        const cx = Math.max(w.minX, Math.min(w.maxX, x));
        const cz = Math.max(w.minZ, Math.min(w.maxZ, z));

        const dx = x - cx;
        const dz = z - cz;
        const distSq = dx * dx + dz * dz;

        if (distSq < radius * radius) {
          if (distSq > 1e-8) {
            // Circle center is outside or on edge of AABB: push out along radial normal
            const d = Math.sqrt(distSq);
            const overlap = radius - d;
            x += (dx / d) * overlap;
            z += (dz / d) * overlap;
          } else {
            // Circle center is strictly inside AABB: push along minimum penetration axis
            const dWest = x - w.minX;
            const dEast = w.maxX - x;
            const dNorth = z - w.minZ;
            const dSouth = w.maxZ - z;
            const minD = Math.min(dWest, dEast, dNorth, dSouth);

            if (minD === dWest) {
              x = w.minX - radius;
            } else if (minD === dEast) {
              x = w.maxX + radius;
            } else if (minD === dNorth) {
              z = w.minZ - radius;
            } else {
              z = w.maxZ + radius;
            }
          }
        }
      }
    }
  }

  // Final clamp to bounds
  x = Math.max(bounds.minX + radius, Math.min(bounds.maxX - radius, x));
  z = Math.max(bounds.minZ + radius, Math.min(bounds.maxZ - radius, z));

  return [x, z];
}

/**
 * Returns solid wall bounding boxes for upper school floors in Solo Mode (Floors 4, 3, 2).
 * Corridor: Width 7.0m (X: -3.5 to +3.5), Length from Z = 14 to Z = -74.
 * 8 Classrooms: 4 on the West (X: -15.5 to -3.5), 4 on the East (X: 3.5 to 15.5).
 */
let _cachedUpperWallsLocked: WallAABB[] | null = null;
let _cachedUpperWallsUnlocked: WallAABB[] | null = null;
let _cachedFloor1WallsLocked: WallAABB[] | null = null;
let _cachedFloor1WallsUnlocked: WallAABB[] | null = null;

export function getUpperFloorWalls(isGateUnlocked: boolean): WallAABB[] {
  if (isGateUnlocked) {
    if (!_cachedUpperWallsUnlocked) {
      _cachedUpperWallsUnlocked = buildUpperFloorWalls(true);
    }
    return _cachedUpperWallsUnlocked;
  }
  if (!_cachedUpperWallsLocked) {
    _cachedUpperWallsLocked = buildUpperFloorWalls(false);
  }
  return _cachedUpperWallsLocked;
}

function buildUpperFloorWalls(isGateUnlocked: boolean): WallAABB[] {
  const walls: WallAABB[] = [];

  // 1. Corridor North Back Wall (Z = 14)
  walls.push({
    minX: -3.65,
    maxX: 3.65,
    minZ: 13.85,
    maxZ: 14.15,
  });

  // 2. Corridor South Gate Wall (Z = -70)
  if (!isGateUnlocked) {
    walls.push({
      minX: -3.65,
      maxX: 3.65,
      minZ: -70.2,
      maxZ: -69.8,
    });
  } else {
    // When gate is open, only gate pillars block side edges
    walls.push({ minX: -3.65, maxX: -2.8, minZ: -70.2, maxZ: -69.8 });
    walls.push({ minX: 2.8, maxX: 3.65, minZ: -70.2, maxZ: -69.8 });
  }

  // 3. Define the 8 Classroom modules
  // Each room has center rz, depth 11m (rz - 5.5 to rz + 5.5)
  // Doorway opening in corridor wall: [rz - 2.4, rz]
  const roomCenters = [6.0, -14.0, -34.0, -54.0];

  roomCenters.forEach((rz) => {
    // WEST ROOMS (X: -15.5 to -3.5, corridor wall at X = -3.5)
    // North wall
    walls.push({
      minX: -15.65,
      maxX: -3.35,
      minZ: rz + 5.35,
      maxZ: rz + 5.65,
    });
    // South wall
    walls.push({
      minX: -15.65,
      maxX: -3.35,
      minZ: rz - 5.65,
      maxZ: rz - 5.35,
    });
    // Outer West wall
    walls.push({
      minX: -15.65,
      maxX: -15.35,
      minZ: rz - 5.5,
      maxZ: rz + 5.5,
    });
    // Corridor West Wall - Segment North of Door (Z: rz to rz + 5.5)
    walls.push({
      minX: -3.65,
      maxX: -3.35,
      minZ: rz,
      maxZ: rz + 5.5,
    });
    // Corridor West Wall - Segment South of Door (Z: rz - 5.5 to rz - 2.4)
    walls.push({
      minX: -3.65,
      maxX: -3.35,
      minZ: rz - 5.5,
      maxZ: rz - 2.4,
    });

    // EAST ROOMS (X: 3.5 to 15.5, corridor wall at X = 3.5)
    // North wall
    walls.push({
      minX: 3.35,
      maxX: 15.65,
      minZ: rz + 5.35,
      maxZ: rz + 5.65,
    });
    // South wall
    walls.push({
      minX: 3.35,
      maxX: 15.65,
      minZ: rz - 5.65,
      maxZ: rz - 5.35,
    });
    // Outer East wall
    walls.push({
      minX: 15.35,
      maxX: 15.65,
      minZ: rz - 5.5,
      maxZ: rz + 5.5,
    });
    // Corridor East Wall - Segment North of Door (Z: rz to rz + 5.5)
    walls.push({
      minX: 3.35,
      maxX: 3.65,
      minZ: rz,
      maxZ: rz + 5.5,
    });
    // Corridor East Wall - Segment South of Door (Z: rz - 5.5 to rz - 2.4)
    walls.push({
      minX: 3.35,
      maxX: 3.65,
      minZ: rz - 5.5,
      maxZ: rz - 2.4,
    });
  });

  // 4. Solid Corridor Connecting Walls between classrooms
  // North end to Room 1 (Z: 11.5 to 14.0)
  walls.push({ minX: -3.65, maxX: -3.35, minZ: 11.5, maxZ: 14.0 });
  walls.push({ minX: 3.35, maxX: 3.65, minZ: 11.5, maxZ: 14.0 });

  // Between Room 1/2 and Room 3/4 (Z: -8.5 to 0.5)
  walls.push({ minX: -3.65, maxX: -3.35, minZ: -8.5, maxZ: 0.5 });
  walls.push({ minX: 3.35, maxX: 3.65, minZ: -8.5, maxZ: 0.5 });

  // Between Room 3/4 and Room 5/6 (Z: -28.5 to -19.5 - Central Lounge)
  walls.push({ minX: -3.65, maxX: -3.35, minZ: -28.5, maxZ: -19.5 });
  walls.push({ minX: 3.35, maxX: 3.65, minZ: -28.5, maxZ: -19.5 });

  // Between Room 5/6 and Room 7/8 (Z: -48.5 to -39.5)
  walls.push({ minX: -3.65, maxX: -3.35, minZ: -48.5, maxZ: -39.5 });
  walls.push({ minX: 3.35, maxX: 3.65, minZ: -48.5, maxZ: -39.5 });

  // South of Room 7/8 to Gate (Z: -74.0 to -59.5)
  walls.push({ minX: -3.65, maxX: -3.35, minZ: -74.0, maxZ: -59.5 });
  walls.push({ minX: 3.35, maxX: 3.65, minZ: -74.0, maxZ: -59.5 });

  return walls;
}

/**
 * Returns solid wall bounding boxes for Floor 1 in Solo Mode (Ground Hallway & Courtyard).
 * Hallway: X: -3.5 to +3.5, Z: +14 down to -16.
 * Yard: X: -48 to +48, Z: -16 down to -108.
 */
export function getFloor1Walls(isExitGateUnlocked: boolean): WallAABB[] {
  if (isExitGateUnlocked) {
    if (!_cachedFloor1WallsUnlocked) {
      _cachedFloor1WallsUnlocked = buildFloor1Walls(true);
    }
    return _cachedFloor1WallsUnlocked;
  }
  if (!_cachedFloor1WallsLocked) {
    _cachedFloor1WallsLocked = buildFloor1Walls(false);
  }
  return _cachedFloor1WallsLocked;
}

function buildFloor1Walls(isExitGateUnlocked: boolean): WallAABB[] {
  const walls: WallAABB[] = [];

  // 1. Ground Hallway North Wall (Z = 14)
  walls.push({ minX: -3.65, maxX: 3.65, minZ: 13.85, maxZ: 14.15 });

  // 2. Ground Hallway West & East Walls (Z: -16 to 14)
  walls.push({ minX: -3.65, maxX: -3.35, minZ: -16.0, maxZ: 14.0 });
  walls.push({ minX: 3.35, maxX: 3.65, minZ: -16.0, maxZ: 14.0 });

  // 3. School Building South Facade facing Yard (Z = -16)
  walls.push({ minX: -48.2, maxX: -3.35, minZ: -16.2, maxZ: -15.8 });
  walls.push({ minX: 3.35, maxX: 48.2, minZ: -16.2, maxZ: -15.8 });

  // 4. Yard Outer Perimeter Walls (North, West, East, South)
  walls.push({ minX: -48.5, maxX: -47.8, minZ: -108.0, maxZ: -16.0 });
  walls.push({ minX: 47.8, maxX: 48.5, minZ: -108.0, maxZ: -16.0 });
  walls.push({ minX: -48.0, maxX: -4.5, minZ: -108.2, maxZ: -107.8 });
  walls.push({ minX: 4.5, maxX: 48.0, minZ: -108.2, maxZ: -107.8 });

  // 5. Main Exit Gate at Z = -104 (Width = 9m, from X = -4.5 to 4.5)
  if (!isExitGateUnlocked) {
    walls.push({ minX: -4.5, maxX: 4.5, minZ: -104.3, maxZ: -103.7 });
  } else {
    walls.push({ minX: -4.6, maxX: -3.8, minZ: -104.3, maxZ: -103.7 });
    walls.push({ minX: 3.8, maxX: 4.6, minZ: -104.3, maxZ: -103.7 });
  }

  // 6. Pos Satpam Building Walls (Center: [-18, 0, -56], Size 4.4 x 4.4)
  walls.push({ minX: -20.3, maxX: -20.0, minZ: -58.2, maxZ: -53.8 });
  walls.push({ minX: -20.2, maxX: -15.8, minZ: -58.3, maxZ: -58.0 });
  walls.push({ minX: -20.2, maxX: -15.8, minZ: -54.0, maxZ: -53.7 });
  // East wall (door opening at Z: [-56.8, -55.2])
  walls.push({ minX: -16.0, maxX: -15.7, minZ: -58.2, maxZ: -56.8 });
  walls.push({ minX: -16.0, maxX: -15.7, minZ: -55.2, maxZ: -53.8 });

  // 7. Flagpole pedestal obstacle (Center: [0, 0, -42], radius ~1.2m)
  walls.push({ minX: -1.3, maxX: 1.3, minZ: -43.3, maxZ: -40.7 });

  // 8. Basketball court hoops & poles ([22, 0, -32] and [22, 0, -64])
  walls.push({ minX: 21.6, maxX: 22.4, minZ: -32.4, maxZ: -31.6 });
  walls.push({ minX: 21.6, maxX: 22.4, minZ: -64.4, maxZ: -63.6 });

  return walls;
}

// ============================================================================
// MULTIPLAYER EXPANDED LABYRINTH / MAZE WALLS (FLOORS 4, 3, 2, 1)
// ============================================================================

const _cachedMultiWalls: Record<string, WallAABB[]> = {};

/**
 * Returns static cached AABB walls for Multiplayer floors 4, 3, 2.
 */
export function getMultiplayerFloorWalls(floor: number, isGateUnlocked: boolean): WallAABB[] {
  const cacheKey = `f${floor}_${isGateUnlocked ? 'open' : 'closed'}`;
  if (_cachedMultiWalls[cacheKey]) {
    return _cachedMultiWalls[cacheKey];
  }

  let walls: WallAABB[] = [];
  if (floor === 4) {
    walls = buildMultiFloor4Walls(isGateUnlocked);
  } else if (floor === 3) {
    walls = buildMultiFloor3Walls(isGateUnlocked);
  } else {
    walls = buildMultiFloor2Walls(isGateUnlocked);
  }

  _cachedMultiWalls[cacheKey] = walls;
  return walls;
}

/**
 * Returns static cached AABB walls for Multiplayer Floor 1 (Grand 140m Courtyard).
 */
export function getMultiplayerFloor1Walls(isExitGateUnlocked: boolean): WallAABB[] {
  const cacheKey = `f1_${isExitGateUnlocked ? 'open' : 'closed'}`;
  if (_cachedMultiWalls[cacheKey]) {
    return _cachedMultiWalls[cacheKey];
  }

  const walls = buildMultiFloor1Walls(isExitGateUnlocked);
  _cachedMultiWalls[cacheKey] = walls;
  return walls;
}

function buildMultiFloor4Walls(isGateUnlocked: boolean): WallAABB[] {
  const walls: WallAABB[] = [];

  // 1. North corridor back wall
  walls.push({ minX: -3.65, maxX: 3.65, minZ: 13.85, maxZ: 14.15 });

  // 2. Central Corridor West walls
  walls.push({ minX: -3.65, maxX: -3.35, minZ: 6.5, maxZ: 14.0 });
  walls.push({ minX: -3.65, maxX: -3.35, minZ: -13.0, maxZ: 3.5 });
  walls.push({ minX: -3.65, maxX: -3.35, minZ: -74.0, maxZ: -19.0 });

  // 3. Central Corridor East walls
  walls.push({ minX: 3.35, maxX: 3.65, minZ: -43.0, maxZ: 14.0 });
  walls.push({ minX: 3.35, maxX: 3.65, minZ: -74.0, maxZ: -49.0 });

  // 4. West Wing (X: -3.5 to -36, Z: -19 to -13)
  walls.push({ minX: -27.5, maxX: -3.35, minZ: -13.15, maxZ: -12.85 });
  walls.push({ minX: -36.0, maxX: -30.5, minZ: -13.15, maxZ: -12.85 });
  walls.push({ minX: -25.0, maxX: -3.35, minZ: -19.15, maxZ: -18.85 });
  walls.push({ minX: -36.0, maxX: -28.0, minZ: -19.15, maxZ: -18.85 });
  walls.push({ minX: -36.15, maxX: -35.85, minZ: -19.0, maxZ: -13.0 });

  // 5. East Wing (X: 3.5 to 36, Z: -49 to -43)
  walls.push({ minX: 3.35, maxX: 25.5, minZ: -43.15, maxZ: -42.85 });
  walls.push({ minX: 28.5, maxX: 36.0, minZ: -43.15, maxZ: -42.85 });
  walls.push({ minX: 3.35, maxX: 27.5, minZ: -49.15, maxZ: -48.85 });
  walls.push({ minX: 30.5, maxX: 36.0, minZ: -49.15, maxZ: -48.85 });
  walls.push({ minX: 35.85, maxX: 36.15, minZ: -49.0, maxZ: -43.0 });

  // 6. Stair Gate at South End (Z = -70)
  if (!isGateUnlocked) {
    walls.push({ minX: -3.5, maxX: 3.5, minZ: -70.3, maxZ: -69.7 });
  } else {
    walls.push({ minX: -3.6, maxX: -3.1, minZ: -70.3, maxZ: -69.7 });
    walls.push({ minX: 3.1, maxX: 3.6, minZ: -70.3, maxZ: -69.7 });
  }

  // South corridor back wall (Z = -74)
  walls.push({ minX: -3.65, maxX: 3.65, minZ: -74.15, maxZ: -73.85 });

  // 7. Outer Room Boundaries
  // Room 4 ([-9.5, 0, 6])
  walls.push({ minX: -15.65, maxX: -15.35, minZ: 0.5, maxZ: 11.5 });
  walls.push({ minX: -15.5, maxX: -3.35, minZ: 11.35, maxZ: 11.65 });
  walls.push({ minX: -15.5, maxX: -3.35, minZ: 0.35, maxZ: 0.65 });

  // Room 0 ([-28, 0, -7]): Rotated +pi/2, depth from Z = -13 to -1, width X from -33.5 to -22.5
  walls.push({ minX: -33.65, maxX: -33.35, minZ: -13.0, maxZ: -1.0 }); // West side wall
  walls.push({ minX: -22.65, maxX: -22.35, minZ: -13.0, maxZ: -1.0 }); // East side wall
  walls.push({ minX: -33.5, maxX: -22.5, minZ: -1.15, maxZ: -0.85 });  // North back wall

  // Room 1 ([-28, 0, -25]): Rotated -pi/2, depth from Z = -19 to -31, width X from -33.5 to -22.5
  walls.push({ minX: -33.65, maxX: -33.35, minZ: -31.0, maxZ: -19.0 }); // West side wall
  walls.push({ minX: -22.65, maxX: -22.35, minZ: -31.0, maxZ: -19.0 }); // East side wall
  walls.push({ minX: -33.5, maxX: -22.5, minZ: -31.15, maxZ: -30.85 }); // South back wall

  // Room 2 ([28, 0, -37]): Rotated +pi/2, depth from Z = -43 to -31, width X from 22.5 to 33.5
  walls.push({ minX: 22.35, maxX: 22.65, minZ: -43.0, maxZ: -31.0 }); // West side wall
  walls.push({ minX: 33.35, maxX: 33.65, minZ: -43.0, maxZ: -31.0 }); // East side wall
  walls.push({ minX: 22.5, maxX: 33.5, minZ: -31.15, maxZ: -30.85 });  // North back wall

  // Room 3 ([28, 0, -55]): Rotated -pi/2, depth from Z = -49 to -61, width X from 22.5 to 33.5
  walls.push({ minX: 22.35, maxX: 22.65, minZ: -61.0, maxZ: -49.0 }); // West side wall
  walls.push({ minX: 33.35, maxX: 33.65, minZ: -61.0, maxZ: -49.0 }); // East side wall
  walls.push({ minX: 22.5, maxX: 33.5, minZ: -61.15, maxZ: -60.85 }); // South back wall

  return walls;
}

function buildMultiFloor3Walls(isGateUnlocked: boolean): WallAABB[] {
  const walls: WallAABB[] = [];

  // 1. North Corridor Wall (Z = 14, X: -19 to 19)
  walls.push({ minX: -19.15, maxX: 19.15, minZ: 13.85, maxZ: 14.15 });

  // 2. Central Atrium Railings/Walls (Void: X: [-13, 13], Z: [-60, 0])
  // West edge of Atrium (X = -13, with opening for Skywalk at Z: [-32.5, -27.5])
  walls.push({ minX: -13.15, maxX: -12.85, minZ: -27.5, maxZ: 0.0 });
  walls.push({ minX: -13.15, maxX: -12.85, minZ: -60.0, maxZ: -32.5 });
  // East edge of Atrium (X = 13, with opening for Skywalk at Z: [-32.5, -27.5])
  walls.push({ minX: 12.85, maxX: 13.15, minZ: -27.5, maxZ: 0.0 });
  walls.push({ minX: 12.85, maxX: 13.15, minZ: -60.0, maxZ: -32.5 });
  // North edge of Atrium (Z = 0, X: -13 to 13)
  walls.push({ minX: -13.15, maxX: 13.15, minZ: -0.15, maxZ: 0.15 });
  // South edge of Atrium (Z = -60, X: -13 to 13)
  walls.push({ minX: -13.15, maxX: 13.15, minZ: -60.15, maxZ: -59.85 });

  // 3. Skywalk Bridge Railings (Z: -27.5 and -32.5, width 5m, X: -13 to 13)
  walls.push({ minX: -13.0, maxX: 13.0, minZ: -27.65, maxZ: -27.35 });
  walls.push({ minX: -13.0, maxX: 13.0, minZ: -32.65, maxZ: -32.35 });

  // 4. West Corridor Outer Wall (X = -19, with door gaps for Room 0 at [-14.4, -12.0] and Room 1 at [-50.4, -48.0])
  walls.push({ minX: -19.15, maxX: -18.85, minZ: -12.0, maxZ: 14.0 });
  walls.push({ minX: -19.15, maxX: -18.85, minZ: -48.0, maxZ: -14.4 });
  walls.push({ minX: -19.15, maxX: -18.85, minZ: -74.0, maxZ: -50.4 });

  // 5. East Corridor Outer Wall (X = 19, with door gaps for Room 2 at [-14.4, -12.0] and Room 3 at [-50.4, -48.0])
  walls.push({ minX: 18.85, maxX: 19.15, minZ: -12.0, maxZ: 14.0 });
  walls.push({ minX: 18.85, maxX: 19.15, minZ: -48.0, maxZ: -14.4 });
  walls.push({ minX: 18.85, maxX: 19.15, minZ: -74.0, maxZ: -50.4 });

  // 6. South Corridor Back Wall (Z = -74, X: -19 to 19)
  walls.push({ minX: -19.15, maxX: 19.15, minZ: -74.15, maxZ: -73.85 });

  // 7. Rooms Outer Walls
  // Room 0 ([-25, 0, -12], X: [-31, -19], Z: [-17.5, -6.5])
  walls.push({ minX: -31.15, maxX: -30.85, minZ: -17.5, maxZ: -6.5 }); // Outer West
  walls.push({ minX: -31.0, maxX: -18.85, minZ: -6.65, maxZ: -6.35 }); // North
  walls.push({ minX: -31.0, maxX: -18.85, minZ: -17.65, maxZ: -17.35 }); // South

  // Room 1 ([-25, 0, -48], X: [-31, -19], Z: [-53.5, -42.5])
  walls.push({ minX: -31.15, maxX: -30.85, minZ: -53.5, maxZ: -42.5 }); // Outer West
  walls.push({ minX: -31.0, maxX: -18.85, minZ: -42.65, maxZ: -42.35 }); // North
  walls.push({ minX: -31.0, maxX: -18.85, minZ: -53.65, maxZ: -53.35 }); // South

  // Room 2 ([25, 0, -12], X: [19, 31], Z: [-17.5, -6.5])
  walls.push({ minX: 30.85, maxX: 31.15, minZ: -17.5, maxZ: -6.5 }); // Outer East
  walls.push({ minX: 18.85, maxX: 31.0, minZ: -6.65, maxZ: -6.35 }); // North
  walls.push({ minX: 18.85, maxX: 31.0, minZ: -17.65, maxZ: -17.35 }); // South

  // Room 3 ([25, 0, -48], X: [19, 31], Z: [-53.5, -42.5])
  walls.push({ minX: 30.85, maxX: 31.15, minZ: -53.5, maxZ: -42.5 }); // Outer East
  walls.push({ minX: 18.85, maxX: 31.0, minZ: -42.65, maxZ: -42.35 }); // North
  walls.push({ minX: 18.85, maxX: 31.0, minZ: -53.65, maxZ: -53.35 }); // South

  // 8. Stair Gate at [0, 0, -70]
  if (!isGateUnlocked) {
    walls.push({ minX: -3.5, maxX: 3.5, minZ: -70.3, maxZ: -69.7 });
  } else {
    walls.push({ minX: -3.6, maxX: -3.1, minZ: -70.3, maxZ: -69.7 });
    walls.push({ minX: 3.1, maxX: 3.6, minZ: -70.3, maxZ: -69.7 });
  }

  return walls;
}

function buildMultiFloor2Walls(isGateUnlocked: boolean): WallAABB[] {
  const walls: WallAABB[] = [];

  // Segment 1 (North Center: X: [-3.5, 3.5], Z: [14, 0])
  // North Back Wall
  walls.push({ minX: -3.65, maxX: 3.65, minZ: 13.85, maxZ: 14.15 });
  // East Wall (Z: 14 down to -3.5)
  walls.push({ minX: 3.35, maxX: 3.65, minZ: -3.65, maxZ: 14.0 });
  // West Wall (Z: 14 down to 3.5 - leaves opening Z: [-3.5, 3.5] to Turn 1)
  walls.push({ minX: -3.65, maxX: -3.35, minZ: 3.35, maxZ: 14.0 });

  // Turn 1 (West Cross Hallway: X: [-22, 3.5], Z: [-3.5, 3.5])
  // North Wall (X: -22 to -3.5, Z = 3.5)
  walls.push({ minX: -22.15, maxX: -3.35, minZ: 3.35, maxZ: 3.65 });
  // South Wall (X: -15 to 3.5, Z = -3.5)
  walls.push({ minX: -15.15, maxX: 3.65, minZ: -3.65, maxZ: -3.35 });

  // Segment 2 (West South Hallway: X: [-22, -15], Z: [0, -30])
  // East Inner Wall (X = -15, Z: -26.5 to -3.5)
  walls.push({ minX: -15.15, maxX: -14.85, minZ: -26.65, maxZ: -3.35 });
  // West Outer Wall (X = -22, with door gaps for Room 0 at [-12.4, -10.0] and Room 1 at [-27.4, -25.0])
  walls.push({ minX: -22.15, maxX: -21.85, minZ: -10.0, maxZ: 3.65 });
  walls.push({ minX: -22.15, maxX: -21.85, minZ: -25.0, maxZ: -12.4 });
  walls.push({ minX: -22.15, maxX: -21.85, minZ: -33.65, maxZ: -27.4 });

  // Room 0: Perpustakaan (Center [-28, 0, -10], X: [-34, -22], Z: [-15.5, -4.5])
  walls.push({ minX: -34.15, maxX: -33.85, minZ: -15.5, maxZ: -4.5 }); // Outer West
  walls.push({ minX: -34.0, maxX: -21.85, minZ: -4.65, maxZ: -4.35 }); // North
  walls.push({ minX: -34.0, maxX: -21.85, minZ: -15.65, maxZ: -15.35 }); // South

  // Room 1: Audio Visual (Center [-28, 0, -25], X: [-34, -22], Z: [-30.5, -19.5])
  walls.push({ minX: -34.15, maxX: -33.85, minZ: -30.5, maxZ: -19.5 }); // Outer West
  walls.push({ minX: -34.0, maxX: -21.85, minZ: -19.65, maxZ: -19.35 }); // North
  walls.push({ minX: -34.0, maxX: -21.85, minZ: -30.65, maxZ: -30.35 }); // South

  // Turn 2 (Central Transverse Bridge: X: [-22, 22], Z: [-33.5, -26.5])
  // North Wall (X: -15 to 22, Z = -26.5) - Seals East corner against void
  walls.push({ minX: -15.15, maxX: 22.15, minZ: -26.65, maxZ: -26.35 });
  // South Wall (X: -22 to 15, Z = -33.5)
  walls.push({ minX: -22.15, maxX: 15.15, minZ: -33.65, maxZ: -33.35 });

  // Segment 3 (East South Hallway: X: [15, 22], Z: [-30, -60])
  // West Inner Wall (X = 15, Z: -56.5 to -33.5)
  walls.push({ minX: 14.85, maxX: 15.15, minZ: -56.65, maxZ: -33.35 });
  // East Outer Wall (X = 22, with door gaps for Room 3 at [-40.4, -38.0] and Room 4 at [-54.4, -52.0])
  walls.push({ minX: 21.85, maxX: 22.15, minZ: -38.0, maxZ: -26.35 });
  walls.push({ minX: 21.85, maxX: 22.15, minZ: -52.0, maxZ: -40.4 });
  walls.push({ minX: 21.85, maxX: 22.15, minZ: -63.65, maxZ: -54.4 });

  // Room 3: BK (Center [28, 0, -38], X: [22, 34], Z: [-43.5, -32.5])
  walls.push({ minX: 33.85, maxX: 34.15, minZ: -43.5, maxZ: -32.5 }); // Outer East
  walls.push({ minX: 21.85, maxX: 34.0, minZ: -32.65, maxZ: -32.35 }); // North
  walls.push({ minX: 21.85, maxX: 34.0, minZ: -43.65, maxZ: -43.35 }); // South

  // Room 4: OSIS (Center [28, 0, -52], X: [22, 34], Z: [-57.5, -46.5])
  walls.push({ minX: 33.85, maxX: 34.15, minZ: -57.5, maxZ: -46.5 }); // Outer East
  walls.push({ minX: 21.85, maxX: 34.0, minZ: -46.65, maxZ: -46.35 }); // North
  walls.push({ minX: 21.85, maxX: 34.0, minZ: -57.65, maxZ: -57.35 }); // South

  // Turn 3 (Return to Center: X: [-3.5, 22], Z: [-63.5, -56.5])
  // North Wall (X: -3.5 to 15, Z = -56.5) - Seals North boundary completely
  walls.push({ minX: -3.65, maxX: 15.15, minZ: -56.65, maxZ: -56.35 });
  // South Wall (X: 3.5 to 22, Z = -63.5) - Leaves X: [-3.5, 3.5] completely open into Gate Hallway
  walls.push({ minX: 3.35, maxX: 22.15, minZ: -63.65, maxZ: -63.35 });

  // Segment 4 (South Gate Hallway: X: [-3.5, 3.5], Z: [-56.5, -74])
  // West Wall (Z: -56.5 to -74)
  walls.push({ minX: -3.65, maxX: -3.35, minZ: -74.0, maxZ: -56.35 });
  // East Wall (Z: -63.5 to -74) - Leaves Z: [-63.5, -56.5] open for Turn 3
  walls.push({ minX: 3.35, maxX: 3.65, minZ: -74.0, maxZ: -63.35 });
  // South Back Wall (Z = -74)
  walls.push({ minX: -3.65, maxX: 3.65, minZ: -74.15, maxZ: -73.85 });

  // Stair Gate at Z = -70
  if (!isGateUnlocked) {
    walls.push({ minX: -3.5, maxX: 3.5, minZ: -70.3, maxZ: -69.7 });
  } else {
    walls.push({ minX: -3.6, maxX: -3.1, minZ: -70.3, maxZ: -69.7 });
    walls.push({ minX: 3.1, maxX: 3.6, minZ: -70.3, maxZ: -69.7 });
  }

  return walls;
}

function buildMultiFloor1Walls(isExitGateUnlocked: boolean): WallAABB[] {
  const walls: WallAABB[] = [];

  // 1. Entrance Hallway (X: [-3.5, 3.5], Z: [14, -16])
  walls.push({ minX: -3.65, maxX: 3.65, minZ: 13.85, maxZ: 14.15 });
  walls.push({ minX: -3.65, maxX: -3.35, minZ: -16.0, maxZ: 14.0 });
  walls.push({ minX: 3.35, maxX: 3.65, minZ: -16.0, maxZ: 14.0 });

  // 2. School South Facade (Z = -16, X: [-70, 70] with center doorway)
  walls.push({ minX: -70.2, maxX: -3.35, minZ: -16.2, maxZ: -15.8 });
  walls.push({ minX: 3.35, maxX: 70.2, minZ: -16.2, maxZ: -15.8 });

  // 3. Yard Outer Perimeter (140m x 140m: X: [-70, 70], Z: [-16, -156])
  walls.push({ minX: -70.3, maxX: -69.7, minZ: -156.0, maxZ: -16.0 });
  walls.push({ minX: 69.7, maxX: 70.3, minZ: -156.0, maxZ: -16.0 });
  walls.push({ minX: -70.0, maxX: -4.5, minZ: -156.3, maxZ: -155.7 });
  walls.push({ minX: 4.5, maxX: 70.0, minZ: -156.3, maxZ: -155.7 });

  // 4. Grand Exit Gate at Z = -148 (Width = 9m, X: [-4.5, 4.5])
  if (!isExitGateUnlocked) {
    walls.push({ minX: -4.5, maxX: 4.5, minZ: -148.3, maxZ: -147.7 });
  } else {
    walls.push({ minX: -4.6, maxX: -3.8, minZ: -148.3, maxZ: -147.7 });
    walls.push({ minX: 3.8, maxX: 4.6, minZ: -148.3, maxZ: -147.7 });
  }

  // 5. Pos Satpam Building at [-22, 0, -85] (Size 5.5 x 5.5)
  walls.push({ minX: -24.8, maxX: -24.5, minZ: -87.8, maxZ: -82.2 });
  walls.push({ minX: -24.8, maxX: -19.2, minZ: -87.9, maxZ: -87.6 });
  walls.push({ minX: -24.8, maxX: -19.2, minZ: -82.4, maxZ: -82.1 });
  // East wall with door gap at Z: [-86, -84]
  walls.push({ minX: -19.4, maxX: -19.1, minZ: -87.8, maxZ: -86.0 });
  walls.push({ minX: -19.4, maxX: -19.1, minZ: -84.0, maxZ: -82.2 });

  // 6. Central Pond Fountain Monument at [0, 0, -68] (diameter 15m, radius 7.5m)
  walls.push({ minX: -7.5, maxX: 7.5, minZ: -75.5, maxZ: -60.5 });

  // 7. Kantin Sekolah at [-42, 0, -32] (Size 26 x 9, X: [-55, -29], Z: [-36.5, -27.5])
  walls.push({ minX: -55.2, maxX: -28.8, minZ: -36.7, maxZ: -27.3 });

  // 8. Flagpole Podium at [0, 0, -32] (radius 3m)
  walls.push({ minX: -3.0, maxX: 3.0, minZ: -35.0, maxZ: -29.0 });

  // 9. Spectator Tribune at [56, 0, -74] (args: [4, 2, 70], X: [54, 60], Z: [-109, -39])
  walls.push({ minX: 53.8, maxX: 60.2, minZ: -109.2, maxZ: -38.8 });

  return walls;
}
