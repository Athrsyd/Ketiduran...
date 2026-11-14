/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function validateMultipleChoice(
  selectedOptionId: string | null,
  correctOptionId: string
): boolean {
  return selectedOptionId === correctOptionId;
}

export function validateWordArrange(
  currentOrder: string[],
  correctOrder: string[]
): boolean {
  if (currentOrder.length !== correctOrder.length) return false;
  return currentOrder.every((id, idx) => id === correctOrder[idx]);
}

export function validateMatchPairs(
  matches: Record<string, string>, // leftId -> rightId
  pairs: { id: string; left: string; right: string }[]
): boolean {
  if (Object.keys(matches).length !== pairs.length) return false;
  return pairs.every((pair) => matches[pair.id] === pair.id);
}

export function validateCategorySort(
  placements: Record<string, string>, // itemId -> categoryId
  items: { id: string; correctCategoryId: string }[]
): boolean {
  if (Object.keys(placements).length !== items.length) return false;
  return items.every((item) => placements[item.id] === item.correctCategoryId);
}

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export function isPointInZone(x: number, z: number, zone: BoundingBox2D): boolean {
  return x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ;
}

export function checkAllPlayersInGatheringZone(
  playersInZone: boolean[]
): { allInZone: boolean; inZoneCount: number; totalCount: number } {
  const totalCount = playersInZone.length;
  if (totalCount === 0) {
    return { allInZone: false, inZoneCount: 0, totalCount: 0 };
  }
  const inZoneCount = playersInZone.filter(Boolean).length;
  return {
    allInZone: inZoneCount === totalCount,
    inZoneCount,
    totalCount,
  };
}

export function getFloorSpawnPosition(floor: number): [number, number, number] {
  switch (floor) {
    case 4:
    case 3:
    case 2:
      // Spawns at north end of spacious 88m corridor facing south
      return [0, 1.6, 10.0];
    case 1:
      // Spawns inside ground floor school entrance lobby facing outdoor yard
      return [0, 1.6, 10.0];
    default:
      return [0, 1.6, 10.0];
  }
}

export function canTeamEscape(teammates: { currentFloor: number; isStunned?: boolean }[]): boolean {
  return !teammates.some((tm) => tm.currentFloor === 1 && tm.isStunned);
}

export function isTeamWiped(
  myStunned: boolean,
  teammatesOnFloor: { isStunned?: boolean }[]
): boolean {
  if (!myStunned) return false;
  if (teammatesOnFloor.length === 0) return true;
  return teammatesOnFloor.every((tm) => !!tm.isStunned);
}
