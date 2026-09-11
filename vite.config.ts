import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Dev-only middleware that mounts the same handlers Vercel deploys from /api,
 * so `npm run dev` gives you a working /api/analyze and /api/grievance locally.
 * In production Vercel serves /api/*.ts as serverless functions; this plugin is not used.
 */
function apiDevServer(env: Record<string, string>): Plugin {
  return {
    name: 'snitch-api-dev-server',
    apply: 'serve',
    configureServer(server) {
      // Make the server-side key available to the handlers (never to the client bundle).
      if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
      if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL;

      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (!url.startsWith('/api/')) return next();

        const route = url.replace('/api/', '').replace(/\/$/, '');
        const allowed = new Set(['analyze', 'grievance', 'health']);
        if (!allowed.has(route)) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Unknown API route: ${route}` }));
          return;
        }

        // Read the JSON body.
        let raw = '';
        await new Promise<void>((resolve) => {
          req.on('data', (chunk: Buffer) => (raw += chunk.toString('utf8')));
          req.on('end', () => resolve());
        });
        let body: unknown = {};
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch {
            body = raw;
          }
        }

        // Minimal Vercel-like response shim.
        const shimRes = {
          status(code: number) {
            res.statusCode = code;
            return shimRes;
          },
          setHeader(name: string, value: string) {
            res.setHeader(name, value);
          },
          json(payload: unknown) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(payload));
          },
          end(payload?: string) {
            res.end(payload);
          },
        };

        try {
          // Load through Vite's SSR loader so TypeScript in /api works without a build step.
          const mod = await server.ssrLoadModule(`/api/${route}.ts`);
          await mod.default({ method: req.method, body, headers: req.headers }, shimRes);
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Dev API error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), apiDevServer(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: 'es2020',
      sourcemap: false,
    },
  };
});
