/**
 * CINEMATIC SCENE DIRECTOR & MOTION CONTROLLER
 * Powers the cinematic transitions, 3D curved Holo-Theater, Radar Clock,
 * Audio Synthesizer, and Interactive Universe.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCinematicIntro();
  initSmoothScroll();
  initAudioSynthesizer();
  initCinematicParticles();
  initRoleCycler();
  initUniverseLightTrail();
  initTimelineRadar();
  initHoloTheater();
  initContactTerminal();
  initScrollSpy();
  initCopyEmail();
  initScrollTriggerScenes();
});

/* ── 1. CINEMATIC AUDIO SYNTHESIZER (WEB AUDIO API) ── */
let audioCtx = null;
let droneOsc1 = null;
let droneOsc2 = null;
let masterGain = null;
let isAudioPlaying = false;

function initAudioSynthesizer() {
  const audioBtn = document.getElementById('cine-audio-toggle');
  if (!audioBtn) return;

  audioBtn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      startCinematicDrone();
      audioBtn.classList.add('playing');
      const label = audioBtn.querySelector('.audio-label');
      if (label) label.textContent = 'SOUND: ON';
      isAudioPlaying = true;
      playTransitionWhoosh(400, 150);
    } else {
      stopCinematicDrone();
      audioBtn.classList.remove('playing');
      const label = audioBtn.querySelector('.audio-label');
      if (label) label.textContent = 'SOUND: OFF';
      isAudioPlaying = false;
    }
  });
}

function startCinematicDrone() {
  if (!audioCtx) return;

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 3);
  masterGain.connect(audioCtx.destination);

  // Deep Sub-Bass Drone (Sine wave 48Hz)
  droneOsc1 = audioCtx.createOscillator();
  droneOsc1.type = 'sine';
  droneOsc1.frequency.setValueAtTime(48, audioCtx.currentTime);

  // Warm Harmonic (Sine wave 72Hz with subtle detune)
  droneOsc2 = audioCtx.createOscillator();
  droneOsc2.type = 'triangle';
  droneOsc2.frequency.setValueAtTime(72, audioCtx.currentTime);
  droneOsc2.detune.setValueAtTime(6, audioCtx.currentTime);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(140, audioCtx.currentTime);

  droneOsc1.connect(filter);
  droneOsc2.connect(filter);
  filter.connect(masterGain);

  droneOsc1.start();
  droneOsc2.start();
}

function stopCinematicDrone() {
  if (!masterGain || !audioCtx) return;
  masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
  setTimeout(() => {
    try {
      if (droneOsc1) droneOsc1.stop();
      if (droneOsc2) droneOsc2.stop();
    } catch (e) {}
  }, 1300);
}

function playTransitionWhoosh(freqStart = 350, freqEnd = 120) {
  if (!isAudioPlaying || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqStart, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, audioCtx.currentTime + 0.45);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, audioCtx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch (e) {}
}
window.playTransitionWhoosh = playTransitionWhoosh;

/* ── 2. CINEMATIC 3D PARTICLES CANVAS (ATMOSPHERIC BACKGROUND) ── */
function initCinematicParticles() {
  const canvas = document.getElementById('cinematic-webgl-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 55;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const isAmber = Math.random() > 0.45;
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.0 + 0.5,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -Math.random() * 0.45 - 0.15,
      isAmber: isAmber
    });
  }

  let mouseX = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - width / 2) * 0.02;
  }, { passive: true });

  let rafId = null;

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Group 1: Amber particles (single batched draw call)
    ctx.beginPath();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.speedX + mouseX * 0.04;
      p.y += p.speedY;

      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      if (p.isAmber) {
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = 'rgba(255, 132, 0, 0.45)';
    ctx.fill();

    // Group 2: Crimson particles (single batched draw call)
    ctx.beginPath();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!p.isAmber) {
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = 'rgba(255, 51, 20, 0.45)';
    ctx.fill();

    rafId = requestAnimationFrame(render);
  }

  // Pause rendering when tab is hidden to save GPU/battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (!rafId) {
      rafId = requestAnimationFrame(render);
    }
  });

  rafId = requestAnimationFrame(render);
}

/* ── 3. HERO ROLE CYCLER ── */
function initRoleCycler() {
  const roleEl = document.getElementById('hero-role-text');
  if (!roleEl) return;

  const roles = [
    'AI & MACHINE LEARNING ENGINEER',
    'COMPUTER VISION SPECIALIST',
    'NEURAL PIPELINE ARCHITECT',
    'FULL-STACK DEVELOPER'
  ];
  let currentIdx = 0;

  setInterval(() => {
    roleEl.style.opacity = '0';
    roleEl.style.transform = 'translateY(8px)';
    roleEl.style.transition = 'all 0.35s ease';

    setTimeout(() => {
      currentIdx = (currentIdx + 1) % roles.length;
      roleEl.textContent = roles[currentIdx];
      roleEl.style.opacity = '1';
      roleEl.style.transform = 'translateY(0)';
    }, 350);
  }, 3200);
}

