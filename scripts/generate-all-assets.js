import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const INTRO_DIR = path.resolve('public/assets/intro');
const HERO_DIR = path.resolve('public/assets/hero');
const MODELS_DIR = path.resolve('public/models');

fs.mkdirSync(INTRO_DIR, { recursive: true });
fs.mkdirSync(HERO_DIR, { recursive: true });
fs.mkdirSync(MODELS_DIR, { recursive: true });

// Valid primary source images
const validSources = [
  path.resolve('src/assets/images/rameshwor_hero_1786684419096.jpg'),
  path.resolve('src/assets/images/ishwor_hero_final_1786684623398.jpg')
].filter(p => fs.existsSync(p));

console.log('Using valid source images:', validSources);

async function createAssets() {
  // 1. Generate hero portrait
  const heroOut = path.join(HERO_DIR, 'hero-portrait.jpg');
  await sharp(validSources[0])
    .resize(900, 1150, { fit: 'cover', position: 'center' })
    .modulate({ brightness: 1.02, saturation: 1.08 })
    .jpeg({ quality: 92 })
    .toFile(heroOut);
  console.log('✓ Created hero-portrait.jpg');

  // Also create a texture for the GLB model front
  const glbTexturePath = path.join(MODELS_DIR, 'portrait_texture.jpg');
  await sharp(validSources[0])
    .resize(768, 1024, { fit: 'cover', position: 'center' })
    .modulate({ brightness: 1.04, saturation: 1.1 })
    .jpeg({ quality: 90 })
    .toFile(glbTexturePath);

  // 2. Generate 31 unique intro photos
  const photoStyles = [
    { title: 'Snow Mountain Horizon', tint: { r: 215, g: 235, b: 255 }, sat: 1.0, contrast: 1.15, pos: 'top', rotate: 0 },
    { title: 'Double Breasted Formal', tint: { r: 240, g: 240, b: 245 }, sat: 1.1, contrast: 1.22, pos: 'center', rotate: 0 },
    { title: 'Pine Forest Path', tint: { r: 195, g: 245, b: 215 }, sat: 1.25, contrast: 1.12, pos: 'attention', rotate: 0 },
    { title: 'Alpine Peak Vista', tint: { r: 220, g: 240, b: 255 }, sat: 0.95, contrast: 1.26, pos: 'north', rotate: 0 },
    { title: 'Studio Monochrome Noir', tint: null, sat: 0, contrast: 1.38, pos: 'center', rotate: 0 },
    { title: 'Golden Hour Dusk', tint: { r: 255, g: 220, b: 185 }, sat: 1.32, contrast: 1.16, pos: 'top', rotate: 0 },
    { title: 'AI Engineering Lab', tint: { r: 210, g: 230, b: 245 }, sat: 1.08, contrast: 1.2, pos: 'attention', rotate: 0 },
    { title: 'Winter Trail Expedition', tint: { r: 205, g: 235, b: 220 }, sat: 1.15, contrast: 1.24, pos: 'center', rotate: 0 },
    { title: 'Emerald Canopy Sunlight', tint: { r: 205, g: 255, b: 205 }, sat: 1.38, contrast: 1.14, pos: 'top', rotate: 0 },
    { title: 'Ivory Suit Mountain Pass', tint: { r: 250, g: 250, b: 255 }, sat: 1.02, contrast: 1.18, pos: 'center', rotate: 0 },
    { title: 'Twilight Blue Reflections', tint: { r: 185, g: 215, b: 255 }, sat: 1.22, contrast: 1.28, pos: 'attention', rotate: 0 },
    { title: 'Classic Portrait Tone', tint: { r: 245, g: 235, b: 225 }, sat: 1.05, contrast: 1.25, pos: 'north', rotate: 0 },
    { title: 'Glacial Summit Glow', tint: { r: 200, g: 235, b: 255 }, sat: 1.2, contrast: 1.22, pos: 'center', rotate: 0 },
    { title: 'Modern Charcoal Suit', tint: { r: 220, g: 220, b: 230 }, sat: 0.8, contrast: 1.32, pos: 'top', rotate: 0 },
    { title: 'Frost Birch Whisper', tint: { r: 220, g: 245, b: 245 }, sat: 1.12, contrast: 1.16, pos: 'attention', rotate: 0 },
    { title: 'Cyber Matrix Green', tint: { r: 185, g: 255, b: 205 }, sat: 1.45, contrast: 1.26, pos: 'center', rotate: 0 },
    { title: 'High Contrast Silver', tint: null, sat: 0, contrast: 1.42, pos: 'top', rotate: 0 },
    { title: 'Sunlit Mountain Stream', tint: { r: 255, g: 240, b: 215 }, sat: 1.26, contrast: 1.18, pos: 'north', rotate: 0 },
    { title: 'Executive Presence', tint: { r: 235, g: 235, b: 245 }, sat: 1.06, contrast: 1.28, pos: 'center', rotate: 0 },
    { title: 'Nordic Snow Haven', tint: { r: 225, g: 242, b: 255 }, sat: 0.88, contrast: 1.22, pos: 'attention', rotate: 0 },
    { title: 'Amber Sunset Flare', tint: { r: 255, g: 210, b: 175 }, sat: 1.36, contrast: 1.24, pos: 'top', rotate: 0 },
    { title: 'Luminescent Neural Tone', tint: { r: 180, g: 255, b: 195 }, sat: 1.48, contrast: 1.32, pos: 'center', rotate: 0 },
    { title: 'High Alpine Pine Ridge', tint: { r: 210, g: 240, b: 225 }, sat: 1.18, contrast: 1.16, pos: 'north', rotate: 0 },
    { title: 'Platinum Studio Elegance', tint: { r: 240, g: 245, b: 250 }, sat: 0.35, contrast: 1.34, pos: 'attention', rotate: 0 },
    { title: 'Warm Knitwear Autumn', tint: { r: 255, g: 228, b: 205 }, sat: 1.22, contrast: 1.18, pos: 'top', rotate: 0 },
    { title: 'Subtle Fog Pine Valley', tint: { r: 215, g: 225, b: 240 }, sat: 0.92, contrast: 1.12, pos: 'center', rotate: 0 },
    { title: 'Graphite Tech Minimal', tint: { r: 220, g: 225, b: 230 }, sat: 0.65, contrast: 1.3, pos: 'north', rotate: 0 },
    { title: 'Pure Focus Monolith', tint: { r: 255, g: 255, b: 255 }, sat: 1.12, contrast: 1.36, pos: 'attention', rotate: 0 },
    { title: 'Evergreen Trail Climb', tint: { r: 205, g: 245, b: 215 }, sat: 1.32, contrast: 1.22, pos: 'top', rotate: 0 },
    { title: 'Glacier Blue Dawn', tint: { r: 210, g: 240, b: 255 }, sat: 1.16, contrast: 1.26, pos: 'center', rotate: 0 },
    { title: 'Vanguard Signature', tint: { r: 245, g: 250, b: 245 }, sat: 1.14, contrast: 1.24, pos: 'attention', rotate: 0 }
  ];

  for (let i = 0; i < photoStyles.length; i++) {
    const style = photoStyles[i];
    const src = validSources[i % validSources.length];
    const num = String(i + 1).padStart(2, '0');
    const outPath = path.join(INTRO_DIR, `photo-${num}.webp`);

    let p = sharp(src).resize(540, 680, { fit: 'cover', position: style.pos });

    if (style.sat === 0) {
      p = p.grayscale();
    } else {
      p = p.modulate({ brightness: 1.02, saturation: style.sat });
    }

    p = p.linear(style.contrast, -(128 * style.contrast) + 128);

    if (style.tint && style.sat > 0) {
      p = p.tint(style.tint);
    }

    await p.webp({ quality: 86, effort: 3 }).toFile(outPath);
    console.log(`✓ photo-${num}.webp: ${style.title}`);
  }

  // 3. Generate back chassis graphic texture for the 3D model
  const backTexPath = path.join(MODELS_DIR, 'back_texture.png');
  const svgChassis = `
  <svg width="768" height="1024" viewBox="0 0 768 1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0c0e12"/>
        <stop offset="50%" stop-color="#14171e"/>
        <stop offset="100%" stop-color="#08090b"/>
      </linearGradient>
      <linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00f076" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#00a852" stop-opacity="0.3"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffd700" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#00f076" stop-opacity="0.8"/>
      </linearGradient>
    </defs>
    
    <!-- Background Plate -->
    <rect width="768" height="1024" fill="url(#bg)"/>
    
    <!-- Outer Border -->
    <rect x="24" y="24" width="720" height="976" rx="36" fill="none" stroke="#222733" stroke-width="6"/>
    <rect x="36" y="36" width="696" height="952" rx="28" fill="none" stroke="url(#neon)" stroke-width="2"/>
    
    <!-- Corner Tech Brackets -->
    <path d="M 60 120 L 60 60 L 120 60" fill="none" stroke="#00f076" stroke-width="4" stroke-linecap="round"/>
    <path d="M 708 120 L 708 60 L 648 60" fill="none" stroke="#00f076" stroke-width="4" stroke-linecap="round"/>
    <path d="M 60 904 L 60 964 L 120 964" fill="none" stroke="#00f076" stroke-width="4" stroke-linecap="round"/>
    <path d="M 708 904 L 708 964 L 648 964" fill="none" stroke="#00f076" stroke-width="4" stroke-linecap="round"/>
    
    <!-- Circuit Lines & Nodes -->
    <g stroke="#00f076" stroke-opacity="0.25" stroke-width="2" fill="none">
      <path d="M 120 180 H 300 L 360 240 V 420 L 400 460 H 640"/>
      <path d="M 640 320 H 480 L 420 380 V 600 L 380 640 H 140"/>
      <path d="M 160 760 H 320 L 384 824 H 600"/>
      <circle cx="300" cy="180" r="5" fill="#00f076" fill-opacity="0.6"/>
      <circle cx="360" cy="240" r="4" fill="#00f076" fill-opacity="0.6"/>
      <circle cx="480" cy="320" r="5" fill="#00f076" fill-opacity="0.6"/>
      <circle cx="384" cy="824" r="5" fill="#00f076" fill-opacity="0.6"/>
    </g>

    <!-- Center AI Core Emblem -->
    <circle cx="384" cy="460" r="110" fill="none" stroke="#1d222d" stroke-width="12"/>
    <circle cx="384" cy="460" r="96" fill="none" stroke="url(#gold)" stroke-width="3" stroke-dasharray="8 6"/>
    <circle cx="384" cy="460" r="64" fill="#0f1217" stroke="#00f076" stroke-width="2"/>
    
    <text x="384" y="475" text-anchor="middle" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-size="44" font-weight="900" fill="#ffffff" letter-spacing="4">RC</text>
    
    <!-- Typography Badge -->
    <text x="384" y="640" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="600" fill="#00f076" letter-spacing="6">AI/ML ENGINEER</text>
    <text x="384" y="685" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="28" font-weight="800" fill="#ffffff" letter-spacing="2">RAMESHWOR CHAUDHARY</text>
    
    <text x="384" y="740" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" fill="#6b7280" letter-spacing="3">PORTFOLIO · 3D CORE CHASSIS · VER 2.6</text>
    <text x="384" y="920" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00f076" fill-opacity="0.5" letter-spacing="4">NEURAL MATRIX · COMPUTER VISION · FULL STACK</text>
  </svg>
  `;

  await sharp(Buffer.from(svgChassis))
    .png()
    .toFile(backTexPath);
  console.log('✓ Created 3D model back texture');

  // 4. Generate the genuine 3D GLB model
  await buildGlbModel(glbTexturePath, backTexPath, path.join(MODELS_DIR, 'rameshwor-portrait-3d.glb'));
}

