/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestionType = 'multiple_choice' | 'word_arrange' | 'match_pairs' | 'category_sort';

export interface BaseQuestion {
  id: string;
  floor: 4 | 3 | 2;
  title: string;
  topic: string;
  explanation: string;
  type: QuestionType;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface WordArrangeQuestion extends BaseQuestion {
  type: 'word_arrange';
  prompt: string;
  hint?: string;
  scrambledWords: { id: string; text: string }[];
  correctOrder: string[]; // sequence of IDs or texts
}

export interface MatchPairsQuestion extends BaseQuestion {
  type: 'match_pairs';
  prompt: string;
  pairs: { id: string; left: string; right: string }[];
}

export interface CategorySortQuestion extends BaseQuestion {
  type: 'category_sort';
  prompt: string;
  categories: { id: string; name: string; description?: string }[];
  items: { id: string; text: string; correctCategoryId: string }[];
}

export type Question =
  | MultipleChoiceQuestion
  | WordArrangeQuestion
  | MatchPairsQuestion
  | CategorySortQuestion;

export interface PlayerData {
  id: string;
  name: string;
  color: string;
  position: [number, number, number];
  yaw: number;
  currentFloor: number;
  isInGatheringZone: boolean;
  lastActive: number;
}

export interface RobotState {
  x: number;
  z: number;
  rotation: number;
  isChasing: boolean;
  targetPlayerId: string | null;
}

export interface RoomConfig {
  roomCode: string;
  maxPlayers: 1 | 2 | 3;
  playerName: string;
  playerColor: string;
}

export type GameStatus = 'lobby' | 'playing' | 'gameover' | 'victory';

export interface SyncMessage {
  type:
    | 'PLAYER_JOIN'
    | 'PLAYER_HEARTBEAT'
    | 'PLAYER_MOVE'
    | 'PLAYER_LEAVE'
    | 'QUESTION_SOLVED'
    | 'KEY_COLLECTED'
    | 'GATE_UNLOCKED'
    | 'FLOOR_TRANSITION'
    | 'ROBOT_STATE'
    | 'GAME_OVER'
    | 'VICTORY'
    | 'RESTART_GAME';
  senderId: string;
  roomCode: string;
  payload?: any;
  timestamp: number;
}
