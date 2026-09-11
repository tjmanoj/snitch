/**
 * POST /api/analyze  — Vercel serverless function (Node.js runtime)
 * Body: { imageBase64: string, mimeType: string }
 * Returns the live Gemini analysis of the screenshot. Nothing here is hardcoded.
 */
import { analyzeScreenshot, sendError, withTimeout } from '../server/gemini';

export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST with { imageBase64, mimeType }.' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const result = await withTimeout(analyzeScreenshot(body), 50_000, 'Analysis');
    res.status(200).json(result);
  } catch (err) {
    sendError(res, err);
  }
}
