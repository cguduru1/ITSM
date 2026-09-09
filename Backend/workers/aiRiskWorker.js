// workers/aiRiskWorker.js
import { Worker } from "bullmq";
import { connection } from "../lib/queue";
import ChangeRequest from "../models/ChangeRequest";
import Asset from "../models/Asset";
import crypto from "crypto";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const USE_OPENAI = Boolean(OPENAI_API_KEY && OPENAI_API_KEY.length > 0);

/**
 * Local heuristic fallback for scoring (safe default when no LLM configured).
 * Returns { aiDelta, confidence, evidence }
 */
function localHeuristic(text) {
  const t = (text || '').toLowerCase();
  let aiDelta = 0;
  const reasons = [];

  if (t.includes('core switch') || t.includes('core-router') || t.includes('core router')) {
    aiDelta += 35;
    reasons.push('core network device');
  }
  if (t.includes('production database') || t.includes('prod db') || t.includes('production db')) {
    aiDelta += 40;
    reasons.push('production database');
  }
  if (t.includes('legacy')) {
    aiDelta += 10;
    reasons.push('legacy system');
  }
  if (t.includes('zero-downtime') || t.includes('no downtime')) {
    aiDelta -= 10;
    reasons.push('low-impact claim');
  }

  const confidence = Math.min(0.95, 0.5 + Math.min(0.45, Math.abs(aiDelta) / 100));
  return { aiDelta, confidence, evidence: { reasons } };
}

/**
 * LLM adapter (OpenAI) - optional. If OPENAI_API_KEY is not set, falls back to localHeuristic.
 * The adapter returns a normalized object: { aiDelta: Number, confidence: Number, evidence: Object }
 */
async function llmScoreAdapter(text) {
  if (!USE_OPENAI) {
    return localHeuristic(text);
  }

  // Minimal OpenAI call using fetch. No key is embedded here; user must set OPENAI_API_KEY in env.
  // The worker will gracefully fallback to local heuristic if OpenAI response cannot be parsed.
  try {
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a risk scoring assistant. Return JSON only with keys: aiDelta (number), confidence (0-1), reasons (array).' },
        { role: 'user', content: `Analyze the following change text and return JSON only:\n\n${text}` }
      ],
      max_tokens: 200,
      temperature: 0.0
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // fallback
      return localHeuristic(text);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content || '{}';

    try {
      const parsed = JSON.parse(content);
      return {
        aiDelta: Number(parsed.aiDelta || 0),
        confidence: Number(parsed.confidence || 0.6),
        evidence: parsed.reasons || parsed.evidence || {}
      };
    } catch (err) {
      // If the model returned non-JSON, fallback to heuristic
      return localHeuristic(text);
    }
  } catch (err) {
    // network or other error -> fallback
    return localHeuristic(text);
  }
}

/** bucket helper */
function bucket(score) {
  if (score >= 81) return 'Critical';
  if (score >= 51) return 'High';
  if (score >= 21) return 'Medium';
  return 'Low';
}

/**
 * Worker definition
 * Listens to 'ai-risk' queue and updates ChangeRequest.riskScore, riskLevel, riskEvidence.
 */
const worker = new Worker('ai-risk', async job => {
  const { changeId } = job.data;
  if (!changeId) throw new Error('ai-risk job missing changeId');

  // Load change (lean for read)
  const change = await ChangeRequest.findById(changeId).lean();
  if (!change) return;

  // static score (reuse model static method)
  const staticScore = await ChangeRequest.computeStaticRisk(change, Asset);

  // simple keyword-based AI delta (replace with LLM call)
  const text = `${change.title}\n${change.description}\n${change.backoutPlan || ''}`.toLowerCase();

  / Call adapter
  const llmResult = await llmScoreAdapter(text);

  const aiDelta = Number(llmResult.aiDelta || 0);
  const confidence = Number(llmResult.confidence || 0.6);
  const evidence = llmResult.evidence || {};

  // Final score composition
  const finalScore = Math.min(100, Math.max(0, staticScore + aiDelta));
  const finalLevel = bucket(finalScore);

  // Build evidence object and sign it for tamper-evidence
  const riskEvidence = {
    staticScore,
    aiDelta,
    confidence,
    evidence,
    computedAt: new Date().toISOString()
  };

  const secret = process.env.RISK_HMAC_SECRET || 'change-secret';
  const hmac = crypto.createHmac('sha256', secret).update(JSON.stringify(riskEvidence)).digest('hex');
  riskEvidence.signedHash = hmac;

  let aiDelta = 0, confidence = 0.6, keywords = [];
  if (text.includes('core switch')) { aiDelta += 30; confidence = 0.9; keywords.push('core switch'); }
  if (text.includes('production database')) { aiDelta += 35; confidence = 0.95; keywords.push('production database'); }
  if (text.includes('legacy')) { aiDelta += 10; confidence = 0.7; keywords.push('legacy'); }

  const final = Math.min(100, staticScore + aiDelta);

  // Persist results
  await ChangeRequest.findByIdAndUpdate(changeId, {
    $set: {
      riskScore: final,
      riskLevel: bucket(final),
      riskEvidence: { staticScore, aiDelta, confidence, keywords, updatedAt: new Date() }
    }
  });
  
  return { changeId, finalScore, finalLevel 
}, { connection });

worker.on('completed', job => {
  console.log('[ai-risk] completed job', job.id);
}); 

worker.on('failed', (job, err) => {
  console.error('AI worker failed', job.id, err);
});
