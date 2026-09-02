import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const MODELS_DIR = path.resolve('public/models');
fs.mkdirSync(MODELS_DIR, { recursive: true });

/**
 * Creates a clean, realistic, cinematic 3D portrait relief model.
 * 
 * Key Principles:
 * 1. High-fidelity original portrait texture with zero degradation.
 * 2. Continuous smooth subdivided mesh (120 x 180 grid).
 * 3. Heavily smoothed, low-amplitude structural depth field (nose, cheeks, chin, torso curvature).
 * 4. Zero high-frequency noise, zero spikes, zero voxel artifacts.
 * 5. Closed solid geometry with beveled side rim and sleek dark rear backing plate.
 * 6. Self-contained GLB export with embedded texture.
 */
async function generateCleanRealistic3DPortrait() {
  console.log('⚡ Generating Clean Realistic 3D Portrait Relief Model for Rameshwor Chaudhary...');

  const srcPortraitPath = path.resolve('rameshwor_hero.jpeg');

  // Load high-resolution portrait JPEG for embedding inside the GLB
  const frontJpgBuffer = await sharp(srcPortraitPath)
    .resize(1024, 1536, { fit: 'cover' })
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toBuffer();

  // Create clean, dark carbon-titanium rear texture with subtle monogram
  const backSvg = `
  <svg width="1024" height="1536" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bgGlow" cx="50%" cy="50%" r="65%">
        <stop offset="0%" stop-color="#151921"/>
        <stop offset="60%" stop-color="#0d1017"/>
        <stop offset="100%" stop-color="#06070a"/>
      </radialGradient>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
      <linearGradient id="metalStroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f076" stop-opacity="0.6"/>
        <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#00f076" stop-opacity="0.6"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1536" fill="url(#bgGlow)"/>
    <rect width="1024" height="1536" fill="url(#grid)"/>
    
    <!-- Central Monogram & Clean Branding -->
    <g transform="translate(512, 768)">
      <circle r="160" fill="none" stroke="url(#metalStroke)" stroke-width="2" stroke-dasharray="6,6"/>
      <circle r="140" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <text x="0" y="16" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="4">RC</text>
      <text x="0" y="60" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#00f076" text-anchor="middle" letter-spacing="8">RAMESHWOR CHAUDHARY</text>
      <text x="0" y="85" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="400" fill="rgba(255,255,255,0.4)" text-anchor="middle" letter-spacing="4">FULL-STACK &amp; AI ENGINEER</text>
    </g>
  </svg>
  `;

  const backPngBuffer = await sharp(Buffer.from(backSvg))
    .png({ compressionLevel: 8 })
    .toBuffer();

  console.log('✓ Prepared embedded textures:', {
    portrait: frontJpgBuffer.length + ' bytes',
    back: backPngBuffer.length + ' bytes'
  });

  // Mesh resolution: 128 columns x 192 rows for ultra-smooth surface
  const gridW = 128;
  const gridH = 192;
  const totalWidth = 6.4;
  const totalHeight = 9.6;
  const depthThickness = 0.38; // Clean, controlled 3D depth

  // 1. Generate Anatomically-Smooth Structural Depth Field (No noisy pixels!)
  const depthField = new Float32Array(gridW * gridH);

  for (let y = 0; y < gridH; y++) {
    const v = y / (gridH - 1); // 0 at top, 1 at bottom

    for (let x = 0; x < gridW; x++) {
      const u = x / (gridW - 1); // 0 at left, 1 at right
      const idx = y * gridW + x;

      // Base global gentle convex curve (portrait curves gracefully in 3D)
      const cxNorm = (u - 0.5) * 2.0; // -1 to 1
      const cyNorm = (v - 0.5) * 2.0;
      const baseArch = Math.max(0, 1.0 - Math.pow(Math.abs(cxNorm), 1.7)) * 0.22;

      // Smooth Head & Face Region (around u: 0.45-0.55, v: 0.22-0.45)
      const faceDx = (u - 0.49) / 0.18;
      const faceDy = (v - 0.32) / 0.16;
      const faceDistSq = faceDx * faceDx + faceDy * faceDy;
      let faceVol = 0;
      if (faceDistSq < 1.0) {
        faceVol = Math.cos(Math.sqrt(faceDistSq) * Math.PI * 0.5) * 0.26;
      }

      // Smooth Nose Bridge protrusion (u: ~0.49, v: ~0.33)
      const noseDx = (u - 0.49) / 0.05;
      const noseDy = (v - 0.33) / 0.08;
      const noseDistSq = noseDx * noseDx + noseDy * noseDy;
      let noseVol = 0;
      if (noseDistSq < 1.0) {
        noseVol = Math.cos(Math.sqrt(noseDistSq) * Math.PI * 0.5) * 0.12;
      }

      // Smooth Torso & Shoulder Chest Volume (u: 0.2-0.8, v: 0.55-0.95)
      const torsoDx = (u - 0.50) / 0.38;
      const torsoDy = (v - 0.75) / 0.25;
      const torsoDistSq = torsoDx * torsoDx + torsoDy * torsoDy;
      let torsoVol = 0;
      if (torsoDistSq < 1.0) {
        torsoVol = Math.cos(Math.sqrt(torsoDistSq) * Math.PI * 0.5) * 0.16;
      }

      // Combine smooth structural elements
      depthField[idx] = baseArch + faceVol + noseVol + torsoVol;
    }
  }

  // 2. Perform Gaussian Smoothing Pass to ensure 100% continuous curvature
  const smoothDepth = new Float32Array(gridW * gridH);
  const blurKernelRadius = 3;
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      let sum = 0;
      let weightSum = 0;
      for (let dy = -blurKernelRadius; dy <= blurKernelRadius; dy++) {
        for (let dx = -blurKernelRadius; dx <= blurKernelRadius; dx++) {
          const nx = Math.min(gridW - 1, Math.max(0, x + dx));
          const ny = Math.min(gridH - 1, Math.max(0, y + dy));
          const w = Math.exp(-(dx * dx + dy * dy) / (2 * 1.5 * 1.5));
          sum += depthField[ny * gridW + nx] * w;
          weightSum += w;
        }
      }
      smoothDepth[y * gridW + x] = sum / weightSum;
    }
  }

  // 3. Construct Front, Back, and Side Vertices
  const frontVerts = []; // x, y, z, nx, ny, nz, u, v
  const backVerts = [];
  const sideVerts = [];

  const frontIndices = [];
  const backIndices = [];
  const sideIndices = [];

  // Generate Front Surface
  for (let y = 0; y < gridH; y++) {
    const v = y / (gridH - 1);
    const worldY = (0.5 - v) * totalHeight;

    for (let x = 0; x < gridW; x++) {
      const u = x / (gridW - 1);
      const worldX = (u - 0.5) * totalWidth;
      const z = smoothDepth[y * gridW + x] * depthThickness;

      frontVerts.push(
        worldX, worldY, z + 0.05,
        0, 0, 1, // Normals calculated below
        u, v
      );
    }
  }

  // Triangulate Front Surface
  for (let y = 0; y < gridH - 1; y++) {
    for (let x = 0; x < gridW - 1; x++) {
      const i00 = y * gridW + x;
      const i10 = y * gridW + (x + 1);
      const i01 = (y + 1) * gridW + x;
      const i11 = (y + 1) * gridW + (x + 1);

      frontIndices.push(i00, i01, i10);
      frontIndices.push(i10, i01, i11);
    }
  }

  // Generate Back Surface (Clean planar/subtle reverse curvature for solid depth)
  for (let y = 0; y < gridH; y++) {
    const v = y / (gridH - 1);
    const worldY = (0.5 - v) * totalHeight;

    for (let x = 0; x < gridW; x++) {
      const u = x / (gridW - 1);
      const worldX = (u - 0.5) * totalWidth;
      const z = -depthThickness * 0.45; // Sleek backing plate

      backVerts.push(
        worldX, worldY, z,
        0, 0, -1,
        1.0 - u, v
      );
    }
  }

  // Triangulate Back Surface (Facing backwards)
  for (let y = 0; y < gridH - 1; y++) {
    for (let x = 0; x < gridW - 1; x++) {
      const i00 = y * gridW + x;
      const i10 = y * gridW + (x + 1);
      const i01 = (y + 1) * gridW + x;
      const i11 = (y + 1) * gridW + (x + 1);

      backIndices.push(i00, i10, i01);
      backIndices.push(i10, i11, i01);
    }
  }

  // 4. Compute Smooth Analytical Normals for Front & Back
  function computeNormals(verts, indices) {
    const vCount = verts.length / 8;
    const nx = new Float32Array(vCount);
    const ny = new Float32Array(vCount);
    const nz = new Float32Array(vCount);

    for (let i = 0; i < indices.length; i += 3) {
      const iA = indices[i];
      const iB = indices[i + 1];
      const iC = indices[i + 2];

      const ax = verts[iA * 8 + 0], ay = verts[iA * 8 + 1], az = verts[iA * 8 + 2];
      const bx = verts[iB * 8 + 0], by = verts[iB * 8 + 1], bz = verts[iB * 8 + 2];
      const cx = verts[iC * 8 + 0], cy = verts[iC * 8 + 1], cz = verts[iC * 8 + 2];

      const abx = bx - ax, aby = by - ay, abz = bz - az;
      const acx = cx - ax, acy = cy - ay, acz = cz - az;

      const crossX = aby * acz - abz * acy;
      const crossY = abz * acx - abx * acz;
      const crossZ = abx * acy - aby * acx;

      nx[iA] += crossX; ny[iA] += crossY; nz[iA] += crossZ;
      nx[iB] += crossX; ny[iB] += crossY; nz[iB] += crossZ;
      nx[iC] += crossX; ny[iC] += crossY; nz[iC] += crossZ;
    }

    for (let i = 0; i < vCount; i++) {
      let l = Math.sqrt(nx[i] * nx[i] + ny[i] * ny[i] + nz[i] * nz[i]);
      if (l < 1e-6) l = 1;
      verts[i * 8 + 3] = nx[i] / l;
      verts[i * 8 + 4] = ny[i] / l;
      verts[i * 8 + 5] = nz[i] / l;
    }
  }

  computeNormals(frontVerts, frontIndices);
  computeNormals(backVerts, backIndices);

  // 5. Construct Clean Side Bevel / Extrusion Wall around the 4 borders
  function addSideQuad(p1Front, p2Front, p2Back, p1Back, norm) {
    const startIdx = sideVerts.length / 8;
    sideVerts.push(
      p1Front[0], p1Front[1], p1Front[2], norm[0], norm[1], norm[2], 0, 0,
      p2Front[0], p2Front[1], p2Front[2], norm[0], norm[1], norm[2], 1, 0,
      p2Back[0], p2Back[1], p2Back[2], norm[0], norm[1], norm[2], 1, 1,
      p1Back[0], p1Back[1], p1Back[2], norm[0], norm[1], norm[2], 0, 1
    );
    sideIndices.push(startIdx, startIdx + 1, startIdx + 2);
    sideIndices.push(startIdx, startIdx + 2, startIdx + 3);
  }

  // Top Edge
  for (let x = 0; x < gridW - 1; x++) {
    const iA = 0 * gridW + x;
    const iB = 0 * gridW + (x + 1);
    const pF_A = [frontVerts[iA * 8], frontVerts[iA * 8 + 1], frontVerts[iA * 8 + 2]];
    const pF_B = [frontVerts[iB * 8], frontVerts[iB * 8 + 1], frontVerts[iB * 8 + 2]];
    const pB_A = [backVerts[iA * 8], backVerts[iA * 8 + 1], backVerts[iA * 8 + 2]];
    const pB_B = [backVerts[iB * 8], backVerts[iB * 8 + 1], backVerts[iB * 8 + 2]];
    addSideQuad(pF_A, pF_B, pB_B, pB_A, [0, 1, 0]);
  }

  // Bottom Edge
  for (let x = 0; x < gridW - 1; x++) {
    const iA = (gridH - 1) * gridW + (x + 1);
    const iB = (gridH - 1) * gridW + x;
    const pF_A = [frontVerts[iA * 8], frontVerts[iA * 8 + 1], frontVerts[iA * 8 + 2]];
    const pF_B = [frontVerts[iB * 8], frontVerts[iB * 8 + 1], frontVerts[iB * 8 + 2]];
    const pB_A = [backVerts[iA * 8], backVerts[iA * 8 + 1], backVerts[iA * 8 + 2]];
    const pB_B = [backVerts[iB * 8], backVerts[iB * 8 + 1], backVerts[iB * 8 + 2]];
    addSideQuad(pF_A, pF_B, pB_B, pB_A, [0, -1, 0]);
  }

  // Left Edge
  for (let y = 0; y < gridH - 1; y++) {
    const iA = (y + 1) * gridW + 0;
    const iB = y * gridW + 0;
    const pF_A = [frontVerts[iA * 8], frontVerts[iA * 8 + 1], frontVerts[iA * 8 + 2]];
    const pF_B = [frontVerts[iB * 8], frontVerts[iB * 8 + 1], frontVerts[iB * 8 + 2]];
    const pB_A = [backVerts[iA * 8], backVerts[iA * 8 + 1], backVerts[iA * 8 + 2]];
    const pB_B = [backVerts[iB * 8], backVerts[iB * 8 + 1], backVerts[iB * 8 + 2]];
    addSideQuad(pF_A, pF_B, pB_B, pB_A, [-1, 0, 0]);
  }

  // Right Edge
  for (let y = 0; y < gridH - 1; y++) {
    const iA = y * gridW + (gridW - 1);
    const iB = (y + 1) * gridW + (gridW - 1);
    const pF_A = [frontVerts[iA * 8], frontVerts[iA * 8 + 1], frontVerts[iA * 8 + 2]];
    const pF_B = [frontVerts[iB * 8], frontVerts[iB * 8 + 1], frontVerts[iB * 8 + 2]];
    const pB_A = [backVerts[iA * 8], backVerts[iA * 8 + 1], backVerts[iA * 8 + 2]];
    const pB_B = [backVerts[iB * 8], backVerts[iB * 8 + 1], backVerts[iB * 8 + 2]];
    addSideQuad(pF_A, pF_B, pB_B, pB_A, [1, 0, 0]);
  }

  console.log(`✓ Clean 3D Mesh Geometry:`, {
    frontVertices: frontVerts.length / 8,
    frontTriangles: frontIndices.length / 3,
    backVertices: backVerts.length / 8,
    backTriangles: backIndices.length / 3,
    sideVertices: sideVerts.length / 8,
    sideTriangles: sideIndices.length / 3
  });

  // 6. Assemble glTF 2.0 Binary Chunks
  function packGeometry(verts, indices) {
    const vCount = verts.length / 8;
    const pos = Buffer.alloc(vCount * 3 * 4);
    const norm = Buffer.alloc(vCount * 3 * 4);
    const uv = Buffer.alloc(vCount * 2 * 4);
    const idx = Buffer.alloc(indices.length * 2);

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < vCount; i++) {
      const x = verts[i * 8 + 0], y = verts[i * 8 + 1], z = verts[i * 8 + 2];
      const nx = verts[i * 8 + 3], ny = verts[i * 8 + 4], nz = verts[i * 8 + 5];
      const u = verts[i * 8 + 6], v = verts[i * 8 + 7];

      minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);

      pos.writeFloatLE(x, i * 12 + 0);
      pos.writeFloatLE(y, i * 12 + 4);
      pos.writeFloatLE(z, i * 12 + 8);

      norm.writeFloatLE(nx, i * 12 + 0);
      norm.writeFloatLE(ny, i * 12 + 4);
      norm.writeFloatLE(nz, i * 12 + 8);

      uv.writeFloatLE(u, i * 8 + 0);
      uv.writeFloatLE(v, i * 8 + 4);
    }

    for (let i = 0; i < indices.length; i++) {
      idx.writeUInt16LE(indices[i], i * 2);
    }

    return { pos, norm, uv, idx, vCount, iCount: indices.length, bounds: { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] } };
  }

  const gFront = packGeometry(frontVerts, frontIndices);
  const gBack = packGeometry(backVerts, backIndices);
  const gSide = packGeometry(sideVerts, sideIndices);

  const binChunks = [];
  const bufferViews = [];
  const accessors = [];

  function appendBuffer(buf, target) {
    let offset = binChunks.reduce((acc, c) => acc + c.length, 0);
    const pad = (4 - (offset % 4)) % 4;
    if (pad > 0) {
      binChunks.push(Buffer.alloc(pad));
      offset += pad;
    }
    binChunks.push(buf);
    const viewIdx = bufferViews.length;
    const viewObj = { buffer: 0, byteOffset: offset, byteLength: buf.length };
    if (target) viewObj.target = target;
    bufferViews.push(viewObj);
    return viewIdx;
  }

  // Front submesh
  const bvF_Idx = appendBuffer(gFront.idx, 34963);
  const bvF_Pos = appendBuffer(gFront.pos, 34962);
  const bvF_Norm = appendBuffer(gFront.norm, 34962);
  const bvF_Uv = appendBuffer(gFront.uv, 34962);

  const accF_Idx = accessors.length;
  accessors.push({ bufferView: bvF_Idx, byteOffset: 0, componentType: 5123, count: gFront.iCount, type: 'SCALAR' });
  const accF_Pos = accessors.length;
  accessors.push({ bufferView: bvF_Pos, byteOffset: 0, componentType: 5126, count: gFront.vCount, type: 'VEC3', max: gFront.bounds.max, min: gFront.bounds.min });
  const accF_Norm = accessors.length;
  accessors.push({ bufferView: bvF_Norm, byteOffset: 0, componentType: 5126, count: gFront.vCount, type: 'VEC3' });
  const accF_Uv = accessors.length;
  accessors.push({ bufferView: bvF_Uv, byteOffset: 0, componentType: 5126, count: gFront.vCount, type: 'VEC2' });

  // Back submesh
  const bvB_Idx = appendBuffer(gBack.idx, 34963);
  const bvB_Pos = appendBuffer(gBack.pos, 34962);
  const bvB_Norm = appendBuffer(gBack.norm, 34962);
  const bvB_Uv = appendBuffer(gBack.uv, 34962);

  const accB_Idx = accessors.length;
  accessors.push({ bufferView: bvB_Idx, byteOffset: 0, componentType: 5123, count: gBack.iCount, type: 'SCALAR' });
  const accB_Pos = accessors.length;
  accessors.push({ bufferView: bvB_Pos, byteOffset: 0, componentType: 5126, count: gBack.vCount, type: 'VEC3', max: gBack.bounds.max, min: gBack.bounds.min });
  const accB_Norm = accessors.length;
  accessors.push({ bufferView: bvB_Norm, byteOffset: 0, componentType: 5126, count: gBack.vCount, type: 'VEC3' });
  const accB_Uv = accessors.length;
  accessors.push({ bufferView: bvB_Uv, byteOffset: 0, componentType: 5126, count: gBack.vCount, type: 'VEC2' });

  // Side rim submesh
  const bvS_Idx = appendBuffer(gSide.idx, 34963);
  const bvS_Pos = appendBuffer(gSide.pos, 34962);
  const bvS_Norm = appendBuffer(gSide.norm, 34962);
  const bvS_Uv = appendBuffer(gSide.uv, 34962);

  const accS_Idx = accessors.length;
  accessors.push({ bufferView: bvS_Idx, byteOffset: 0, componentType: 5123, count: gSide.iCount, type: 'SCALAR' });
  const accS_Pos = accessors.length;
  accessors.push({ bufferView: bvS_Pos, byteOffset: 0, componentType: 5126, count: gSide.vCount, type: 'VEC3', max: gSide.bounds.max, min: gSide.bounds.min });
  const accS_Norm = accessors.length;
  accessors.push({ bufferView: bvS_Norm, byteOffset: 0, componentType: 5126, count: gSide.vCount, type: 'VEC3' });
  const accS_Uv = accessors.length;
  accessors.push({ bufferView: bvS_Uv, byteOffset: 0, componentType: 5126, count: gSide.vCount, type: 'VEC2' });

  // EMBEDDED IMAGES (Front Portrait JPEG & Back Chassis PNG)
  const bvImgFront = appendBuffer(frontJpgBuffer);
  const bvImgBack = appendBuffer(backPngBuffer);

  const totalBin = Buffer.concat(binChunks);

  // glTF Definition
  const gltf = {
    asset: { version: '2.0', generator: 'Rameshwor-Clean-3D-Portrait-Engine' },
    scene: 0,
    scenes: [{ name: 'RameshworPortraitScene', nodes: [0] }],
    nodes: [{ name: 'Rameshwor3DPortrait', mesh: 0, rotation: [0, 0, 0, 1] }],
    meshes: [
      {
        name: 'Realistic3DPortraitReliefMesh',
        primitives: [
          // 0: Front Realistic Portrait Surface
          {
            attributes: { POSITION: accF_Pos, NORMAL: accF_Norm, TEXCOORD_0: accF_Uv },
            indices: accF_Idx,
            material: 0
          },
          // 1: Back Elegant Chassis
          {
            attributes: { POSITION: accB_Pos, NORMAL: accB_Norm, TEXCOORD_0: accB_Uv },
            indices: accB_Idx,
            material: 1
          },
          // 2: Side Chamfer Perimeter Edge
          {
            attributes: { POSITION: accS_Pos, NORMAL: accS_Norm, TEXCOORD_0: accS_Uv },
            indices: accS_Idx,
            material: 2
          }
        ]
      }
    ],
    materials: [
      // 0: Front Portrait Material (Natural, smooth, cinematic PBR without harsh noise)
      {
        name: 'RameshworPortraitPBR',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0.05,
          roughnessFactor: 0.45
        },
        emissiveFactor: [0.08, 0.08, 0.08],
        doubleSided: false
      },
      // 1: Back Chassis Material
      {
        name: 'RameshworBackChassisPBR',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 1 },
          metallicFactor: 0.75,
          roughnessFactor: 0.35
        },
        emissiveFactor: [0.0, 0.15, 0.08],
        doubleSided: false
      },
      // 2: Side Rim Material (Sleek dark titanium bevel)
      {
        name: 'DarkTitaniumBevel',
        pbrMetallicRoughness: {
          baseColorFactor: [0.08, 0.10, 0.14, 1.0],
          metallicFactor: 0.90,
          roughnessFactor: 0.20
        },
        emissiveFactor: [0.0, 0.20, 0.10],
        doubleSided: true
      }
    ],
    textures: [
      { sampler: 0, source: 0 },
      { sampler: 0, source: 1 }
    ],
    images: [
      { bufferView: bvImgFront, mimeType: 'image/jpeg', name: 'Rameshwor_Portrait_Embedded' },
      { bufferView: bvImgBack, mimeType: 'image/png', name: 'Rameshwor_Back_Embedded' }
    ],
    samplers: [
      { magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }
    ],
    accessors,
    bufferViews,
    buffers: [{ byteLength: totalBin.length }]
  };

  // Pack GLB
  const jsonStr = JSON.stringify(gltf);
  let jsonBuffer = Buffer.from(jsonStr, 'utf8');
  const jsonPad = (4 - (jsonBuffer.length % 4)) % 4;
  if (jsonPad > 0) jsonBuffer = Buffer.concat([jsonBuffer, Buffer.from(' '.repeat(jsonPad), 'utf8')]);

  const binPad = (4 - (totalBin.length % 4)) % 4;
  const finalBin = binPad > 0 ? Buffer.concat([totalBin, Buffer.alloc(binPad)]) : totalBin;

  const totalLength = 12 + (8 + jsonBuffer.length) + (8 + finalBin.length);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // "glTF"
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // "JSON"

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(finalBin.length, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // "BIN\0"

  const glbBuffer = Buffer.concat([
    header,
    jsonChunkHeader,
    jsonBuffer,
    binChunkHeader,
    finalBin
  ]);

  const outputPath = path.join(MODELS_DIR, 'rameshwor-portrait-3d.glb');
  fs.writeFileSync(outputPath, glbBuffer);
  console.log(`\n======================================================`);
  console.log(`✅ SUCCESS: Clean, Realistic 3D Portrait Model Generated!`);
  console.log(`📁 File: ${outputPath}`);
  console.log(`📊 Size: ${(glbBuffer.length / 1024).toFixed(1)} KB`);
  console.log(`🔒 Self-Contained GLB with 100% smooth, natural facial proportions`);
  console.log(`======================================================\n`);
}

generateCleanRealistic3DPortrait().catch(console.error);
