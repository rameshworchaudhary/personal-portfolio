import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PROFILE, ROOMS, stepProject, visibleProjects } from './data'
import RoomPanel from './ui/Panels'
import { getTier, hasWebGL, prefersReducedMotion, playDoorOpenSound } from './scene/utils'
import CinematicIntro from './js/cinematic-intro.js'

const Scene = lazy(() => import('./scene/Scene'))

// If the 3D scene throws (blocked WebGL, missing asset), fall back to the plain page.
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.error('3D scene failed:', err)
    this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const clamp = (n) => Math.max(0, Math.min(ROOMS.length - 1, n))
const roomFromHash = () => {
  const id = window.location.hash.replace('#', '')
  const i = ROOMS.findIndex((r) => r.id === id)
  return i === -1 ? 0 : i
}

// Canvas textures are drawn with these fonts, so wait for them (max 2.5s).
function loadFonts() {
  const wanted = [
    '800 40px Outfit',
    '600 30px Outfit',
    '500 30px "Plus Jakarta Sans"',
    '600 30px "JetBrains Mono"',
    '500 27px "JetBrains Mono"',
  ]
  const all = Promise.all(wanted.map((f) => document.fonts.load(f))).catch(() => {})
  return Promise.race([all, new Promise((r) => setTimeout(r, 2500))])
}

// True when the element under the pointer can still scroll in that direction.
function canScroll(el, dy) {
  const box = el?.closest?.('.panel-scroll')
  if (!box) return false
  if (box.scrollHeight <= box.clientHeight + 1) return false
  return dy > 0 ? box.scrollTop + box.clientHeight < box.scrollHeight - 1 : box.scrollTop > 0
}

