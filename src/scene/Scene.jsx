import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  ROOMS,
  SKILLS,
  CAT_COLOR,
  EXPERIENCE,
  EDUCATION,
  PROJECTS,
  PROFILE,
  projectMatches,
} from '../data'
import { SPACING, roomZ, makeTexture, wrapText, fitFont, damp } from './utils'
import Space from './Space'

/* ------------------------------------------------------------------ */
/* Per-room camera framing. dist = camera distance from the room centre */
/* ------------------------------------------------------------------ */
const CAM = [
  { dist: 13, h: 2.6, lookY: 3.3 }, // home
  { dist: 19, h: 4.4, lookY: 3.3 }, // universe
  { dist: 16, h: 3.4, lookY: 3.4 }, // experience
  { dist: 17, h: 4.6, lookY: 2.2 }, // education
  { dist: 22, h: 3.8, lookY: 3.4 }, // theater
  { dist: 15, h: 3.0, lookY: 3.4 }, // contact
  { dist: 20, h: 4.2, lookY: 3.6 }, // infinity
]

/* ------------------------------ Camera ------------------------------ */
// Door stations: the camera stops in front of a closed door between two rooms.
const DOOR_CAM = { dist: 12.5, h: 3.8, lookY: 3.9 }
const doorZ = (i) => -(i + 0.5) * SPACING

function CameraRig({ room, atDoor, compact, enabled, reduced }) {
  const { camera, size, pointer } = useThree()
  const look = useRef(new THREE.Vector3(0, 3, 30))
  const roll = useRef(0)

  useFrame((_, dt) => {
    if (!enabled) return
    dt = Math.min(dt, 0.05)
    const cfg = atDoor ? DOOR_CAM : (CAM[room] || CAM[0])
    const focusZ = atDoor ? doorZ(room) : roomZ(room)
    const aspect = size.width / size.height

    // Portrait screens are narrow: pull the camera back so the centerpiece fits.
    let dist = cfg.dist
    if (atDoor) dist = compact ? 15 : cfg.dist
    else if (compact) dist *= Math.min(1.5, Math.max(1, 0.62 / aspect))
    const tz = focusZ + dist

    // Shift the centerpiece away from the text panel (the panel is hidden at doors).
    let lx = 0
    let ly = cfg.lookY
    if (!atDoor) {
      if (compact) ly -= 0.25 * dist
      else lx = -0.187 * aspect * dist
    }

    const par = reduced ? 0 : 1
    const px = pointer.x * 0.7 * par
    const py = pointer.y * 0.3 * par

    const travel = Math.abs(tz - camera.position.z)

    // When flying past a room centre, rise above it instead of clipping through it.
    const n = Math.max(0, Math.min(ROOMS.length - 1, Math.round(-camera.position.z / SPACING)))
    const dz = camera.position.z - roomZ(n)
    const lift = reduced ? 0 : 9 * Math.exp(-(dz * dz) / 50) * Math.min(Math.max((travel - 1) / 5, 0), 1)

    camera.position.x = damp(camera.position.x, px, 2.5, dt)
    camera.position.y = damp(camera.position.y, cfg.h + py + lift, 4, dt)
    camera.position.z = damp(camera.position.z, tz, reduced ? 6 : 2.2, dt)

    look.current.x = damp(look.current.x, lx, 3, dt)
    look.current.y = damp(look.current.y, ly, 3, dt)
    look.current.z = damp(look.current.z, atDoor ? focusZ : focusZ - 2, 3, dt)
    camera.lookAt(look.current)
    roll.current = damp(roll.current, -pointer.x * 0.035 * par, 3, dt)
    camera.rotateZ(roll.current)

    // Wider lens for the door view on narrow phones, plus a small push while travelling.
    const baseFov = atDoor && compact ? 80 : 55
    const fov = baseFov + (reduced ? 0 : Math.min(travel * 0.16, 9))
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = damp(camera.fov, fov, 4, dt)
      camera.updateProjectionMatrix()
    }
  })
  return null
}

/* --------------------------- Warp streaks --------------------------- */
function WarpStreaks({ reduced }) {
  const group = useRef()
  const mat = useRef()
  const prev = useRef(null)
  const speed = useRef(0)
  const pos = useMemo(() => {
    const n = 260
    const a = new Float32Array(n * 6)
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * 44
      const y = Math.random() * 16
      const z = 10 - Math.random() * 70
      a.set([x, y, z, x, y, z - 0.6], i * 6)
    }
    return a
  }, [])
  useFrame(({ camera }, dt) => {
    dt = Math.min(dt, 0.05)
    if (prev.current === null) prev.current = camera.position.z
    const v = Math.abs(camera.position.z - prev.current) / Math.max(dt, 0.001)
    prev.current = camera.position.z
    speed.current = damp(speed.current, v, 8, dt)
    group.current.position.z = camera.position.z
    group.current.scale.z = 1 + speed.current * 0.09
    mat.current.opacity = reduced ? 0 : Math.min(Math.max((speed.current - 6) / 45, 0), 0.75)
  })
  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={mat}
          color="#ffb066"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  )
}

/* ------------------------------ Lights ------------------------------ */
function Lights({ colorIndex }) {
  const light = useRef()
  const target = useMemo(() => new THREE.Color(), [])
  const safeIndex = Math.max(0, Math.min(ROOMS.length - 1, colorIndex))
  useFrame(({ camera }, dt) => {
    target.set(ROOMS[safeIndex].color)
    light.current.color.lerp(target, 1 - Math.exp(-Math.min(dt, 0.05) * 3))
    light.current.position.set(camera.position.x, camera.position.y + 2.5, camera.position.z - 7)
  })
  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight ref={light} intensity={110} distance={46} decay={2} />
    </>
  )
}

/* ------------------------------- Doors ------------------------------ */
const DOOR_W = 9
const DOOR_H = 8.2
const GAP = 0.3
const LEAF = DOOR_W / 2

function wrapLines(ctx, text, maxW) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  words.forEach((w) => {
    const t = line ? `${line} ${w}` : w
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = t
  })
  lines.push(line)
  return lines
}

