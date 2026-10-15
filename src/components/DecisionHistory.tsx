import React, { useState } from 'react';
import { Trash2, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { DecisionResult } from '../types/decision';
import { soundFx } from '../utils/audio';

interface DecisionHistoryProps {
  history: DecisionResult[];
  onSelect: (item: DecisionResult) => void;
  onClear: () => void;
  onDeleteItem: (id: string) => void;
}

export const DecisionHistory: React.FC<DecisionHistoryProps> = ({
  history,
  onSelect,
  onClear,
  onDeleteItem,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');

  const filteredHistory = history.filter((item) => {
    if (filter === 'YES') return item.verdict === 'YES';
    if (filter === 'NO') return item.verdict === 'NO';
    return true;
  });

  const total = history.length;
  const yesCount = history.filter((h) => h.verdict === 'YES').length;
  const noCount = history.filter((h) => h.verdict === 'NO').length;
  const avgScore =
    total > 0 ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / total) : 0;
  const avgConf =
    total > 0 ? Math.round(history.reduce((acc, h) => acc + h.confidence, 0) / total) : 0;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Quantitative Summary Dashboard */}
      <div className="w-full p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-mono-numbers font-bold text-slate-400">
            Decision Analytics
          </span>
          <span className="text-xs font-mono-numbers font-bold text-slate-400">
            {total} RECORDED
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="block text-[10px] text-slate-400 uppercase font-mono-numbers">
              YES
            </span>
            <span className="text-lg font-black font-mono-numbers text-emerald-400">
              {yesCount}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="block text-[10px] text-slate-400 uppercase font-mono-numbers">
              NO
            </span>
            <span className="text-lg font-black font-mono-numbers text-rose-400">
              {noCount}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="block text-[10px] text-slate-400 uppercase font-mono-numbers">
              AVG SCORE
            </span>
            <span className="text-lg font-black font-mono-numbers text-cyan-400">
              {avgScore}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="block text-[10px] text-slate-400 uppercase font-mono-numbers">
              AVG CONF
            </span>
            <span className="text-lg font-black font-mono-numbers text-indigo-400">
              {avgConf}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Clear Action */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['ALL', 'YES', 'NO'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundFx.playTick();
                setFilter(tab);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono-numbers font-bold transition-all ${
                filter === tab
                  ? tab === 'YES'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : tab === 'NO'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              soundFx.playTick();
              if (window.confirm('Clear all stored decisions?')) {
                onClear();
              }
            }}
            className="flex items-center gap-1 text-[11px] font-mono-numbers text-slate-400 hover:text-rose-400 transition-colors px-2 py-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      <div className="w-full space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400 rounded-3xl bg-slate-900/40 border border-slate-800/60">
            <span className="font-mono-numbers text-xs block">NO DECISION RECORDS FOUND</span>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isYes = item.verdict === 'YES';
            return (
              <div
                key={item.id}
                onClick={() => {
                  soundFx.playTick();
                  onSelect(item);
                }}
                className="w-full p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isYes
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {isYes ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate max-w-[170px] sm:max-w-[220px]">
                      {item.dilemma}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono-numbers text-slate-400">
                      <span>Score: <b className="text-slate-200">{item.score}</b></span>
                      <span>•</span>
                      <span>Conf: <b className="text-cyan-400">{item.confidence}%</b></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-mono-numbers font-black text-xs border ${
                      isYes
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {item.verdict}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playTick();
                      onDeleteItem(item.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 opacity-60 hover:opacity-100 transition-all rounded-lg hover:bg-slate-800"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
