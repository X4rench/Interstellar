
interface IconProps {
  size?: number;
  color?: string;
}

import LOGO_SRC from './logo.png'

const LOGO_ASPECT = 313 / 158

export function LogoImage({ size = 72, bg = 'transparent' }: { size?: number; bg?: string }) {
  return (
    <div
      style={{
        height: size,
        width: size * LOGO_ASPECT,
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={LOGO_SRC}
        alt="Interstellar"
        style={{ height: size, width: size * LOGO_ASPECT, objectFit: 'contain' }}
      />
    </div>
  )
}

export function LogoImageSmall({ size = 30 }: { size?: number }) {
  return <LogoImage size={size} />
}
// ── Brain (Freud) ──────────────────────────────────────────────────────────
export function BrainIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path
        d="M27 13 Q17 11 13 19 Q7 21 7 29 Q7 39 15 41 Q13 49 21 49 Q25 53 27 49"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M27 13 Q37 11 41 19 Q47 21 47 29 Q47 39 39 41 Q41 49 33 49 Q29 53 27 49"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M21 23 Q18 29 21 35" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M33 23 Q36 29 33 35" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M16 38 Q27 44 38 38" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

// ── Spiral (Naruto) ────────────────────────────────────────────────────────
export function SpiralIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path
        d="M27 27 Q27 23 31 23 Q35 23 35 27 Q35 33 29 33 Q21 33 21 25 Q21 15 29 13 Q39 11 43 21 Q47 33 39 41 Q29 49 19 45 Q9 39 9 27 Q9 13 21 8 Q31 4 39 10"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

// ── Sword (Arya) ───────────────────────────────────────────────────────────
export function SwordIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="5"  x2="27" y2="42" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <path d="M23 9 L27 5 L31 9"           stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="19" y1="38" x2="35" y2="38" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="27" y1="42" x2="27" y2="49" stroke={color} strokeWidth="3"   strokeLinecap="round" opacity="0.8" />
      <circle cx="27" cy="51" r="2.5"        stroke={color} strokeWidth="1.4" fill="none" />
    </svg>
  );
}

// ── Atom (Einstein) ────────────────────────────────────────────────────────
export function AtomIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="3.5" fill={color} />
      <ellipse cx="27" cy="27" rx="23" ry="7.5" stroke={color} strokeWidth="1.5" fill="none" />
      <ellipse cx="27" cy="27" rx="23" ry="7.5" stroke={color} strokeWidth="1.5" fill="none"
        transform="rotate(60 27 27)" />
      <ellipse cx="27" cy="27" rx="23" ry="7.5" stroke={color} strokeWidth="1.5" fill="none"
        transform="rotate(120 27 27)" />
    </svg>
  );
}

// ── Headphones (Miku) ──────────────────────────────────────────────────────
export function HeadphonesIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M9 27 Q9 11 27 11 Q45 11 45 27" stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <rect x="5"  y="25" width="10" height="14" rx="3.5" stroke={color} strokeWidth="1.6" fill="none" />
      <rect x="39" y="25" width="10" height="14" rx="3.5" stroke={color} strokeWidth="1.6" fill="none" />
    </svg>
  );
}

// ── Lightning (Eleven) ─────────────────────────────────────────────────────
export function LightningIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path
        d="M34 5 L17 28 L27 28 L20 49 L43 23 L31 23 Z"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  );
}

// ── Crown (Cleopatra) ──────────────────────────────────────────────────────
export function CrownIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path
        d="M9 36 L9 19 L18 27 L27 9 L36 27 L45 19 L45 36 Z"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinejoin="round" strokeLinecap="round"
      />
      <line x1="5"  y1="36" x2="49" y2="36" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <circle cx="15" cy="33.5" r="1.5" fill={color} opacity="0.7" />
      <circle cx="27" cy="33.5" r="1.5" fill={color} opacity="0.7" />
      <circle cx="39" cy="33.5" r="1.5" fill={color} opacity="0.7" />
    </svg>
  );
}

// ── Vinci (Da Vinci — Vitruvian man) ──────────────────────────────────────
export function VinciIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="21" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="13" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <line x1="27" y1="16" x2="27" y2="33" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="9"  y1="23" x2="45" y2="23" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="27" y1="33" x2="15" y2="46" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="27" y1="33" x2="39" y2="46" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Chisel (Michelangelo — hammer & chisel) ────────────────────────────────
export function ChiselIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="14" y1="40" x2="38" y2="16" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M38 16 L46 8 L48 16 L40 18 Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M10 44 L14 40 L20 44" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8"  y1="26" x2="13" y2="26" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <line x1="11" y1="22" x2="15" y2="18" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ── Quill (Shakespeare — feather pen) ─────────────────────────────────────
export function QuillIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M42 7 Q34 14 24 44" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M42 7 Q50 18 30 36" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M36 13 Q28 22 26 34" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.45" />
      <line x1="24" y1="44" x2="21" y2="50" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="48" x2="22" y2="48" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

// ── DNA (Darwin — double helix) ────────────────────────────────────────────
export function DnaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M18 7 Q14 17 18 27 Q22 37 18 47" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M36 7 Q40 17 36 27 Q32 37 36 47" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <line x1="18" y1="13" x2="36" y2="13" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <line x1="17" y1="21" x2="37" y2="21" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <line x1="18" y1="27" x2="36" y2="27" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <line x1="17" y1="33" x2="37" y2="33" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <line x1="18" y1="41" x2="36" y2="41" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

// ── Apple (Newton — falling apple) ────────────────────────────────────────
export function AppleIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 18 Q15 17 13 29 Q11 39 18 45 Q22 49 27 45 Q32 49 36 45 Q43 39 41 29 Q39 17 27 18 Z"
        stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="27" y1="10" x2="27" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 10 Q32 8 34 11" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M37 28 Q44 34 42 44" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round"
        strokeDasharray="2,3" opacity="0.55" />
    </svg>
  );
}

// ── Coil (Tesla — Tesla coil) ──────────────────────────────────────────────
export function CoilIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="44" rx="14" ry="4" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M13 44 Q13 38 27 36 Q41 34 41 28 Q41 22 27 22 Q13 22 13 32"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M27 22 L23 14 L28 14 L23 6"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="23" y1="6" x2="16" y2="4" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
      <line x1="23" y1="6" x2="19" y2="2" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

// ── Victory (Churchill — V sign) ───────────────────────────────────────────
export function VictoryIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M20 38 Q18 46 27 48 Q36 46 34 38" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M22 38 Q20 26 21 15 Q22 9 25 9 Q28 9 27 16 Q26 24 26 38"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M28 38 Q29 22 31 13 Q33 7 36 8 Q39 9 38 16 Q37 26 34 38"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── TopHat (Lincoln — stovepipe hat) ──────────────────────────────────────
export function TopHatIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="40" rx="19" ry="4.5" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="15" y="13" width="24" height="27" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="15" y1="35" x2="39" y2="35" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

// ── Dialogue (Socrates — question mark) ───────────────────────────────────
export function DialogueIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="21" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M21 22 Q21 15 27 15 Q33 15 33 21 Q33 26 27 28 L27 33"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="27" cy="38" r="1.8" fill={color} />
    </svg>
  );
}

// ── Scroll (Aristotle — papyrus scroll) ───────────────────────────────────
export function ScrollIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="10" y="16" width="34" height="22" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <ellipse cx="27" cy="16" rx="17" ry="4.5" stroke={color} strokeWidth="1.4" fill="none" />
      <ellipse cx="27" cy="38" rx="17" ry="4.5" stroke={color} strokeWidth="1.4" fill="none" />
      <line x1="17" y1="23" x2="37" y2="23" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <line x1="17" y1="27" x2="37" y2="27" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <line x1="17" y1="31" x2="29" y2="31" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// ── Cave (Plato — allegory of the cave) ───────────────────────────────────
export function CaveIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M7 47 Q7 12 27 9 Q47 12 47 47"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <line x1="27" y1="9" x2="16" y2="43" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
      <line x1="27" y1="9" x2="27" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <line x1="27" y1="9" x2="38" y2="43" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
      <circle cx="27" cy="40" r="4" stroke={color} strokeWidth="1.3" fill="none" opacity="0.8" />
    </svg>
  );
}

// ── YinYang (Confucius — harmony) ─────────────────────────────────────────
export function YinYangIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="21" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M27 6 Q37 6 37 17 Q37 27 27 27 Q17 27 17 38 Q17 48 27 48"
        stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="17" r="4"  stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="27" cy="38" r="4"  fill={color} opacity="0.85" />
    </svg>
  );
}

// ── Wheel (Columbus — ship's wheel) ───────────────────────────────────────
export function WheelIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="21" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="27" r="5"  stroke={color} strokeWidth="1.3" fill="none" />
      <line x1="27" y1="6"  x2="27" y2="22" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="27" y1="32" x2="27" y2="48" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="6"  y1="27" x2="22" y2="27" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="32" y1="27" x2="48" y2="27" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="12" y1="12" x2="23" y2="23" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="31" y1="31" x2="42" y2="42" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="42" y1="12" x2="31" y2="23" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="23" y1="31" x2="12" y2="42" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ── Treble (Mozart — treble clef) ─────────────────────────────────────────
export function TrebleIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="11" y1="21" x2="43" y2="21" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <line x1="11" y1="27" x2="43" y2="27" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <line x1="11" y1="33" x2="43" y2="33" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <line x1="11" y1="39" x2="43" y2="39" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <path d="M27 49 Q20 47 20 39 Q20 31 27 28 Q35 25 35 17 Q35 9 27 7 Q21 7 19 13 Q17 19 23 22 Q27 24 27 28"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 49 Q34 49 34 42 Q34 36 27 36"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── Piano (Beethoven — piano keys) ────────────────────────────────────────
export function PianoIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="5"  y="18" width="44" height="26" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="11" y1="18" x2="11" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <line x1="17" y1="18" x2="17" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <line x1="23" y1="18" x2="23" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <line x1="29" y1="18" x2="29" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <line x1="35" y1="18" x2="35" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <line x1="41" y1="18" x2="41" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <rect x="8"  y="18" width="6"  height="15" rx="1" fill={color} opacity="0.85" />
      <rect x="20" y="18" width="6"  height="15" rx="1" fill={color} opacity="0.85" />
      <rect x="32" y="18" width="6"  height="15" rx="1" fill={color} opacity="0.85" />
      <rect x="38" y="18" width="6"  height="15" rx="1" fill={color} opacity="0.85" />
    </svg>
  );
}

// ── Snowflake (Andersen — snow queen) ─────────────────────────────────────
export function SnowflakeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="5"  x2="27" y2="49" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5"  y1="27" x2="49" y2="27" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="11" x2="43" y2="43" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="43" y1="11" x2="11" y2="43" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="13" x2="27" y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="13" x2="27" y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="41" x2="27" y2="36" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="41" x2="27" y2="36" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="27" cy="27" r="3" fill={color} />
    </svg>
  );
}

// ── Raven (Poe — nevermore) ────────────────────────────────────────────────
export function RavenIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M28 22 Q18 22 15 31 Q12 40 18 45 Q24 49 30 45 Q38 41 38 32 Q38 22 28 22 Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <circle cx="36" cy="17" r="6"   stroke={color} strokeWidth="1.4" fill="none" />
      <circle cx="38" cy="15" r="1.2" fill={color} />
      <path d="M42 17 L48 19 L42 21" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 26 Q14 20 10 25 Q8 30 16 32" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M22 43 L19 50 M27 45 L27 51 M31 43 L33 50"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

// ── Mask (Wilde — theatre masks) ───────────────────────────────────────────
export function MaskIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M8 20 Q8 9 18 9 Q26 9 26 20 Q26 32 18 36 Q10 32 8 20 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M13 20 Q15 17 18 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M13 27 Q16 31 21 27" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M28 24 Q28 13 38 13 Q46 13 46 24 Q46 36 38 40 Q30 36 28 24 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M33 22 Q35 19 38 22" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M33 33 Q36 29 41 33" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <line x1="33" y1="24" x2="33" y2="29" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

// ── HammerPhil (Nietzsche — philosophical hammer) ─────────────────────────
export function HammerPhilIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="12" y1="42" x2="36" y2="18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M31 13 L39 5 L49 15 L41 23 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="8"  y1="22" x2="13" y2="26" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="6"  y1="30" x2="12" y2="30" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
      <line x1="10" y1="16" x2="14" y2="12" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

// ── Fist (Marx — raised fist) ─────────────────────────────────────────────
export function FistIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M16 48 Q12 48 12 44 L12 38 Q12 34 16 34 L38 34 Q42 34 42 38 L42 44 Q42 48 38 48 Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <rect x="16" y="18" width="26" height="16" rx="3.5" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M16 34 Q11 32 11 26 Q11 21 15 21 L16 21"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <line x1="22" y1="18" x2="22" y2="34" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.45" />
      <line x1="28" y1="18" x2="28" y2="34" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.45" />
      <line x1="34" y1="18" x2="34" y2="34" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ── Cosmos (Hawking — stars & orbit) ──────────────────────────────────────
export function CosmosIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="27" rx="22" ry="9"  stroke={color} strokeWidth="1.3" fill="none" />
      <ellipse cx="27" cy="27" rx="14" ry="5.5" stroke={color} strokeWidth="1"   fill="none" opacity="0.45" />
      <circle cx="27" cy="8"  r="2.5" fill={color} />
      <circle cx="10" cy="20" r="1.5" fill={color} opacity="0.75" />
      <circle cx="44" cy="18" r="1.2" fill={color} opacity="0.65" />
      <circle cx="8"  cy="35" r="1"   fill={color} opacity="0.55" />
      <circle cx="46" cy="36" r="1.5" fill={color} opacity="0.7" />
      <circle cx="27" cy="46" r="1.2" fill={color} opacity="0.6" />
      <circle cx="27" cy="27" r="4"   stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// ── Rocket (Musk — SpaceX) ─────────────────────────────────────────────────
export function RocketIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 7 Q36 10 38 24 L38 38 Q33 42 27 44 Q21 42 16 38 L16 24 Q18 10 27 7 Z"
        stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="24" r="5" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M16 30 L8 42 L16 38"  stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M38 30 L46 42 L38 38" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M22 44 Q24 50 27 52 Q30 50 32 44"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

// ── Chip (Jobs — microchip) ────────────────────────────────────────────────
export function ChipIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="15" y="15" width="24" height="24" rx="3" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="21" y="21" width="12" height="12" rx="1" stroke={color} strokeWidth="1"   fill="none" opacity="0.55" />
      <line x1="21" y1="15" x2="21" y2="9"  stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="27" y1="15" x2="27" y2="9"  stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="33" y1="15" x2="33" y2="9"  stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="21" y1="39" x2="21" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="27" y1="39" x2="27" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="33" y1="39" x2="33" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="15" y1="21" x2="9"  y2="21" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="15" y1="27" x2="9"  y2="27" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="15" y1="33" x2="9"  y2="33" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="39" y1="21" x2="45" y2="21" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="39" y1="27" x2="45" y2="27" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="39" y1="33" x2="45" y2="33" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ── WinGrid (Gates — four-pane window) ────────────────────────────────────
export function WinGridIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="7"  y="7"  width="17" height="17" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="30" y="7"  width="17" height="17" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="7"  y="30" width="17" height="17" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="30" y="30" width="17" height="17" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// ── StockChart (Buffett — rising chart) ───────────────────────────────────
export function StockChartIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="8"  y1="46" x2="8"  y2="8"  stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8"  y1="46" x2="48" y2="46" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <rect x="11" y="36" width="7" height="10" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.75" />
      <rect x="22" y="26" width="7" height="20" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.75" />
      <rect x="33" y="16" width="7" height="30" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.75" />
      <path d="M8 44 Q20 30 48 10"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="3,2" />
    </svg>
  );
}

// ── Kite (Franklin — kite with lightning bolt) ────────────────────────────
export function KiteIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 6 L42 22 L27 38 L12 22 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="27" y1="6"  x2="27" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.4" />
      <line x1="12" y1="22" x2="42" y2="22" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.4" />
      <line x1="27" y1="38" x2="27" y2="46" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <path d="M31 12 L26 20 L31 20 L26 32"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Bear (Roosevelt — bear paw) ────────────────────────────────────────────
export function BearIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="36" rx="13" ry="11" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="23" r="4"   stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="22" cy="19" r="4.5" stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="29" cy="18" r="4.5" stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="36" cy="20" r="4"   stroke={color} strokeWidth="1.3" fill="none" />
      <line x1="16" y1="19" x2="14" y2="14" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
      <line x1="22" y1="15" x2="21" y2="10" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
      <line x1="29" y1="14" x2="29" y2="9"  stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
      <line x1="36" y1="16" x2="38" y2="11" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

// ── Star5 (Mao — five-pointed star) ───────────────────────────────────────
export function Star5Icon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path
        d="M27 7 L31.5 20.5 L46 20.5 L34.5 29 L38.5 43 L27 35 L15.5 43 L19.5 29 L8 20.5 L22.5 20.5 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Charkha (Gandhi — spinning wheel) ─────────────────────────────────────
