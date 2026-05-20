/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import SettingsLobby from './components/SettingsLobby';
import ActiveGame from './components/ActiveGame';
import GameSummary from './components/GameSummary';
import { GameMode, OperatorPreference, CalculationType, Question, ModeRecords } from './types';
import { loadAllRecords, saveBestRecord, resetAllRecords } from './utils/recordManager';
import { audioSynth } from './utils/audio';

export default function App() {
  // Config state
  const [mode, setMode] = useState<GameMode>('sprint10');
  const [operator, setOperator] = useState<OperatorPreference>('add');
  const [calcType, setCalcType] = useState<CalculationType>('simple');

  // Game state flow
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  
  // Audio state
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Results state
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [sessionTotalTime, setSessionTotalTime] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Local storage records state
  const [records, setRecords] = useState<ModeRecords>({});

  // Sync records on initial boot
  useEffect(() => {
    setRecords(loadAllRecords());
    setIsMuted(audioSynth.getMuteState());
  }, []);

  // Set visual game triggers
  const handleStartGame = () => {
    setGameState('playing');
  };

  const handleFinishGame = (questions: Question[], totalTime: number) => {
    setSessionQuestions(questions);
    setSessionTotalTime(totalTime);

    const totalCount = questions.length;
    const correctCount = questions.filter((q) => q.isCorrect).length;

    // Check high records if there is actual input solved
    if (totalCount > 0) {
      const result = saveBestRecord(mode, operator, calcType, {
        correctCount,
        totalCount,
        timeSpent: totalTime,
      });

      setIsNewRecord(result.isNewRecord);
      
      // Update local React state to display immediately
      setRecords(loadAllRecords());

      // If they finished a sprint mode successfully with 100% accuracy, play victory chime!
      const accuracy = (correctCount / totalCount) * 100;
      if (accuracy === 100) {
        audioSynth.playVictory();
      }
    } else {
      setIsNewRecord(false);
    }

    setGameState('finished');
  };

  const handleResetRecordsInApp = () => {
    resetAllRecords();
    setRecords({});
  };

  const handleToggleMuteInApp = () => {
    const nextMuted = audioSynth.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between select-none">
      
      {/* Dynamic Render Controller */}
      <main className="flex-grow flex items-center justify-center">
        {gameState === 'lobby' && (
          <SettingsLobby
            mode={mode}
            setMode={setMode}
            operator={operator}
            setOperator={setOperator}
            calcType={calcType}
            setCalcType={setCalcType}
            onStart={handleStartGame}
            records={records}
            onResetRecords={handleResetRecordsInApp}
            isMuted={isMuted}
            onToggleMute={handleToggleMuteInApp}
          />
        )}

        {gameState === 'playing' && (
          <ActiveGame
            mode={mode}
            operator={operator}
            calcType={calcType}
            onBack={() => setGameState('lobby')}
            onFinish={handleFinishGame}
            isMuted={isMuted}
            onToggleMute={handleToggleMuteInApp}
          />
        )}

        {gameState === 'finished' && (
          <GameSummary
            mode={mode}
            operator={operator}
            calcType={calcType}
            questions={sessionQuestions}
            totalTime={sessionTotalTime}
            isNewRecord={isNewRecord}
            onRestart={handleStartGame}
            onHome={() => setGameState('lobby')}
          />
        )}
      </main>

      {/* Simple, Non-intrusive Elegant Human Footer */}
      <footer className="py-6 border-t border-slate-200/80 bg-white/50 text-center text-[11px] text-slate-400 font-medium">
        <span>兩位數加減法練習 • 快速口答特訓系統</span>
      </footer>

    </div>
  );
}