/* ── 4. UNIVERSE ORBITAL NEURAL SYSTEM (SCENE 02) ── */
function initUniverseLightTrail() {
  const stage = document.querySelector('.universe-stage');
  const canvas = document.getElementById('universe-light-trail-canvas');
  const cloud = document.getElementById('universe-orbital-cloud');
  const core = document.getElementById('universe-central-core');
  const coreStatus = document.getElementById('core-status-text');
  const badges = Array.from(document.querySelectorAll('.u-tech-badge'));
  const filterBtns = Array.from(document.querySelectorAll('.u-filter-btn'));

  if (!stage || !canvas) return;

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
  let isMobile = false;

  // Orbit Configuration for the 3 Tiers
  // Tier 1: 5 badges (AI & ML Core)
  // Tier 2: 7 badges (Web & Full-Stack)
  // Tier 3: 6 badges (Systems, Tools & Infrastructure)
  const tierBadges = {
    1: badges.filter(b => b.getAttribute('data-tier') === '1'),
    2: badges.filter(b => b.getAttribute('data-tier') === '2'),
    3: badges.filter(b => b.getAttribute('data-tier') === '3')
  };

  // Assign stable orbital parameters for each badge
  const badgeData = new Map();

  // Tier 1 parameters
  const t1Tilt = -0.22; // ~ -12 deg
  tierBadges[1].forEach((badge, idx) => {
    const total = tierBadges[1].length;
    const baseAngle = (idx / total) * Math.PI * 2 + 0.3;
    badgeData.set(badge, {
      tier: 1,
      angle: baseAngle,
      tilt: t1Tilt,
      speed: 0.0007,
      depthFactor: 0.6,
      baseZ: 25,
      phase: idx * 1.3,
      impulse: 0
    });
  });

  // Tier 2 parameters
  const t2Tilt = 0.16; // ~ +9 deg
  tierBadges[2].forEach((badge, idx) => {
    const total = tierBadges[2].length;
    const baseAngle = (idx / total) * Math.PI * 2 + 0.6;
    badgeData.set(badge, {
      tier: 2,
      angle: baseAngle,
      tilt: t2Tilt,
      speed: -0.0005,
      depthFactor: 0.9,
      baseZ: 12,
      phase: idx * 1.1 + 2.0,
      impulse: 0
    });
  });

  // Tier 3 parameters
  const t3Tilt = -0.10; // ~ -6 deg
  tierBadges[3].forEach((badge, idx) => {
    const total = tierBadges[3].length;
    const baseAngle = (idx / total) * Math.PI * 2 + 0.1;
    badgeData.set(badge, {
      tier: 3,
      angle: baseAngle,
      tilt: t3Tilt,
      speed: 0.0004,
      depthFactor: 1.25,
      baseZ: -8,
      phase: idx * 0.9 + 4.0,
      impulse: 0
    });
  });

  // Radii calculation
  function getRadii() {
    if (isMobile) return { t1: { rx: 0, ry: 0 }, t2: { rx: 0, ry: 0 }, t3: { rx: 0, ry: 0 } };
    const rxBase = Math.min(w * 0.48, 560);
    const ryBase = Math.min(h * 0.46, 330);

    return {
      t1: { rx: rxBase * 0.38, ry: ryBase * 0.38 },
      t2: { rx: rxBase * 0.68, ry: ryBase * 0.68 },
      t3: { rx: rxBase * 0.94, ry: ryBase * 0.94 }
    };
  }

  function resize() {
    w = canvas.width = stage.clientWidth;
    h = canvas.height = stage.clientHeight;
    isMobile = window.innerWidth < 860;
  }
  window.addEventListener('resize', resize);
  resize();

  // Mouse Parallax Engine for Depth
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetMouseX = nx * 2;
    targetMouseY = ny * 2;
  }, { passive: true });

  stage.addEventListener('mouseleave', () => {
    targetMouseX = 0;
    targetMouseY = 0;
  });

  // Central Core Impulse Ripple
  if (core) {
    core.addEventListener('click', () => {
      badgeData.forEach((data) => {
        data.impulse = 28;
      });
      playTransitionWhoosh(460, 210);
    });
  }

  // Comets traversing the orbital tiers
  const comets = [
    { tier: 1, angle: 0, speed: 0.018, color: 'rgba(0, 229, 255,', size: 28 },
    { tier: 2, angle: Math.PI, speed: -0.013, color: 'rgba(255, 132, 0,', size: 32 },
    { tier: 3, angle: Math.PI * 0.5, speed: 0.009, color: 'rgba(255, 51, 20,', size: 36 }
  ];

  // Subtle Cosmic Stardust in the Universe Stage
  const stardust = [];
  for (let i = 0; i < 36; i++) {
    stardust.push({
      x: Math.random() * 1200,
      y: Math.random() * 800,
      size: Math.random() * 1.8 + 0.4,
      twinkleSpeed: Math.random() * 0.03 + 0.01
    });
  }

  // Animation Loop
  let time = 0;
  function renderUniverse() {
    time += 0.016;

    // Smooth mouse damping
    mouseX += (targetMouseX - mouseX) * 0.06;
    mouseY += (targetMouseY - mouseY) * 0.06;

    // Canvas Background Trails & Comets
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const radii = getRadii();

    // Render Stardust in a single batched draw call
    ctx.beginPath();
    for (let i = 0; i < stardust.length; i++) {
      const star = stardust[i];
      const sx = star.x % w;
      const sy = star.y % h;
      ctx.moveTo(sx + star.size, sy);
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();

    if (!isMobile) {
      // Draw Comets with Radiant Tails along the three tracks
      comets.forEach(c => {
        c.angle += c.speed;
        const rad = radii[`t${c.tier}`];
        const tilt = c.tier === 1 ? t1Tilt : c.tier === 2 ? t2Tilt : t3Tilt;

        const rawX = Math.cos(c.angle) * rad.rx;
        const rawY = Math.sin(c.angle) * rad.ry;

        const rotX = rawX * Math.cos(tilt) - rawY * Math.sin(tilt);
        const rotY = rawX * Math.sin(tilt) + rawY * Math.cos(tilt);

        const cx = centerX + rotX + mouseX * 15 * (c.tier * 0.3);
        const cy = centerY + rotY + mouseY * 15 * (c.tier * 0.3);

        // Radiant Comet Glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, c.size);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.25, `${c.color} 0.85)`);
        grad.addColorStop(0.65, `${c.color} 0.22)`);
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, c.size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Update Badges coordinates with single hardware-accelerated transform
      badges.forEach(badge => {
        const data = badgeData.get(badge);
        if (!data) return;

        // Smooth orbital drift
        data.angle += data.speed;

        // Damped return on impulse
        if (data.impulse > 0.05) {
          data.impulse *= 0.92;
        } else {
          data.impulse = 0;
        }

        const rad = radii[`t${data.tier}`];
        const currentRx = rad.rx + data.impulse;
        const currentRy = rad.ry + data.impulse;

        const rawX = Math.cos(data.angle) * currentRx;
        const rawY = Math.sin(data.angle) * currentRy;

        const rotX = rawX * Math.cos(data.tilt) - rawY * Math.sin(data.tilt);
        const rotY = rawX * Math.sin(data.tilt) + rawY * Math.cos(data.tilt);

        // Floating hover harmonic
        const floatX = Math.cos(time * 1.5 + data.phase) * 4 + mouseX * 22 * data.depthFactor;
        const floatY = Math.sin(time * 1.8 + data.phase) * 5 + mouseY * 18 * data.depthFactor;
        const depthZ = data.baseZ + Math.sin(data.angle) * 15;

        const totalX = (rotX + floatX).toFixed(1);
        const totalY = (rotY + floatY).toFixed(1);
        const z = depthZ.toFixed(1);

        badge.style.transform = `translate3d(calc(-50% + ${totalX}px), calc(-50% + ${totalY}px), ${z}px)`;
      });
    }

    if (isUniverseInView) {
      universeRafId = requestAnimationFrame(renderUniverse);
    }
  }

  let universeRafId = null;
  let isUniverseInView = true;

  if ('IntersectionObserver' in window && stage) {
    const universeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isUniverseInView = entry.isIntersecting;
        if (isUniverseInView && !universeRafId) {
          universeRafId = requestAnimationFrame(renderUniverse);
        } else if (!isUniverseInView && universeRafId) {
          cancelAnimationFrame(universeRafId);
          universeRafId = null;
        }
      });
    }, { rootMargin: '100px' });
    universeObserver.observe(stage);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (universeRafId) {
        cancelAnimationFrame(universeRafId);
        universeRafId = null;
      }
    } else if (isUniverseInView && !universeRafId) {
      universeRafId = requestAnimationFrame(renderUniverse);
    }
  });

  universeRafId = requestAnimationFrame(renderUniverse);

  // Category Filtering System
  const categoryCounts = {
    all: '● 18 SKILLS COMPILED',
    ai: '● 5 NEURAL & ML SYSTEMS',
    web: '● 7 FULL-STACK FRAMEWORKS',
    tools: '● 6 INFRASTRUCTURE & CLOUD'
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');

      if (coreStatus && categoryCounts[cat]) {
        coreStatus.textContent = categoryCounts[cat];
      }

      badges.forEach(badge => {
        const badgeCat = badge.getAttribute('data-cat');
        if (cat === 'all' || badgeCat === cat) {
          badge.classList.remove('dimmed');
          badge.classList.add('highlighted');
          setTimeout(() => badge.classList.remove('highlighted'), 1200);
        } else {
          badge.classList.add('dimmed');
          badge.classList.remove('highlighted');
        }
      });

      playTransitionWhoosh(420, 180);
    });
  });
}

