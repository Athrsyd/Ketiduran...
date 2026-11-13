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
} from './gameLogic.ts';

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
});
