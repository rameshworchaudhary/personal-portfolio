import * as THREE from 'three'

export const SPACING = 44 // distance between room centres along -z
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
    stars: low ? 1300 : 3200,
    bright: low ? 120 : 280,
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

// Synthesized cybernetic door closing audio effect (pneumatic seal + magnetic lock latch)
export function playDoorCloseSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime

    // 1. Hydraulic pneumatic sealing sweep
    const bufferSize = Math.floor(ctx.sampleRate * 0.55)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1100, now)
    filter.frequency.exponentialRampToValueAtTime(140, now + 0.5)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.16, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)
    noise.stop(now + 0.55)

    // 2. Heavy magnetic airlock clamp latch thud
    const subOsc = ctx.createOscillator()
    const subGain = ctx.createGain()
    subOsc.type = 'triangle'
    subOsc.frequency.setValueAtTime(120, now + 0.35)
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.55)
    subGain.gain.setValueAtTime(0.001, now + 0.35)
    subGain.gain.linearRampToValueAtTime(0.25, now + 0.38)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58)
    subOsc.connect(subGain)
    subGain.connect(ctx.destination)
    subOsc.start(now + 0.35)
    subOsc.stop(now + 0.6)

    // 3. Security lock tone
    const toneOsc = ctx.createOscillator()
    const toneGain = ctx.createGain()
    toneOsc.type = 'sine'
    toneOsc.frequency.setValueAtTime(659.25, now)
    toneOsc.frequency.setValueAtTime(440, now + 0.1)
    toneGain.gain.setValueAtTime(0.12, now)
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    toneOsc.connect(toneGain)
    toneGain.connect(ctx.destination)
    toneOsc.start(now)
    toneOsc.stop(now + 0.32)
  } catch {}
}

// Synthesized cosmic hyperspace warp sound for looping from Infinity back to Room 1
export function playInfinityWarpSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime

    // 1. Cosmic ethereal harmonic chord
    const freqs = [261.63, 392.0, 523.25, 783.99, 1046.5]
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now)
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.6)
      osc.frequency.exponentialRampToValueAtTime(f * 0.75, now + 1.2)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.06 / (idx + 1), now + 0.2 + idx * 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 1.35)
    })

    // 2. Hyperspace whoosh
    const bufferSize = Math.floor(ctx.sampleRate * 1.1)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 3.5
    filter.frequency.setValueAtTime(300, now)
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.5)
    filter.frequency.exponentialRampToValueAtTime(400, now + 1.1)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.001, now)
    noiseGain.gain.linearRampToValueAtTime(0.22, now + 0.4)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)
    noise.stop(now + 1.15)
  } catch {}
}