export function CharkhaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="27" r="3"  fill={color} />
      <line x1="27" y1="7"  x2="27" y2="24" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="37" y1="10" x2="30" y2="24" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="44" y1="17" x2="33" y2="26" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="47" y1="27" x2="30" y2="27" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="44" y1="37" x2="33" y2="29" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="37" y1="44" x2="30" y2="30" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="27" y1="47" x2="27" y2="30" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="17" y1="44" x2="24" y2="30" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="10" y1="37" x2="21" y2="29" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="7"  y1="27" x2="24" y2="27" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="10" y1="17" x2="21" y2="26" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <line x1="17" y1="10" x2="24" y2="24" stroke={color} strokeWidth="1"   strokeLinecap="round" />
    </svg>
  );
}

// ── Chains (Mandela — broken chains) ──────────────────────────────────────
export function ChainsIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="7"  y="20" width="16" height="14" rx="7" stroke={color} strokeWidth="1.4" fill="none" />
      <rect x="31" y="20" width="16" height="14" rx="7" stroke={color} strokeWidth="1.4" fill="none" />
      <line x1="24" y1="22" x2="28" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="24" y1="32" x2="28" y2="36" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="30" y1="22" x2="26" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="30" y1="32" x2="26" y2="36" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Dove (MLK — peace dove) ────────────────────────────────────────────────
export function DoveIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M20 30 Q18 22 24 18 Q32 14 38 20 Q44 26 38 32 Q30 38 20 34 Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <circle cx="38" cy="20" r="5"   stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="40" cy="19" r="1.2" fill={color} />
      <path d="M43 20 L49 21 L43 23"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 24 Q18 14 10 16 Q14 24 20 28"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M20 32 L12 36 M20 34 L14 40"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

// ── Laurel (Aurelius — laurel wreath) ─────────────────────────────────────
export function LaurelIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 40 Q15 36 10 20" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M27 40 Q39 36 44 20" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M12 30 Q8 24 14 22 Q16 28 12 30"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M16 21 Q12 15 18 13 Q20 19 16 21"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M22 14 Q20 8 27 8 Q26 14 22 14"   stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M42 30 Q46 24 40 22 Q38 28 42 30"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M38 21 Q42 15 36 13 Q34 19 38 21"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M32 14 Q34 8 27 8 Q28 14 32 14"   stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M22 42 Q27 46 32 42" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── Lantern (Diogenes — searching for honest man) ─────────────────────────
export function LanternIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M17 20 L17 40 Q17 44 21 44 L33 44 Q37 44 37 40 L37 20 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M14 20 Q14 16 27 16 Q40 16 40 20" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M22 16 Q22 10 27 10 Q32 10 32 16"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <line x1="22" y1="20" x2="22" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
      <line x1="32" y1="20" x2="32" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
      <path d="M27 38 Q24 34 27 30 Q30 34 27 38"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <line x1="9"  y1="30" x2="17" y2="30" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.35" />
      <line x1="37" y1="30" x2="45" y2="30" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

// ── Anchor (Peter I — fleet & sea) ────────────────────────────────────────
export function AnchorIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="9"  r="4"  stroke={color} strokeWidth="1.4" fill="none" />
      <line x1="27" y1="13" x2="27" y2="46" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="14" y1="18" x2="40" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 46 Q17 44 14 38 Q18 38 27 46"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M27 46 Q37 44 40 38 Q36 38 27 46"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M14 38 Q10 30 14 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M40 38 Q44 30 40 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ── Sceptre (Catherine II — orb & scepter) ────────────────────────────────
export function SceptreIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="16" x2="27" y2="50" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <circle cx="27" cy="28" r="8"  stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="19" y1="28" x2="35" y2="28" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.55" />
      <line x1="27" y1="6"  x2="27" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="21" y1="10" x2="33" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Axe (Ivan the Terrible — battle axe) ─────────────────────────────────
export function AxeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="38" y1="14" x2="18" y2="46" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <path d="M38 14 Q48 10 46 22 Q42 32 30 26 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M46 22 Q44 30 38 28" stroke={color} strokeWidth="1"   fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ── ShieldCross (Nevsky — knight's shield) ────────────────────────────────
export function ShieldCrossIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 7 L44 14 L44 30 Q44 42 27 50 Q10 42 10 30 L10 14 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="27" y1="17" x2="27" y2="43" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="18" y1="26" x2="36" y2="26" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// ── Sabers (Suvorov — crossed sabers) ─────────────────────────────────────
export function SabersIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="12" y1="8"  x2="44" y2="44" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <line x1="16" y1="18" x2="24" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="43" cy="43" r="2.5" stroke={color} strokeWidth="1.3" fill="none" />
      <line x1="42" y1="8"  x2="10" y2="44" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <line x1="38" y1="18" x2="30" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="43" r="2.5" stroke={color} strokeWidth="1.3" fill="none" />
    </svg>
  );
}

// ── Telescope (Kutuzov — military strategy) ───────────────────────────────
export function TelescopeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M8 36 L14 40 L44 14 L38 10 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <line x1="38" y1="10" x2="44" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="48" cy="8"  r="1.2" fill={color} opacity="0.65" />
      <circle cx="44" cy="5"  r="0.8" fill={color} opacity="0.45" />
      <line x1="12" y1="38" x2="8"  y2="48" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <line x1="12" y1="38" x2="16" y2="48" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <line x1="12" y1="38" x2="12" y2="48" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ── Romanov (Nicholas II — double-headed eagle) ───────────────────────────
export function RomanovIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="30" rx="9" ry="11" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M18 24 Q9 16 9 8 Q17 12 20 20"   stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M36 24 Q45 16 45 8 Q37 12 34 20"  stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="16" r="5" stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="36" cy="16" r="5" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M13 15 L8  17 L13 19" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M41 15 L46 17 L41 19" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11 L18 7 L20 11" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 11 L36 7 L38 11" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 42 L19 48 M27 42 L27 48 M33 42 L35 48"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// ── Helmet (Gagarin — cosmonaut helmet) ───────────────────────────────────
export function HelmetIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="24" r="17" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M14 22 Q14 32 27 34 Q40 32 40 22 Q40 17 27 17 Q14 17 14 22 Z"
        stroke={color} strokeWidth="1.3" fill="none" />
      <ellipse cx="27" cy="41" rx="12" ry="4" stroke={color} strokeWidth="1.4" fill="none" />
      <line x1="15" y1="41" x2="15" y2="37" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
      <line x1="39" y1="41" x2="39" y2="37" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
      <circle cx="34" cy="16" r="1.5" fill={color} opacity="0.55" />
    </svg>
  );
}

// ── Lyre (Pushkin — poet's lyre) ───────────────────────────────────────────
export function LyreIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 40 Q14 36 13 20 Q14 10 27 9" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M27 40 Q40 36 41 20 Q40 10 27 9" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="15" y1="18" x2="39" y2="18" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="20" y1="18" x2="19" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.6" />
      <line x1="27" y1="18" x2="27" y2="40" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.6" />
      <line x1="34" y1="18" x2="35" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.6" />
      <path d="M21 42 Q27 46 33 42" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── Candle (Dostoevsky — light in darkness) ────────────────────────────────
export function CandleIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="21" y="26" width="12" height="22" rx="1.5" stroke={color} strokeWidth="1.4" fill="none" />
      <line x1="27" y1="26" x2="27" y2="21" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M27 21 Q23 15 27 9 Q31 15 27 21"  stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M27 20 Q25 17 27 14 Q29 17 27 20"  stroke={color} strokeWidth="1"   fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M21 34 Q18 36 19 40" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.45" />
      <line x1="27" y1="9"  x2="27" y2="5"  stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.35" />
      <line x1="19" y1="12" x2="16" y2="9"  stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.3" />
      <line x1="35" y1="12" x2="38" y2="9"  stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

// ── Wheat (Tolstoy — nature & peasantry) ──────────────────────────────────
export function WheatIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="48" x2="27" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 16 Q21 14 17 17 Q21 20 27 20"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M27 23 Q20 20 16 24 Q20 27 27 27"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M27 30 Q21 28 17 32 Q21 35 27 34"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M27 16 Q33 14 37 17 Q33 20 27 20"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M27 23 Q34 20 38 24 Q34 27 27 27"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M27 30 Q33 28 37 32 Q33 35 27 34"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <line x1="26" y1="10" x2="24" y2="6" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
      <line x1="28" y1="10" x2="30" y2="6" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

// ── Guitar (Vysotsky — bard's guitar) ─────────────────────────────────────
export function GuitarIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 30 Q18 28 15 36 Q13 44 21 47 Q29 50 36 45 Q43 40 38 34 Q35 28 27 30 Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <circle cx="27" cy="38" r="4.5" stroke={color} strokeWidth="1.1" fill="none" opacity="0.6" />
      <rect x="24" y="10" width="6"  height="22" rx="2" stroke={color} strokeWidth="1.3" fill="none" />
      <rect x="22" y="6"  width="10" height="6"  rx="2" stroke={color} strokeWidth="1.3" fill="none" />
      <line x1="24" y1="16" x2="30" y2="16" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <line x1="24" y1="22" x2="30" y2="22" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <line x1="24" y1="28" x2="30" y2="28" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ── EyeMystic (Rasputin — all-seeing eye) ─────────────────────────────────
export function EyeMysticIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M7 27 Q17 14 27 13 Q37 14 47 27 Q37 40 27 41 Q17 40 7 27 Z"
        stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="27" r="7"   stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="27" cy="27" r="3"   fill={color} />
      <line x1="27" y1="6"  x2="27" y2="10" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <line x1="38" y1="9"  x2="36" y2="12" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
      <line x1="16" y1="9"  x2="18" y2="12" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
      <line x1="27" y1="48" x2="27" y2="44" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

// ── TableChem (Mendeleev — periodic table) ────────────────────────────────
export function TableChemIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="7"  y="7"  width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <rect x="38" y="7"  width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <rect x="7"  y="20" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <rect x="18" y="20" width="9" height="9" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="29" y="20" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <rect x="38" y="20" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <rect x="7"  y="33" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <rect x="18" y="33" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <rect x="29" y="33" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <rect x="38" y="33" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
    </svg>
  );
}

// ── Flask (Walter White — chemistry flask) ────────────────────────────────
export function FlaskIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="22" y="8"  width="10" height="14" rx="2" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M22 22 L12 44 Q12 48 27 48 Q42 48 42 44 L32 22 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M16 38 Q27 36 38 38" stroke={color} strokeWidth="1"   fill="none" strokeLinecap="round" opacity="0.5" />
      <circle cx="23" cy="42" r="1.5" stroke={color} strokeWidth="1"   fill="none" opacity="0.65" />
      <circle cx="31" cy="44" r="1.2" stroke={color} strokeWidth="1"   fill="none" opacity="0.55" />
      <circle cx="35" cy="41" r="1"   stroke={color} strokeWidth="1"   fill="none" opacity="0.5" />
      <path d="M27 8 Q24 4 27 2 Q30 4 27 8"
        stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ── Goblet (Tyrion — wine goblet) ─────────────────────────────────────────
export function GobletIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M15 10 Q13 26 18 32 Q22 38 27 38 Q32 38 36 32 Q41 26 39 10 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="27" y1="38" x2="27" y2="46" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="27" cy="47" rx="11" ry="3" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M17 20 Q27 22 37 20" stroke={color} strokeWidth="1"   fill="none" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ── JokerCard (Joker — playing card) ──────────────────────────────────────
export function JokerCardIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="12" y="6" width="30" height="42" rx="3" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M27 14 L31 20 L27 26 L23 20 Z"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M24 30 L30 30 M27 30 L27 40 Q27 44 23 44"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="10" r="1.5" fill={color} opacity="0.6" />
      <circle cx="38" cy="44" r="1.5" fill={color} opacity="0.6" />
    </svg>
  );
}

// ── Wolf (Geralt — wolf medallion) ────────────────────────────────────────
export function WolfIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M20 34 Q18 26 20 20 Q22 14 27 12 Q32 14 34 20 Q36 26 34 34"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M22 30 Q27 36 32 30" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M20 20 L17 12 L23 16" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M34 20 L37 12 L31 16" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="23" cy="24" r="1.5" fill={color} opacity="0.8" />
      <circle cx="31" cy="24" r="1.5" fill={color} opacity="0.8" />
    </svg>
  );
}

// ── Blades (Kratos — Blades of Chaos) ─────────────────────────────────────
export function BladesIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M10 44 L30 24 L34 10 L38 14 L26 28 L42 42"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 44 Q6 48 10 50 Q14 48 10 44"
        stroke={color} strokeWidth="1.3" fill="none" opacity="0.65" />
      <path d="M44 44 L24 24 L20 10 L16 14 L28 28 L12 42"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 44 Q48 48 44 50 Q40 48 44 44"
        stroke={color} strokeWidth="1.3" fill="none" opacity="0.65" />
    </svg>
  );
}

// ── NoteBook (Light Yagami — Death Note) ──────────────────────────────────
export function NoteBookIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="12" y="6" width="30" height="42" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="18" y1="6"  x2="18" y2="48" stroke={color} strokeWidth="2"   strokeLinecap="round" opacity="0.65" />
      <line x1="22" y1="16" x2="38" y2="16" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <line x1="22" y1="22" x2="38" y2="22" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <line x1="22" y1="28" x2="38" y2="28" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <circle cx="30" cy="38" r="5"   stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <line x1="27" y1="40" x2="27" y2="42" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.4" />
      <line x1="30" y1="40" x2="30" y2="42" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.4" />
      <line x1="33" y1="40" x2="33" y2="42" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ── Cake (L — sweet obsession) ────────────────────────────────────────────
export function CakeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="10" y="30" width="34" height="16" rx="2" stroke={color} strokeWidth="1.4" fill="none" />
      <line x1="10" y1="38" x2="44" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.5" />
      <path d="M12 30 Q14 26 16 28 Q18 24 20 28 Q22 24 24 28 Q26 24 28 28 Q30 24 32 28 Q34 24 36 28 Q38 26 42 30"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <line x1="20" y1="30" x2="20" y2="22" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="27" y1="30" x2="27" y2="20" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="34" y1="30" x2="34" y2="22" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M20 22 Q18 18 20 16 Q22 18 20 22" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M27 20 Q25 16 27 13 Q29 16 27 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M34 22 Q32 18 34 16 Q36 18 34 22" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

// ── Wings (Levi — Survey Corps Wings of Freedom) ──────────────────────────
export function WingsIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="30" rx="4" ry="9" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M23 26 Q16 16 8 18 Q10 24 16 26 Q9 25 12 32 Q18 30 23 33"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M31 26 Q38 16 46 18 Q44 24 38 26 Q45 25 42 32 Q36 30 31 33"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Titan (Eren — Attack Titan) ────────────────────────────────────────────
export function TitanIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M11 28 Q9 16 27 11 Q45 16 43 28 Q43 41 27 45 Q11 41 11 28 Z"
        stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M17 24 Q19 21 22 24" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M32 24 Q35 21 38 24" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M18 35 Q27 40 36 35" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <line x1="20" y1="11" x2="18" y2="7"  stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <line x1="27" y1="11" x2="27" y2="6"  stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <line x1="34" y1="11" x2="36" y2="7"  stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ── Saiyan (Goku — power aura) ────────────────────────────────────────────
export function SaiyanIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="20" r="5"  stroke={color} strokeWidth="1.3" fill="none" />
      <line x1="27" y1="25" x2="27" y2="36" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="29" x2="37" y2="29" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="27" y1="36" x2="20" y2="46" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="27" y1="36" x2="34" y2="46" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="27" y1="6"  x2="27" y2="12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="10" y1="10" x2="14" y2="14" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <line x1="44" y1="10" x2="40" y2="14" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <line x1="6"  y1="24" x2="12" y2="24" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <line x1="48" y1="24" x2="42" y2="24" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <line x1="8"  y1="38" x2="13" y2="35" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.35" />
      <line x1="46" y1="38" x2="41" y2="35" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

// ── StrawHat (Luffy — straw hat) ───────────────────────────────────────────
export function StrawHatIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="32" rx="22" ry="7"  stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M13 32 Q11 22 27 18 Q43 22 41 32"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M14 30 Q27 26 40 30"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55" />
      <line x1="18" y1="29" x2="20" y2="22" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
      <line x1="23" y1="27" x2="24" y2="20" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
      <line x1="27" y1="25" x2="27" y2="18" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
      <line x1="31" y1="27" x2="30" y2="20" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
      <line x1="36" y1="29" x2="34" y2="22" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

// ── BoxingGlove (Ali — fists of legend) ───────────────────────────────────
export function BoxingGloveIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M9 30 Q8 22 14 20 Q18 18 20 20 L22 16 Q24 12 27 14 Q28 18 24 22 L26 28 Q28 36 20 40 Q11 40 9 30 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M45 30 Q46 22 40 20 Q36 18 34 20 L32 16 Q30 12 27 14 Q26 18 30 22 L28 28 Q26 36 34 40 Q43 40 45 30 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <line x1="12" y1="36" x2="18" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.45" />
      <line x1="42" y1="36" x2="36" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ── SoccerBall (Ronaldo — the beautiful game) ─────────────────────────────
export function SoccerBallIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M27 12 L32 16 L30 22 L24 22 L22 16 Z"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" />
      <path d="M10 22 L16 20 L20 24 L18 30 L12 30 Z"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" opacity="0.75" />
      <path d="M44 22 L38 20 L34 24 L36 30 L42 30 Z"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" opacity="0.75" />
      <path d="M27 42 L32 38 L30 32 L24 32 L22 38 Z"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