/* ── 5. TIMELINE RADAR CLOCK (SCENE 03) ── */
function initTimelineRadar() {
  const needle = document.getElementById('radar-sweep-needle');
  const yearNodes = document.querySelectorAll('.timeline-year-node');
  const cards = document.querySelectorAll('.cine-timeline-card');

  if (!needle || !yearNodes.length) return;

  const degreeMap = {
    '2021': -45,
    '2022': -28,
    '2023': -10,
    '2024': 10,
    '2025': 28,
    '2026': 45
  };

  yearNodes.forEach(node => {
    node.addEventListener('click', () => {
      yearNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const year = node.getAttribute('data-year');
      const deg = degreeMap[year] || 0;
      needle.style.transform = `rotate(${deg}deg)`;

      // Highlight corresponding milestone card
      cards.forEach(card => {
        const cardYear = card.getAttribute('data-year');
        if (cardYear && cardYear.includes(year)) {
          card.classList.add('focused');
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          card.classList.remove('focused');
        }
      });

      playTransitionWhoosh(380, 140);
    });
  });
}

/* ── 6. HOLO-THEATER CURVED 3D CAROUSEL & GRID SYSTEM (SCENE 05) ── */
let currentTheaterIndex = 0;
let targetTheaterProgress = 0;
let currentTheaterProgress = 0;
let filteredCards = [];
let theaterRafId = null;
let isDraggingTheater = false;
let dragStartX = 0;
let dragStartProgress = 0;
let dragLastX = 0;
let dragVelocity = 0;
let wheelSnapTimeout = null;
let currentTheaterMode = 'carousel'; // 'carousel' | 'grid'

