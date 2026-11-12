import { useContext, useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { componentsFromAngles } from './physics'

import { COLORS } from './colors'
import { LabelRoot } from './labelroot'

// Scene units per newton. 2500 N (handout Example 2.4) is 4 units long.
const SCALE = 0.0016
const AXIS_LEN = 4.5

export function Label({ position, color, plain, children }) {
  const portal = useContext(LabelRoot)
  return (
    <Html position={position} center portal={portal ?? undefined} style={{ pointerEvents: 'none' }}>
      <div className={plain ? 'tag plain' : 'tag'} style={{ color }}>
        {children}
      </div>
    </Html>
  )
}

// Arrow drawn from the origin along `vec` (scene units).
export function Arrow({ vec, color, radius = 0.035, head = 0.3, headRadius = 0.1 }) {
  const [vx, vy, vz] = vec
  const { quat, len } = useMemo(() => {
    const v = new THREE.Vector3(vx, vy, vz)
    const len = v.length()
    const quat = new THREE.Quaternion()
    if (len > 1e-6) {
      quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize())
    }
    return { quat, len }
  }, [vx, vy, vz])

  if (len < 0.02) return null
  const headLen = Math.min(head, len * 0.5)
  const shaft = len - headLen
  return (
    <group quaternion={quat}>
      <mesh position={[0, shaft / 2, 0]}>
        <cylinderGeometry args={[radius, radius, shaft, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, shaft + headLen / 2, 0]}>
        <coneGeometry args={[headRadius * (headLen / head), headLen, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

export function Axes() {
  const axes = [
    { key: 'x', dir: [1, 0, 0], color: COLORS.x },
    { key: 'y', dir: [0, 1, 0], color: COLORS.y },
    { key: 'z', dir: [0, 0, 1], color: COLORS.z },
  ]
  return (
    <group>
      {axes.map(({ key, dir, color }) => (
        <group key={key}>
          <Arrow
            vec={dir.map((d) => d * AXIS_LEN)}
            color={color}
            radius={0.018}
            head={0.22}
            headRadius={0.07}
          />
          <Line
            points={[
              [0, 0, 0],
              dir.map((d) => -d * AXIS_LEN),
            ]}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.3}
          />
          <Label position={dir.map((d) => d * (AXIS_LEN + 0.4))} color={color}>
            {key}
          </Label>
        </group>
      ))}
      <gridHelper args={[10, 10, '#2a3a52', '#1a2638']} />
      <mesh>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <Label position={[-0.25, -0.25, 0.1]} color="#cbd5e1" plain>
        O
      </Label>
    </group>
  )
}

function arcPoints(fn, endAngleDeg) {
  const n = Math.max(8, Math.ceil(Math.abs(endAngleDeg) / 4))
  const pts = []
  for (let i = 0; i <= n; i++) {
    pts.push(fn((((endAngleDeg * i) / n) * Math.PI) / 180))
  }
  return pts
}

function Angles({ thetaY, phi, hasH }) {
  const p = (phi * Math.PI) / 180
  const hDir = [Math.cos(p), 0, Math.sin(p)]

  const phiR = 1.1
  const phiArc = arcPoints((a) => [phiR * Math.cos(a), 0.01, phiR * Math.sin(a)], phi)
  const phiMid = ((phi / 2) * Math.PI) / 180

  const tyR = 1.5
  const tyArc = arcPoints(
    (a) => [
      tyR * Math.sin(a) * hDir[0],
      tyR * Math.cos(a),
      tyR * Math.sin(a) * hDir[2],
    ],
    thetaY,
  )
  const tyMid = ((thetaY / 2) * Math.PI) / 180

  return (
    <group>
      {hasH && phi > 0.5 && (
        <>
          <Line points={phiArc} color={COLORS.h} lineWidth={2} />
          <Label
            position={[
              (phiR + 0.35) * Math.cos(phiMid),
              0.05,
              (phiR + 0.35) * Math.sin(phiMid),
            ]}
            color={COLORS.h}
          >
            φ
          </Label>
        </>
      )}
      {thetaY > 0.5 && (
        <>
          <Line points={tyArc} color={COLORS.f} lineWidth={2} />
          <Label
            position={[
              (tyR + 0.3) * Math.sin(tyMid) * hDir[0],
              (tyR + 0.3) * Math.cos(tyMid),
              (tyR + 0.3) * Math.sin(tyMid) * hDir[2],
            ]}
            color={COLORS.f}
          >
            θy
          </Label>
        </>
      )}
    </group>
  )
}

function ForceModel({ F, thetaY, phi, showBox, showH, showAngles }) {
  const c = componentsFromAngles(F, thetaY, phi)
  const x = c.x * SCALE
  const y = c.y * SCALE
  const z = c.z * SCALE

  const boxSegments = useMemo(() => {
    const e = (a, b) => [a, b]
    return [
      e([x, 0, 0], [x, y, 0]),
      e([x, 0, 0], [x, 0, z]),
      e([0, y, 0], [x, y, 0]),
      e([0, y, 0], [0, y, z]),
      e([0, 0, z], [x, 0, z]),
      e([0, 0, z], [0, y, z]),
      e([x, y, 0], [x, y, z]),
      e([x, 0, z], [x, y, z]),
      e([0, y, z], [x, y, z]),
    ].flat()
  }, [x, y, z])

  const hasH = c.h * SCALE > 0.02

  return (
    <group>
      {showBox && F > 1 && (
        <Line
          points={boxSegments}
          segments
          color="#94a3b8"
          lineWidth={1.2}
          dashed
          dashSize={0.12}
          gapSize={0.09}
        />
      )}
      {showH && hasH && (
        <>
          <Arrow vec={[x, 0, z]} color={COLORS.h} radius={0.025} head={0.24} headRadius={0.08} />
          <Label position={[x * 0.5, -0.25, z * 0.5]} color={COLORS.h}>
            Fh
          </Label>
        </>
      )}
      <Arrow vec={[x, 0, 0]} color={COLORS.x} radius={0.05} />
      <Arrow vec={[0, y, 0]} color={COLORS.y} radius={0.05} />
      <Arrow vec={[0, 0, z]} color={COLORS.z} radius={0.05} />
      {Math.abs(x) > 0.1 && (
        <Label position={[x * 0.5, -0.25, 0.25]} color={COLORS.x}>
          Fx
        </Label>
      )}
      {Math.abs(y) > 0.1 && (
        <Label position={[0.35, y * 0.78, 0.3]} color={COLORS.y}>
          Fy
        </Label>
      )}
      {Math.abs(z) > 0.1 && (
        <Label position={[0.3, 0.3, z * 0.5]} color={COLORS.z}>
          Fz
        </Label>
      )}
      <Arrow vec={[x, y, z]} color={COLORS.f} radius={0.06} head={0.38} headRadius={0.15} />
      {F > 1 && (
        <Label position={[x * 1.0 + 0.1, y * 1.0 + 0.45, z * 1.0]} color={COLORS.f}>
          F
        </Label>
      )}
      {showAngles && <Angles thetaY={thetaY} phi={phi} hasH={hasH} />}
    </group>
  )
}

// How far to back the camera off so a tall, narrow screen still shows the whole model.
const backOff = (size) => Math.max(1, 0.75 / (size.width / size.height))

// Moves the camera when the `view` prop changes (Front / Top / Side / 3D buttons), and keeps
// the model in frame when the screen shape changes (rotating a phone, going full screen).
export function ViewSetter({ view }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const get = useThree((s) => s.get)
  const aspect = useThree((s) => s.size.width / s.size.height)
  const applied = useRef(1)

  useEffect(() => {
    const f = backOff(get().size)
    const t = new THREE.Vector3(...view.target)
    camera.position.set(...view.pos).sub(t).multiplyScalar(f).add(t)
    camera.lookAt(t)
    if (controls) {
      controls.target.copy(t)
      controls.update()
    }
    applied.current = f
  }, [view, camera, controls, get])

  useEffect(() => {
    const c = get().controls
    if (!c) return
    const ratio = backOff(get().size) / applied.current
    if (Math.abs(ratio - 1) < 1e-3) return
    camera.position.sub(c.target).multiplyScalar(ratio).add(c.target)
    applied.current *= ratio
    c.update()
  }, [aspect, camera, get])

  return null
}

export default function Scene({ view, labelRoot, ...force }) {
  return (
    <Canvas camera={{ position: view.pos, fov: 45 }} dpr={[1, 2]} onCreated={({ camera }) => camera.lookAt(...view.target)}>
      <color attach="background" args={['#0b1220']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 10, 8]} intensity={1.2} />
      <LabelRoot.Provider value={labelRoot}>
        <Axes />
        <ForceModel {...force} />
      </LabelRoot.Provider>
      <OrbitControls makeDefault enableDamping target={view.target} minDistance={4} maxDistance={40} />
      <ViewSetter view={view} />
    </Canvas>
  )
}