// ── CigarIcon (Тони Монтана) ──────────────────────────────────────────────
export function CigarIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M10 40 L38 14" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.12" />
      <path d="M10 40 L38 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="40" x2="14" y2="36" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
      <path d="M40 12 Q43 8 41 5 Q45 7 43 11 Q46 8 45 5 Q48 10 45 14" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M24 24 Q20 18 22 12 Q24 8 22 4" stroke={color} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45" />
      <path d="M20 26 Q16 20 18 14 Q20 10 18 6" stroke={color} strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.25" />
    </svg>
  );
}

// ── RoseIcon (Майкл Корлеоне) ─────────────────────────────────────────────
export function RoseIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="28" x2="27" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 40 Q33 34 40 36" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M27 36 Q20 30 14 32" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="27" cy="22" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M27 14 C22 15 19 19 20 23 C21 27 25 29 27 28 C29 29 33 27 34 23 C35 19 32 15 27 14Z" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M22 20 C24 23 27 23 27 23 C27 23 30 23 32 20" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M24 16 C24 14 27 12 27 12 C27 12 30 14 30 16" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  );
}

// ── FedoraIcon (Индиана Джонс) ────────────────────────────────────────────
export function FedoraIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M6 32 Q12 26 19 26 L35 26 Q42 26 48 32 Q42 38 27 38 Q12 38 6 32Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M19 26 L17 13 Q22 9 27 9 Q32 9 37 13 L35 26" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M22 12 Q24 8 27 7 Q30 8 32 12" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <path d="M19 24 L35 24" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <path d="M27 38 Q35 42 40 46 Q44 49 43 52" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

// ── PencilIcon (Джон Уик) ─────────────────────────────────────────────────
export function PencilIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M14 40 L36 12" stroke={color} strokeWidth="5" strokeLinecap="butt" opacity="0.12" />
      <path d="M14 40 L36 12" stroke={color} strokeWidth="3" strokeLinecap="butt" />
      <path d="M36 12 L40 8 L43 11 L39 14 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M11 43 L14 40 L10 46 Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <line x1="12" y1="41" x2="10" y2="44" stroke={color} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

// ── WandIcon (Гарри Поттер) ───────────────────────────────────────────────
export function WandIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M12 44 L40 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="40" cy="12" r="3.5" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="40" y1="5" x2="40" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="47" y1="12" x2="49" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="45" y1="7" x2="47" y2="5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="45" y1="17" x2="47" y2="19" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="35" y1="7" x2="33" y2="5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M24 10 L21 16 L26 16 L23 22" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
    </svg>
  );
}

// ── LightsaberIcon (Дарт Вейдер) ─────────────────────────────────────────
export function LightsaberIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 8 L27 34" stroke={color} strokeWidth="7" strokeLinecap="round" opacity="0.1" />
      <path d="M27 8 L27 34" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <rect x="23" y="34" width="8" height="11" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="23" y1="39" x2="31" y2="39" stroke={color} strokeWidth="1" opacity="0.5" />
      <circle cx="27" cy="41" r="1.5" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M23 45 L31 45 L31 47 L23 47 Z" stroke={color} strokeWidth="1.2" fill="none" />
    </svg>
  );
}

// ── StaffIcon (Гендальф) ──────────────────────────────────────────────────
export function StaffIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 48 L26 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M26 12 L22 8 L26 5 L30 8 L26 12" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <circle cx="26" cy="8" r="5.5" stroke={color} strokeWidth="1" fill="none" opacity="0.35" />
      <line x1="23" y1="28" x2="31" y2="30" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
      <line x1="22" y1="34" x2="30" y2="36" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

// ── SharinganIcon (Итачи Учиха) ───────────────────────────────────────────
export function SharinganIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="18" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="27" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="16" r="2.5" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M27 18.5 Q31 21 29.5 24.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="36.6" cy="31.5" r="2.5" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M34.4 33 Q31 35 29.5 31.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="17.4" cy="31.5" r="2.5" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M19.6 33 Q23 35 24.5 31.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── FlameIcon (Тандзиро Камадо) ───────────────────────────────────────────
export function FlameIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 47 Q17 40 15 32 Q13 22 20 16 Q18 26 25 28 Q23 18 28 9 Q31 20 37 22 Q39 15 37 9 Q45 18 43 30 Q41 40 34 45 Q30 48 27 47Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M27 43 Q21 37 21 30 Q23 34 27 34 Q27 26 32 22 Q33 30 37 32 Q37 39 32 43 Q29 45 27 43Z"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

// ── ThreeSwordsIcon (Зоро) ────────────────────────────────────────────────
export function ThreeSwordsIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="7" x2="27" y2="38" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M25 36 L27 42 L29 36" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <rect x="24.5" y="42" width="5" height="4" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <line x1="13" y1="9" x2="34" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32.5 40 L35 45 L37 40" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <line x1="41" y1="9" x2="20" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21.5 40 L19 45 L17 40" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

// ── LeafBandIcon (Какаши Хатаке) ──────────────────────────────────────────
export function LeafBandIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M6 24 L48 24 L48 34 L6 34 Z" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="16" y="22" width="22" height="16" rx="1.5" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M27 24.5 Q31 24 33 27 Q31 30 27 34.5 Q23 30 21 27 Q23 24 27 24.5Z" stroke={color} strokeWidth="1.2" fill="none" />
      <line x1="27" y1="30" x2="27" y2="37" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <path d="M6 24 L3 22 M6 34 L3 36" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M48 24 L51 22 M48 34 L51 36" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ── AutomailIcon (Эдвард Элрик) ───────────────────────────────────────────
export function AutomailIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="21" y="10" width="12" height="9" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="21" y="21" width="12" height="12" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="21" y="35" width="12" height="7" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="23" y1="42" x2="23" y2="47" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="42" x2="27" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="31" y1="42" x2="31" y2="47" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="26" x2="32" y2="26" stroke={color} strokeWidth="0.9" opacity="0.45" />
      <circle cx="27" cy="28" r="2" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <line x1="23" y1="14" x2="31" y2="14" stroke={color} strokeWidth="0.9" opacity="0.4" />
    </svg>
  );
}

// ── CowboyHatIcon (Артур Морган) ──────────────────────────────────────────
export function CowboyHatIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M6 33 Q12 27 19 27 L35 27 Q42 27 48 33 Q42 38 27 38 Q12 38 6 33Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M19 27 L18 14 Q22 9 27 9 Q32 9 36 14 L35 27" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M22 12 Q24 8 27 7 Q30 8 32 12" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <line x1="19" y1="25" x2="35" y2="25" stroke={color} strokeWidth="1.5" opacity="0.45" />
    </svg>
  );
}

// ── BarcodeIcon (Агент 47) ────────────────────────────────────────────────
export function BarcodeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="9"  y1="12" x2="9"  y2="40" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="12" x2="12" y2="40" stroke={color} strokeWidth="3" />
      <line x1="16" y1="12" x2="16" y2="40" stroke={color} strokeWidth="1" />
      <line x1="18" y1="12" x2="18" y2="40" stroke={color} strokeWidth="2" />
      <line x1="21" y1="12" x2="21" y2="40" stroke={color} strokeWidth="1.5" />
      <line x1="24" y1="12" x2="24" y2="40" stroke={color} strokeWidth="1" />
      <line x1="26" y1="12" x2="26" y2="40" stroke={color} strokeWidth="3" />
      <line x1="30" y1="12" x2="30" y2="40" stroke={color} strokeWidth="1.5" />
      <line x1="33" y1="12" x2="33" y2="40" stroke={color} strokeWidth="1" />
      <line x1="35" y1="12" x2="35" y2="40" stroke={color} strokeWidth="2" />
      <line x1="38" y1="12" x2="38" y2="40" stroke={color} strokeWidth="1.5" />
      <line x1="41" y1="12" x2="41" y2="40" stroke={color} strokeWidth="1" />
      <line x1="43" y1="12" x2="43" y2="40" stroke={color} strokeWidth="2.5" />
      <line x1="45" y1="12" x2="45" y2="40" stroke={color} strokeWidth="1" />
      <path d="M17 44 L15 47 L19 47 M19 44 L19 48" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M23 44 L27 44 L25 48" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── HiddenBladeIcon (Эцио Аудиторе) ──────────────────────────────────────
export function HiddenBladeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="12" y="34" width="30" height="11" rx="3" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="20" y1="34" x2="20" y2="45" stroke={color} strokeWidth="1" opacity="0.45" />
      <line x1="34" y1="34" x2="34" y2="45" stroke={color} strokeWidth="1" opacity="0.45" />
      <path d="M27 34 L27 11 L30 18 M27 11 L24 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M20 28 Q22 22 27 20 Q32 22 34 28 Q30 26 27 27 Q24 26 20 28Z" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
    </svg>
  );
}

// ── VisorIcon (Мастер Чиф) ────────────────────────────────────────────────
export function VisorIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M10 30 Q10 11 27 9 Q44 11 44 30 L44 36 Q44 44 27 46 Q10 44 10 36 Z" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M16 23 Q16 18 27 17 Q38 18 38 23 L38 31 Q38 36 27 36 Q16 36 16 31 Z" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <path d="M18 20 L24 18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      <line x1="18" y1="40" x2="36" y2="40" stroke={color} strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

// ── BannerIcon (Жанна д'Арк) ──────────────────────────────────────────────
export function BannerIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="14" y1="5" x2="14" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 9 L40 13 L40 37 L14 41 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="25" y1="17" x2="25" y2="33" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <line x1="19" y1="25" x2="31" y2="25" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <path d="M11 5 L14 3 L17 5" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

// ── HordeIcon (Аттила) ────────────────────────────────────────────────────
export function HordeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M16 8 Q7 27 16 46" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="16" y1="8" x2="16" y2="46" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16 27 L32 23" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="23" x2="45" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M45 17 L41 19 L42 22 Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <path d="M32 23 L30 20 M32 23 L30 26" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ── SyringeIcon (Декстер Морган) ──────────────────────────────────────────
export function SyringeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M37 10 L44 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M34 13 L44 4 M40 7 L34 13" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M10 44 L34 13" stroke={color} strokeWidth="5.5" strokeLinecap="round" opacity="0.1" />
      <path d="M10 44 L34 13" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M8 47 L10 44 L6 46 Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <line x1="22" y1="36" x2="18" y2="40" stroke={color} strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}

// ── CaneIcon (Доктор Хаус) ────────────────────────────────────────────────
export function CaneIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M22 49 L22 14 Q22 7 29 7 Q36 7 36 14" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="22" cy="49" rx="3" ry="2" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── ChidoriIcon (Саске Учиха) ─────────────────────────────────────────────
export function ChidoriIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="19" y="26" width="16" height="12" rx="4" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M23 26 L23 22 Q23 20 25 20 L29 20 Q31 20 31 22 L31 26" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M16 20 L20 24 M12 26 L18 28 M14 34 L19 31" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <path d="M38 20 L34 24 M42 26 L36 28 M40 34 L35 31" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <path d="M27 8 L24 16 L28 16 L25 24" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── GauntletIcon (Изуку Мидория) ─────────────────────────────────────────
export function GauntletIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M18 42 L18 28 Q18 24 22 22 L32 22 Q36 22 36 26 L36 42 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M22 22 L22 14 Q22 12 24 12 L24 22" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M26 22 L26 11 Q26 9 28 9 L28 22" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M30 22 L30 12 Q30 10 32 10 L32 22" stroke={color} strokeWidth="1.3" fill="none" />
      <line x1="18" y1="36" x2="36" y2="36" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <path d="M24 30 L22 35 L27 35 L25 40" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
    </svg>
  );
}

// ── MuscleIcon (Всемогущий) ───────────────────────────────────────────────
export function MuscleIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M12 42 Q10 36 14 30 Q18 24 24 22 Q30 20 34 16 Q38 12 36 8 Q42 10 42 18 Q42 24 36 28 Q30 32 28 38 Q26 44 20 44 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M20 30 Q16 24 22 20 Q28 18 30 24" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <path d="M27 8 L27 14 M27 17 L27 18" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

// ── MorningStarIcon (Рем) ─────────────────────────────────────────────────
export function MorningStarIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="10" y1="44" x2="22" y2="32" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M22 32 Q28 28 34 22" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <circle cx="38" cy="18" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="38" y1="8"  x2="38" y2="6"  stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="38" y1="28" x2="38" y2="30" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="28" y1="18" x2="26" y2="18" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="48" y1="18" x2="50" y2="18" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="31" y1="11" x2="29" y2="9"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="45" y1="11" x2="47" y2="9"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="31" y1="25" x2="29" y2="27" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="45" y1="25" x2="47" y2="27" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ── PlugIcon (Асука Лэнгли) ───────────────────────────────────────────────
export function PlugIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="18" y="16" width="18" height="22" rx="4" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="23" y1="16" x2="23" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="31" y1="16" x2="31" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M27 38 L27 48" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="48" x2="30" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="24" x2="32" y2="24" stroke={color} strokeWidth="1" opacity="0.45" />
      <line x1="22" y1="30" x2="32" y2="30" stroke={color} strokeWidth="1" opacity="0.45" />
      <circle cx="27" cy="27" r="3" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── SoapIcon (Тайлер Дёрден) ──────────────────────────────────────────────
export function SoapIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="11" y="20" width="32" height="20" rx="6" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="17" y1="28" x2="37" y2="28" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <line x1="17" y1="33" x2="33" y2="33" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <circle cx="15" cy="15" r="2.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <circle cx="26" cy="12" r="1.5" stroke={color} strokeWidth="1"   fill="none" opacity="0.4" />
      <circle cx="37" cy="15" r="2"   stroke={color} strokeWidth="1"   fill="none" opacity="0.45" />
      <circle cx="44" cy="21" r="1.5" stroke={color} strokeWidth="1"   fill="none" opacity="0.3" />
    </svg>
  );
}

// ── FeatherIcon (Форрест Гамп) ────────────────────────────────────────────
export function FeatherIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M12 46 L36 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 10 Q44 12 42 20 Q40 28 32 30 Q26 32 12 46 Q22 38 28 30 Q34 22 36 10Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M20 38 Q26 30 32 24" stroke={color} strokeWidth="0.9" opacity="0.45" strokeLinecap="round" />
      <path d="M24 34 Q30 26 35 20" stroke={color} strokeWidth="0.9" opacity="0.35" strokeLinecap="round" />
    </svg>
  );
}

// ── BowlerHatIcon (Алекс ДеЛарж) ─────────────────────────────────────────
export function BowlerHatIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="32" rx="19" ry="5" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M14 32 Q13 16 27 13 Q41 16 40 32" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M17 22 Q17 14 27 12 Q37 14 37 22" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  );
}

// ── CoinFlipIcon (Антон Чигур) ────────────────────────────────────────────
export function CoinFlipIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="24" rx="14" ry="16" stroke={color} strokeWidth="1.5" fill="none" />
      <ellipse cx="27" cy="24" rx="10" ry="12" stroke={color} strokeWidth="1" fill="none" opacity="0.35" />
      <path d="M23 18 Q20 22 22 28 Q24 32 27 32" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.65" />
      <path d="M20 44 Q24 42 28 44 Q32 46 36 44" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M22 48 Q26 46 30 48" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25" />
    </svg>
  );
}

// ── ChessIcon (Макиавелли) ────────────────────────────────────────────────
export function ChessIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="14" r="4" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M21 36 L19 26 L23 28 L27 18 L31 28 L35 26 L33 36 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <line x1="19" y1="36" x2="35" y2="36" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="20" y="36" width="14" height="5" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="42" cy="40" r="4" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
      <line x1="42" y1="44" x2="42" y2="48" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="39" y1="48" x2="45" y2="48" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ── WarMapIcon (Сунь-цзы) ─────────────────────────────────────────────────
export function WarMapIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="10" y="14" width="34" height="26" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <ellipse cx="10" cy="27" rx="3" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
      <ellipse cx="44" cy="27" rx="3" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M14 30 L18 22 L22 28 L26 20 L30 26 L34 18 L38 28 L42 30" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
      <line x1="28" y1="30" x2="28" y2="36" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M28 30 L34 32 L28 34" stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

// ── MandalaIcon (Карл Юнг) ────────────────────────────────────────────────
export function MandalaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="27" cy="27" r="13" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      <circle cx="27" cy="27" r="6"  stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
      <line x1="27" y1="7"  x2="27" y2="47" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="7"  y1="27" x2="47" y2="27" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="13" y1="13" x2="41" y2="41" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="41" y1="13" x2="13" y2="41" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <circle cx="27" cy="14" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="27" cy="40" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="14" cy="27" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="40" cy="27" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── AnkhIcon (Тутанхамон) ─────────────────────────────────────────────────
export function AnkhIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="18" r="10" stroke={color} strokeWidth="2" fill="none" />
      <line x1="27" y1="28" x2="27" y2="48" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="34" x2="38" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ── DualGunIcon (Лара Крофт) ──────────────────────────────────────────────
export function DualGunIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M10 14 L34 36" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.1" />
      <path d="M10 14 L34 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 12 L12 10 L14 14" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M28 34 L32 38 L36 36" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M44 14 L20 36" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.1" />
      <path d="M44 14 L20 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M46 12 L42 10 L40 14" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M26 34 L22 38 L18 36" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

// ── RingIcon (Соник) ──────────────────────────────────────────────────────
export function RingIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="16" stroke={color} strokeWidth="7"   fill="none" opacity="0.08" />
      <circle cx="27" cy="27" r="16" stroke={color} strokeWidth="3.5" fill="none" />
      <path d="M16 18 Q20 14 26 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