function initHoloTheater() {
  const stage = document.querySelector('.theater-stage-container');
  const track = document.getElementById('theater-screens-track');
  const theaterSection = document.getElementById('scene-05-theater') || document.getElementById('scene-04-theater');
  const cards = Array.from(document.querySelectorAll('.theater-screen-card'));
  const prevBtn = document.getElementById('th-nav-prev');
  const nextBtn = document.getElementById('th-nav-next');
  const navActions = document.getElementById('theater-nav-actions');
  const dockContainer = document.getElementById('theater-dock-selector');
  const filterBtns = document.querySelectorAll('.th-filter-btn');
  const viewBtns = document.querySelectorAll('.th-view-btn');

  if (!track || !cards.length) return;

  filteredCards = [...cards];
  targetTheaterProgress = 0;
  currentTheaterProgress = 0;
  currentTheaterMode = 'carousel';

  // Track mouse coordinates for interactive 3D card tilt
  let mouseTiltX = 0;
  let mouseTiltY = 0;
  let hoveredCard = null;

  function updateDockPills() {
    if (!dockContainer) return;
    if (currentTheaterMode === 'grid') {
      dockContainer.style.display = 'none';
      return;
    }
    dockContainer.style.display = 'flex';
    dockContainer.innerHTML = '';
    filteredCards.forEach((_, idx) => {
      const pill = document.createElement('div');
      pill.className = `th-dock-pill ${idx === Math.round(targetTheaterProgress) ? 'active' : ''}`;
      pill.addEventListener('click', () => {
        targetTheaterProgress = idx;
        currentTheaterIndex = idx;
        playTransitionWhoosh(400, 160);
      });
      dockContainer.appendChild(pill);
    });
  }

  function setViewMode(mode) {
    currentTheaterMode = mode;
    viewBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    if (mode === 'grid') {
      if (stage) stage.classList.add('grid-mode');
      if (navActions) navActions.classList.add('hidden');
      if (dockContainer) dockContainer.style.display = 'none';
      filteredCards.forEach(card => {
        card.style.transform = '';
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        card.style.zIndex = '1';
      });
    } else {
      if (stage) stage.classList.remove('grid-mode');
      if (navActions) navActions.classList.remove('hidden');
      if (dockContainer) dockContainer.style.display = 'flex';
      updateDockPills();
    }
    playTransitionWhoosh(480, 180);
  }

  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      if (mode && mode !== currentTheaterMode) {
        setViewMode(mode);
      }
    });
  });

  // Cached scroll-based parallax metrics (recalculated on scroll/resize, NOT on every RAF frame)
  let cachedParallax = { viewProgress: 0, scrollTilt: 0, floatFactor: 0 };
  let theaterTop = 0;
  let theaterHeight = 0;

  function updateTheaterMetrics() {
    if (!theaterSection) return;
    const rect = theaterSection.getBoundingClientRect();
    theaterTop = rect.top + window.scrollY;
    theaterHeight = rect.height;
    updateScrollParallax();
  }

  function updateScrollParallax() {
    if (!theaterSection || !theaterHeight) return;
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const top = theaterTop - scrollY;
    const centerOffset = (top + theaterHeight * 0.45 - vh * 0.5) / (vh * 0.65);
    const clampedProgress = Math.max(-1.5, Math.min(1.5, centerOffset));
    cachedParallax = {
      viewProgress: clampedProgress,
      scrollTilt: clampedProgress * -6,
      floatFactor: clampedProgress * 20
    };
  }

  window.addEventListener('resize', updateTheaterMetrics, { passive: true });
  window.addEventListener('scroll', updateScrollParallax, { passive: true });
  updateTheaterMetrics();

  let isTheaterInView = true;

  // Animation render loop
  function animateTheater(timestamp) {
    if (!isTheaterInView || currentTheaterMode === 'grid' || !filteredCards.length) {
      theaterRafId = null;
      return;
    }

    // Smooth lerp towards target progress
    const lerpSpeed = isDraggingTheater ? 0.35 : 0.12;
    currentTheaterProgress += (targetTheaterProgress - currentTheaterProgress) * lerpSpeed;

    // Keep within bounds
    const maxProgress = Math.max(0, filteredCards.length - 1);
    if (currentTheaterProgress < -0.3) currentTheaterProgress = -0.3;
    if (currentTheaterProgress > maxProgress + 0.3) currentTheaterProgress = maxProgress + 0.3;

    // Read cached scroll parallax values without triggering DOM reflow
    const { viewProgress, scrollTilt, floatFactor } = cachedParallax;

    if (stage) {
      stage.style.perspectiveOrigin = `50% ${50 + viewProgress * 10}%`;
    }

    const time = timestamp * 0.002;
    const roundedIndex = Math.max(0, Math.min(maxProgress, Math.round(currentTheaterProgress)));
    if (roundedIndex !== currentTheaterIndex) {
      currentTheaterIndex = roundedIndex;
      const pills = document.querySelectorAll('.th-dock-pill');
      pills.forEach((p, i) => {
        p.classList.toggle('active', i === roundedIndex);
      });
    }

    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 320 : 410;

    filteredCards.forEach((card, idx) => {
      const offset = idx - currentTheaterProgress;
      const absOffset = Math.abs(offset);

      if (absOffset > 2.8) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.transform = `translateX(${offset * spacing}px) scale(0.55)`;
        return;
      }

      card.style.pointerEvents = 'auto'; // allow clicking on visible cards

      // Smooth Gaussian-like scale curve
      const scale = Math.max(0.70, 1.02 - absOffset * 0.12 - Math.pow(absOffset, 1.3) * 0.02);

      // Cosine fade
      const opacity = Math.max(0, Math.min(1, 1 - Math.pow(absOffset * 0.48, 1.8)));

      // Amphitheater horizontal translation & depth
      const translateX = offset * spacing;
      const translateZ = 60 - Math.pow(absOffset, 1.22) * 90;
      const rotateY = -Math.sign(offset) * Math.min(42, Math.pow(absOffset, 0.88) * 20);

      // Staggered vertical float
      const scrollYOffset = Math.sin(offset * 0.8) * floatFactor;
      const breathingBob = Math.sin(time + idx * 0.9) * 4;
      const translateY = scrollYOffset + breathingBob;

      // Micro mouse tilt when hovered
      let tiltX = 0;
      let tiltY = 0;
      if (card === hoveredCard && absOffset < 0.6) {
        tiltX = mouseTiltX;
        tiltY = mouseTiltY;
      }

      if (absOffset < 1.4) {
        const sheenPos = (offset * -75).toFixed(1);
        const sheenOpacity = Math.max(0.1, 0.65 - absOffset * 0.35).toFixed(2);
        card.style.setProperty('--card-sheen-pos', `${sheenPos}%`);
        card.style.setProperty('--card-sheen-opacity', sheenOpacity);
      }

      const zIndex = Math.round(50 - absOffset * 10);
      card.style.zIndex = `${zIndex}`;

      card.style.transform = `
        translateX(${translateX.toFixed(2)}px)
        translateY(${translateY.toFixed(2)}px)
        translateZ(${translateZ.toFixed(2)}px)
        scale(${scale.toFixed(3)})
        rotateY(${(rotateY + tiltY).toFixed(2)}deg)
        rotateX(${(scrollTilt + tiltX).toFixed(2)}deg)
      `;
      card.style.opacity = opacity.toFixed(3);
      card.classList.toggle('active', absOffset < 0.45);
    });

    theaterRafId = requestAnimationFrame(animateTheater);
  }

  function wakeTheaterLoop() {
    if (isTheaterInView && currentTheaterMode === 'carousel' && !theaterRafId) {
      theaterRafId = requestAnimationFrame(animateTheater);
    }
  }

  if ('IntersectionObserver' in window && theaterSection) {
    const theaterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isTheaterInView = entry.isIntersecting;
        if (isTheaterInView) {
          wakeTheaterLoop();
        } else if (theaterRafId) {
          cancelAnimationFrame(theaterRafId);
          theaterRafId = null;
        }
      });
    }, { rootMargin: '150px' });
    theaterObserver.observe(theaterSection);
  }

  wakeTheaterLoop();

  // Allow clicking on any side card to center it in Carousel mode
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (currentTheaterMode === 'grid') return;
      if (e.target.closest('a, button')) return;
      const cardIdx = filteredCards.indexOf(card);
      if (cardIdx !== -1 && Math.abs(cardIdx - targetTheaterProgress) > 0.25) {
        targetTheaterProgress = cardIdx;
        playTransitionWhoosh(400, 160);
      }
    });
  });

  // Wheel & Trackpad Scroll Parallax
  if (stage) {
    stage.addEventListener('wheel', (e) => {
      if (currentTheaterMode === 'grid') return;
      let delta = 0;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 4) {
        delta = e.deltaX;
      } else if (e.shiftKey && Math.abs(e.deltaY) > 4) {
        delta = e.deltaY;
      } else {
        return;
      }

      if (Math.abs(delta) > 3) {
        targetTheaterProgress += delta * 0.0028;
        const maxProgress = Math.max(0, filteredCards.length - 1);
        targetTheaterProgress = Math.max(0, Math.min(maxProgress, targetTheaterProgress));

        clearTimeout(wheelSnapTimeout);
        wheelSnapTimeout = setTimeout(() => {
          targetTheaterProgress = Math.round(targetTheaterProgress);
        }, 140);
      }
    }, { passive: true });

    // Pointer Drag / Touch Swipe Parallax
    stage.addEventListener('pointerdown', (e) => {
      if (currentTheaterMode === 'grid') return;
      if (e.target.closest('a, button')) return;

      isDraggingTheater = true;
      dragStartX = e.clientX;
      dragLastX = e.clientX;
      dragStartProgress = targetTheaterProgress;
      dragVelocity = 0;
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointermove', (e) => {
      const targetCard = e.target.closest('.theater-screen-card');
      if (targetCard) {
        hoveredCard = targetCard;
        const rect = targetCard.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        mouseTiltX = -normY * 6;
        mouseTiltY = normX * 8;
      } else {
        hoveredCard = null;
        mouseTiltX = 0;
        mouseTiltY = 0;
      }

      if (!isDraggingTheater || currentTheaterMode === 'grid') return;

      const deltaX = e.clientX - dragStartX;
      dragVelocity = e.clientX - dragLastX;
      dragLastX = e.clientX;

      const maxProgress = Math.max(0, filteredCards.length - 1);
      targetTheaterProgress = dragStartProgress - deltaX / 360;
      targetTheaterProgress = Math.max(-0.2, Math.min(maxProgress + 0.2, targetTheaterProgress));
    });

    const endDrag = (e) => {
      if (!isDraggingTheater) return;
      isDraggingTheater = false;

      targetTheaterProgress -= dragVelocity / 180;
      const maxProgress = Math.max(0, filteredCards.length - 1);
      targetTheaterProgress = Math.max(0, Math.min(maxProgress, Math.round(targetTheaterProgress)));

      playTransitionWhoosh(420, 150);
    };

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('mouseleave', () => {
      hoveredCard = null;
      mouseTiltX = 0;
      mouseTiltY = 0;
    });
  }

  // Navigation Arrow Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const maxProgress = Math.max(0, filteredCards.length - 1);
      targetTheaterProgress = Math.max(0, Math.round(targetTheaterProgress) - 1);
      playTransitionWhoosh(450, 160);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const maxProgress = Math.max(0, filteredCards.length - 1);
      targetTheaterProgress = Math.min(maxProgress, Math.round(targetTheaterProgress) + 1);
      playTransitionWhoosh(350, 140);
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (currentTheaterMode === 'grid') return;
    if (e.key === 'ArrowLeft') {
      const maxProgress = Math.max(0, filteredCards.length - 1);
      targetTheaterProgress = Math.max(0, Math.round(targetTheaterProgress) - 1);
    } else if (e.key === 'ArrowRight') {
      const maxProgress = Math.max(0, filteredCards.length - 1);
      targetTheaterProgress = Math.min(maxProgress, Math.round(targetTheaterProgress) + 1);
    }
  });

  // Filter Projects
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const status = card.getAttribute('data-status');
        const matches = filter === 'all' || status === filter;
        if (matches) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      filteredCards = cards.filter(card => {
        const status = card.getAttribute('data-status');
        return filter === 'all' || status === filter;
      });

      targetTheaterProgress = 0;
      currentTheaterProgress = 0;
      currentTheaterIndex = 0;
      updateDockPills();
      playTransitionWhoosh(480, 200);
    });
  });

  updateDockPills();

  // Case Study / Modal handlers
  initProjectModals();
}

