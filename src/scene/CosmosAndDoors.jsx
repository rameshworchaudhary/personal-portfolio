import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ROOMS } from '../data'
import { SPACING, makeTexture, damp, playDoorOpenSound } from './utils'

/* ------------------------------------------------------------------ */
/* 1. PLANETARY PROCEDURAL TEXTURE GENERATORS                        */
/* ------------------------------------------------------------------ */

// Gas Giant (Saturn / Chronos) banded atmosphere texture
function makeGasGiantTexture() {
  return makeTexture(1024, 512, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#1a1006')
    grad.addColorStop(0.15, '#c87d2b')
    grad.addColorStop(0.28, '#f3b869')
    grad.addColorStop(0.38, '#91531e')
    grad.addColorStop(0.5, '#e09f48')
    grad.addColorStop(0.62, '#6b3c14')
    grad.addColorStop(0.75, '#f4c67d')
    grad.addColorStop(0.88, '#a25922')
    grad.addColorStop(1, '#2b1709')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Atmospheric micro-bands and storms
    for (let y = 0; y < h; y += 3) {
      const alpha = 0.08 + Math.sin(y * 0.12) * 0.06
      ctx.fillStyle = y % 6 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`
      ctx.fillRect(0, y, w, 2)
    }

    // Great atmospheric oval storm
    const stormGrad = ctx.createRadialGradient(w * 0.65, h * 0.62, 5, w * 0.65, h * 0.62, 45)
    stormGrad.addColorStop(0, '#ff9033')
    stormGrad.addColorStop(0.6, '#b84e12')
    stormGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = stormGrad
    ctx.beginPath()
    ctx.ellipse(w * 0.65, h * 0.62, 55, 24, 0.1, 0, Math.PI * 2)
    ctx.fill()
  })
}

// Planetary Ring disc texture
function makeRingTexture() {
  return makeTexture(512, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    for (let x = 0; x < w; x++) {
      const p = x / w
      // Cassini division and subtle ring lanes
      let alpha = Math.sin(p * Math.PI) * 0.75
      if (p > 0.58 && p < 0.65) alpha *= 0.08 // Cassini gap
      if (p < 0.15 || p > 0.92) alpha *= 0.2
      const r = Math.floor(210 + Math.sin(x * 0.2) * 40)
      const g = Math.floor(160 + Math.sin(x * 0.3) * 35)
      const b = Math.floor(110 + Math.sin(x * 0.25) * 30)
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
      ctx.fillRect(x, 0, 1, h)
    }
  })
}

// Earth-like / Cyan Terrestrial Exoplanet texture
function makeEarthTexture() {
  return makeTexture(1024, 512, (ctx, w, h) => {
    // Deep oceans
    const seaGrad = ctx.createLinearGradient(0, 0, 0, h)
    seaGrad.addColorStop(0, '#021226')
    seaGrad.addColorStop(0.5, '#052a54')
    seaGrad.addColorStop(1, '#021226')
    ctx.fillStyle = seaGrad
    ctx.fillRect(0, 0, w, h)

    // Continents & archipelago landmasses
    ctx.fillStyle = '#1e7550'
    for (let i = 0; i < 18; i++) {
      const cx = (i * 68 + (i % 3) * 40) % w
      const cy = (h * 0.25 + (i * 47) % (h * 0.5))
      ctx.beginPath()
      ctx.arc(cx, cy, 35 + (i % 5) * 12, 0, Math.PI * 2)
      ctx.fill()
    }

    // Sandy coastal margins
    ctx.fillStyle = '#9e8b4e'
    for (let i = 0; i < 14; i++) {
      const cx = (i * 77 + 25) % w
      const cy = (h * 0.3 + (i * 39) % (h * 0.4))
      ctx.beginPath()
      ctx.arc(cx, cy, 14, 0, Math.PI * 2)
      ctx.fill()
    }

    // Polar ice caps
    ctx.fillStyle = '#e8f4fc'
    ctx.fillRect(0, 0, w, h * 0.1)
    ctx.fillRect(0, h * 0.88, w, h * 0.12)
  })
}

// Mars / Crimson Planet texture
function makeMarsTexture() {
  return makeTexture(512, 256, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#38140b')
    grad.addColorStop(0.3, '#8e3318')
    grad.addColorStop(0.6, '#b8451f')
    grad.addColorStop(0.85, '#6a220e')
    grad.addColorStop(1, '#2b0c05')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Craters and canyon basins
    ctx.fillStyle = '#260a04'
    for (let i = 0; i < 35; i++) {
      const cx = (i * 43) % w
      const cy = 20 + (i * 29) % (h - 40)
      ctx.beginPath()
      ctx.ellipse(cx, cy, 6 + (i % 4) * 5, 4 + (i % 3) * 3, i * 0.2, 0, Math.PI * 2)
      ctx.fill()
    }

    // North polar ice cap
    ctx.fillStyle = '#e6d8ce'
    ctx.fillRect(0, 0, w, 18)
  })
}

// Violet Nebula Gas Giant texture
function makeVioletGiantTexture() {
  return makeTexture(512, 256, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#10051e')
    grad.addColorStop(0.2, '#4a1168')
    grad.addColorStop(0.45, '#7b1fa2')
    grad.addColorStop(0.6, '#9c27b0')
    grad.addColorStop(0.8, '#450f61')
    grad.addColorStop(1, '#0e031a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Electric violet currents
    for (let y = 0; y < h; y += 4) {
      const alpha = 0.1 + Math.sin(y * 0.18) * 0.08
      ctx.fillStyle = `rgba(0, 229, 255, ${alpha * 0.6})`
      ctx.fillRect(0, y, w, 2)
    }
  })
}

// Ice Exoplanet (Glacies) with frozen glacier fissures
function makeIcePlanetTexture() {
  return makeTexture(512, 256, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#04162e')
    grad.addColorStop(0.3, '#104e8b')
    grad.addColorStop(0.6, '#4682b4')
    grad.addColorStop(0.85, '#87ceeb')
    grad.addColorStop(1, '#e0f7fa')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Glacier cracks and blue methane chasms
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      let x = (i * 26) % w
      let y = 10 + (i * 19) % (h - 20)
      ctx.moveTo(x, y)
      for (let s = 0; s < 5; s++) {
        x += (Math.random() - 0.5) * 40
        y += Math.random() * 25
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  })
}

// Radiant Pulsar / Dwarf Sun texture
function makePulsarTexture() {
  return makeTexture(256, 256, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.2, '#fff176')
    grad.addColorStop(0.45, '#ffa726')
    grad.addColorStop(0.7, '#ff5722')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  })
}

// Door Hologram Header Texture
function makeDoorSignTexture(numStr, title, color, isInfinity = false) {
  return makeTexture(1024, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)

    const accent = color || '#00e5ff'

    // Dark cyber panel with glowing border
    ctx.fillStyle = 'rgba(6, 9, 16, 0.95)'
    ctx.beginPath()
    ctx.roundRect(16, 16, w - 32, h - 32, 20)
    ctx.fill()

    ctx.strokeStyle = accent
    ctx.lineWidth = 4
    ctx.stroke()

    // Inner glowing corner accents
    ctx.fillStyle = accent
    ctx.fillRect(24, 24, 18, 4)
    ctx.fillRect(24, 24, 4, 18)
    ctx.fillRect(w - 42, 24, 18, 4)
    ctx.fillRect(w - 28, 24, 4, 18)
    ctx.fillRect(24, h - 28, 18, 4)
    ctx.fillRect(24, h - 42, 4, 18)
    ctx.fillRect(w - 42, h - 28, 18, 4)
    ctx.fillRect(w - 28, h - 42, 4, 18)

    // Sub header tag
    ctx.font = '700 24px "JetBrains Mono", monospace'
    ctx.fillStyle = accent
    ctx.textAlign = 'center'
    ctx.fillText(
      isInfinity
        ? 'SEC-∞ // HYPERSPACE & PORTFOLIO LOOP'
        : `GATEWAY // SECTOR ${numStr}`,
      w / 2,
      68,
    )

    // Main section title
    ctx.font = '900 52px "Outfit", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(title.toUpperCase(), w / 2, 138)

    // Status beacon text
    ctx.font = '700 22px "JetBrains Mono", monospace'
    ctx.fillStyle = '#00f076'
    ctx.fillText(
      isInfinity
        ? '[ HYPERSPACE PORTAL OPEN // CLICK TO WARP ]'
        : '[ GATEWAY OPEN // CLICK OR SCROLL TO ENTER ]',
      w / 2,
      198,
    )
  })
}

