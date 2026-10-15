/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { MobileContainer } from './components/MobileContainer';
import { DecisionInput } from './components/DecisionInput';
import { VerdictHero } from './components/VerdictHero';
import { QuickTriageMode } from './components/QuickTriageMode';
import { DecisionHistory } from './components/DecisionHistory';
import { DecisionFactors, DecisionResult, ViewMode } from './types/decision';
import { soundFx } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewMode>('decide');
  const [currentResult, setCurrentResult] = useState<DecisionResult | null>(null);
  const [history, setHistory] = useState<DecisionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDilemma, setLastDilemma] = useState('');
  const [lastFactors, setLastFactors] = useState<DecisionFactors | null>(null);
  const pulseIntervalRef = useRef<number | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('decidenow_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not parse history:', e);
    }
  }, []);

  const saveToHistory = (newResult: DecisionResult) => {
    setHistory((prev) => {
      const updated = [newResult, ...prev.filter((item) => item.id !== newResult.id)].slice(0, 50);
      try {
        localStorage.setItem('decidenow_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist history:', e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('decidenow_history');
    } catch {}
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('decidenow_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (currentResult?.id === id) {
      setCurrentResult(null);
    }
  };

  const handleDecide = async (dilemma: string, factors: DecisionFactors) => {
    setIsLoading(true);
    setLastDilemma(dilemma);
    setLastFactors(factors);

    // Audio pulse rhythm while computing
    pulseIntervalRef.current = window.setInterval(() => {
      soundFx.playProcessingPulse();
    }, 280);

    try {
      const response = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dilemma, factors }),
      });

      if (!response.ok) {
        throw new Error('Server returned error status');
      }

      const data = await response.json();

      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }

      const verdict: 'YES' | 'NO' = data.verdict === 'YES' ? 'YES' : 'NO';
      const score = Math.max(0, Math.min(100, Number(data.score) || 50));
      const confidence = Math.max(0, Math.min(100, Number(data.confidence) || 75));

      const newResult: DecisionResult = {
        id: 'dec_' + Date.now(),
        dilemma,
        verdict,
        score,
        confidence,
        upsideScore: Number(data.upsideScore) ?? 75,
        riskScore: Number(data.riskScore) ?? 25,
        reversibilityScore: Number(data.reversibilityScore) ?? 60,
        urgencyScore: Number(data.urgencyScore) ?? 50,
        netExpectedValue: Number(data.netExpectedValue) ?? (verdict === 'YES' ? 45 : -45),
        timestamp: Date.now(),
        source: data.source || 'gemini',
        factors,
      };

      if (verdict === 'YES') {
        soundFx.playYes();
      } else {
        soundFx.playNo();
      }

      setCurrentResult(newResult);
      saveToHistory(newResult);
    } catch (err) {
      console.warn('API error, computing client fallback:', err);
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }

      // Robust client fallback
      const mockScore = Math.max(10, Math.min(95, Math.round(50 + (factors.upsideWeight - factors.riskTolerance) * 0.4)));
      const verdict: 'YES' | 'NO' = mockScore >= 50 ? 'YES' : 'NO';
      const conf = Math.round(65 + Math.abs(mockScore - 50) * 0.7);

      const fallbackResult: DecisionResult = {
        id: 'dec_' + Date.now(),
        dilemma,
        verdict,
        score: mockScore,
        confidence: conf,
        upsideScore: factors.upsideWeight,
        riskScore: factors.riskTolerance,
        reversibilityScore: factors.reversibility,
        urgencyScore: factors.urgency,
        netExpectedValue: Math.round((mockScore - 50) * 1.8),
        timestamp: Date.now(),
        source: 'algorithmic',
        factors,
      };

      if (verdict === 'YES') soundFx.playYes();
      else soundFx.playNo();

      setCurrentResult(fallbackResult);
      saveToHistory(fallbackResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = () => {
    if (lastDilemma && lastFactors) {
      handleDecide(lastDilemma, lastFactors);
    } else if (currentResult) {
      handleDecide(currentResult.dilemma, currentResult.factors);
    }
  };

  const handleSelectPastDecision = (item: DecisionResult) => {
    setCurrentResult(item);
    setActiveTab('decide');
  };

  return (
    <MobileContainer
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
      }}
      decisionCount={history.length}
    >
      {activeTab === 'decide' && (
        <div className="w-full">
          {currentResult ? (
            <VerdictHero
              result={currentResult}
              onReset={() => setCurrentResult(null)}
              onRecalculate={handleRecalculate}
            />
          ) : (
            <DecisionInput onDecide={handleDecide} isLoading={isLoading} />
          )}
        </div>
      )}

      {activeTab === 'triage' && (
        <QuickTriageMode
          onSaveResult={(res) => {
            saveToHistory(res);
          }}
        />
      )}

      {activeTab === 'history' && (
        <DecisionHistory
          history={history}
          onSelect={handleSelectPastDecision}
          onClear={clearHistory}
          onDeleteItem={deleteHistoryItem}
        />
      )}
    </MobileContainer>
  );
}