function initProjectModals() {
  const overlay = document.getElementById('cine-modal-overlay');
  const closeBtn = document.getElementById('cine-modal-close');
  const modalBody = document.getElementById('cine-modal-content');
  const detailBtns = document.querySelectorAll('.th-btn-details');

  if (!overlay || !modalBody) return;

  detailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.theater-screen-card');
      if (!card) return;

      const title = card.querySelector('.th-card-title')?.textContent || '';
      const desc = card.querySelector('.th-card-desc')?.textContent || '';
      const tags = card.querySelector('.th-card-tags')?.innerHTML || '';
      const badge = card.querySelector('.th-card-badge')?.outerHTML || '';
      const demoLink = card.querySelector('.th-btn-demo')?.getAttribute('href');
      const codeLink = card.querySelector('.th-btn-code')?.getAttribute('href');

      modalBody.innerHTML = `
        <div style="margin-bottom: 12px; display:flex; align-items:center; gap:10px;">
          ${badge}
        </div>
        <h3 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 14px;">${title}</h3>
        <p style="font-size: 15px; color: var(--c-text-muted); line-height: 1.7; margin-bottom: 20px;">${desc}</p>
        <div style="margin-bottom: 24px;">${tags}</div>
        <div style="display:flex; gap:14px; flex-wrap:wrap;">
          ${demoLink ? `<a href="${demoLink}" target="_blank" rel="noopener" class="th-btn-demo">Open Live App ↗</a>` : ''}
          ${codeLink ? `<a href="${codeLink}" target="_blank" rel="noopener" class="th-btn-code">View Source Code ↗</a>` : ''}
        </div>
      `;

      overlay.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
}