// Lemniscate infinity curve trace
function drawInfinity(ctx, cx, cy, a, color) {
  const trace = () => {
    ctx.beginPath()
    for (let i = 0; i <= 260; i++) {
      const t = (i / 260) * Math.PI * 2
      const d = 1 + Math.sin(t) ** 2
      const x = cx + (a * Math.cos(t)) / d
      const y = cy + ((a * Math.sin(t) * Math.cos(t)) / d) * 1.15
      if (i) ctx.lineTo(x, y)
      else ctx.moveTo(x, y)
    }
    ctx.closePath()
  }
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 34
  ctx.lineWidth = 18
  trace()
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#ffffff'
  ctx.globalAlpha = 0.95
  ctx.lineWidth = 6
  trace()
  ctx.stroke()
  ctx.restore()
}

// One texture for the whole door. Each leaf shows half, so the symbol and name split when it opens.
function drawDoor(ctx, w, h, title, num, color, isInfinity = false) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  if (isInfinity) {
    g.addColorStop(0, '#100a26')
    g.addColorStop(0.5, '#071829')
    g.addColorStop(1, '#05070f')
  } else {
    g.addColorStop(0, '#1b2030')
    g.addColorStop(1, '#0b0d14')
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = color
  ctx.globalAlpha = 0.85
  ctx.lineWidth = 6
  ctx.strokeRect(30, 30, w / 2 - 46, h - 60)
  ctx.strokeRect(w / 2 + 16, 30, w / 2 - 46, h - 60)
  ctx.globalAlpha = 1
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  ctx.fillRect(w / 2 - 3, 0, 6, h)

  // Prominent Glowing Infinity Symbol on the top half
  drawInfinity(ctx, w / 2, h * (isInfinity ? 0.24 : 0.19), isInfinity ? 260 : 215, color)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.font = '600 36px "JetBrains Mono", monospace'
  const roomLabel = isInfinity ? 'GATEWAY // ANANTA DWAR' : `Room ${String(num).padStart(2, '0')}`
  ctx.fillText(roomLabel, w / 2, h * (isInfinity ? 0.42 : 0.35))

  ctx.fillStyle = '#ffffff'
  ctx.font = isInfinity ? '900 112px Outfit, sans-serif' : '800 108px Outfit, sans-serif'
  const displayTitle = isInfinity ? 'THE INFINITY DOOR' : title
  const lines = wrapLines(ctx, displayTitle, w - 230)
  lines.forEach((ln, i) => ctx.fillText(ln, w / 2, h * 0.55 + (i - (lines.length - 1) / 2) * 122))

  ctx.fillStyle = isInfinity ? '#00f0ff' : '#8b92a5'
  ctx.font = '500 38px "Plus Jakarta Sans", sans-serif'
  ctx.fillText(isInfinity ? 'Click to open / close [∞]' : 'Click door to open / close', w / 2, h * 0.83)
}

const halfTexture = (base, offset) => {
  const t = base.clone()
  t.repeat.set(0.5, 1)
  t.offset.set(offset, 0)
  t.needsUpdate = true
  return t
}

function Door({ index, open, ahead, onToggle }) {
  const target = ROOMS[index + 1]
  const isInfinityDoor = index === 5 // The door leading to Room 6 (Infinity)
  const left = useRef()
  const right = useRef()
  const strip = useRef()
  const spill = useRef()
  const knobs = useRef()
  const ang = useRef(0)
  const doorColor = isInfinityDoor ? '#00f0ff' : target.color
  const frameColor = useMemo(() => new THREE.Color(doorColor).multiplyScalar(0.7), [doorColor])

  const base = useMemo(
    () =>
      makeTexture(1024, 932, (ctx, w, h) =>
        drawDoor(ctx, w, h, target.title, index + 2, doorColor, isInfinityDoor),
      ),
    [target, index, doorColor, isInfinityDoor],
  )
  const [texL, texR] = useMemo(() => [halfTexture(base, 0), halfTexture(base, 0.5)], [base])
  const spillTex = useMemo(
    () =>
      makeTexture(64, 256, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h)
        g.addColorStop(0, 'rgba(255,255,255,0.95)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }),
    [],
  )

  // Receding corridor frames
  const tunnel = useMemo(() => {
    const pos = []
    const col = []
    const c = new THREE.Color(doorColor)
    const count = isInfinityDoor ? 12 : 7
    for (let k = 1; k <= count; k++) {
      const w = DOOR_W / 2 + 0.6 + k * 0.55
      const h = DOOR_H + GAP + 0.6 + k * 0.45
      const zz = k * 1.4
      const f = Math.pow(1 - k / (count + 1), 1.4)
      const seg = [[-w, 0, -w, h], [-w, h, w, h], [w, h, w, 0]]
      seg.forEach(([x1, y1, x2, y2]) => {
        pos.push(x1, y1, zz, x2, y2, zz)
        col.push(c.r * f, c.g * f, c.b * f, c.r * f, c.g * f, c.b * f)
      })
    }
    return { pos: new Float32Array(pos), col: new Float32Array(col) }
  }, [doorColor, isInfinityDoor])

  useFrame((s, dt) => {
    dt = Math.min(dt, 0.05)
    ang.current = damp(ang.current, open ? 1.75 : 0, 3.2, dt)
    left.current.rotation.y = ang.current
    right.current.rotation.y = -ang.current
    const closed = 1 - ang.current / 1.75
    const pulse = ahead ? 0.5 + Math.sin(s.clock.elapsedTime * 3) * 0.25 : 0.35
    strip.current.material.opacity = (0.35 + pulse * 0.55) * closed
    spill.current.material.opacity = (0.18 + pulse * 0.25) * closed
    strip.current.visible = closed > 0.02
    spill.current.visible = closed > 0.02
    knobs.current.scale.setScalar(ahead ? 1 + Math.sin(s.clock.elapsedTime * 4) * 0.28 : 1)
  })

  const leaf = (side) => {
    const sgn = side === 'L' ? 1 : -1
    return (
      <group ref={side === 'L' ? left : right} position={[-sgn * (DOOR_W / 2), 0, 0]}>
        <group position={[sgn * (LEAF / 2), GAP + DOOR_H / 2, 0]}>
          <mesh>
            <boxGeometry args={[LEAF, DOOR_H, 0.24]} />
            <meshStandardMaterial color="#141824" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.125]}>
            <planeGeometry args={[LEAF, DOOR_H]} />
            <meshBasicMaterial map={side === 'L' ? texL : texR} />
          </mesh>
        </group>
      </group>
    )
  }

  return (
    <group position={[0, 0, doorZ(index)]}>
      {/* Frame */}
      {[-1, 1].map((sgn) => (
        <mesh key={sgn} position={[sgn * (DOOR_W / 2 + 0.3), (DOOR_H + GAP) / 2 + 0.3, 0]}>
          <boxGeometry args={[0.45, DOOR_H + GAP + 0.6, 0.7]} />
          <meshBasicMaterial color={frameColor} />
        </mesh>
      ))}
      <mesh position={[0, DOOR_H + GAP + 0.3, 0]}>
        <boxGeometry args={[DOOR_W + 1.2, 0.6, 0.7]} />
        <meshBasicMaterial color={frameColor} />
      </mesh>

      {/* Threshold leak light */}
      <mesh ref={strip} position={[0, GAP / 2, -0.06]}>
        <planeGeometry args={[DOOR_W, GAP]} />
        <meshBasicMaterial color={doorColor} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={spill} position={[0, 0.03, 2.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[DOOR_W - 0.4, 5.8]} />
        <meshBasicMaterial map={spillTex} color={doorColor} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Door leaves */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          if (ahead && onToggle) onToggle(index)
        }}
        onPointerOver={() => ahead && (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        {leaf('L')}
        {leaf('R')}
        <mesh position={[0, GAP + DOOR_H / 2, 0.3]}>
          <planeGeometry args={[DOOR_W, DOOR_H]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* Knobs / Infinity beacons */}
      <group ref={knobs}>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, GAP + DOOR_H * 0.28, 0.3]}>
            <sphereGeometry args={[isInfinityDoor ? 0.2 : 0.14, 16, 16]} />
            <meshBasicMaterial color={doorColor} />
          </mesh>
        ))}
      </group>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[tunnel.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[tunnel.col, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.6} />
      </lineSegments>
    </group>
  )
}

