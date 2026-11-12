import { useRef, useState } from 'react'
import Scene2, { LIMIT } from './Scene2'
import { COLORS } from './colors'
import { VIEWS } from './views'
import { fmt } from './format'
import { Slider, Toggle, Row, FullscreenButton, ActionButton } from './ui'
import { useFullscreen } from './hooks'
import { forceAlong, EXAMPLE_2_4_POINTS, randomPracticeProblem } from './physics'
import './App.css'

const AXES = ['x', 'y', 'z']
const A_COLOR = '#22d3ee'
const B_COLOR = '#f472b6'

// Number with a true minus sign, d decimals.
const m = (n, d = 0) => fmt(n, d).replace('-', '−')
// A coordinate inside a subtraction: negative numbers get brackets.
const br = (n) => (n < 0 ? `(${m(n)})` : m(n))

function PointSliders({ name, color, p, onChange }) {
  return (
    <div className="pt">
      <div className="pt-name" style={{ color }}>
        Point {name}
      </div>
      <div className="coords">
        {AXES.map((k) => (
          <label key={k} className="coord">
            <span>
              <b style={{ color: COLORS[k] }}>{k}</b> {m(p[k])} m
            </span>
            <input
              type="range"
              min={-LIMIT}
              max={LIMIT}
              step={1}
              value={p[k]}
              onChange={(e) => onChange({ ...p, [k]: parseInt(e.target.value, 10) })}
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function Steps({ res, A, B, F, hidden }) {
  if (!res) {
    return (
      <section className="card">
        <h2>Working</h2>
        <p className="muted">A and B are the same point, so there is no direction. Move one of them.</p>
      </section>
    )
  }
  const { r, d, lambda, comps } = res
  const q = (value) => (hidden ? '?' : value)
  const f = (symbolic, numeric) => (hidden ? symbolic : numeric)

  return (
    <section className="card">
      <h2>Working</h2>

      <div className="step">
        <div className="step-title">
          <b>1</b> Vector from A to B: <code>AB = B − A</code>
        </div>
        {AXES.map((k) => (
          <Row
            key={k}
            name={`Δ${k}`}
            formula={f(`${k}B − ${k}A`, `${m(B[k])} − ${br(A[k])}`)}
            value={q(`${m(r[k])} m`)}
            color={COLORS[k]}
          />
        ))}
      </div>

      <div className="step">
        <div className="step-title">
          <b>2</b> Length: <code>d = √(Δx² + Δy² + Δz²)</code>
        </div>
        <Row
          name="d"
          formula={f('√(…)', `√(${Math.abs(r.x)}² + ${Math.abs(r.y)}² + ${Math.abs(r.z)}²)`)}
          value={q(`${m(d, 1)} m`)}
          color="#cbd5e1"
        />
      </div>

      <div className="step">
        <div className="step-title">
          <b>3</b> Unit vector: <code>λ = AB / d</code>
        </div>
        {AXES.map((k) => (
          <Row
            key={k}
            name={`λ${k}`}
            formula={f(`Δ${k} / d`, `${m(r[k])} / ${m(d, 1)}`)}
            value={q(m(lambda[k], 3))}
            color={COLORS[k]}
          />
        ))}
      </div>

      <div className="step">
        <div className="step-title">
          <b>4</b> Force: <code>F = F λ</code>
        </div>
        {AXES.map((k) => (
          <Row
            key={k}
            name={`F${k}`}
            formula={f(`F λ${k}`, `${F} × ${lambda[k] < 0 ? `(${m(lambda[k], 3)})` : m(lambda[k], 3)}`)}
            value={q(`${m(comps[k], 1)} N`)}
            color={COLORS[k]}
          />
        ))}
        {!hidden && (
          <div className="check">
            √(Fx² + Fy² + Fz²) = <b>{m(Math.hypot(comps.x, comps.y, comps.z), 1)} N</b>
          </div>
        )}
        {!hidden && <p className="muted small">Values are computed with unrounded numbers.</p>}
      </div>
    </section>
  )
}

function Practice({ problem, onNew, onReveal }) {
  const [ans, setAns] = useState({ x: '', y: '', z: '' })
  const [result, setResult] = useState(null)

  if (!problem) {
    return (
      <section className="card">
        <h2>Practice</h2>
        <p>
          Get a random problem: two points and a force along the line between them. Work out the
          components by hand, then check your answer.
        </p>
        <div className="btn-row">
          <ActionButton onClick={onNew}>New practice problem</ActionButton>
        </div>
      </section>
    )
  }

  const res = forceAlong(problem.F, problem.A, problem.B)
  const pt = (p) => `(${m(p.x)}, ${m(p.y)}, ${m(p.z)})`

  const check = () => {
    const r = {}
    for (const k of AXES) {
      const v = parseFloat(ans[k].replace('−', '-'))
      const t = res.comps[k]
      r[k] = Number.isFinite(v) && Math.abs(v - t) <= Math.max(0.015 * Math.abs(t), 5)
    }
    setResult(r)
    if (Object.values(r).every(Boolean)) onReveal()
  }

  const solved = result && Object.values(result).every(Boolean)

  return (
    <section className="card">
      <h2>Practice</h2>
      <p>
        A force of <b>{problem.F} N</b> acts at <b style={{ color: A_COLOR }}>A</b>{' '}
        <code>{pt(problem.A)}</code> m, directed toward <b style={{ color: B_COLOR }}>B</b>{' '}
        <code>{pt(problem.B)}</code> m. Find the components <b>Fx, Fy, Fz</b> in newtons.
      </p>
      <div className="answers">
        {AXES.map((k) => (
          <label key={k}>
            <span style={{ color: COLORS[k] }}>F{k}</span>
            <input
              inputMode="decimal"
              value={ans[k]}
              placeholder="N"
              className={result ? (result[k] ? 'ok' : 'bad') : ''}
              onChange={(e) => {
                setAns({ ...ans, [k]: e.target.value })
                setResult(null)
              }}
            />
          </label>
        ))}
      </div>
      <div className="btn-row">
        <ActionButton onClick={check}>Check</ActionButton>
        <ActionButton className="ghost" onClick={onReveal}>
          Show working
        </ActionButton>
        <ActionButton className="ghost" onClick={onNew}>
          New
        </ActionButton>
      </div>
      {result && (
        <p className="feedback">
          {solved
            ? 'Correct. The working above now shows each step.'
            : 'Not quite. Check the signs of Δx, Δy, Δz, and that you divide by d before multiplying by F.'}
        </p>
      )}
      <p className="muted small">Moving a point or a slider ends the problem.</p>
    </section>
  )
}

export default function Module2({ nav }) {
  const labelRoot = useRef(null)
  const [full, setFull] = useFullscreen()
  const ex = EXAMPLE_2_4_POINTS
  const [A, setA] = useState(ex.A)
  const [B, setB] = useState(ex.B)
  const [F, setF] = useState(ex.F)
  const [showSteps, setShowSteps] = useState(true)
  const [showForce, setShowForce] = useState(true)
  const [mode, setMode] = useState('horizontal')
  const [view, setView] = useState({ ...VIEWS['3D'], n: 0 })
  const [practice, setPractice] = useState(null)

  const res = forceAlong(F, A, B)
  const hidden = Boolean(practice && !practice.revealed)

  // Any change the student makes to the model ends the current practice problem.
  const edit = (setter) => (value) => {
    setPractice(null)
    setter(value)
  }

  const go = (name) => setView((v) => ({ ...VIEWS[name], n: v.n + 1 }))

  const loadExample = () => {
    setPractice(null)
    setA(ex.A)
    setB(ex.B)
    setF(ex.F)
    go('3D')
  }

  const newProblem = () => {
    const p = randomPracticeProblem()
    setA(p.A)
    setB(p.B)
    setF(p.F)
    setPractice({ ...p, id: Date.now() + Math.random(), revealed: false })
    go('3D')
  }

  return (
    <div className="app">
      <div className={full ? 'stage full' : 'stage'}>
        <Scene2
          view={view}
          labelRoot={labelRoot}
          A={A}
          B={B}
          F={F}
          showSteps={showSteps}
          showForce={showForce}
          mode={mode}
          onA={edit(setA)}
          onB={edit(setB)}
        />
        <div className="labels" ref={labelRoot} />
        <FullscreenButton full={full} onToggle={() => setFull(!full)} />
        <div className="views">
          {Object.keys(VIEWS).map((name) => (
            <button key={name} onClick={() => go(name)}>
              {name}
            </button>
          ))}
        </div>
        <div className="hint">Drag A or B to move them · drag empty space to rotate · grid squares are 20 m</div>
      </div>

      <aside className="panel">
        <header>
          {nav}
          <p className="eyebrow">Unit 2 · Forces and Moments</p>
          <h1>A force from two points</h1>
        </header>

        <section className="card">
          <PointSliders name="A" color={A_COLOR} p={A} onChange={edit(setA)} />
          <PointSliders name="B" color={B_COLOR} p={B} onChange={edit(setB)} />
          <Slider
            label="Force"
            symbol="F"
            unit=" N"
            value={F}
            min={0}
            max={3000}
            step={50}
            digits={0}
            onChange={edit(setF)}
          />
          <div className="seg" role="group" aria-label="What dragging a point does">
            <span>Dragging a point moves it</span>
            <button className={mode === 'horizontal' ? 'active' : ''} onClick={() => setMode('horizontal')}>
              across the ground
            </button>
            <button className={mode === 'vertical' ? 'active' : ''} onClick={() => setMode('vertical')}>
              up and down
            </button>
          </div>
          <div className="btn-row">
            <ActionButton className="ghost" onClick={loadExample}>
              Load Example 2.4
            </ActionButton>
          </div>
          <div className="toggles">
            <Toggle label="Steps Δx Δy Δz" checked={showSteps} onChange={setShowSteps} />
            <Toggle label="Force parts" checked={showForce} onChange={setShowForce} />
          </div>
        </section>

        <Steps res={res} A={A} B={B} F={F} hidden={hidden} />

        <section className="card">
          <h2>How to read it</h2>
          <p>
            The force acts along the line from A to B, so its direction is the <b>unit vector</b> λ
            along AB. Walk from A to B in three steps (<b style={{ color: COLORS.x }}>Δx</b>,{' '}
            <b style={{ color: COLORS.y }}>Δy</b>, <b style={{ color: COLORS.z }}>Δz</b>) to get AB,
            divide by its length to get λ, then multiply by F.
          </p>
          <p>
            The dashed lines drop from each point to the ground, so you can read its height and where
            it sits in plan.
          </p>
        </section>

        <Practice key={practice ? practice.id : 'none'} problem={practice} onNew={newProblem} onReveal={() => setPractice((p) => p && { ...p, revealed: true })} />
      </aside>
    </div>
  )
}
