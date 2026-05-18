import { defineConfig, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Helper function to safely copy a directory recursively
function copyDirectory(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper function to sync folders and scan assets for each experience
function syncExperienceFolders(data: any) {
  const types = [
    { key: 'projects', folder: 'projects', idPrefix: 'proj', nameField: 'name' },
    { key: 'internships', folder: 'internships', idPrefix: 'int', nameField: 'company' },
    { key: 'exchanges', folder: 'exchanges', idPrefix: 'exc', nameField: 'name' },
    { key: 'volunteers', folder: 'volunteers', idPrefix: 'vol', nameField: 'name' }
  ];

  let modified = false;

  for (const { key, folder, idPrefix, nameField } of types) {
    if (!data[key] || !Array.isArray(data[key])) {
      data[key] = [];
      modified = true;
    }

    data[key].forEach((item: any, index: number) => {
      const itemNameEn = item[nameField]?.en || '';
      const newId = itemNameEn
        ? itemNameEn.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
        : `${idPrefix}-${index}`;

      // 1. Ensure ID is up-to-date with project name
      if (item.id !== newId) {
        const oldId = item.id;
        item.id = newId;
        modified = true;

        // If old folder exists, move its content to the new project-named folder using copy-delete to bypass EPERM lock on Windows
        if (oldId) {
          const oldFolderPath = path.resolve('public', 'experiences', folder, oldId);
          const newFolderPath = path.resolve('public', 'experiences', folder, newId);
          if (fs.existsSync(oldFolderPath) && oldFolderPath !== newFolderPath) {
            try {
              copyDirectory(oldFolderPath, newFolderPath);
              fs.rmSync(oldFolderPath, { recursive: true, force: true });
              console.log(`[Sync] Moved folder from: ${oldId} -> ${newId}`);
            } catch (err: any) {
              console.error(`[Sync] Failed to move folder: ${err.message}`);
            }
          }
        }
      }

      const folderPath = path.resolve('public', 'experiences', folder, item.id);
      const photosPath = path.join(folderPath, 'photos');
      const certsPath = path.join(folderPath, 'certificates');
      const mdPath = path.join(folderPath, 'details.md');

      // 2. Create directory and default files if not exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        fs.mkdirSync(photosPath, { recursive: true });
        fs.mkdirSync(certsPath, { recursive: true });
        
        const titleEn = item.name?.en || item.company?.en || item.institution?.en || 'Experience details';
        const titleZh = item.name?.zh || item.company?.zh || item.institution?.zh || '经历详情';
        
        const defaultMd = `# ${titleZh} / ${titleEn}\n\n在这里编辑该经历的详细介绍。支持 Markdown 格式排版，会在前台详情页面中自动渲染。\n\n## 核心收获 / Core Highlights\n- **创新实践**: 深度应用所学技术解决实际痛点问题\n- **团队协作**: 协同多方资源，高效率推进项目落地\n- **个人成长**: 提升了专业技术水平与解决复杂工程问题的能力\n`;
        fs.writeFileSync(mdPath, defaultMd, 'utf-8');
        modified = true;
      }

      // 3. Scan photos folder
      let photos: string[] = [];
      if (fs.existsSync(photosPath)) {
        photos = fs.readdirSync(photosPath).filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp'].includes(ext);
        });
      }
      if (JSON.stringify(item.photos) !== JSON.stringify(photos)) {
        item.photos = photos;
        modified = true;
      }

      // 4. Scan certificates folder
      let certificates: string[] = [];
      if (fs.existsSync(certsPath)) {
        certificates = fs.readdirSync(certsPath).filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp'].includes(ext);
        });
      }
      if (JSON.stringify(item.certificates) !== JSON.stringify(certificates)) {
        item.certificates = certificates;
        modified = true;
      }

      // 5. Check markdown details
      const hasMarkdown = fs.existsSync(mdPath);
      if (item.hasMarkdown !== hasMarkdown) {
        item.hasMarkdown = hasMarkdown;
        modified = true;
      }
    });
  }

  return modified;
}

// Helper function to clean up deleted experience directories
function cleanDeletedExperienceFolders(oldData: any, newData: any) {
  const types = [
    { key: 'projects', folder: 'projects' },
    { key: 'internships', folder: 'internships' },
    { key: 'exchanges', folder: 'exchanges' },
    { key: 'volunteers', folder: 'volunteers' }
  ];

  types.forEach(({ key, folder }) => {
    const oldItems = oldData?.[key] || [];
    const newItems = newData?.[key] || [];

    const newIds = new Set(newItems.map((item: any) => item.id).filter(Boolean));

    oldItems.forEach((oldItem: any) => {
      if (oldItem.id && !newIds.has(oldItem.id)) {
        const folderPath = path.resolve('public', 'experiences', folder, oldItem.id);
        if (fs.existsSync(folderPath)) {
          try {
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log(`[Sync] Deleted folder: ${folderPath}`);
          } catch (err) {
            console.error(`[Sync] Failed to delete folder ${folderPath}:`, err);
          }
        }
      }
    });
  });
}

// Custom Vite plugin to handle local data fetching and saving
const portfolioApiPlugin = () => {
  return {
    name: 'portfolio-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const isGetPortfolio = (req.url === '/api/portfolio' || req.url.endsWith('/data/portfolio.json')) && req.method === 'GET';
        
        if (isGetPortfolio) {
          try {
            const dataPath = path.resolve('public/data/portfolio.json');
            const data = fs.readFileSync(dataPath, 'utf-8');
            const jsonData = JSON.parse(data);
            
            // Sync and scan folders
            const isModified = syncExperienceFolders(jsonData);
            if (isModified) {
              fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2), 'utf-8');
            }
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(jsonData));
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
              const oldData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
              const newData = JSON.parse(body);
              
              // Clean up deleted directories
              cleanDeletedExperienceFolders(oldData, newData);
              
              // Sync and scan new directories
              syncExperienceFolders(newData);
              
              fs.writeFileSync(dataPath, JSON.stringify(newData, null, 2), 'utf-8');
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
  base: '/resume/',
  plugins: [react(), portfolioApiPlugin()],
});