/* ── 7. CONTACT TERMINAL & FORM SUBMISSION ── */
function initContactTerminal() {
  const form = document.getElementById('cine-contact-form');
  const submitBtn = document.getElementById('cine-form-submit');
  const toast = document.getElementById('cine-toast');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'TRANSMITTING MESSAGE...';

    const formData = new FormData(form);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        showToast('✓ Transmission dispatched successfully! I will respond promptly.');
        form.reset();
        triggerCelebrationConfetti();
      } else {
        showToast('Notice: Could not transmit. Please reach out directly via email.');
      }
    } catch (err) {
      showToast('Notice: Could not transmit. Please reach out directly via email.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'SEND MESSAGE ↗';
    }
  });
}

function showToast(msg) {
  const toast = document.getElementById('cine-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 4500);
}

function triggerCelebrationConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#ff3314', '#ff8400', '#00f076', '#ffffff']
    });
  }
}

/* ── 8. COPY EMAIL TO CLIPBOARD ── */
function initCopyEmail() {
  const emailRow = document.getElementById('dossier-email-channel');
  if (!emailRow) return;

  emailRow.addEventListener('click', (e) => {
    e.preventDefault();
    const email = 'chaudharyishwor143@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      showToast('✓ Email copied to clipboard: chaudharyishwor143@gmail.com');
    }).catch(() => {
      window.location.href = `mailto:${email}`;
    });
  });
}

