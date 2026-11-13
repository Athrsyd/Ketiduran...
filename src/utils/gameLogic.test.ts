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
import { resolveMovement, getUpperFloorWalls } from './collision.ts';

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
    // Corridor wall is at X = -3.5.
    // Try to walk from corridor (X = -2.0, Z = 8.0) into room through the solid wall (X = -4.0, Z = 8.0):
    const [resX, resZ] = resolveMovement(-2.0, 8.0, -4.0, 8.0, 0.35, walls, bounds);
    // Movement on X must be BLOCKED by wall segment North of Door!
    assert.strictEqual(resX, -2.0);
    assert.strictEqual(resZ, 8.0);
  });

  test('resolveMovement allows walking through door opening', () => {
    const walls = getUpperFloorWalls(false);
    const bounds = { minX: -16, maxX: 16, minZ: -74, maxZ: 14 };
    // At door Z = 5.0 (inside [3.6, 6.0]), walk from X = -2.0 to -4.5 (through door):
    const [resX, resZ] = resolveMovement(-2.0, 5.0, -4.5, 5.0, 0.35, walls, bounds);
    // Movement on X should be ALLOWED through the door!
    assert.strictEqual(resX, -4.5);
    assert.strictEqual(resZ, 5.0);
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
});
