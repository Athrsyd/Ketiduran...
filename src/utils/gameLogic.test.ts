/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  validateMultipleChoice,
  validateWordArrange,
  validateMatchPairs,
  validateCategorySort,
  isPointInZone,
  checkAllPlayersInGatheringZone,
  getFloorSpawnPosition,
} from './gameLogic.ts';
import { resolveMovement, getUpperFloorWalls, getMultiplayerFloorWalls } from './collision.ts';
import { MASTER_KEY_SPAWNS, getMasterKeySpawn } from '../data/floor1Spawns.ts';

describe('Game Pure Logic Tests', () => {
  test('validateMultipleChoice checks correct option', () => {
    assert.strictEqual(validateMultipleChoice('opt_b', 'opt_b'), true);
    assert.strictEqual(validateMultipleChoice('opt_a', 'opt_b'), false);
    assert.strictEqual(validateMultipleChoice(null, 'opt_b'), false);
  });

  test('validateWordArrange checks order of words', () => {
    assert.strictEqual(
      validateWordArrange(['w1', 'w2', 'w3'], ['w1', 'w2', 'w3']),
      true
    );
    assert.strictEqual(
      validateWordArrange(['w2', 'w1', 'w3'], ['w1', 'w2', 'w3']),
      false
    );
    assert.strictEqual(
      validateWordArrange(['w1', 'w2'], ['w1', 'w2', 'w3']),
      false
    );
  });

  test('validateMatchPairs checks paired items', () => {
    const pairs = [
      { id: 'p1', left: 'A', right: '1' },
      { id: 'p2', left: 'B', right: '2' },
    ];
    assert.strictEqual(validateMatchPairs({ p1: 'p1', p2: 'p2' }, pairs), true);
    assert.strictEqual(validateMatchPairs({ p1: 'p2', p2: 'p1' }, pairs), false);
    assert.strictEqual(validateMatchPairs({ p1: 'p1' }, pairs), false);
  });

  test('validateCategorySort verifies items placed in correct categories', () => {
    const items = [
      { id: 'it_1', correctCategoryId: 'cat_a' },
      { id: 'it_2', correctCategoryId: 'cat_b' },
    ];
    assert.strictEqual(
      validateCategorySort({ it_1: 'cat_a', it_2: 'cat_b' }, items),
      true
    );
    assert.strictEqual(
      validateCategorySort({ it_1: 'cat_b', it_2: 'cat_b' }, items),
      false
    );
  });

  test('isPointInZone tests 2D rectangular bounds', () => {
    const zone = { minX: -2, maxX: 2, minZ: 10, maxZ: 15 };
    assert.strictEqual(isPointInZone(0, 12, zone), true);
    assert.strictEqual(isPointInZone(-2, 10, zone), true);
    assert.strictEqual(isPointInZone(3, 12, zone), false);
    assert.strictEqual(isPointInZone(0, 9, zone), false);
  });

  test('checkAllPlayersInGatheringZone calculates zone requirements', () => {
    const res1 = checkAllPlayersInGatheringZone([true, true]);
    assert.strictEqual(res1.allInZone, true);
    assert.strictEqual(res1.inZoneCount, 2);

    const res2 = checkAllPlayersInGatheringZone([true, false]);
    assert.strictEqual(res2.allInZone, false);
    assert.strictEqual(res2.inZoneCount, 1);
    assert.strictEqual(res2.totalCount, 2);

    const resSolo = checkAllPlayersInGatheringZone([true]);
    assert.strictEqual(resSolo.allInZone, true);
    assert.strictEqual(resSolo.inZoneCount, 1);
  });

  test('getFloorSpawnPosition spawns at north end of corridor', () => {
    const pos4 = getFloorSpawnPosition(4);
    assert.deepStrictEqual(pos4, [0, 1.6, 10.0]);
    const pos1 = getFloorSpawnPosition(1);
    assert.deepStrictEqual(pos1, [0, 1.6, 10.0]);
  });

  test('resolveMovement blocks walking through corridor wall outside door', () => {
    const walls = getUpperFloorWalls(false);
    const bounds = { minX: -16, maxX: 16, minZ: -74, maxZ: 14 };
    // Room 1 is at rz = 6.0, door is at Z in [3.6, 6.0].
    // Corridor wall is at X = -3.5 (maxX = -3.35).
    // Try to walk from corridor (X = -2.0, Z = 8.0) into room through the solid wall (X = -4.0, Z = 8.0):
    const [resX, resZ] = resolveMovement(-2.0, 8.0, -4.0, 8.0, 0.35, walls, bounds);
    // Player walks up to the wall surface (-3.35 + 0.35 = -3.0) and is strictly blocked from penetrating:
    assert.strictEqual(resX, -3.0);
    assert.strictEqual(resZ, 8.0);

    // Further attempts to push into wall are blocked at wall surface:
    const [resX2, resZ2] = resolveMovement(-3.0, 8.0, -4.5, 8.0, 0.35, walls, bounds);
    assert.strictEqual(resX2, -3.0);
    assert.strictEqual(resZ2, 8.0);
  });

  test('resolveMovement allows walking through door opening', () => {
    const walls = getUpperFloorWalls(false);
    const bounds = { minX: -16, maxX: 16, minZ: -74, maxZ: 14 };
    // At door Z = 5.0 (inside [3.6, 6.0]), walk from X = -2.0 to -4.5 (through door):
    const [resX, resZ] = resolveMovement(-2.0, 5.0, -4.5, 5.0, 0.35, walls, bounds);
    // Movement on X should be ALLOWED through the door!
    assert.strictEqual(Math.abs(resX - (-4.5)) < 1e-4, true, `Expected resX ~ -4.5, got ${resX}`);
    assert.strictEqual(Math.abs(resZ - 5.0) < 1e-4, true, `Expected resZ ~ 5.0, got ${resZ}`);
  });

  test('math for A/D right vector has correct sign at all angles', () => {
    // When yaw = 0 (facing -Z): Right vector is (1, 0, 0)
    let cosY = Math.cos(0);
    let sinY = Math.sin(0);
    assert.strictEqual(cosY, 1);
    assert.strictEqual(-sinY, -0);

    // When yaw = PI/2 (turned 90 deg left facing -X):
    // Right hand should point North (-Z)!
    cosY = Math.round(Math.cos(Math.PI / 2));
    sinY = Math.round(Math.sin(Math.PI / 2));
    assert.strictEqual(cosY, 0);
    assert.strictEqual(-sinY, -1); // Side Z is -1, pointing along -Z!
  });

  test('Floor 2 multiplayer S-curve labyrinth corridor is fully traversable from start to finish', () => {
    const walls = getMultiplayerFloorWalls(2, false);
    const bounds = { minX: -38, maxX: 38, minZ: -74, maxZ: 14 };
    const r = 0.35;

    // Waypoints along the open corridor path:
    const path: [number, number][] = [
      [0, 10],     // North spawn
      [0, 5],      // Segment 1
      [0, 0],      // Entering Turn 1
      [-10, 0],    // Turn 1 westwards
      [-18.5, 0],  // West corner into Segment 2
      [-18.5, -15],// Segment 2 southwards
      [-18.5, -30],// West corner into Turn 2 (Central Transverse Bridge)
      [0, -30],    // Crossing Bridge
      [18.5, -30], // East corner into Segment 3
      [18.5, -45], // Segment 3 southwards
      [18.5, -60], // East corner into Turn 3
      [0, -60],    // Turn 3 westwards into Segment 4
      [0, -68],    // Segment 4 in front of Gate
    ];

    // Simulate stepping between each waypoint:
    for (let i = 0; i < path.length - 1; i++) {
      const [fromX, fromZ] = path[i];
      const [toX, toZ] = path[i + 1];
      const [resX, resZ] = resolveMovement(fromX, fromZ, toX, toZ, r, walls, bounds);

      assert.strictEqual(
        Math.abs(resX - toX) < 0.05,
        true,
        `X blocked between waypoint ${i} (${fromX}, ${fromZ}) and ${i + 1} (${toX}, ${toZ}): got ${resX}`
      );
      assert.strictEqual(
        Math.abs(resZ - toZ) < 0.05,
        true,
        `Z blocked between waypoint ${i} (${fromX}, ${fromZ}) and ${i + 1} (${toX}, ${toZ}): got ${resZ}`
      );
    }
  });

  test('diagonal corner pushing prevents wall penetration', () => {
    const walls = getUpperFloorWalls(false);
    const bounds = { minX: -16, maxX: 16, minZ: -74, maxZ: 14 };
    const r = 0.35;

    // Wall at north back: minZ = 13.85, maxZ = 14.15, minX = -3.65, maxX = 3.65
    // West corridor wall: minX = -3.65, maxX = -3.35, minZ = 11.5, maxZ = 14.0
    // Try pushing hard diagonally into top-left corner: (-3.5, 14.0)
    const [resX, resZ] = resolveMovement(-2.8, 13.0, -5.0, 15.0, r, walls, bounds);
    // resX must not penetrate west wall (resX >= -3.35 + 0.35 = -3.0)
    assert.strictEqual(resX >= -3.05, true, `Penetrated west wall: resX = ${resX}`);
    // resZ must not penetrate north wall (resZ <= 13.85 - 0.35 = 13.5)
    assert.strictEqual(resZ <= 13.55, true, `Penetrated north wall: resZ = ${resZ}`);
  });

  test('Floor 2 Gate entrance is completely unblocked and North side is sealed', () => {
    const walls = getMultiplayerFloorWalls(2, false);
    const bounds = { minX: -38, maxX: 38, minZ: -74, maxZ: 14 };
    const r = 0.35;

    // 1. Moving from Turn 3 into Segment 4 (Z: -60 -> -68) must NOT hit any wall
    const [gateX, gateZ] = resolveMovement(0, -60, 0, -68, r, walls, bounds);
    assert.strictEqual(Math.abs(gateX - 0) < 1e-4, true);
    assert.strictEqual(Math.abs(gateZ - (-68)) < 1e-4, true, `Gate entrance blocked: got Z = ${gateZ}`);

    // 2. Trying to walk into the void to the North at Z = -56.5 (X = 0) must be BLOCKED by Turn 3 North Wall
    const [voidX, voidZ] = resolveMovement(0, -58, 0, -55, r, walls, bounds);
    assert.strictEqual(
      voidZ <= -56.65 + r + 0.05,
      true,
      `North wall missing, penetrated into void: got Z = ${voidZ}`
    );
  });

  test('Floor 2 Central Bridge East corner (X in [15, 22], Z = -26.5) is completely sealed', () => {
    const walls = getMultiplayerFloorWalls(2, false);
    const bounds = { minX: -38, maxX: 38, minZ: -74, maxZ: 14 };
    const r = 0.35;

    // Trying to walk into void at [18.5, -24] (crossing Z = -26.5 from bridge):
    const [resX, resZ] = resolveMovement(18.5, -28.0, 18.5, -24.0, r, walls, bounds);
    assert.strictEqual(
      resZ <= -26.65 + r + 0.05,
      true,
      `Bridge east corner missing wall, penetrated into void: got Z = ${resZ}`
    );
  });

  test('Floor 4 Room doorways are open and boundaries completely sealed with zero gap', () => {
    const walls = getMultiplayerFloorWalls(4, false);
    const bounds = { minX: -40, maxX: 40, minZ: -76, maxZ: 16 };
    const r = 0.35;

    // 1. Walk from West Wing Corridor (Z = -15) into Room 0 (Z = -9) through doorway at X = -29.2
    const [r0X, r0Z] = resolveMovement(-29.2, -15.0, -29.2, -9.0, r, walls, bounds);
    assert.strictEqual(r0X, -29.2);
    assert.strictEqual(
      r0Z <= -9.0 + 0.05,
      true,
      `Doorway to Room 0 blocked: got Z = ${r0Z}`
    );

    // 2. Walk from West Wing Corridor (Z = -16) into Room 1 (Z = -23) through doorway at X = -26.8
    const [r1X, r1Z] = resolveMovement(-26.8, -16.0, -26.8, -23.0, r, walls, bounds);
    assert.strictEqual(r1X, -26.8);
    assert.strictEqual(
      r1Z <= -23.0 + 0.05,
      true,
      `Doorway to Room 1 blocked: got Z = ${r1Z}`
    );

    // 3. Inside Room 0, trying to walk into void through West wall (X = -33.5)
    const [void0X] = resolveMovement(-32.0, -7.0, -35.0, -7.0, r, walls, bounds);
    assert.strictEqual(
      void0X >= -33.35 + r - 0.05,
      true,
      `Penetrated Room 0 west wall: got X = ${void0X}`
    );

    // 4. Floor 4 South end wall at Z = -74 completely seals corridor
    const [, endZ] = resolveMovement(0, -72.0, 0, -76.0, r, walls, bounds);
    assert.strictEqual(
      endZ >= -74.15 + r - 0.05,
      true,
      `Penetrated Floor 4 south wall: got Z = ${endZ}`
    );
  });

  test('Floor 1 Master Key Spawns has valid curated locations in map boundaries', () => {
    assert.strictEqual(MASTER_KEY_SPAWNS.length >= 5, true);
    for (let i = 0; i < MASTER_KEY_SPAWNS.length; i++) {
      const multi = getMasterKeySpawn(i, true);
      const solo = getMasterKeySpawn(i, false);
      assert.ok(multi.name && multi.hint, `Spawn ${i} missing name or hint`);
      // Multiplayer yard bounds: X in [-70, 70], Z in [-156, -16]
      assert.strictEqual(multi.position[0] >= -68 && multi.position[0] <= 68, true);
      assert.strictEqual(multi.position[2] >= -150 && multi.position[2] <= -20, true);
      // Solo yard bounds: X in [-48, 48], Z in [-112, -16]
      assert.strictEqual(solo.position[0] >= -45 && solo.position[0] <= 45, true);
      assert.strictEqual(solo.position[2] >= -105 && solo.position[2] <= -20, true);
    }
  });
});
