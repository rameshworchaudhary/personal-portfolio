import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';

global.FileReader = class FileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
    }).catch(err => {
      if (this.onerror) this.onerror(err);
    });
  }
};

async function run() {
  const scene = new THREE.Scene();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00f076 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const exporter = new GLTFExporter();
  try {
    const gltf = await exporter.parseAsync(scene, { binary: true });
    fs.writeFileSync('test.glb', Buffer.from(gltf));
    console.log('SUCCESS with parseAsync! File size:', fs.statSync('test.glb').size);
  } catch (err) {
    console.error('Error with parseAsync:', err);
  }
}

run();
