import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const INTRO_DIR = path.resolve('public/assets/intro');
const HERO_DIR = path.resolve('public/assets/hero');
const MODELS_DIR = path.resolve('public/models');

fs.mkdirSync(INTRO_DIR, { recursive: true });
fs.mkdirSync(HERO_DIR, { recursive: true });
fs.mkdirSync(MODELS_DIR, { recursive: true });

// Source images
const sourceImages = [
  path.resolve('src/assets/images/rameshwor_hero_1786684419096.jpg'),
  path.resolve('src/assets/images/ishwor_hero_final_1786684623398.jpg'),
  path.resolve('src/assets/images/ishwor.jpeg'),
  path.resolve('rameshwor_hero.jpeg'),
  path.resolve('ishwor.jpeg')
].filter(p => fs.existsSync(p));

console.log('Found source images:', sourceImages.length);

async function generateIntroPhotos() {
  // 31 distinct variation configs
  const configs = [
    { title: 'Alpine Peak Silhouette', tint: { r: 210, g: 230, b: 255 }, contrast: 1.15, sat: 1.05, zoom: 1.0, rotate: 0 },
    { title: 'Double Breasted Formal', tint: { r: 240, g: 240, b: 245 }, contrast: 1.2, sat: 1.1, zoom: 1.15, rotate: 0 },
    { title: 'Pine Forest Expedition', tint: { r: 200, g: 245, b: 215 }, contrast: 1.1, sat: 1.25, zoom: 1.05, rotate: 0 },
    { title: 'Snow Mountain Vista', tint: { r: 225, g: 240, b: 255 }, contrast: 1.25, sat: 0.95, zoom: 1.2, rotate: 0 },
    { title: 'Studio Noir Minimal', tint: { r: 220, g: 220, b: 220 }, contrast: 1.35, sat: 0.0, zoom: 1.1, rotate: 0 },
    { title: 'Golden Hour Mountain', tint: { r: 255, g: 225, b: 190 }, contrast: 1.15, sat: 1.3, zoom: 1.0, rotate: 0 },
    { title: 'University Tech Workspace', tint: { r: 215, g: 230, b: 240 }, contrast: 1.18, sat: 1.1, zoom: 1.25, rotate: 0 },
    { title: 'Winter Cedar Trail', tint: { r: 205, g: 235, b: 220 }, contrast: 1.22, sat: 1.15, zoom: 1.1, rotate: 0 },
    { title: 'Emerald Valley Morning', tint: { r: 210, g: 250, b: 210 }, contrast: 1.12, sat: 1.35, zoom: 1.05, rotate: 0 },
    { title: 'Ivory Coat Alpine', tint: { r: 250, g: 250, b: 255 }, contrast: 1.16, sat: 1.0, zoom: 1.3, rotate: 0 },
    { title: 'Twilight Blue Reflections', tint: { r: 180, g: 210, b: 255 }, contrast: 1.28, sat: 1.2, zoom: 1.15, rotate: 0 },
    { title: 'Chamber Studio Portrait', tint: { r: 245, g: 235, b: 225 }, contrast: 1.25, sat: 1.05, zoom: 1.2, rotate: 0 },
    { title: 'High Altitude Lake', tint: { r: 200, g: 230, b: 255 }, contrast: 1.2, sat: 1.22, zoom: 1.0, rotate: 0 },
    { title: 'Modern Charcoal Blazer', tint: { r: 215, g: 215, b: 225 }, contrast: 1.3, sat: 0.85, zoom: 1.1, rotate: 0 },
    { title: 'Frost Birch Grove', tint: { r: 220, g: 245, b: 245 }, contrast: 1.14, sat: 1.1, zoom: 1.05, rotate: 0 },
    { title: 'Deep Emerald Matrix', tint: { r: 190, g: 255, b: 210 }, contrast: 1.24, sat: 1.4, zoom: 1.25, rotate: 0 },
    { title: 'Minimalist Monolith', tint: { r: 230, g: 230, b: 230 }, contrast: 1.4, sat: 0.1, zoom: 1.15, rotate: 0 },
    { title: 'Sunlit Rocky Rapids', tint: { r: 255, g: 240, b: 210 }, contrast: 1.18, sat: 1.25, zoom: 1.0, rotate: 0 },
    { title: 'Executive Double Breasted', tint: { r: 235, g: 235, b: 245 }, contrast: 1.26, sat: 1.05, zoom: 1.2, rotate: 0 },
    { title: 'Nordic Snowfall Pass', tint: { r: 225, g: 240, b: 255 }, contrast: 1.2, sat: 0.9, zoom: 1.1, rotate: 0 },
    { title: 'Amber Horizon Dusk', tint: { r: 255, g: 215, b: 180 }, contrast: 1.22, sat: 1.35, zoom: 1.05, rotate: 0 },
    { title: 'Cyber Emerald AI Aura', tint: { r: 180, g: 255, b: 200 }, contrast: 1.3, sat: 1.45, zoom: 1.3, rotate: 0 },
    { title: 'Alpine Pine Ridge', tint: { r: 210, g: 240, b: 225 }, contrast: 1.15, sat: 1.2, zoom: 1.1, rotate: 0 },
    { title: 'Silver Platinum Studio', tint: { r: 240, g: 245, b: 250 }, contrast: 1.32, sat: 0.4, zoom: 1.15, rotate: 0 },
    { title: 'Warm Coffee Knitwear', tint: { r: 255, g: 230, b: 210 }, contrast: 1.16, sat: 1.2, zoom: 1.0, rotate: 0 },
    { title: 'Subtle Fog Mountain', tint: { r: 215, g: 225, b: 240 }, contrast: 1.1, sat: 0.95, zoom: 1.2, rotate: 0 },
    { title: 'Graphite Tech Elegance', tint: { r: 220, g: 225, b: 230 }, contrast: 1.28, sat: 0.7, zoom: 1.25, rotate: 0 },
    { title: 'High Contrast Profile', tint: { r: 255, g: 255, b: 255 }, contrast: 1.35, sat: 1.1, zoom: 1.1, rotate: 0 },
    { title: 'Evergreen Peak Climb', tint: { r: 205, g: 245, b: 215 }, contrast: 1.2, sat: 1.3, zoom: 1.05, rotate: 0 },
    { title: 'Glacier Reflection', tint: { r: 210, g: 240, b: 255 }, contrast: 1.25, sat: 1.15, zoom: 1.18, rotate: 0 },
    { title: 'Signature Vanguard', tint: { r: 245, g: 250, b: 245 }, contrast: 1.22, sat: 1.12, zoom: 1.0, rotate: 0 }
  ];

  for (let i = 0; i < configs.length; i++) {
    const cfg = configs[i];
    const srcIndex = i % sourceImages.length;
    const srcFile = sourceImages[srcIndex];
    const numStr = String(i + 1).padStart(2, '0');
    const outPath = path.join(INTRO_DIR, `photo-${numStr}.webp`);

    try {
      let pipeline = sharp(srcFile)
        .resize(600, 750, {
          fit: 'cover',
          position: i % 3 === 0 ? 'top' : (i % 3 === 1 ? 'center' : 'attention')
        });

      if (cfg.sat === 0) {
        pipeline = pipeline.grayscale();
      } else {
        pipeline = pipeline.modulate({
          brightness: 1.02,
          saturation: cfg.sat
        });
      }

      pipeline = pipeline.linear(cfg.contrast, -(128 * cfg.contrast) + 128);

      if (cfg.tint && cfg.sat > 0) {
        pipeline = pipeline.tint(cfg.tint);
      }

      await pipeline.webp({ quality: 88, effort: 4 }).toFile(outPath);
      console.log(`Generated: photo-${numStr}.webp (${cfg.title})`);
    } catch (err) {
      console.error(`Error generating photo-${numStr}:`, err);
    }
  }

  // Ensure hero portrait is optimal
  const heroOut = path.join(HERO_DIR, 'hero-portrait.jpg');
  await sharp(sourceImages[0])
    .resize(1000, 1300, { fit: 'cover', position: 'center' })
    .modulate({ brightness: 1.03, saturation: 1.1 })
    .jpeg({ quality: 92 })
    .toFile(heroOut);
  console.log('Generated hero-portrait.jpg');
}

generateIntroPhotos().catch(console.error);
