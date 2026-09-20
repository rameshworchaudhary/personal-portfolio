import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PROFILE, ROOMS, stepProject, visibleProjects } from './data'
import RoomPanel from './ui/Panels'
import { getTier, hasWebGL, prefersReducedMotion, playDoorOpenSound, playDoorCloseSound, playInfinityWarpSound } from './scene/utils'
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

  // stop = 2 * room while standing in a room, 2 * room + 1 while standing at the door after it.
  const [stop, setStop] = useState(() => roomFromHash() * 2)
  // Individual open/closed state for the 6 doors between rooms
  const [openDoors, setOpenDoors] = useState(() => {
    const cur = roomFromHash()
    const doors = [false, false, false, false, false, false]
    for (let i = 0; i < cur; i++) doors[i] = true
    return doors
  })
  const [warping, setWarping] = useState(false)
  const [warpToast, setWarpToast] = useState(false)

  const [filter, setFilter] = useState('all')
  const [expIndex, setExpIndex] = useState(0)
  const [projIndex, setProjIndex] = useState(0)
  const [projFilter, setProjFilterRaw] = useState('all')
  const [ready, setReady] = useState(!webgl)
  const [fontsOk, setFontsOk] = useState(!webgl)
  const [compact, setCompact] = useState(() => window.innerWidth < 900)
  const [failed, setFailed] = useState(false)
  const filterRef = useRef('all')

  const room = Math.floor(stop / 2)
  const atDoor = stop % 2 === 1

  // Changing the filter jumps to the first matching project if the current one is hidden.
  const setProjFilter = useCallback((f) => {
    setProjFilterRaw(f)
    setProjIndex((i) => (visibleProjects(f).includes(i) ? i : visibleProjects(f)[0]))
  }, [])

  const onReady = useCallback(() => setReady(true), [])

  // Open a specific door
  const openDoor = useCallback((idx = room) => {
    playDoorOpenSound()
    setOpenDoors((prev) => {
      const next = [...prev]
      next[idx] = true
      return next
    })
  }, [room])

  // Close a specific door
  const closeDoor = useCallback((idx = room) => {
    playDoorCloseSound()
    setOpenDoors((prev) => {
      const next = [...prev]
      next[idx] = false
      return next
    })
  }, [room])

  // Toggle a door open or closed
  const toggleDoor = useCallback((idx = room) => {
    setOpenDoors((prev) => {
      const isOpen = !!prev[idx]
      if (isOpen) {
        playDoorCloseSound()
      } else {
        playDoorOpenSound()
      }
      const next = [...prev]
      next[idx] = !isOpen
      return next
    })
  }, [room])

  // Close all open doors across the gallery
  const closeAllDoors = useCallback(() => {
    playDoorCloseSound()
    setOpenDoors([false, false, false, false, false, false])
  }, [])

  // Steps through the open door into the next room
  const stepThroughDoor = useCallback(() => {
    setStop((s) => (s % 2 === 1 ? s + 1 : s))
  }, [])

  // Cosmic hyperspace warp from Infinity Portal back to Room 1 (Home)
  const warpToHome = useCallback(() => {
    playInfinityWarpSound()
    setWarping(true)
    setTimeout(() => {
      setStop(0)
      window.location.hash = 'home'
      setWarpToast(true)
      setTimeout(() => setWarping(false), 600)
      setTimeout(() => setWarpToast(false), 3800)
    }, 450)
  }, [])

  // Walks forward: room, then its door, then (once opened) steps into the next room.
  // When in Room 6 (Infinity Realm), forward step loops back to Room 1 (Home)!
  const next = useCallback(() => {
    setStop((s) => {
      const curRoom = Math.floor(s / 2)
      const door = s % 2 === 1
      if (door) {
        if (openDoors[curRoom]) {
          return Math.min((ROOMS.length - 1) * 2, s + 1)
        }
        openDoor(curRoom)
        return s
      }
      if (curRoom === ROOMS.length - 1) {
        warpToHome()
        return s
      }
      return curRoom < ROOMS.length - 1 ? s + 1 : s
    })
  }, [openDoors, openDoor, warpToHome])

  const prev = useCallback(() => setStop((s) => Math.max(0, s - 1)), [])

  // Jumping to a room through the nav opens path doors
  const go = useCallback((target) => {
    const t = clamp(target)
    setOpenDoors((prev) => {
      const next = [...prev]
      for (let i = 0; i < t; i++) next[i] = true
      return next
    })
    setStop(t * 2)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Home') {
        e.preventDefault()
        go(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        go(ROOMS.length - 1)
      } else if (e.key === 'Enter' && atDoor) {
        e.preventDefault()
        if (openDoors[room]) {
          stepThroughDoor()
        } else {
          openDoor(room)
        }
      } else if ((e.key === 'c' || e.key === 'C') && atDoor) {
        e.preventDefault()
        toggleDoor(room)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, go, atDoor, room, openDoors, stepThroughDoor, openDoor, toggleDoor])

  // Wheel: debounced, ignored while the cursor is inside a scrollable panel.
  useEffect(() => {
    let acc = 0
    let lock = false
    const onWheel = (e) => {
      if (canScroll(e.target, e.deltaY)) return
      acc += e.deltaY
      if (lock || Math.abs(acc) < 40) return
      lock = true
      if (acc > 0) next()
      else prev()
      acc = 0
      setTimeout(() => (lock = false), 600)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [next, prev])

  // Touch swipe
  useEffect(() => {
    let sy = 0
    let startEl = null
    const onStart = (e) => {
      sy = e.touches[0].clientY
      startEl = e.target
    }
    const onEnd = (e) => {
      const dy = sy - e.changedTouches[0].clientY
      if (Math.abs(dy) < 45 || canScroll(startEl, dy)) return
      if (dy > 0) next()
      else prev()
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [next, prev])

  // Hash sync
  useEffect(() => {
    if (!atDoor) window.location.hash = ROOMS[room].id
  }, [room, atDoor])

  // Accent color matches the room you are currently standing in
  useEffect(() => {
    document.documentElement.style.setProperty('--room', ROOMS[room].color)
  }, [room])

  // Load fonts and handle responsive breakpoint
  useEffect(() => {
    loadFonts().then(() => setFontsOk(true))
    const onResize = () => setCompact(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Initialize the Cinematic 0-100 Intro
  useEffect(() => {
    try {
      if (CinematicIntro && typeof CinematicIntro === 'function') {
        new CinematicIntro({
          onComplete: () => {
            // Intro finished
          },
        })
      }
    } catch (e) {
      console.warn('Cinematic intro initialization skipped:', e)
    }
  }, [])

  /* Plain version when WebGL is unavailable or fails */
  if (failed || !webgl) {
    return (
      <div className="fallback">
        <header className="fb-head">
          <p>3D hardware acceleration unavailable</p>
          <strong>{PROFILE.name}</strong>
        </header>
        {ROOMS.map((r, i) => (
          <section key={r.id} className="panel">
            <RoomPanel
              room={i}
              go={go}
              onWarpHome={warpToHome}
              filter={filter}
              setFilter={setFilter}
              expIndex={expIndex}
              setExpIndex={setExpIndex}
              projIndex={projIndex}
              setProjIndex={setProjIndex}
              projFilter={projFilter}
              setProjFilter={setProjFilter}
            />
          </section>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="stage" aria-hidden="true">
        <SceneBoundary onFail={() => setFailed(true)}>
          <Suspense fallback={null}>
            <Scene
              room={room}
              atDoor={atDoor}
              openDoors={openDoors}
              onToggleDoor={toggleDoor}
              onWarpHome={warpToHome}
              tier={tier}
              compact={compact}
              reduced={reduced}
              ready={ready && fontsOk}
              onReady={onReady}
              skillFilter={filter}
              expIndex={expIndex}
              setExpIndex={setExpIndex}
              projIndex={projIndex}
              setProjIndex={setProjIndex}
              projFilter={projFilter}
            />
          </Suspense>
        </SceneBoundary>
      </div>

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
              aria-current={!atDoor && i === room}
              onClick={() => go(i)}
            >
              {r.nav}
            </button>
          ))}
        </nav>
        <a className="btn primary resume" href={PROFILE.resume} target="_blank" rel="noopener noreferrer">
          Resume
        </a>
      </header>

      {!atDoor && (
        <main className="panel" key={ROOMS[room].id}>
          <div className="panel-scroll">
            <RoomPanel
              room={room}
              go={go}
              onWarpHome={warpToHome}
              filter={filter}
              setFilter={setFilter}
              expIndex={expIndex}
              setExpIndex={setExpIndex}
              projIndex={projIndex}
              setProjIndex={setProjIndex}
              projFilter={projFilter}
              setProjFilter={setProjFilter}
            />
          </div>
        </main>
      )}

      {atDoor && (
        <div className={`door-hint ${room === 5 ? 'infinity-door-hint' : ''}`}>
          <p className="door-name">
            <small>
              {room === 5 ? 'GATEWAY // ANANTA DWAR' : `Room ${String(room + 2).padStart(2, '0')}`}
            </small>
            {room === 5 ? 'The Infinity Portal (Ananta Dwar)' : ROOMS[room + 1].title}
            <span className={`door-status-pill ${openDoors[room] ? 'open' : 'closed'}`}>
              {openDoors[room] ? '● Door Open' : '○ Door Sealed'}
            </span>
          </p>

          <div className="door-actions">
            {!openDoors[room] ? (
              <button type="button" className="btn primary" onClick={() => openDoor(room)}>
                {room === 5 ? 'Open the Infinity Door [∞]' : 'Open the door'}
              </button>
            ) : (
              <>
                <button type="button" className="btn primary" onClick={stepThroughDoor}>
                  {room === 5 ? 'Enter Infinity Realm [∞] →' : `Step into ${ROOMS[room + 1].title} →`}
                </button>
                <button type="button" className="btn secondary door-close-btn" onClick={() => closeDoor(room)}>
                  Close door ✕
                </button>
              </>
            )}
          </div>

          <p className="hint">
            {openDoors[room]
              ? 'Click the door leaves to close, or press Enter / arrow key to walk in'
              : room === 5
              ? 'Click the Infinity Door to open, or press Enter'
              : 'Click the door to open, or press Enter'}
          </p>
        </div>
      )}

      {ready && !atDoor && (
        <nav className="walk" aria-label="Walk between rooms">
          {room > 0 && (
            <button type="button" onClick={prev}>
              Back to {ROOMS[room - 1].title}
            </button>
          )}

          {/* Close entrance door option if the door behind this room is open */}
          {room > 0 && openDoors[room - 1] && (
            <button
              type="button"
              className="walk-door-btn"
              onClick={() => closeDoor(room - 1)}
              title="Close the entrance door behind you"
            >
              🚪 Close door behind
            </button>
          )}

          {/* Close all open doors if any doors are open */}
          {openDoors.some(Boolean) && (
            <button
              type="button"
              className="walk-door-btn"
              onClick={closeAllDoors}
              title="Close all open doors"
            >
              🚪 Close all doors
            </button>
          )}

          {room < ROOMS.length - 1 && (
            <button
              type="button"
              onClick={next}
              className={room === 5 ? 'walk-btn-infinity' : 'walk-btn-next'}
            >
              {room === 5 ? 'Walk to the Infinity Door [∞] →' : `Next room: ${ROOMS[room + 1].title} →`}
            </button>
          )}

          {/* Loop from Infinity Portal back to Room 1 (Home) */}
          {room === 6 && (
            <button
              type="button"
              onClick={warpToHome}
              className="walk-btn-infinity warp-loop-btn"
            >
              Loop back to Room 1 (Home) ↺
            </button>
          )}
        </nav>
      )}

      {ready && !atDoor && (
        <p className="hint">
          {room === 6
            ? 'Scroll, press Space/Right Arrow, or click the Infinity Core to loop back to Room 1'
            : 'Scroll, swipe, or use the arrow keys to walk to the next door'}
        </p>
      )}

      {/* Cosmic Warp transition overlay & toast notification */}
      <div className={`warp-overlay ${warping ? 'active' : ''}`} aria-hidden="true" />
      {warpToast && (
        <div className="warp-toast" role="status">
          <span className="warp-toast-icon">∞</span> Returned to Room 01 (Home) via Infinity Loop
        </div>
      )}

      <div className={`loader${ready && fontsOk ? ' done' : ''}`} aria-hidden={ready && fontsOk}>
        <div className="loader-inner">
          <p className="loader-name">{PROFILE.name}</p>
          <p className="loader-role">Building the rooms</p>
          <span className="loader-bar" />
        </div>
      </div>
    </>
  )
}
