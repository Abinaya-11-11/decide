import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { DecisionResult } from '../types/decision';

interface QuickTriageModeProps {
  onSaveResult: (res: DecisionResult) => void;
}

const FAST_QUESTIONS = [
  'Go to gym right now',
  'Order takeout tonight',
  'Speak up in this meeting',
  'Send the text message',
  'Take a 20-min power nap',
  'Buy the item in cart',
  'Say no to the invite',
  'Start writing now',
];

export const QuickTriageMode: React.FC<QuickTriageModeProps> = ({ onSaveResult }) => {
  const [dilemma, setDilemma] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<{
    verdict: 'YES' | 'NO';
    score: number;
    confidence: number;
  } | null>(null);

  const handleInstantFlip = (questionText?: string) => {
    const target = (questionText || dilemma || 'Quick Choice').trim();
    setIsFlipping(true);
    setResult(null);
    soundFx.playFlip();

    setTimeout(() => {
      // Deterministic randomness
      const randScore = Math.floor(Math.random() * 85) + 12; // 12 to 97
      const isYes = randScore >= 50;
      const verdict: 'YES' | 'NO' = isYes ? 'YES' : 'NO';
      const conf = Math.floor(Math.random() * 26) + 72; // 72 to 98%

      if (isYes) soundFx.playYes();
      else soundFx.playNo();

      const newResult: DecisionResult = {
        id: 'triage_' + Date.now(),
        dilemma: target,
        verdict,
        score: randScore,
        confidence: conf,
        upsideScore: Math.min(99, Math.round(randScore * 0.95 + 5)),
        riskScore: Math.max(10, Math.round(100 - randScore * 0.8)),
        reversibilityScore: 75,
        urgencyScore: 85,
        netExpectedValue: Math.round((randScore - 50) * 1.8),
        timestamp: Date.now(),
        source: 'algorithmic',
        factors: {
          riskTolerance: 50,
          urgency: 80,
          reversibility: 70,
          intuition: 50,
          upsideWeight: 50,
        },
      };

      setResult({ verdict, score: randScore, confidence: conf });
      setIsFlipping(false);
      onSaveResult(newResult);
    }, 850);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-mono-numbers font-bold text-slate-400">
            Split-Second Triage
          </span>
          <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            FAST FLIP
          </span>
        </div>

        <input
          type="text"
          value={dilemma}
          onChange={(e) => setDilemma(e.target.value)}
          placeholder="Type fast micro-dilemma or pick below..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleInstantFlip();
          }}
        />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {FAST_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => {
                setDilemma(q);
                handleInstantFlip(q);
              }}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 font-medium transition-all active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Flip Card / Orb */}
      <div className="mt-6 flex flex-col items-center justify-center">
        <motion.div
          animate={
            isFlipping
              ? { rotateY: [0, 720, 1440], scale: [1, 1.15, 1] }
              : { rotateY: 0, scale: 1 }
          }
          transition={{ duration: 0.85, ease: 'easeInOut' }}
          className="relative w-44 h-44 rounded-full flex items-center justify-center p-3 shadow-2xl cursor-pointer"
          onClick={() => handleInstantFlip()}
        >
          {/* Glowing ring background */}
          <div
            className={`absolute inset-0 rounded-full border-4 border-dashed transition-colors duration-500 ${
              result?.verdict === 'YES'
                ? 'border-emerald-500/80 bg-emerald-950/40 glow-yes'
                : result?.verdict === 'NO'
                ? 'border-rose-500/80 bg-rose-950/40 glow-no'
                : 'border-slate-700 bg-slate-900/80'
            }`}
          />

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            {isFlipping ? (
              <div className="flex flex-col items-center">
                <Sparkles className="w-10 h-10 text-cyan-400 animate-spin" />
                <span className="mt-2 text-xs font-mono-numbers text-cyan-300 font-bold uppercase tracking-widest">
                  FLIPPING...
                </span>
              </div>
            ) : result ? (
              <div className="flex flex-col items-center">
                {result.verdict === 'YES' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400 mb-1" />
                )}
                <span
                  className={`text-4xl font-extrabold font-mono-numbers tracking-tight ${
                    result.verdict === 'YES' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {result.verdict}
                </span>
                <div className="mt-1 flex items-center gap-2 text-xs font-mono-numbers text-slate-300">
                  <span>Score: <b className="text-white">{result.score}</b></span>
                  <span>•</span>
                  <span>Conf: <b className="text-cyan-400">{result.confidence}%</b></span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-1" />
                <span className="text-base font-extrabold font-mono-numbers text-white tracking-wide">
                  TAP TO FLIP
                </span>
                <span className="text-[10px] text-slate-400 font-mono-numbers mt-0.5">
                  1-TOUCH VERDICT
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="mt-6 w-full flex items-center justify-center">
        <button
          onClick={() => handleInstantFlip()}
          disabled={isFlipping}
          className="w-full py-3.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-slate-950 font-mono-numbers text-xs font-black tracking-widest uppercase transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-slate-950" />
          <span>{result ? 'FLIP AGAIN' : 'EXECUTE RAPID ARBITRATION'}</span>
        </button>
      </div>
    </div>
  );
};
