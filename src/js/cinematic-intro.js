/**
 * Cinematic 0-100 Loading Experience & Fanned 3D Photo Deck (Reference 1 Style)
 * Rameshwor Chaudhary Portfolio
 */

class CinematicIntro {
  constructor(options = {}) {
    this.container = document.getElementById('cinematic-intro-stage');
    this.counterEl = document.getElementById('intro-counter-number');
    this.progressBarEl = document.getElementById('intro-progress-bar-fill');
    this.statusTextEl = document.getElementById('intro-status-text');
    this.cloudContainer = document.getElementById('intro-photo-cloud');
    this.titleRevealEl = document.getElementById('intro-title-reveal');
    this.skipBtn = document.getElementById('intro-skip-btn');

    this.onComplete = options.onComplete || (() => {});
    this.progress = 0;
    this.isFinished = false;
    this.cards = [];
    this.animationFrameId = null;

    // Keep the original formats while using one predictable numbered sequence.
    this.photoList = Array.from({ length: 31 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return `assets/intro/photo-${num}.webp`;
    });

    this.init();
  }

  init() {
    if (!this.container) return;

    // Lock body scroll during intro
    document.body.style.overflow = 'hidden';

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.finishIntro(true);
      return;
    }

    // Build the 3D photo deck & floating cloud
    this.createPhotoDeck();

    // Start counter animation
    this.startCounter();

