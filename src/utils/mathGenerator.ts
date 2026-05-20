/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, OperatorPreference, CalculationType } from '../types';

/**
 * Generate a single unique and random 2-digit question based on preferences.
 * num1 and num2 will be in the range [10, 99]
 */
export function generateQuestion(
  id: string,
  operatorPref: OperatorPreference,
  calculationType: CalculationType,
  existingQuestions: Question[] = []
): Question {
  let num1 = 10;
  let num2 = 10;
  let op: '+' | '-' = '+';

  // Determine operator
  if (operatorPref === 'add') {
    op = '+';
  } else if (operatorPref === 'subtract') {
    op = '-';
  } else {
    op = Math.random() < 0.5 ? '+' : '-';
  }

  // To prevent generating duplicate questions in the current session
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    if (op === '+') {
      if (calculationType === 'simple') {
        // No carry-over (不進位)
        // Tens sum <= 9, units sum <= 9
        const a1 = Math.floor(Math.random() * 8) + 1; // 1 to 8
        const a2 = Math.floor(Math.random() * (9 - a1)) + 1; // 1 to 9-a1

        const b1 = Math.floor(Math.random() * 10); // 0 to 9
        const b2 = Math.floor(Math.random() * (10 - b1)); // 0 to 9-b1

        num1 = a1 * 10 + b1;
        num2 = a2 * 10 + b2;
      } else {
        // All 2-digit additions
        num1 = Math.floor(Math.random() * 90) + 10; // 10 to 99
        num2 = Math.floor(Math.random() * 90) + 10; // 10 to 99
      }
    } else {
      // Subtraction (-)
      if (calculationType === 'simple') {
        // No borrowing (不借位)
        // num1 >= num2, and individual units/tens of num1 >= num2
        const a1 = Math.floor(Math.random() * 9) + 1; // 1 to 9
        const a2 = Math.floor(Math.random() * a1) + 1; // 1 to a1

        const b1 = Math.floor(Math.random() * 10); // 0 to 9
        const b2 = Math.floor(Math.random() * (b1 + 1)); // 0 to b1

        num1 = a1 * 10 + b1;
        num2 = a2 * 10 + b2;
      } else {
        // All standard 2-digit subtractions
        num1 = Math.floor(Math.random() * 90) + 10; // 10 to 99
        num2 = Math.floor(Math.random() * 90) + 10; // 10 to 99
        if (num1 < num2) {
          // Swap so answer is positive
          const temp = num1;
          num1 = num2;
          num2 = temp;
        }
      }
    }

    // Ensure they are proper 2-digit operations and result isn't trivial
    const diff = num1 - num2;
    const isTrivial = op === '-' && (diff < 3 || num1 === num2);
    
    // Check duplication
    const isDuplicate = existingQuestions.some(
      (q) => q.num1 === num1 && q.num2 === num2 && q.operator === op
    );

    if (!isDuplicate && !isTrivial) {
      break;
    }
    attempts++;
  }

  const answer = op === '+' ? num1 + num2 : num1 - num2;

  return {
    id,
    num1,
    num2,
    operator: op,
    answer,
    timeSpent: 0,
  };
}

/**
 * Generate a batch of dynamic questions for a math trial.
 */
export function generateQuestionBatch(
  count: number,
  operatorPref: OperatorPreference,
  calculationType: CalculationType
): Question[] {
  const batch: Question[] = [];
  for (let i = 0; i < count; i++) {
    const q = generateQuestion(`q_${i}`, operatorPref, calculationType, batch);
    batch.push(q);
  }
  return batch;
}
