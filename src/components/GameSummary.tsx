/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Award, RotateCcw, Home, Sparkles, Clock, FileCheck, CheckCircle2, XCircle } from 'lucide-react';
import { GameMode, OperatorPreference, CalculationType, Question } from '../types';

interface GameSummaryProps {
  mode: GameMode;
  operator: OperatorPreference;
  calcType: CalculationType;
  questions: Question[];
  totalTime: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export default function GameSummary({
  mode,
  operator,
  calcType,
  questions,
  totalTime,
  isNewRecord,
  onRestart,
  onHome,
}: GameSummaryProps) {
  
  // High-level stat compilation
  const stats = useMemo(() => {
    const total = questions.length;
    const correct = questions.filter((q) => q.isCorrect).length;
    const incorrect = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    // Average speed (seconds per solved question)
    const averageSpeed = total > 0 ? parseFloat((totalTime / total).toFixed(2)) : 0;

    return { total, correct, incorrect, accuracy, averageSpeed };
  }, [questions, totalTime]);

  // Personalized dynamic rating and feedback depending on accuracy & velocity
  const feedback = useMemo(() => {
    const { accuracy, averageSpeed } = stats;

    if (accuracy === 100) {
      if (averageSpeed <= 2.2) {
        return {
          title: '🏆 超凡神速・心算奇才!',
          desc: '天啊！平均不到 2.2 秒就能精準解答兩位數加減，你擁有無懈可擊的心算掌控與發射速度！',
          badgeColor: 'text-amber-500 bg-amber-50 border-amber-200',
        };
      } else if (averageSpeed <= 4) {
        return {
          title: '🔥 絕頂高手・精準如電',
          desc: '完美的 100% 正確率！答題節奏把握極佳，你已完全掌握兩位數心算核心技巧。',
          badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        };
      } else {
        return {
          title: '💪 穩若磐石・無可挑剔',
          desc: '慢工出細活！成功取得滿分功績，基礎功十分扎實。試著在下次挑戰時加快指尖節奏！',
          badgeColor: 'text-teal-600 bg-teal-50 border-teal-200',
        };
      }
    } else if (accuracy >= 90) {
      return {
        title: '✨ 卓越不凡・只差一步',
        desc: '這是一個相當頂尖的成績！僅差一兩題就能問鼎完美滿分，下一局一定行！',
        badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      };
    } else if (accuracy >= 70) {
      return {
        title: '⭐️ 實力堅實・漸入佳境',
        desc: '答對了大部分的問題，對心算技巧已有深刻感覺。可以繼續特訓，加快大腦反應速度！',
        badgeColor: 'text-blue-600 bg-blue-50 border-blue-200',
      };
    } else {
      return {
        title: '🌱 累積能量・蓄勢待發',
        desc: '不必氣餒。你可以隨時在選單關閉「進/借位」功能，從最基礎口算開始，熟能生巧！',
        badgeColor: 'text-slate-600 bg-slate-50 border-slate-200',
      };
    }
  }, [stats]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      
      {/* Celebration Header block with high sensory confetti look */}
      <div className="text-center mb-10">
        <span className="px-3 py-1 bg-sky-950 text-white rounded-lg text-xs font-black uppercase tracking-widest">
          特訓結束 SUMMARY
        </span>
        
        {isNewRecord && (
          <div className="mt-5 flex items-center justify-center space-x-1.5 animate-bounce">
            <span className="flex items-center space-x-2 bg-yellow-400 text-slate-950 font-black text-sm px-5 py-2 rounded-full shadow-xl border-2 border-white">
              <Sparkles size={16} className="fill-current text-slate-950 animate-pulse" />
              <span>恭喜！刷新本機最高紀錄勳章！</span>
            </span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-sky-950 mt-5 mb-2.5">
          {feedback.title}
        </h1>
        <p className="text-sky-600/90 text-sm font-bold max-w-xl mx-auto leading-relaxed">
          {feedback.desc}
        </p>
      </div>

      {/* Structured Stats Grid in vibrant block colors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* Stat 1: Accuracy inside purple block cards */}
        <div className="bg-white border-2 border-sky-100 rounded-[28px] p-5 shadow-lg text-center flex flex-col justify-between">
          <span className="text-[10px] text-sky-600 font-extrabold block uppercase tracking-widest mb-2">
            正確率
          </span>
          <div className="text-4xl font-black font-mono text-purple-650 leading-none py-1">
            {stats.accuracy}%
          </div>
          <span className="text-xs text-sky-900 font-bold bg-sky-50 mt-2 py-1 rounded-xl">
            答對 {stats.correct} / {stats.total}
          </span>
        </div>

        {/* Stat 2: Total Time in Rose block context */}
        <div className="bg-white border-2 border-sky-100 rounded-[28px] p-5 shadow-lg text-center flex flex-col justify-between">
          <span className="text-[10px] text-sky-600 font-extrabold block uppercase tracking-widest mb-2">
            總特訓時間
          </span>
          <div className="text-4xl font-black font-mono text-rose-600 leading-none py-1">
            {totalTime.toFixed(1)}s
          </div>
          <span className="text-xs text-sky-900 font-bold bg-sky-50 mt-2 py-1 rounded-xl block flex items-center justify-center space-x-0.5">
            <Clock size={12} className="stroke-[2.5]" />
            <span>用時總計</span>
          </span>
        </div>

        {/* Stat 3: Average speed in Emerald block context */}
        <div className="bg-white border-2 border-sky-100 rounded-[28px] p-5 shadow-lg text-center flex flex-col justify-between">
          <span className="text-[10px] text-sky-600 font-extrabold block uppercase tracking-widest mb-2">
            平均答題速度
          </span>
          <div className="text-4xl font-black font-mono text-emerald-600 leading-none py-1">
            {stats.averageSpeed}s
          </div>
          <span className="text-xs text-sky-900 font-bold bg-sky-50 mt-2 py-1 rounded-xl">
            每題均耗秒數
          </span>
        </div>

        {/* Stat 4: Mode and config inside orange configuration card */}
        <div className="bg-white border-2 border-sky-100 rounded-[28px] p-5 shadow-lg text-center flex flex-col justify-between">
          <span className="text-[10px] text-sky-600 font-extrabold block uppercase tracking-widest mb-2">
            當期特訓設定
          </span>
          <div className="text-sm font-black text-sky-950 py-1 leading-normal">
            {operator === 'add' ? '純加法' : operator === 'subtract' ? '純減法' : '混合加減'}
          </div>
          <span className="text-[10px] text-sky-900 font-bold bg-sky-50 mt-2 py-1 rounded-xl block">
            {calcType === 'simple' ? '不進/不借位' : '包含進/借位'}
          </span>
        </div>

      </div>

      {/* Large game triggers with tactile shadow buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center space-x-2 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black text-lg border-b-8 border-sky-700 hover:scale-[1.01] active:translate-y-1 active:border-b-4 shadow-lg transition cursor-pointer"
        >
          <RotateCcw size={18} className="stroke-[3]" />
          <span>再戰一局 (同關再煉)</span>
        </button>

        <button
          onClick={onHome}
          className="w-full flex items-center justify-center space-x-2 py-4 bg-yellow-405 hover:bg-yellow-50 text-slate-900 rounded-2xl font-black text-lg border-2 border-sky-100 border-b-6 hover:border-sky-300 hover:scale-[1.01] active:translate-y-[1px] shadow-sm transition cursor-pointer"
        >
          <Home size={18} className="stroke-[2.5]" />
          <span>選單大廳 (調整模式)</span>
        </button>
      </div>

      {/* Answer key sheet Review list */}
      <div className="bg-white border-4 border-sky-100 rounded-[32px] p-6 sm:p-8 shadow-xl">
        <h2 className="text-xl font-extrabold text-sky-950 mb-5 flex items-center space-x-2">
          <FileCheck size={20} className="text-sky-600 stroke-[2.5]" />
          <span>本次答題明細全紀錄</span>
        </h2>

        {questions.length === 0 ? (
          <p className="text-slate-400 text-sm italic text-center py-4">
            本關卡未作答任何題目。
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                  q.isCorrect
                    ? 'bg-emerald-50/40 border-emerald-100 text-emerald-950'
                    : 'bg-rose-50/40 border-rose-105 text-rose-950'
                }`}
              >
                {/* Math layout */}
                <div className="flex items-center space-x-4">
                  <div className="w-8 text-center text-xs text-sky-500 font-extrabold font-mono bg-sky-50 rounded-lg p-1">
                    #{index + 1}
                  </div>
                  <div className="text-lg font-mono font-black tracking-tight text-sky-950">
                    {q.num1} {q.operator} {q.num2} = {q.answer}
                  </div>
                </div>

                {/* Performance speed values */}
                <div className="flex items-center space-x-4 text-right">
                  <div className="text-xs text-sky-700 font-bold hidden sm:block bg-sky-50 px-2.5 py-1 rounded-xl">
                    耗時 {q.timeSpent.toFixed(1)}s
                  </div>

                  {q.isCorrect ? (
                    <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm">
                      <CheckCircle2 size={13} className="stroke-[3]" />
                      <span>對</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 px-3 py-1 bg-rose-500 text-white rounded-xl text-xs font-black shadow-sm">
                      <XCircle size={13} className="stroke-[3]" />
                      <span>
                        錯 (填 {q.userAnswer})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