    // Bind skip events
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.finishIntro(true));
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.isFinished) {
        this.finishIntro(true);
      }
    });

    // Start 3D drift and fanning loop
    this.start3DLoop();
  }

  createPhotoDeck() {
    if (!this.cloudContainer) return;
    this.cloudContainer.innerHTML = '';

    const isMobile = window.innerWidth < 768;
    const totalCount = this.photoList.length; // All 31 unique photos

    this.cards = this.photoList.map((url, index) => {
      const el = document.createElement('div');
      el.className = 'intro-deck-card';
      
      const img = document.createElement('img');
      img.alt = `Rameshwor Chaudhary - Memory ${index + 1}`;
      img.width = 135;
      img.height = 175;
      img.decoding = 'async';
      img.src = url;
      img.loading = index < 8 ? 'eager' : 'lazy';
      el.appendChild(img);

      // Card metadata badge
      const badge = document.createElement('span');
      badge.className = 'deck-card-num';
      badge.textContent = `${String(index + 1).padStart(2, '0')}`;
      el.appendChild(badge);

      this.cloudContainer.appendChild(el);

      // Distribute in a fanned circular deck with depth layering
      const angle = (index / totalCount) * Math.PI * 2;
      const fanSpread = (index - totalCount / 2) * (isMobile ? 3.5 : 5.5);
      const radiusX = isMobile ? 120 + (index % 4) * 35 : 220 + (index % 5) * 65;
      const radiusY = isMobile ? 90 + (index % 3) * 30 : 160 + (index % 4) * 45;

      return {
        el,
        img,
        url,
        index,
        targetX: Math.cos(angle) * radiusX,
        targetY: Math.sin(angle) * radiusY,
        currentX: 0,
        currentY: 0,
        targetZ: -200 + (index * 15),
        currentZ: -200,
        fanRot: fanSpread,
        baseRotZ: (Math.random() - 0.5) * 22,
        baseRotY: (Math.random() - 0.5) * 28,
        baseRotX: (Math.random() - 0.5) * 18,
        orbitSpeed: 0.003 + (index % 3) * 0.0015,
        angle: angle,
        radiusX: radiusX,
        radiusY: radiusY,
        scale: 0.65 + (index % 3) * 0.15
      };
    });
  }

  start3DLoop() {
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 40;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 40;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const update = () => {
      if (this.isFinished) return;

      const progressRatio = this.progress / 100;
      const spreadFactor = Math.min(1.2, 0.2 + progressRatio * 0.95);
      const rotProgress = 1 - progressRatio * 0.6;

      for (let i = 0; i < this.cards.length; i++) {
        const card = this.cards[i];

        // Orbit motion
        card.angle += card.orbitSpeed;
        
        const orbitX = Math.cos(card.angle) * card.radiusX * spreadFactor;
        const orbitY = Math.sin(card.angle) * card.radiusY * spreadFactor;
        const orbitZ = card.targetZ + Math.sin(card.angle) * 80;

        // Smooth Lerp
        card.currentX += (orbitX + mouseX * 0.6 - card.currentX) * 0.09;
        card.currentY += (orbitY + mouseY * 0.6 - card.currentY) * 0.09;
        card.currentZ += (orbitZ - card.currentZ) * 0.09;

        const depthFactor = Math.max(0.2, (800 + card.currentZ) / 800);
        const rotZ = card.baseRotZ + (card.fanRot * rotProgress);
        const rotY = card.baseRotY + (mouseX * 0.15);
        const rotX = card.baseRotX - (mouseY * 0.15);

        // Hardware-accelerated 3D transform without costly CSS filter blurs
        card.el.style.transform = `translate3d(${card.currentX.toFixed(1)}px, ${card.currentY.toFixed(1)}px, ${card.currentZ.toFixed(1)}px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${(card.scale * depthFactor).toFixed(2)})`;
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  startCounter() {
    const statuses = [
      { at: 0, text: 'INITIALIZING PORTFOLIO ENVIRONMENT' },
      { at: 20, text: 'STREAMING 31 MEMORY TILES' },
      { at: 50, text: 'CALIBRATING GRAPHICS ENGINE' },
      { at: 80, text: 'SYNCHRONIZING PBR SHADERS & LIGHTING' },
      { at: 98, text: 'PORTFOLIO READY' }
    ];

    const startTime = performance.now();
    const duration = 2200; // 2.2s smooth luxury pacing

    const step = (now) => {
      if (this.isFinished) return;

      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Easing cubic-out
      const eased = 1 - Math.pow(1 - t, 3);
      
      this.progress = Math.min(100, Math.floor(eased * 100));

      if (this.counterEl) {
        this.counterEl.textContent = `${this.progress}`;
      }

      if (this.progressBarEl) {
        this.progressBarEl.style.width = `${this.progress}%`;
      }

      const activeStatus = [...statuses].reverse().find(s => this.progress >= s.at);
      if (activeStatus && this.statusTextEl) {
        this.statusTextEl.textContent = activeStatus.text;
      }

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        this.onReached100();
      }
    };

    requestAnimationFrame(step);
  }

  onReached100() {
    if (this.isFinished) return;

    if (this.statusTextEl) this.statusTextEl.textContent = 'WELCOME';
    
    // Disperse photos outward in 3D (Reference 1 style burst)
    this.cards.forEach((card, idx) => {
      const angle = (idx / this.cards.length) * Math.PI * 2;
      const destX = Math.cos(angle) * 1400;
      const destY = Math.sin(angle) * 1100;
      const destZ = 700;
      card.el.style.transition = 'all 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
      card.el.style.transform = `translate3d(${destX}px, ${destY}px, ${destZ}px) scale(1.8) rotateZ(${card.baseRotZ * 2}deg)`;
      card.el.style.opacity = '0';
    });

    // Reveal Cinematic Name Sequence
    if (this.titleRevealEl) {
      this.titleRevealEl.classList.add('reveal-active');
    }

    if (window.playTransitionWhoosh) {
      window.playTransitionWhoosh(520, 280);
    }

    setTimeout(() => {
      this.finishIntro(false);
    }, 1000);
  }

  finishIntro(immediate = false) {
    if (this.isFinished) return;
    this.isFinished = true;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    document.body.style.overflow = '';

    if (this.container) {
      if (immediate) {
        this.container.style.display = 'none';
        if (this.cloudContainer) this.cloudContainer.innerHTML = '';
      } else {
        this.container.classList.add('fade-out');
        setTimeout(() => {
          this.container.style.display = 'none';
          if (this.cloudContainer) this.cloudContainer.innerHTML = '';
        }, 750);
      }
    }

    // Trigger completion hook for 3D Hero
    if (typeof this.onComplete === 'function') {
      this.onComplete();
    }
  }
}

window.CinematicIntro = CinematicIntro;
