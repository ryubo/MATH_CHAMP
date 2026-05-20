/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Play, Award, Volume2, VolumeX, Trash2, Zap, Check } from 'lucide-react';
import { GameMode, OperatorPreference, CalculationType, ModeRecords } from '../types';
import { getRecordKey } from '../utils/recordManager';

interface SettingsLobbyProps {
  mode: GameMode;
  setMode: (m: GameMode) => void;
  operator: OperatorPreference;
  setOperator: (op: OperatorPreference) => void;
  calcType: CalculationType;
  setCalcType: (type: CalculationType) => void;
  onStart: () => void;
  records: ModeRecords;
  onResetRecords: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function SettingsLobby({
  mode,
  setMode,
  operator,
  setOperator,
  calcType,
  setCalcType,
  onStart,
  records,
  onResetRecords,
  isMuted,
  onToggleMute,
}: SettingsLobbyProps) {
  
  // Calculate current best record for current configurations
  const currentRecord = useMemo(() => {
    const key = getRecordKey(mode, operator, calcType);
    return records[key];
  }, [mode, operator, calcType, records]);

  // Handle clear prompt
  const handleResetRequest = () => {
    if (confirm('確定要清除所有的最高紀錄嗎？此動作將無法復原。')) {
      onResetRecords();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header Section in Vibrant Palette */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg border-b-4 border-yellow-650 text-slate-900 text-3xl font-black">
            {operator === 'add' ? '+' : operator === 'subtract' ? '-' : '±'}
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-sky-900 tracking-tight font-display">
              MATH CHAMP!
            </h1>
            <p className="text-sky-600 font-black uppercase tracking-widest text-xs">
              Level: 2-Digit Masters
            </p>
          </div>
        </div>
        
        {/* Utility bar for Sound Toggle & Record Deletions */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
          <button
            onClick={onToggleMute}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-black text-sky-850 bg-white border-2 border-sky-100 rounded-2xl shadow-md hover:border-sky-305 transition cursor-pointer"
            title={isMuted ? '取消靜音' : '靜音'}
          >
            {isMuted ? <VolumeX size={15} className="text-rose-500" /> : <Volume2 size={15} className="text-emerald-500" />}
            <span>{isMuted ? '已靜音' : '音效開啟'}</span>
          </button>
          
          <button
            onClick={handleResetRequest}
            className="flex items-center space-x-1 px-4 py-2 text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100/70 border-2 border-rose-105 rounded-2xl transition cursor-pointer"
            title="清除全部紀錄"
          >
            <Trash2 size={14} />
            <span>清除紀錄</span>
          </button>
        </div>
      </header>

      {/* Main Application Layout split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Control Box (8 / 12 widths) */}
        <div className="md:col-span-8 bg-white border-4 border-sky-200 rounded-[36px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Accent decoration element matches the prompt theme's top corner decoration */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-sky-50 rounded-full -z-10"></div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-black text-sky-950 font-display mb-1.5">
              挑戰設置面板
            </h2>
            <p className="text-sky-600/95 text-xs font-bold leading-relaxed">
              自選加法、減法或是兩者混合，並設定題目限制、難度和關卡，激發您大腦最強的心算速度！
            </p>
          </div>

          <div className="space-y-7">
            
            {/* Setting 1: Operator Mode selection */}
            <div>
              <label className="block text-xs font-black text-sky-600 uppercase tracking-widest mb-3">
                1. 運算範疇
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setOperator('add')}
                  className={`group relative flex flex-col items-center justify-center py-4 px-4 rounded-3xl border-2 font-black cursor-pointer transition-all ${
                    operator === 'add'
                      ? 'bg-sky-500 text-white border-sky-700 border-b-6 shadow-md'
                      : 'bg-white text-slate-700 border-sky-100 hover:bg-sky-50/50 hover:border-sky-200 border-b-4'
                  }`}
                >
                  <span className="text-3xl font-black mb-1 font-mono group-hover:scale-110 transition-transform">+</span>
                  <span className="text-xs">純加法</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOperator('subtract')}
                  className={`group relative flex flex-col items-center justify-center py-4 px-4 rounded-3xl border-2 font-black cursor-pointer transition-all ${
                    operator === 'subtract'
                      ? 'bg-sky-500 text-white border-sky-700 border-b-6 shadow-md'
                      : 'bg-white text-slate-700 border-sky-100 hover:bg-sky-50/50 hover:border-sky-200 border-b-4'
                  }`}
                >
                  <span className="text-3xl font-black mb-1 font-mono group-hover:scale-110 transition-transform">-</span>
                  <span className="text-xs">純減法</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOperator('mixed')}
                  className={`group relative flex flex-col items-center justify-center py-4 px-4 rounded-3xl border-2 font-black cursor-pointer transition-all ${
                    operator === 'mixed'
                      ? 'bg-sky-500 text-white border-sky-700 border-b-6 shadow-md'
                      : 'bg-white text-slate-700 border-sky-100 hover:bg-sky-50/50 hover:border-sky-200 border-b-4'
                  }`}
                >
                  <span className="text-3xl font-black mb-1 group-hover:scale-110 transition-transform">±</span>
                  <span className="text-xs">混合加減</span>
                </button>
              </div>
            </div>

            {/* Setting 2: Game Mode Selector */}
            <div>
              <label className="block text-xs font-black text-sky-600 uppercase tracking-widest mb-3">
                2. 挑戰模式
              </label>
              <div className="space-y-3">
                
                {/* Sprint 10 */}
                <div
                  onClick={() => setMode('sprint10')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    mode === 'sprint10'
                      ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-400/20 border-b-4'
                      : 'bg-white border-sky-100 hover:bg-sky-50/50 hover:border-sky-200 border-b-4'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${mode === 'sprint10' ? 'bg-purple-500 text-white shadow-md' : 'bg-sky-100 text-sky-900'}`}>
                      <span className="text-sm font-mono">10</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-sky-950">10 題最速挑戰 (Sprint)</h3>
                      <p className="text-[11px] text-slate-500 font-bold">快如閃電！在 100% 正確前提下，紀錄您點破紀錄的最佳用時。</p>
                    </div>
                  </div>
                  {mode === 'sprint10' && <div className="text-purple-600"><Check size={18} className="stroke-[3]" /></div>}
                </div>

                {/* Sprint 20 */}
                <div
                  onClick={() => setMode('sprint20')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    mode === 'sprint20'
                      ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-400/20 border-b-4'
                      : 'bg-white border-sky-100 hover:bg-sky-50/50 hover:border-sky-200 border-b-4'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${mode === 'sprint20' ? 'bg-purple-500 text-white shadow-md' : 'bg-sky-100 text-sky-900'}`}>
                      <span className="text-sm font-mono">20</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-sky-950">20 題極限馬拉松 (Marathon)</h3>
                      <p className="text-[11px] text-slate-500 font-bold">深度專注訓練！完美的 20 題耐力口算，追求速準合一。</p>
                    </div>
                  </div>
                  {mode === 'sprint20' && <div className="text-purple-600"><Check size={18} className="stroke-[3]" /></div>}
                </div>

                {/* Time Attack 60s */}
                <div
                  onClick={() => setMode('timeAttack60')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    mode === 'timeAttack60'
                      ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-400/20 border-b-4'
                      : 'bg-white border-sky-100 hover:bg-sky-50/50 hover:border-sky-200 border-b-4'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === 'timeAttack60' ? 'bg-rose-500 text-white shadow-md' : 'bg-sky-100 text-sky-900'}`}>
                      <Zap size={18} className="fill-current" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-sky-950">60 秒計時大轟炸 (Time Attack)</h3>
                      <p className="text-[11px] text-slate-500 font-bold">時間倒數激增腎上腺素！在 60 秒時間截止前突破最高可能題數。</p>
                    </div>
                  </div>
                  {mode === 'timeAttack60' && <div className="text-rose-600"><Check size={18} className="stroke-[3]" /></div>}
                </div>

                {/* Endless Zen practice */}
                <div
                  onClick={() => setMode('zen')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    mode === 'zen'
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-400/20 border-b-4'
                      : 'bg-white border-sky-100 hover:bg-sky-50/50 hover:border-sky-200 border-b-4'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${mode === 'zen' ? 'bg-emerald-500 text-white shadow-md' : 'bg-sky-100 text-sky-900'}`}>
                      <span className="text-xs">Zen</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-sky-950">禪意自由練習 (Endless Zen)</h3>
                      <p className="text-[11px] text-slate-500 font-bold">無時間與題數限制，最適合放鬆或在特訓前，大腦暖身之用。</p>
                    </div>
                  </div>
                  {mode === 'zen' && <div className="text-emerald-600"><Check size={18} className="stroke-[3]" /></div>}
                </div>