/* --------------------------- Environment ---------------------------- */
function Runway() {
  const RUN_LEN = 440 // Extends cleanly across all 7 rooms
  const midZ = 45 - RUN_LEN / 2
  const grid = useMemo(() => {
    const t = makeTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = '#0b0d15'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(255,90,60,0.22)'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, w, h)
    })
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(13, RUN_LEN / 2)
    return t
  }, [RUN_LEN])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, midZ]}>
        <planeGeometry args={[26, RUN_LEN]} />
        <meshStandardMaterial map={grid} metalness={0.45} roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.25, midZ]}>
        <boxGeometry args={[26, 0.5, RUN_LEN]} />
        <meshStandardMaterial color="#080a10" metalness={0.6} roughness={0.5} />
      </mesh>
      {[-13, 13].map((x) => (
        <mesh key={x} position={[x, 0.07, midZ]}>
          <boxGeometry args={[0.22, 0.14, RUN_LEN]} />
          <meshBasicMaterial color="#ff5a3c" />
        </mesh>
      ))}
    </group>
  )
}

function Environment({ tier, reduced, room, atDoor, openDoors, onToggleDoor }) {
  return (
    <>
      <Space tier={tier} reduced={reduced} />
      <Runway />
      {ROOMS.slice(0, -1).map((r, i) => (
        <Door
          key={r.id}
          index={i}
          open={!!(openDoors && openDoors[i])}
          ahead={atDoor && room === i}
          onToggle={onToggleDoor}
        />
      ))}
    </>
  )
}

/* ------------------------------- Home ------------------------------- */
function HomeRoom({ z, tier, reduced }) {
  const tex = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + 'assets/portrait.png')
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
  }, [tex])

  const aspect = tex.image ? tex.image.width / tex.image.height : 0.67
  const H = 6.4
  const glow = useMemo(
    () =>
      makeTexture(256, 256, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
        g.addColorStop(0, 'rgba(255,51,20,0.55)')
        g.addColorStop(0.5, 'rgba(255,51,20,0.12)')
        g.addColorStop(1, 'rgba(255,51,20,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }),
    [],
  )
  const dustPos = useMemo(() => {
    const arr = new Float32Array(tier.dust * 3)
    for (let i = 0; i < tier.dust; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 2 + Math.random() * 8
      arr[i * 3] = Math.cos(a) * r
      arr[i * 3 + 1] = Math.random() * 10
      arr[i * 3 + 2] = Math.sin(a) * r - 1
    }
    return arr
  }, [tier.dust])

  const g1 = useRef()
  const g2 = useRef()
  const scan = useRef()
  const arc = useRef()
  const fig = useRef()
  const dust = useRef()

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = reduced ? 0.15 : 1
    arc.current.rotation.z += dt * 0.5 * k
    scan.current.position.y = 0.5 + ((t * 0.3 * k) % 1) * H
    fig.current.position.y = 0.4 + Math.sin(t * 0.9) * 0.06 * k
    dust.current.rotation.y += dt * 0.04 * k
    const glitch = !reduced && t % 4.2 < 0.18
    g1.current.position.x = glitch ? 0.09 + (Math.random() - 0.5) * 0.7 : 0.09 + Math.sin(t * 1.7) * 0.02 * k
    g2.current.position.x = glitch ? -0.09 + (Math.random() - 0.5) * 0.7 : -0.09 - Math.sin(t * 1.7) * 0.02 * k
    g1.current.material.opacity = glitch ? 0.6 : 0.22
    g2.current.material.opacity = glitch ? 0.45 : 0.16
  })

  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[2.6, 2.8, 0.34, 48]} />
        <meshStandardMaterial color="#10121a" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh ref={arc} position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.62, 2.72, 64, 1, 0, Math.PI * 1.5]} />
        <meshBasicMaterial color="#ff3314" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, H / 2 + 0.4, -2.5]}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={fig} position={[0, 0.4, 0]}>
        <mesh position={[0, H / 2, 0]}>
          <planeGeometry args={[H * aspect, H]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.02} />
        </mesh>
        <mesh ref={g1} position={[0.09, H / 2, -0.02]}>
          <planeGeometry args={[H * aspect, H]} />
          <meshBasicMaterial map={tex} color="#ff3314" transparent opacity={0.22} alphaTest={0.02} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={g2} position={[-0.09, H / 2, -0.02]}>
          <planeGeometry args={[H * aspect, H]} />
          <meshBasicMaterial map={tex} color="#00f076" transparent opacity={0.16} alphaTest={0.02} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={scan} position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.35, 2.4, 64]} />
        <meshBasicMaterial
          color="#ff8400"
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPos, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.07} color="#ff8400" transparent opacity={0.65} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  )
}

