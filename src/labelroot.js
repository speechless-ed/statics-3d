import { createContext } from 'react'

// Ref to the overlay <div> that holds the 3D text labels (see .labels in App.css).
// Giving the labels their own stable parent avoids a React removeChild error when a
// whole module (and its canvas) is swapped out.
export const LabelRoot = createContext(null)
