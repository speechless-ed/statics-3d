import { useEffect, useState } from 'react'

// Full-screen state for the 3D view. Uses a CSS overlay (not the browser Fullscreen API),
// because iPhones do not allow the Fullscreen API on ordinary page elements.
export function useFullscreen() {
  const [full, setFull] = useState(false)

  useEffect(() => {
    if (!full) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setFull(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [full])

  return [full, setFull]
}
