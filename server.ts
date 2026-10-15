import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Algorithmic decision calculator fallback & baseline
function calculateHeuristicDecision(
  dilemma: string,
  factors?: {
    riskTolerance?: number; // 0-100
    urgency?: number; // 0-100
    reversibility?: number; // 0-100
    intuition?: number; // 0-100
    upsideWeight?: number; // 0-100
  }
) {
  // Deterministic seed hashing from dilemma text
  let hash = 0;
  for (let i = 0; i < dilemma.length; i++) {
    hash = (hash << 5) - hash + dilemma.charCodeAt(i);
    hash |= 0;
  }
  const normalizedHash = Math.abs(hash) % 1000;

  const risk = factors?.riskTolerance ?? 50;
  const urgency = factors?.urgency ?? 50;
  const reversibility = factors?.reversibility ?? 50;
  const intuition = factors?.intuition ?? 50;
  const upside = factors?.upsideWeight ?? 50;

  // Expected value formula based on decision science
  // Reversibility protects downside; high upside + intuition tilts to YES
  const baseTilt = (normalizedHash % 41) - 20; // -20 to +20
  const scoreRaw =
    45 +
    baseTilt +
    (upside - 50) * 0.35 +
    (intuition - 50) * 0.3 +
    (reversibility - 50) * 0.25 -
    (risk - 50) * 0.15 +
    (urgency > 70 ? 5 : 0);

  const score = Math.max(5, Math.min(98, Math.round(scoreRaw)));
  const verdict: 'YES' | 'NO' = score >= 50 ? 'YES' : 'NO';

  // Confidence is distance from 50 (ambiguity center) modulated by urgency & inputs
  const ambiguityDistance = Math.abs(score - 50);
  const confidence = Math.max(
    58,
    Math.min(99, Math.round(62 + ambiguityDistance * 0.72 + (urgency > 60 ? 4 : 0)))
  );

  const calculatedUpside = Math.max(10, Math.min(96, Math.round((score * 0.8) + (upside * 0.2))));
  const calculatedRisk = Math.max(8, Math.min(95, Math.round(100 - score * 0.75 + (100 - reversibility) * 0.25)));
  const calculatedReversibility = Math.max(10, Math.min(95, Math.round(reversibility)));
  const calculatedUrgency = Math.max(10, Math.min(95, Math.round(urgency)));
  const netExpectedValue = Math.max(-100, Math.min(100, Math.round((score - 50) * 1.8)));

  return {
    verdict,
    score,
    confidence,
    upsideScore: calculatedUpside,
    riskScore: calculatedRisk,
    reversibilityScore: calculatedReversibility,
    urgencyScore: calculatedUrgency,
    netExpectedValue,
  };
}

// Strictly zero-text decision endpoint
app.post('/api/decision', async (req, res) => {
  try {
    const { dilemma, factors } = req.body;

    if (!dilemma || typeof dilemma !== 'string' || !dilemma.trim()) {
      return res.status(400).json({ error: 'Dilemma string is required' });
    }

    const cleanDilemma = dilemma.trim();

    if (ai) {
      try {
        const prompt = `Decision subject: "${cleanDilemma}".
Provided User Parameters:
- Risk Tolerance Index (0-100): ${factors?.riskTolerance ?? 50}
- Urgency Index (0-100): ${factors?.urgency ?? 50}
- Reversibility Index (0-100, 100=easily undone): ${factors?.reversibility ?? 50}
- Intuition / Gut Check (0-100, 100=positive feeling): ${factors?.intuition ?? 50}
- Desired Upside Weight (0-100): ${factors?.upsideWeight ?? 50}

STRICT RULE: DO NOT GENERATE ANY EXPLANATIONS, REASONING, OR NARRATIVE TEXT.
Provide ONLY the JSON output adhering strictly to the schema. Verdict MUST be strictly "YES" or "NO".`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'You are a pure mathematical decision arbiter. You NEVER output prose, explanation, text, or reasoning. You ONLY compute and output the strict JSON schema containing the binary verdict ("YES" or "NO"), the decision score (0-100), the confidence number (0-100), and quantitative indices.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                verdict: {
                  type: Type.STRING,
                  description: "Must strictly be 'YES' or 'NO'. No text or qualifiers.",
                },
                score: {
                  type: Type.INTEGER,
                  description: 'Quantitative score for the decision from 0 to 100.',
                },
                confidence: {
                  type: Type.INTEGER,
                  description: 'Confidence number percentage from 0 to 100.',
                },
                upsideScore: {
                  type: Type.INTEGER,
                  description: 'Upside metric from 0 to 100.',
                },
                riskScore: {
                  type: Type.INTEGER,
                  description: 'Risk factor metric from 0 to 100.',
                },
                reversibilityScore: {
                  type: Type.INTEGER,
                  description: 'Reversibility metric from 0 to 100.',
                },
                urgencyScore: {
                  type: Type.INTEGER,
                  description: 'Urgency metric from 0 to 100.',
                },
                netExpectedValue: {
                  type: Type.INTEGER,
                  description: 'Net expected value metric from -100 to +100.',
                },
              },
              required: [
                'verdict',
                'score',
                'confidence',
                'upsideScore',
                'riskScore',
                'reversibilityScore',
                'urgencyScore',
                'netExpectedValue',
              ],
            },
            temperature: 0.2, // Low temperature for decisive, rigorous evaluation
          },
        });

        const rawText = response.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          const verdictNormalized =
            String(parsed.verdict).toUpperCase().includes('YES') ? 'YES' : 'NO';
          const score = Math.max(0, Math.min(100, Number(parsed.score) || 50));
          const confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 75));

          return res.json({
            verdict: verdictNormalized,
            score,
            confidence,
            upsideScore: Math.max(0, Math.min(100, Number(parsed.upsideScore) || 50)),
            riskScore: Math.max(0, Math.min(100, Number(parsed.riskScore) || 50)),
            reversibilityScore: Math.max(0, Math.min(100, Number(parsed.reversibilityScore) || 50)),
            urgencyScore: Math.max(0, Math.min(100, Number(parsed.urgencyScore) || 50)),
            netExpectedValue: Math.max(-100, Math.min(100, Number(parsed.netExpectedValue) || 0)),
            source: 'gemini',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini evaluation fallback to heuristic engine:', geminiError);
      }
    }

    // Heuristic mathematical fallback
    const result = calculateHeuristicDecision(cleanDilemma, factors);
    return res.json({ ...result, source: 'algorithmic' });
  } catch (error) {
    console.error('Decision processing error:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// Start Express server and connect Vite in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Decision Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
