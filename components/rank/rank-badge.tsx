// SVG presidential seal badge that evolves across 8 rank levels.
// All geometry is in a 100×100 viewBox. IDs are scoped by level to avoid
// conflicts when multiple badge sizes render on the same page.

type Props = {
  level: number;
  size?: number;
  className?: string;
};

const GOLD   = '#C9A84C';
const GOLD_L = '#F0D060';
const GOLD_D = '#8B6010';
const NAVY   = '#0A1628';
const NAVY_2 = '#0D1E35';

// Degrees → SVG coordinate on a circle centered at (50,50)
function pt(angleDeg: number, radius: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180); // -90 so 0° = top
  return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) };
}

// Generate evenly-spaced star positions in an arc or full ring
function starPositions(count: number, startDeg: number, endDeg: number, radius: number) {
  if (count <= 0) return [];
  const full = Math.abs(endDeg - startDeg) >= 359;
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const deg = full
      ? startDeg + (360 / count) * i
      : startDeg + t * (endDeg - startDeg);
    return pt(deg, radius);
  });
}

// Laurel leaf helper: draws a simple leaf ellipse along a branch
function LaurelLeaf({ cx, cy, angle, color }: { cx: number; cy: number; angle: number; color: string }) {
  return (
    <ellipse
      cx={cx} cy={cy}
      rx={3.5} ry={2}
      fill={color}
      transform={`rotate(${angle} ${cx} ${cy})`}
      opacity="0.8"
    />
  );
}