// ── MushroomIcon (Марио) ──────────────────────────────────────────────────
export function MushroomIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M20 32 L20 44 Q20 46 22 46 L32 46 Q34 46 34 44 L34 32" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M18 32 Q17 30 18 28 L36 28 Q37 30 36 32" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M18 28 Q14 20 16 14 Q20 8 27 8 Q34 8 38 14 Q40 20 36 28 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <circle cx="21" cy="18" r="2.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <circle cx="33" cy="18" r="2.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <circle cx="27" cy="13" r="2"   stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
    </svg>
  );
}

// ── ElderBloodIcon (Цирилла) ──────────────────────────────────────────────
export function ElderBloodIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="18" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M27 10 L41 34 L13 34 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M27 44 L13 20 L41 20 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" opacity="0.55" />
      <circle cx="27" cy="27" r="3.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
    </svg>
  );
}

// ── SunflowerIcon (Джоэл Миллер) ─────────────────────────────────────────
export function SunflowerIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 34 L25 48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25 42 Q20 38 22 34" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="27" cy="24" r="7" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="24" r="3.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.45" />
      <line x1="27" y1="14" x2="27" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="27" y1="34" x2="27" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="17" y1="24" x2="13" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="37" y1="24" x2="41" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="17" x2="17" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="34" y1="17" x2="37" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="31" x2="17" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="34" y1="31" x2="37" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ── CarnationIcon (Дон Жуан) ──────────────────────────────────────────────
export function CarnationIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 32 L26 48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 40 Q20 36 22 32" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M26 44 Q32 40 30 36" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M27 32 Q22 28 20 22 Q24 24 26 20 Q27 16 27 14 Q27 16 28 20 Q30 24 34 22 Q32 28 27 32Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M22 28 Q24 30 27 30 Q30 30 32 28" stroke={color} strokeWidth="1.1" fill="none" opacity="0.5" />
    </svg>
  );
}

// ── FangIcon (Дракула) ────────────────────────────────────────────────────
export function FangIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M12 16 Q20 12 27 14 Q34 12 42 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M16 16 L16 36 Q16 42 20 44 L22 36 L24 44 Q22 16 16 16Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M30 16 L30 36 Q30 42 34 44 L36 36 L38 44 Q36 16 30 16Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M20 44 Q20 48 22 48 Q24 48 24 44" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
      <path d="M34 44 Q34 48 36 48 Q38 48 38 44" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
    </svg>
  );
}

// ── KunaiIcon (Минато Намикадзе) ──────────────────────────────────────────
export function KunaiIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 6 L30 18 L27 16 L24 18 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <rect x="25" y="18" width="4" height="13" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
      <line x1="25" y1="21" x2="29" y2="21" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="25" y1="24" x2="29" y2="24" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="25" y1="27" x2="29" y2="27" stroke={color} strokeWidth="1" opacity="0.5" />
      <circle cx="27" cy="34" r="2.5" stroke={color} strokeWidth="1.3" fill="none" />
      <rect x="20" y="38" width="14" height="9" rx="1.5" stroke={color} strokeWidth="1.3" fill="none" />
      <line x1="24" y1="42" x2="30" y2="42" stroke={color} strokeWidth="1" opacity="0.6" />
      <line x1="27" y1="38" x2="27" y2="47" stroke={color} strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

// ── AtFieldIcon (Аянами Рэй) ──────────────────────────────────────────────
export function AtFieldIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 8 L40 15.5 L40 38.5 L27 46 L14 38.5 L14 15.5 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M27 14 L36 19 L36 35 L27 40 L18 35 L18 19 Z" stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" opacity="0.6" />
      <path d="M27 20 L32 23 L32 31 L27 34 L22 31 L22 23 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.35" />
      <circle cx="27" cy="27" r="3" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── ThunderboltIcon (Пикачу) ──────────────────────────────────────────────
export function ThunderboltIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M32 6 L20 28 L28 28 L22 48 L38 22 L30 22 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="8"  y1="16" x2="14" y2="16" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="12" x2="14" y2="16" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="10" y1="20" x2="14" y2="16" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="44" y1="32" x2="48" y2="32" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="44" y1="28" x2="48" y2="32" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="44" y1="36" x2="48" y2="32" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ── MoonSceptreIcon (Сейлор Мун) ──────────────────────────────────────────
export function MoonSceptreIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="48" x2="27" y2="24" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="27" cy="18" r="6" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M21 12 Q16 8 14 4 Q20 6 22 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M33 12 Q38 8 40 4 Q34 6 32 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M27 14 L28.2 16.4 L30.8 16.4 L28.8 18 L29.6 20.4 L27 18.8 L24.4 20.4 L25.2 18 L23.2 16.4 L25.8 16.4 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.65" />
    </svg>
  );
}

// ── BusterIcon (Клауд Страйф) ─────────────────────────────────────────────
export function BusterIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M21 6 L33 6 L36 38 L27 44 L18 38 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <rect x="24" y="44" width="6" height="8" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M16 40 L38 40" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <line x1="27" y1="8"  x2="27" y2="38" stroke={color} strokeWidth="0.9" opacity="0.35" />
      <path d="M21 6 L27 4 L33 6" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

// ── TriforceIcon (Линк) ───────────────────────────────────────────────────
export function TriforceIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 10 L35 24 L19 24 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M19 24 L27 38 L11 38 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M35 24 L43 38 L27 38 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

// ── BandanaIcon (Солид Снейк) ─────────────────────────────────────────────
export function BandanaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M8 22 Q12 18 27 18 Q42 18 46 22 Q42 26 27 26 Q12 26 8 22Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M44 22 L50 20 Q52 24 50 28 L44 24" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.7" />
      <path d="M50 20 Q52 14 48 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M50 28 Q52 34 48 38" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M25 33 Q25 30 27 30 Q29 30 29 32 Q29 34 27 35 M27 37 L27 38" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── MicrophoneIcon (Фредди Меркьюри) ─────────────────────────────────────
export function MicrophoneIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="22" y="14" width="10" height="24" rx="5" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="22" y1="22" x2="32" y2="22" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="22" y1="26" x2="32" y2="26" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="22" y1="30" x2="32" y2="30" stroke={color} strokeWidth="1" opacity="0.4" />
      <path d="M18 30 Q18 40 27 40 Q36 40 36 30" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="27" y1="40" x2="27" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 48 L33 48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── ShadesIcon (Элвис Пресли) ─────────────────────────────────────────────
export function ShadesIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M6 26 Q8 20 16 20 Q24 20 24 26 Q24 32 16 32 Q8 32 6 26Z" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M30 26 Q30 20 38 20 Q46 20 48 26 Q46 32 38 32 Q30 32 30 26Z" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M24 24 Q27 22 30 24" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M6 24 Q4 22 4 20" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M48 24 Q50 22 50 20" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <line x1="10" y1="22" x2="14" y2="22" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="34" y1="22" x2="38" y2="22" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ── WebIcon (Спайдермен) ──────────────────────────────────────────────────
export function WebIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="27" x2="27" y2="6"  stroke={color} strokeWidth="1.2" opacity="0.65" />
      <line x1="27" y1="27" x2="44" y2="16" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <line x1="27" y1="27" x2="48" y2="35" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <line x1="27" y1="27" x2="38" y2="48" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <line x1="27" y1="27" x2="16" y2="48" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <line x1="27" y1="27" x2="6"  y2="35" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <line x1="27" y1="27" x2="10" y2="16" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <path d="M20 14 Q27 10 34 14" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M14 22 Q27 16 40 22" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M10 32 Q27 24 44 32" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M12 42 Q27 34 42 42" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

// ── BatSymbolIcon (Бэтмен) ────────────────────────────────────────────────
export function BatSymbolIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 22 Q20 20 14 24 Q8 28 6 36 Q12 32 18 34 Q22 36 24 30 Q26 26 27 28 Q28 26 30 30 Q32 36 36 34 Q42 32 48 36 Q46 28 40 24 Q34 20 27 22Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M20 22 L14 14 L22 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.7" />
      <path d="M34 22 L40 14 L32 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

// ── ChampagneIcon (Джей Гэтсби) ───────────────────────────────────────────
export function ChampagneIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M20 8 L22 28 Q24 34 27 34 Q30 34 32 28 L34 8 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="27" y1="34" x2="27" y2="46" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 46 L33 46" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="24" r="1"   stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="27" cy="20" r="1"   stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="30" cy="16" r="1"   stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="25" cy="14" r="0.8" stroke={color} strokeWidth="0.9" fill="none" opacity="0.4" />
      <path d="M21 8 Q24 5 27 6 Q30 5 33 8" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── HeaddressIcon (Нефертити) ─────────────────────────────────────────────
export function HeaddressIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="19" y="10" width="16" height="18" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="17" y="8"  width="20" height="4"  rx="1" stroke={color} strokeWidth="1.3" fill="none" opacity="0.7" />
      <line x1="19" y1="20" x2="35" y2="20" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <path d="M22 28 Q20 34 20 40 L34 40 Q34 34 32 28" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M20 32 Q17 34 18 38 Q20 36 20 34" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M23 34 Q25 32 27 33 Q29 34 31 32" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

// ── LotusIcon (Будда) ─────────────────────────────────────────────────────
export function LotusIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 32 Q22 22 22 16 Q24 10 27 10 Q30 10 32 16 Q32 22 27 32Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M27 32 Q16 24 14 18 Q14 12 18 12 Q22 12 24 18 Q26 24 27 32Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.75" />
      <path d="M27 32 Q38 24 40 18 Q40 12 36 12 Q32 12 30 18 Q28 24 27 32Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.75" />
      <path d="M27 32 Q10 26 8 20 Q8 14 12 14 Q18 14 22 22" stroke={color} strokeWidth="1" fill="none" opacity="0.45" />
      <path d="M27 32 Q44 26 46 20 Q46 14 42 14 Q36 14 32 22" stroke={color} strokeWidth="1" fill="none" opacity="0.45" />
      <path d="M10 38 Q20 34 27 36 Q34 34 44 38" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  );
}

// ── PipeSmokeIcon (Сталин) ────────────────────────────────────────────────
export function PipeSmokeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M24 32 Q22 28 22 24 Q22 20 26 20 L32 20 Q36 20 36 24 Q36 28 34 32" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M24 32 L14 38 Q10 40 8 38" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M34 32 L36 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M29 20 Q26 14 28 8 Q30 12 28 16 Q30 10 32 6 Q32 12 30 16" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M25 20 Q22 12 24 6 Q26 10 24 14" stroke={color} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.3" />
    </svg>
  );
}

// ── InkwellIcon (Антон Чехов) ─────────────────────────────────────────────
export function InkwellIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M18 42 L16 28 Q16 22 27 22 Q38 22 38 28 L36 42 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <ellipse cx="27" cy="22" rx="7" ry="3" stroke={color} strokeWidth="1.3" fill="none" />
      <ellipse cx="27" cy="20" rx="5" ry="2" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <path d="M27 20 L38 6 Q42 4 44 8 Q44 12 40 14 Q36 16 32 16 L27 20" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M32 16 L38 10" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ── BatonIcon (Чайковский) ────────────────────────────────────────────────
export function BatonIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M10 44 L42 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 44 L16 38" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <circle cx="42" cy="10" r="2" stroke={color} strokeWidth="1.3" fill="none" opacity="0.7" />
      <path d="M32 26 Q36 22 38 26 Q36 28 34 26" stroke={color} strokeWidth="1.1" fill="none" opacity="0.5" />
      <line x1="38" y1="22" x2="38" y2="32" stroke={color} strokeWidth="1" opacity="0.4" />
      <path d="M20 38 Q22 34 26 36" stroke={color} strokeWidth="1.1" fill="none" opacity="0.35" />
    </svg>
  );
}

// ── PastaIcon (Тони Сопрано) ──────────────────────────────────────────────
export function PastaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="38" rx="18" ry="8" stroke={color} strokeWidth="1.5" fill="none" />
      <ellipse cx="27" cy="38" rx="14" ry="5" stroke={color} strokeWidth="1" fill="none" opacity="0.35" />
      <path d="M16 38 Q18 28 22 24 Q26 20 28 26 Q30 32 26 36" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M20 38 Q22 30 26 26 Q30 22 32 28 Q34 34 30 38" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M24 38 Q26 28 30 24 Q34 20 34 28 Q34 36 32 38" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      <line x1="36" y1="14" x2="36" y2="20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="38" y1="14" x2="38" y2="20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="40" y1="14" x2="40" y2="20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M38 20 L38 34" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// ── JumpmanIcon (Майкл Джордан) ───────────────────────────────────────────
export function JumpmanIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="32" cy="10" r="4" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M32 14 Q30 20 26 22 Q22 24 18 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M30 17 Q36 12 40 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="42" cy="7" r="4" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M42 3 Q44 7 42 11" stroke={color} strokeWidth="0.9" fill="none" opacity="0.5" />
      <path d="M28 20 Q22 18 18 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 22 Q22 30 18 36 Q16 40 18 42" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M26 22 Q30 30 32 36 Q34 42 30 46" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── MouthguardIcon (Майк Тайсон) ──────────────────────────────────────────
export function MouthguardIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M12 26 Q12 18 27 18 Q42 18 42 26 L40 34 Q36 40 27 40 Q18 40 14 34 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M16 26 L16 30 M21 25 L21 31 M26 24 L26 32 M31 24 L31 32 M36 25 L36 31 M41 26 L41 30" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      <path d="M16 26 Q20 22 27 22 Q34 22 38 26 L38 30 Q34 36 27 36 Q20 36 16 30 Z" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  );
}

// ── ScarfIcon (Микаса Аккерман) ───────────────────────────────────────────
export function ScarfIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M10 16 Q18 8 27 14 Q36 20 44 14" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M12 22 Q20 14 27 20 Q34 26 44 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M10 28 Q18 22 27 26 Q34 30 42 22" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M38 14 Q42 24 40 36 Q38 44 42 48" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M44 14 Q46 22 44 34 Q42 42 46 48" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  );
}

// ── PowerupIcon (Гохан) ────────────────────────────────────────────────────
export function PowerupIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="6" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="27" y1="21" x2="27" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="33" x2="27" y2="46" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="21" y1="27" x2="8" y2="27" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="33" y1="27" x2="46" y2="27" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22.8" y1="22.8" x2="14" y2="14" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="31.2" y1="22.8" x2="40" y2="14" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="22.8" y1="31.2" x2="14" y2="40" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="31.2" y1="31.2" x2="40" y2="40" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="27" cy="27" r="2.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── DragonslayerIcon (Гатс) ───────────────────────────────────────────────
export function DragonslayerIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="20" y="6" width="14" height="34" rx="1" stroke={color} strokeWidth="1.6" fill="none" />
      <path d="M20 8 L27 6 L34 8" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <line x1="14" y1="38" x2="40" y2="38" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <rect x="24" y="40" width="6" height="12" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="20" y1="20" x2="34" y2="20" stroke={color} strokeWidth="0.8" opacity="0.35" />
      <line x1="20" y1="26" x2="34" y2="26" stroke={color} strokeWidth="0.8" opacity="0.35" />
    </svg>
  );
}

// ── EyePatchIcon (Канеки Кен) ─────────────────────────────────────────────
export function EyePatchIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="26" rx="14" ry="10" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="26" r="5" stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="27" cy="26" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M27 16 L24 8 M27 16 L30 8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      <path d="M20 20 L12 14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      <path d="M34 20 L42 14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      <path d="M15 30 L9 36" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M39 30 L45 36" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ── RebellionIcon (Данте) ─────────────────────────────────────────────────
export function RebellionIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 6 L29 8 L29 36 L27 44 L25 36 L25 8 Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <line x1="14" y1="34" x2="40" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 34 Q10 30 12 26" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M40 34 Q44 30 42 26" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <rect x="25" y="44" width="4" height="6" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="27" cy="50" r="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M25 14 L23 10 M29 14 L31 10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ── Compass2Icon (Натан Дрейк) ────────────────────────────────────────────
export function Compass2Icon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="27" cy="27" r="16" stroke={color} strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M27 7 L30 22 L27 25 L24 22 Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <path d="M27 47 L24 32 L27 29 L30 32 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.6" />
      <path d="M7 27 L22 24 L25 27 L22 30 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.6" />
      <path d="M47 27 L32 30 L29 27 L32 24 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.6" />
      <circle cx="27" cy="27" r="2" stroke={color} strokeWidth="1.2" fill="none" />
    </svg>
  );
}

// ── SpearIcon (Алой) ──────────────────────────────────────────────────────
export function SpearIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="12" x2="27" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 24 L27 10 L33 24 Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M23 24 L27 14 L31 24" stroke={color} strokeWidth="0.9" fill="none" opacity="0.4" />
      <line x1="23" y1="44" x2="31" y2="44" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22 30 Q24 28 26 30" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M28 34 Q30 32 32 34" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

