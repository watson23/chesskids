"use client";

type Expression = "happy" | "thinking" | "celebrating";

interface PikkuProps {
  expression?: Expression;
  size?: number;
}

/* ─── Sub-components for expression-dependent parts ─── */

function Eyes({ expression }: { expression: Expression }) {
  if (expression === "celebrating") {
    /* Happy squint — curved arcs */
    return (
      <>
        <path d="M 15.5,11.5 Q 18.5,8.5 21.5,11.5" fill="none" stroke="#1e1e3a" strokeWidth="2" strokeLinecap="round" />
        <path d="M 23.5,11.5 Q 26.5,8.5 29.5,11.5" fill="none" stroke="#1e1e3a" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }

  /* Normal round eyes with shine */
  return (
    <>
      {/* Eye whites */}
      <ellipse cx="18.5" cy="11.5" rx="3" ry="3.3" fill="white" />
      <ellipse cx="26.5" cy="11.5" rx="3" ry="3.3" fill="white" />
      {/* Pupils */}
      <circle cx="19.2" cy="11.5" r="2" fill="#1e1e3a" />
      <circle cx="27.2" cy="11.5" r="2" fill="#1e1e3a" />
      {/* Shine dots */}
      <circle cx="20" cy="10.4" r="0.9" fill="white" />
      <circle cx="28" cy="10.4" r="0.9" fill="white" />
    </>
  );
}

function Mouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case "happy":
      return (
        <path
          d="M 19.5,19 Q 22.5,22.5 25.5,19"
          fill="none" stroke="#1e1e3a" strokeWidth="1.2" strokeLinecap="round"
        />
      );
    case "thinking":
      return (
        <ellipse cx="22.5" cy="19.5" rx="1.5" ry="1.3" fill="#1e1e3a" opacity="0.2" />
      );
    case "celebrating":
      return (
        <path
          d="M 19,18.5 Q 22.5,23.5 26,18.5"
          fill="#FF6B6B" opacity="0.35" stroke="#1e1e3a" strokeWidth="0.8" strokeLinecap="round"
        />
      );
  }
}

function Wings({ expression }: { expression: Expression }) {
  if (expression === "celebrating") {
    /* Raised flippers — party mode! */
    return (
      <>
        <path d="M 13.5,24 Q 6,17 5,21 Q 4.5,23 7.5,24 Q 9.5,24.5 13,24.5 Z" fill="#1e1e3a" />
        <path d="M 31.5,24 Q 39,17 40,21 Q 40.5,23 37.5,24 Q 35.5,24.5 32,24.5 Z" fill="#1e1e3a" />
      </>
    );
  }

  /* Resting flippers */
  return (
    <>
      <path d="M 13.5,26 Q 8,29 9,33.5 Q 9.5,35 11,34 Q 10.5,30.5 13,27 Z" fill="#1e1e3a" />
      <path d="M 31.5,26 Q 37,29 36,33.5 Q 35.5,35 34,34 Q 34.5,30.5 32,27 Z" fill="#1e1e3a" />
    </>
  );
}

function CelebrateStars() {
  return (
    <g className="animate-float">
      <g transform="translate(9, 2)">
        <path d="M 0,-3 L 0.9,-0.9 L 3,0 L 0.9,0.9 L 0,3 L -0.9,0.9 L -3,0 L -0.9,-0.9 Z" fill="#FCD34D" />
      </g>
      <g transform="translate(37, 4)">
        <path d="M 0,-2.5 L 0.7,-0.7 L 2.5,0 L 0.7,0.7 L 0,2.5 L -0.7,0.7 L -2.5,0 L -0.7,-0.7 Z" fill="#FDE68A" />
      </g>
      <g transform="translate(5, 15)">
        <path d="M 0,-2 L 0.6,-0.6 L 2,0 L 0.6,0.6 L 0,2 L -0.6,0.6 L -2,0 L -0.6,-0.6 Z" fill="#FDA4AF" />
      </g>
    </g>
  );
}

/* ─── Main component ─── */

export default function Pikku({ expression = "happy", size = 80 }: PikkuProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" style={{ overflow: "visible" }}>
      {/* Celebrating stars (behind penguin) */}
      {expression === "celebrating" && <CelebrateStars />}

      {/* ── Pawn base / pedestal ── */}
      <ellipse cx="22.5" cy="38.5" rx="14" ry="3" fill="#1e1e3a" />
      <rect x="9" y="35.5" width="27" height="3.5" rx="1.5" fill="#1e1e3a" />

      {/* ── Body (pawn bell shape — narrow at collar, wide at base) ── */}
      <path
        d="M 16.5,21 C 16,25.5 13,30.5 10,35.5 L 35,35.5 C 32,30.5 29,25.5 28.5,21 Z"
        fill="#1e1e3a"
      />

      {/* White belly */}
      <path
        d="M 18.5,22 C 18,26 15.5,30.5 13.5,35 L 31.5,35 C 29.5,30.5 27,26 26.5,22 Z"
        fill="white"
      />

      {/* Faint chess-board texture on belly */}
      <g opacity="0.04">
        <rect x="18" y="27" width="3" height="3" fill="#1e1e3a" />
        <rect x="24" y="27" width="3" height="3" fill="#1e1e3a" />
        <rect x="21" y="30" width="3" height="3" fill="#1e1e3a" />
      </g>

      {/* ── Collar ring (where head meets body — classic pawn shape) ── */}
      <ellipse cx="22.5" cy="21.2" rx="6.5" ry="2.2" fill="#2a2a4a" />
      <ellipse cx="22.5" cy="20.8" rx="6" ry="1.8" fill="#1e1e3a" />

      {/* ── Wings (behind head at body level) ── */}
      <Wings expression={expression} />

      {/* ── Head (the pawn's ball) ── */}
      <circle cx="22.5" cy="12" r="10" fill="#1e1e3a" />

      {/* White face patch */}
      <ellipse cx="22.5" cy="14" rx="7.5" ry="6.5" fill="white" />

      {/* ── Eyes ── */}
      <Eyes expression={expression} />

      {/* ── Beak ── */}
      <ellipse cx="22.5" cy="17" rx="2.2" ry="1.3" fill="#FF8C42" />
      <ellipse cx="22.5" cy="16.7" rx="1.8" ry="0.9" fill="#FFA562" />

      {/* ── Blush ── */}
      <ellipse cx="15" cy="15.5" rx="2.2" ry="1.1" fill="#FFB4B4" opacity="0.45" />
      <ellipse cx="30" cy="15.5" rx="2.2" ry="1.1" fill="#FFB4B4" opacity="0.45" />

      {/* ── Mouth ── */}
      <Mouth expression={expression} />

      {/* ── Feet (peeking below base) ── */}
      <ellipse cx="17.5" cy="41" rx="4.5" ry="1.6" fill="#FF8C42" />
      <ellipse cx="27.5" cy="41" rx="4.5" ry="1.6" fill="#FF8C42" />
    </svg>
  );
}