/* ---------------------------- Universe ------------------------------ */
const ORBIT_R = [3.6, 6.2, 8.8]
const ORBIT_SPEED = [0.16, -0.11, 0.07]

function SkillNode({ skill, pos, tex, show }) {
  const m = useRef()
  const sp = useRef()
  const body = useRef()
  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05)
    m.current.opacity = damp(m.current.opacity, show ? 1 : 0.1, 6, dt)
    sp.current.opacity = damp(sp.current.opacity, show ? 1 : 0, 6, dt)
    body.current.scale.setScalar(damp(body.current.scale.x, show ? 1 : 0.6, 6, dt))
  })
  return (
    <group position={pos}>
      <mesh ref={body}>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshBasicMaterial ref={m} color={CAT_COLOR[skill.cat]} transparent />
      </mesh>
      <sprite position={[0, 0.78, 0]} scale={[3.4, 0.85, 1]}>
        <spriteMaterial ref={sp} map={tex} transparent depthWrite={false} />
      </sprite>
    </group>
  )
}

function Pulse({ pos, seed, show, reduced }) {
  const m = useRef()
  useFrame((st) => {
    const p = (st.clock.elapsedTime * (reduced ? 0.1 : 0.45) + seed) % 1
    m.current.position.set(pos[0] * p, pos[1] * p, pos[2] * p)
    m.current.visible = show
  })
  return (
    <mesh ref={m}>
      <sphereGeometry args={[0.07, 8, 8]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  )
}

function UniverseRoom({ z, filter, reduced, compact }) {
  const orbits = [useRef(), useRef(), useRef()]
  const core = useRef()
  const inner = useRef()

  const labels = useMemo(() => {
    const out = {}
    SKILLS.forEach((s) => {
      out[s.name] = makeTexture(384, 96, (ctx, w, h) => {
        const c = CAT_COLOR[s.cat]
        ctx.fillStyle = 'rgba(8,9,13,0.78)'
        ctx.strokeStyle = c
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.roundRect(6, 12, w - 12, h - 24, 24)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#ffffff'
        ctx.font = '600 34px Outfit, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(s.name, w / 2, h / 2 + 2)
      })
    })
    return out
  }, [])

  const placed = useMemo(() => {
    const byTier = [[], [], []]
    SKILLS.forEach((s) => byTier[s.tier - 1].push(s))
    return byTier.map((list, ti) =>
      list.map((s, i) => {
        const a = (i / list.length) * Math.PI * 2 + ti * 0.6
        return { s, pos: [Math.cos(a) * ORBIT_R[ti], 0, Math.sin(a) * ORBIT_R[ti]], seed: (i * 0.37 + ti * 0.21) % 1 }
      }),
    )
  }, [])
  const links = useMemo(
    () => placed.map((list) => Float32Array.from(list.flatMap(({ pos }) => [0, 0, 0, ...pos]))),
    [placed],
  )

  useFrame((st, dt) => {
    const k = reduced ? 0.15 : 1
    orbits.forEach((r, i) => (r.current.rotation.y += dt * ORBIT_SPEED[i] * k))
    core.current.rotation.y += dt * 0.25 * k
    core.current.rotation.x += dt * 0.12 * k
    inner.current.scale.setScalar(1 + Math.sin(st.clock.elapsedTime * 2) * 0.08 * k)
  })

  const scale = compact ? 0.66 : 0.82

  return (
    <group position={[0, 3.4, z]} rotation={[0.28, 0, 0]} scale={scale}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial color="#00f076" wireframe transparent opacity={0.8} />
      </mesh>
      <mesh ref={inner}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color="#00f076" />
      </mesh>
      {placed.map((list, ti) => (
        <group key={ti} ref={orbits[ti]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ORBIT_R[ti], 0.012, 6, 128]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.16} />
          </mesh>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[links[ti], 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#00f076" transparent opacity={0.13} />
          </lineSegments>
          {list.map(({ s, pos, seed }) => {
            const show = filter === 'all' || filter === s.cat
            return (
              <group key={s.name}>
                <SkillNode skill={s} pos={pos} tex={labels[s.name]} show={show} />
                <Pulse pos={pos} seed={seed} show={show} reduced={reduced} />
              </group>
            )
          })}
        </group>
      ))}
    </group>
  )
}

/* ---------------------------- Experience ---------------------------- */
function Monolith({ x, item, active, onSelect }) {
  const g = useRef()
  const face = useRef()
  const edge = useRef()
  const tex = useMemo(
    () =>
      makeTexture(512, 1024, (ctx, w, h) => {
        const grd = ctx.createLinearGradient(0, 0, 0, h)
        grd.addColorStop(0, '#171b27')
        grd.addColorStop(1, '#0b0d14')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, w, h)
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#ff8400'
        ctx.font = '600 30px "JetBrains Mono", monospace'
        ctx.fillText(item.period, 44, 60)
        ctx.fillStyle = '#ffffff'
        fitFont(ctx, item.org, w - 88, 96, 800, 'Outfit, sans-serif')
        ctx.fillText(item.org, 44, 130)
        ctx.fillStyle = '#d4d7e1'
        ctx.font = '500 34px "Plus Jakarta Sans", sans-serif'
        wrapText(ctx, item.title, 44, 380, w - 88, 46, 4)
        ctx.fillStyle = '#8b92a5'
        ctx.font = '500 28px "Plus Jakarta Sans", sans-serif'
        wrapText(ctx, item.tag, 44, h - 90, w - 88, 36, 1)
      }),
    [item],
  )

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05)
    g.current.position.z = damp(g.current.position.z, active ? 1.6 : 0, 4, dt)
    g.current.position.y = damp(g.current.position.y, active ? 0.25 : 0, 4, dt)
    const b = damp(face.current.color.r, active ? 1 : 0.32, 5, dt)
    face.current.color.setScalar(b)
    edge.current.opacity = damp(edge.current.opacity, active ? 1 : 0.25, 5, dt)
  })

  return (
    <group
      ref={g}
      position={[x, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[3.4, 7, 0.5]} />
        <meshStandardMaterial color="#0d0f16" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 3.5, 0.26]}>
        <planeGeometry args={[3.2, 6.8]} />
        <meshBasicMaterial ref={face} map={tex} />
      </mesh>
      <mesh position={[0, 7.04, 0]}>
        <boxGeometry args={[3.4, 0.09, 0.54]} />
        <meshBasicMaterial ref={edge} color="#ff8400" transparent />
      </mesh>
    </group>
  )
}