// ── GloveIcon (Майкл Джексон) ─────────────────────────────────────────────
export function GloveIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M20 44 L20 26 Q20 22 24 22 Q26 22 26 26 Q26 22 28 20 Q30 18 32 20 Q34 18 36 20 Q38 22 36 26 Q38 22 40 24 Q42 28 38 30 L38 44 Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <line x1="20" y1="38" x2="38" y2="38" stroke={color} strokeWidth="0.9" opacity="0.35" />
      <circle cx="24" cy="16" r="1.2" stroke={color} strokeWidth="0.9" fill="none" opacity="0.6" />
      <circle cx="30" cy="12" r="1.2" stroke={color} strokeWidth="0.9" fill="none" opacity="0.6" />
      <circle cx="36" cy="14" r="1.2" stroke={color} strokeWidth="0.9" fill="none" opacity="0.6" />
      <circle cx="42" cy="18" r="1" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" />
      <circle cx="16" cy="20" r="1" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" />
    </svg>
  );
}

// ── RastaIcon (Боб Марли) ─────────────────────────────────────────────────
export function RastaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="38" rx="10" ry="11" stroke={color} strokeWidth="1.5" fill="none" />
      <ellipse cx="27" cy="24" rx="7" ry="8" stroke={color} strokeWidth="1.4" fill="none" />
      <circle cx="27" cy="38" r="3.5" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <line x1="27" y1="8" x2="27" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <rect x="24" y="5" width="6" height="4" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <line x1="27" y1="27" x2="27" y2="32" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ── LipsIcon (Мэрилин Монро) ──────────────────────────────────────────────
export function LipsIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M10 27 Q15 20 27 22 Q39 20 44 27" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M10 27 Q15 36 27 38 Q39 36 44 27" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M10 27 Q15 22 20 23 Q24 24 27 22 Q30 24 34 23 Q39 22 44 27" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M20 27 Q24 30 27 30 Q30 30 34 27" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ── NunchakuIcon (Брюс Ли) ────────────────────────────────────────────────
export function NunchakuIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="10" y="12" width="6" height="18" rx="3" stroke={color} strokeWidth="1.4" fill="none" />
      <rect x="38" y="24" width="6" height="18" rx="3" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M16 20 Q22 16 28 18 Q34 20 38 24" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="21" cy="18" rx="2.5" ry="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
      <ellipse cx="27" cy="19" rx="2.5" ry="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
      <ellipse cx="33" cy="21" rx="2.5" ry="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
    </svg>
  );
}

// ── ZigzagIcon (Дэвид Боуи) ───────────────────────────────────────────────
export function ZigzagIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M24 6 L34 6 L22 28 L32 28 L18 48 L22 40 L14 40 L28 20 L18 20 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

// ── CartoucheIcon (Рамзес II) ─────────────────────────────────────────────
export function CartoucheIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <rect x="17" y="8" width="20" height="36" rx="10" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="12" y1="44" x2="42" y2="44" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="27" cy="18" r="3" stroke={color} strokeWidth="1.2" fill="none" opacity="0.8" />
      <line x1="23" y1="25" x2="31" y2="25" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <path d="M23 30 L27 28 L31 30" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <line x1="25" y1="35" x2="29" y2="35" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// ── SpartanIcon (Леонид I) ────────────────────────────────────────────────
export function SpartanIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M15 30 Q15 16 22 10 Q27 6 32 10 Q39 16 39 30 L37 34 Q33 38 27 38 Q21 38 17 34 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M21 30 L21 36" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <path d="M33 30 L33 36" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <rect x="24" y="26" width="6" height="14" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M13 8 Q20 4 27 4 Q34 4 41 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M13 8 L10 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── CapIcon (Ленин) ───────────────────────────────────────────────────────
export function CapIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M12 32 Q12 22 27 20 Q42 22 42 32" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M10 34 Q10 36 27 36 Q44 36 44 34 L42 32 L12 32 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M8 36 Q8 40 14 40 L40 40 Q46 40 46 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="12" y1="32" x2="42" y2="32" stroke={color} strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

// ── PrismIcon (Ломоносов) ─────────────────────────────────────────────────
export function PrismIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 8 L44 40 L10 40 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="6" y1="20" x2="18" y2="24" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M44 40 L50 34" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
      <path d="M44 40 L50 38" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <path d="M44 40 L50 42" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <path d="M44 40 L50 46" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <path d="M44 40 L50 50" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

// ── BeakerIcon (Джесси Пинкман) ───────────────────────────────────────────
export function BeakerIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M20 10 L20 28 L12 42 Q12 46 27 46 Q42 46 42 42 L34 28 L34 10 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="20" y1="10" x2="34" y2="10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="34" y1="6" x2="34" y2="10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 36 Q22 32 27 34 Q32 36 38 32" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.55" />
      <circle cx="22" cy="40" r="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="30" cy="42" r="1.2" stroke={color} strokeWidth="0.9" fill="none" opacity="0.45" />
    </svg>
  );
}

// ── QueenCrownIcon (Серсея Ланнистер) ─────────────────────────────────────
export function QueenCrownIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M10 38 L10 24 L16 14 L22 24 L27 12 L32 24 L38 14 L44 24 L44 38 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <rect x="10" y="38" width="34" height="6" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="20" cy="41" r="1.8" stroke={color} strokeWidth="1" fill="none" opacity="0.7" />
      <circle cx="27" cy="41" r="2" stroke={color} strokeWidth="1.1" fill="none" opacity="0.8" />
      <circle cx="34" cy="41" r="1.8" stroke={color} strokeWidth="1" fill="none" opacity="0.7" />
    </svg>
  );
}

// ── RacketIcon (Роджер Федерер) ───────────────────────────────────────────
export function RacketIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="22" rx="14" ry="16" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="27" y1="38" x2="27" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="22" y1="8" x2="22" y2="36" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <line x1="27" y1="6" x2="27" y2="38" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <line x1="32" y1="8" x2="32" y2="36" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <line x1="13" y1="18" x2="41" y2="18" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <line x1="13" y1="24" x2="41" y2="24" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <line x1="13" y1="30" x2="41" y2="30" stroke={color} strokeWidth="0.9" opacity="0.4" />
    </svg>
  );
}

// ── WorldCupIcon (Лионель Месси) ──────────────────────────────────────────
export function WorldCupIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M20 10 L34 10 Q36 20 32 28 L30 34 L34 34 L34 40 L20 40 L20 34 L24 34 L22 28 Q18 20 20 10 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M20 16 Q14 14 12 20 Q14 28 20 26" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M34 16 Q40 14 42 20 Q40 28 34 26" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <ellipse cx="27" cy="41" rx="10" ry="3" stroke={color} strokeWidth="1.2" fill="none" />
      <ellipse cx="27" cy="46" rx="12" ry="3" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M27 4 L28.5 8 L32 8 L29.5 10 L30.5 14 L27 12 L23.5 14 L24.5 10 L22 8 L25.5 8 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.75" />
    </svg>
  );
}

// ── Manuscript (Bulgakov — burning manuscript) ─────────────────────────────
export function ManuscriptIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M15 42 Q15 14 27 11 Q39 14 39 42" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="11" y1="42" x2="43" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="21" x2="34" y2="21" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <line x1="20" y1="27" x2="34" y2="27" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <line x1="20" y1="33" x2="34" y2="33" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <path d="M13 47 Q11 43 13 40" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55" />
      <path d="M41 47 Q43 43 41 40" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

// ── Birch (Esenin — birch tree) ────────────────────────────────────────────
export function BirchIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="7" x2="27" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M27 17 Q18 15 13 21 Q18 25 27 23" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M27 26 Q37 24 42 30 Q37 34 27 32" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M27 35 Q19 34 15 39 Q19 43 27 41" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <line x1="22" y1="11" x2="22" y2="14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
      <line x1="32" y1="15" x2="32" y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ── Megaphone (Mayakovsky) ─────────────────────────────────────────────────
export function MegaphoneIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M7 21 L7 33 L19 33 L37 45 L37 9 L19 21 Z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <line x1="19" y1="21" x2="19" y2="33" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M43 17 Q47 27 43 37" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M40 20 Q43 27 40 34" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ── Grand Piano (Rachmaninov) ──────────────────────────────────────────────
export function GrandPianoIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M7 36 L7 17 Q7 11 19 9 L45 9 Q49 9 49 15 L49 36 Q41 40 7 36 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M7 36 Q27 40 49 36" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.5" />
      <line x1="17" y1="36" x2="17" y2="45" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="39" y1="36" x2="39" y2="45" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="19" y1="14" x2="19" y2="30" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <line x1="24" y1="13" x2="24" y2="29" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <line x1="31" y1="12" x2="31" y2="28" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <line x1="36" y1="12" x2="36" y2="28" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ── Peace Atom (Sakharov) ──────────────────────────────────────────────────
export function PeaceAtomIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="27" r="3.5" fill={color} />
      <ellipse cx="27" cy="27" rx="20" ry="7" stroke={color} strokeWidth="1.4" fill="none" />
      <ellipse cx="27" cy="27" rx="20" ry="7" stroke={color} strokeWidth="1.4" fill="none" transform="rotate(60 27 27)" />
      <ellipse cx="27" cy="27" rx="20" ry="7" stroke={color} strokeWidth="1.4" fill="none" transform="rotate(120 27 27)" />
      <circle cx="27" cy="27" r="23" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  );
}

// ── Barbed Wire (Solzhenitsyn) ─────────────────────────────────────────────
export function BarbedWireIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="5" y1="19" x2="49" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="35" x2="49" y2="35" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="19" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="27" cy="19" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="40" cy="19" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="20" cy="35" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="34" cy="35" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <line x1="14" y1="16" x2="11" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="14" y1="16" x2="17" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="27" y1="16" x2="24" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="27" y1="16" x2="30" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="40" y1="16" x2="37" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="40" y1="16" x2="43" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

// ── Feather Pen (Turgenev) ─────────────────────────────────────────────────
export function FeatherPenIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M11 46 Q16 37 22 31 Q31 20 46 8" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M46 8 Q39 13 35 19 Q30 27 22 31" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M11 46 L15 42" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M17 48 Q14 46 11 46 Q11 43 13 41" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

// ── Troika (Gogol — three horses) ──────────────────────────────────────────
export function TroikaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M6 40 Q7 30 13 26 Q17 22 19 26 L19 40" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 40 Q19 27 27 23 Q31 19 34 23 L34 40" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33 40 Q34 30 41 26 Q45 22 47 26 L47 40" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="5" y1="40" x2="49" y2="40" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="6" y1="34" x2="48" y2="34" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" strokeDasharray="3 3" />
    </svg>
  );
}

// ── Autumn Leaf (Bunin) ────────────────────────────────────────────────────
export function AutumnLeafIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <line x1="27" y1="47" x2="27" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 22 Q22 16 17 18 Q20 12 27 10 Q34 12 37 18 Q32 16 27 22" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 27 Q18 24 12 28 Q14 21 21 21 Q23 21 25 23" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M27 27 Q36 24 42 28 Q40 21 33 21 Q31 21 29 23" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M27 34 Q20 32 14 36 Q17 40 22 38 Q24 40 27 42" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M27 34 Q34 32 40 36 Q37 40 32 38 Q30 40 27 42" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

// ── Black Hole Logo (large — splash) ──────────────────────────────────────
export function BlackHoleLogo({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="34" stroke="white" strokeWidth="0.4" fill="none" opacity="0.05" />
      <circle cx="36" cy="36" r="30" stroke="white" strokeWidth="0.5" fill="none" opacity="0.07" />
      <circle cx="36" cy="36" r="26" stroke="white" strokeWidth="0.5" fill="none" opacity="0.1"  />
      {/* Accretion disk back arc */}
      <path d="M10 36 A26 8 0 0 1 62 36" stroke="white" strokeWidth="1.2" fill="none" opacity="0.18" strokeLinecap="round" />
      {/* Event horizon */}
      <circle cx="36" cy="36" r="14" fill="#000000" />
      {/* Photon ring */}
      <circle cx="36" cy="36" r="18.5" stroke="white" strokeWidth="2.8" fill="none" opacity="0.88" />
      <circle cx="36" cy="36" r="14.8" stroke="white" strokeWidth="0.6" fill="none" opacity="0.22" />
      {/* Accretion disk front arc */}
      <path d="M10 36 A26 8 0 0 0 62 36" stroke="white" strokeWidth="3.2" fill="none" opacity="0.92" strokeLinecap="round" />
      {/* Relativistic jet */}
      <line x1="36" y1="4"  x2="36" y2="16" stroke="white" strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />
      <line x1="36" y1="56" x2="36" y2="68" stroke="white" strokeWidth="0.8" opacity="0.18" strokeLinecap="round" />
    </svg>
  );
}

// ── Black Hole Logo (small — header) ──────────────────────────────────────
export function BlackHoleLogoSmall({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="13" stroke="white" strokeWidth="0.4" fill="none" opacity="0.08" />
      <path d="M4 15 A11 3.5 0 0 1 26 15" stroke="white" strokeWidth="0.7" fill="none" opacity="0.2" strokeLinecap="round" />
      <circle cx="15" cy="15" r="6"  fill="black" />
      <circle cx="15" cy="15" r="8"  stroke="white" strokeWidth="1.8" fill="none" opacity="0.88" />
      <path d="M4 15 A11 3.5 0 0 0 26 15" stroke="white" strokeWidth="2.2" fill="none" opacity="0.92" strokeLinecap="round" />
      <line x1="15" y1="2" x2="15" y2="6" stroke="white" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

// ── GitHub icon ────────────────────────────────────────────────────────────
export function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
        fill="white"
      />
    </svg>
  );
}

// ── Navigation icons ───────────────────────────────────────────────────────
export function NavHomeIcon({ color = '#4A4A4A' }: { color?: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <path d="M3 9.5L11 3L19 9.5V19C19 19.55 18.55 20 18 20H14V15H8V20H4C3.45 20 3 19.55 3 19V9.5Z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function NavCatalogIcon({ color = '#4A4A4A' }: { color?: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.5" />
      <path d="M8 11h6M11 8v6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NavMyIcon({ color = '#4A4A4A' }: { color?: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <path d="M3 18V7L11 3L19 7V18" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="8" y="12" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function NavProfileIcon({ color = '#4A4A4A' }: { color?: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="7" r="4" stroke={color} strokeWidth="1.5" />
      <path d="M3 19c0-4 3.58-6 8-6s8 2 8 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon({ color = '#4A4A4A', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ color = '#606060', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" stroke={color} strokeWidth="1.5" />
      <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FilterIcon({ color = '#606060', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M4 8h8M6 12h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BackIcon({ color = '#888888', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M11 4L6 9L11 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon({ color = '#888888', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M9 1l2 6h6L12 11l2 6-5-3.5L4 17l2-6L1 7h6z"
        stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ color = '#888888', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="1.4" />
      <path d="M9 5v4l3 2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function MoreIcon({ color = '#888888', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9"  cy="9" r="1.5" fill={color} />
      <circle cx="14" cy="9" r="1.5" fill={color} />
      <circle cx="4"  cy="9" r="1.5" fill={color} />
    </svg>
  );
}

export function MicIcon({ color = '#888888', size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="8" y="2" width="8" height="13" rx="4" stroke={color} strokeWidth="1.5" />
      <path d="M5 12a7 7 0 0014 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="22" x2="15" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SendIcon({ size = 16, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9L1.5 6L14.5 1.5Z"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2v12M2 8h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BulbIcon({ color = '#888888', size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M7 1C4 1 2 3 2 5.5c0 1.5.7 2.8 1.8 3.7V11h6.4V9.2C11.3 8.3 12 7 12 5.5 12 3 10 1 7 1Z"
        stroke={color} strokeWidth="1.2" />
      <path d="M4.5 11v1.5h5V11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon({ color = '#A0A0A0', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke={color} strokeWidth="1.4" />
      <path d="M2 16c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsIcon({ color = '#A0A0A0', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="3" stroke={color} strokeWidth="1.4" />
      <path
        d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42"
        stroke={color} strokeWidth="1.4" strokeLinecap="round"
      />
    </svg>
  );
}

export function BellIcon({ color = '#A0A0A0', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="2.5" stroke={color} strokeWidth="1.4" />
      <path d="M2 7h14" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <rect x="5" y="10" width="2" height="2" rx="0.5" fill={color} />
      <rect x="8" y="10" width="2" height="2" rx="0.5" fill={color} />
    </svg>
  );
}

export function ShieldIcon({ color = '#A0A0A0', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M9 2C5.13 2 2 5.13 2 9s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" stroke={color} strokeWidth="1.4" />
      <path d="M9 6v4M9 12.5v.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function LogoutIcon({ color = '#EF4444', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M7 3H4C3.45 3 3 3.45 3 4V14C3 14.55 3.45 15 4 15H7"
        stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 6L15 9L12 12" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="7" y1="9" x2="15" y2="9" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function AddAvatarIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 4C10.13 4 7 7.13 7 11C7 14.87 10.13 18 14 18C17.87 18 21 14.87 21 11C21 7.13 17.87 4 14 4Z"
        stroke="#606060" strokeWidth="1.5" />
      <path d="M3 24C3 20.13 8.37 17 14 17C19.63 17 25 20.13 25 24"
        stroke="#606060" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="22" cy="22" r="5.5" fill="#FFFFFF" />
      <path d="M22 19.5v5M19.5 22h5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Sparkle ────────────────────────────────────────────────────────────────
export function SparkleIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M9 1 L10.2 7.8 L17 9 L10.2 10.2 L9 17 L7.8 10.2 L1 9 L7.8 7.8 Z"
        stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── Infinity ───────────────────────────────────────────────────────────────
export function InfinityIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M6.5 9C6.5 7.07 7.57 5.5 9 5.5C10.43 5.5 11.5 7.07 11.5 9C11.5 10.93 10.43 12.5 9 12.5C7.57 12.5 6.5 10.93 6.5 9Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M2 9C2 7.07 3.07 5.5 5 5.5C6.43 5.5 7.57 6.7 8.5 9C7.57 11.3 6.43 12.5 5 12.5C3.07 12.5 2 10.93 2 9Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M16 9C16 7.07 14.93 5.5 13 5.5C11.57 5.5 10.43 6.7 9.5 9C10.43 11.3 11.57 12.5 13 12.5C14.93 12.5 16 10.93 16 9Z"
        stroke={color} strokeWidth="1.4" fill="none" />
    </svg>
  );
}

// ── Age Restricted (18+) ───────────────────────────────────────────────────
export function AgeRestrictedIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="1.5" width="15" height="15" rx="3" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M5 13V5M5 5L7.5 7.5M5 5L2.5 7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 13V5H12.5C13.88 5 15 6.12 15 7.5C15 8.88 13.88 10 12.5 10H10" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Palette ────────────────────────────────────────────────────────────────
export function PaletteIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M9 2C5.13 2 2 5.13 2 9C2 12.87 5.13 16 9 16C10.1 16 11 15.1 11 14C11 13.48 10.8 13.01 10.46 12.65C10.13 12.3 9.94 11.84 9.94 11.35C9.94 10.28 10.81 9.41 11.88 9.41H13.06C14.68 9.41 16 8.09 16 6.47C16 3.97 12.86 2 9 2Z"
        stroke={color} strokeWidth="1.3" fill="none" />
      <circle cx="5.5" cy="9" r="1" fill={color} />
      <circle cx="7" cy="5.5" r="1" fill={color} />
      <circle cx="11" cy="5" r="1" fill={color} />
    </svg>
  );
}

// ── Smile ──────────────────────────────────────────────────────────────────
export function SmileIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M6 10.5C6.5 12 7.5 13 9 13C10.5 13 11.5 12 12 10.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <circle cx="6.5" cy="7.5" r="0.9" fill={color} />
      <circle cx="11.5" cy="7.5" r="0.9" fill={color} />
    </svg>
  );
}

// ── Moon ───────────────────────────────────────────────────────────────────
export function MoonIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M14 11.5C13 13 11.1 14 9 14C5.69 14 3 11.31 3 8C3 5.9 4 4 5.5 3C4.5 4.2 4 5.5 4 7C4 10.31 6.69 13 10 13C11.5 13 12.8 12.5 14 11.5Z"
        stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── Flower ─────────────────────────────────────────────────────────────────
export function FlowerIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2" stroke={color} strokeWidth="1.3" fill="none" />
      <ellipse cx="9" cy="4.5" rx="1.5" ry="2.5" stroke={color} strokeWidth="1.2" fill="none" />
      <ellipse cx="9" cy="13.5" rx="1.5" ry="2.5" stroke={color} strokeWidth="1.2" fill="none" />
      <ellipse cx="4.5" cy="9" rx="2.5" ry="1.5" stroke={color} strokeWidth="1.2" fill="none" />
      <ellipse cx="13.5" cy="9" rx="2.5" ry="1.5" stroke={color} strokeWidth="1.2" fill="none" />
    </svg>
  );
}

// ── Doc (документ) ────────────────────────────────────────────────────────
export function DocIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M4 2h7l3 3v11H4z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M11 2v3h3" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <line x1="6" y1="9"  x2="12" y2="9"  stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="6" y1="12" x2="12" y2="12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="6" y1="15" x2="10" y2="15" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// ── Card (для подписки) ───────────────────────────────────────────────────
export function CardIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4" width="14" height="11" rx="1.5" stroke={color} strokeWidth="1.4" fill="none" />
      <line x1="2" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1.4" />
      <rect x="4" y="11" width="3" height="2" rx="0.3" fill={color} opacity="0.7" />
    </svg>
  );
}

