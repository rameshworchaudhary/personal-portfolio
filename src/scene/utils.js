import * as THREE from 'three'

export const SPACING = 36 // distance between room centres along -z
export const roomZ = (i) => -i * SPACING

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

// Adaptive device tiering: scale pixel ratio, antialiasing and particle counts.
export function getTier() {
  const w = window.innerWidth
  const mem = navigator.deviceMemory || 8
  const cores = navigator.hardwareConcurrency || 8
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  const low = w < 768 || mem <= 4 || cores <= 4 || coarse
  return {
    low,
    dpr: low ? [1, 1.25] : [1, 1.75],
    antialias: !low,
    stars: low ? 350 : 900,
    dust: low ? 140 : 380,
  }
}

export const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

export function makeTexture(w, h, draw) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

// Wrap text into lines that fit maxWidth. Returns the y after the last line.
export function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  const words = text.split(' ')
  let line = ''
  let lines = 0
  for (let n = 0; n < words.length; n++) {
    const test = line ? line + ' ' + words[n] : words[n]
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      y += lineHeight
      line = words[n]
      if (++lines >= maxLines) return y
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, y)
  return y + lineHeight
}

export const damp = THREE.MathUtils.damp
export const lerp = THREE.MathUtils.lerp

// Shrink the font until the text fits maxW. Returns the size used.
export function fitFont(ctx, text, maxW, size, weight, family) {
  let s = size
  for (; s > 26; s -= 2) {
    ctx.font = `${weight} ${s}px ${family}`
    if (ctx.measureText(text).width <= maxW) break
  }
  ctx.font = `${weight} ${s}px ${family}`
  return s
}

// Synthesized cybernetic door opening audio effect (zero external asset dependency)
export function playDoorOpenSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime

    // 1. Electronic access authorization chirp (two-tone futuristic chime)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, now) // D5
    osc.frequency.setValueAtTime(880, now + 0.08) // A5
    gain.gain.setValueAtTime(0.14, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.36)

    // 2. Heavy hydraulic pneumatic hiss / mechanical door sliding rumble
    const bufferSize = Math.floor(ctx.sampleRate * 0.65)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(280, now + 0.03)
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.25)
    filter.frequency.exponentialRampToValueAtTime(160, now + 0.65)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.001, now + 0.03)
    noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.2)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now + 0.03)
    noise.stop(now + 0.68)
  } catch {
    // Gracefully handle browser restrictions
  }
}
