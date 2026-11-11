# Statics 3D

Interactive 3D models for university statics, built around the course handout
(Basic Mechanics, Unit 2: Forces and Moments).

## Module 1: A force in 3D space

- Rotatable 3D scene (drag, scroll or pinch) with x, y, z axes
- Sliders for magnitude F, angle from the y-axis (θy) and horizontal angle from x (φ)
- Live components Fh, Fx, Fy, Fz, direction cosines, angles and unit vector
- Front / Top / Side buttons show the 2D drawings you would sketch on paper
- One-click preset for handout Example 2.4 (guy wire, 2500 N) and a practice check

Convention follows the handout: y vertical, x right, z toward the viewer.

    Fh = F sin θy        Fy = F cos θy
    Fx = F sin θy cos φ  Fz = F sin θy sin φ

## Run it

    npm install
    npm run dev

Open the address Vite prints (usually http://localhost:5173).

## Files

- `src/physics.js`: the maths, no React
- `src/Scene.jsx`: the 3D scene (React Three Fiber)
- `src/App.jsx`: controls, readout and practice card