function ExperienceRoom({ z, active, onSelect, compact }) {
  return (
    <group position={[0, 0, z]} scale={compact ? 0.62 : 1}>
      {EXPERIENCE.map((item, i) => (
        <Monolith key={item.org} x={(i - 1) * 5} item={item} active={active === i} onSelect={() => onSelect(i)} />
      ))}
    </group>
  )
}

/* ----------------------------- Education ---------------------------- */
function Step({ x, top, item, current }) {
  const glow = useRef()
  const tex = useMemo(
    () =>
      makeTexture(1024, 512, (ctx, w, h) => {
        const grd = ctx.createLinearGradient(0, 0, w, h)
        grd.addColorStop(0, '#171b27')
        grd.addColorStop(1, '#0b0d14')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, w, h)
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#f4c068'
        ctx.font = '600 34px "JetBrains Mono", monospace'
        ctx.fillText(item.period, 56, 56)
        ctx.fillStyle = '#ffffff'
        fitFont(ctx, item.short, w - 112, 92, 800, 'Outfit, sans-serif')
        ctx.fillText(item.short, 56, 130)
        ctx.fillStyle = '#d4d7e1'
        ctx.font = '500 36px "Plus Jakarta Sans", sans-serif'
        wrapText(ctx, item.school, 56, h - 130, w - 112, 46, 2)
      }),
    [item],
  )
  useFrame((s) => {
    if (glow.current && current) glow.current.opacity = 0.3 + Math.sin(s.clock.elapsedTime * 2) * 0.12
  })
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, top / 2, 0]}>
        <boxGeometry args={[5.1, top, 5]} />
        <meshStandardMaterial color="#232838" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, top + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.1, 5]} />
        <meshBasicMaterial ref={glow} color="#f4c068" transparent opacity={current ? 0.3 : 0.05} depthWrite={false} />
      </mesh>
      <mesh position={[0, top, 2.5]}>
        <boxGeometry args={[5.1, 0.08, 0.08]} />
        <meshBasicMaterial color="#f4c068" />
      </mesh>
      <mesh position={[0, top + 1.5, -1.2]}>
        <planeGeometry args={[4.8, 2.4]} />
        <meshBasicMaterial map={tex} />
      </mesh>
    </group>
  )
}

function EducationRoom({ z, compact }) {
  const steps = [...EDUCATION].reverse()
  return (
    <group position={[0, 0, z]} scale={compact ? 0.6 : 0.88}>
      {steps.map((item, i) => (
        <group key={item.short} position={[0, 0, 3 - i * 3]}>
          <Step x={(i - 1) * 5.4} top={0.9 + i * 0.9} item={item} current={i === steps.length - 1} />
        </group>
      ))}
    </group>
  )
}