/* ------------------------------------------------------------------ */
/* 2. DYNAMIC DRIFTING STARS & METEOR SHOOTING STARS PARTICLE SYSTEMS */
/* ------------------------------------------------------------------ */

function DriftingStars({ count = 1200 }) {
  const pointsRef = useRef()
  const geoRef = useRef()

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 280
      pos[i * 3 + 1] = (Math.random() - 0.5) * 160 + 10
      pos[i * 3 + 2] = 50 - Math.random() * 550

      vel[i * 3] = (Math.random() - 0.5) * 0.4
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.3
      vel[i * 3 + 2] = 0.5 + Math.random() * 2.2 // drifting forward
    }
    return { positions: pos, velocities: vel }
  }, [count])

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05)
    if (!geoRef.current) return
    const attr = geoRef.current.attributes.position
    const p = attr.array
    for (let i = 0; i < count; i++) {
      p[i * 3] += velocities[i * 3] * dt
      p[i * 3 + 1] += velocities[i * 3 + 1] * dt
      p[i * 3 + 2] += velocities[i * 3 + 2] * dt

      // Wrap around if passing camera
      if (p[i * 3 + 2] > 60) {
        p[i * 3 + 2] = -480
        p[i * 3] = (Math.random() - 0.5) * 280
        p[i * 3 + 1] = (Math.random() - 0.5) * 160 + 10
      }
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        color="#a5d8ff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function ShootingStars() {
  const lineGroup = useRef()
  const meteors = useMemo(() => {
    return Array.from({ length: 6 }).map(() => ({
      active: false,
      progress: 0,
      x: 0,
      y: 0,
      z: 0,
      dx: 0,
      dy: 0,
      dz: 0,
      speed: 0,
      len: 0,
    }))
  }, [])

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05)
    if (!lineGroup.current) return

    meteors.forEach((m, idx) => {
      const child = lineGroup.current.children[idx]
      if (!child) return

      if (!m.active) {
        // Randomly spawn shooting star
        if (Math.random() < 0.02) {
          m.active = true
          m.progress = 0
          m.x = (Math.random() - 0.5) * 220
          m.y = 40 + Math.random() * 80
          m.z = -50 - Math.random() * 350
          m.dx = (Math.random() - 0.5) * 80 - 40
          m.dy = -Math.random() * 50 - 20
          m.dz = (Math.random() - 0.5) * 60
          m.speed = 1.2 + Math.random() * 1.5
          m.len = 16 + Math.random() * 18
        }
        child.visible = false
        return
      }

      m.progress += dt * m.speed
      if (m.progress >= 1) {
        m.active = false
        child.visible = false
        return
      }

      child.visible = true
      const curX = m.x + m.dx * m.progress
      const curY = m.y + m.dy * m.progress
      const curZ = m.z + m.dz * m.progress

      const dirX = m.dx * 0.15
      const dirY = m.dy * 0.15
      const dirZ = m.dz * 0.15

      const geo = child.geometry
      const pos = geo.attributes.position.array
      pos[0] = curX
      pos[1] = curY
      pos[2] = curZ
      pos[3] = curX - dirX
      pos[4] = curY - dirY
      pos[5] = curZ - dirZ
      geo.attributes.position.needsUpdate = true

      const alpha = Math.sin(m.progress * Math.PI) * 0.85
      child.material.opacity = alpha
    })
  })

  return (
    <group ref={lineGroup}>
      {meteors.map((_, i) => (
        <lineSegments key={i} visible={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[new Float32Array(6), 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#00f0ff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </lineSegments>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 3. REALISTIC 3D CELESTIAL BODIES (PARALLAX-SCROLLING PLANETS)      */
/* ------------------------------------------------------------------ */

export function CosmicSpace({ tier }) {
  const chronosGroup = useRef()
  const chronosMesh = useRef()
  const gaiaGroup = useRef()
  const gaiaMesh = useRef()
  const aresGroup = useRef()
  const aresMesh = useRef()
  const elysiumGroup = useRef()
  const elysiumMesh = useRef()
  const glaciesGroup = useRef()
  const glaciesMesh = useRef()
  const pulsarGroup = useRef()

  const saturnTex = useMemo(() => makeGasGiantTexture(), [])
  const ringTex = useMemo(() => makeRingTexture(), [])
  const earthTex = useMemo(() => makeEarthTexture(), [])
  const marsTex = useMemo(() => makeMarsTexture(), [])
  const violetTex = useMemo(() => makeVioletGiantTexture(), [])
  const iceTex = useMemo(() => makeIcePlanetTexture(), [])
  const pulsarTex = useMemo(() => makePulsarTexture(), [])

  // Thousands of deep cosmos stars
  const { starPos, starCols } = useMemo(() => {
    const count = tier.low ? 1800 : 4200
    const pos = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#a8cfff'),
      new THREE.Color('#ffd6aa'),
      new THREE.Color('#00f0ff'),
      new THREE.Color('#ff5533'),
      new THREE.Color('#e0b0ff'),
    ]

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const radius = 55 + Math.random() * 280
      const x = Math.cos(theta) * radius
      const y = (Math.random() - 0.5) * 240 + 20
      const z = 80 - Math.random() * (SPACING * 9 + 500)

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      const c = palette[Math.floor(Math.random() * palette.length)]
      cols[i * 3] = c.r
      cols[i * 3 + 1] = c.g
      cols[i * 3 + 2] = c.b
    }
    return { starPos: pos, starCols: cols }
  }, [tier.low])

  // Parallax scrolling and orbital drift computation
  useFrame(({ camera, clock }, dt) => {
    dt = Math.min(dt, 0.05)
    const t = clock.elapsedTime
    const camX = camera.position.x
    const camY = camera.position.y
    const camZ = camera.position.z

    // Spin rotations
    if (chronosMesh.current) chronosMesh.current.rotation.y += dt * 0.04
    if (gaiaMesh.current) gaiaMesh.current.rotation.y += dt * 0.06
    if (aresMesh.current) aresMesh.current.rotation.y += dt * 0.03
    if (elysiumMesh.current) elysiumMesh.current.rotation.y += dt * 0.02
    if (glaciesMesh.current) glaciesMesh.current.rotation.y += dt * 0.05

    // Realistic depth parallax shifts based on distance from camera track
    // Planet 1: Chronos (Gas Giant with Rings)
    if (chronosGroup.current) {
      chronosGroup.current.position.x = -110 + camX * 0.18 + Math.sin(t * 0.03) * 3
      chronosGroup.current.position.y = 42 + (camY - 3) * 0.12 + Math.cos(t * 0.03) * 2
      chronosGroup.current.position.z = -115 + (camZ + 115) * 0.08
    }

    // Planet 2: Gaia (Terrestrial exoplanet)
    if (gaiaGroup.current) {
      gaiaGroup.current.position.x = 115 + camX * 0.28 + Math.cos(t * 0.04) * 4
      gaiaGroup.current.position.y = -12 + (camY - 3) * 0.18 + Math.sin(t * 0.04) * 2
      gaiaGroup.current.position.z = -75 + (camZ + 75) * 0.12
    }

    // Planet 3: Ares (Crimson Mars)
    if (aresGroup.current) {
      aresGroup.current.position.x = 90 + camX * 0.14 + Math.sin(t * 0.02) * 2.5
      aresGroup.current.position.y = 52 + (camY - 3) * 0.1 + Math.cos(t * 0.02) * 2
      aresGroup.current.position.z = -185 + (camZ + 185) * 0.06
    }

    // Planet 4: Elysium (Violet Gas Giant)
    if (elysiumGroup.current) {
      elysiumGroup.current.position.x = -125 + camX * 0.09 + Math.cos(t * 0.015) * 3
      elysiumGroup.current.position.y = -28 + (camY - 3) * 0.08
      elysiumGroup.current.position.z = -270 + (camZ + 270) * 0.04
    }

    // Planet 5: Glacies (Frozen Ice World)
    if (glaciesGroup.current) {
      glaciesGroup.current.position.x = 88 + camX * 0.07
      glaciesGroup.current.position.y = 28 + (camY - 3) * 0.06
      glaciesGroup.current.position.z = -340 + (camZ + 340) * 0.03
    }

    // Distant Pulsar / Sun (Pulsing corona)
    if (pulsarGroup.current) {
      pulsarGroup.current.position.x = -160 + camX * 0.03
      pulsarGroup.current.position.y = 85 + (camY - 3) * 0.03
      pulsarGroup.current.position.z = -460 + (camZ + 460) * 0.01
      const scale = 1 + Math.sin(t * 2.5) * 0.08
      pulsarGroup.current.scale.setScalar(scale)
    }
  })

  return (
    <group>
      {/* ── Deep Static Starfield ── */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[starCols, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={tier.low ? 0.18 : 0.24}
          vertexColors
          transparent
          opacity={0.92}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* ── Dynamic Drifting Stardust Particles ── */}
      <DriftingStars count={tier.low ? 600 : 1200} />

      {/* ── Periodic Shooting Stars / Meteors ── */}
      <ShootingStars />

      {/* ── Volumetric Glowing Nebula Clouds ── */}
      {/* Cyan Nebula Cluster */}
      <mesh position={[-85, 45, -90]}>
        <sphereGeometry args={[50, 16, 16]} />
        <meshBasicMaterial
          color="#00a8ff"
          transparent
          opacity={0.065}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Crimson / Amber Nebula Cluster */}
      <mesh position={[95, -20, -160]}>
        <sphereGeometry args={[60, 16, 16]} />
        <meshBasicMaterial
          color="#ff4411"
          transparent
          opacity={0.055}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Deep Violet Hyperspace Nebula */}
      <mesh position={[-40, 60, -260]}>
        <sphereGeometry args={[75, 16, 16]} />
        <meshBasicMaterial
          color="#9c27b0"
          transparent
          opacity={0.075}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Golden Solar Nebula */}
      <mesh position={[-140, 75, -420]}>
        <sphereGeometry args={[85, 16, 16]} />
        <meshBasicMaterial
          color="#ff9900"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── PLANET 1: CHRONOS (Ringed Gas Giant / Saturn-like) ── */}
      <group ref={chronosGroup} position={[-110, 42, -115]} rotation={[0.4, 0.2, -0.35]}>
        <mesh ref={chronosMesh}>
          <sphereGeometry args={[20, 36, 36]} />
          <meshStandardMaterial map={saturnTex} roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Tilted Ring System */}
        <mesh rotation={[Math.PI / 2 + 0.1, 0, 0]}>
          <ringGeometry args={[26, 48, 64]} />
          <meshStandardMaterial
            map={ringTex}
            side={THREE.DoubleSide}
            transparent
            opacity={0.88}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* ── PLANET 2: GAIA (Azure & Emerald Terrestrial Exoplanet) ── */}
      <group ref={gaiaGroup} position={[115, -12, -75]}>
        <mesh ref={gaiaMesh}>
          <sphereGeometry args={[15, 36, 36]} />
          <meshStandardMaterial map={earthTex} roughness={0.6} metalness={0.15} />
        </mesh>
        {/* Atmospheric Rayleigh Cyan Glow Shell */}
        <mesh>
          <sphereGeometry args={[15.7, 32, 32]} />
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* ── PLANET 3: ARES (Crimson Martian World) ── */}
      <group ref={aresGroup} position={[90, 52, -185]} rotation={[0.2, 0.4, 0.1]}>
        <mesh ref={aresMesh}>
          <sphereGeometry args={[12, 32, 32]} />
          <meshStandardMaterial map={marsTex} roughness={0.85} metalness={0.05} />
        </mesh>
        <mesh>
          <sphereGeometry args={[12.5, 24, 24]} />
          <meshBasicMaterial
            color="#ff5522"
            transparent
            opacity={0.14}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* ── PLANET 4: ELYSIUM (Violet Deep Space Giant) ── */}
      <group ref={elysiumGroup} position={[-125, -28, -270]}>
        <mesh ref={elysiumMesh}>
          <sphereGeometry args={[26, 32, 32]} />
          <meshStandardMaterial map={violetTex} roughness={0.65} metalness={0.2} />
        </mesh>
        <mesh>
          <sphereGeometry args={[27.2, 28, 28]} />
          <meshBasicMaterial
            color="#b388ff"
            transparent
            opacity={0.16}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* ── PLANET 5: GLACIES (Frozen Ice Exoplanet with Crystal Ring) ── */}
      <group ref={glaciesGroup} position={[88, 28, -340]}>
        <mesh ref={glaciesMesh}>
          <sphereGeometry args={[14, 32, 32]} />
          <meshStandardMaterial map={iceTex} roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh>
          <sphereGeometry args={[14.6, 24, 24]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.18}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {/* Fine Ice Ring */}
        <mesh rotation={[Math.PI / 2 + 0.3, 0.2, 0]}>
          <ringGeometry args={[18, 24, 48]} />
          <meshBasicMaterial
            color="#a7f3d0"
            side={THREE.DoubleSide}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* ── PULSAR SOLIS (Radiant Golden Micro-Star) ── */}
      <group ref={pulsarGroup} position={[-160, 85, -460]}>
        <mesh>
          <sphereGeometry args={[16, 24, 24]} />
          <meshBasicMaterial map={pulsarTex} />
        </mesh>
        <mesh>
          <sphereGeometry args={[22, 24, 24]} />
          <meshBasicMaterial
            color="#ffbb00"
            transparent
            opacity={0.25}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 3. INTERACTIVE SCI-FI BLAST DOORS BETWEEN ROOMS                   */
