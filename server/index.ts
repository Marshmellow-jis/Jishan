import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureDatabase } from './db/index.js';
import apiRouter from './routes/api.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const projectRoot = process.cwd();
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(express.json({ limit: '200kb' }));
app.use('/api', apiRouter);

if (isProduction) {
  const clientDirectory = path.resolve(projectRoot, 'dist/client');
  app.use(express.static(clientDirectory, { index: false, maxAge: '1h' }));
  app.get('*', (request, response, next) => {
    if (request.path.startsWith('/api/')) return next();
    response.sendFile(path.join(clientDirectory, 'index.html'), (error) => error && next(error));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    configFile: path.resolve(projectRoot, 'vite.config.ts'),
    server: { middlewareMode: true, host: '0.0.0.0' },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.get('*', async (request, response, next) => {
    try {
      const template = await vite.transformIndexHtml(request.originalUrl, await import('node:fs/promises').then(({ readFile }) => readFile(path.resolve(projectRoot, 'index.html'), 'utf8')));
      response.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });
}

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error('Request failed:', error instanceof Error ? error.message : 'unknown error');
  if (response.headersSent) return;
  response.status(500).json({ error: 'Something went wrong. Please try again.' });
});

try {
  await ensureDatabase();
  console.info('AgriShield database ready.');
} catch (error) {
  console.warn('AgriShield database is not ready; public pages remain available:', error instanceof Error ? error.message : 'database error');
}

app.listen(port, '0.0.0.0', () => {
  console.info(`AgriShield AI listening on 0.0.0.0:${port}`);
});
