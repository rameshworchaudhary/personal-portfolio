import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import * as THREE from 'three';

const MODELS_DIR = path.resolve('public/models');
fs.mkdirSync(MODELS_DIR, { recursive: true });

async function createStandaloneGlb() {
  console.log('Building self-contained rameshwor-portrait-3d.glb with EMBEDDED textures...');

  // 1. Load the authentic portrait of Rameshwor Chaudhary
  const srcPortrait = path.resolve('rameshwor_hero.jpeg');
  
  // Create optimized high-quality embedded front portrait image (JPG format for efficient embedded GLB size)
  const frontJpgBuffer = await sharp(srcPortrait)
    .resize(1024, 1536, { fit: 'cover' })
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toBuffer();
  console.log('✓ Prepared embedded front portrait texture:', frontJpgBuffer.length, 'bytes');

  // 2. Create high-tech back neural chassis plate (PNG format for crisp vector graphics)
  const backSvg = `
  <svg width="1024" height="1536" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#07090d"/>
        <stop offset="50%" stop-color="#0f131a"/>
        <stop offset="100%" stop-color="#050608"/>
      </linearGradient>
      <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f076"/>
        <stop offset="100%" stop-color="#38bdf8"/>
      </linearGradient>
      <radialGradient id="centerGlow" cx="50%" cy="42%" r="55%">
        <stop offset="0%" stop-color="#00f076" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <rect width="1024" height="1536" fill="url(#bgGrad)"/>
    <rect width="1024" height="1536" fill="url(#centerGlow)"/>

    <!-- Outer Precision Border -->
    <rect x="32" y="32" width="960" height="1472" rx="24" fill="none" stroke="#1f2937" stroke-width="3"/>
    <rect x="48" y="48" width="928" height="1440" rx="16" fill="none" stroke="#00f076" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="12 8"/>

    <!-- Circuit Spine & Network Matrix -->
    <g stroke="#00f076" stroke-opacity="0.35" stroke-width="2.5" fill="none">
      <line x1="512" y1="90" x2="512" y2="1440" stroke-dasharray="12 8"/>
      <path d="M 160 320 H 420 L 512 412 H 680 L 760 492 H 880"/>
      <path d="M 880 720 H 640 L 512 848 H 360 L 260 948 H 140"/>
      <path d="M 220 1140 H 440 L 512 1212 H 780"/>

      <circle cx="512" cy="412" r="8" fill="#00f076" fill-opacity="0.8"/>
      <circle cx="512" cy="848" r="8" fill="#00f076" fill-opacity="0.8"/>
      <circle cx="512" cy="1212" r="8" fill="#00f076" fill-opacity="0.8"/>
    </g>

    <!-- Central High-Tech Medallion Core -->
    <circle cx="512" cy="580" r="160" fill="#0c1017" stroke="#1f293d" stroke-width="18"/>
    <circle cx="512" cy="580" r="142" fill="none" stroke="url(#emeraldGrad)" stroke-width="4" stroke-dasharray="16 10"/>
    <circle cx="512" cy="580" r="100" fill="#080a0f" stroke="#00f076" stroke-width="3"/>

    <!-- Monogram Identity -->
    <text x="512" y="605" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="72" font-weight="900" fill="#ffffff" letter-spacing="6">RC</text>

    <!-- Engineering Typography -->
    <text x="512" y="850" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="700" fill="#00f076" letter-spacing="8">AI &amp; FULL-STACK ARCHITECT</text>
    <text x="512" y="910" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="42" font-weight="800" fill="#ffffff" letter-spacing="3">RAMESHWOR CHAUDHARY</text>
    <text x="512" y="970" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="16" fill="#9ca3af" letter-spacing="4">NEURAL MATRIX · THREE.JS · WEBGL 2.0</text>
    <text x="512" y="1020" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" fill="#00f076" fill-opacity="0.6" letter-spacing="6">AUTONOMOUS EMBEDDED 3D CORE</text>
  </svg>
  `;

  const backPngBuffer = await sharp(Buffer.from(backSvg))
    .png({ compressionLevel: 8 })
    .toBuffer();
  console.log('✓ Prepared embedded back texture:', backPngBuffer.length, 'bytes');

  // 3. Construct 3D Geometry with Full-Screen Volumetric Curvature
  // Grid resolution for smooth convex relief
  const cols = 56;
  const rows = 72;
  const width = 6.4;   // Expansive full-screen width
  const height = 9.6;  // Expansive full-screen height
  const depth = 0.52;  // Volumetric physical depth
  const halfW = width / 2;
  const halfH = height / 2;
  const halfD = depth / 2;

  // ── SUBMESH 1: Front Volumetric Curved Mesh ──
  const frontVerts = []; // x, y, z, nx, ny, nz, u, v
  const frontIndices = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const y = halfH - v * height;

    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const x = -halfW + u * width;

      // Calculate anatomical 3D relief
      const nxNorm = (u - 0.5) * 2; // -1 to 1
      const nyNorm = (v - 0.5) * 2; // -1 to 1

      // Convex torso curvature
      const torsoCurve = Math.max(0, 1.0 - Math.pow(Math.abs(nxNorm), 1.7)) * 0.28;

      // Facial feature elevation (top-center area)
      const faceDx = (u - 0.5) / 0.28;
      const faceDy = (v - 0.28) / 0.24;
      const faceDistSq = faceDx * faceDx + faceDy * faceDy;
      let faceElevation = 0;
      if (faceDistSq < 1.0) {
        faceElevation = Math.cos(Math.sqrt(faceDistSq) * Math.PI * 0.5) * 0.32;
      }

      const z = halfD + torsoCurve + faceElevation;

      // Estimated normals
      const dZdx = (nxNorm > 0 ? -1 : 1) * Math.abs(nxNorm) * 0.25;
      const dZdy = (nyNorm > 0 ? -1 : 1) * Math.abs(nyNorm) * 0.15;
      const normLen = Math.sqrt(dZdx * dZdx + dZdy * dZdy + 1.0);

      frontVerts.push(
        x, y, z,
        -dZdx / normLen, -dZdy / normLen, 1.0 / normLen,
        u, v
      );
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p1 = r * (cols + 1) + c;
      const p2 = r * (cols + 1) + (c + 1);
      const p3 = (r + 1) * (cols + 1) + c;
      const p4 = (r + 1) * (cols + 1) + (c + 1);

      frontIndices.push(p1, p3, p2);
      frontIndices.push(p2, p3, p4);
    }
  }

  // ── SUBMESH 2: Back Curved Chassis Mesh ──
  const backVerts = [];
  const backIndices = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const y = halfH - v * height;

    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const x = halfW - u * width; // Flipped horizontally for back view

      const nxNorm = (u - 0.5) * 2;
      const torsoCurve = Math.max(0, 1.0 - Math.pow(Math.abs(nxNorm), 1.8)) * 0.12;
      const z = -halfD - torsoCurve;

      backVerts.push(
        x, y, z,
        0, 0, -1,
        u, v
      );
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p1 = r * (cols + 1) + c;
      const p2 = r * (cols + 1) + (c + 1);
      const p3 = (r + 1) * (cols + 1) + c;
      const p4 = (r + 1) * (cols + 1) + (c + 1);

      backIndices.push(p1, p3, p2);
      backIndices.push(p2, p3, p4);
    }
  }

  // ── SUBMESH 3: Beveled Titanium Perimeter Rim ──
  const casingVerts = [];
  const casingIndices = [];

  function addSideQuad(p1, p2, p3, p4, norm) {
    const startIdx = casingVerts.length / 8;
    casingVerts.push(
      p1[0], p1[1], p1[2], norm[0], norm[1], norm[2], 0, 0,
      p2[0], p2[1], p2[2], norm[0], norm[1], norm[2], 1, 0,
      p3[0], p3[1], p3[2], norm[0], norm[1], norm[2], 1, 1,
      p4[0], p4[1], p4[2], norm[0], norm[1], norm[2], 0, 1
    );
    casingIndices.push(startIdx, startIdx + 2, startIdx + 1, startIdx, startIdx + 3, startIdx + 2);
  }

  const bevel = 0.14;
  // Right edge
  addSideQuad([halfW + bevel, halfH, halfD - bevel], [halfW + bevel, halfH, -halfD + bevel], [halfW + bevel, -halfH, -halfD + bevel], [halfW + bevel, -halfH, halfD - bevel], [1, 0, 0]);
  // Left edge
  addSideQuad([-halfW - bevel, halfH, -halfD + bevel], [-halfW - bevel, halfH, halfD - bevel], [-halfW - bevel, -halfH, halfD - bevel], [-halfW - bevel, -halfH, -halfD + bevel], [-1, 0, 0]);
  // Top edge
  addSideQuad([-halfW, halfH + bevel, -halfD + bevel], [halfW, halfH + bevel, -halfD + bevel], [halfW, halfH + bevel, halfD - bevel], [-halfW, halfH + bevel, halfD - bevel], [0, 1, 0]);
  // Bottom edge
  addSideQuad([-halfW, -halfH - bevel, halfD - bevel], [halfW, -halfH - bevel, halfD - bevel], [halfW, -halfH - bevel, -halfD + bevel], [-halfW, -halfH - bevel, -halfD + bevel], [0, -1, 0]);

  // Front Bevels
  addSideQuad([-halfW, halfH, halfD], [halfW, halfH, halfD], [halfW, halfH + bevel, halfD - bevel], [-halfW, halfH + bevel, halfD - bevel], [0, 0.707, 0.707]);
  addSideQuad([-halfW, -halfH - bevel, halfD - bevel], [halfW, -halfH - bevel, halfD - bevel], [halfW, -halfH, halfD], [-halfW, -halfH, halfD], [0, -0.707, 0.707]);
  addSideQuad([halfW, halfH, halfD], [halfW + bevel, halfH, halfD - bevel], [halfW + bevel, -halfH, halfD - bevel], [halfW, -halfH, halfD], [0.707, 0, 0.707]);
  addSideQuad([-halfW - bevel, halfH, halfD - bevel], [-halfW, halfH, halfD], [-halfW, -halfH, halfD], [-halfW - bevel, -halfH, halfD - bevel], [-0.707, 0, 0.707]);

  // Back Bevels
  addSideQuad([halfW, halfH, -halfD], [-halfW, halfH, -halfD], [-halfW, halfH + bevel, -halfD + bevel], [halfW, halfH + bevel, -halfD + bevel], [0, 0.707, -0.707]);
  addSideQuad([halfW, -halfH, -halfD], [-halfW, -halfH, -halfD], [-halfW, -halfH - bevel, -halfD + bevel], [halfW, -halfH - bevel, -halfD + bevel], [0, -0.707, -0.707]);
  addSideQuad([halfW + bevel, halfH, -halfD + bevel], [halfW, halfH, -halfD], [halfW, -halfH, -halfD], [halfW + bevel, -halfH, -halfD + bevel], [0.707, 0, -0.707]);
  addSideQuad([-halfW, halfH, -halfD], [-halfW - bevel, halfH, -halfD + bevel], [-halfW - bevel, -halfH, -halfD + bevel], [-halfW, -halfH, -halfD], [-0.707, 0, -0.707]);

  // Helper to pack vertex arrays into binary buffers
  function createGeometryBuffers(verts, indices) {
    const vertexCount = verts.length / 8;
    const posBuffer = Buffer.alloc(vertexCount * 3 * 4);
    const normBuffer = Buffer.alloc(vertexCount * 3 * 4);
    const uvBuffer = Buffer.alloc(vertexCount * 2 * 4);
    const idxBuffer = Buffer.alloc(indices.length * 2);

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < vertexCount; i++) {
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
      vertexCount,
      indexCount: indices.length,
      bounds: { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] }
    };
  }

  const gFront = createGeometryBuffers(frontVerts, frontIndices);
  const gBack = createGeometryBuffers(backVerts, backIndices);
  const gCasing = createGeometryBuffers(casingVerts, casingIndices);

  // 4. Assemble Binary Chunk with Strict 4-Byte Alignment
  const bufferChunks = [];
  const bufferViews = [];
  const accessors = [];

  function appendBuffer(buf, target) {
    let curOffset = bufferChunks.reduce((acc, c) => acc + c.length, 0);
    const pad = (4 - (curOffset % 4)) % 4;
    if (pad > 0) {
      bufferChunks.push(Buffer.alloc(pad));
      curOffset += pad;
    }
    bufferChunks.push(buf);
    const viewIndex = bufferViews.length;
    const viewObj = {
      buffer: 0,
      byteOffset: curOffset,
      byteLength: buf.length
    };
    if (target) viewObj.target = target;
    bufferViews.push(viewObj);
    return viewIndex;
  }

  // Add Front buffers
  const bvFrontIdx = appendBuffer(gFront.idxBuffer, 34963);
  const bvFrontPos = appendBuffer(gFront.posBuffer, 34962);
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

  // Add Back buffers
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

  // Add Casing buffers
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

  // Add EMBEDDED Image Buffers into the BIN chunk
  const bvFrontImg = appendBuffer(frontJpgBuffer);
  const bvBackImg = appendBuffer(backPngBuffer);

  const totalBinBuffer = Buffer.concat(bufferChunks);

  // 5. glTF 2.0 Specification Definition
  const gltfJson = {
    asset: {
      version: '2.0',
      generator: 'Rameshwor-Chaudhary-3D-Engine'
    },
    scene: 0,
    scenes: [
      {
        name: 'RameshworPortraitScene',
        nodes: [0]
      }
    ],
    nodes: [
      {
        name: 'RameshworPortraitMesh',
        mesh: 0,
        rotation: [0, 0, 0, 1]
      }
    ],
    meshes: [
      {
        name: 'VolumetricSculpture',
        primitives: [
          // Front Portrait (Uses embedded portrait image 0)
          {
            attributes: {
              POSITION: accFrontPos,
              NORMAL: accFrontNorm,
              TEXCOORD_0: accFrontUv
            },
            indices: accFrontIdx,
            material: 0
          },
          // Back Neural Chassis (Uses embedded back image 1)
          {
            attributes: {
              POSITION: accBackPos,
              NORMAL: accBackNorm,
              TEXCOORD_0: accBackUv
            },
            indices: accBackIdx,
            material: 1
          },
          // Beveled Titanium Emerald Edge
          {
            attributes: {
              POSITION: accCasingPos,
              NORMAL: accCasingNorm,
              TEXCOORD_0: accCasingUv
            },
            indices: accCasingIdx,
            material: 2
          }
        ]
      }
    ],
    materials: [
      // 0: Front Portrait Material
      {
        name: 'FrontPortraitPBR',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0.08,
          roughnessFactor: 0.28
        },
        emissiveFactor: [0.06, 0.06, 0.06],
        doubleSided: false
      },
      // 1: Back AI Chassis Material
      {
        name: 'BackChassisPBR',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 1 },
          metallicFactor: 0.75,
          roughnessFactor: 0.24
        },
        emissiveFactor: [0.0, 0.22, 0.12],
        doubleSided: false
      },
      // 2: Titanium Chamfer Casing
      {
        name: 'TitaniumEmeraldBevel',
        pbrMetallicRoughness: {
          baseColorFactor: [0.08, 0.11, 0.16, 1.0],
          metallicFactor: 0.94,
          roughnessFactor: 0.16
        },
        emissiveFactor: [0.0, 0.35, 0.18],
        doubleSided: true
      }
    ],
    textures: [
      { sampler: 0, source: 0 },
      { sampler: 0, source: 1 }
    ],
    images: [
      // EMBEDDED INSIDE GLB BIN BUFFER - NO EXTERNAL ASSETS NEEDED
      { bufferView: bvFrontImg, mimeType: 'image/jpeg', name: 'Rameshwor_Portrait_Embedded' },
      { bufferView: bvBackImg, mimeType: 'image/png', name: 'Rameshwor_BackChassis_Embedded' }
    ],
    samplers: [
      { magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }
    ],
    accessors,
    bufferViews,
    buffers: [
      { byteLength: totalBinBuffer.length }
    ]
  };

  // 6. Pack into GLB Binary Format
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
  header.writeUInt32LE(0x46546C67, 0); // "glTF" magic
  header.writeUInt32LE(2, 4);          // version 2
  header.writeUInt32LE(totalLength, 8);// total file length

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

  const outputPath = path.join(MODELS_DIR, 'rameshwor-portrait-3d.glb');
  fs.writeFileSync(outputPath, glbBuffer);
  console.log(`✅ SUCCESS: Exported self-contained GLB to ${outputPath}`);
  console.log(`📊 GLB File Size: ${(glbBuffer.length / 1024).toFixed(1)} KB`);
  console.log(`🔒 Embedded Images: Front Portrait JPEG (${frontJpgBuffer.length} bytes) + Back Chassis PNG (${backPngBuffer.length} bytes)`);
}

createStandaloneGlb().catch(console.error);
