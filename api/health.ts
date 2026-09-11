/**
 * GET /api/health — lets the UI show whether analysis is available.
 * Never returns the key, and never names the provider or model.
 */

export default async function handler(_req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    configured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
}