// ── Info (i в кружке) ─────────────────────────────────────────────────────
export function InfoIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="1.4" fill="none" />
      <circle cx="9" cy="5.5" r="0.9" fill={color} />
      <line x1="9" y1="8" x2="9" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Message / Chat bubble ──────────────────────────────────────────────────
export function MessageIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M2 3C2 2.45 2.45 2 3 2H15C15.55 2 16 2.45 16 3V12C16 12.55 15.55 13 15 13H6L2 16V3Z"
        stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  ТЕМАТИЧЕСКИЕ ИКОНКИ ПЕРСОНАЖЕЙ (Задача 1)                             ║
// ║  24 переработанные иконки с конкретной символикой                      ║
// ╚════════════════════════════════════════════════════════════════════════╝

// ── Tesla: катушка с молниями ──────────────────────────────────────────────
export function CoilLightningsIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* База катушки */}
      <rect x="20" y="40" width="14" height="3" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Столбик-сердечник */}
      <line x1="27" y1="40" x2="27" y2="22" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Тор сверху (катушка) */}
      <ellipse cx="27" cy="20" rx="9" ry="4" stroke={color} strokeWidth="1.6" fill="none" />
      <ellipse cx="27" cy="20" rx="9" ry="4" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5"
        transform="translate(0, 1.5)" />
      {/* Молнии вокруг */}
      <path d="M10 14 L13 18 L11 19 L14 24" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
      <path d="M44 14 L41 18 L43 19 L40 24" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
      <path d="M9 32 L13 30 L11 33 L15 32" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.65" />
      <path d="M45 32 L41 30 L43 33 L39 32" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.65" />
      <path d="M27 7 L25 11 L29 11 L26 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
    </svg>
  );
}

// ── Mozart: скрипичный ключ + ноты ────────────────────────────────────────
export function TrebleNotesIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Скрипичный ключ */}
      <path d="M22 8 Q22 14 26 18 Q31 22 31 28 Q31 34 25 36 Q19 36 18 30 Q18 25 24 24 Q30 24 30 31 Q30 38 24 42 Q21 44 22 48"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="48" r="2" stroke={color} strokeWidth="1.4" fill={color} />
      {/* Нота 1 */}
      <ellipse cx="40" cy="34" rx="3" ry="2.2" fill={color} transform="rotate(-15 40 34)" />
      <line x1="42.5" y1="33" x2="42.5" y2="20" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M42.5 20 Q47 22 46 27" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Нота 2 */}
      <ellipse cx="38" cy="44" rx="2.5" ry="1.8" fill={color} opacity="0.7" transform="rotate(-15 38 44)" />
      <line x1="40" y1="43" x2="40" y2="36" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// ── Napoleon: торт «Наполеон» ─────────────────────────────────────────────
export function CakeNapoleonIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Тарелка */}
      <ellipse cx="27" cy="44" rx="20" ry="2.5" stroke={color} strokeWidth="1.4" fill="none" />
      {/* Слой 1 (нижний) */}
      <rect x="9" y="34" width="36" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Крем 1 (зигзаг) */}
      <path d="M11 34 L13 32 L15 34 L17 32 L19 34 L21 32 L23 34 L25 32 L27 34 L29 32 L31 34 L33 32 L35 34 L37 32 L39 34 L41 32 L43 34"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
      {/* Слой 2 (средний) */}
      <rect x="12" y="24" width="30" height="7" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Крем 2 */}
      <path d="M14 24 L16 22 L18 24 L20 22 L22 24 L24 22 L26 24 L28 22 L30 24 L32 22 L34 24 L36 22 L38 24 L40 22"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
      {/* Слой 3 (верхний) */}
      <rect x="16" y="15" width="22" height="6" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Ягодка-черешня */}
      <circle cx="27" cy="11" r="2.5" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M27 8 Q24 5 22 6" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── Alexander: меч ────────────────────────────────────────────────────────
export function GreatSwordIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Лезвие */}
      <path d="M27 5 L24 9 L24 36 L30 36 L30 9 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Долы (центральная линия) */}
      <line x1="27" y1="9" x2="27" y2="34" stroke={color} strokeWidth="1" opacity="0.5" />
      {/* Гарда (крестовина) */}
      <rect x="13" y="36" width="28" height="3" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Концы гарды (загнутые) */}
      <path d="M13 37.5 Q11 37.5 11 39.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M41 37.5 Q43 37.5 43 39.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Рукоять */}
      <rect x="25" y="39" width="4" height="9" rx="1" stroke={color} strokeWidth="1.4" fill="none" />
      {/* Узор на рукояти */}
      <line x1="25" y1="42" x2="29" y2="42" stroke={color} strokeWidth="1" opacity="0.6" />
      <line x1="25" y1="45" x2="29" y2="45" stroke={color} strokeWidth="1" opacity="0.6" />
      {/* Навершие (помеле) */}
      <circle cx="27" cy="50" r="2.2" stroke={color} strokeWidth="1.4" fill="none" />
    </svg>
  );
}

// ── Michelangelo: силуэт Давида ───────────────────────────────────────────
export function DavidStatueIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Голова */}
      <ellipse cx="27" cy="11" rx="4" ry="5" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Кудри */}
      <path d="M23 8 Q22 6 24 5" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M30 7 Q31 5 30 4" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Шея */}
      <line x1="26" y1="16" x2="26" y2="19" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="28" y1="16" x2="28" y2="19" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Торс (классическое тело с контрапостом) */}
      <path d="M19 19 Q17 25 19 33 Q21 38 25 39 L29 39 Q33 38 35 33 Q37 25 35 19 Z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Линия груди */}
      <path d="M22 24 Q27 26 32 24" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.55" />
      {/* Пресс */}
      <line x1="27" y1="28" x2="27" y2="36" stroke={color} strokeWidth="1" opacity="0.45" />
      {/* Постамент */}
      <rect x="14" y="42" width="26" height="5" rx="0.5" stroke={color} strokeWidth="1.4" fill="none" />
      <line x1="14" y1="47" x2="40" y2="47" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

// ── Churchill: сигара с дымом ─────────────────────────────────────────────
export function CigarSmokeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Сигара (горизонтальная под наклоном) */}
      <path d="M14 38 L36 28" stroke={color} strokeWidth="4" strokeLinecap="round" />
      {/* Кончик зажжённый */}
      <circle cx="37" cy="27.5" r="1.8" fill={color} opacity="0.8" />
      {/* Этикетка/полоска */}
      <line x1="22" y1="35" x2="24" y2="34" stroke="#000" strokeWidth="1" />
      <line x1="23" y1="35.5" x2="25" y2="34.5" stroke="#000" strokeWidth="1" />
      {/* Дым закрученный */}
      <path d="M37 26 Q40 20 36 16 Q33 12 37 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M41 23 Q44 18 41 12" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  );
}

// ── Shakespeare: перо + череп ─────────────────────────────────────────────
export function QuillSkullIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Череп */}
      <path d="M14 22 Q14 13 22 13 L23 13 Q31 13 31 22 L31 28 Q31 30 29 30 L26 30 L26 33 L24 33 L24 30 L21 30 L21 33 L19 33 L19 30 L16 30 Q14 30 14 28 Z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Глазницы */}
      <circle cx="19" cy="22" r="2" fill={color} opacity="0.9" />
      <circle cx="26" cy="22" r="2" fill={color} opacity="0.9" />
      {/* Носовая полость */}
      <path d="M22.5 25 L21.5 28 L23.5 28 Z" fill={color} opacity="0.6" />
      {/* Перо (диагональное справа) */}
      <path d="M50 8 L33 35" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Бородка пера */}
      <path d="M48 11 Q46 11 46 13 L41 21 Q40 21 40 23 L36 30 Q35 30 35 32"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M50 14 Q47 14 47 16 L42 24 Q40 24 40 26"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Кончик пера */}
      <path d="M33 35 L31 38" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ── Lincoln: цилиндр + борода ─────────────────────────────────────────────
export function TopHatBeardIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Цилиндр (тулья) */}
      <rect x="16" y="6" width="22" height="20" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Лента шляпы */}
      <rect x="16" y="22" width="22" height="3" fill={color} opacity="0.5" />
      {/* Поля шляпы */}
      <ellipse cx="27" cy="26" rx="16" ry="2" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Лоб (короткий силуэт лица) */}
      <path d="M22 28 Q22 31 24 32 L30 32 Q32 31 32 28" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* Глаза */}
      <circle cx="24" cy="30" r="0.8" fill={color} opacity="0.6" />
      <circle cx="30" cy="30" r="0.8" fill={color} opacity="0.6" />
      {/* Борода (треугольник) */}
      <path d="M21 33 L27 49 L33 33 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Текстура бороды */}
      <line x1="24" y1="37" x2="25" y2="42" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="27" y1="37" x2="27" y2="44" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="30" y1="37" x2="29" y2="42" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

// ── Franklin: долларовая купюра ───────────────────────────────────────────
export function DollarBillIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Купюра */}
      <rect x="6" y="14" width="42" height="26" rx="1.5" stroke={color} strokeWidth="1.6" fill="none" />
      {/* Внутренняя рамка */}
      <rect x="9" y="17" width="36" height="20" rx="0.5" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
      {/* Овальный портрет */}
      <ellipse cx="27" cy="27" rx="7" ry="8" stroke={color} strokeWidth="1.4" fill="none" />
      {/* Силуэт головы */}
      <circle cx="27" cy="25" r="2.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M23 32 Q27 30 31 32" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Знаки доллара по углам */}
      <path d="M11 22 L11 28 M9.5 23 Q9.5 22 11 22 L12.5 22 Q13.5 22 13.5 23.5 Q13.5 25 12.5 25 L11 25 Q9.5 25 9.5 26.5 Q9.5 28 11 28 L12.5 28 Q13.5 28 13.5 27"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M43 32 L43 38 M41.5 33 Q41.5 32 43 32 L44.5 32 Q45.5 32 45.5 33.5 Q45.5 35 44.5 35 L43 35 Q41.5 35 41.5 36.5 Q41.5 38 43 38 L44.5 38 Q45.5 38 45.5 37"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Цифра 100 в углу */}
      <path d="M37 19 L37 22 M40 19 L40 22 M43 19 L43 22" stroke={color} strokeWidth="1" opacity="0.55" />
    </svg>
  );
}

// ── Dostoevsky: топор Раскольникова ───────────────────────────────────────
export function AxeBloodIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Топорище (рукоять) */}
      <path d="M28 48 L28 22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Лезвие топора (полумесяц вправо) */}
      <path d="M28 8 L28 26 L40 22 Q44 14 36 7 Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Внутренний край лезвия */}
      <path d="M28 12 L34 11 Q38 14 38 18 L28 22"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Обух (расширение под лезвием на рукояти) */}
      <rect x="26" y="22" width="4" height="5" rx="0.5" stroke={color} strokeWidth="1.4" fill={color} opacity="0.85" />
      {/* Капля крови */}
      <path d="M40 26 Q39 30 41 32 Q43 30 42 26 Z" fill={color} opacity="0.85" />
    </svg>
  );
}

// ── Buddha: лотос с медитирующей фигурой ──────────────────────────────────
export function MeditationLotusIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Голова */}
      <circle cx="27" cy="14" r="3.5" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Ушнишь (выпуклость на голове) */}
      <circle cx="27" cy="10" r="1.2" fill={color} opacity="0.85" />
      {/* Тело-треугольник в позе лотоса */}
      <path d="M27 18 L19 32 L35 32 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Линия рук */}
      <path d="M22 28 Q27 25 32 28" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Лепестки лотоса под фигурой */}
      <path d="M19 32 Q14 36 12 38 Q14 34 19 32" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M35 32 Q40 36 42 38 Q40 34 35 32" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M22 33 Q19 39 18 42 Q22 38 22 33" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" opacity="0.85" />
      <path d="M32 33 Q35 39 36 42 Q32 38 32 33" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" opacity="0.85" />
      <path d="M27 33 Q25 40 27 44 Q29 40 27 33" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" opacity="0.7" />
    </svg>
  );
}

// ── Leonidas: спартанский щит с λ ─────────────────────────────────────────
export function SpartanShieldIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Внешний круг щита */}
      <circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.7" fill="none" />
      {/* Средний круг (умбон) */}
      <circle cx="27" cy="27" r="17" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
      {/* Заклёпки по краю */}
      <circle cx="27" cy="9" r="0.9" fill={color} opacity="0.7" />
      <circle cx="27" cy="45" r="0.9" fill={color} opacity="0.7" />
      <circle cx="9" cy="27" r="0.9" fill={color} opacity="0.7" />
      <circle cx="45" cy="27" r="0.9" fill={color} opacity="0.7" />
      <circle cx="14" cy="14" r="0.8" fill={color} opacity="0.6" />
      <circle cx="40" cy="14" r="0.8" fill={color} opacity="0.6" />
      <circle cx="14" cy="40" r="0.8" fill={color} opacity="0.6" />
      <circle cx="40" cy="40" r="0.8" fill={color} opacity="0.6" />
      {/* Лямбда λ — символ Лакедемона */}
      <path d="M19 17 L27 35 L35 17" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M23 28 L30 17" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Bulgakov: трамвай (Аннушка) ───────────────────────────────────────────
