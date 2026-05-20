/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'sprint10' | 'sprint20' | 'timeAttack60' | 'zen';
export type OperatorPreference = 'add' | 'subtract' | 'mixed';
export type CalculationType = 'all' | 'simple'; // 'simple' means no-carry/no-borrow, 'all' means standard 2-digit

export interface Question {
  id: string;
  num1: number;
  num2: number;
  operator: '+' | '-';
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timeSpent: number; // in seconds
}

export interface GameScore {
  correctCount: number;
  totalCount: number;
  totalTime: number; // in seconds
  averageSpeed: number; // seconds per question
  accuracy: number; // 0 to 100
  questions: Question[];
}

export interface BestRecord {
  bestTime: number; // best time in seconds (for 100% accuracy)
  bestAccuracy: number; // best accuracy (%)
  maxSolved: number; // most solved in Time Attack
  averageSpeed: number; // best average speed (secs/question)
  timestamp: string;
}

export interface ModeRecords {
  // key is format: `${GameMode}_${OperatorPreference}_${CalculationType}`
  [recordKey: string]: BestRecord;
}
