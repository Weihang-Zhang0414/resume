import { defineConfig, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Custom Vite plugin to handle local data fetching and saving
const portfolioApiPlugin = () => {
  return {
    name: 'portfolio-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/portfolio' && req.method === 'GET') {
          try {
            const dataPath = path.resolve('public/data/portfolio.json');
            const data = fs.readFileSync(dataPath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to read data' }));
          }
        } else if (req.url === '/api/portfolio' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const dataPath = path.resolve('public/data/portfolio.json');
              // Format JSON nicely with 2 spaces
              fs.writeFileSync(dataPath, JSON.stringify(JSON.parse(body), null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to save data' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Resume/', // Set this to your repository name
  plugins: [react(), portfolioApiPlugin()],
});