/* ------------------------------ Theater ----------------------------- */
const rng = (seed) => {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const ART = [
  (ctx, x, y, w, h, c) => {
    for (let i = 0; i < 3; i++) {
      const ox = x + 10 + i * 16
      const oy = y + 10 + i * (h / 3.3)
      ctx.fillStyle = 'rgba(22,28,44,0.96)'
      ctx.strokeStyle = i === 2 ? c : 'rgba(255,255,255,0.22)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(ox, oy, w - 52, h / 2.5, 12)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = i === 2 ? c : 'rgba(255,255,255,0.35)'
      ctx.fillRect(ox + 18, oy + 20, (w - 52) * 0.55, 9)
      ctx.fillRect(ox + 18, oy + 44, (w - 52) * 0.75, 6)
      ctx.fillRect(ox + 18, oy + 60, (w - 52) * 0.4, 6)
    }
  },
  (ctx, x, y, w, h, c) => {
    const cw = (w - 40) / 3
    const ch = (h - 90) / 2
    for (let r = 0; r < 2; r++)
      for (let k = 0; k < 3; k++) {
        const ox = x + 10 + k * (cw + 10)
        const oy = y + 10 + r * (ch + 10)
        ctx.fillStyle = 'rgba(22,28,44,0.96)'
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(ox, oy, cw, ch, 10)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = (r + k) % 2 ? 'rgba(255,255,255,0.14)' : c
        ctx.globalAlpha = 0.7
        ctx.fillRect(ox + 10, oy + 10, cw - 20, ch * 0.5)
        ctx.globalAlpha = 1
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.fillRect(ox + 10, oy + ch * 0.72, cw * 0.6, 6)
      }
    ctx.font = '600 22px "JetBrains Mono", monospace'
    ;['eSewa', 'Khalti'].forEach((t, i) => {
      const px = x + 10 + i * 130
      const py = y + h - 56
      ctx.strokeStyle = c
      ctx.beginPath()
      ctx.roundRect(px, py, 116, 40, 20)
      ctx.stroke()
      ctx.fillStyle = c
      ctx.fillText(t, px + 22, py + 9)
    })
  },
  (ctx, x, y, w, h, c) => {
    const dx = x + 40
    const dw = w - 80
    ctx.fillStyle = 'rgba(240,244,255,0.92)'
    ctx.beginPath()
    ctx.roundRect(dx, y + 6, dw, h - 12, 8)
    ctx.fill()
    ctx.fillStyle = '#1b2033'
    ctx.fillRect(dx + 22, y + 30, dw * 0.5, 14)
    ctx.fillStyle = 'rgba(27,32,51,0.45)'
    ctx.fillRect(dx + 22, y + 54, dw * 0.35, 7)
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = i === 3 ? c : 'rgba(27,32,51,0.3)'
      ctx.globalAlpha = i === 3 ? 0.85 : 1
      ctx.fillRect(dx + 22, y + 92 + i * 30, dw * (i % 3 === 0 ? 0.85 : 0.68), i === 3 ? 12 : 8)
      ctx.globalAlpha = 1
    }
  },
  (ctx, x, y, w, h, c) => {
    const cx = x + w / 2
    const cy = y + h * 0.66
    ctx.setLineDash([8, 8])
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(x + 22, y + 22, w - 44, h - 44)
    ctx.setLineDash([])
    const fingers = [-1.15, -0.62, -0.18, 0.28, 0.74]
    ctx.strokeStyle = c
    ctx.fillStyle = '#ffffff'
    ctx.lineWidth = 4
    fingers.forEach((a, i) => {
      const len = [96, 130, 146, 128, 100][i]
      const kx = cx + Math.sin(a) * len * 0.5
      const ky = cy - Math.cos(a) * len * 0.5
      const tx = cx + Math.sin(a) * len
      const ty = cy - Math.cos(a) * len
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(kx, ky)
      ctx.lineTo(tx, ty)
      ctx.stroke()
      ;[[kx, ky], [tx, ty]].forEach(([px, py]) => {
        ctx.beginPath()
        ctx.arc(px, py, 7, 0, 7)
        ctx.fill()
      })
    })
    ctx.beginPath()
    ctx.arc(cx, cy, 12, 0, 7)
    ctx.fill()
  },
  (ctx, x, y, w, h, c) => {
    const r = rng(7)
    const n = 26
    const bw = (w - 20) / n
    for (let i = 0; i < n; i++) {
      const env = Math.sin((i / (n - 1)) * Math.PI)
      const bh = 16 + env * (h * 0.75) * (0.25 + r() * 0.75)
      ctx.fillStyle = i % 5 === 0 ? '#ffffff' : c
      ctx.globalAlpha = 0.5 + env * 0.5
      ctx.fillRect(x + 10 + i * bw, y + h / 2 - bh / 2, bw - 5, bh)
    }
    ctx.globalAlpha = 1
  },
  (ctx, x, y, w, h, c) => {
    const r = rng(21)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + 14, y + 10)
    ctx.lineTo(x + 14, y + h - 14)
    ctx.lineTo(x + w - 10, y + h - 14)
    ctx.stroke()
    for (let i = 0; i < 46; i++) {
      const t = i / 45
      const px = x + 34 + t * (w - 70)
      const py = y + h - 40 - t * (h - 90) + (r() - 0.5) * 70
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.beginPath()
      ctx.arc(px, py, 5, 0, 7)
      ctx.fill()
    }
    ctx.strokeStyle = c
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x + 34, y + h - 40)
    ctx.lineTo(x + w - 36, y + 50)
    ctx.stroke()
  },
  (ctx, x, y, w, h, c) => {
    const mid = y + h / 2
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    for (let gx = x; gx < x + w; gx += 30) {
      ctx.beginPath()
      ctx.moveTo(gx, y)
      ctx.lineTo(gx, y + h)
      ctx.stroke()
    }
    ctx.strokeStyle = c
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x, mid)
    const beat = 120
    for (let bx = x; bx < x + w; bx += beat) {
      const pts = [[0, 0], [20, 0], [30, -14], [40, 0], [56, 0], [64, 18], [76, -h * 0.4], [88, h * 0.28], [98, 0], [118, 0]]
      pts.forEach(([dx, dy]) => ctx.lineTo(Math.min(bx + dx, x + w), mid + dy))
    }
    ctx.stroke()
  },
]

function drawScreen(ctx, w, h, p, i) {
  const c = p.status === 'Completed' ? '#00f076' : '#ff8400'
  const grd = ctx.createLinearGradient(0, 0, w, h)
  grd.addColorStop(0, '#151a27')
  grd.addColorStop(1, '#090b11')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 2)

  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.font = '600 26px "JetBrains Mono", monospace'
  const st = p.status
  const sw = ctx.measureText(st).width + 40
  ctx.strokeStyle = c
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(56, 44, sw, 46, 23)
  ctx.stroke()
  ctx.fillStyle = c
  ctx.fillText(st, 76, 55)
  ctx.fillStyle = '#8b92a5'
  ctx.textAlign = 'right'
  ctx.fillText(`${String(i + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}`, w - 56, 55)
  ctx.textAlign = 'left'

  ctx.fillStyle = '#8b92a5'
  ctx.font = '500 26px "JetBrains Mono", monospace'
  ctx.fillText(p.kind, 56, 122)
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 68px Outfit, sans-serif'
  const ty = wrapText(ctx, p.screen, 56, 164, 520, 74, 2)
  ctx.fillStyle = '#d4d7e1'
  ctx.font = '500 29px "Plus Jakarta Sans", sans-serif'
  wrapText(ctx, p.sub, 56, ty + 14, 520, 40, 3)

  const ax = 616
  const ay = 118
  const aw = 352
  const ah = 350
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(ax, ay, aw, ah, 18)
  ctx.fill()
  ctx.stroke()
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(ax, ay, aw, ah, 18)
  ctx.clip()
  ART[i % ART.length](ctx, ax, ay, aw, ah, c)
  ctx.restore()

  ctx.font = '500 26px "JetBrains Mono", monospace'
  let x = 56
  const y = h - 96
  p.tech.forEach((t) => {
    const tw = ctx.measureText(t).width + 36
    if (x + tw > w - 56) return
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x, y, tw, 50, 25)
    ctx.stroke()
    ctx.fillStyle = '#d4d7e1'
    ctx.fillText(t, x + 18, y + 12)
    x += tw + 14
  })
}

