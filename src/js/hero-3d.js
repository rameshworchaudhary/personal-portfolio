/**
 * Hero 3D WebGL Engine — Authentic Volumetric 3D Portrait Visual
 * Rameshwor Chaudhary Portfolio
 * 
 * Features:
 * - Real 3D geometric mesh with depth displacement & normal mapping
 * - Alpha-cutout silhouette (NOT a flat photo or rectangular card)
 * - Anatomical facial & body volume (nose, cheekbones, hair, suit lapels)
 * - Seamless 360° continuous axial rotation loop
 * - Studio multi-point PBR lighting with dynamic specular highlights
 * - Dual-sided sculptural construction (Front Portrait + Back Neural Chassis + Titanium Edge)
 * - Subtle interactive mouse/touch parallax and floating levitation
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Hero3DExperience {
  constructor(containerId = 'hero-3d-canvas-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.modelGroup = null;
    this.sculptureGroup = null;
    this.particlesGroup = null;
    this.gltfLoader = new GLTFLoader();

    // Studio Lighting
    this.keyLight = null;
    this.rimLight = null;
    this.pointLight = null;
    this.fillLight = null;
    this.topLight = null;

    // Animation & Continuous 360° Rotation State
    this.autoRotate = false;
    this.rotationVelocity = 0;
    this.currentRotationY = 0;

    // Parallax & Scroll State (Subtle, damped)
    this.mouseNorm = { x: 0, y: 0 };
    this.tiltCurrent = { x: 0, y: 0 };
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.clock = new THREE.Clock();
    this.rafId = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Three.js Scene
    this.scene = new THREE.Scene();

    // 2. Perspective Camera calibrated for immersive full-screen dimensional depth
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.updateCameraForViewport(width, height);

    // 3. WebGL Renderer with ACES Tone Mapping & Shadow Support
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Attach to DOM container
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Setup Multi-Point Studio Lighting
    this.setupLighting();

    // 5. Main Model Group
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    // 6. Build the Volumetric 3D Sculptural Portrait from self-contained GLB
    this.build3DSculpturalPortrait();

    // 7. Ambient Particle Field
    this.createAmbientParticles();

    // 8. Event Listeners (Resize, Parallax, Scroll)
    this.bindEvents();

    // 9. Start Render Loop
    this.animate();
  }

  updateCameraForViewport(width, height) {
    const aspect = width / height;
    if (aspect < 0.75) {
      // Mobile full-screen view
      this.camera.position.set(0, -0.2, 14.6);
    } else if (aspect < 1.15) {
      // Tablet view
      this.camera.position.set(0.15, -0.1, 13.2);
    } else {
      // Desktop full-screen commanding background presence
      this.camera.position.set(0.2, 0.0, 11.8);
    }
  }

  setupLighting() {
    // Ambient Soft Base (Clean natural baseline)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    this.scene.add(ambientLight);

    // Studio Key Light (Warm soft directional light for natural facial illumination)
    this.keyLight = new THREE.DirectionalLight(0xfff7ee, 2.6);
    this.keyLight.position.set(6.0, 5.0, 7.0);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);

    // Subtle Emerald Rim Light (Gentle signature edge accent on profile turn)
    this.rimLight = new THREE.DirectionalLight(0x00f076, 2.4);
    this.rimLight.position.set(-7.0, 4.0, -5.0);
    this.scene.add(this.rimLight);

    // Cyan / Steel Soft Fill Light (Right rim accent)
    this.fillLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    this.fillLight.position.set(6.5, -2.0, -4.0);
    this.scene.add(this.fillLight);

    // Top Soft Overhead Rim
    this.topLight = new THREE.DirectionalLight(0xffffff, 1.4);
    this.topLight.position.set(0, 10, 3.5);
    this.scene.add(this.topLight);

    // Interactive Dynamic Cursor Point Light (Subtle soft highlight)
    this.pointLight = new THREE.PointLight(0x00f076, 1.6, 20);
    this.pointLight.position.set(0, 0, 6.0);
    this.scene.add(this.pointLight);
  }

  build3DSculpturalPortrait() {
    this.sculptureGroup = new THREE.Group();

    // ── LOAD THE SELF-CONTAINED STANDALONE GLB MODEL ──
    // All textures (Portrait JPEG + Back Chassis PNG) and 3D volumetric geometry are embedded inside the GLB
    this.gltfLoader.load(
      '/public/models/rameshwor-portrait-3d.glb',
      (gltf) => {
        const root = gltf.scene;

        // Center the 3D model's pivot point
        const box = new THREE.Box3().setFromObject(root);
        const center = new THREE.Vector3();
        box.getCenter(center);
        root.position.set(-center.x, -center.y, -center.z);

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Ensure textures decode with standard sRGB color space and crisp mipmaps
            if (child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((mat) => {
                if (mat.map) {
                  mat.map.colorSpace = THREE.SRGBColorSpace;
                  mat.map.generateMipmaps = true;
                  mat.map.needsUpdate = true;
                }
              });
            }
          }
        });

        // Add to sculpture group
        this.sculptureGroup.add(root);
      },
      undefined,
      (err) => {
        console.error('Error loading standalone GLB:', err);
      }
    );

    this.modelGroup.add(this.sculptureGroup);
  }

  createAmbientParticles() {
    const particleCount = 85;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00f076,
      size: 0.055,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particlesGroup = new THREE.Points(geometry, material);
    this.scene.add(this.particlesGroup);
  }

  bindEvents() {
    // Resize Observer for fluid responsiveness
    const resizeObserver = new ResizeObserver(() => this.onResize());
    resizeObserver.observe(this.container);
    window.addEventListener('resize', () => this.onResize());

    // Window Mousemove for subtle, restrained parallax
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.mouseNorm.x = x;
      this.mouseNorm.y = y;

      if (this.pointLight) {
        this.pointLight.position.x = x * 4.5;
        this.pointLight.position.y = y * 3.5;
      }
    });

    // Window Scroll for persistent full-page background tracking
    window.addEventListener('scroll', () => {
      this.targetScrollY = window.scrollY || window.pageYOffset || 0;
    }, { passive: true });

    // Touch Parallax on Mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.mouseNorm.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouseNorm.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    }, { passive: true });
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.updateCameraForViewport(width, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // 1. Continuous Smooth 360° Axial Rotation Loop
    if (this.autoRotate && this.modelGroup) {
      this.modelGroup.rotation.y += this.rotationVelocity;
      this.currentRotationY = this.modelGroup.rotation.y;
    }

    if (this.modelGroup) {
      // Keep the portrait fixed on the right side of the viewport.
      this.modelGroup.position.x = window.innerWidth >= 768 ? 3.2 : 1.8;
      this.modelGroup.position.y = 0;
      this.modelGroup.rotation.x = 0;
      this.modelGroup.rotation.z = 0;
    }

    // 3. Ambient Particle Drift
    if (this.particlesGroup) {
      this.particlesGroup.rotation.y += 0.0006;
      this.particlesGroup.rotation.x = Math.sin(elapsedTime * 0.25) * 0.025;
    }

    // Render Scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  reveal() {
    if (!this.modelGroup) return;
    this.modelGroup.scale.set(0.01, 0.01, 0.01);

    let s = 0.01;
    const step = () => {
      s += (1.0 - s) * 0.08;
      this.modelGroup.scale.set(s, s, s);
      if (s < 0.99) {
        requestAnimationFrame(step);
      } else {
        this.modelGroup.scale.set(1, 1, 1);
      }
    };
    step();
  }

  dispose() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}

window.Hero3DExperience = Hero3DExperience;
export default Hero3DExperience;
