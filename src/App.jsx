import { useEffect, useState } from 'react'
import Module1 from './Module1'
import Module2 from './Module2'

const MODULES = [
  { id: '1', short: '1 · Components', Component: Module1 },
  { id: '2', short: '2 · Two points', Component: Module2 },
]

function readHash() {
  const id = window.location.hash.replace('#/', '')
  return MODULES.some((m) => m.id === id) ? id : '1'
}

export default function App() {
  const [id, setId] = useState(readHash)

  useEffect(() => {
    const onHash = () => setId(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (next) => {
    window.location.hash = `#/${next}`
    setId(next)
  }

  const nav = (
    <>
      <img className="brand" src="/logo.png" alt="Statics 3D" width="560" height="560" />
      <nav className="modnav" aria-label="Modules">
        {MODULES.map((m) => (
          <button key={m.id} className={m.id === id ? 'active' : ''} onClick={() => go(m.id)}>
            {m.short}
          </button>
        ))}
      </nav>
    </>
  )

  const { Component } = MODULES.find((m) => m.id === id)
  return <Component key={id} nav={nav} />
}
