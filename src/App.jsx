import { useState } from 'react'
import Scene from './Scene'
import { COLORS } from './colors'
import {
  componentsFromAngles,
  directionCosines,
  magnitude,
  DEFAULT_FORCE,
  EXAMPLE_2_4,
  EXAMPLE_2_4_ANSWER,
} from './physics'
import './App.css'

const VIEWS = {
  '3D': { pos: [8.5, 6, 10], target: [0, 1, 0] },
  Front: { pos: [0, 1, 14], target: [0, 1, 0] },
  Top: { pos: [0, 14, 0.001], target: [0, 0, 0] },
  Side: { pos: [14, 1, 0], target: [0, 1, 0] },
}

const fmt = (n, d = 1) => (Math.abs(n) < 0.05 && d === 1 ? 0 : n).toFixed(d)

function Slider({ label, symbol, unit, value, min, max, step, onChange }) {
  return (
    <label className="slider">
      <span className="slider-top">
        <span>
          {label} <em>{symbol}</em>
        </span>
        <strong>
          {fmt(value)}
          {unit}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function Row({ name, formula, value, color }) {
  return (
    <div className="row">
      <span className="row-name" style={{ color }}>
        {name}
      </span>
      <span className="row-formula">{formula}</span>
      <span className="row-value">{value}</span>
    </div>
  )
}

function Practice({ onShow }) {
  const [ans, setAns] = useState({ x: '', y: '', z: '' })
  const [result, setResult] = useState(null)

  const check = () => {
    const r = {}
    for (const k of ['x', 'y', 'z']) {
      const v = parseFloat(ans[k])
      const t = EXAMPLE_2_4_ANSWER[k]
      r[k] = Number.isFinite(v) && Math.abs(v - t) <= Math.max(0.015 * Math.abs(t), 5)
    }
    setResult(r)
  }

  return (
    <section className="card">
      <h2>Practice · Example 2.4</h2>
      <p>
        The tension in the guy wire is <b>2500 N</b>. The wire runs from the bolt at A to the top of
        the tower at B, and
        <br />
        <code>AB = (−40 i + 80 j + 30 k) m</code>. Find the components <b>Fx, Fy, Fz</b> of the force
        on the bolt (in N).
      </p>
      <div className="answers">
        {['x', 'y', 'z'].map((k) => (
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
        <button onClick={check}>Check</button>
        <button className="ghost" onClick={onShow}>
          Show answer on model
        </button>
      </div>
      {result && (
        <p className="feedback">
          {Object.values(result).every(Boolean)
            ? 'Correct. Rotate the model to see how the three components build the force.'
            : 'Not quite. Check the signs: A is to the right of the tower, so Fx points in the negative x direction.'}
        </p>
      )}
    </section>
  )
}

export default function App() {
  const [F, setF] = useState(DEFAULT_FORCE.F)
  const [thetaY, setThetaY] = useState(DEFAULT_FORCE.thetaY)
  const [phi, setPhi] = useState(DEFAULT_FORCE.phi)
  const [showBox, setShowBox] = useState(true)
  const [showH, setShowH] = useState(true)
  const [showAngles, setShowAngles] = useState(true)
  const [view, setView] = useState({ ...VIEWS['3D'], n: 0 })

  const c = componentsFromAngles(F, thetaY, phi)
  const dc = directionCosines(c)

  const loadExample = () => {
    setF(EXAMPLE_2_4.F)
    setThetaY(EXAMPLE_2_4.thetaY)
    setPhi(EXAMPLE_2_4.phi)
    setView((v) => ({ ...VIEWS['3D'], n: v.n + 1 }))
  }
  const reset = () => {
    setF(DEFAULT_FORCE.F)
    setThetaY(DEFAULT_FORCE.thetaY)
    setPhi(DEFAULT_FORCE.phi)
  }
  const go = (name) => setView((v) => ({ ...VIEWS[name], n: v.n + 1 }))

  return (
    <div className="app">
      <div className="stage">
        <Scene
          view={view}
          F={F}
          thetaY={thetaY}
          phi={phi}
          showBox={showBox}
          showH={showH}
          showAngles={showAngles}
        />
        <div className="views">
          {Object.keys(VIEWS).map((name) => (
            <button key={name} onClick={() => go(name)}>
              {name}
            </button>
          ))}
        </div>
        <div className="hint">Drag to rotate · scroll or pinch to zoom</div>
      </div>

      <aside className="panel">
        <header>
          <p className="eyebrow">Unit 2 · Forces and Moments</p>
          <h1>A force in 3D space</h1>
        </header>

        <section className="card">
          <Slider label="Magnitude" symbol="F" unit=" N" value={F} min={0} max={3000} step={10} onChange={setF} />
          <Slider label="Angle from y-axis" symbol="θy" unit="°" value={thetaY} min={0} max={180} step={0.1} onChange={setThetaY} />
          <Slider label="Horizontal angle from x" symbol="φ" unit="°" value={phi} min={0} max={360} step={0.1} onChange={setPhi} />
          <div className="btn-row">
            <button className="ghost" onClick={loadExample}>
              Load Example 2.4
            </button>
            <button className="ghost" onClick={reset}>
              Reset
            </button>
          </div>
          <div className="toggles">
            <Toggle label="Box" checked={showBox} onChange={setShowBox} />
            <Toggle label="Fh" checked={showH} onChange={setShowH} />
            <Toggle label="Angles" checked={showAngles} onChange={setShowAngles} />
          </div>
        </section>

        <section className="card">
          <h2>Components</h2>
          <Row name="Fh" formula="F sin θy" value={`${fmt(c.h)} N`} color={COLORS.h} />
          <Row name="Fx" formula="F sin θy cos φ" value={`${fmt(c.x)} N`} color={COLORS.x} />
          <Row name="Fy" formula="F cos θy" value={`${fmt(c.y)} N`} color={COLORS.y} />
          <Row name="Fz" formula="F sin θy sin φ" value={`${fmt(c.z)} N`} color={COLORS.z} />
          <div className="check">
            √(Fx² + Fy² + Fz²) = <b>{fmt(magnitude(c))} N</b>
          </div>
        </section>

        <section className="card">
          <h2>Direction cosines</h2>
          {dc ? (
            <>
              <Row name="cos θx" formula={`θx = ${fmt(dc.angle.x)}°`} value={fmt(dc.cos.x, 3)} color={COLORS.x} />
              <Row name="cos θy" formula={`θy = ${fmt(dc.angle.y)}°`} value={fmt(dc.cos.y, 3)} color={COLORS.y} />
              <Row name="cos θz" formula={`θz = ${fmt(dc.angle.z)}°`} value={fmt(dc.cos.z, 3)} color={COLORS.z} />
              <div className="check">
                λ = {fmt(dc.cos.x, 3)} i {dc.cos.y < 0 ? '−' : '+'} {fmt(Math.abs(dc.cos.y), 3)} j{' '}
                {dc.cos.z < 0 ? '−' : '+'} {fmt(Math.abs(dc.cos.z), 3)} k
              </div>
              <div className="check">
                cos²θx + cos²θy + cos²θz ={' '}
                <b>{fmt(dc.cos.x ** 2 + dc.cos.y ** 2 + dc.cos.z ** 2, 3)}</b>
              </div>
            </>
          ) : (
            <p className="muted">Increase F to see the direction.</p>
          )}
        </section>

        <section className="card">
          <h2>How to read it</h2>
          <p>
            Any force F is the diagonal of a box. Its edges are Fx, Fy and Fz. First split F into a
            vertical part <b>Fy = F cos θy</b> and a horizontal part <b>Fh = F sin θy</b>, then split
            Fh along x and z using φ.
          </p>
          <p>
            Try the <b>Front</b>, <b>Top</b> and <b>Side</b> views: each one flattens the force into
            the 2D picture you draw on paper, and hides the third component.
          </p>
        </section>

        <Practice onShow={loadExample} />
      </aside>
    </div>
  )
}
