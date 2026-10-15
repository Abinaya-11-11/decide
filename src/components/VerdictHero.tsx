import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, ShieldAlert, TrendingUp, RotateCcw, Zap, Scale, Copy, Check } from 'lucide-react';
import { DecisionResult } from '../types/decision';
import { soundFx } from '../utils/audio';

interface VerdictHeroProps {
  result: DecisionResult;
  onReset: () => void;
  onRecalculate: () => void;
}

export const VerdictHero: React.FC<VerdictHeroProps> = ({
  result,
  onReset,
  onRecalculate,
}) => {
  const isYes = result.verdict === 'YES';
  const [copied, setCopied] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayConfidence, setDisplayConfidence] = useState(0);

  // Smooth numeric counter animation
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 900; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setDisplayScore(Math.round(result.score * ease));
      setDisplayConfidence(Math.round(result.confidence * ease));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [result]);

  const handleCopyMetrics = () => {
    soundFx.playTick();
    const metricsSummary = `[DECISION]
Verdict: ${result.verdict}
Score: ${result.score}/100
Confidence: ${result.confidence}%
Upside: ${result.upsideScore}/100
Risk: ${result.riskScore}/100
Reversibility: ${result.reversibilityScore}/100
Urgency: ${result.urgencyScore}/100
Net: ${result.netExpectedValue > 0 ? '+' : ''}${result.netExpectedValue}`;

    navigator.clipboard?.writeText(metricsSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Circular gauge calculations
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const scoreDashoffset = circumference - (displayScore / 100) * circumference;
  const confDashoffset = circumference - (displayConfidence / 100) * circumference;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Verdict Stamp */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 16, stiffness: 220 }}
        className={`w-full relative overflow-hidden rounded-3xl p-6 text-center border ${
          isYes
            ? 'bg-gradient-to-b from-emerald-950/70 via-slate-950 to-slate-950 border-emerald-500/50 glow-yes'
            : 'bg-gradient-to-b from-rose-950/70 via-slate-950 to-slate-950 border-rose-500/50 glow-no'
        }`}
      >
        {/* Ambient Top Light Beam */}
        <div
          className={`absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 blur-3xl pointer-events-none ${
            isYes ? 'bg-emerald-500/30' : 'bg-rose-500/30'
          }`}
        />

        {/* Binary Verdict Title */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-1">
            {isYes ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-400 animate-pulse" />
            )}
            <span className="text-xs uppercase tracking-widest text-slate-400 font-mono-numbers font-semibold">
              VERDICT
            </span>
          </div>

          <h1
            className={`text-7xl font-extrabold tracking-tighter leading-none my-1 select-none font-mono-numbers drop-shadow-lg ${
              isYes
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-rose-400'
            }`}
          >
            {result.verdict}
          </h1>

          <div
            className={`mt-2 px-3.5 py-1 rounded-full text-xs font-mono-numbers font-bold tracking-wider inline-flex items-center gap-1.5 border ${
              isYes
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            <span>{isYes ? 'AFFIRMATIVE' : 'NEGATIVE'}</span>
            <span>•</span>
            <span>
              {result.confidence >= 85 ? 'HIGH CERTAINTY' : result.confidence >= 65 ? 'MODERATE' : 'TENTATIVE'}
            </span>
          </div>
        </div>

        {/* Two Primary Dial Metrics: Score and Confidence */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          {/* 1. Score for the Decision */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreDashoffset}
                  strokeLinecap="round"
                  className={isYes ? 'text-emerald-400' : 'text-rose-400'}
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono-numbers text-white tracking-tight">
                  {displayScore}
                </span>
                <span className="text-[10px] text-slate-400 font-mono-numbers uppercase tracking-wider">
                  / 100
                </span>
              </div>
            </div>
            <span className="mt-2 text-xs font-bold tracking-wider text-slate-300 uppercase">
              Decision Score
            </span>
          </div>

          {/* 2. Confidence Number */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={confDashoffset}
                  strokeLinecap="round"
                  className="text-cyan-400"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono-numbers text-white tracking-tight">
                  {displayConfidence}
                  <span className="text-sm font-semibold text-cyan-400">%</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono-numbers uppercase tracking-wider">
                  INDEX
                </span>
              </div>
            </div>
            <span className="mt-2 text-xs font-bold tracking-wider text-slate-300 uppercase">
              Confidence
            </span>
          </div>
        </div>
      </motion.div>

      {/* Numerical Metrics Matrix (Strictly quantitative breakdown, zero prose text) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="w-full mt-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono-numbers text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 font-bold text-slate-300">
            <Scale className="w-4 h-4 text-indigo-400" /> Quantitative Matrix
          </span>
          <button
            onClick={handleCopyMetrics}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors bg-slate-800/80 px-2 py-1 rounded-md"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>EXPORT</span>
              </>
            )}
          </button>
        </div>

        {/* 5 Strictly Numerical Gauges */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* Upside */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> UPSIDE
              </span>
              <span className="font-mono-numbers font-bold text-emerald-400 text-sm">
                {result.upsideScore}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${result.upsideScore}%` }}
              />
            </div>
          </div>

          {/* Risk */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> RISK FACTOR
              </span>
              <span className="font-mono-numbers font-bold text-rose-400 text-sm">
                {result.riskScore}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
          </div>

          {/* Reversibility */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" /> REVERSIBILITY
              </span>
              <span className="font-mono-numbers font-bold text-blue-400 text-sm">
                {result.reversibilityScore}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${result.reversibilityScore}%` }}
              />
            </div>
          </div>

          {/* Urgency */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> URGENCY
              </span>
              <span className="font-mono-numbers font-bold text-amber-400 text-sm">
                {result.urgencyScore}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${result.urgencyScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Net Expected Value Line */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono-numbers">
            NET EXPECTED VALUE
          </span>
          <span
            className={`font-mono-numbers font-extrabold text-base ${
              result.netExpectedValue >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {result.netExpectedValue > 0 ? `+${result.netExpectedValue}` : result.netExpectedValue}
          </span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={() => {
            soundFx.playTick();
            onRecalculate();
          }}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-mono-numbers text-xs font-bold tracking-wider uppercase transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" /> RE-EVALUATE
        </button>

        <button
          onClick={() => {
            soundFx.playTick();
            onReset();
          }}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-mono-numbers text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
        >
          NEW DECISION
        </button>
      </div>
    </div>
  );
};