function Screen({ index, angle, radius, active, visible, onSelect }) {
  const face = useRef()
  const frame = useRef()
  const tex = useMemo(() => makeTexture(1024, 640, (ctx, w, h) => drawScreen(ctx, w, h, PROJECTS[index], index)), [index])
  const done = PROJECTS[index].status === 'Completed'

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05)
    const b = active ? 1 : visible ? 0.45 : 0.12
    face.current.color.setScalar(damp(face.current.color.r, b, 5, dt))
    frame.current.opacity = damp(frame.current.opacity, active ? 1 : visible ? 0.3 : 0.08, 5, dt)
  })

  return (
    <group
      position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
      rotation={[0, angle, 0]}
      onClick={(e) => {
        e.stopPropagation()
        if (visible) onSelect()
      }}
      onPointerOver={() => visible && (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[6.7, 4.3]} />
        <meshBasicMaterial ref={frame} color={done ? '#00f076' : '#ff8400'} transparent />
      </mesh>
      <mesh>
        <planeGeometry args={[6.4, 4]} />
        <meshBasicMaterial ref={face} map={tex} />
      </mesh>
      <mesh position={[0, -3.1, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.2, 8]} />
        <meshBasicMaterial color="#2a2f40" />
      </mesh>
    </group>
  )
}

function TheaterRoom({ z, active, filter, onSelect, reduced }) {
  const ring = useRef()
  const beam = useRef()
  const R = 9.5
  const n = PROJECTS.length

  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05)
    const target = -(active / n) * Math.PI * 2
    const cur = ring.current.rotation.y
    const delta = ((((target - cur + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI
    ring.current.rotation.y = cur + delta * (1 - Math.exp(-dt * (reduced ? 12 : 4.5)))
    ring.current.position.y = 4.4 + (reduced ? 0 : Math.sin(st.clock.elapsedTime * 0.8) * 0.08)
    const done = PROJECTS[active].status === 'Completed'
    beam.current.material.color.set(done ? '#00f076' : '#ff8400')
    beam.current.material.opacity = 0.06 + (reduced ? 0 : Math.sin(st.clock.elapsedTime * 3) * 0.012)
  })

  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R - 0.15, R + 0.15, 96]} />
        <meshBasicMaterial color="#ff3314" transparent opacity={0.5} />
      </mesh>
      <mesh ref={beam} position={[0, 2.2, R]}>
        <coneGeometry args={[3.6, 4.4, 40, 1, true]} />
        <meshBasicMaterial color="#00f076" transparent opacity={0.06} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={ring} position={[0, 4.4, 0]}>
        {PROJECTS.map((p, i) => (
          <Screen
            key={i}
            index={i}
            angle={(i / n) * Math.PI * 2}
            radius={R}
            active={active === i}
            visible={projectMatches(p, filter)}
            onSelect={() => onSelect(i)}
          />
        ))}
      </group>
    </group>
  )
}

/* ------------------------------ Contact ----------------------------- */
function Badge({ item, angle, radius, lift, hover }) {
  const sp = useRef()
  const tex = useMemo(
    () =>
      makeTexture(512, 128, (ctx, w, h) => {
        ctx.fillStyle = 'rgba(8,9,13,0.85)'
        ctx.strokeStyle = '#00f076'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.roundRect(6, 10, w - 12, h - 20, 44)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#00f076'
        ctx.beginPath()
        ctx.arc(52, h / 2, 11, 0, 7)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = '600 44px Outfit, sans-serif'
        ctx.textBaseline = 'middle'
        ctx.fillText(item.label, 82, h / 2 + 3)
      }),
    [item.label],
  )
  const target = useRef(1)
  useFrame((_, dt) => {
    const s = damp(sp.current.scale.y, target.current, 8, Math.min(dt, 0.05))
    sp.current.scale.set(s * 3.8, s * 0.95, 1)
  })
  return (
    <sprite
      ref={sp}
      position={[Math.sin(angle) * radius, lift, Math.cos(angle) * radius]}
      scale={[3.8, 0.95, 1]}
      onClick={(e) => {
        e.stopPropagation()
        window.open(item.href, item.href.startsWith('mailto:') ? '_self' : '_blank', 'noopener,noreferrer')
      }}
      onPointerOver={() => {
        target.current = 1.2
        hover.current = true
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        target.current = 1
        hover.current = false
        document.body.style.cursor = ''
      }}
    >
      <spriteMaterial map={tex} transparent depthWrite={false} />
    </sprite>
  )
}