              </div>
            </div>

            {/* Setting 3: Carry check/Borrow check toggle buttons */}
            <div>
              <label className="block text-xs font-black text-sky-600 uppercase tracking-widest mb-3">
                3. 進防限制 (難度設定)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCalcType('simple')}
                  className={`py-4 px-4 rounded-3xl border-2 font-black text-sm transition-all cursor-pointer flex flex-col items-center ${
                    calcType === 'simple'
                      ? 'bg-sky-900 text-white border-sky-955 border-b-6 shadow-md'
                      : 'bg-white text-slate-700 border-sky-100 hover:bg-sky-50/50 border-b-4'
                  }`}
                >
                  <span className="font-bold text-md">不進位 / 不借位</span>
                  <span className="text-[10px] mt-1 opacity-80 font-normal">神速極速首選（例：52+23, 85-32）</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCalcType('all')}
                  className={`py-4 px-4 rounded-3xl border-2 font-black text-sm transition-all cursor-pointer flex flex-col items-center ${
                    calcType === 'all'
                      ? 'bg-sky-900 text-white border-sky-955 border-b-6 shadow-md'
                      : 'bg-white text-slate-700 border-sky-100 hover:bg-sky-50/50 border-b-4'
                  }`}
                >
                  <span className="font-bold text-md">包含進位 / 借位</span>
                  <span className="text-[10px] mt-1 opacity-80 font-normal">進階雙向鍛鍊（例：58+27, 83-49）</span>
                </button>
              </div>
            </div>

          </div>

          {/* Golden/Vibrant Master Trigger Button */}
          <div className="mt-8 pt-4">
            <button
              onClick={onStart}
              className="w-full flex items-center justify-center space-x-2.5 py-4.5 bg-sky-500 hover:bg-sky-600 text-white text-2xl font-black rounded-3xl cursor-pointer shadow-xl border-b-8 border-sky-700 hover:scale-[1.01] active:translate-y-1 active:border-b-4 transition-all duration-100 group"
            >
              <span>GO! 進入精準特訓</span>
              <Play size={22} className="fill-current group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

        </div>

        {/* Right Sidebar Column (4 / 12 widths) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Best Record Container with high-end Vibrant Golden theme */}
          <div className="bg-yellow-400 text-slate-900 rounded-[32px] p-6 shadow-lg border-b-4 border-yellow-600 relative overflow-hidden">
            <div className="absolute right-[-40px] top-[-30px] opacity-15 text-slate-900">
              <Award size={180} />
            </div>

            <div className="flex items-center space-x-2 mb-4 relative z-10">
              <span className="text-2xl">🏆</span>
              <h2 className="text-lg font-black tracking-tight text-slate-950 font-display">個人最高紀錄</h2>
            </div>

            {/* Dynamic Status Display of the selected criteria */}
            <div className="text-slate-900/80 text-[10px] font-mono mb-4 border-b border-yellow-600/30 pb-3 relative z-10">
              當前過濾：
              <div className="mt-1.5 text-slate-950 font-sans flex flex-wrap gap-1">
                <span className="bg-yellow-500/40 px-2 py-0.5 rounded text-[11px] font-extrabold">
                  {operator === 'add' ? '加法' : operator === 'subtract' ? '減法' : '混合'}
                </span>
                <span className="bg-yellow-500/40 px-2 py-0.5 rounded text-[11px] font-extrabold">
                  {mode === 'sprint10'
                    ? '10 題'
                    : mode === 'sprint20'
                    ? '20 題'
                    : mode === 'timeAttack60'
                    ? '60 秒'
                    : '禪意'}
                </span>
                <span className="bg-yellow-500/40 px-2 py-0.5 rounded text-[11px] font-extrabold">
                  {calcType === 'simple' ? '不進/借' : '全進/借'}
                </span>
              </div>
            </div>

            <div className="relative z-10">
              {currentRecord ? (
                <div className="space-y-4">
                  {(mode === 'sprint10' || mode === 'sprint20') && (
                    <>
                      <div>
                        <span className="text-xs font-bold text-yellow-950/70 block mb-0.5">最速 100% 正確答題用時</span>
                        <div className="text-3.5xl font-black font-mono text-yellow-950 leading-none">
                          {currentRecord.bestTime === Infinity ? '--' : `${currentRecord.bestTime.toFixed(2)}s`}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-yellow-600/20">
                        <div>
                          <span className="text-[10px] font-bold text-yellow-950/70 block">最高正確率</span>
                          <div className="text-lg font-black font-mono text-yellow-950">
                            {currentRecord.bestAccuracy.toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-yellow-950/70 block">單題最高均速</span>
                          <div className="text-lg font-black font-mono text-yellow-950">
                            {currentRecord.averageSpeed === Infinity ? '--' : `${currentRecord.averageSpeed.toFixed(2)}s`}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {mode === 'timeAttack60' && (
                    <>
                      <div>
                        <span className="text-xs font-bold text-yellow-950/70 block mb-1">60 秒內最多答對</span>
                        <div className="text-4xl font-black font-mono text-yellow-950 leading-none">
                          {currentRecord.maxSolved} <span className="text-xs font-sans text-yellow-950">題</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-yellow-600/20">
                        <div className="flex justify-between items-center text-[10px] font-bold text-yellow-950/70">
                          <span>登錄時正確率：</span>
                          <span className="font-mono text-yellow-950">{currentRecord.bestAccuracy.toFixed(0)}%</span>
                        </div>
                      </div>
                    </>
                  )}

                  {mode === 'zen' && (
                    <>
                      <div>
                        <span className="text-xs font-bold text-yellow-950/70 block mb-1">累計答對題數</span>
                        <div className="text-4xl font-black font-mono text-yellow-950 leading-none">
                          {currentRecord.maxSolved} <span className="text-xs font-sans text-yellow-950">題</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-yellow-600/20">
                        <div>
                          <span className="text-[10px] font-bold text-yellow-950/70 block">最高正確率</span>
                          <div className="text-lg font-black font-mono text-yellow-950">
                            {currentRecord.bestAccuracy.toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-yellow-950/70 block">最快單題均速</span>
                          <div className="text-lg font-black font-mono text-yellow-950">
                            {currentRecord.averageSpeed === Infinity ? '--' : `${currentRecord.averageSpeed.toFixed(2)}s`}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="text-[9px] text-yellow-905/70 font-bold font-mono text-right pt-2">
                    UPDATED AT {new Date(currentRecord.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="py-5 text-center text-yellow-950 font-bold text-xs">
                  <p className="mb-2 text-sm text-yellow-900">✨ 尚無最佳戰績</p>
                  <p className="text-[11px] text-yellow-900/80 leading-relaxed font-normal">
                    完成關卡挑戰，即可在此解鎖尊顯大賽榮譽。
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Friendly bubble guidelines */}
          <div className="bg-sky-900/5 border-2 border-sky-100 rounded-2xl p-5 text-xs text-sky-900 leading-relaxed">
            <h4 className="font-black text-sky-950 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <span>💡 精準高效特訓</span>
            </h4>
            <ul className="space-y-2 pl-1 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="text-sky-500 font-bold">&#8226;</span>
                <span>鍵盤 <strong>1, 2, 3 ... </strong> 可以極速口算並替代按鍵。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sky-500 font-bold">&#8226;</span>
                <span>點擊 <strong>Enter / 返回鍵</strong> 即可發射正確心算答案。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sky-500 font-bold">&#8226;</span>
                <span>不進位/不借位是訓練大腦本能性反射速度的最強武器。</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
