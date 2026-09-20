import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeTexture, SPACING } from './utils'

const rng = (seed) => {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

/* ---------------------------- Procedural textures ---------------------------- */
function gasTexture(colors, seed) {
  return makeTexture(512, 256, (ctx, w, h) => {
    const r = rng(seed)
    let y = 0
    while (y < h) {
      const bh = 5 + r() * 24
      ctx.fillStyle = colors[Math.floor(r() * colors.length)]
      ctx.fillRect(0, y, w, bh + 1)
      y += bh
    }
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = r() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.09)'
      ctx.lineWidth = 2 + r() * 7
      const yy = r() * h
      ctx.beginPath()
      ctx.moveTo(0, yy)
      for (let x = 0; x <= w; x += 16) ctx.lineTo(x, yy + Math.sin(x * 0.03 + i) * 5 * r())
      ctx.stroke()
    }
    // a storm
    const sx = w * (0.2 + r() * 0.6)
    const sy = h * (0.35 + r() * 0.3)
    const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, 34)
    g.addColorStop(0, 'rgba(255,240,220,0.7)')
    g.addColorStop(1, 'rgba(255,240,220,0)')
    ctx.fillStyle = g
    ctx.fillRect(sx - 40, sy - 40, 80, 80)
  })
}

function earthTexture(seed) {
  return makeTexture(512, 256, (ctx, w, h) => {
    const r = rng(seed)
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#dfeaff')
    g.addColorStop(0.12, '#1d56a8')
    g.addColorStop(0.88, '#1d56a8')
    g.addColorStop(1, '#dfeaff')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 46; i++) {
      ctx.fillStyle = r() > 0.35 ? '#3f8f4a' : '#a89257'
      ctx.beginPath()
      ctx.ellipse(r() * w, h * (0.18 + r() * 0.64), 8 + r() * 34, 5 + r() * 18, r() * 3, 0, 7)
      ctx.fill()
    }
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.25})`
      ctx.beginPath()
      ctx.ellipse(r() * w, r() * h, 14 + r() * 40, 3 + r() * 7, r() * 0.6, 0, 7)
      ctx.fill()
    }
  })
}

function rockyTexture(base, dark, seed) {
  return makeTexture(512, 256, (ctx, w, h) => {
    const r = rng(seed)
    ctx.fillStyle = base
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = r() > 0.5 ? dark : 'rgba(255,255,255,0.07)'
      ctx.globalAlpha = 0.08 + r() * 0.12
      ctx.beginPath()
      ctx.arc(r() * w, r() * h, 2 + r() * 14, 0, 7)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    for (let i = 0; i < 34; i++) {
      const x = r() * w
      const y = r() * h
      const rad = 4 + r() * 16
      ctx.strokeStyle = 'rgba(0,0,0,0.28)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, rad, 0, 7)
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.beginPath()
      ctx.arc(x - 1, y - 1, rad * 0.7, 0, 7)
      ctx.fill()
    }
  })
}

function ringTexture(colors, seed) {
  const t = makeTexture(256, 4, (ctx, w, h) => {
    const r = rng(seed)
    ctx.clearRect(0, 0, w, h)
    let x = 0
    while (x < w) {
      const bw = 2 + r() * 10
      ctx.fillStyle = colors[Math.floor(r() * colors.length)]
      ctx.globalAlpha = r() > 0.2 ? 0.35 + r() * 0.55 : 0.05
      ctx.fillRect(x, 0, bw, h)
      x += bw
    }
  })
  return t
}

// Planet shader: simple sun lighting, dark night side and a blue rim of atmosphere.
const vert = /* glsl */ `
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main() {
    vUv = uv;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`
const frag = /* glsl */ `
  uniform sampler2D map; uniform vec3 sun; uniform vec3 atmo;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main() {
    vec3 c = texture2D(map, vUv).rgb;
    float l = max(dot(normalize(vN), normalize(sun)), 0.0);
    float rim = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 3.0);
    vec3 col = c * (0.05 + pow(l, 0.75) * 1.1) + atmo * rim * (0.12 + l * 0.7);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`

const SUN = new THREE.Vector3(-0.55, 0.35, 0.8).normalize()

function Planet({ pos, r, map, atmo = '#6aa8ff', ring, tilt = 0.4, spin = 0.02, moon }) {
  const body = useRef()
  const holder = useRef()
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { map: { value: map }, sun: { value: SUN.clone() }, atmo: { value: new THREE.Color(atmo) } },
        vertexShader: vert,
        fragmentShader: frag,
      }),
    [map, atmo],
  )
  const ringGeo = useMemo(() => {
    if (!ring) return null
    const g = new THREE.RingGeometry(r * ring.inner, r * ring.outer, 128, 1)
    const p = g.attributes.position
    const uv = g.attributes.uv
    const v = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      uv.setXY(i, (v.length() - r * ring.inner) / (r * (ring.outer - ring.inner)), 0.5)
    }
    return g
  }, [ring, r])
  const ringTex = useMemo(() => (ring ? ringTexture(ring.colors, 5) : null), [ring])
  const moonRef = useRef()

  useFrame(({ camera, clock }, dt) => {
    mat.uniforms.sun.value.copy(SUN).transformDirection(camera.matrixWorldInverse)
    body.current.rotation.y += Math.min(dt, 0.05) * spin
    if (moonRef.current) {
      const t = clock.elapsedTime * 0.05
      moonRef.current.position.set(Math.cos(t) * r * 2.1, r * 0.25, Math.sin(t) * r * 2.1)
    }
  })

  return (
    <group position={pos} ref={holder}>
      <mesh ref={body} material={mat}>
        <sphereGeometry args={[r, 48, 32]} />
      </mesh>
      {ring && (
        <mesh geometry={ringGeo} rotation={[Math.PI / 2 - tilt, 0.2, 0]}>
          <meshBasicMaterial map={ringTex} transparent side={THREE.DoubleSide} depthWrite={false} fog={false} />
        </mesh>
      )}
      {moon && (
        <mesh ref={moonRef}>
          <sphereGeometry args={[r * 0.16, 20, 16]} />
          <meshBasicMaterial color="#9a9aa6" fog={false} />
        </mesh>
      )}
    </group>
  )
}

/* -------------------------------- Nebula -------------------------------- */
function nebulaTexture(colors, seed) {
  return makeTexture(256, 256, (ctx, w, h) => {
    const r = rng(seed)
    for (let i = 0; i < 9; i++) {
      const x = w * (0.25 + r() * 0.5)
      const y = h * (0.25 + r() * 0.5)
      const rad = 50 + r() * 70
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
      const c = colors[Math.floor(r() * colors.length)]
      g.addColorStop(0, c + 'aa')
      g.addColorStop(1, c + '00')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }
    // Fade to nothing toward the edges so no rectangle shows.
    ctx.globalCompositeOperation = 'destination-in'
    const m = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    m.addColorStop(0, 'rgba(0,0,0,1)')
    m.addColorStop(0.7, 'rgba(0,0,0,0.6)')
    m.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = m
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  })
}

function Nebula({ pos, size, colors, seed, opacity = 0.18 }) {
  const map = useMemo(() => nebulaTexture(colors, seed), [colors, seed])
  return (
    <sprite position={pos} scale={[size, size, 1]}>
      <spriteMaterial map={map} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
    </sprite>
  )
}

/* ------------------------------ Shooting star ---------------------------- */
function ShootingStars({ reduced }) {
  const mesh = useRef()
  const st = useRef({ t: 99, dur: 0.7, next: 3, dir: 1, y: 40, x: 0 })
  useFrame(({ camera }, dt) => {
    if (reduced) return
    const s = st.current
    dt = Math.min(dt, 0.05)
    s.next -= dt
    if (s.t > s.dur && s.next <= 0) {
      s.t = 0
      s.next = 4 + Math.random() * 6
      s.dir = Math.random() > 0.5 ? 1 : -1
      s.x = (Math.random() - 0.5) * 120
      s.y = 25 + Math.random() * 45
    }
    if (s.t <= s.dur) {
      s.t += dt
      const p = s.t / s.dur
      mesh.current.visible = true
      mesh.current.position.set(camera.position.x + s.x + s.dir * (p - 0.5) * 90, camera.position.y + s.y - p * 16, camera.position.z - 150)
      mesh.current.rotation.z = Math.atan2(-16, s.dir * 90)
      mesh.current.material.opacity = Math.sin(p * Math.PI) * 0.9
    } else mesh.current.visible = false
  })
  return (
    <mesh ref={mesh} visible={false}>
      <planeGeometry args={[18, 0.22]} />
      <meshBasicMaterial color="#cfe2ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
    </mesh>
  )
}

/* -------------------------------- Stars --------------------------------- */
function Stars({ tier }) {
  const bright = useRef()
  const { dim, brightPos, brightCol } = useMemo(() => {
    const spread = (n, cols) => {
      const pos = new Float32Array(n * 3)
      const col = cols ? new Float32Array(n * 3) : null
      const palette = ['#ffffff', '#cfe0ff', '#9ec2ff', '#fff2c8', '#ffd0b0'].map((c) => new THREE.Color(c))
      for (let i = 0; i < n; i++) {
        let x = (Math.random() - 0.5) * 900
        if (Math.abs(x) < 30) x += Math.sign(x || 1) * 40
        pos[i * 3] = x
        pos[i * 3 + 1] = -140 + Math.random() * 420
        pos[i * 3 + 2] = 160 - Math.random() * (SPACING * 6 + 700)
        if (col) {
          const c = palette[Math.floor(Math.random() * palette.length)]
          col.set([c.r, c.g, c.b], i * 3)
        }
      }
      return [pos, col]
    }
    const [dim] = spread(tier.stars)
    const [brightPos, brightCol] = spread(tier.bright, true)
    return { dim, brightPos, brightCol }
  }, [tier.stars, tier.bright])

  useFrame((s) => {
    bright.current.size = 2.6 + Math.sin(s.clock.elapsedTime * 1.7) * 0.35
  })

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dim, 3]} />
        </bufferGeometry>
        <pointsMaterial size={1.3} sizeAttenuation={false} color="#b8c4e6" transparent opacity={0.8} depthWrite={false} fog={false} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[brightPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[brightCol, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={bright} size={2.6} sizeAttenuation={false} vertexColors transparent depthWrite={false} fog={false} />
      </points>
    </>
  )
}

/* ------------------------------- Whole sky ------------------------------- */
export default function Space({ tier, reduced }) {
  const tex = useMemo(
    () => ({
      saturn: gasTexture(['#c9a06a', '#b98b55', '#e3c48f', '#a9794a', '#d8b27d'], 3),
      earth: earthTexture(11),
      mars: rockyTexture('#b5533a', '#5a2418', 5),
      ice: gasTexture(['#a9d6f0', '#8bc3e6', '#c7e6f7', '#7fb5dd'], 8),
      orange: gasTexture(['#e0752a', '#c85a1e', '#f0a05a', '#a84718', '#f5c48a'], 13),
      violet: gasTexture(['#7d5bd6', '#5a3fb0', '#a58af0', '#4a2f95'], 17),
      teal: gasTexture(['#2fb8a8', '#1c8f88', '#6fdcc9', '#157a76'], 21),
    }),
    [],
  )
  const ringAmber = { inner: 1.45, outer: 2.35, colors: ['#d9b98a', '#b9986a', '#efd9b0', '#8a6f4a'] }
  const ringOrange = { inner: 1.4, outer: 2.1, colors: ['#e9a46a', '#c47a44', '#f5c99a'] }

  return (
    <>
      <Stars tier={tier} />
      <ShootingStars reduced={reduced} />

      <Nebula pos={[-150, 70, -140]} size={340} colors={['#7a2cff', '#ff3314']} seed={2} opacity={0.2} />
      <Nebula pos={[170, 50, -60]} size={300} colors={['#00b7ff', '#7a2cff']} seed={4} opacity={0.16} />
      <Nebula pos={[-120, 90, -330]} size={380} colors={['#ff8400', '#ff3314']} seed={6} opacity={0.15} />
      <Nebula pos={[150, 80, -420]} size={360} colors={['#00f076', '#00b7ff']} seed={9} opacity={0.14} />

      <Planet pos={[38, 20, -80]} r={10} map={tex.saturn} atmo="#f0c890" ring={ringAmber} tilt={0.42} spin={0.015} moon />
      <Planet pos={[-46, 46, -150]} r={8} map={tex.earth} atmo="#5aa8ff" spin={0.03} moon />
      <Planet pos={[22, 7, -120]} r={5} map={tex.mars} atmo="#ff8a5a" spin={0.02} />
      <Planet pos={[-70, 30, -195]} r={13} map={tex.ice} atmo="#9fdcff" spin={0.012} />
      <Planet pos={[72, 24, -230]} r={14} map={tex.orange} atmo="#ffb070" ring={ringOrange} tilt={0.55} spin={0.014} />
      <Planet pos={[-52, 16, -270]} r={8} map={tex.violet} atmo="#b79bff" spin={0.02} />
      <Planet pos={[60, 44, -340]} r={24} map={tex.teal} atmo="#7ef2dc" spin={0.008} />
    </>
  )
}
