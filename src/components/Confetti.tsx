"use client";

const COLORS = [
  "#f44336", "#e91e63", "#9c27b0", "#673ab7",
  "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4",
  "#009688", "#4caf50", "#8bc34a", "#cddc39",
  "#ffeb3b", "#ffc107", "#ff9800", "#ff5722",
];

const PARTICLE_COUNT = 40;

interface ConfettiProps {
  active: boolean;
}

interface Particle {
  id: number;
  left: number;
  color: string;
  delay: number;
  size: number;
  duration: number;
}

/**
 * Simple seeded pseudo-random number generator (mulberry32).
 * Produces deterministic values so confetti layout is stable across renders.
 */
function createSeededRandom(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let v = t;
    v = Math.imul(v ^ (v >>> 15), v | 1);
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pre-computed particle data generated once at module load */
const PARTICLES: Particle[] = (() => {
  const rand = createSeededRandom(42);
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: rand() * 100,
    color: COLORS[Math.floor(rand() * COLORS.length)],
    delay: rand() * 1.5,
    size: 6 + rand() * 8,
    duration: 1.5 + rand() * 1.5,
  }));
})();

export default function Confetti({ active }: ConfettiProps) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: 0,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.size > 10 ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
