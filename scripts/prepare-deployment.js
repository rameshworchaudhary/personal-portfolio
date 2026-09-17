import fs from 'fs';
import path from 'path';

// Synchronize assets and models so both root (/assets, /models)
// and public (/public/assets, /public/models) work across all hosting providers
// (GitHub Pages, Vercel, Netlify, Cloud Run, custom servers).
try {
  if (fs.existsSync('public/assets')) {
    fs.cpSync('public/assets', 'assets', { recursive: true, force: true });
    console.log('✓ Synced public/assets -> assets');
  }
  if (fs.existsSync('public/models')) {
    fs.cpSync('public/models', 'models', { recursive: true, force: true });
    console.log('✓ Synced public/models -> models');
  }
  console.log('Deployment assets prepared successfully.');
} catch (err) {
  console.error('Error preparing assets:', err);
}
