export const fmt = (n, d = 1) => (Math.abs(n) < 0.05 && d === 1 ? 0 : n).toFixed(d)