export default function RankBadge({ level, size = 80, className }: Props) {
  const id = `rb${level}`;

  const eagleFill     = level >= 5 ? GOLD   : level >= 4 ? GOLD + 'AA' : 'none';
  const eagleStroke   = level >= 5 ? 'none' : GOLD;
  const eagleOpacity  = level >= 3 ? 1 : level >= 2 ? 0.55 : 0.25;
  const strokeWidth   = level >= 4 ? 0 : level >= 3 ? 1.2 : 1;

  const borderWeight  = level >= 5 ? 2.5 : level >= 3 ? 2 : 1.5;
  const hasInnerRing  = level >= 3;
  const hasDoubleRing = level >= 5;
  const hasShield     = level >= 4;
  const hasLaurel     = level >= 6;
  const hasShimmer    = level >= 7;
  const hasPulse      = level === 8;

  // Stars
  const stars =
    level <= 1 ? [] :
    level === 2 ? starPositions(2,  -55,  55, 38) :
    level <= 5  ? starPositions(5, -70,   70, 38) :
                  starPositions(13,  0,  360, 38);  // full ring

  const starSize   = 6;
  const starColor  = level >= 6 ? GOLD_L : GOLD;
  const starOpacity = level >= 6 ? 0.9 : 0.65;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={hasPulse ? { animation: 'badge-pulse 2.5s ease-in-out infinite' } : undefined}
    >
      {/* ── animation keyframes ── */}
      {(hasShimmer || hasPulse) && (
        <style>{`
          @keyframes badge-pulse {
            0%,100% { filter: drop-shadow(0 0 3px rgba(201,168,76,0.45)); }
            50%      { filter: drop-shadow(0 0 12px rgba(201,168,76,0.95)) drop-shadow(0 0 24px rgba(201,168,76,0.5)); }
          }
          @keyframes shimmer-pass-${id} {
            0%   { transform: translateX(-120px); }
            100% { transform: translateX(240px); }
          }
        `}</style>
      )}

      <defs>
        {/* Background gradient */}
        <radialGradient id={`${id}-bg`} cx="40%" cy="35%" r="65%">
          <stop offset="0%"   stopColor={level >= 6 ? '#0F1E30' : NAVY_2} />
          <stop offset="100%" stopColor={NAVY} />
        </radialGradient>

        {/* Gold gradient for borders & fills */}
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={GOLD_L} />
          <stop offset="50%"  stopColor={GOLD}   />
          <stop offset="100%" stopColor={GOLD_D} />
        </linearGradient>

        {/* Shimmer overlay clip */}
        {hasShimmer && (
          <>
            <clipPath id={`${id}-clip`}>
              <circle cx="50" cy="50" r="47" />
            </clipPath>
            <linearGradient id={`${id}-shimmer`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="white" stopOpacity="0" />
              <stop offset="45%"  stopColor="white" stopOpacity="0.18" />
              <stop offset="55%"  stopColor="white" stopOpacity="0.22" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </>
        )}
      </defs>

      {/* ── background circle ── */}
      <circle cx="50" cy="50" r="49" fill={`url(#${id}-bg)`} />

      {/* ── outer border ── */}
      <circle
        cx="50" cy="50" r="47"
        fill="none"
        stroke={`url(#${id}-gold)`}
        strokeWidth={borderWeight}
      />

      {/* ── double border ring ── */}
      {hasDoubleRing && (
        <circle
          cx="50" cy="50" r="43"
          fill="none"
          stroke={GOLD}
          strokeWidth="0.8"
          opacity="0.5"
        />
      )}

      {/* ── inner decorative ring (level 3+) ── */}
      {hasInnerRing && (
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke={GOLD}
          strokeWidth="0.5"
          opacity={level >= 5 ? 0.4 : 0.25}
        />
      )}

      {/* ── stars ── */}
      {stars.map((s, i) => (
        <text
          key={i}
          x={s.x}
          y={s.y}
          fontSize={starSize}
          textAnchor="middle"
          dominantBaseline="central"
          fill={starColor}
          opacity={starOpacity}
        >
          ★
        </text>
      ))}

      {/* ── eagle ── */}
      <g opacity={eagleOpacity}>
        {/* Left wing */}
        <path
          d="M50,52 C42,47 27,41 11,37 L13,44 C25,48 37,50 50,60 Z"
          fill={eagleFill}
          stroke={eagleStroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Right wing */}
        <path
          d="M50,52 C58,47 73,41 89,37 L87,44 C75,48 63,50 50,60 Z"
          fill={eagleFill}
          stroke={eagleStroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Body */}
        <ellipse
          cx="50" cy="63" rx="6" ry="9"
          fill={eagleFill}
          stroke={eagleStroke}
          strokeWidth={strokeWidth}
        />
        {/* Head */}
        <circle
          cx="57" cy="43" r="5.5"
          fill={eagleFill}
          stroke={eagleStroke}
          strokeWidth={strokeWidth}
        />
        {/* Beak */}
        <polygon
          points="62,42 68,45 62,48"
          fill={level >= 4 ? GOLD_D : eagleFill}
          stroke={level >= 4 ? 'none' : eagleStroke}
          strokeWidth={strokeWidth * 0.6}
        />
        {/* Tail */}
        <path
          d="M46,71 L50,77 L54,71"
          fill={eagleFill}
          stroke={eagleStroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Shield on chest (level 4+) */}
        {hasShield && (
          <path
            d="M50,57 L55,58 L55,66 Q55,71 50,73 Q45,71 45,66 L45,58 Z"
            fill={NAVY}
            stroke={GOLD}
            strokeWidth="0.8"
            opacity="0.9"
          />
        )}
      </g>

      {/* ── gold laurel (level 6+) ── */}
      {hasLaurel && (
        <g opacity="0.85">
          {/* Left branch */}
          <path
            d="M28,82 Q31,77 35,75 Q39,73 41,70"
            fill="none"
            stroke={GOLD}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <LaurelLeaf cx={29} cy={80} angle={-30} color={GOLD} />
          <LaurelLeaf cx={32} cy={76} angle={-50} color={GOLD} />
          <LaurelLeaf cx={37} cy={73} angle={-65} color={GOLD} />

          {/* Right branch (mirrored) */}
          <path
            d="M72,82 Q69,77 65,75 Q61,73 59,70"
            fill="none"
            stroke={GOLD}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <LaurelLeaf cx={71} cy={80} angle={30} color={GOLD} />
          <LaurelLeaf cx={68} cy={76} angle={50} color={GOLD} />
          <LaurelLeaf cx={63} cy={73} angle={65} color={GOLD} />

          {/* Center knot */}
          <circle cx="50" cy="83" r="2.5" fill={GOLD} />
        </g>
      )}

      {/* ── E Pluribus Unum scroll (level 7+) ── */}
      {level >= 7 && (
        <text
          x="50" y="90"
          fontSize="4.5"
          textAnchor="middle"
          fill={GOLD}
          opacity="0.55"
          fontFamily="Georgia, serif"
          letterSpacing="0.5"
        >
          E PLURIBUS UNUM
        </text>
      )}

      {/* ── outer dot ring (level 7+) ── */}
      {level >= 7 &&
        Array.from({ length: 20 }, (_, i) => {
          const p = pt((i * 360) / 20, 46);
          return (
            <circle key={i} cx={p.x} cy={p.y} r="1.2" fill={GOLD_L} opacity="0.4" />
          );
        })}

      {/* ── shimmer overlay (level 7+) ── */}
      {hasShimmer && (
        <g clipPath={`url(#${id}-clip)`}>
          <rect
            x="-150" y="0"
            width="150" height="100"
            fill={`url(#${id}-shimmer)`}
            style={{ animation: `shimmer-pass-${id} 3s linear infinite` }}
          />
        </g>
      )}

      {/* Level indicator dot at base */}
      <text
        x="50" y="96"
        fontSize="5"
        textAnchor="middle"
        fill={GOLD}
        opacity={level >= 7 ? 0 : 0.4}
        fontFamily="monospace"
      >
        {Array(level).fill('·').join('')}
      </text>
    </svg>
  );
}