export function TramIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Корпус трамвая */}
      <path d="M8 38 L8 22 Q8 20 10 20 L44 20 Q46 20 46 22 L46 38 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Окна (3 квадрата) */}
      <rect x="11" y="24" width="8" height="7" rx="0.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <rect x="22" y="24" width="10" height="7" rx="0.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <rect x="35" y="24" width="8" height="7" rx="0.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      {/* Дверь по центру */}
      <line x1="27" y1="32" x2="27" y2="38" stroke={color} strokeWidth="1" opacity="0.5" />
      {/* Колёса */}
      <circle cx="15" cy="42" r="3" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="15" cy="42" r="1" fill={color} opacity="0.7" />
      <circle cx="39" cy="42" r="3" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="39" cy="42" r="1" fill={color} opacity="0.7" />
      {/* Штанга-токоприёмник */}
      <line x1="27" y1="20" x2="27" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="11" x2="20" y2="8" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="20" cy="8" r="1.2" fill={color} opacity="0.7" />
      {/* Передний фонарь */}
      <circle cx="44" cy="34" r="1.2" fill={color} opacity="0.85" />
    </svg>
  );
}

// ── Gogol: стилизованный нос ──────────────────────────────────────────────
export function GogolNoseIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Контур носа в профиль */}
      <path d="M18 8 Q22 14 24 22 Q26 30 22 38 Q20 41 24 43 Q28 42 31 38"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Ноздря */}
      <ellipse cx="26" cy="40" rx="2.5" ry="1.5" stroke={color} strokeWidth="1.3" fill="none" />
      {/* Воротник */}
      <path d="M14 46 L40 46" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 46 L18 49" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M40 46 L36 49" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Шляпа-цилиндр (намёк на личность) */}
      <rect x="20" y="3" width="10" height="6" rx="0.5" stroke={color} strokeWidth="1.3" fill="none" opacity="0.55" />
      <line x1="17" y1="9" x2="33" y2="9" stroke={color} strokeWidth="1.3" opacity="0.55" />
    </svg>
  );
}

// ── Genghis Khan: монгольский лук со стрелой ──────────────────────────────
export function MongolBowIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Лук — изогнутая дуга (составной монгольский) */}
      <path d="M14 8 Q8 15 12 22 Q14 27 12 32 Q8 39 14 46"
        stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Концы лука загнуты */}
      <path d="M14 8 L18 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 46 L18 48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Тетива натянута */}
      <path d="M14 8 L24 27 L14 46" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* Стрела (горизонтально) */}
      <line x1="24" y1="27" x2="46" y2="27" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Наконечник стрелы */}
      <path d="M44 24 L48 27 L44 30 Z" fill={color} />
      {/* Оперение */}
      <path d="M22 24 L26 27 L22 30" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── Marx: серп и молот ────────────────────────────────────────────────────
export function HammerSickleIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Серп (изогнутый клинок справа) */}
      <path d="M14 14 Q40 14 40 38" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Лезвие серпа (внутренний край заточен) */}
      <path d="M18 17 Q34 17 36 36" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.55" />
      {/* Рукоять серпа */}
      <line x1="14" y1="14" x2="10" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Молот — рукоять (диагональ слева вверху → справа внизу) */}
      <line x1="11" y1="40" x2="38" y2="13" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Молот — головка (прямоугольник на конце рукояти) */}
      <path d="M40 11 L46 17 L42 21 L36 15 Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={color} opacity="0.85" />
      {/* Звезда центральная */}
      <path d="M27 44 L28.5 47 L32 47 L29 49 L30 52 L27 50 L24 52 L25 49 L22 47 L25.5 47 Z"
        stroke={color} strokeWidth="1" strokeLinejoin="round" fill={color} opacity="0.55" />
    </svg>
  );
}

// ── Tolstoy: толстовка (рубаха-косоворотка) ───────────────────────────────
export function TolstovkaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Корпус рубахи (трапеция) */}
      <path d="M16 14 L16 46 L38 46 L38 14"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Воротник-стойка */}
      <path d="M22 14 L22 8 L32 8 L32 14" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Рукава */}
      <path d="M16 14 L9 18 L9 30 L13 32 L16 24" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M38 14 L45 18 L45 30 L41 32 L38 24" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Косая планка (характерная для косоворотки) — слева от центра */}
      <path d="M27 8 L23 26" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Пуговицы на планке */}
      <circle cx="25.5" cy="14" r="0.9" fill={color} />
      <circle cx="24.5" cy="20" r="0.9" fill={color} />
      {/* Пояс */}
      <rect x="14" y="34" width="26" height="3" stroke={color} strokeWidth="1.4" fill="none" />
      {/* Кисточки пояса */}
      <line x1="40" y1="36" x2="44" y2="40" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="42" y1="36" x2="46" y2="38" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// ── Kutuzov: бутылка коньяка ──────────────────────────────────────────────
export function CognacBottleIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Горлышко бутылки */}
      <rect x="24" y="6" width="6" height="10" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Пробка */}
      <rect x="23" y="3" width="8" height="4" rx="0.5" stroke={color} strokeWidth="1.4" fill={color} opacity="0.7" />
      {/* Плечи бутылки (переход к корпусу) */}
      <path d="M24 16 Q19 18 18 22 L18 44 Q18 47 21 47 L33 47 Q36 47 36 44 L36 22 Q35 18 30 16"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Этикетка */}
      <rect x="20" y="27" width="14" height="14" stroke={color} strokeWidth="1.3" fill="none" opacity="0.85" />
      {/* Текст «КК» (Кутузов Коньяк) */}
      <path d="M22.5 31 L22.5 37 M22.5 34 L25 31 M22.5 34 L25 37" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M27.5 31 L27.5 37 M27.5 34 L30 31 M27.5 34 L30 37" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      {/* Линия внутри этикетки */}
      <line x1="22" y1="38.5" x2="32" y2="38.5" stroke={color} strokeWidth="0.8" opacity="0.6" />
      {/* Звёзды наверху этикетки */}
      <circle cx="23" cy="29.5" r="0.7" fill={color} opacity="0.6" />
      <circle cx="27" cy="29.5" r="0.7" fill={color} opacity="0.6" />
      <circle cx="31" cy="29.5" r="0.7" fill={color} opacity="0.6" />
    </svg>
  );
}

// ── Rachmaninov: концертное пианино с поднятой крышкой ────────────────────
export function GrandPianoV2Icon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Корпус (крылообразная форма сверху) */}
      <path d="M8 30 Q8 18 24 18 L42 18 Q46 18 46 22 L46 36 Q46 40 42 40 L12 40 Q8 40 8 36 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Открытая крышка (диагональная линия наверх-вправо) */}
      <path d="M24 18 L20 6 L42 6 L46 22"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity="0.85" />
      {/* Подпорка крышки */}
      <line x1="34" y1="11" x2="34" y2="18" stroke={color} strokeWidth="1.2" opacity="0.6" />
      {/* Клавиатура */}
      <rect x="10" y="32" width="34" height="6" stroke={color} strokeWidth="1.3" fill="none" />
      {/* Чёрные клавиши */}
      <rect x="13" y="32" width="2" height="3.5" fill={color} opacity="0.85" />
      <rect x="17" y="32" width="2" height="3.5" fill={color} opacity="0.85" />
      <rect x="22" y="32" width="2" height="3.5" fill={color} opacity="0.85" />
      <rect x="26" y="32" width="2" height="3.5" fill={color} opacity="0.85" />
      <rect x="30" y="32" width="2" height="3.5" fill={color} opacity="0.85" />
      <rect x="35" y="32" width="2" height="3.5" fill={color} opacity="0.85" />
      <rect x="39" y="32" width="2" height="3.5" fill={color} opacity="0.85" />
      {/* Ножки */}
      <line x1="14" y1="40" x2="14" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="40" x2="40" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Solzhenitsyn: колючая проволока + столб ───────────────────────────────
export function BarbedWireV2Icon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Столб (силуэт лагерного столбика на горизонте) */}
      <line x1="44" y1="14" x2="44" y2="44" stroke={color} strokeWidth="1.4" opacity="0.6" />
      <line x1="42" y1="44" x2="46" y2="44" stroke={color} strokeWidth="1.2" opacity="0.6" />
      {/* Линия земли */}
      <line x1="2" y1="44" x2="52" y2="44" stroke={color} strokeWidth="1" opacity="0.4" />
      {/* Провод верхний */}
      <path d="M4 18 Q14 20 24 18 Q34 16 44 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Колючки на верхнем проводе (X-крестики) */}
      <path d="M10 15 L14 21 M14 15 L10 21" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22 14 L26 20 M26 14 L22 20" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M34 14 L38 20 M38 14 L34 20" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      {/* Провод нижний */}
      <path d="M4 30 Q14 32 24 30 Q34 28 44 30" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Колючки на нижнем проводе */}
      <path d="M10 27 L14 33 M14 27 L10 33" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22 26 L26 32 M26 26 L22 32" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M34 26 L38 32 M38 26 L34 32" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ── Turgenev: охотничья собака (пойнтер в стойке) ─────────────────────────
export function HuntingDogIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Тело */}
      <path d="M14 30 Q12 26 16 24 L34 24 Q40 24 42 28 L42 32 L36 32"
        stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Шея и голова */}
      <path d="M14 30 Q12 22 18 18 L26 18 Q24 22 22 24" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Морда */}
      <path d="M18 18 L13 17" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="13" cy="17" r="0.9" fill={color} />
      {/* Глаз */}
      <circle cx="20" cy="20" r="0.7" fill={color} />
      {/* Ухо опущено */}
      <path d="M22 18 Q24 22 22 26" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Передние ноги */}
      <line x1="18" y1="30" x2="18" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="30" x2="22" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Задние ноги */}
      <line x1="34" y1="32" x2="34" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="38" y1="32" x2="38" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Лапы */}
      <line x1="16" y1="42" x2="20" y2="42" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="20" y1="42" x2="24" y2="42" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="32" y1="42" x2="36" y2="42" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="36" y1="42" x2="40" y2="42" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Хвост-стрелка (горизонтально, как в стойке) */}
      <path d="M42 28 L48 26" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Ivan Grozny: стена Кремля с зубцами ───────────────────────────────────
export function KremlinWallIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Зубцы «ласточкин хвост» (М-образные) */}
      <path d="M6 22 L6 16 L9 16 L9 18 L12 18 L12 16 L15 16 L15 18 L18 18 L18 16 L21 16 L21 18 L24 18 L24 16 L27 16 L27 18 L30 18 L30 16 L33 16 L33 18 L36 18 L36 16 L39 16 L39 18 L42 18 L42 16 L45 16 L45 18 L48 18 L48 22"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Тело стены */}
      <rect x="6" y="22" width="42" height="22" stroke={color} strokeWidth="1.6" fill="none" />
      {/* Бойницы */}
      <rect x="11" y="28" width="3" height="5" rx="0.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      <rect x="20" y="28" width="3" height="5" rx="0.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      <rect x="29" y="28" width="3" height="5" rx="0.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      <rect x="38" y="28" width="3" height="5" rx="0.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      {/* Кладка (горизонтальные линии) */}
      <line x1="6" y1="36" x2="48" y2="36" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="6" y1="40" x2="48" y2="40" stroke={color} strokeWidth="0.8" opacity="0.4" />
      {/* Земля */}
      <line x1="3" y1="44" x2="51" y2="44" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

// ── Nicholas II: яйцо Фаберже ─────────────────────────────────────────────
export function FabergeEggIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Подставка */}
      <path d="M22 47 L32 47 L33 49 L21 49 Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" />
      <line x1="20" y1="49" x2="34" y2="49" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Яйцо (овал) */}
      <ellipse cx="27" cy="25" rx="13" ry="18" stroke={color} strokeWidth="1.6" fill="none" />
      {/* Горизонтальные пояски декора */}
      <path d="M14.5 19 Q27 17 39.5 19" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <path d="M14.5 25 Q27 23 39.5 25" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <path d="M15 31 Q27 33 39 31" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      {/* Ромбики декора */}
      <path d="M21 22 L23 24 L21 26 L19 24 Z" stroke={color} strokeWidth="1" fill={color} opacity="0.55" />
      <path d="M27 22 L29 24 L27 26 L25 24 Z" stroke={color} strokeWidth="1" fill={color} opacity="0.55" />
      <path d="M33 22 L35 24 L33 26 L31 24 Z" stroke={color} strokeWidth="1" fill={color} opacity="0.55" />
      <path d="M21 28 L23 30 L21 32 L19 30 Z" stroke={color} strokeWidth="1" fill={color} opacity="0.45" />
      <path d="M27 28 L29 30 L27 32 L25 30 Z" stroke={color} strokeWidth="1" fill={color} opacity="0.45" />
      <path d="M33 28 L35 30 L33 32 L31 30 Z" stroke={color} strokeWidth="1" fill={color} opacity="0.45" />
      {/* Маленькая корона на верхушке */}
      <path d="M24 9 L25 11 L27 9 L29 11 L30 9 L30 12 L24 12 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  УНИКАЛЬНЫЕ ИКОНКИ ДЛЯ КАСТОМНЫХ ПЕРСОНАЖЕЙ (Задача 3.3)               ║
// ║  20 иконок которые НЕ используются встроенными персонажами             ║
// ╚════════════════════════════════════════════════════════════════════════╝

// ── Robot: голова робота ──────────────────────────────────────────────────
export function RobotIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Антенна */}
      <line x1="27" y1="6" x2="27" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="27" cy="5" r="1.8" fill={color} />
      {/* Голова */}
      <rect x="13" y="11" width="28" height="24" rx="3" stroke={color} strokeWidth="1.6" fill="none" />
      {/* Глаза */}
      <circle cx="20" cy="20" r="3" stroke={color} strokeWidth="1.4" fill={color} opacity="0.85" />
      <circle cx="34" cy="20" r="3" stroke={color} strokeWidth="1.4" fill={color} opacity="0.85" />
      {/* Рот-сетка */}
      <rect x="19" y="27" width="16" height="4" rx="0.5" stroke={color} strokeWidth="1.2" fill="none" />
      <line x1="22" y1="27" x2="22" y2="31" stroke={color} strokeWidth="0.9" opacity="0.6" />
      <line x1="26" y1="27" x2="26" y2="31" stroke={color} strokeWidth="0.9" opacity="0.6" />
      <line x1="30" y1="27" x2="30" y2="31" stroke={color} strokeWidth="0.9" opacity="0.6" />
      {/* Шея и грудь */}
      <rect x="22" y="35" width="10" height="3" stroke={color} strokeWidth="1.3" fill="none" />
      <path d="M16 38 L38 38 L40 47 L14 47 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <circle cx="27" cy="42" r="1.5" fill={color} opacity="0.8" />
    </svg>
  );
}

// ── Alien: голова инопланетянина ──────────────────────────────────────────
export function AlienIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Голова (овал, удлинённый книзу) */}
      <path d="M27 7 Q14 8 13 22 Q13 32 19 38 Q22 42 27 47 Q32 42 35 38 Q41 32 41 22 Q40 8 27 7 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Большие миндалевидные глаза */}
      <path d="M14 22 Q18 18 24 22 Q22 28 18 28 Q14 28 14 22 Z" fill={color} opacity="0.9" />
      <path d="M40 22 Q36 18 30 22 Q32 28 36 28 Q40 28 40 22 Z" fill={color} opacity="0.9" />
      {/* Блик в глазах */}
      <circle cx="20" cy="22" r="0.9" fill="#000" opacity="0.7" />
      <circle cx="34" cy="22" r="0.9" fill="#000" opacity="0.7" />
      {/* Маленький рот-щель */}
      <line x1="24" y1="38" x2="30" y2="38" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ── MaskFace: нейтральная маска ───────────────────────────────────────────
export function MaskFaceIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Контур маски */}
      <path d="M14 18 Q14 8 27 8 Q40 8 40 18 L40 32 Q40 42 32 46 Q27 48 22 46 Q14 42 14 32 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Глаза-прорези */}
      <path d="M20 22 Q23 20 26 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M28 22 Q31 20 34 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Нос */}
      <path d="M27 26 L25 32 L29 32 Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" opacity="0.7" />
      {/* Декоративная линия лба */}
      <path d="M18 14 Q27 12 36 14" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Завязки */}
      <path d="M14 24 Q10 24 8 28" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M40 24 Q44 24 46 28" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── Lock: замочек ─────────────────────────────────────────────────────────
export function LockIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Дужка */}
      <path d="M17 26 L17 18 Q17 9 27 9 Q37 9 37 18 L37 26"
        stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Корпус */}
      <rect x="12" y="26" width="30" height="22" rx="3" stroke={color} strokeWidth="1.7" fill="none" />
      {/* Замочная скважина */}
      <circle cx="27" cy="34" r="2.5" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M27 36 L26 42 L28 42 Z" fill={color} opacity="0.85" />
      {/* Декор-точки на корпусе */}
      <circle cx="16" cy="44" r="0.9" fill={color} opacity="0.5" />
      <circle cx="38" cy="44" r="0.9" fill={color} opacity="0.5" />
    </svg>
  );
}

// ── HeartFull: сплошное сердце ────────────────────────────────────────────
export function HeartFullIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 46 Q12 36 8 23 Q6 13 14 11 Q22 9 27 18 Q32 9 40 11 Q48 13 46 23 Q42 36 27 46 Z"
        stroke={color} strokeWidth="1.7" strokeLinejoin="round" fill={color} opacity="0.9" />
      {/* Блик */}
      <path d="M16 17 Q14 21 17 25" stroke="#000" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" fill="none" />
    </svg>
  );
}

