import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Arrow, Axes, Label, ViewSetter } from './Scene'
import { COLORS } from './colors'
import { forceAlong } from './physics'
import { LabelRoot } from './labelroot'

export const LIMIT = 90 // metres, each coordinate runs from -LIMIT to +LIMIT (matches the axis length)
const M = 0.05 // scene units per metre (60 m = 3 units)
const FS = 0.0008 // scene units per newton (2500 N = 2 units)

const world = (p) => [p.x * M, p.y * M, p.z * M]
const clampM = (v) => Math.max(-LIMIT, Math.min(LIMIT, Math.round(v / M)))

// A draggable point. "horizontal" mode slides it over the ground (changes x and z);
// "vertical" mode slides it up and down (changes y only).
function Handle({ point, color, name, mode, onChange }) {
  const camera = useThree((s) => s.camera)
  const getState = useThree((s) => s.get)
  const drag = useRef(null)
  const [hover, setHover] = useState(false)
  const pos = world(point)

  useEffect(() => {
    document.body.style.cursor = hover ? 'grab' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hover])

  const makePlane = () => {
    const p = new THREE.Vector3(...pos)
    if (mode === 'horizontal') return new THREE.Plane(new THREE.Vector3(0, 1, 0), -p.y)
    const n = new THREE.Vector3(camera.position.x - p.x, 0, camera.position.z - p.z)
    if (n.lengthSq() < 1e-6) n.set(0, 0, 1)
    return new THREE.Plane().setFromNormalAndCoplanarPoint(n.normalize(), p)
  }

  const down = (e) => {
    e.stopPropagation()
    const plane = makePlane()
    const hit = new THREE.Vector3()
    if (!e.ray.intersectPlane(plane, hit)) return
    e.target.setPointerCapture(e.pointerId)
    drag.current = { plane, off: new THREE.Vector3(...pos).sub(hit) }
    const c = getState().controls
    if (c) c.enabled = false
  }

  const move = (e) => {
    const d = drag.current
    if (!d) return
    const hit = new THREE.Vector3()
    if (!e.ray.intersectPlane(d.plane, hit)) return
    hit.add(d.off)
    if (mode === 'horizontal') onChange({ x: clampM(hit.x), y: point.y, z: clampM(hit.z) })
    else onChange({ x: point.x, y: clampM(hit.y), z: point.z })
  }

  const up = (e) => {
    if (!drag.current) return
    drag.current = null
    if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId)
    const c = getState().controls
    if (c) c.enabled = true
  }

  return (
    <group>
      {Math.abs(pos[1]) > 0.02 && (
        <>
          <Line
            points={[pos, [pos[0], 0, pos[2]]]}
            color={color}
            lineWidth={1}
            dashed
            dashSize={0.1}
            gapSize={0.08}
            transparent
            opacity={0.55}
          />
          <mesh position={[pos[0], 0.01, pos[2]]} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.09, 0.14, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
        </>
      )}
      <group position={pos}>
        <mesh
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[hover ? 0.17 : 0.13, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hover ? 0.6 : 0.25}
          />
        </mesh>
        <Label position={[0.3, 0.3, 0]} color={color}>
          {name}
        </Label>
      </group>
    </group>
  )
}

function TwoPointModel({ A, B, F, showSteps, showForce, mode, onA, onB }) {
  const res = forceAlong(F, A, B)
  const a = world(A)
  const b = world(B)

  const f = res ? [res.comps.x * FS, res.comps.y * FS, res.comps.z * FS] : [0, 0, 0]
  const [fx, fy, fz] = f

  const box = useMemo(() => {
    const e = (p, q) => [p, q]
    return [
      e([fx, 0, 0], [fx, fy, 0]),
      e([fx, 0, 0], [fx, 0, fz]),
      e([0, fy, 0], [fx, fy, 0]),
      e([0, fy, 0], [0, fy, fz]),
      e([0, 0, fz], [fx, 0, fz]),
      e([0, 0, fz], [0, fy, fz]),
      e([fx, fy, 0], [fx, fy, fz]),
      e([fx, 0, fz], [fx, fy, fz]),
      e([0, fy, fz], [fx, fy, fz]),
    ].flat()
  }, [fx, fy, fz])

  // The "stairs" from A to B: along x, then y, then z.
  const p1 = [b[0], a[1], a[2]]
  const p2 = [b[0], b[1], a[2]]
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]
  const long = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) > 0.12

  return (
    <group>
      {res && <Line points={[a, b]} color="#cbd5e1" lineWidth={1.5} />}

      {res && showSteps && (
        <>
          {long(a, p1) && (
            <>
              <Line points={[a, p1]} color={COLORS.x} lineWidth={3} />
              <Label position={mid(a, p1).map((v, i) => v + [0, -0.3, 0.2][i])} color={COLORS.x}>
                Δx
              </Label>
            </>
          )}
          {long(p1, p2) && (
            <>
              <Line points={[p1, p2]} color={COLORS.y} lineWidth={3} />
              <Label position={mid(p1, p2).map((v, i) => v + [0.3, 0, 0.2][i])} color={COLORS.y}>
                Δy
              </Label>
            </>
          )}
          {long(p2, b) && (
            <>
              <Line points={[p2, b]} color={COLORS.z} lineWidth={3} />
              <Label position={mid(p2, b).map((v, i) => v + [0.3, 0.3, 0][i])} color={COLORS.z}>
                Δz
              </Label>
            </>
          )}
        </>
      )}

      {res && (
        <group position={a}>
          {showForce && F > 1 && (
            <>
              <Line
                points={box}
                segments
                color="#94a3b8"
                lineWidth={1.2}
                dashed
                dashSize={0.1}
                gapSize={0.08}
              />
              <Arrow vec={[fx, 0, 0]} color={COLORS.x} radius={0.04} head={0.22} headRadius={0.08} />
              <Arrow vec={[0, fy, 0]} color={COLORS.y} radius={0.04} head={0.22} headRadius={0.08} />
              <Arrow vec={[0, 0, fz]} color={COLORS.z} radius={0.04} head={0.22} headRadius={0.08} />
            </>
          )}
          {F > 1 && (
            <>
              <Arrow vec={f} color={COLORS.f} radius={0.055} head={0.34} headRadius={0.14} />
              <Label position={[fx + 0.1, fy + 0.4, fz]} color={COLORS.f}>
                F
              </Label>
            </>
          )}
        </group>
      )}

      <Handle point={A} color="#22d3ee" name="A" mode={mode} onChange={onA} />
      <Handle point={B} color="#f472b6" name="B" mode={mode} onChange={onB} />
    </group>
  )
}

export default function Scene2({ view, labelRoot, ...props }) {
  return (
    <Canvas
      camera={{ position: view.pos, fov: 45 }}
      dpr={[1, 2]}
      onCreated={({ camera }) => camera.lookAt(...view.target)}
    >
      <color attach="background" args={['#0b1220']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 10, 8]} intensity={1.2} />
      <LabelRoot.Provider value={labelRoot}>
        <Axes />
        <TwoPointModel {...props} />
      </LabelRoot.Provider>
      <OrbitControls makeDefault enableDamping target={view.target} minDistance={4} maxDistance={40} />
      <ViewSetter view={view} />
    </Canvas>
  )
}