function ContactRoom({ z, reduced, compact }) {
  const rings = [useRef(), useRef(), useRef(), useRef()]
  const orb = useRef()
  const orbit = useRef()
  const hover = useRef(false)
  const items = useMemo(
    () => [{ id: 'email', label: 'Email', href: `mailto:${PROFILE.email}` }, ...PROFILE.links.filter((l) => l.href)],
    [],
  )
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime * (reduced ? 0.3 : 1)
    rings.forEach((r, i) => {
      const p = (t * 0.22 + i / rings.length) % 1
      r.current.scale.setScalar(1 + p * 11)
      r.current.material.opacity = (1 - p) * 0.8
    })
    orb.current.scale.setScalar(1 + Math.sin(t * 3) * 0.1)
    if (!hover.current) orbit.current.rotation.y += Math.min(dt, 0.05) * 0.22 * (reduced ? 0.2 : 1)
  })
  return (
    <group position={[0, 0, z]} scale={compact ? 0.7 : 1}>
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 7.2, 12]} />
        <meshStandardMaterial color="#cfd6e6" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh ref={orb} position={[0, 7.5, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial color="#00f076" />
      </mesh>
      <group ref={orbit} position={[0, 4.2, 0]}>
        {items.map((item, i) => (
          <Badge key={item.id} item={item} angle={(i / items.length) * Math.PI * 2} radius={4.4} lift={i % 2 ? 0.9 : -0.6} hover={hover} />
        ))}
      </group>
      {rings.map((r, i) => (
        <mesh key={i} ref={r} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.97, 1, 96]} />
          <meshBasicMaterial color="#00f076" transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* -------------------------- Infinity Portal -------------------------- */
function InfinityRoom({ z, reduced, compact }) {
  const lemniscateRef = useRef()
  const coreRef = useRef()
  const vortexRef = useRef()
  const particlesRef = useRef()

  // 3D Parametric Lemniscate of Bernoulli Curve (∞)
  const { linePos, lineCol } = useMemo(() => {
    const N = 360
    const pos = new Float32Array(N * 3)
    const col = new Float32Array(N * 3)
    const a = 5.2
    const c1 = new THREE.Color('#00f0ff')
    const c2 = new THREE.Color('#ff007f')

    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2
      const d = 1 + Math.sin(t) ** 2
      const x = (a * Math.cos(t)) / d
      const y = ((a * Math.sin(t) * Math.cos(t)) / d) * 1.5
      const z = Math.sin(t * 2) * 0.85
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      const blend = (Math.sin(t) + 1) * 0.5
      const c = c1.clone().lerp(c2, blend)
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { linePos: pos, lineCol: col }
  }, [])

  // Floating vortex particles
  const { partPos, partCol } = useMemo(() => {
    const P_COUNT = 480
    const pos = new Float32Array(P_COUNT * 3)
    const col = new Float32Array(P_COUNT * 3)
    const cCyan = new THREE.Color('#00f0ff')
    const cGold = new THREE.Color('#ffc83b')
    const cPink = new THREE.Color('#ff007f')

    for (let i = 0; i < P_COUNT; i++) {
      const r = 2.2 + Math.random() * 8.5
      const theta = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 6
      pos[i * 3] = Math.cos(theta) * r
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = Math.sin(theta) * r

      const pick = Math.random()
      const c = pick < 0.45 ? cCyan : pick < 0.75 ? cPink : cGold
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { partPos: pos, partCol: col }
  }, [])

  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05)
    const t = st.clock.elapsedTime * (reduced ? 0.2 : 0.8)

    if (lemniscateRef.current) {
      lemniscateRef.current.rotation.y = t * 0.35
      lemniscateRef.current.rotation.z = Math.sin(t * 0.5) * 0.18
      lemniscateRef.current.position.y = 4.2 + Math.sin(t * 0.7) * 0.2
    }

    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.6
      coreRef.current.rotation.y = t * 0.8
      const s = 1 + Math.sin(t * 3.5) * 0.12
      coreRef.current.scale.set(s, s, s)
    }

    if (vortexRef.current) {
      vortexRef.current.rotation.z += dt * 0.6
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += dt * 0.25
    }
  })

  return (
    <group position={[0, 0, z]} scale={compact ? 0.72 : 1}>
      {/* Ground portal rings */}
      {[5, 7.5, 10.5].map((r, i) => (
        <mesh key={i} position={[0, 0.05 + i * 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.12, r + 0.12, 96]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#00f0ff' : '#ff007f'} transparent opacity={0.6 - i * 0.12} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}

      {/* Swirling Hyperspace Core - Interactive Portal to warp back to Room 1 */}
      <group
        position={[0, 4.2, 0]}
        onClick={(e) => {
          e.stopPropagation()
          if (onWarpHome) onWarpHome()
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = ''
        }}
      >
        <mesh ref={coreRef}>
          <octahedronGeometry args={[1.3, 2]} />
          <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.85} />
        </mesh>

        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Accretion disc */}
        <mesh ref={vortexRef} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[3.2, 0.05, 16, 120]} />
          <meshBasicMaterial color="#ff007f" transparent opacity={0.75} />
        </mesh>
      </group>

      {/* Rotating 3D Lemniscate ∞ symbol */}
      <group ref={lemniscateRef} position={[0, 4.2, 0]}>
        <lineLoop>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
            <bufferAttribute attach="attributes-color" args={[lineCol, 3]} />
          </bufferGeometry>
          <lineBasicMaterial vertexColors linewidth={3} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
        </lineLoop>
      </group>

      {/* Orbiting stardust cloud */}
      <points ref={particlesRef} position={[0, 4.2, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[partPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[partCol, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.09} vertexColors transparent opacity={0.75} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  )
}

/* ------------------------------- Ready ------------------------------ */
function Ready({ onReady }) {
  useEffect(() => {
    let id = requestAnimationFrame(() => (id = requestAnimationFrame(onReady)))
    return () => cancelAnimationFrame(id)
  }, [onReady])
  return null
}

/* -------------------------------- Root ------------------------------ */
export default function Scene({
  room,
  atDoor,
  openDoors,
  onToggleDoor,
  onWarpHome,
  tier,
  compact,
  reduced,
  ready,
  onReady,
  skillFilter,
  expIndex,
  setExpIndex,
  projIndex,
  setProjIndex,
  projFilter,
}) {
  return (
    <Canvas
      flat
      dpr={tier.dpr}
      gl={{ antialias: tier.antialias, powerPreference: 'high-performance' }}
      camera={{ fov: 55, near: 0.1, far: 1400, position: [0, 3, 42] }}
      aria-hidden="true"
    >
      <color attach="background" args={['#02030a']} />
      <fog attach="fog" args={['#02030a', 15, 52]} />
      <Lights colorIndex={atDoor ? room + 1 : room} />
      <Environment
        tier={tier}
        reduced={reduced}
        room={room}
        atDoor={atDoor}
        openDoors={openDoors}
        onToggleDoor={onToggleDoor}
      />
      <WarpStreaks reduced={reduced} />
      <CameraRig room={room} atDoor={atDoor} compact={compact} enabled={ready} reduced={reduced} />
      <HomeRoom z={roomZ(0)} tier={tier} reduced={reduced} />
      <UniverseRoom z={roomZ(1)} filter={skillFilter} reduced={reduced} compact={compact} />
      <ExperienceRoom z={roomZ(2)} active={expIndex} onSelect={setExpIndex} compact={compact} />
      <EducationRoom z={roomZ(3)} compact={compact} />
      <TheaterRoom z={roomZ(4)} active={projIndex} filter={projFilter} onSelect={setProjIndex} reduced={reduced} />
      <ContactRoom z={roomZ(5)} reduced={reduced} compact={compact} />
      <InfinityRoom z={roomZ(6)} reduced={reduced} compact={compact} onWarpHome={onWarpHome} />
      <Ready onReady={onReady} />
    </Canvas>
  )
}
