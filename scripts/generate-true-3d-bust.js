import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import * as THREE from 'three';

const MODELS_DIR = path.resolve('public/models');
fs.mkdirSync(MODELS_DIR, { recursive: true });

async function generateTrue3DBust() {
  console.log('⚡ Generating genuine Image-to-3D Volumetric Sculptural Bust for Rameshwor Chaudhary...');

  const srcPortraitPath = path.resolve('rameshwor_hero.jpeg');
  const cutoutPath = path.resolve('public/models/rameshwor-cutout.png');
  const depthPath = path.resolve('public/models/rameshwor-depth.png');
  const normalPath = path.resolve('public/models/rameshwor-normal.png');
  const backPath = path.resolve('public/models/rameshwor-back.png');

  // Load image buffers for embedding directly in the GLB
  const frontJpgBuffer = await sharp(srcPortraitPath)
    .resize(1024, 1536, { fit: 'cover' })
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toBuffer();

  const backPngBuffer = await sharp(backPath)
    .resize(1024, 1536, { fit: 'cover' })
    .png({ compressionLevel: 8 })
    .toBuffer();

  const normalPngBuffer = await sharp(normalPath)
    .resize(1024, 1536, { fit: 'cover' })
    .png({ compressionLevel: 8 })
    .toBuffer();

  console.log('✓ Prepared embedded textures:', {
    portrait: frontJpgBuffer.length + ' bytes',
    back: backPngBuffer.length + ' bytes',
    normal: normalPngBuffer.length + ' bytes'
  });

  // Sample mask & depth at high resolution grid
  const gridW = 96;
  const gridH = 144;

  const cutoutRaw = await sharp(cutoutPath)
    .resize(gridW, gridH, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const depthRaw = await sharp(depthPath)
    .resize(gridW, gridH, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalWidth = 6.4;
  const totalHeight = 9.6;
  const depthScale = 0.95; // Real 3D depth protrusion

  // 1. Build Grid State Matrix
  const alphaMap = new Float32Array(gridW * gridH);
  const depthMap = new Float32Array(gridW * gridH);
  const isValid = new Uint8Array(gridW * gridH);

  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const idx = y * gridW + x;
      const a = cutoutRaw.data[idx * 4 + 3] / 255.0;
      const d = depthRaw.data[idx] / 255.0;

      alphaMap[idx] = a;
      depthMap[idx] = d;
      // Valid if sufficiently inside the person silhouette
      isValid[idx] = a > 0.12 ? 1 : 0;
    }
  }

  // 2. Create Front & Back Vertices
  // Map (x, y) to 3D world coordinates
  const frontVerts = []; // x, y, z, nx, ny, nz, u, v
  const backVerts = [];
  const sideVerts = [];

  const frontIndices = [];
  const backIndices = [];
  const sideIndices = [];

  const frontGridIndices = new Int32Array(gridW * gridH).fill(-1);
  const backGridIndices = new Int32Array(gridW * gridH).fill(-1);

  // Generate Front and Back Mesh Vertices for all valid nodes
  for (let y = 0; y < gridH; y++) {
    const v = y / (gridH - 1);
    const worldY = (0.5 - v) * totalHeight;

    for (let x = 0; x < gridW; x++) {
      const u = x / (gridW - 1);
      const worldX = (u - 0.5) * totalWidth;
      const idx = y * gridW + x;

      if (!isValid[idx]) continue;

      const d = depthMap[idx];
      const a = alphaMap[idx];

      // Anatomical depth formula for true volumetric 3D bust form
      // Center curve
      const cxNorm = (u - 0.5) * 2.0;
      const convexArch = Math.max(0, 1.0 - Math.pow(Math.abs(cxNorm), 1.6)) * 0.45;

      // Facial Protrusion (upper center)
      const faceDx = (u - 0.5) / 0.24;
      const faceDy = (v - 0.32) / 0.22;
      const faceRsq = faceDx * faceDx + faceDy * faceDy;
      let faceVol = 0;
      if (faceRsq < 1.0) {
        faceVol = Math.cos(Math.sqrt(faceRsq) * Math.PI * 0.5) * 0.55;
      }

      const zFront = 0.25 + d * depthScale * 0.65 + convexArch + faceVol;
      const zBack = -(0.25 + (d * 0.35 + convexArch * 0.4));

      // Front Vertex
      const fIdx = frontVerts.length / 8;
      frontGridIndices[idx] = fIdx;
      frontVerts.push(
        worldX, worldY, zFront,
        0, 0, 1, // Normals recomputed later
        u, v
      );

      // Back Vertex
      const bIdx = backVerts.length / 8;
      backGridIndices[idx] = bIdx;
      backVerts.push(
        worldX, worldY, zBack,
        0, 0, -1,
        1.0 - u, v // Flipped U for back texture
      );
    }
  }

  // 3. Triangulate Front and Back surfaces & identify Boundary Edges
  // A cell (x, y) forms quads if all 4 corners exist
  const boundaryEdges = []; // array of { p1: [x1, y1], p2: [x2, y2], idx1, idx2 }

  for (let y = 0; y < gridH - 1; y++) {
    for (let x = 0; x < gridW - 1; x++) {
      const i00 = y * gridW + x;
      const i10 = y * gridW + (x + 1);
      const i01 = (y + 1) * gridW + x;
      const i11 = (y + 1) * gridW + (x + 1);

      const v00 = isValid[i00];
      const v10 = isValid[i10];
      const v01 = isValid[i01];
      const v11 = isValid[i11];

      // Triangulate if valid
      if (v00 && v10 && v01 && v11) {
        const f00 = frontGridIndices[i00];
        const f10 = frontGridIndices[i10];
        const f01 = frontGridIndices[i01];
        const f11 = frontGridIndices[i11];

        // Front Triangles (CCW)
        frontIndices.push(f00, f01, f10);
        frontIndices.push(f10, f01, f11);

        // Back Triangles (CW when viewed from front -> CCW from back)
        const b00 = backGridIndices[i00];
        const b10 = backGridIndices[i10];
        const b01 = backGridIndices[i01];
        const b11 = backGridIndices[i11];

        backIndices.push(b00, b10, b01);
        backIndices.push(b10, b11, b01);
      } else if (v00 && v10 && v01) {
        frontIndices.push(frontGridIndices[i00], frontGridIndices[i01], frontGridIndices[i10]);
        backIndices.push(backGridIndices[i00], backGridIndices[i10], backGridIndices[i01]);
      } else if (v10 && v11 && v01) {
        frontIndices.push(frontGridIndices[i10], frontGridIndices[i01], frontGridIndices[i11]);
        backIndices.push(backGridIndices[i10], backGridIndices[i11], backGridIndices[i01]);
      } else if (v00 && v10 && v11) {
        frontIndices.push(frontGridIndices[i00], frontGridIndices[i11], frontGridIndices[i10]);
        backIndices.push(backGridIndices[i00], backGridIndices[i10], backGridIndices[i11]);
      } else if (v00 && v01 && v11) {
        frontIndices.push(frontGridIndices[i00], frontGridIndices[i01], frontGridIndices[i11]);
        backIndices.push(backGridIndices[i00], backGridIndices[i11], backGridIndices[i01]);
      }
    }
  }

  // 4. Compute Smooth Front and Back Normals
  function computeNormals(verts, indices, isFront = true) {
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

  computeNormals(frontVerts, frontIndices, true);
  computeNormals(backVerts, backIndices, false);

  // 5. Construct Solid Side Perimeter Extrusion Wall around the Silhouette
  // Detect every boundary edge (edges that have a valid vertex adjacent to an invalid vertex)
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const idx = y * gridW + x;
      if (!isValid[idx]) continue;

      // Check 4 neighbors
      // Top neighbor
      if (y === 0 || !isValid[(y - 1) * gridW + x]) {
        if (x < gridW - 1 && isValid[y * gridW + (x + 1)] && (y === 0 || !isValid[(y - 1) * gridW + (x + 1)])) {
          addSideWallSegment(idx, y * gridW + (x + 1), [0, 1, 0]);
        }
      }
      // Bottom neighbor
      if (y === gridH - 1 || !isValid[(y + 1) * gridW + x]) {
        if (x < gridW - 1 && isValid[y * gridW + (x + 1)] && (y === gridH - 1 || !isValid[(y + 1) * gridW + (x + 1)])) {
          addSideWallSegment(y * gridW + (x + 1), idx, [0, -1, 0]);
        }
      }
      // Left neighbor
      if (x === 0 || !isValid[y * gridW + (x - 1)]) {
        if (y < gridH - 1 && isValid[(y + 1) * gridW + x] && (x === 0 || !isValid[(y + 1) * gridW + (x - 1)])) {
          addSideWallSegment((y + 1) * gridW + x, idx, [-1, 0, 0]);
        }
      }
      // Right neighbor
      if (x === gridW - 1 || !isValid[y * gridW + (x + 1)]) {
        if (y < gridH - 1 && isValid[(y + 1) * gridW + x] && (x === gridW - 1 || !isValid[(y + 1) * gridW + (x + 1)])) {
          addSideWallSegment(idx, (y + 1) * gridW + x, [1, 0, 0]);
        }
      }
    }
  }

  function addSideWallSegment(iA, iB, estimatedNormal) {
    const fA = frontGridIndices[iA];
    const fB = frontGridIndices[iB];
    const bA = backGridIndices[iA];
    const bB = backGridIndices[iB];

    if (fA === -1 || fB === -1 || bA === -1 || bB === -1) return;

    const pF_A = [frontVerts[fA * 8 + 0], frontVerts[fA * 8 + 1], frontVerts[fA * 8 + 2]];
    const pF_B = [frontVerts[fB * 8 + 0], frontVerts[fB * 8 + 1], frontVerts[fB * 8 + 2]];
    const pB_A = [backVerts[bA * 8 + 0], backVerts[bA * 8 + 1], backVerts[bA * 8 + 2]];
    const pB_B = [backVerts[bB * 8 + 0], backVerts[bB * 8 + 1], backVerts[bB * 8 + 2]];

    const startIdx = sideVerts.length / 8;

    // Add 4 vertices for side quad
    sideVerts.push(
      pF_A[0], pF_A[1], pF_A[2], estimatedNormal[0], estimatedNormal[1], estimatedNormal[2], 0, 0,
      pF_B[0], pF_B[1], pF_B[2], estimatedNormal[0], estimatedNormal[1], estimatedNormal[2], 1, 0,
      pB_B[0], pB_B[1], pB_B[2], estimatedNormal[0], estimatedNormal[1], estimatedNormal[2], 1, 1,
      pB_A[0], pB_A[1], pB_A[2], estimatedNormal[0], estimatedNormal[1], estimatedNormal[2], 0, 1
    );

    sideIndices.push(startIdx, startIdx + 1, startIdx + 2);
    sideIndices.push(startIdx, startIdx + 2, startIdx + 3);
  }

  console.log(`✓ Mesh Geometry Generated:`, {
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

  // Front submesh accessors
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

  // Back submesh accessors
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

  // Side rim accessors
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

  // EMBEDDED IMAGES (Front Portrait JPEG, Back Chassis PNG, Normal Map PNG)
  const bvImgFront = appendBuffer(frontJpgBuffer);
  const bvImgBack = appendBuffer(backPngBuffer);
  const bvImgNormal = appendBuffer(normalPngBuffer);

  const totalBin = Buffer.concat(binChunks);

  // glTF Definition
  const gltf = {
    asset: { version: '2.0', generator: 'Rameshwor-Volumetric-Image-To-3D-Bust-Engine' },
    scene: 0,
    scenes: [{ name: 'RameshworBustScene', nodes: [0] }],
    nodes: [{ name: 'Rameshwor3DBust', mesh: 0, rotation: [0, 0, 0, 1] }],
    meshes: [
      {
        name: 'VolumetricSculpturalBustMesh',
        primitives: [
          // 0: Front Volumetric Portrait
          {
            attributes: { POSITION: accF_Pos, NORMAL: accF_Norm, TEXCOORD_0: accF_Uv },
            indices: accF_Idx,
            material: 0
          },
          // 1: Back Neural Chassis
          {
            attributes: { POSITION: accB_Pos, NORMAL: accB_Norm, TEXCOORD_0: accB_Uv },
            indices: accB_Idx,
            material: 1
          },
          // 2: Side Titanium Perimeter Edge
          {
            attributes: { POSITION: accS_Pos, NORMAL: accS_Norm, TEXCOORD_0: accS_Uv },
            indices: accS_Idx,
            material: 2
          }
        ]
      }
    ],
    materials: [
      // 0: Front Portrait Material
      {
        name: 'RameshworPortraitPBR',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0.12,
          roughnessFactor: 0.30
        },
        normalTexture: { index: 2, scale: 1.2 },
        emissiveFactor: [0.04, 0.04, 0.04],
        doubleSided: false
      },
      // 1: Back Chassis Material
      {
        name: 'RameshworBackChassisPBR',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 1 },
          metallicFactor: 0.82,
          roughnessFactor: 0.22
        },
        emissiveFactor: [0.0, 0.25, 0.14],
        doubleSided: false
      },
      // 2: Side Chamfer Material
      {
        name: 'TitaniumEmeraldPerimeterEdge',
        pbrMetallicRoughness: {
          baseColorFactor: [0.06, 0.08, 0.12, 1.0],
          metallicFactor: 0.96,
          roughnessFactor: 0.14
        },
        emissiveFactor: [0.0, 0.40, 0.22],
        doubleSided: true
      }
    ],
    textures: [
      { sampler: 0, source: 0 },
      { sampler: 0, source: 1 },
      { sampler: 0, source: 2 }
    ],
    images: [
      { bufferView: bvImgFront, mimeType: 'image/jpeg', name: 'Rameshwor_Portrait_Embedded' },
      { bufferView: bvImgBack, mimeType: 'image/png', name: 'Rameshwor_Back_Embedded' },
      { bufferView: bvImgNormal, mimeType: 'image/png', name: 'Rameshwor_Normal_Embedded' }
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
  console.log(`✅ SUCCESS: True 3D Bust Model Generated & Exported!`);
  console.log(`📁 File: ${outputPath}`);
  console.log(`📊 Size: ${(glbBuffer.length / 1024).toFixed(1)} KB`);
  console.log(`🔒 Fully Self-Contained GLB with Embedded Textures + 3D Bust Silhouette Mesh`);
  console.log(`======================================================\n`);
}

generateTrue3DBust().catch(console.error);
