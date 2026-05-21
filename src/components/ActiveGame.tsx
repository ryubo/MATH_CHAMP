/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Timer, ArrowLeft, Volume2, VolumeX, Zap, CheckCircle2 } from 'lucide-react';
import { GameMode, OperatorPreference, CalculationType, Question } from '../types';
import { generateQuestion } from '../utils/mathGenerator';
import { audioSynth } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';

interface ActiveGameProps {
  mode: GameMode;
  operator: OperatorPreference;
  calcType: CalculationType;
  onBack: () => void;
  onFinish: (questions: Question[], totalTime: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function ActiveGame({
  mode,
  operator,
  calcType,
  onBack,
  onFinish,
  isMuted,
  onToggleMute,
}: ActiveGameProps) {
  // Practice states
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswerStr, setUserAnswerStr] = useState<string>('');
  const [questionsHistory, setQuestionsHistory] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Flash feedback states
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');

  // Timers
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in seconds
  const [timeLeft, setTimeLeft] = useState<number>(60); // for timeAttack60
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Get total target count
  const isSprint = mode === 'sprint10' || mode === 'sprint20';
  const targetCount = mode === 'sprint10' ? 10 : mode === 'sprint20' ? 20 : Infinity;

  // Initialize first question
  useEffect(() => {
    const q = generateQuestion(`q_${0}`, operator, calcType, []);
    setCurrentQuestion(q);
    setCurrentIndex(0);
    setQuestionsHistory([]);
    setElapsedTime(0);
    setTimeLeft(60);
    questionStartTimeRef.current = Date.now();
    setFeedback('none');

    // Run active timers
    const intervalMs = 50;
    const startTimestamp = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const diffSecs = (now - startTimestamp) / 1000;
      setElapsedTime(diffSecs);

      if (mode === 'timeAttack60') {
        const remaining = Math.max(0, 60 - diffSecs);
        setTimeLeft(remaining);
        
        // Play warning pitch inside final 5 seconds
        if (remaining <= 5 && remaining > 0) {
          const nextMillisecond = (remaining * 1000) % 1000;
          if (nextMillisecond > 950) {
            audioSynth.playTick();
          }
        }

        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          handleGameEnd(diffSecs);
        }
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mode, operator, calcType]);

  const handleGameEnd = (finalTime: number) => {
    onFinish(questionsHistory, mode === 'timeAttack60' ? 60 : finalTime);
  };

  // Keyboard response actions
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (/^[0-9]$/.test(key)) {
        handleNumberPress(parseInt(key, 10));
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Enter' || key === ' ' || key === 'z') {
        event.preventDefault();
        handleSubmit();
      } else if (key === 'Escape') {
        onBack();
      } else if (key === 'c' || key === 'C') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userAnswerStr, currentQuestion, currentIndex, questionsHistory]);

  const handleNumberPress = (num: number) => {
    if (userAnswerStr.length >= 4) return;
    setUserAnswerStr((prev) => prev + num);
  };

  const handleBackspace = () => {
    setUserAnswerStr((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setUserAnswerStr('');
  };

  const handleSubmit = () => {
    if (!currentQuestion || userAnswerStr.trim() === '') return;

    const answerVal = parseInt(userAnswerStr, 10);
    const isCorrect = answerVal === currentQuestion.answer;
    const timeSpentOnQuestion = (Date.now() - questionStartTimeRef.current) / 1000;

    const solvedQuestion: Question = {
      ...currentQuestion,
      userAnswer: answerVal,
      isCorrect,
      timeSpent: timeSpentOnQuestion,
    };

    if (isCorrect) {
      audioSynth.playCorrect();
      setFeedback('correct');
    } else {
      audioSynth.playIncorrect();
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback('none');
    }, 200);

    const updatedHistory = [...questionsHistory, solvedQuestion];
    setQuestionsHistory(updatedHistory);
    setUserAnswerStr('');

    const nextIndex = currentIndex + 1;
    if (isSprint && nextIndex >= targetCount) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      onFinish(updatedHistory, elapsedTime);
    } else {
      const nextQ = generateQuestion(`q_${nextIndex}`, operator, calcType, updatedHistory);
      setCurrentQuestion(nextQ);
      setCurrentIndex(nextIndex);
      questionStartTimeRef.current = Date.now();
    }
  };

  // Compile stats for live metrics sidebar matching the layout
  const stats = React.useMemo(() => {
    const total = questionsHistory.length;
    const correct = questionsHistory.filter((q) => q.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
    
    // Average seconds per question response
    const avgSec = total > 0 ? (elapsedTime / total).toFixed(1) : '0';

    return { total, correct, accuracy, avgSec };
  }, [questionsHistory, elapsedTime]);

  const progressPercent = isSprint
    ? (currentIndex / targetCount) * 100
    : mode === 'timeAttack60'
    ? (timeLeft / 60) * 100
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Top Bar navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-sky-800 bg-white border-2 border-sky-100 rounded-2xl hover:border-sky-300 transition shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} className="stroke-[2.5]" />
          <span>放棄特訓</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-sky-900/10 text-sky-900 rounded-md text-xs font-extrabold tracking-wide">
            模式：{mode === 'sprint10' ? '10題速遞' : mode === 'sprint20' ? '20題極速' : mode === 'timeAttack60' ? '60秒大轟炸' : '禪意自由行'}
          </span>
          <button
            onClick={onToggleMute}
            className="p-2 bg-white border border-sky-100 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Grid matching layout of Vibrant Palette Theme */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Center Task/Problem & Keypad Block (6/12 widths, Top in Mobile via order-1) */}
        <div className="col-span-12 md:col-span-6 order-1 md:order-2 flex flex-col gap-4">
          
          {/* Problem Card */}
          <div className="bg-white rounded-[40px] shadow-2xl flex-grow flex flex-col items-center justify-center relative overflow-hidden border-4 border-sky-200 py-8 px-6 min-h-[300px] md:min-h-[340px]">
            {/* Corner decorator circle style */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-50 rounded-full -z-10"></div>
            
            <AnimatePresence mode="wait">
              {currentQuestion ? (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.15 }}
                  className="text-center z-10 w-full"
                >
                  <div className="flex items-center justify-center gap-5 text-6xl sm:text-7xl md:text-8xl font-black text-sky-900 leading-none">
                    <span className="font-mono">{currentQuestion.num1}</span>
                    <span className="text-sky-305">{currentQuestion.operator}</span>
                    <span className="font-mono">{currentQuestion.num2}</span>
                  </div>

                  {/* Centered Response spot */}
                  <div className="mt-8 flex justify-center">
                    <div className="relative">
                      <div className={`w-52 h-20 bg-sky-50 border-4 rounded-[24px] text-center text-5xl font-black text-sky-950 flex items-center justify-center shadow-inner transition-colors duration-150 ${
                        feedback === 'correct' ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900' :
                        feedback === 'incorrect' ? 'border-rose-400 bg-rose-50/50 text-rose-900' : 'border-sky-400'
                      }`}>
                        {userAnswerStr || '?'}
                      </div>
                      
                      {/* Live visual check indicator */}
                      {feedback === 'correct' && (
                        <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg border-2 border-white">
                          ✓
                        </div>
                      )}
                      {feedback === 'incorrect' && (
                        <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg border-2 border-white font-mono">
                          {currentQuestion.answer}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <p className="text-slate-400">正在生成題目...</p>
              )}
            </AnimatePresence>

            <div className="mt-6 flex gap-4 w-full max-w-sm justify-center">
              <button
                onClick={handleSubmit}
                disabled={userAnswerStr.trim() === ''}
                className={`px-10 py-3.5 text-white font-black text-xl rounded-2xl shadow-xl transition border-b-8 flex-1 cursor-pointer select-none active:translate-y-1 active:border-b-4 ${
                  userAnswerStr.trim() === ''
                    ? 'bg-slate-300 border-slate-450 text-slate-105 opacity-60 cursor-not-allowed border-b-6'
                    : 'bg-sky-500 hover:bg-sky-600 border-sky-700'
                }`}
              >
                解答
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-slate-105 hover:bg-slate-200 text-slate-500 hover:text-slate-800 font-bold rounded-2xl border-b-4 border-slate-300 cursor-pointer active:translate-y-[1px]"
              >
                重填
              </button>
            </div>
          </div>

          {/* New Mobile/Desktop Beautiful Keypad component */}
          <div className="bg-white p-5 rounded-[32px] shadow-xl border-4 border-sky-200 flex flex-col justify-center">
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumberPress(num)}
                  className="py-3 px-4 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-xl font-black font-mono rounded-2xl border-b-4 border-slate-250 transition text-slate-800 cursor-pointer flex items-center justify-center active:translate-y-[2px] active:border-b-2 select-none"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 px-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-xs font-black rounded-2xl border-b-4 border-rose-250 transition text-rose-600 cursor-pointer flex items-center justify-center active:translate-y-[2px] active:border-b-2 select-none"
              >
                修正 (⌫)
              </button>
              <button
                type="button"
                onClick={() => handleNumberPress(0)}
                className="py-3 px-4 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-xl font-black font-mono rounded-2xl border-b-4 border-slate-250 transition text-slate-800 cursor-pointer flex items-center justify-center active:translate-y-[2px] active:border-b-2 select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={userAnswerStr.trim() === ''}
                className={`py-3 px-2 text-xs font-black rounded-2xl border-b-4 transition cursor-pointer flex items-center justify-center active:translate-y-[2px] active:border-b-2 select-none ${
                  userAnswerStr.trim() === ''
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white shadow-md'
                }`}
              >
                發射 (⏎)
              </button>
            </div>
          </div>

        </div>

        {/* Left Stats Column (3/12 widths, Below in Mobile via order-2) */}
        <div className="col-span-12 md:col-span-3 order-2 md:order-1 flex flex-col gap-4">
          
          {/* Live Stats badging */}
          <div className="bg-white p-5 rounded-[28px] shadow-lg border-b-4 border-purple-200 flex-grow flex flex-col justify-between">
            <div>
              <h2 className="text-purple-950 font-black text-md mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-purple-500 rounded-full"></span>
                即時戰況
              </h2>
              
              <div className="space-y-3.5">
                <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-100">
                  <p className="text-[10px] font-black text-purple-600 uppercase mb-0.5">當前正確率</p>
                  <p className="text-2xl font-black text-purple-700 font-mono">{stats.accuracy}%</p>
                </div>
                
                <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-0.5">單題秒速</p>
                  <p className="text-2xl font-black text-emerald-700 font-mono">{stats.avgSec} <span className="text-xs font-sans">s</span></p>
                </div>
                
                <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-600 uppercase mb-0.5">答題總進度</p>
                  <p className="text-2xl font-black text-orange-700 font-mono">
                    {stats.correct} <span className="text-xs text-slate-400 font-normal">/ {stats.total} 答對</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[9px] text-slate-400 font-mono pt-4 text-center">
              進階進度：{currentIndex} 答
            </div>
          </div>

          {/* Time Counter block */}
          <div className="bg-rose-500 p-5 rounded-[28px] shadow-lg border-b-4 border-rose-700 text-white text-center">
            <p className="text-xs font-bold uppercase opacity-85 mb-1 tracking-wider">計時時間</p>
            <p className="text-4xl font-extrabold font-mono tabular-nums">
              {mode === 'timeAttack60' ? timeLeft.toFixed(1) : elapsedTime.toFixed(1)}s
            </p>
            
            {/* Visual Mini track */}
            {(isSprint || mode === 'timeAttack60') && (
              <div className="mt-3 w-full bg-rose-700/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

        </div>

        {/* Right Recent History Block (3/12 widths, Below in Mobile via order-3) */}
        <div className="col-span-12 md:col-span-3 order-3 md:order-3 flex flex-col gap-4">
          
          {/* Recent list panel */}
          <div className="bg-white p-5 rounded-[28px] shadow-lg border-b-4 border-blue-200 flex-grow flex flex-col justify-between">
            <div>
              <h2 className="text-blue-900 font-black text-md mb-3 font-display">歷史快報</h2>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {questionsHistory.length === 0 ? (
                  <p className="text-slate-300 text-xs italic py-2">目前尚無作答紀錄。</p>
                ) : (
                  [...questionsHistory].reverse().slice(0, 3).map((q) => (
                    <div
                      key={q.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold leading-none ${
                        q.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
                      }`}
                    >
                      <span className="font-mono">{q.num1} {q.operator} {q.num2} = {q.userAnswer}</span>
                      <span className="text-[10px] bg-white px-1.5 py-0.5 rounded leading-none font-bold">
                        {q.isCorrect ? '對' : '錯'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-amber-400 p-5 rounded-[28px] shadow-lg border-b-4 border-amber-600">
            <div className="flex items-center justify-between text-amber-950">
              <span className="font-black text-xs">大腦傳導係數</span>
              <span className="font-black text-sm">TOP 10%</span>
            </div>
            <div className="mt-2.5 w-full bg-amber-250 h-2.5 rounded-full overflow-hidden">
              <div className="bg-white h-full w-[88%] rounded-full"></div>
            </div>
          </div>

        </div>

      </div>

      {/* Footer Hotkey panel matching Design HTML row */}
      <footer className="mt-8 flex justify-center">
        <div className="bg-sky-950/5 backdrop-blur-sm px-6 py-2 rounded-full flex flex-wrap justify-center gap-4 text-xs font-bold text-sky-900/80">
          <p className="flex items-center">
            <span className="bg-white px-2 py-0.5 rounded shadow-[0_1px_0_rgba(0,0,0,0.1)] mr-1.5 text-[10px] text-sky-900">ENTER</span> 確認答案
          </p>
          <p className="flex items-center">
            <span className="bg-white px-2 py-0.5 rounded shadow-[0_1px_0_rgba(0,0,0,0.1)] mr-1.5 text-[10px] text-sky-900">ESC</span> 放棄返回
          </p>
          <p className="flex items-center">
            <span className="bg-white px-2 py-0.5 rounded shadow-[0_1px_0_rgba(0,0,0,0.1)] mr-1.5 text-[10px] text-sky-900">C</span> 清除更正
          </p>
        </div>
      </footer>

    </div>
  );
}
