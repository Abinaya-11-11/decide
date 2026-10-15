export interface DecisionFactors {
  riskTolerance: number; // 0 - 100
  urgency: number; // 0 - 100
  reversibility: number; // 0 - 100
  intuition: number; // 0 - 100
  upsideWeight: number; // 0 - 100
}

export interface DecisionResult {
  id: string;
  dilemma: string;
  verdict: 'YES' | 'NO';
  score: number; // 0 - 100
  confidence: number; // 0 - 100
  upsideScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  reversibilityScore: number; // 0 - 100
  urgencyScore: number; // 0 - 100
  netExpectedValue: number; // -100 to 100
  timestamp: number;
  source: 'gemini' | 'algorithmic';
  factors: DecisionFactors;
}

export type ViewMode = 'decide' | 'matrix' | 'triage' | 'history';
