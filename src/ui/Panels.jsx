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
  INFINITY,
  PERSONAL_DETAILS,
  calculateAge,
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
    let id = 0
    const total = 22
    const start = setTimeout(() => (id = setInterval(tick, 32)), 550) // wait for the panel to appear
    const tick = () => {
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
    }
    return () => {
      clearTimeout(start)
      clearInterval(id)
    }
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
      <h1 className="name">
        <span>Rameshwor</span> <span>Chaudhary</span>
      </h1>
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
function UniversePanel({ filter, setFilter }) {
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
        <div>
          <dt>Date of birth</dt>
          <dd><time dateTime={PERSONAL_DETAILS.birthDate}>16 April 2003</time></dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>{calculateAge()} years</dd>
        </div>
        <div>
          <dt>Height</dt>
          <dd>{PERSONAL_DETAILS.height}</dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>{PERSONAL_DETAILS.weight}</dd>
        </div>
        <div>
          <dt>Father</dt>
          <dd>{PERSONAL_DETAILS.father}</dd>
        </div>
        <div>
          <dt>Mother</dt>
          <dd>{PERSONAL_DETAILS.mother}</dd>
        </div>
        <div>
          <dt>Brother</dt>
          <dd>{PERSONAL_DETAILS.brother}</dd>
        </div>
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
    </div>
  )
}

/* ------------------------------ Experience --------------------------- */
function ExperiencePanel({ idx, setIdx }) {
  const e = EXPERIENCE[idx]
  return (
    <div>
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
      <article key={e.org}>
        <p className="tagline">
          {e.tag}, {e.period}
        </p>
        <h3>{e.title}</h3>
        <p className="meta">{e.sub}</p>
        <p>{e.summary}</p>

        <p className="list-title">About the engagement</p>
        <p>{e.context}</p>

        <p className="list-title">What I did</p>
        <ul className="points">
          {e.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <p className="list-title">{e.phasesTitle}</p>
        <dl className="phases">
          {e.phases.map((ph) => (
            <div key={ph.t}>
              <dt>{ph.t}</dt>
              <dd>{ph.d}</dd>
            </div>
          ))}
        </dl>

        <p className="list-title">What I took away</p>
        <p>{e.learned}</p>

        <p className="list-title">Tools</p>
        <Chips items={e.tech} />
      </article>
    </div>
  )
}

/* ------------------------------ Education ---------------------------- */
function EducationPanel() {
  return (
    <div>
      <Scramble text="Academic Education" />
      <p className="lede">{EDUCATION_INTRO}</p>
      {EDUCATION.map((ed) => (
        <article key={ed.degree} className="edu">
          <p className="tagline">
            {ed.period}, {ed.badge}
          </p>
          <h3>{ed.degree}</h3>
          <p className="meta">{ed.school}</p>
          <p>{ed.summary}</p>
          <p>{ed.focus}</p>
          <p className="list-title">{ed.listTitle}</p>
          <dl className="phases">
            {ed.courses.map((c) => (
              <div key={c.name}>
                <dt>{c.name}</dt>
                <dd>{c.note}</dd>
              </div>
            ))}
          </dl>
          <p className="list-title">How it connects to my work</p>
          <p>{ed.applied}</p>
          <p className="meta">{ed.honor}</p>
        </article>
      ))}
    </div>
  )
}

/* ------------------------------- Theater ----------------------------- */
function TheaterPanel({ idx, setIdx, filter, setFilter }) {
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

function ContactPanel() {
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
    </div>
  )
}

/* ------------------------------- Infinity Portal ----------------------------- */
function InfinityPanel({ go, onWarpHome }) {
  const triggerAssistant = () => {
    const trigger = document.getElementById('ishwor-assistant-trigger')
    if (trigger) trigger.click()
  }

  const handleReturn = onWarpHome || (() => go(0))

  return (
    <div className="infinity-panel">
      <Scramble text={INFINITY.heading} />
      <p className="lede">{INFINITY.blurb}</p>
      <p className="meta" style={{ color: 'var(--room)' }}>
        {INFINITY.vision}
      </p>

      <dl className="stats">
        {INFINITY.stats.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>

      <p className="list-title">Active & Future Research Horizons</p>
      <dl className="phases">
        {INFINITY.horizons.map((h) => (
          <div key={h.title}>
            <dt style={{ color: 'var(--ink)' }}>{h.title}</dt>
            <dd>{h.desc}</dd>
          </div>
        ))}
      </dl>

      <div className="actions" style={{ marginTop: '24px' }}>
        <button type="button" className="btn primary infinity-warp-btn" onClick={handleReturn}>
          ↺ Loop through Portal to Room 1 (Home)
        </button>
        <button type="button" className="btn" onClick={triggerAssistant}>
          🎙️ Ask Ishwor AI Assistant
        </button>
        <Ext className="btn" href={PROFILE.resume}>
          Resume (PDF)
        </Ext>
      </div>
    </div>
  )
}

/* -------------------------------- Switch ----------------------------- */
export default function RoomPanel({
  room,
  go,
  onWarpHome,
  filter,
  setFilter,
  expIndex,
  setExpIndex,
  projIndex,
  setProjIndex,
  projFilter,
  setProjFilter,
}) {
  switch (ROOMS[room]?.id) {
    case 'home':
      return <HomePanel go={go} />
    case 'universe':
      return <UniversePanel filter={filter} setFilter={setFilter} />
    case 'experience':
      return <ExperiencePanel idx={expIndex} setIdx={setExpIndex} />
    case 'education':
      return <EducationPanel />
    case 'theater':
      return <TheaterPanel idx={projIndex} setIdx={setProjIndex} filter={projFilter} setFilter={setProjFilter} />
    case 'contact':
      return <ContactPanel />
    case 'infinity':
      return <InfinityPanel go={go} onWarpHome={onWarpHome} />
    default:
      return <ContactPanel />
  }
}
