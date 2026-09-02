import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const MODELS_DIR = path.resolve('public/models');
const HERO_DIR = path.resolve('public/assets/hero');
fs.mkdirSync(MODELS_DIR, { recursive: true });
fs.mkdirSync(HERO_DIR, { recursive: true });

async function generate3DSculptureAssets() {
  console.log('Generating 3D sculpture assets from rameshwor_hero.jpeg...');

  const srcPath = path.resolve('rameshwor_hero.jpeg');
  const img = sharp(srcPath);
  const meta = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // 1. Calculate precise silhouette mask
  const mask = new Uint8Array(w * h);

  // Scanline segmentation
  for (let y = 0; y < h; y++) {
    // Find top of head
    if (y < 120) {
      continue;
    }

    let leftX = -1;
    let rightX = -1;

    // Search from left
    for (let x = 0; x < Math.floor(w / 2); x++) {
      const idx = (y * w + x) * info.channels;
      const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      if (y >= 430) {
        // Suit region
        if (lum < 58) {
          leftX = x;
          break;
        }
      } else if (y >= 330) {
        // Jaw / neck / hair
        if (lum < 65 || (x >= 350 && lum > 100)) {
          leftX = Math.min(x, 370);
          break;
        }
      } else {
        // Head / hair
        if (lum < 65) {
          leftX = x;
          break;
        }
      }
    }

    // Search from right
    for (let x = w - 1; x >= Math.floor(w / 2); x--) {
      const idx = (y * w + x) * info.channels;
      const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      if (y >= 430) {
        if (lum < 58) {
          rightX = x;
          break;
        }
      } else if (y >= 330) {
        if (lum < 65 || (x <= 670 && lum > 100)) {
          rightX = Math.max(x, 650);
          break;
        }
      } else {
        if (lum < 65) {
          rightX = x;
          break;
        }
      }
    }

    if (leftX !== -1 && rightX !== -1 && rightX > leftX) {
      for (let x = leftX; x <= rightX; x++) {
        mask[y * w + x] = 255;
      }
    }
  }

  // Smooth & anti-alias mask edges
  const smoothedMask = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += mask[(y + dy) * w + (x + dx)];
        }
      }
      smoothedMask[y * w + x] = Math.round(sum / 9);
    }
  }

  // 2. Generate RGBA Cutout
  const cutoutBuffer = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const srcIdx = i * info.channels;
    const dstIdx = i * 4;
    cutoutBuffer[dstIdx + 0] = data[srcIdx + 0];
    cutoutBuffer[dstIdx + 1] = data[srcIdx + 1];
    cutoutBuffer[dstIdx + 2] = data[srcIdx + 2];
    cutoutBuffer[dstIdx + 3] = smoothedMask[i];
  }

  const cutoutPath = path.join(MODELS_DIR, 'rameshwor-cutout.png');
  await sharp(cutoutBuffer, { raw: { width: w, height: h, channels: 4 } })
    .resize(768, 1152, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(cutoutPath);
  console.log('✓ Created rameshwor-cutout.png');

  // Also save to hero directory for easy reference
  await sharp(cutoutPath)
    .toFile(path.join(HERO_DIR, 'hero-portrait-cutout.png'));

  // 3. Generate 3D Anatomical Depth Map
  // Calculates real volumetric depth: nose, cheekbones, forehead, hair volume, chest, arms
  const depthBuffer = Buffer.alloc(w * h);
  const cx = 512;
  const faceCy = 350;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const alpha = smoothedMask[idx] / 255;
      if (alpha <= 0.05) {
        depthBuffer[idx] = 0;
        continue;
      }

      const lum = (data[idx * 3] + data[idx * 3 + 1] + data[idx * 3 + 2]) / (3 * 255);

      // Base body depth profile (convex cylinder)
      const distFromCenter = Math.abs(x - cx) / (w * 0.5);
      const lateralCurvature = Math.max(0, Math.cos(distFromCenter * Math.PI * 0.48));

      let anatomicalDepth = 0.35 + lateralCurvature * 0.35;

      // Face & Nose elevation
      const dxFace = (x - cx) / 180;
      const dyFace = (y - faceCy) / 160;
      const faceDistSq = dxFace * dxFace + dyFace * dyFace;

      if (faceDistSq < 1.0) {
        const faceBulge = (1.0 - faceDistSq) * 0.35;
        // Nose & cheekbone highlights in facial area
        const noseProximity = Math.max(0, 1.0 - (Math.abs(x - cx) / 40) - (Math.abs(y - 360) / 50));
        anatomicalDepth += faceBulge + noseProximity * 0.2 + lum * 0.15;
      } else if (y < 280) {
        // Hair volume
        anatomicalDepth += 0.15 + (1 - lum) * 0.12;
      } else {
        // Suit lapels and shoulders
        const lapelHighlight = lum > 0.08 ? 0.08 : 0;
        anatomicalDepth += lapelHighlight;
      }

      const finalDepth = Math.min(255, Math.max(0, Math.round(anatomicalDepth * alpha * 255)));
      depthBuffer[idx] = finalDepth;
    }
  }

  const depthPath = path.join(MODELS_DIR, 'rameshwor-depth.png');
  await sharp(depthBuffer, { raw: { width: w, height: h, channels: 1 } })
    .resize(768, 1152, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .blur(1.5)
    .png()
    .toFile(depthPath);
  console.log('✓ Created rameshwor-depth.png');

  // 4. Generate Tangent-Space Normal Map for 3D PBR Lighting
  const normalBuffer = Buffer.alloc(w * h * 3);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const dstIdx = idx * 3;

      if (smoothedMask[idx] < 20) {
        normalBuffer[dstIdx + 0] = 128;
        normalBuffer[dstIdx + 1] = 128;
        normalBuffer[dstIdx + 2] = 255;
        continue;
      }

      // Sobel gradient on depth + luminance
      const dL = depthBuffer[y * w + (x - 1)];
      const dR = depthBuffer[y * w + (x + 1)];
      const dT = depthBuffer[(y - 1) * w + x];
      const dB = depthBuffer[(y + 1) * w + x];

      const dx = (dR - dL) / 255.0 * 2.5;
      const dy = (dB - dT) / 255.0 * 2.5;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = dz / len;

      normalBuffer[dstIdx + 0] = Math.round((nx * 0.5 + 0.5) * 255);
      normalBuffer[dstIdx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normalBuffer[dstIdx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
    }
  }

  const normalPath = path.join(MODELS_DIR, 'rameshwor-normal.png');
  await sharp(normalBuffer, { raw: { width: w, height: h, channels: 3 } })
    .resize(768, 1152, { fit: 'contain', background: { r: 128, g: 128, b: 255, alpha: 1 } })
    .png()
    .toFile(normalPath);
  console.log('✓ Created rameshwor-normal.png');

  // 5. Generate Back Chassis Neural Plate matching the silhouette
  const backSvg = `
  <svg width="768" height="1152" viewBox="0 0 768 1152" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chassisBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0c10"/>
        <stop offset="40%" stop-color="#121620"/>
        <stop offset="100%" stop-color="#07080a"/>
      </linearGradient>
      <linearGradient id="emeraldGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00f076" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.7"/>
      </linearGradient>
      <radialGradient id="coreLight" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#00f076" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Base Plate -->
    <rect width="768" height="1152" fill="url(#chassisBg)"/>
    <rect width="768" height="1152" fill="url(#coreLight)"/>

    <!-- Geometric Neural Matrix Patterns -->
    <g stroke="#00f076" stroke-opacity="0.28" stroke-width="2" fill="none">
      <!-- Circuit Spine -->
      <line x1="384" y1="120" x2="384" y2="1020" stroke-dasharray="8 6"/>
      <path d="M 160 280 H 320 L 384 344 H 480 L 540 400 H 620"/>
      <path d="M 620 600 H 460 L 384 676 H 280 L 220 736 H 140"/>
      <path d="M 200 860 H 350 L 384 894 H 560"/>

      <circle cx="384" cy="344" r="6" fill="#00f076" fill-opacity="0.7"/>
      <circle cx="384" cy="676" r="6" fill="#00f076" fill-opacity="0.7"/>
      <circle cx="384" cy="894" r="6" fill="#00f076" fill-opacity="0.7"/>
    </g>

    <!-- High-Tech Central Medallion -->
    <circle cx="384" cy="460" r="120" fill="#0b0e14" stroke="#1f2633" stroke-width="14"/>
    <circle cx="384" cy="460" r="106" fill="none" stroke="url(#emeraldGlow)" stroke-width="3" stroke-dasharray="12 8"/>
    <circle cx="384" cy="460" r="75" fill="#07090c" stroke="#00f076" stroke-width="2.5"/>

    <!-- Monogram -->
    <text x="384" y="478" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" fill="#ffffff" letter-spacing="4">RC</text>

    <!-- Engineering Badges -->
    <text x="384" y="660" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#00f076" letter-spacing="6">AI / FULL-STACK ENGINEER</text>
    <text x="384" y="705" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="30" font-weight="800" fill="#ffffff" letter-spacing="2">RAMESHWOR CHAUDHARY</text>
    <text x="384" y="760" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" fill="#9ca3af" letter-spacing="3">NEURAL ARCHITECTURE · THREE.JS · WEBGL</text>

    <!-- Hexagonal Matrix Dots -->
    <g fill="#00f076" fill-opacity="0.4">
      <circle cx="344" cy="980" r="3"/>
      <circle cx="364" cy="980" r="3"/>
      <circle cx="384" cy="980" r="4"/>
      <circle cx="404" cy="980" r="3"/>
      <circle cx="424" cy="980" r="3"/>
    </g>
  </svg>
  `;

  const backPath = path.join(MODELS_DIR, 'rameshwor-back.png');
  await sharp(Buffer.from(backSvg))
    .png()
    .toFile(backPath);
  console.log('✓ Created rameshwor-back.png');
}

generate3DSculptureAssets().catch(console.error);