/* ------------------------------------------------------------------ */

export function SciFiDoor({
  doorIndex,
  targetRoomIndex,
  currentRoom,
  isOpen = true,
  onOpen,
  doorZ,
  title,
  color = '#ff8400',
  reduced = false,
}) {
  const [hovered, setHovered] = useState(false)
  const leftDoor = useRef()
  const rightDoor = useRef()

  const numStr = String(targetRoomIndex + 1).padStart(2, '0')
  const signTex = useMemo(
    () => makeDoorSignTexture(numStr, title, color, false),
    [numStr, title, color],
  )

  // Door is kept open by default as requested
  const opened = true

  useFrame((s, dt) => {
    dt = Math.min(dt, 0.05)
    // Left and right blast leaves docked open to each side
    const targetOffset = 6.0
    const lerpSpeed = reduced ? 8 : 4.5

    if (leftDoor.current) {
      leftDoor.current.position.x = damp(leftDoor.current.position.x, -2.6 - targetOffset, lerpSpeed, dt)
    }
    if (rightDoor.current) {
      rightDoor.current.position.x = damp(rightDoor.current.position.x, 2.6 + targetOffset, lerpSpeed, dt)
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    playDoorOpenSound()
    onOpen(targetRoomIndex)
  }

  return (
    <group position={[0, 0, doorZ]}>
      {/* ── Heavy Sci-Fi Portal Frame ── */}
      {/* Left Pylon Pillar */}
      <mesh position={[-6.2, 4.5, 0]}>
        <boxGeometry args={[1.6, 9, 1.4]} />
        <meshStandardMaterial color="#0c101a" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Right Pylon Pillar */}
      <mesh position={[6.2, 4.5, 0]}>
        <boxGeometry args={[1.6, 9, 1.4]} />
        <meshStandardMaterial color="#0c101a" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Top Lintel Beam */}
      <mesh position={[0, 9.4, 0]}>
        <boxGeometry args={[14, 1.6, 1.6]} />
        <meshStandardMaterial color="#121824" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Ground Threshold Ramp */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[14, 0.4, 2.2]} />
        <meshStandardMaterial color="#080b12" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* ── Holographic Section Nameplate Sign ── */}
      <mesh
        position={[0, 11, 0.4]}
        rotation={[-0.05, 0, 0]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          setHovered(true)
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
          setHovered(false)
        }}
      >
        <planeGeometry args={[10.5, 2.6]} />
        <meshBasicMaterial map={signTex} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* ── Interactive Click Hitbox across entire portal ── */}
      <mesh
        position={[0, 4.5, 0]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          setHovered(true)
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
          setHovered(false)
        }}
      >
        <boxGeometry args={[14, 10, 3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ── Sliding Blast Door: Left Leaf (docked open) ── */}
      <group ref={leftDoor} position={[-8.6, 4.5, 0]}>
        <mesh
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setHovered(true)
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default'
            setHovered(false)
          }}
        >
          <boxGeometry args={[5.2, 8.2, 0.45]} />
          <meshStandardMaterial color={hovered ? '#1a2233' : '#0e131d'} metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Left door decorative ribs */}
        <mesh position={[0, 0, 0.26]}>
          <boxGeometry args={[4.6, 0.3, 0.08]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, -2, 0.26]}>
          <boxGeometry args={[4.6, 0.3, 0.08]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* ── Sliding Blast Door: Right Leaf (docked open) ── */}
      <group ref={rightDoor} position={[8.6, 4.5, 0]}>
        <mesh
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setHovered(true)
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default'
            setHovered(false)
          }}
        >
          <boxGeometry args={[5.2, 8.2, 0.45]} />
          <meshStandardMaterial color={hovered ? '#1a2233' : '#0e131d'} metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Right door decorative ribs */}
        <mesh position={[0, 0, 0.26]}>
          <boxGeometry args={[4.6, 0.3, 0.08]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, -2, 0.26]}>
          <boxGeometry args={[4.6, 0.3, 0.08]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Threshold Runner Lights */}
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={x} position={[x, 0.42, 0]}>
          <boxGeometry args={[0.6, 0.05, 1.8]} />
          <meshBasicMaterial color="#00f076" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 4. THE INFINITY WARP DOOR (STATIONED AFTER ROOM 5 - CONTACT)       */
