// Force-in-space maths, using the same convention as the course handout
// (Basic Mechanics, Unit 2, "Rectangular Components in Space"):
//   y is vertical, x to the right, z toward the viewer (right-handed).
//   thetaY = angle between F and the +y axis
//   phi    = angle of the horizontal component Fh, measured from +x toward +z
//
//   Fh = F sin(thetaY)
//   Fy = F cos(thetaY)
//   Fx = Fh cos(phi) = F sin(thetaY) cos(phi)
//   Fz = Fh sin(phi) = F sin(thetaY) sin(phi)

const rad = (d) => (d * Math.PI) / 180
const deg = (r) => (r * 180) / Math.PI

export function componentsFromAngles(F, thetaYDeg, phiDeg) {
  const ty = rad(thetaYDeg)
  const p = rad(phiDeg)
  const h = F * Math.sin(ty)
  return { x: h * Math.cos(p), y: F * Math.cos(ty), z: h * Math.sin(p), h }
}

export function magnitude({ x, y, z }) {
  return Math.hypot(x, y, z)
}

export function anglesFromVector({ x, y, z }) {
  const F = Math.hypot(x, y, z)
  const thetaY = deg(Math.acos(y / F))
  let phi = deg(Math.atan2(z, x))
  if (phi < 0) phi += 360
  return { F, thetaY, phi }
}

// Direction cosines cos(theta_x), cos(theta_y), cos(theta_z), and the angles.
export function directionCosines({ x, y, z }) {
  const F = Math.hypot(x, y, z)
  if (F < 1e-9) return null
  const c = { x: x / F, y: y / F, z: z / F }
  return {
    cos: c,
    angle: { x: deg(Math.acos(c.x)), y: deg(Math.acos(c.y)), z: deg(Math.acos(c.z)) },
  }
}

// Handout Example 2.4: guy wire, T = 2500 N, AB = (-40 i + 80 j + 30 k) m.
// Handout answers: Fx = -1060 N, Fy = 2120 N, Fz = 795 N,
// theta_x = 115.1 deg, theta_y = 32.0 deg, theta_z = 71.5 deg.
export const EXAMPLE_2_4_VECTOR = { x: -40, y: 80, z: 30 }
export const EXAMPLE_2_4_ANSWER = { x: -1060, y: 2120, z: 795 }
export const EXAMPLE_2_4 = { ...anglesFromVector(EXAMPLE_2_4_VECTOR), F: 2500 }

export const DEFAULT_FORCE = { F: 1500, thetaY: 50, phi: 40 }