/* ── 9. SCROLL SPY FOR NAVIGATION (OPTIMIZED WITH LAYOUT CACHE) ── */
function initScrollSpy() {
  const header = document.querySelector('.cine-header');
  const sections = document.querySelectorAll('.cine-scene');
  const navLinks = document.querySelectorAll('.cine-nav-link');

  let sectionMetrics = [];
  function updateMetrics() {
    sectionMetrics = Array.from(sections).map(sec => ({
      id: sec.getAttribute('id'),
      top: sec.offsetTop - 180,
      height: sec.offsetHeight
    }));
  }
  updateMetrics();
  window.addEventListener('resize', updateMetrics, { passive: true });
  window.addEventListener('load', updateMetrics, { passive: true });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        if (header) {
          header.classList.toggle('scrolled', scrollY > 60);
        }

        let currentSection = '';
        for (let i = 0; i < sectionMetrics.length; i++) {
          const m = sectionMetrics[i];
          if (scrollY >= m.top && scrollY < m.top + m.height) {
            currentSection = m.id;
            break;
          }
        }

        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
        });

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── 10. CINEMATIC 0-100 SYSTEM ENTRY & 3D PHOTO DECK REVEAL ── */
function initCinematicIntro() {
  if (typeof window.CinematicIntro !== 'undefined') {
    new window.CinematicIntro({
      onComplete: () => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      }
    });
    return;
  }

  const introStage = document.getElementById('cinematic-intro-stage');
  const photoCloud = document.getElementById('intro-photo-cloud');
  const counterNum = document.getElementById('intro-counter-number');
  const progressFill = document.getElementById('intro-progress-bar-fill');
  const statusText = document.getElementById('intro-status-text');
  const hudDock = document.querySelector('.intro-hud-dock');
  const titleReveal = document.getElementById('intro-title-reveal');
  const skipBtn = document.getElementById('intro-skip-btn');

  if (!introStage) {
    document.body.style.overflow = '';
    return;
  }

  // Lock body scroll while intro is running
  document.body.style.overflow = 'hidden';

  // 31 Photo URLs
  const photoUrls = Array.from({ length: 31 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `assets/intro/photo-${num}.webp`;
  });

  // Create cards efficiently
  const deckCards = [];
  if (photoCloud) {
    photoUrls.forEach((url, i) => {
      const numStr = String(i + 1).padStart(2, '0');
      const card = document.createElement('div');
      card.className = 'intro-deck-card';
      card.innerHTML = `
        <img src="${url}" alt="Memory ${numStr}" loading="eager" />
        <span class="deck-card-num">${numStr}</span>
      `;
      photoCloud.appendChild(card);
      deckCards.push(card);
    });
  }

  let mouseX = 0;
  let mouseY = 0;
  let isFinished = false;
  let introRafId = null;
  let startTime = null;
  const duration = 2400; // ms

  const onMouseMove = (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  const statusMilestones = [
    { pct: 0, text: 'INITIALIZING PORTFOLIO ENVIRONMENT' },
    { pct: 22, text: 'STREAMING 31 MEMORY TILES' },
    { pct: 54, text: 'CALIBRATING GRAPHICS ENGINE' },
    { pct: 80, text: 'SYNCHRONIZING PBR SHADERS & LIGHTING' },
    { pct: 98, text: 'SYSTEM OPERATIONAL // ACCESS GRANTED' }
  ];

  function finishIntro() {
    if (isFinished) return;
    isFinished = true;
    window.removeEventListener('mousemove', onMouseMove);
    if (introRafId) cancelAnimationFrame(introRafId);

    if (counterNum) counterNum.textContent = '100';
    if (progressFill) progressFill.style.width = '100%';
    if (statusText) statusText.textContent = 'SYSTEM OPERATIONAL // ACCESS GRANTED';

    // Disperse cards outward into deep 3D space
    deckCards.forEach((card, idx) => {
      const angle = (idx / deckCards.length) * Math.PI * 2;
      const distance = 800 + Math.random() * 600;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance;
      const destZ = 600 + Math.random() * 400;
      const rotZ = (Math.random() - 0.5) * 90;

      card.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease';
      card.style.transform = `translate3d(${destX.toFixed(1)}px, ${destY.toFixed(1)}px, ${destZ.toFixed(1)}px) rotateZ(${rotZ.toFixed(1)}deg) scale(1.8)`;
      card.style.opacity = '0';
    });

    // Hide HUD dock
    if (hudDock) {
      hudDock.style.opacity = '0';
      hudDock.style.pointerEvents = 'none';
    }

    // Reveal title climax
    if (titleReveal) {
      titleReveal.classList.add('reveal-active');
    }

    // Play subtle audio whoosh
    playTransitionWhoosh(520, 280);

    // Fade out stage and restore scrolling
    setTimeout(() => {
      introStage.classList.add('fade-out');
      document.body.style.overflow = '';

      setTimeout(() => {
        if (introStage.parentNode) {
          introStage.style.display = 'none';
        }
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      }, 850);
    }, 950);
  }

  // Animation Loop for 3D fanning and counter
  function stepIntro(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const rawProgress = Math.min(1, elapsed / duration);

    // Ease progress for smooth acceleration and suspense
    const easedProgress = Math.pow(rawProgress, 1.25);
    const currentPct = Math.min(100, Math.round(easedProgress * 100));

    if (counterNum) counterNum.textContent = currentPct;
    if (progressFill) progressFill.style.width = `${currentPct}%`;

    // Update status text
    for (let i = statusMilestones.length - 1; i >= 0; i--) {
      if (currentPct >= statusMilestones[i].pct) {
        if (statusText && statusText.textContent !== statusMilestones[i].text) {
          statusText.textContent = statusMilestones[i].text;
        }
        break;
      }
    }

    // Dynamic 3D fanning positioning of deck cards
    const time = timestamp * 0.0018;
    const total = deckCards.length;
    const centerIdx = total / 2;

    deckCards.forEach((card, idx) => {
      const offset = idx - centerIdx;
      const angle = offset * 4.2; // fan angle
      const spreadX = offset * 24 + mouseX * 22;
      const spreadY = Math.abs(offset) * 3 + Math.sin(time + idx * 0.4) * 6 + mouseY * 18;
      const depthZ = -Math.abs(offset) * 26 + Math.cos(time + idx * 0.3) * 12;

      card.style.transform = `
        translate3d(${spreadX.toFixed(1)}px, ${spreadY.toFixed(1)}px, ${depthZ.toFixed(1)}px)
        rotateZ(${angle.toFixed(1)}deg)
        rotateY(${(mouseX * 12).toFixed(1)}deg)
        rotateX(${(-mouseY * 10).toFixed(1)}deg)
      `;
    });

    if (rawProgress < 1 && !isFinished) {
      introRafId = requestAnimationFrame(stepIntro);
    } else if (!isFinished) {
      finishIntro();
    }
  }

  introRafId = requestAnimationFrame(stepIntro);

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      finishIntro();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      finishIntro();
    }
  });
}

