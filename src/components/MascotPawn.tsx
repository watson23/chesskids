"use client";

type Expression = "happy" | "thinking" | "celebrating";

interface MascotPawnProps {
  expression?: Expression;
  size?: number;
}

/** Mouth path per expression */
function MouthPath({ expression }: { expression: Expression }) {
  switch (expression) {
    case "happy":
      return <path d="M 19,20 Q 22.5,24 26,20" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" />;
    case "thinking":
      return <circle cx="24" cy="20.5" r="2" fill="white" opacity="0.85" />;
    case "celebrating":
      return (
        <path d="M 18,19.5 Q 22.5,26 27,19.5" fill="white" opacity="0.9" stroke="white" strokeWidth="0.5" />
      );
  }
}

/** Tiny stars orbiting the head for celebrating expression */
function CelebrateStars() {
  return (
    <g className="animate-float">
      <g transform="translate(11, 5)">
        <path d="M 0,-3 L 0.9,-0.9 L 3,0 L 0.9,0.9 L 0,3 L -0.9,0.9 L -3,0 L -0.9,-0.9 Z" fill="#FCD34D" />
      </g>
      <g transform="translate(34, 7)">
        <path d="M 0,-2.5 L 0.7,-0.7 L 2.5,0 L 0.7,0.7 L 0,2.5 L -0.7,0.7 L -2.5,0 L -0.7,-0.7 Z" fill="#FDE68A" />
      </g>
      <g transform="translate(8, 12)">
        <path d="M 0,-2 L 0.6,-0.6 L 2,0 L 0.6,0.6 L 0,2 L -0.6,0.6 L -2,0 L -0.6,-0.6 Z" fill="#FDA4AF" />
      </g>
    </g>
  );
}

export default function MascotPawn({ expression = "happy", size = 80 }: MascotPawnProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" style={{ overflow: "visible" }}>
      {/* Celebrating stars behind the pawn */}
      {expression === "celebrating" && <CelebrateStars />}

      {/* Pawn body — using CK purple */}
      <g fill="var(--ck-purple)" stroke="var(--ck-purple-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 22.5,9 C 19.79,9 17.609,11.18 17.609,13.891 C 17.609,15.16 18.129,16.305 18.969,17.141 C 16.23,18.477 14.141,21.211 14.141,24.5 C 14.141,27.09 15.52,29.32 17.559,30.66 C 15.09,32.48 10.5,34.5 10.5,39.5 L 34.5,39.5 C 34.5,34.5 29.91,32.48 27.441,30.66 C 29.48,29.32 30.859,27.09 30.859,24.5 C 30.859,21.211 28.77,18.477 26.031,17.141 C 26.871,16.305 27.391,15.16 27.391,13.891 C 27.391,11.18 25.211,9 22.5,9 Z" />
      </g>

      {/* Eyes — large friendly dots */}
      <circle cx="19.5" cy="14" r="1.8" fill="white" />
      <circle cx="25.5" cy="14" r="1.8" fill="white" />

      {/* Pupils — small dark dots */}
      <circle cx="19.5" cy="14" r="0.8" fill="#3D3360" />
      <circle cx="25.5" cy="14" r="0.8" fill="#3D3360" />

      {/* Eye shine */}
      <circle cx="20.2" cy="13.3" r="0.5" fill="white" opacity="0.9" />
      <circle cx="26.2" cy="13.3" r="0.5" fill="white" opacity="0.9" />

      {/* Blush circles */}
      <circle cx="17" cy="16.5" r="2" fill="#FDA4AF" opacity="0.4" />
      <circle cx="28" cy="16.5" r="2" fill="#FDA4AF" opacity="0.4" />

      {/* Mouth */}
      <MouthPath expression={expression} />
    </svg>
  );
}
