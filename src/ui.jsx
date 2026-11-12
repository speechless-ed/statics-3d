import { useEffect, useRef, useState } from "react"
import { fmt } from "./format"

export function Slider({ label, symbol, unit, value, min, max, step, digits = 1, onChange }) {
  return (
    <label className="slider">
      <span className="slider-top">
        <span>
          {label} <em>{symbol}</em>
        </span>
        <strong>
          {fmt(value, digits)}
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

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

export function Row({ name, formula, value, color }) {
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

export function FullscreenButton({ full, onToggle }) {
  return (
    <button
      className="fs-btn"
      onClick={onToggle}
      aria-label={full ? 'Exit full screen' : 'Full screen'}
      title={full ? 'Exit full screen' : 'Full screen'}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {full ? (
          <path d="M6 1.5v4.5H1.5M10 14.5V10h4.5M10 1.5V6h4.5M6 14.5V10H1.5" />
        ) : (
          <path d="M1.5 6V1.5H6M14.5 6V1.5H10M1.5 10v4.5H6M14.5 10v4.5H10" />
        )}
      </svg>
      <span>{full ? 'Exit' : 'Full screen'}</span>
    </button>
  )
}

// Button that keeps its "pressed" look for a moment after a tap or click, so even a quick
// tap on a phone clearly shows the colours inverting (CSS: .btn-row button.pressed).
export function ActionButton({ className = '', onClick, children, ...rest }) {
  const [pressed, setPressed] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handle = (e) => {
    setPressed(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPressed(false), 320)
    if (onClick) onClick(e)
  }

  return (
    <button {...rest} className={`${className}${pressed ? ' pressed' : ''}`.trim()} onClick={handle}>
      {children}
    </button>
  )
}