// ── Star8: 8-конечная звезда ──────────────────────────────────────────────
export function Star8Icon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 6 L30 22 L46 19 L33 30 L46 41 L30 38 L27 54 L24 38 L8 41 L21 30 L8 19 L24 22 Z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} opacity="0.85" />
      <circle cx="27" cy="30" r="3" fill="#000" opacity="0.4" />
    </svg>
  );
}

// ── MoonStar: луна со звездой ─────────────────────────────────────────────
export function MoonStarIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Полумесяц */}
      <path d="M36 40 Q24 40 18 32 Q12 24 18 14 Q24 6 36 8 Q26 12 24 24 Q26 36 36 40 Z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} opacity="0.85" />
      {/* Звёздочка справа сверху */}
      <path d="M44 14 L45.3 17.5 L49 18 L46 20.5 L47 24 L44 22 L41 24 L42 20.5 L39 18 L42.7 17.5 Z"
        stroke={color} strokeWidth="0.9" strokeLinejoin="round" fill={color} opacity="0.85" />
      {/* Маленькая звёздочка снизу справа */}
      <path d="M46 36 L46.7 38 L48.5 38 L47 39.3 L47.5 41 L46 40 L44.5 41 L45 39.3 L43.5 38 L45.3 38 Z"
        stroke={color} strokeWidth="0.8" strokeLinejoin="round" fill={color} opacity="0.6" />
    </svg>
  );
}

// ── ElectricGuitar: электрогитара ─────────────────────────────────────────
export function ElectricGuitarIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Корпус (форма stratocaster под наклоном) */}
      <path d="M14 38 Q10 32 14 28 L20 22 Q23 20 26 22 L30 26 L24 32 Q22 36 24 40 Q22 44 18 42 Q14 42 14 38 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Дека/звукосниматели */}
      <rect x="19" y="29" width="6" height="3" stroke={color} strokeWidth="1.2" fill={color} opacity="0.7" transform="rotate(-30 22 30.5)" />
      {/* Гриф */}
      <path d="M30 26 L46 10" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      {/* Лады */}
      <line x1="34" y1="22" x2="36" y2="24" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <line x1="38" y1="18" x2="40" y2="20" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <line x1="42" y1="14" x2="44" y2="16" stroke={color} strokeWidth="0.8" opacity="0.5" />
      {/* Головка грифа */}
      <path d="M46 10 L51 9 L50 5 L46 8 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      {/* Колки */}
      <circle cx="48" cy="7" r="0.8" fill={color} opacity="0.7" />
      <circle cx="50" cy="6" r="0.8" fill={color} opacity="0.7" />
    </svg>
  );
}

// ── WolfHowl: воющий волк ─────────────────────────────────────────────────
export function WolfHowlIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Голова волка в профиль (запрокинута для воя) */}
      <path d="M14 30 Q10 22 14 18 L18 12 Q20 8 24 10 L28 14 Q32 18 30 24 L26 28 L22 32 L16 32 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Уши торчат */}
      <path d="M22 12 L21 6 L25 11 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M27 14 L29 8 L31 14 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      {/* Глаз */}
      <circle cx="24" cy="20" r="1" fill={color} />
      {/* Морда (открытая пасть для воя) */}
      <path d="M14 18 L8 16" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 19 L16 22" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
      {/* Шея/грудь */}
      <path d="M22 32 L24 42 L34 44 L36 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Луна на фоне (стилизованно) */}
      <circle cx="42" cy="20" r="6" stroke={color} strokeWidth="1.3" fill="none" opacity="0.55" />
      <path d="M42 16 Q38 18 38 22 Q38 26 42 26 Q40 22 42 16 Z" fill={color} opacity="0.4" />
    </svg>
  );
}

// ── Dragon: голова дракона ────────────────────────────────────────────────
export function DragonIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Голова треугольная */}
      <path d="M8 36 L8 28 Q10 22 16 22 L36 22 Q42 22 46 26 L48 36 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Рога */}
      <path d="M14 22 L11 12 L17 18" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M30 22 L33 10 L37 18" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Глаз */}
      <circle cx="22" cy="29" r="1.6" fill={color} opacity="0.85" />
      <circle cx="22" cy="29" r="0.6" fill="#000" />
      {/* Ноздря */}
      <circle cx="44" cy="30" r="0.9" fill={color} opacity="0.7" />
      {/* Зубы */}
      <path d="M16 36 L18 40 L20 36 L22 40 L24 36 L26 40 L28 36 L30 40 L32 36 L34 40 L36 36"
        stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" />
      {/* Пламя */}
      <path d="M48 32 Q52 32 51 36 Q53 38 50 40 Q48 38 47 40"
        stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill={color} opacity="0.55" />
      {/* Чешуя на лбу */}
      <circle cx="24" cy="24" r="0.7" fill={color} opacity="0.5" />
      <circle cx="30" cy="24" r="0.7" fill={color} opacity="0.5" />
    </svg>
  );
}

// ── EyeRunes: глаз с рунами ───────────────────────────────────────────────
export function EyeRunesIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Контур глаза */}
      <path d="M6 27 Q16 14 27 14 Q38 14 48 27 Q38 40 27 40 Q16 40 6 27 Z"
        stroke={color} strokeWidth="1.7" strokeLinejoin="round" fill="none" />
      {/* Радужка */}
      <circle cx="27" cy="27" r="7" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Зрачок */}
      <circle cx="27" cy="27" r="3" fill={color} opacity="0.85" />
      {/* Блик */}
      <circle cx="25" cy="25" r="1" fill="#fff" opacity="0.9" />
      {/* Руны вокруг */}
      <path d="M9 8 L11 12 L13 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M27 4 L27 8 M25 6 L29 6" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
      <path d="M45 8 L41 8 L41 12 L45 12" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M9 46 L13 46 L11 50 L13 50" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M27 50 L29 46 L25 46 Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" opacity="0.7" />
      <path d="M45 46 L43 50 L41 46 L39 50" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

// ── Phoenix: силуэт феникса ───────────────────────────────────────────────
export function PhoenixIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Тело */}
      <path d="M27 12 Q22 14 22 22 Q22 30 27 36 Q32 30 32 22 Q32 14 27 12 Z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} opacity="0.4" />
      {/* Голова и клюв */}
      <circle cx="27" cy="11" r="2.5" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M27 8 L27 5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Крылья распахнуты */}
      <path d="M22 18 Q12 16 6 24 Q12 22 18 26 Q14 30 8 32 Q14 32 22 28"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M32 18 Q42 16 48 24 Q42 22 36 26 Q40 30 46 32 Q40 32 32 28"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Хвост-перья */}
      <path d="M27 36 L24 50" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 36 L27 50" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 36 L30 50" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 36 L20 47" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
      <path d="M27 36 L34 47" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// ── Kitsune: лиса с тремя хвостами ────────────────────────────────────────
export function KitsuneIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Голова лисы (треугольник) */}
      <path d="M16 30 L20 12 L34 12 L38 30 Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Уши */}
      <path d="M20 12 L18 4 L24 10 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M30 10 L36 4 L34 12 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      {/* Внутренние уши */}
      <path d="M20 7 L21 10" stroke={color} strokeWidth="1" opacity="0.6" />
      <path d="M34 7 L33 10" stroke={color} strokeWidth="1" opacity="0.6" />
      {/* Глаза-щёлочки */}
      <path d="M22 22 L25 24" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M29 24 L32 22" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Нос */}
      <path d="M26 28 L28 28 L27 30 Z" fill={color} />
      {/* Три хвоста снизу */}
      <path d="M16 30 Q10 36 8 44 Q12 42 14 38" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M22 32 Q22 40 20 48 Q24 44 24 38" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M32 32 Q32 40 34 48 Q30 44 30 38" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M38 30 Q44 36 46 44 Q42 42 40 38" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── SkullCrossbones: череп с костями ──────────────────────────────────────
export function SkullCrossbonesIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Кости (X сзади) */}
      <path d="M10 38 L44 8 M44 38 L10 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      {/* Концы костей (косточки на концах X) */}
      <circle cx="9" cy="8" r="2.5" stroke={color} strokeWidth="1.4" fill="none" opacity="0.55" />
      <circle cx="45" cy="8" r="2.5" stroke={color} strokeWidth="1.4" fill="none" opacity="0.55" />
      <circle cx="9" cy="38" r="2.5" stroke={color} strokeWidth="1.4" fill="none" opacity="0.55" />
      <circle cx="45" cy="38" r="2.5" stroke={color} strokeWidth="1.4" fill="none" opacity="0.55" />
      {/* Череп */}
      <path d="M14 22 Q14 12 27 12 Q40 12 40 22 L40 30 Q40 33 37 33 L34 33 L34 38 L31 38 L31 33 L23 33 L23 38 L20 38 L20 33 L17 33 Q14 33 14 30 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={color} opacity="0.85" />
      {/* Глазницы */}
      <circle cx="21" cy="22" r="2.5" fill="#000" />
      <circle cx="33" cy="22" r="2.5" fill="#000" />
      {/* Нос */}
      <path d="M27 25 L25.5 30 L28.5 30 Z" fill="#000" />
      {/* Зубы */}
      <line x1="23" y1="33" x2="23" y2="38" stroke="#000" strokeWidth="0.8" />
      <line x1="27" y1="33" x2="27" y2="38" stroke="#000" strokeWidth="0.8" />
      <line x1="31" y1="33" x2="31" y2="38" stroke="#000" strokeWidth="0.8" />
    </svg>
  );
}

// ── Octopus: осьминог ─────────────────────────────────────────────────────
export function OctopusIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Голова */}
      <ellipse cx="27" cy="20" rx="13" ry="11" stroke={color} strokeWidth="1.6" fill="none" />
      {/* Глаза */}
      <circle cx="22" cy="19" r="2.2" fill={color} opacity="0.9" />
      <circle cx="32" cy="19" r="2.2" fill={color} opacity="0.9" />
      <circle cx="22" cy="19" r="0.8" fill="#000" />
      <circle cx="32" cy="19" r="0.8" fill="#000" />
      {/* Улыбка */}
      <path d="M24 24 Q27 26 30 24" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Щупальца */}
      <path d="M16 28 Q12 36 8 38 Q12 40 14 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M20 30 Q18 40 14 46" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M24 31 Q24 42 22 48" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M30 31 Q30 42 32 48" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M34 30 Q36 40 40 46" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M38 28 Q42 36 46 38 Q42 40 40 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── Crystal: кристалл ─────────────────────────────────────────────────────
export function CrystalIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Грани кристалла */}
      <path d="M27 6 L13 22 L20 48 L34 48 L41 22 Z"
        stroke={color} strokeWidth="1.7" strokeLinejoin="round" fill="none" />
      {/* Внутренние грани */}
      <path d="M27 6 L20 22 L27 48" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" opacity="0.65" />
      <path d="M27 6 L34 22 L27 48" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" opacity="0.65" />
      <line x1="13" y1="22" x2="41" y2="22" stroke={color} strokeWidth="1.3" opacity="0.65" />
      {/* Блики */}
      <path d="M25 12 L23 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
      <path d="M30 30 L30 40" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ── BookSpell: магическая книга ───────────────────────────────────────────
export function BookSpellIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Корешок */}
      <line x1="27" y1="14" x2="27" y2="44" stroke={color} strokeWidth="1.5" />
      {/* Левая страница */}
      <path d="M27 14 Q15 12 8 16 L8 42 Q15 38 27 40 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Правая страница */}
      <path d="M27 14 Q39 12 46 16 L46 42 Q39 38 27 40 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      {/* Текст слева (волнистые линии) */}
      <path d="M12 22 Q15 21 18 22" stroke={color} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M12 26 Q17 25 22 26" stroke={color} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M12 30 Q15 29 18 30" stroke={color} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.55" />
      {/* Пентаграмма справа */}
      <path d="M37 22 L40 30 L33 25 L41 25 L34 30 Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" />
      {/* Звёздочки магии */}
      <path d="M22 8 L23 10 L25 11 L23 12 L22 14 L21 12 L19 11 L21 10 Z" fill={color} opacity="0.7" />
      <path d="M40 8 L40.7 9.5 L42 10 L40.7 10.5 L40 12 L39.3 10.5 L38 10 L39.3 9.5 Z" fill={color} opacity="0.55" />
    </svg>
  );
}

// ── RoseDark: тёмная роза ─────────────────────────────────────────────────
export function RoseDarkIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Бутон (концентрические завитки) */}
      <circle cx="27" cy="20" r="10" stroke={color} strokeWidth="1.6" fill={color} opacity="0.45" />
      <path d="M27 12 Q22 12 22 18 Q22 24 28 22 Q32 22 30 16 Q26 14 23 18"
        stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M27 18 Q24 18 25 22 Q28 24 30 20"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* Шипы на стебле */}
      <path d="M27 30 L27 50" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M27 36 L24 34" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M27 42 L30 41" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Листья */}
      <path d="M27 38 Q22 38 19 42 Q22 44 27 41" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M27 44 Q32 44 35 48 Q32 50 27 47" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      {/* Центральная жилка листа */}
      <path d="M22 41 L26 41" stroke={color} strokeWidth="0.9" opacity="0.6" />
      <path d="M32 47 L28 47" stroke={color} strokeWidth="0.9" opacity="0.6" />
    </svg>
  );
}

// ── WingedHeart: сердце с крыльями ────────────────────────────────────────
export function WingedHeartIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Сердце по центру */}
      <path d="M27 42 Q19 36 17 28 Q16 22 22 21 Q26 20 27 25 Q28 20 32 21 Q38 22 37 28 Q35 36 27 42 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={color} opacity="0.85" />
      {/* Левое крыло */}
      <path d="M17 28 Q8 24 4 28 Q10 28 12 32 Q6 30 4 34 Q12 32 16 30"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Правое крыло */}
      <path d="M37 28 Q46 24 50 28 Q44 28 42 32 Q48 30 50 34 Q42 32 38 30"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Перья на крыльях */}
      <path d="M9 26 L11 28" stroke={color} strokeWidth="1" opacity="0.6" />
      <path d="M45 26 L43 28" stroke={color} strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

// ── CompassMagic: магический компас ───────────────────────────────────────
export function CompassMagicIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Внешний круг */}
      <circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.7" fill="none" />
      {/* Внутренний круг */}
      <circle cx="27" cy="27" r="14" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      {/* Стрелка-роза ветров (4 луча в звезду) */}
      <path d="M27 11 L30 27 L27 24 L24 27 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill={color} opacity="0.85" />
      <path d="M27 43 L24 27 L27 30 L30 27 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M11 27 L27 24 L24 27 L27 30 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M43 27 L27 30 L30 27 L27 24 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      {/* Центральная точка */}
      <circle cx="27" cy="27" r="1.5" fill={color} />
      {/* Метки сторон света */}
      <path d="M27 5 L26 8 L28 8 Z" fill={color} opacity="0.7" />
      <path d="M27 49 L28 46 L26 46 Z" fill={color} opacity="0.55" />
      {/* Мини-звёздочки магии вокруг */}
      <path d="M44 10 L44.5 11.5 L46 12 L44.5 12.5 L44 14 L43.5 12.5 L42 12 L43.5 11.5 Z" fill={color} opacity="0.6" />
      <path d="M10 44 L10.5 45.5 L12 46 L10.5 46.5 L10 48 L9.5 46.5 L8 46 L9.5 45.5 Z" fill={color} opacity="0.6" />
    </svg>
  );
}

// ── Lomonosov: силуэт МГУ (главное здание) ────────────────────────────────
export function MGUTowerIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      {/* Звезда на шпиле */}
      <path d="M27 4 L27.7 5.5 L29.3 5.7 L28.1 6.8 L28.5 8.4 L27 7.5 L25.5 8.4 L25.9 6.8 L24.7 5.7 L26.3 5.5 Z"
        stroke={color} strokeWidth="0.9" strokeLinejoin="round" fill={color} opacity="0.9" />
      {/* Шпиль */}
      <line x1="27" y1="9" x2="27" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Верхушка центральной башни (трапеция) */}
      <path d="M23 14 L31 14 L29 18 L25 18 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      {/* Центральная башня */}
      <rect x="22" y="18" width="10" height="20" stroke={color} strokeWidth="1.6" fill="none" />
      {/* Окна центральной башни */}
      <line x1="24" y1="22" x2="30" y2="22" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <line x1="24" y1="26" x2="30" y2="26" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <line x1="24" y1="30" x2="30" y2="30" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <line x1="27" y1="18" x2="27" y2="38" stroke={color} strokeWidth="0.8" opacity="0.4" />
      {/* Левое крыло */}
      <rect x="9" y="28" width="13" height="14" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Маленькая башенка слева */}
      <path d="M11 28 L13 24 L15 28 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" fill="none" />
      {/* Правое крыло */}
      <rect x="32" y="28" width="13" height="14" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Маленькая башенка справа */}
      <path d="M39 28 L41 24 L43 28 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" fill="none" />
      {/* Окна на крыльях */}
      <line x1="11" y1="33" x2="20" y2="33" stroke={color} strokeWidth="0.7" opacity="0.45" />
      <line x1="11" y1="37" x2="20" y2="37" stroke={color} strokeWidth="0.7" opacity="0.45" />
      <line x1="34" y1="33" x2="43" y2="33" stroke={color} strokeWidth="0.7" opacity="0.45" />
      <line x1="34" y1="37" x2="43" y2="37" stroke={color} strokeWidth="0.7" opacity="0.45" />
      {/* Земля */}
      <line x1="6" y1="42" x2="48" y2="42" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}
