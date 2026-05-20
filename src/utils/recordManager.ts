/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMode, OperatorPreference, CalculationType, BestRecord, ModeRecords } from '../types';

const STORAGE_KEY = 'math_practice_best_records_v1';

export function getRecordKey(
  mode: GameMode,
  operator: OperatorPreference,
  difficulty: CalculationType
): string {
  return `${mode}_${operator}_${difficulty}`;
}

export function loadAllRecords(): ModeRecords {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error reading records from localStorage:', e);
    return {};
  }
}

export function saveBestRecord(
  mode: GameMode,
  operator: OperatorPreference,
  difficulty: CalculationType,
  stats: { correctCount: number; totalCount: number; timeSpent: number }
): { isNewRecord: boolean; previous?: BestRecord; current: BestRecord } {
  const records = loadAllRecords();
  const key = getRecordKey(mode, operator, difficulty);
  const previous = records[key];

  let isNewRecord = false;
  const currentAccuracy = (stats.correctCount / Math.max(1, stats.totalCount)) * 100;
  const avgSpeed = stats.timeSpent / Math.max(1, stats.correctCount); // seconds per correct answer

  // Initialize new record template
  const newRecord: BestRecord = previous
    ? { ...previous }
    : {
        bestTime: Infinity,
        bestAccuracy: 0,
        maxSolved: 0,
        averageSpeed: Infinity,
        timestamp: new Date().toISOString(),
      };

  if (mode === 'sprint10' || mode === 'sprint20') {
    // Priority 1: Accuracy is higher
    if (currentAccuracy > newRecord.bestAccuracy) {
      isNewRecord = true;
      newRecord.bestAccuracy = currentAccuracy;
      // If accuracy gets better, save the time as the new baseline
      newRecord.bestTime = stats.timeSpent;
      newRecord.averageSpeed = avgSpeed;
    } 
    // Priority 2: Accuracy is the same, but time is faster
    else if (currentAccuracy === newRecord.bestAccuracy) {
      if (stats.timeSpent < newRecord.bestTime) {
        isNewRecord = true;
        newRecord.bestTime = stats.timeSpent;
        newRecord.averageSpeed = avgSpeed;
      }
    }
  } else if (mode === 'timeAttack60') {
    // Time attack rewards total correct responses solved in 60s
    if (stats.correctCount > newRecord.maxSolved) {
      isNewRecord = true;
      newRecord.maxSolved = stats.correctCount;
      newRecord.bestAccuracy = currentAccuracy;
      newRecord.averageSpeed = avgSpeed;
    }
  } else if (mode === 'zen') {
    // Zen practice tracks aggregate counts solved
    const prevMax = previous?.maxSolved || 0;
    const newMax = prevMax + stats.correctCount;
    isNewRecord = stats.correctCount > 0;
    newRecord.maxSolved = newMax; // total solved accumulation
    newRecord.bestAccuracy = Math.max(newRecord.bestAccuracy, currentAccuracy);
    newRecord.averageSpeed = Math.min(newRecord.averageSpeed, avgSpeed || Infinity);
  }

  if (isNewRecord) {
    newRecord.timestamp = new Date().toISOString();
    records[key] = newRecord;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving records to localStorage:', e);
    }
  }

  return {
    isNewRecord,
    previous,
    current: records[key] || newRecord,
  };
}

export function resetAllRecords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing localStorage records:', e);
  }
}
