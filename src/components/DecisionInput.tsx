import React, { useState } from 'react';
import { SlidersHorizontal, Sparkles, AlertCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { DecisionFactors } from '../types/decision';
import { soundFx } from '../utils/audio';

interface DecisionInputProps {
  onDecide: (dilemma: string, factors: DecisionFactors) => void;
  isLoading: boolean;
}

const PRESET_DILEMMAS = [
  'Accept new career offer',
  'Invest in new opportunity',
  'Book the international flight',
  'Negotiate higher compensation',
  'Launch new feature today',
  'Attend tonight’s event',
];

export const DecisionInput: React.FC<DecisionInputProps> = ({ onDecide, isLoading }) => {
  const [dilemma, setDilemma] = useState('');
  const [showFactors, setShowFactors] = useState(false);
  const [factors, setFactors] = useState<DecisionFactors>({
    riskTolerance: 50,
    urgency: 50,
    reversibility: 50,
    intuition: 50,
    upsideWeight: 60,
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dilemma.trim() || isLoading) return;
    soundFx.playTick();
    onDecide(dilemma.trim(), factors);
  };

  const handleSliderChange = (key: keyof DecisionFactors, val: number) => {
    soundFx.playTick();
    setFactors((prev) => ({ ...prev, [key]: val }));
  };

  const handlePresetSelect = (text: string) => {
    soundFx.playTick();
    setDilemma(text);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
      {/* Dilemma Input Card */}
      <div className="w-full p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-wider font-mono-numbers font-bold text-slate-400">
            Dilemma / Decision
          </label>
          <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            ZERO-TEXT OUTPUT
          </span>
        </div>

        <div className="relative">
          <textarea
            value={dilemma}
            onChange={(e) => setDilemma(e.target.value)}
            placeholder="e.g. Should I accept the senior offer?"
            rows={2}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all font-medium leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>

        {/* Quick Sample Decision Chips */}
        <div className="mt-3">
          <span className="text-[11px] font-mono-numbers text-slate-400 block mb-1.5 font-medium">
            Quick dilemmas:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_DILEMMAS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-xl transition-all font-medium ${
                  dilemma === preset
                    ? 'bg-indigo-600 text-white border border-indigo-500'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Calibration Sliders Drawer Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              soundFx.playTick();
              setShowFactors(!showFactors);
            }}
            className="w-full flex items-center justify-between text-xs font-mono-numbers text-slate-300 hover:text-white py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              Decision Calibration Levers
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              {showFactors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {showFactors && (
            <div className="mt-3 space-y-3.5 pt-2 border-t border-slate-800/60 animate-in fade-in duration-200">
              {/* Risk Tolerance */}
              <div>
                <div className="flex justify-between text-xs font-mono-numbers mb-1">
                  <span className="text-slate-400">Risk Tolerance</span>
                  <span className="font-bold text-rose-400">{factors.riskTolerance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={factors.riskTolerance}
                  onChange={(e) => handleSliderChange('riskTolerance', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Urgency */}
              <div>
                <div className="flex justify-between text-xs font-mono-numbers mb-1">
                  <span className="text-slate-400">Urgency</span>
                  <span className="font-bold text-amber-400">{factors.urgency}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={factors.urgency}
                  onChange={(e) => handleSliderChange('urgency', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Reversibility */}
              <div>
                <div className="flex justify-between text-xs font-mono-numbers mb-1">
                  <span className="text-slate-400">Reversibility</span>
                  <span className="font-bold text-blue-400">{factors.reversibility}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={factors.reversibility}
                  onChange={(e) => handleSliderChange('reversibility', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Intuition / Gut Check */}
              <div>
                <div className="flex justify-between text-xs font-mono-numbers mb-1">
                  <span className="text-slate-400">Intuition / Gut Feeling</span>
                  <span className="font-bold text-purple-400">{factors.intuition}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={factors.intuition}
                  onChange={(e) => handleSliderChange('intuition', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Upside Weight */}
              <div>
                <div className="flex justify-between text-xs font-mono-numbers mb-1">
                  <span className="text-slate-400">Upside Ambition</span>
                  <span className="font-bold text-emerald-400">{factors.upsideWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={factors.upsideWeight}
                  onChange={(e) => handleSliderChange('upsideWeight', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Execution CTA */}
      <button
        type="submit"
        disabled={!dilemma.trim() || isLoading}
        className={`w-full mt-4 py-4 px-6 rounded-2xl font-mono-numbers text-sm font-extrabold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-98 ${
          !dilemma.trim() || isLoading
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 hover:brightness-110 shadow-emerald-500/25 cursor-pointer ring-1 ring-emerald-400/50'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
            <span>CALCULATING VERDICT...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>ARBITRATE DECISION</span>
          </>
        )}
      </button>

      {/* Zero-Text Strict Rule Guarantee Notice */}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono-numbers">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>Strict Zero-Text Mode: Only YES/NO, Score & Confidence</span>
      </div>
    </form>
  );
};
