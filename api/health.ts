/**
 * GET /api/health — lets the UI show whether the server is configured with a Gemini key.
 * Never returns the key itself.
 */
import { DEFAULT_MODEL } from '../server/gemini.js';

export default async function handler(_req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    configured: Boolean(process.env.GEMINI_API_KEY),
    model: DEFAULT_MODEL,
    time: new Date().toISOString(),
  });
}
