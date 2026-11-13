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
 * Uses swept/clamped collision with separate X and Z resolution to allow smooth wall sliding
 * and strictly prevents tunneling or penetration through walls.
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
  // 1. Resolve X movement while holding current Z
  let nextX = targetX;
  // Boundary clamp
  nextX = Math.max(bounds.minX + radius, Math.min(bounds.maxX - radius, nextX));

  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    // Check if player Z overlaps the wall Z
    const zOverlaps = currentZ + radius > w.minZ && currentZ - radius < w.maxZ;
    if (!zOverlaps) continue;

    // Moving West (targetX < currentX): crossing from east side of wall
    if (currentX >= w.maxX && nextX - radius < w.maxX) {
      nextX = currentX;
      break;
    }
    // Moving East (targetX > currentX): crossing from west side of wall
    if (currentX <= w.minX && nextX + radius > w.minX) {
      nextX = currentX;
      break;
    }
    // Inside overlap check
    if (nextX + radius > w.minX && nextX - radius < w.maxX) {
      nextX = currentX;
      break;
    }
  }

  // 2. Resolve Z movement with the resolved X
  let nextZ = targetZ;
  // Boundary clamp
  nextZ = Math.max(bounds.minZ + radius, Math.min(bounds.maxZ - radius, nextZ));

  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    // Check if player X overlaps the wall X
    const xOverlaps = nextX + radius > w.minX && nextX - radius < w.maxX;
    if (!xOverlaps) continue;

    // Moving North (targetZ < currentZ): crossing from south side of wall
    if (currentZ >= w.maxZ && nextZ - radius < w.maxZ) {
      nextZ = currentZ;
      break;
    }
    // Moving South (targetZ > currentZ): crossing from north side of wall
    if (currentZ <= w.minZ && nextZ + radius > w.minZ) {
      nextZ = currentZ;
      break;
    }
    // Inside overlap check
    if (nextZ + radius > w.minZ && nextZ - radius < w.maxZ) {
      nextZ = currentZ;
      break;
    }
  }

  return [nextX, nextZ];
}

/**
 * Returns solid wall bounding boxes for upper school floors (Floors 4, 3, 2).
 * Corridor: Width 7.0m (X: -3.5 to +3.5), Length from Z = 14 to Z = -74.
 * 8 Classrooms: 4 on the West (X: -15.5 to -3.5), 4 on the East (X: 3.5 to 15.5).
 */
export function getUpperFloorWalls(isGateUnlocked: boolean): WallAABB[] {
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
 * Returns solid wall bounding boxes for Floor 1 (Ground Hallway & Courtyard).
 * Hallway: X: -3.5 to +3.5, Z: +14 down to -16.
 * Yard: X: -48 to +48, Z: -16 down to -108.
 */
export function getFloor1Walls(isExitGateUnlocked: boolean): WallAABB[] {
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