export default function App() {
  const webgl = useMemo(hasWebGL, [])
  const tier = useMemo(getTier, [])
  const reduced = useMemo(prefersReducedMotion, [])

  const [room, setRoom] = useState(roomFromHash)
  const [filter, setFilter] = useState('all')
  const [expIndex, setExpIndex] = useState(0)
  const [projIndex, setProjIndex] = useState(0)
  const [projFilter, setProjFilterRaw] = useState('all')
  const [ready, setReady] = useState(!webgl)
  const [fontsOk, setFontsOk] = useState(!webgl)
  const [compact, setCompact] = useState(() => window.innerWidth < 900)
  const [moved, setMoved] = useState(false)
  const [failed, setFailed] = useState(false)
  const [infinityMode, setInfinityMode] = useState(false)
  const [loopMode, setLoopMode] = useState('tour') // 'tour' (Infinite Portfolio Loop) | 'warp' (Endless Deep Space Flight)
  const [loopPlaying, setLoopPlaying] = useState(true)
  const [loopSpeed, setLoopSpeed] = useState(1) // 1x, 2x, 3x
  const [loopCycle, setLoopCycle] = useState(1)
  const [showPanelInLoop, setShowPanelInLoop] = useState(false)
  const [warpSpeed, setWarpSpeed] = useState(36)
  const filterRef = useRef('all')
  const [openingDoorIndex, setOpeningDoorIndex] = useState(null)
  const openingTimeoutRef = useRef(null)
  const closeTimeoutRef = useRef(null)

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (openingTimeoutRef.current) clearTimeout(openingTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  // Changing the filter jumps to the first matching project if the current one is hidden.
  const setProjFilter = useCallback((f) => {
    setProjFilterRaw(f)
    setProjIndex((i) => (visibleProjects(f).includes(i) ? i : visibleProjects(f)[0]))
  }, [])

  const onReady = useCallback(() => setReady(true), [])

  const stepRoom = useCallback((i) => {
    setRoom((r) => {
      const n = typeof i === 'function' ? i(r) : i
      const target = ((n % ROOMS.length) + ROOMS.length) % ROOMS.length
      if (target !== r) setMoved(true)
      return target
    })
  }, [])

  // Seamless doorway navigation: plays futuristic whoosh audio and glides to target sector
  const onOpenDoor = useCallback(
    (targetRoom) => {
      const current = room
      const target = typeof targetRoom === 'function' ? targetRoom(current) : targetRoom
      const nextTarget = ((target % ROOMS.length) + ROOMS.length) % ROOMS.length
      if (nextTarget === current) return

      playDoorOpenSound()
      setInfinityMode(false)
      stepRoom(nextTarget)
    },
    [room, stepRoom],
  )

  const go = useCallback(
    (i) => {
      onOpenDoor(i)
    },
    [onOpenDoor],
  )

  const onEnterInfinity = useCallback(() => {
    playDoorOpenSound()
    setInfinityMode(true)
    setLoopMode('tour')
    setLoopPlaying(true)
    setLoopCycle(1)
    stepRoom(0)
  }, [stepRoom])

  // Continuous auto-progression loop through portfolio sectors
  useEffect(() => {
    if (!infinityMode || loopMode !== 'tour' || !loopPlaying) return
    const ms = Math.max(2800, Math.round(6200 / loopSpeed))
    const timer = setInterval(() => {
      setRoom((r) => {
        const next = (r + 1) % ROOMS.length
        if (next === 0) setLoopCycle((c) => c + 1)
        // Play door opening transition during tour
        playDoorOpenSound()
        setOpeningDoorIndex(r === 5 ? 5 : r)
        setTimeout(() => setOpeningDoorIndex(null), 1900)
        return next
      })
    }, ms)
    return () => clearInterval(timer)
  }, [infinityMode, loopMode, loopPlaying, loopSpeed])

  const loopNext = useCallback(() => {
    setRoom((r) => {
      const next = (r + 1) % ROOMS.length
      if (next === 0) setLoopCycle((c) => c + 1)
      playDoorOpenSound()
      setOpeningDoorIndex(r === 5 ? 5 : r)
      setTimeout(() => setOpeningDoorIndex(null), 1900)
      return next
    })
  }, [])

  const loopPrev = useCallback(() => {
    setRoom((r) => {
      const prev = (r - 1 + ROOMS.length) % ROOMS.length
      playDoorOpenSound()
      setOpeningDoorIndex(prev)
      setTimeout(() => setOpeningDoorIndex(null), 1900)
      return prev
    })
  }, [])

  // Initialize the Cinematic 0-100 Intro if present
  useEffect(() => {
    if (typeof window !== 'undefined' && document.getElementById('cinematic-intro-stage')) {
      new CinematicIntro({
        onComplete: () => {
          // Entry complete
        }
      })
    }
  }, [])

  useEffect(() => {
    if (webgl) loadFonts().then(() => setFontsOk(true))
  }, [webgl])

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 900)
    const onHash = () => setRoom(roomFromHash())
    window.addEventListener('resize', onResize)
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  // Keep the URL and title in sync so each room can be linked to.
  useEffect(() => {
    document.documentElement.style.setProperty('--room', ROOMS[room].color)
    document.title = `${ROOMS[room].title} | ${PROFILE.name}`
    if (webgl) history.replaceState(null, '', `#${ROOMS[room].id}`)
  }, [room, webgl])

  // Wheel, touch and keyboard navigation between rooms.
  useEffect(() => {
    if (!webgl) return
    let lockedUntil = 0
    let acc = 0
    let accTimer = 0

    const step = (d) => {
      const now = performance.now()
      if (now < lockedUntil) return
      lockedUntil = now + 950
      go((r) => r + d)
    }

    const onWheel = (e) => {
      if (e.target.closest?.('input, textarea')) return
      if (canScroll(e.target, e.deltaY)) return
      const now = performance.now()
      if (now < lockedUntil) {
        lockedUntil = Math.max(lockedUntil, now + 120) // swallow trackpad inertia
        return
      }
      acc += e.deltaY
      clearTimeout(accTimer)
      accTimer = setTimeout(() => (acc = 0), 160)
      if (Math.abs(acc) > 70) {
        step(acc > 0 ? 1 : -1)
        acc = 0
      }
    }

    let y0 = 0
    let scrollable = false
    const onTouchStart = (e) => {
      y0 = e.touches[0].clientY
      scrollable = !!e.target.closest?.('.panel-scroll')
    }
    const onTouchEnd = (e) => {
      const dy = y0 - e.changedTouches[0].clientY
      if (scrollable || Math.abs(dy) < 60) return
      step(dy > 0 ? 1 : -1)
    }

    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const id = ROOMS[room].id
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const d = e.key === 'ArrowRight' ? 1 : -1
        if (id === 'theater') return setProjIndex((i) => stepProject(i, d, filterRef.current))
        if (id === 'experience') return setExpIndex((i) => (i + d + 3) % 3)
      }
      if (['ArrowDown', 'PageDown', 'ArrowRight'].includes(e.key)) step(1)
      else if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) step(-1)
      else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(ROOMS.length - 1)
      else return
      e.preventDefault()
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [webgl, room, go])

  filterRef.current = projFilter
  const panelProps = {
    room,
    go,
    filter,
    setFilter,
    expIndex,
    setExpIndex,
    projIndex,
    setProjIndex,
    projFilter,
    setProjFilter,
    onOpenDoor,
    onEnterInfinity,
  }

  /* ---- No WebGL: same content as a normal scrolling page ---- */
  if (!webgl || failed) {
    return (
      <div className="fallback">
        <header className="fb-head">
          <strong>{PROFILE.name}</strong>
          <p>Your browser could not start WebGL, so this is the plain version of the portfolio.</p>
        </header>
        {ROOMS.map((r, i) => (
          <section key={r.id} className="panel fb-section" style={{ '--room': r.color }}>
            <RoomPanel {...panelProps} room={i} />
          </section>
        ))}
      </div>
    )
  }

  const next = ROOMS[room + 1]
  const prev = ROOMS[room - 1]

  return (
    <>
      {fontsOk && (
        <SceneBoundary onFail={() => setFailed(true)}>
        <Suspense fallback={null}>
          <div className="stage">
            <Scene
              room={room}
              tier={tier}
              compact={compact}
              reduced={reduced}
              ready={ready}
              onReady={onReady}
              skillFilter={filter}
              expIndex={expIndex}
              setExpIndex={setExpIndex}
              projIndex={projIndex}
              setProjIndex={setProjIndex}
              projFilter={projFilter}
              onOpenDoor={onOpenDoor}
              openingDoorIndex={openingDoorIndex}
              infinityMode={infinityMode}
              infinityType={loopMode}
              onEnterInfinity={onEnterInfinity}
              warpSpeed={warpSpeed}
            />
          </div>
        </Suspense>
        </SceneBoundary>
      )}

      <header className="head">
        <button type="button" className="brand" onClick={() => go(0)}>
          {PROFILE.short}
        </button>
        <nav className="nav" aria-label="Rooms">
          {ROOMS.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className="nav-link"
              aria-current={!infinityMode && i === room ? 'page' : undefined}
              onClick={() => (infinityMode ? stepRoom(i) : go(i))}
            >
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              {r.nav}
            </button>
          ))}
        </nav>
        <a className="resume" href={PROFILE.resume} target="_blank" rel="noopener noreferrer">
          Resume
        </a>
      </header>

      {/* Main room panel: shown in normal mode or when toggled in Infinity Tour */}
      {ready && (!infinityMode || showPanelInLoop) && (
        <main
          className={`panel ${infinityMode ? 'panel-infinity-floating' : ''}`}
          key={ROOMS[room].id}
          aria-live="polite"
        >
          {infinityMode && (
            <div className="infinity-panel-header">
              <span className="telemetry-pulse" />
              <span>SECTOR 0{room + 1} // {ROOMS[room].title.toUpperCase()}</span>
              <button
                type="button"
                className="btn-panel-close"
                onClick={() => setShowPanelInLoop(false)}
                title="Minimize Panel"
              >
                ✕
              </button>
            </div>
          )}
          <div className="panel-scroll">
            <RoomPanel {...panelProps} />
          </div>
        </main>
      )}

      {/* Interactive Cockpit Warp & Portfolio Loop Telemetry HUD */}
      {ready && infinityMode && (
        <div className="infinity-cockpit-bar" role="status" aria-live="polite">
          <div className="telemetry-top">
            <div className="telemetry-badge">
              <span className="telemetry-pulse" />
              <span>
                {loopMode === 'tour'
                  ? `🔁 INFINITE PORTFOLIO LOOP ACTIVE // SECTOR 0${room + 1}: ${ROOMS[room].title.toUpperCase()} (CYCLE #${loopCycle})`
                  : `🚀 HYPERSPACE DEEP COSMOS WARP // VELOCITY: ${warpSpeed >= 70 ? 'WARP 9.9c MAX' : 'WARP 9.2c CRUISE'}`}
              </span>
            </div>
            <button
              type="button"
              className="btn-warp-exit"
              onClick={() => setInfinityMode(false)}
              title="Exit Infinity Mode"
            >
              ✕ EXIT INFINITY
            </button>
          </div>

          {/* Sector progress indicator pills for all 6 rooms during tour */}
          {loopMode === 'tour' && (
            <div className="telemetry-sectors">
              {ROOMS.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  className={`telemetry-dot-btn ${i === room ? 'active' : ''}`}
                  onClick={() => stepRoom(i)}
                  title={`Jump to Sector 0${i + 1}: ${r.title}`}
                >
                  <span className="dot-indicator" />
                  <span className="dot-label">0{i + 1} {r.nav}</span>
                </button>
              ))}
            </div>
          )}

          <div className="telemetry-sub">
            {loopMode === 'tour'
              ? 'Continuous Auto-Touring Through Portfolio Sectors • Drifting Stardust & Parallax Planets'
              : 'Endless Linear Deep Space Flight • Observational Exploration into Negative Z'}
          </div>

          <div className="telemetry-controls">
            {loopMode === 'tour' ? (
              <>
                <button
                  type="button"
                  className="btn-hud-action"
                  onClick={() => setLoopPlaying((p) => !p)}
                >
                  {loopPlaying ? '⏸ PAUSE TOUR' : '▶ RESUME TOUR'}
                </button>
                <button type="button" className="btn-hud-action" onClick={loopPrev}>
                  ⏮ PREV
                </button>
                <button type="button" className="btn-hud-action" onClick={loopNext}>
                  ⏭ NEXT
                </button>
                <button
                  type="button"
                  className="btn-hud-action"
                  onClick={() => setLoopSpeed((s) => (s === 1 ? 2 : s === 2 ? 3 : 1))}
                >
                  ⚡ SPEED: {loopSpeed}X
                </button>
                <button
                  type="button"
                  className={`btn-hud-action ${showPanelInLoop ? 'active' : ''}`}
                  onClick={() => setShowPanelInLoop((p) => !p)}
                >
                  📄 {showPanelInLoop ? 'MINIMIZE PANEL' : 'SHOW HUD PANEL'}
                </button>
                <button
                  type="button"
                  className="btn-hud-mode"
                  onClick={() => setLoopMode('warp')}
                >
                  🚀 HYPERSPACE FLIGHT
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-warp-boost"
                  onClick={() => setWarpSpeed((s) => (s >= 70 ? 32 : 72))}
                >
                  ⚡ {warpSpeed >= 70 ? 'CRUISE MODE (32c)' : 'HYPERDRIVE BOOST (72c)'}
                </button>
                <button
                  type="button"
                  className="btn-hud-mode"
                  onClick={() => setLoopMode('tour')}
                >
                  🔁 PORTFOLIO LOOP TOUR
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {ready && !infinityMode && (
        <div className="walk" aria-label="Move between rooms">
          {prev && (
            <button type="button" onClick={() => go(room - 1)}>
              Back to {prev.nav}
            </button>
          )}
          {next ? (
            <button
              type="button"
              className="walk-btn-next"
              onClick={() => onOpenDoor(room + 1)}
            >
              SECTOR: {next.title.toUpperCase()} →
            </button>
          ) : (
            <button
              type="button"
              className="walk-btn-infinity"
              onClick={onEnterInfinity}
            >
              ∞ ENTER INFINITY HYPERSPACE →
            </button>
          )}
        </div>
      )}

      {ready && !moved && !infinityMode && (
        <p className="hint">Scroll, click open gateways, or use arrow keys to navigate</p>
      )}

      <div className={`loader${ready ? ' done' : ''}`} aria-hidden={ready}>
        <div className="loader-inner">
          <p className="loader-name">{PROFILE.name}</p>
          <p className="loader-role">Building the rooms</p>
          <span className="loader-bar" />
        </div>
      </div>
    </>
  )
}
