interface PieceSVGProps {
  fill: string;
  stroke: string;
  size: number;
}

export function PawnSVG({ fill, stroke, size }: PieceSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      {/* Round head */}
      <circle cx="22.5" cy="12" r="6" fill={fill} stroke={stroke} strokeWidth="2" />
      {/* Neck */}
      <rect x="19" y="17" width="7" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Body - tapered cone */}
      <path
        d="M 15 38 L 19 21 L 26 21 L 30 38 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Base */}
      <rect x="12" y="36" width="21" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

export function RookSVG({ fill, stroke, size }: PieceSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      {/* Battlements */}
      <path
        d="M 10 12 L 10 7 L 15 7 L 15 10 L 19 10 L 19 7 L 26 7 L 26 10 L 30 10 L 30 7 L 35 7 L 35 12 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Tower body */}
      <rect x="12" y="12" width="21" height="22" rx="1" fill={fill} stroke={stroke} strokeWidth="2" />
      {/* Middle band */}
      <rect x="11" y="20" width="23" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Base */}
      <rect x="9" y="34" width="27" height="5" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

export function KnightSVG({ fill, stroke, size }: PieceSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      {/* Horse head and neck profile */}
      <path
        d="M 14 38 L 14 28 C 14 24 16 20 18 17 L 15 14 C 14 13 15 11 17 12 L 20 14 C 22 11 24 8 28 7 C 32 6 35 9 35 13 L 35 16 C 35 20 33 22 31 24 L 31 38 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Eye */}
      <circle cx="29" cy="13" r="1.5" fill={stroke} />
      {/* Nostril */}
      <circle cx="22" cy="13" r="1" fill={stroke} />
      {/* Base */}
      <rect x="11" y="36" width="23" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

export function BishopSVG({ fill, stroke, size }: PieceSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      {/* Pointed top / miter */}
      <path
        d="M 22.5 6 L 19 14 L 26 14 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Head bulb */}
      <ellipse cx="22.5" cy="17" rx="6" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
      {/* Slit */}
      <line x1="22.5" y1="12" x2="22.5" y2="20" stroke={stroke} strokeWidth="1.5" />
      {/* Body */}
      <path
        d="M 15 38 L 17 22 L 28 22 L 30 38 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Collar */}
      <ellipse cx="22.5" cy="22" rx="6.5" ry="2.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Base */}
      <rect x="12" y="36" width="21" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

export function QueenSVG({ fill, stroke, size }: PieceSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      {/* Crown points */}
      <path
        d="M 9 18 L 14 8 L 18 16 L 22.5 6 L 27 16 L 31 8 L 36 18 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Crown jewels (circles on tips) */}
      <circle cx="14" cy="8" r="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <circle cx="22.5" cy="6" r="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <circle cx="31" cy="8" r="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Body */}
      <path
        d="M 9 18 C 9 24 12 30 14 34 L 31 34 C 33 30 36 24 36 18"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Middle band */}
      <ellipse cx="22.5" cy="26" rx="10" ry="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Base */}
      <rect x="11" y="34" width="23" height="5" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

export function KingSVG({ fill, stroke, size }: PieceSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      {/* Cross on top */}
      <rect x="20.5" y="4" width="4" height="12" rx="1" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <rect x="17" y="6.5" width="11" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Head / crown base */}
      <path
        d="M 12 20 C 12 16 17 13 22.5 13 C 28 13 33 16 33 20 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Body */}
      <path
        d="M 12 20 C 12 28 14 34 16 36 L 29 36 C 31 34 33 28 33 20"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Middle band */}
      <ellipse cx="22.5" cy="27" rx="9.5" ry="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Base */}
      <rect x="12" y="35" width="21" height="5" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
    </svg>
  );
}