/* ------------------------------------------------------------------ */

export function InfinityDoor({ doorZ, isOpen = true, onEnterInfinity, reduced = false }) {
  const [hovered, setHovered] = useState(false)
  const leftDoor = useRef()
  const rightDoor = useRef()
  const vortexDisc = useRef()
  const irisRing = useRef()

  const opened = true

  const signTex = useMemo(
    () => makeDoorSignTexture('∞', 'INFINITY HYPERSPACE PORTAL', '#00f076', true),
    [],
  )

  useFrame((s, dt) => {
    dt = Math.min(dt, 0.05)
    const t = s.clock.elapsedTime

    if (vortexDisc.current) {
      vortexDisc.current.rotation.z += dt * 2.0
      vortexDisc.current.scale.setScalar(1 + Math.sin(t * 4) * 0.06)
    }
    if (irisRing.current) {
      irisRing.current.rotation.z -= dt * 1.5
    }

    const targetOffset = 7.0
    if (leftDoor.current) {
      leftDoor.current.position.x = damp(leftDoor.current.position.x, -2.6 - targetOffset, 5, dt)
    }
    if (rightDoor.current) {
      rightDoor.current.position.x = damp(rightDoor.current.position.x, 2.6 + targetOffset, 5, dt)
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    playDoorOpenSound()
    onEnterInfinity()
  }

  return (
    <group position={[0, 0, doorZ]}>
      {/* ── Massive Stargate Ring Arch ── */}
      <mesh position={[0, 5.5, 0]}>
        <torusGeometry args={[5.8, 0.8, 24, 48]} />
        <meshStandardMaterial color="#0b101c" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Rotating Cyber Iris Gear */}
      <mesh ref={irisRing} position={[0, 5.5, -0.2]}>
        <ringGeometry args={[4.8, 5.6, 32]} />
        <meshBasicMaterial color="#00f076" wireframe transparent opacity={0.65} />
      </mesh>

      {/* Swirling Hyperspace Vortex Energy Disk */}
      <mesh ref={vortexDisc} position={[0, 5.5, -0.4]}>
        <circleGeometry args={[4.8, 48]} />
        <meshBasicMaterial
          color="#00f076"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Top Lintel Bridge */}
      <mesh position={[0, 11.6, 0]}>
        <boxGeometry args={[15, 1.6, 1.8]} />
        <meshStandardMaterial color="#101726" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Left/Right Tower Columns */}
      <mesh position={[-6.8, 5.5, 0]}>
        <boxGeometry args={[1.8, 11, 1.6]} />
        <meshStandardMaterial color="#0c121e" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[6.8, 5.5, 0]}>
        <boxGeometry args={[1.8, 11, 1.6]} />
        <meshStandardMaterial color="#0c121e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Holographic Header Sign */}
      <mesh
        position={[0, 13.2, 0.5]}
        rotation={[-0.05, 0, 0]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          setHovered(true)
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
          setHovered(false)
        }}
      >
        <planeGeometry args={[11.5, 2.8]} />
        <meshBasicMaterial map={signTex} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* Click Hitbox across entire Stargate portal */}
      <mesh
        position={[0, 5.5, 0]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          setHovered(true)
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
          setHovered(false)
        }}
      >
        <boxGeometry args={[15, 12, 3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Left Sliding Blast Leaf (docked open) */}
      <group ref={leftDoor} position={[-9.6, 5.5, 0]}>
        <mesh
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setHovered(true)
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default'
            setHovered(false)
          }}
        >
          <boxGeometry args={[5.2, 9.6, 0.5]} />
          <meshStandardMaterial color={hovered ? '#182438' : '#0a0f19'} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <boxGeometry args={[4.4, 0.35, 0.1]} />
          <meshBasicMaterial color="#00f076" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Right Sliding Blast Leaf (docked open) */}
      <group ref={rightDoor} position={[9.6, 5.5, 0]}>
        <mesh
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setHovered(true)
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default'
            setHovered(false)
          }}
        >
          <boxGeometry args={[5.2, 9.6, 0.5]} />
          <meshStandardMaterial color={hovered ? '#182438' : '#0a0f19'} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <boxGeometry args={[4.4, 0.35, 0.1]} />
          <meshBasicMaterial color="#00f076" transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 5. INFINITY HYPERSPACE WARP TUNNEL RUNNER                         */
/* ------------------------------------------------------------------ */

export function InfinityHyperspaceTunnel({ active }) {
  const tunnelRef = useRef()
  const ringCount = 28

  useFrame(({ camera }, dt) => {
    if (!active) return
    if (tunnelRef.current) {
      tunnelRef.current.position.z = camera.position.z - 40
      tunnelRef.current.rotation.z += dt * 0.4
    }
  })

  if (!active) return null

  return (
    <group ref={tunnelRef}>
      {Array.from({ length: ringCount }).map((_, i) => {
        const z = -i * 18
        const scale = 1 + (i % 3) * 0.2
        const col = i % 2 === 0 ? '#00f076' : '#00e5ff'
        return (
          <mesh key={i} position={[0, 3, z]} scale={scale}>
            <torusGeometry args={[8.5, 0.15, 12, 36]} />
            <meshBasicMaterial color={col} transparent opacity={0.45} blending={THREE.AdditiveBlending} />
          </mesh>
        )
      })}
    </group>
  )
}