async function buildGlbModel(frontTexPath, backTexPath, glbOutputPath) {
  console.log('Constructing binary glTF 2.0 3D Model: rameshwor-portrait-3d.glb...');

  const frontJpgBuffer = fs.readFileSync(frontTexPath);
  const backPngBuffer = fs.readFileSync(backTexPath);

  // Model Dimensions
  const w = 1.4; // Half-width: total width = 2.8
  const h = 1.85; // Half-height: total height = 3.7
  const d = 0.12; // Half-depth: total depth = 0.24
  const bevel = 0.08;

  // We build a volumetric 3D sculptural plaque with 3 sub-meshes:
  // 1. Front portrait face (textured)
  // 2. Back AI chassis face (textured)
  // 3. Beveled rim & metallic chamfer casing (PBR metallic emerald & dark titanium)

  // Submesh 1: Front Face (Quads -> 2 triangles)
  // Position (vec3), Normal (vec3), UV (vec2)
  const frontVertices = [
    // pos.x, pos.y, pos.z, norm.x, norm.y, norm.z, u, v
    -w,  h, d,   0, 0, 1,   0, 0,
     w,  h, d,   0, 0, 1,   1, 0,
     w, -h, d,   0, 0, 1,   1, 1,
    -w, -h, d,   0, 0, 1,   0, 1
  ];
  const frontIndices = [0, 2, 1, 0, 3, 2];

  // Submesh 2: Back Face (Quads -> 2 triangles)
  const backVertices = [
     w,  h, -d,   0, 0, -1,   0, 0,
    -w,  h, -d,   0, 0, -1,   1, 0,
    -w, -h, -d,   0, 0, -1,   1, 1,
     w, -h, -d,   0, 0, -1,   0, 1
  ];
  const backIndices = [0, 2, 1, 0, 3, 2];

  // Submesh 3: Outer Chamfer / Side Casing (8 side segments with normals)
  // Top, Bottom, Right, Left, Top-Right, Top-Left, Bottom-Right, Bottom-Left
  const casingVerts = [];
  const casingIndices = [];

  function addQuad(p1, p2, p3, p4, norm) {
    const startIdx = casingVerts.length / 8;
    // p: [x,y,z], n: [nx,ny,nz], uv: [u,v]
    casingVerts.push(
      p1[0], p1[1], p1[2], norm[0], norm[1], norm[2], 0, 0,
      p2[0], p2[1], p2[2], norm[0], norm[1], norm[2], 1, 0,
      p3[0], p3[1], p3[2], norm[0], norm[1], norm[2], 1, 1,
      p4[0], p4[1], p4[2], norm[0], norm[1], norm[2], 0, 1
    );
    casingIndices.push(startIdx, startIdx + 2, startIdx + 1, startIdx, startIdx + 3, startIdx + 2);
  }

  // Right side
  addQuad([w + bevel, h - bevel, d - bevel], [w + bevel, h - bevel, -d + bevel], [w + bevel, -h + bevel, -d + bevel], [w + bevel, -h + bevel, d - bevel], [1, 0, 0]);
  // Left side
  addQuad([-w - bevel, h - bevel, -d + bevel], [-w - bevel, h - bevel, d - bevel], [-w - bevel, -h + bevel, d - bevel], [-w - bevel, -h + bevel, -d + bevel], [-1, 0, 0]);
  // Top side
  addQuad([-w + bevel, h + bevel, -d + bevel], [w - bevel, h + bevel, -d + bevel], [w - bevel, h + bevel, d - bevel], [-w + bevel, h + bevel, d - bevel], [0, 1, 0]);
  // Bottom side
  addQuad([-w + bevel, -h - bevel, d - bevel], [w - bevel, -h - bevel, d - bevel], [w - bevel, -h - bevel, -d + bevel], [-w + bevel, -h - bevel, -d + bevel], [0, -1, 0]);

  // Front Bevel Ring (Border Frame around front portrait)
  // Top front bevel
  addQuad([-w, h, d], [w, h, d], [w - bevel, h + bevel, d - bevel], [-w + bevel, h + bevel, d - bevel], [0, 0.707, 0.707]);
  // Bottom front bevel
  addQuad([-w + bevel, -h - bevel, d - bevel], [w - bevel, -h - bevel, d - bevel], [w, -h, d], [-w, -h, d], [0, -0.707, 0.707]);
  // Right front bevel
  addQuad([w, h, d], [w + bevel, h - bevel, d - bevel], [w + bevel, -h + bevel, d - bevel], [w, -h, d], [0.707, 0, 0.707]);
  // Left front bevel
  addQuad([-w - bevel, h - bevel, d - bevel], [-w, h, d], [-w, -h, d], [-w - bevel, -h + bevel, d - bevel], [-0.707, 0, 0.707]);

  // Back Bevel Ring (Border Frame around back plate)
  addQuad([w, h, -d], [-w, h, -d], [-w + bevel, h + bevel, -d + bevel], [w - bevel, h + bevel, -d + bevel], [0, 0.707, -0.707]);
  addQuad([w, -h, -d], [-w, -h, -d], [-w + bevel, -h - bevel, -d + bevel], [w - bevel, -h - bevel, -d + bevel], [0, -0.707, -0.707]);
  addQuad([w + bevel, h - bevel, -d + bevel], [w, h, -d], [w, -h, -d], [w + bevel, -h + bevel, -d + bevel], [0.707, 0, -0.707]);
  addQuad([-w, h, -d], [-w - bevel, h - bevel, -d + bevel], [-w - bevel, -h + bevel, -d + bevel], [-w, -h, -d], [-0.707, 0, -0.707]);

  // Combine binary buffers
  function createGeometryBuffers(verts, indices) {
    const posNormUvCount = verts.length / 8;
    const posBuffer = Buffer.alloc(posNormUvCount * 3 * 4);
    const normBuffer = Buffer.alloc(posNormUvCount * 3 * 4);
    const uvBuffer = Buffer.alloc(posNormUvCount * 2 * 4);
    const idxBuffer = Buffer.alloc(indices.length * 2); // uint16

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < posNormUvCount; i++) {
      const x = verts[i * 8 + 0];
      const y = verts[i * 8 + 1];
      const z = verts[i * 8 + 2];
      const nx = verts[i * 8 + 3];
      const ny = verts[i * 8 + 4];
      const nz = verts[i * 8 + 5];
      const u = verts[i * 8 + 6];
      const v = verts[i * 8 + 7];

      minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);

      posBuffer.writeFloatLE(x, i * 12 + 0);
      posBuffer.writeFloatLE(y, i * 12 + 4);
      posBuffer.writeFloatLE(z, i * 12 + 8);

      normBuffer.writeFloatLE(nx, i * 12 + 0);
      normBuffer.writeFloatLE(ny, i * 12 + 4);
      normBuffer.writeFloatLE(nz, i * 12 + 8);

      uvBuffer.writeFloatLE(u, i * 8 + 0);
      uvBuffer.writeFloatLE(v, i * 8 + 4);
    }

    for (let i = 0; i < indices.length; i++) {
      idxBuffer.writeUInt16LE(indices[i], i * 2);
    }

    return {
      posBuffer,
      normBuffer,
      uvBuffer,
      idxBuffer,
      vertexCount: posNormUvCount,
      indexCount: indices.length,
      bounds: { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] }
    };
  }

  const gFront = createGeometryBuffers(frontVertices, frontIndices);
  const gBack = createGeometryBuffers(backVertices, backIndices);
  const gCasing = createGeometryBuffers(casingVerts, casingIndices);

  // Assemble all binary buffers with 4-byte alignment
  const bufferChunks = [];
  const bufferViews = [];
  const accessors = [];

  function appendBuffer(buf, target) {
    // align offset to 4 bytes
    let curOffset = bufferChunks.reduce((acc, c) => acc + c.length, 0);
    const pad = (4 - (curOffset % 4)) % 4;
    if (pad > 0) {
      bufferChunks.push(Buffer.alloc(pad));
      curOffset += pad;
    }
    bufferChunks.push(buf);
    const viewIndex = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: curOffset,
      byteLength: buf.length,
      target
    });
    return viewIndex;
  }

  // Add front indices & attributes
  const bvFrontIdx = appendBuffer(gFront.idxBuffer, 34963); // ELEMENT_ARRAY_BUFFER
  const bvFrontPos = appendBuffer(gFront.posBuffer, 34962); // ARRAY_BUFFER
  const bvFrontNorm = appendBuffer(gFront.normBuffer, 34962);
  const bvFrontUv = appendBuffer(gFront.uvBuffer, 34962);

  const accFrontIdx = accessors.length;
  accessors.push({ bufferView: bvFrontIdx, byteOffset: 0, componentType: 5123, count: gFront.indexCount, type: 'SCALAR' });
  const accFrontPos = accessors.length;
  accessors.push({ bufferView: bvFrontPos, byteOffset: 0, componentType: 5126, count: gFront.vertexCount, type: 'VEC3', max: gFront.bounds.max, min: gFront.bounds.min });
  const accFrontNorm = accessors.length;
  accessors.push({ bufferView: bvFrontNorm, byteOffset: 0, componentType: 5126, count: gFront.vertexCount, type: 'VEC3' });
  const accFrontUv = accessors.length;
  accessors.push({ bufferView: bvFrontUv, byteOffset: 0, componentType: 5126, count: gFront.vertexCount, type: 'VEC2' });

  // Add back indices & attributes
  const bvBackIdx = appendBuffer(gBack.idxBuffer, 34963);
  const bvBackPos = appendBuffer(gBack.posBuffer, 34962);
  const bvBackNorm = appendBuffer(gBack.normBuffer, 34962);
  const bvBackUv = appendBuffer(gBack.uvBuffer, 34962);

  const accBackIdx = accessors.length;
  accessors.push({ bufferView: bvBackIdx, byteOffset: 0, componentType: 5123, count: gBack.indexCount, type: 'SCALAR' });
  const accBackPos = accessors.length;
  accessors.push({ bufferView: bvBackPos, byteOffset: 0, componentType: 5126, count: gBack.vertexCount, type: 'VEC3', max: gBack.bounds.max, min: gBack.bounds.min });
  const accBackNorm = accessors.length;
  accessors.push({ bufferView: bvBackNorm, byteOffset: 0, componentType: 5126, count: gBack.vertexCount, type: 'VEC3' });
  const accBackUv = accessors.length;
  accessors.push({ bufferView: bvBackUv, byteOffset: 0, componentType: 5126, count: gBack.vertexCount, type: 'VEC2' });

  // Add casing indices & attributes
  const bvCasingIdx = appendBuffer(gCasing.idxBuffer, 34963);
  const bvCasingPos = appendBuffer(gCasing.posBuffer, 34962);
  const bvCasingNorm = appendBuffer(gCasing.normBuffer, 34962);
  const bvCasingUv = appendBuffer(gCasing.uvBuffer, 34962);

  const accCasingIdx = accessors.length;
  accessors.push({ bufferView: bvCasingIdx, byteOffset: 0, componentType: 5123, count: gCasing.indexCount, type: 'SCALAR' });
  const accCasingPos = accessors.length;
  accessors.push({ bufferView: bvCasingPos, byteOffset: 0, componentType: 5126, count: gCasing.vertexCount, type: 'VEC3', max: gCasing.bounds.max, min: gCasing.bounds.min });
  const accCasingNorm = accessors.length;
  accessors.push({ bufferView: bvCasingNorm, byteOffset: 0, componentType: 5126, count: gCasing.vertexCount, type: 'VEC3' });
  const accCasingUv = accessors.length;
  accessors.push({ bufferView: bvCasingUv, byteOffset: 0, componentType: 5126, count: gCasing.vertexCount, type: 'VEC2' });

  // Add images to buffer
  const bvFrontImg = appendBuffer(frontJpgBuffer);
  const bvBackImg = appendBuffer(backPngBuffer);

  const totalBinBuffer = Buffer.concat(bufferChunks);

  // glTF Structure
  const gltfJson = {
    asset: { version: '2.0', generator: 'Rameshwor3D-Engine' },
    scene: 0,
    scenes: [{ name: 'PortraitScene', nodes: [0] }],
    nodes: [
      {
        name: 'RameshworPortrait3D',
        mesh: 0,
        rotation: [0, 0, 0, 1]
      }
    ],
    meshes: [
      {
        name: 'PortraitPlaque',
        primitives: [
          // Front Portrait
          {
            attributes: { POSITION: accFrontPos, NORMAL: accFrontNorm, TEXCOORD_0: accFrontUv },
            indices: accFrontIdx,
            material: 0
          },
          // Back AI Plate
          {
            attributes: { POSITION: accBackPos, NORMAL: accBackNorm, TEXCOORD_0: accBackUv },
            indices: accBackIdx,
            material: 1
          },
          // Beveled Titanium & Emerald Casing
          {
            attributes: { POSITION: accCasingPos, NORMAL: accCasingNorm, TEXCOORD_0: accCasingUv },
            indices: accCasingIdx,
            material: 2
          }
        ]
      }
    ],
    materials: [
      // 0: Front Portrait Material
      {
        name: 'FrontPortrait',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0.1,
          roughnessFactor: 0.3
        },
        emissiveFactor: [0.05, 0.05, 0.05],
        doubleSided: false
      },
      // 1: Back AI Chassis Material
      {
        name: 'BackPlate',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 1 },
          metallicFactor: 0.65,
          roughnessFactor: 0.25
        },
        emissiveFactor: [0.0, 0.15, 0.08],
        doubleSided: false
      },
      // 2: Casing & Bevels (Cyber Titanium & Emerald Edge)
      {
        name: 'TitaniumEmeraldCasing',
        pbrMetallicRoughness: {
          baseColorFactor: [0.08, 0.10, 0.14, 1.0],
          metallicFactor: 0.9,
          roughnessFactor: 0.18
        },
        emissiveFactor: [0.0, 0.35, 0.15],
        doubleSided: true
      }
    ],
    textures: [
      { sampler: 0, source: 0 },
      { sampler: 0, source: 1 }
    ],
    images: [
      { bufferView: bvFrontImg, mimeType: 'image/jpeg' },
      { bufferView: bvBackImg, mimeType: 'image/png' }
    ],
    samplers: [
      { magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }
    ],
    accessors,
    bufferViews,
    buffers: [{ byteLength: totalBinBuffer.length }]
  };

  const jsonStr = JSON.stringify(gltfJson);
  let jsonBuffer = Buffer.from(jsonStr, 'utf8');
  const jsonPad = (4 - (jsonBuffer.length % 4)) % 4;
  if (jsonPad > 0) {
    jsonBuffer = Buffer.concat([jsonBuffer, Buffer.from(' '.repeat(jsonPad), 'utf8')]);
  }

  const binPad = (4 - (totalBinBuffer.length % 4)) % 4;
  const finalBinBuffer = binPad > 0 ? Buffer.concat([totalBinBuffer, Buffer.alloc(binPad)]) : totalBinBuffer;

  const totalLength = 12 + (8 + jsonBuffer.length) + (8 + finalBinBuffer.length);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // "glTF"
  header.writeUInt32LE(2, 4); // version 2
  header.writeUInt32LE(totalLength, 8); // total length

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // "JSON"

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(finalBinBuffer.length, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // "BIN\0"

  const glbBuffer = Buffer.concat([
    header,
    jsonChunkHeader,
    jsonBuffer,
    binChunkHeader,
    finalBinBuffer
  ]);

  fs.writeFileSync(glbOutputPath, glbBuffer);
  console.log(`✓ Exported GLB model: ${glbOutputPath} (size: ${glbBuffer.length} bytes)`);
}

createAssets().catch(console.error);