/* ── 11. LENIS SMOOTH INERTIAL SCROLL ENGINE ── */
let lenisInstance = null;

function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return;

  try {
    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
      infinite: false
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenisInstance.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Connect internal anchor links to smooth scroll navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenisInstance.scrollTo(targetEl, { offset: -40, duration: 1.3 });
          }
        }
      });
    });
  } catch (err) {
    console.warn('Lenis smooth scroll initialization skipped:', err);
  }
}

/* ── 12. GSAP SCROLLTRIGGER CINEMATIC CAMERA SCENES ── */
function initScrollTriggerScenes() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  try {
    gsap.registerPlugin(ScrollTrigger);

    // Scene 01: Hero Camera Push & Depth Displacement
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scene-01-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.4
      }
    });

    // Colossal glowing typography recedes into distance
    heroTl.to('.hero-backlight-container', {
      scale: 1.25,
      opacity: 0.12,
      y: -100,
      ease: 'none'
    }, 0);

    // Central character silhouette steps into camera focus then dims
    heroTl.to('.hero-figure-wrapper', {
      scale: 0.94,
      y: -40,
      opacity: 0.25,
      ease: 'none'
    }, 0);

    // Floor perspective grid accelerates forward
    heroTl.to('.hero-floor-grid', {
      backgroundPosition: '0px 140px',
      opacity: 0.15,
      ease: 'none'
    }, 0);

    // Floating telemetry HUD elements drift outward
    heroTl.to('.hero-meta-left', {
      x: -80,
      opacity: 0,
      ease: 'none'
    }, 0);

    heroTl.to('.hero-meta-right', {
      x: 80,
      opacity: 0,
      ease: 'none'
    }, 0);

    // Scene 02: Neural Universe Orbital Dynamics & Perspective Tilt
    gsap.to('.universe-stage', {
      scrollTrigger: {
        trigger: '#scene-02-universe',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6
      },
      rotateX: -4,
      ease: 'none'
    });

    gsap.to('.universe-orbital-svg', {
      scrollTrigger: {
        trigger: '#scene-02-universe',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      },
      rotation: 30,
      transformOrigin: '50% 50%',
      ease: 'none'
    });

    // Scene 03: Radar Dish 3D Perspective Tilt
    gsap.to('.radar-dish-outer', {
      scrollTrigger: {
        trigger: '#scene-03-chronicle',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5
      },
      rotateX: 62,
      rotateZ: -25,
      ease: 'none'
    });
  } catch (e) {
    console.warn('GSAP ScrollTrigger setup:', e);
  }
}
