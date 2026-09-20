import { useEffect, useState } from 'react'
import {
  PROFILE,
  ROOMS,
  UNIVERSE,
  SKILLS,
  SKILL_FILTERS,
  EXPERIENCE_INTRO,
  EXPERIENCE,
  EDUCATION_INTRO,
  EDUCATION,
  PROJECTS_INTRO,
  PROJECTS,
  PROJECT_FILTERS,
  visibleProjects,
  stepProject,
  CONTACT,
} from '../data'

const Ext = ({ href, children, className }) => (
  <a className={className} href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
)

const Chips = ({ items }) => (
  <ul className="chips">
    {items.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
)

// Heading that "decodes" into its final text. Screen readers get the real text at once.
const GLYPHS = '01<>/\\_-+=*#%'
function Scramble({ text, as: Tag = 'h2' }) {
  const [shown, setShown] = useState(text)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const total = 22
    const id = setInterval(() => {
      frame++
      const reveal = Math.floor((frame / total) * text.length)
      setShown(
        text
          .split('')
          .map((ch, i) => (ch === ' ' || i < reveal ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      )
      if (frame >= total) {
        clearInterval(id)
        setShown(text)
      }
    }, 32)
    return () => clearInterval(id)
  }, [text])
  return (
    <Tag>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </Tag>
  )
}

/* -------------------------------- Home ------------------------------- */
function HomePanel({ go }) {
  return (
    <div className="home">
      <p className="hello">Welcome to my world</p>
      <h1 className="name">{PROFILE.short}</h1>
      <p className="role">{PROFILE.role}</p>
      <p className="lede">{PROFILE.quote}</p>
      <dl className="stats">
        {PROFILE.stats.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="meta">{PROFILE.line}</p>
      <p className="meta">{PROFILE.status}</p>
      <div className="actions">
        <button type="button" className="btn primary" onClick={() => go(1)}>
          Enter the universe
        </button>
        <Ext className="btn" href={PROFILE.resume}>
          Resume (PDF)
        </Ext>
      </div>
    </div>
  )
}

/* ------------------------------ Universe ----------------------------- */
function UniversePanel({ filter, setFilter, onOpenDoor }) {
  const count = (id) => (id === 'all' ? SKILLS.length : SKILLS.filter((s) => s.cat === id).length)
  return (
    <div>
      <Scramble text="The Neural Universe" />
      <p className="lede">{UNIVERSE.blurb}</p>
      <h3>{UNIVERSE.heading}</h3>
      {UNIVERSE.about.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <dl className="facts">
        {UNIVERSE.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      <h3>Skills in orbit</h3>
      <div className="filters" role="group" aria-label="Filter skills">
        {SKILL_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="filter"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label} ({count(f.id)})
          </button>
        ))}
      </div>
      <ul className="skill-list">
        {SKILLS.filter((s) => filter === 'all' || s.cat === filter).map((s) => (
          <li key={s.name}>
            <span className={`dot ${s.cat}`} aria-hidden="true" />
            {s.name}
            <small>{s.note}</small>
          </li>
        ))}
      </ul>
      {onOpenDoor && (
        <div className="door-action-wrap">
          <button type="button" className="btn-door-launch" onClick={() => onOpenDoor(2)}>
            <span className="door-icon">🚪</span> OPEN GATEWAY 03: WORK & EXPERIENCE →
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Experience --------------------------- */
function ExperiencePanel({ idx, setIdx, onOpenDoor }) {
  const e = EXPERIENCE[idx]
  return (
    <div className="exp-panel-wrap">
      <Scramble text="Work & Experience" />
      <p className="lede">{EXPERIENCE_INTRO}</p>
      <div className="tabs" role="tablist" aria-label="Experience">
        {EXPERIENCE.map((x, i) => (
          <button
            key={x.org}
            type="button"
            role="tab"
            aria-selected={i === idx}
            className="tab"
            onClick={() => setIdx(i)}
          >
            {x.org}
          </button>
        ))}
      </div>

      <article className="exp-article">
        <div className="exp-header-top">
          <p className="tagline">
            {e.tag} • {e.period}
          </p>
          {e.status && (
            <span className="status-badge">
              <span className="live-dot" /> {e.status}
            </span>
          )}
        </div>

        <h3 className="exp-title">{e.title}</h3>
        <p className="meta exp-sub">{e.sub}</p>

        {e.kpis && (
          <div className="kpi-grid">
            {e.kpis.map((k) => (
              <div key={k.label} className="kpi-card">
                <div className="kpi-val">{k.value}</div>
                <div className="kpi-lbl">{k.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="summary-box">
          <p>{e.summary}</p>
        </div>

        <h4 className="section-subtitle">Key Technical Implementations & Architecture</h4>
        <ul className="points exp-points">
          {e.points.map((p) => (
            <li key={p}>
              <span className="bullet-chevron">›</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <h4 className="section-subtitle">Core Technologies & Tooling</h4>
        <Chips items={e.tech} />

        {onOpenDoor && (
          <div className="door-action-wrap">
            <button type="button" className="btn-door-launch" onClick={() => onOpenDoor(3)}>
              <span className="door-icon">🚪</span> OPEN GATEWAY 04: ACADEMIC EDUCATION →
            </button>
          </div>
        )}
      </article>
    </div>
  )
}

/* ------------------------------ Education ---------------------------- */
function EducationPanel({ onOpenDoor }) {
  return (
    <div className="edu-panel-wrap">
      <Scramble text="Academic Education" />
      <p className="lede">{EDUCATION_INTRO}</p>
      {EDUCATION.map((ed) => (
        <article key={ed.degree} className="edu edu-expanded-card">
          <div className="edu-card-top">
            <p className="tagline">
              {ed.period}
            </p>
            <span className="badge-pill">{ed.badge}</span>
          </div>
          <h3 className="edu-degree">{ed.degree}</h3>
          <p className="meta edu-school">{ed.school}</p>

          {ed.metrics && (
            <div className="kpi-grid edu-kpi-grid">
              {ed.metrics.map((m) => (
                <div key={m.label} className="kpi-card">
                  <div className="kpi-val">{m.value}</div>
                  <div className="kpi-lbl">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          <p className="edu-summary">{ed.summary}</p>

          {ed.highlights && (
            <div className="edu-highlights-block">
              <h4 className="section-subtitle">Academic Highlights & Research</h4>
              <ul className="points">
                {ed.highlights.map((h, i) => (
                  <li key={i}>
                    <span className="bullet-chevron">›</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="list-title">{ed.listTitle}</p>
          <Chips items={ed.list} />

          {ed.honor && (
            <div className="edu-honor-box">
              <span className="honor-icon">★</span>
              <span>{ed.honor}</span>
            </div>
          )}
        </article>
      ))}

      {onOpenDoor && (
        <div className="door-action-wrap">
          <button type="button" className="btn-door-launch" onClick={() => onOpenDoor(4)}>
            <span className="door-icon">🚪</span> OPEN GATEWAY 05: THE HOLO THEATER →
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------- Theater ----------------------------- */
function TheaterPanel({ idx, setIdx, filter, setFilter, onOpenDoor }) {
  const p = PROJECTS[idx]
  const list = visibleProjects(filter)
  const pos = list.indexOf(idx) + 1
  const count = (id) => visibleProjects(id).length
  return (
    <div>
      <Scramble text="The Holo Theater" />
      <p className="lede">{PROJECTS_INTRO}</p>

      <div className="filters" role="group" aria-label="Filter projects">
        {PROJECT_FILTERS.map((f) => (
          <button key={f.id} type="button" className="filter" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} ({count(f.id)})
          </button>
        ))}
      </div>

      <article key={p.name} className="proj">
        <div className="proj-top">
          <p className={`tagline ${p.status === 'Completed' ? 'done' : 'wip'}`}>
            {p.status}, {p.kind}
          </p>
          <span className="count" aria-live="polite">
            {pos} of {list.length}
          </span>
        </div>
        <h3>{p.name}</h3>
        <p className="meta">{p.sub}</p>
        <p>{p.desc}</p>
        <Chips items={p.tech} />
        <div className="actions">
          {p.links.map((l) => (
            <Ext key={l.label + l.href} className="btn primary" href={l.href}>
              {l.label}
            </Ext>
          ))}
        </div>
        <div className="pager">
          <button type="button" className="btn" onClick={() => setIdx(stepProject(idx, -1, filter))}>
            Previous project
          </button>
          <button type="button" className="btn" onClick={() => setIdx(stepProject(idx, 1, filter))}>
            Next project
          </button>
        </div>
      </article>

      {onOpenDoor && (
        <div className="door-action-wrap">
          <button type="button" className="btn-door-launch" onClick={() => onOpenDoor(5)}>
            <span className="door-icon">🚪</span> OPEN GATEWAY 06: START A CONVERSATION →
          </button>
        </div>
      )}

      <h3>All projects</h3>
      <ul className="proj-list">
        {list.map((i) => (
          <li key={PROJECTS[i].name}>
            <button type="button" aria-current={i === idx} onClick={() => setIdx(i)}>
              <span className={`state ${PROJECTS[i].status === 'Completed' ? 'done' : 'wip'}`} aria-hidden="true" />
              <span className="pname">{PROJECTS[i].name}</span>
              <span className="pkind">{PROJECTS[i].kind}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------- Contact ----------------------------- */
function ContactForm() {
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setState('sending')
    setError('')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: PROFILE.web3formsKey,
          subject: 'New message from your portfolio',
          name: fd.get('name'),
          email: fd.get('email'),
          message: fd.get('message'),
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'The message could not be sent.')
      form.reset()
      setState('sent')
    } catch (err) {
      setError(err.message || 'The message could not be sent. Email me directly instead.')
      setState('error')
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        Your name
        <input name="name" type="text" placeholder="Alex Smith" required autoComplete="name" />
      </label>
      <label>
        Email address
        <input name="email" type="email" placeholder="alex@example.com" required autoComplete="email" />
      </label>
      <label>
        Your message
        <textarea name="message" rows="4" placeholder="Tell me about your project, role, or inquiry" required />
      </label>
      <button className="btn primary" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending' : 'Send message'}
      </button>
      <p className="form-status" role="status">
        {state === 'sent' && 'Message sent. I will reply to your email soon.'}
        {state === 'error' && error}
      </p>
    </form>
  )
}

function ContactPanel({ onEnterInfinity }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${PROFILE.email}`
    }
  }
  return (
    <div>
      <Scramble text={CONTACT.heading} />
      <p className="lede">{CONTACT.blurb}</p>
      <ul className="channels">
        <li>
          <span>Email</span>
          <button type="button" className="linklike" onClick={copy}>
            {PROFILE.email}
          </button>
          <small>{copied ? 'Copied' : 'Click to copy'}</small>
        </li>
        {PROFILE.links
          .filter((l) => l.href)
          .map((l) => (
            <li key={l.id}>
              <span>{l.label}</span>
              <Ext className="linklike" href={l.href}>
                {l.handle}
              </Ext>
            </li>
          ))}
      </ul>
      <p className="meta">{PROFILE.location}</p>
      <p className="meta">Tip: the badges orbiting the beacon are clickable too.</p>
      <ContactForm />

      {onEnterInfinity && (
        <div className="infinity-action-wrap">
          <button type="button" className="btn-infinity-launch" onClick={onEnterInfinity}>
            <span className="infinity-icon">∞</span>
            <div className="infinity-btn-text">
              <span className="infinity-main">UNLOCK INFINITY HYPERSPACE PORTAL</span>
              <span className="infinity-sub">Continuous forward voyage into deep cosmos • Never need to return</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

/* -------------------------------- Switch ----------------------------- */
export default function RoomPanel({
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
}) {
  switch (ROOMS[room].id) {
    case 'home':
      return <HomePanel go={go} onOpenDoor={onOpenDoor} />
    case 'universe':
      return <UniversePanel filter={filter} setFilter={setFilter} onOpenDoor={onOpenDoor} />
    case 'experience':
      return <ExperiencePanel idx={expIndex} setIdx={setExpIndex} onOpenDoor={onOpenDoor} />
    case 'education':
      return <EducationPanel onOpenDoor={onOpenDoor} />
    case 'theater':
      return <TheaterPanel idx={projIndex} setIdx={setProjIndex} filter={projFilter} setFilter={setProjFilter} onOpenDoor={onOpenDoor} />
    default:
      return <ContactPanel onEnterInfinity={onEnterInfinity} />
  }
}
