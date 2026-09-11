/**
 * POST /api/grievance  — Vercel serverless function (Node.js runtime)
 * Body: GrievanceRequest (see src/types.ts)
 * Returns { subject, body, model } drafted live from the real findings.
 */
import { draftGrievance, sendError, withTimeout } from '../server/gemini';

export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST with the findings payload.' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const result = await withTimeout(draftGrievance(body), 45_000, 'Drafting');
    res.status(200).json(result);
  } catch (err) {
    sendError(res, err);
  }
}
