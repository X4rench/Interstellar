import React from 'react';
import { Image, View } from 'react-native';
import Svg, {
  Circle, Path, Line, Rect, Ellipse,
} from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const LOGO_SRC = require('./logo.png');
const LOGO_ASPECT = 313 / 158;

export function LogoImage({ size = 72, bg = 'transparent' }: { size?: number; bg?: string }) {
  return (
    <View
      style={{
        height: size,
        width: size * LOGO_ASPECT,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={LOGO_SRC}
        style={{ height: size, width: size * LOGO_ASPECT }}
        resizeMode="contain"
      />
    </View>
  );
}

export function LogoImageSmall({ size = 30 }: { size?: number }) {
  return <LogoImage size={size} />;
}

// ── Brain (Freud) ──────────────────────────────────────────────────────────
export function BrainIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path
        d="M27 13 Q17 11 13 19 Q7 21 7 29 Q7 39 15 41 Q13 49 21 49 Q25 53 27 49"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M27 13 Q37 11 41 19 Q47 21 47 29 Q47 39 39 41 Q41 49 33 49 Q29 53 27 49"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path d="M21 23 Q18 29 21 35" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
      <Path d="M33 23 Q36 29 33 35" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
      <Path d="M16 38 Q27 44 38 38" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
    </Svg>
  );
}

// ── Spiral (Naruto) ────────────────────────────────────────────────────────
export function SpiralIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path
        d="M27 27 Q27 23 31 23 Q35 23 35 27 Q35 33 29 33 Q21 33 21 25 Q21 15 29 13 Q39 11 43 21 Q47 33 39 41 Q29 49 19 45 Q9 39 9 27 Q9 13 21 8 Q31 4 39 10"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Sword (Arya) ───────────────────────────────────────────────────────────
export function SwordIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="5"  x2="27" y2="42" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <Path d="M23 9 L27 5 L31 9"           stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="19" y1="38" x2="35" y2="38" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="27" y1="42" x2="27" y2="49" stroke={color} strokeWidth="3"   strokeLinecap="round" opacity="0.8" />
      <Circle cx="27" cy="51" r="2.5"        stroke={color} strokeWidth="1.4" fill="none" />
    </Svg>
  );
}

// ── Atom (Einstein) ────────────────────────────────────────────────────────
export function AtomIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="3.5" fill={color} />
      <Ellipse cx="27" cy="27" rx="23" ry="7.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Ellipse cx="27" cy="27" rx="23" ry="7.5" stroke={color} strokeWidth="1.5" fill="none"
        transform="rotate(60 27 27)" />
      <Ellipse cx="27" cy="27" rx="23" ry="7.5" stroke={color} strokeWidth="1.5" fill="none"
        transform="rotate(120 27 27)" />
    </Svg>
  );
}

// ── Headphones (Miku) ──────────────────────────────────────────────────────
export function HeadphonesIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M9 27 Q9 11 27 11 Q45 11 45 27" stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <Rect x="5"  y="25" width="10" height="14" rx="3.5" stroke={color} strokeWidth="1.6" fill="none" />
      <Rect x="39" y="25" width="10" height="14" rx="3.5" stroke={color} strokeWidth="1.6" fill="none" />
    </Svg>
  );
}

// ── Lightning (Eleven) ─────────────────────────────────────────────────────
export function LightningIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path
        d="M34 5 L17 28 L27 28 L20 49 L43 23 L31 23 Z"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinejoin="round" strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Crown (Cleopatra) ──────────────────────────────────────────────────────
export function CrownIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path
        d="M9 36 L9 19 L18 27 L27 9 L36 27 L45 19 L45 36 Z"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinejoin="round" strokeLinecap="round"
      />
      <Line x1="5"  y1="36" x2="49" y2="36" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <Circle cx="15" cy="33.5" r="1.5" fill={color} opacity="0.7" />
      <Circle cx="27" cy="33.5" r="1.5" fill={color} opacity="0.7" />
      <Circle cx="39" cy="33.5" r="1.5" fill={color} opacity="0.7" />
    </Svg>
  );
}

// ── Vinci (Da Vinci — Vitruvian man) ──────────────────────────────────────
export function VinciIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="21" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="13" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="27" y1="16" x2="27" y2="33" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Line x1="9"  y1="23" x2="45" y2="23" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Line x1="27" y1="33" x2="15" y2="46" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Line x1="27" y1="33" x2="39" y2="46" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

// ── Chisel (Michelangelo — hammer & chisel) ────────────────────────────────
export function ChiselIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="14" y1="40" x2="38" y2="16" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Path d="M38 16 L46 8 L48 16 L40 18 Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Path d="M10 44 L14 40 L20 44" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="8"  y1="26" x2="13" y2="26" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <Line x1="11" y1="22" x2="15" y2="18" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}

// ── Quill (Shakespeare — feather pen) ─────────────────────────────────────
export function QuillIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M42 7 Q34 14 24 44" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M42 7 Q50 18 30 36" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6" />
      <Path d="M36 13 Q28 22 26 34" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.45" />
      <Line x1="24" y1="44" x2="21" y2="50" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Line x1="12" y1="48" x2="22" y2="48" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
    </Svg>
  );
}

// ── DNA (Darwin — double helix) ────────────────────────────────────────────
export function DnaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M18 7 Q14 17 18 27 Q22 37 18 47" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Path d="M36 7 Q40 17 36 27 Q32 37 36 47" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Line x1="18" y1="13" x2="36" y2="13" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <Line x1="17" y1="21" x2="37" y2="21" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <Line x1="18" y1="27" x2="36" y2="27" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <Line x1="17" y1="33" x2="37" y2="33" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <Line x1="18" y1="41" x2="36" y2="41" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
    </Svg>
  );
}

// ── Apple (Newton — falling apple) ────────────────────────────────────────
export function AppleIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 18 Q15 17 13 29 Q11 39 18 45 Q22 49 27 45 Q32 49 36 45 Q43 39 41 29 Q39 17 27 18 Z"
        stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="27" y1="10" x2="27" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M27 10 Q32 8 34 11" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Path d="M37 28 Q44 34 42 44" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round"
        strokeDasharray="2,3" opacity="0.55" />
    </Svg>
  );
}

// ── Coil (Tesla — Tesla coil) ──────────────────────────────────────────────
export function CoilIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="44" rx="14" ry="4" stroke={color} strokeWidth="1.4" fill="none" />
      <Path d="M13 44 Q13 38 27 36 Q41 34 41 28 Q41 22 27 22 Q13 22 13 32"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M27 22 L23 14 L28 14 L23 6"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="23" y1="6" x2="16" y2="4" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
      <Line x1="23" y1="6" x2="19" y2="2" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}

// ── Victory (Churchill — V sign) ───────────────────────────────────────────
export function VictoryIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M20 38 Q18 46 27 48 Q36 46 34 38" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M22 38 Q20 26 21 15 Q22 9 25 9 Q28 9 27 16 Q26 24 26 38"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M28 38 Q29 22 31 13 Q33 7 36 8 Q39 9 38 16 Q37 26 34 38"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// ── TopHat (Lincoln — stovepipe hat) ──────────────────────────────────────
export function TopHatIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="40" rx="19" ry="4.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="15" y="13" width="24" height="27" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="15" y1="35" x2="39" y2="35" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
    </Svg>
  );
}

// ── Dialogue (Socrates — question mark) ───────────────────────────────────
export function DialogueIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="21" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M21 22 Q21 15 27 15 Q33 15 33 21 Q33 26 27 28 L27 33"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="27" cy="38" r="1.8" fill={color} />
    </Svg>
  );
}

// ── Scroll (Aristotle — papyrus scroll) ───────────────────────────────────
export function ScrollIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="10" y="16" width="34" height="22" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Ellipse cx="27" cy="16" rx="17" ry="4.5" stroke={color} strokeWidth="1.4" fill="none" />
      <Ellipse cx="27" cy="38" rx="17" ry="4.5" stroke={color} strokeWidth="1.4" fill="none" />
      <Line x1="17" y1="23" x2="37" y2="23" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <Line x1="17" y1="27" x2="37" y2="27" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <Line x1="17" y1="31" x2="29" y2="31" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

// ── Cave (Plato — allegory of the cave) ───────────────────────────────────
export function CaveIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M7 47 Q7 12 27 9 Q47 12 47 47"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Line x1="27" y1="9" x2="16" y2="43" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
      <Line x1="27" y1="9" x2="27" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <Line x1="27" y1="9" x2="38" y2="43" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
      <Circle cx="27" cy="40" r="4" stroke={color} strokeWidth="1.3" fill="none" opacity="0.8" />
    </Svg>
  );
}

// ── YinYang (Confucius — harmony) ─────────────────────────────────────────
export function YinYangIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="21" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M27 6 Q37 6 37 17 Q37 27 27 27 Q17 27 17 38 Q17 48 27 48"
        stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="17" r="4"  stroke={color} strokeWidth="1.2" fill="none" />
      <Circle cx="27" cy="38" r="4"  fill={color} opacity="0.85" />
    </Svg>
  );
}

// ── Wheel (Columbus — ship's wheel) ───────────────────────────────────────
export function WheelIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="21" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="27" r="5"  stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="27" y1="6"  x2="27" y2="22" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="27" y1="32" x2="27" y2="48" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="6"  y1="27" x2="22" y2="27" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="32" y1="27" x2="48" y2="27" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="12" y1="12" x2="23" y2="23" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="31" y1="31" x2="42" y2="42" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="42" y1="12" x2="31" y2="23" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="23" y1="31" x2="12" y2="42" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

// ── Treble (Mozart — treble clef) ─────────────────────────────────────────
export function TrebleIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="11" y1="21" x2="43" y2="21" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <Line x1="11" y1="27" x2="43" y2="27" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <Line x1="11" y1="33" x2="43" y2="33" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <Line x1="11" y1="39" x2="43" y2="39" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <Path d="M27 49 Q20 47 20 39 Q20 31 27 28 Q35 25 35 17 Q35 9 27 7 Q21 7 19 13 Q17 19 23 22 Q27 24 27 28"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M27 49 Q34 49 34 42 Q34 36 27 36"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// ── Piano (Beethoven — piano keys) ────────────────────────────────────────
export function PianoIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="5"  y="18" width="44" height="26" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="11" y1="18" x2="11" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <Line x1="17" y1="18" x2="17" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <Line x1="23" y1="18" x2="23" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <Line x1="29" y1="18" x2="29" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <Line x1="35" y1="18" x2="35" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <Line x1="41" y1="18" x2="41" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <Rect x="8"  y="18" width="6"  height="15" rx="1" fill={color} opacity="0.85" />
      <Rect x="20" y="18" width="6"  height="15" rx="1" fill={color} opacity="0.85" />
      <Rect x="32" y="18" width="6"  height="15" rx="1" fill={color} opacity="0.85" />
      <Rect x="38" y="18" width="6"  height="15" rx="1" fill={color} opacity="0.85" />
    </Svg>
  );
}

// ── Snowflake (Andersen — snow queen) ─────────────────────────────────────
export function SnowflakeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="5"  x2="27" y2="49" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="5"  y1="27" x2="49" y2="27" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="11" y1="11" x2="43" y2="43" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="43" y1="11" x2="11" y2="43" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="22" y1="13" x2="27" y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="32" y1="13" x2="27" y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="22" y1="41" x2="27" y2="36" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="32" y1="41" x2="27" y2="36" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Circle cx="27" cy="27" r="3" fill={color} />
    </Svg>
  );
}

// ── Raven (Poe — nevermore) ────────────────────────────────────────────────
export function RavenIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M28 22 Q18 22 15 31 Q12 40 18 45 Q24 49 30 45 Q38 41 38 32 Q38 22 28 22 Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <Circle cx="36" cy="17" r="6"   stroke={color} strokeWidth="1.4" fill="none" />
      <Circle cx="38" cy="15" r="1.2" fill={color} />
      <Path d="M42 17 L48 19 L42 21" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20 26 Q14 20 10 25 Q8 30 16 32" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Path d="M22 43 L19 50 M27 45 L27 51 M31 43 L33 50"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
    </Svg>
  );
}

// ── Mask (Wilde — theatre masks) ───────────────────────────────────────────
export function MaskIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M8 20 Q8 9 18 9 Q26 9 26 20 Q26 32 18 36 Q10 32 8 20 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Path d="M13 20 Q15 17 18 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M13 27 Q16 31 21 27" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Path d="M28 24 Q28 13 38 13 Q46 13 46 24 Q46 36 38 40 Q30 36 28 24 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Path d="M33 22 Q35 19 38 22" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M33 33 Q36 29 41 33" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Line x1="33" y1="24" x2="33" y2="29" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
    </Svg>
  );
}

// ── HammerPhil (Nietzsche — philosophical hammer) ─────────────────────────
export function HammerPhilIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="12" y1="42" x2="36" y2="18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Path d="M31 13 L39 5 L49 15 L41 23 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="8"  y1="22" x2="13" y2="26" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <Line x1="6"  y1="30" x2="12" y2="30" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
      <Line x1="10" y1="16" x2="14" y2="12" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}

// ── Fist (Marx — raised fist) ─────────────────────────────────────────────
export function FistIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M16 48 Q12 48 12 44 L12 38 Q12 34 16 34 L38 34 Q42 34 42 38 L42 44 Q42 48 38 48 Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <Rect x="16" y="18" width="26" height="16" rx="3.5" stroke={color} strokeWidth="1.4" fill="none" />
      <Path d="M16 34 Q11 32 11 26 Q11 21 15 21 L16 21"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Line x1="22" y1="18" x2="22" y2="34" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.45" />
      <Line x1="28" y1="18" x2="28" y2="34" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.45" />
      <Line x1="34" y1="18" x2="34" y2="34" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.45" />
    </Svg>
  );
}

// ── Cosmos (Hawking — stars & orbit) ──────────────────────────────────────
export function CosmosIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="27" rx="22" ry="9"  stroke={color} strokeWidth="1.3" fill="none" />
      <Ellipse cx="27" cy="27" rx="14" ry="5.5" stroke={color} strokeWidth="1"   fill="none" opacity="0.45" />
      <Circle cx="27" cy="8"  r="2.5" fill={color} />
      <Circle cx="10" cy="20" r="1.5" fill={color} opacity="0.75" />
      <Circle cx="44" cy="18" r="1.2" fill={color} opacity="0.65" />
      <Circle cx="8"  cy="35" r="1"   fill={color} opacity="0.55" />
      <Circle cx="46" cy="36" r="1.5" fill={color} opacity="0.7" />
      <Circle cx="27" cy="46" r="1.2" fill={color} opacity="0.6" />
      <Circle cx="27" cy="27" r="4"   stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

// ── Rocket (Musk — SpaceX) ─────────────────────────────────────────────────
export function RocketIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 7 Q36 10 38 24 L38 38 Q33 42 27 44 Q21 42 16 38 L16 24 Q18 10 27 7 Z"
        stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="24" r="5" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M16 30 L8 42 L16 38"  stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <Path d="M38 30 L46 42 L38 38" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <Path d="M22 44 Q24 50 27 52 Q30 50 32 44"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.65" />
    </Svg>
  );
}

// ── Chip (Jobs — microchip) ────────────────────────────────────────────────
export function ChipIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="15" y="15" width="24" height="24" rx="3" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="21" y="21" width="12" height="12" rx="1" stroke={color} strokeWidth="1"   fill="none" opacity="0.55" />
      <Line x1="21" y1="15" x2="21" y2="9"  stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="27" y1="15" x2="27" y2="9"  stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="33" y1="15" x2="33" y2="9"  stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="21" y1="39" x2="21" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="27" y1="39" x2="27" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="33" y1="39" x2="33" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="15" y1="21" x2="9"  y2="21" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="15" y1="27" x2="9"  y2="27" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="15" y1="33" x2="9"  y2="33" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="39" y1="21" x2="45" y2="21" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="39" y1="27" x2="45" y2="27" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="39" y1="33" x2="45" y2="33" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

// ── WinGrid (Gates — four-pane window) ────────────────────────────────────
export function WinGridIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="7"  y="7"  width="17" height="17" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="30" y="7"  width="17" height="17" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="7"  y="30" width="17" height="17" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="30" y="30" width="17" height="17" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

// ── StockChart (Buffett — rising chart) ───────────────────────────────────
export function StockChartIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="8"  y1="46" x2="8"  y2="8"  stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Line x1="8"  y1="46" x2="48" y2="46" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Rect x="11" y="36" width="7" height="10" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.75" />
      <Rect x="22" y="26" width="7" height="20" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.75" />
      <Rect x="33" y="16" width="7" height="30" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.75" />
      <Path d="M8 44 Q20 30 48 10"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="3,2" />
    </Svg>
  );
}

// ── Kite (Franklin — kite with lightning bolt) ────────────────────────────
export function KiteIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 6 L42 22 L27 38 L12 22 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="27" y1="6"  x2="27" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.4" />
      <Line x1="12" y1="22" x2="42" y2="22" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.4" />
      <Line x1="27" y1="38" x2="27" y2="46" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <Path d="M31 12 L26 20 L31 20 L26 32"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Bear (Roosevelt — bear paw) ────────────────────────────────────────────
export function BearIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="36" rx="13" ry="11" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="16" cy="23" r="4"   stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="22" cy="19" r="4.5" stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="29" cy="18" r="4.5" stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="36" cy="20" r="4"   stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="16" y1="19" x2="14" y2="14" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
      <Line x1="22" y1="15" x2="21" y2="10" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
      <Line x1="29" y1="14" x2="29" y2="9"  stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
      <Line x1="36" y1="16" x2="38" y2="11" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
    </Svg>
  );
}

// ── Star5 (Mao — five-pointed star) ───────────────────────────────────────
export function Star5Icon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path
        d="M27 7 L31.5 20.5 L46 20.5 L34.5 29 L38.5 43 L27 35 L15.5 43 L19.5 29 L8 20.5 L22.5 20.5 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Charkha (Gandhi — spinning wheel) ─────────────────────────────────────
export function CharkhaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="27" r="3"  fill={color} />
      <Line x1="27" y1="7"  x2="27" y2="24" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="37" y1="10" x2="30" y2="24" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="44" y1="17" x2="33" y2="26" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="47" y1="27" x2="30" y2="27" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="44" y1="37" x2="33" y2="29" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="37" y1="44" x2="30" y2="30" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="27" y1="47" x2="27" y2="30" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="17" y1="44" x2="24" y2="30" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="10" y1="37" x2="21" y2="29" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="7"  y1="27" x2="24" y2="27" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="10" y1="17" x2="21" y2="26" stroke={color} strokeWidth="1"   strokeLinecap="round" />
      <Line x1="17" y1="10" x2="24" y2="24" stroke={color} strokeWidth="1"   strokeLinecap="round" />
    </Svg>
  );
}

// ── Chains (Mandela — broken chains) ──────────────────────────────────────
export function ChainsIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="7"  y="20" width="16" height="14" rx="7" stroke={color} strokeWidth="1.4" fill="none" />
      <Rect x="31" y="20" width="16" height="14" rx="7" stroke={color} strokeWidth="1.4" fill="none" />
      <Line x1="24" y1="22" x2="28" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="24" y1="32" x2="28" y2="36" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="30" y1="22" x2="26" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="30" y1="32" x2="26" y2="36" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

// ── Dove (MLK — peace dove) ────────────────────────────────────────────────
export function DoveIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M20 30 Q18 22 24 18 Q32 14 38 20 Q44 26 38 32 Q30 38 20 34 Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <Circle cx="38" cy="20" r="5"   stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="40" cy="19" r="1.2" fill={color} />
      <Path d="M43 20 L49 21 L43 23"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M25 24 Q18 14 10 16 Q14 24 20 28"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Path d="M20 32 L12 36 M20 34 L14 40"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
    </Svg>
  );
}

// ── Laurel (Aurelius — laurel wreath) ─────────────────────────────────────
export function LaurelIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 40 Q15 36 10 20" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Path d="M27 40 Q39 36 44 20" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Path d="M12 30 Q8 24 14 22 Q16 28 12 30"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M16 21 Q12 15 18 13 Q20 19 16 21"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M22 14 Q20 8 27 8 Q26 14 22 14"   stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M42 30 Q46 24 40 22 Q38 28 42 30"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M38 21 Q42 15 36 13 Q34 19 38 21"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M32 14 Q34 8 27 8 Q28 14 32 14"   stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M22 42 Q27 46 32 42" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// ── Lantern (Diogenes — searching for honest man) ─────────────────────────
export function LanternIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M17 20 L17 40 Q17 44 21 44 L33 44 Q37 44 37 40 L37 20 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M14 20 Q14 16 27 16 Q40 16 40 20" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Path d="M22 16 Q22 10 27 10 Q32 10 32 16"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Line x1="22" y1="20" x2="22" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
      <Line x1="32" y1="20" x2="32" y2="44" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
      <Path d="M27 38 Q24 34 27 30 Q30 34 27 38"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Line x1="9"  y1="30" x2="17" y2="30" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.35" />
      <Line x1="37" y1="30" x2="45" y2="30" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}

// ── Anchor (Peter I — fleet & sea) ────────────────────────────────────────
export function AnchorIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="9"  r="4"  stroke={color} strokeWidth="1.4" fill="none" />
      <Line x1="27" y1="13" x2="27" y2="46" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="14" y1="18" x2="40" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M27 46 Q17 44 14 38 Q18 38 27 46"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Path d="M27 46 Q37 44 40 38 Q36 38 27 46"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Path d="M14 38 Q10 30 14 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      <Path d="M40 38 Q44 30 40 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

// ── Sceptre (Catherine II — orb & scepter) ────────────────────────────────
export function SceptreIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="16" x2="27" y2="50" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <Circle cx="27" cy="28" r="8"  stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="19" y1="28" x2="35" y2="28" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.55" />
      <Line x1="27" y1="6"  x2="27" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="21" y1="10" x2="33" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Axe (Ivan the Terrible — battle axe) ─────────────────────────────────
export function AxeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="38" y1="14" x2="18" y2="46" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <Path d="M38 14 Q48 10 46 22 Q42 32 30 26 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M46 22 Q44 30 38 28" stroke={color} strokeWidth="1"   fill="none" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

// ── ShieldCross (Nevsky — knight's shield) ────────────────────────────────
export function ShieldCrossIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 7 L44 14 L44 30 Q44 42 27 50 Q10 42 10 30 L10 14 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="27" y1="17" x2="27" y2="43" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <Line x1="18" y1="26" x2="36" y2="26" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    </Svg>
  );
}

// ── Sabers (Suvorov — crossed sabers) ─────────────────────────────────────
export function SabersIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="12" y1="8"  x2="44" y2="44" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <Line x1="16" y1="18" x2="24" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="43" cy="43" r="2.5" stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="42" y1="8"  x2="10" y2="44" stroke={color} strokeWidth="2"   strokeLinecap="round" />
      <Line x1="38" y1="18" x2="30" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="11" cy="43" r="2.5" stroke={color} strokeWidth="1.3" fill="none" />
    </Svg>
  );
}

// ── Telescope (Kutuzov — military strategy) ───────────────────────────────
export function TelescopeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M8 36 L14 40 L44 14 L38 10 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Line x1="38" y1="10" x2="44" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx="48" cy="8"  r="1.2" fill={color} opacity="0.65" />
      <Circle cx="44" cy="5"  r="0.8" fill={color} opacity="0.45" />
      <Line x1="12" y1="38" x2="8"  y2="48" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <Line x1="12" y1="38" x2="16" y2="48" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <Line x1="12" y1="38" x2="12" y2="48" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
    </Svg>
  );
}

// ── Romanov (Nicholas II — double-headed eagle) ───────────────────────────
export function RomanovIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="30" rx="9" ry="11" stroke={color} strokeWidth="1.4" fill="none" />
      <Path d="M18 24 Q9 16 9 8 Q17 12 20 20"   stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Path d="M36 24 Q45 16 45 8 Q37 12 34 20"  stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Circle cx="18" cy="16" r="5" stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="36" cy="16" r="5" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M13 15 L8  17 L13 19" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M41 15 L46 17 L41 19" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 11 L18 7 L20 11" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M34 11 L36 7 L38 11" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 42 L19 48 M27 42 L27 48 M33 42 L35 48"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

// ── Helmet (Gagarin — cosmonaut helmet) ───────────────────────────────────
export function HelmetIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="24" r="17" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M14 22 Q14 32 27 34 Q40 32 40 22 Q40 17 27 17 Q14 17 14 22 Z"
        stroke={color} strokeWidth="1.3" fill="none" />
      <Ellipse cx="27" cy="41" rx="12" ry="4" stroke={color} strokeWidth="1.4" fill="none" />
      <Line x1="15" y1="41" x2="15" y2="37" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
      <Line x1="39" y1="41" x2="39" y2="37" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
      <Circle cx="34" cy="16" r="1.5" fill={color} opacity="0.55" />
    </Svg>
  );
}

// ── Lyre (Pushkin — poet's lyre) ───────────────────────────────────────────
export function LyreIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 40 Q14 36 13 20 Q14 10 27 9" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M27 40 Q40 36 41 20 Q40 10 27 9" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Line x1="15" y1="18" x2="39" y2="18" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Line x1="20" y1="18" x2="19" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.6" />
      <Line x1="27" y1="18" x2="27" y2="40" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.6" />
      <Line x1="34" y1="18" x2="35" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.6" />
      <Path d="M21 42 Q27 46 33 42" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// ── Candle (Dostoevsky — light in darkness) ────────────────────────────────
export function CandleIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="21" y="26" width="12" height="22" rx="1.5" stroke={color} strokeWidth="1.4" fill="none" />
      <Line x1="27" y1="26" x2="27" y2="21" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Path d="M27 21 Q23 15 27 9 Q31 15 27 21"  stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Path d="M27 20 Q25 17 27 14 Q29 17 27 20"  stroke={color} strokeWidth="1"   fill="none" strokeLinecap="round" opacity="0.5" />
      <Path d="M21 34 Q18 36 19 40" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.45" />
      <Line x1="27" y1="9"  x2="27" y2="5"  stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.35" />
      <Line x1="19" y1="12" x2="16" y2="9"  stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.3" />
      <Line x1="35" y1="12" x2="38" y2="9"  stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.3" />
    </Svg>
  );
}

// ── Wheat (Tolstoy — nature & peasantry) ──────────────────────────────────
export function WheatIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="48" x2="27" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M27 16 Q21 14 17 17 Q21 20 27 20"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M27 23 Q20 20 16 24 Q20 27 27 27"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M27 30 Q21 28 17 32 Q21 35 27 34"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M27 16 Q33 14 37 17 Q33 20 27 20"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M27 23 Q34 20 38 24 Q34 27 27 27"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M27 30 Q33 28 37 32 Q33 35 27 34"  stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Line x1="26" y1="10" x2="24" y2="6" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
      <Line x1="28" y1="10" x2="30" y2="6" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
    </Svg>
  );
}

// ── Guitar (Vysotsky — bard's guitar) ─────────────────────────────────────
export function GuitarIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 30 Q18 28 15 36 Q13 44 21 47 Q29 50 36 45 Q43 40 38 34 Q35 28 27 30 Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <Circle cx="27" cy="38" r="4.5" stroke={color} strokeWidth="1.1" fill="none" opacity="0.6" />
      <Rect x="24" y="10" width="6"  height="22" rx="2" stroke={color} strokeWidth="1.3" fill="none" />
      <Rect x="22" y="6"  width="10" height="6"  rx="2" stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="24" y1="16" x2="30" y2="16" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <Line x1="24" y1="22" x2="30" y2="22" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <Line x1="24" y1="28" x2="30" y2="28" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

// ── EyeMystic (Rasputin — all-seeing eye) ─────────────────────────────────
export function EyeMysticIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M7 27 Q17 14 27 13 Q37 14 47 27 Q37 40 27 41 Q17 40 7 27 Z"
        stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="27" r="7"   stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="27" cy="27" r="3"   fill={color} />
      <Line x1="27" y1="6"  x2="27" y2="10" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <Line x1="38" y1="9"  x2="36" y2="12" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
      <Line x1="16" y1="9"  x2="18" y2="12" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
      <Line x1="27" y1="48" x2="27" y2="44" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.3" />
    </Svg>
  );
}

// ── TableChem (Mendeleev — periodic table) ────────────────────────────────
export function TableChemIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="7"  y="7"  width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <Rect x="38" y="7"  width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <Rect x="7"  y="20" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <Rect x="18" y="20" width="9" height="9" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="29" y="20" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <Rect x="38" y="20" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <Rect x="7"  y="33" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <Rect x="18" y="33" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <Rect x="29" y="33" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <Rect x="38" y="33" width="9" height="9" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
    </Svg>
  );
}

// ── Flask (Walter White — chemistry flask) ────────────────────────────────
export function FlaskIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="22" y="8"  width="10" height="14" rx="2" stroke={color} strokeWidth="1.4" fill="none" />
      <Path d="M22 22 L12 44 Q12 48 27 48 Q42 48 42 44 L32 22 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Path d="M16 38 Q27 36 38 38" stroke={color} strokeWidth="1"   fill="none" strokeLinecap="round" opacity="0.5" />
      <Circle cx="23" cy="42" r="1.5" stroke={color} strokeWidth="1"   fill="none" opacity="0.65" />
      <Circle cx="31" cy="44" r="1.2" stroke={color} strokeWidth="1"   fill="none" opacity="0.55" />
      <Circle cx="35" cy="41" r="1"   stroke={color} strokeWidth="1"   fill="none" opacity="0.5" />
      <Path d="M27 8 Q24 4 27 2 Q30 4 27 8"
        stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.45" />
    </Svg>
  );
}

// ── Goblet (Tyrion — wine goblet) ─────────────────────────────────────────
export function GobletIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M15 10 Q13 26 18 32 Q22 38 27 38 Q32 38 36 32 Q41 26 39 10 Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="27" y1="38" x2="27" y2="46" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Ellipse cx="27" cy="47" rx="11" ry="3" stroke={color} strokeWidth="1.4" fill="none" />
      <Path d="M17 20 Q27 22 37 20" stroke={color} strokeWidth="1"   fill="none" strokeLinecap="round" opacity="0.45" />
    </Svg>
  );
}

// ── JokerCard (Joker — playing card) ──────────────────────────────────────
export function JokerCardIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="12" y="6" width="30" height="42" rx="3" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M27 14 L31 20 L27 26 L23 20 Z"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M24 30 L30 30 M27 30 L27 40 Q27 44 23 44"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Circle cx="16" cy="10" r="1.5" fill={color} opacity="0.6" />
      <Circle cx="38" cy="44" r="1.5" fill={color} opacity="0.6" />
    </Svg>
  );
}

// ── Wolf (Geralt — wolf medallion) ────────────────────────────────────────
export function WolfIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M20 34 Q18 26 20 20 Q22 14 27 12 Q32 14 34 20 Q36 26 34 34"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Path d="M22 30 Q27 36 32 30" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Path d="M20 20 L17 12 L23 16" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <Path d="M34 20 L37 12 L31 16" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx="23" cy="24" r="1.5" fill={color} opacity="0.8" />
      <Circle cx="31" cy="24" r="1.5" fill={color} opacity="0.8" />
    </Svg>
  );
}

// ── Blades (Kratos — Blades of Chaos) ─────────────────────────────────────
export function BladesIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M10 44 L30 24 L34 10 L38 14 L26 28 L42 42"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 44 Q6 48 10 50 Q14 48 10 44"
        stroke={color} strokeWidth="1.3" fill="none" opacity="0.65" />
      <Path d="M44 44 L24 24 L20 10 L16 14 L28 28 L12 42"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M44 44 Q48 48 44 50 Q40 48 44 44"
        stroke={color} strokeWidth="1.3" fill="none" opacity="0.65" />
    </Svg>
  );
}

// ── NoteBook (Light Yagami — Death Note) ──────────────────────────────────
export function NoteBookIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="12" y="6" width="30" height="42" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="18" y1="6"  x2="18" y2="48" stroke={color} strokeWidth="2"   strokeLinecap="round" opacity="0.65" />
      <Line x1="22" y1="16" x2="38" y2="16" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <Line x1="22" y1="22" x2="38" y2="22" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <Line x1="22" y1="28" x2="38" y2="28" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <Circle cx="30" cy="38" r="5"   stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <Line x1="27" y1="40" x2="27" y2="42" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.4" />
      <Line x1="30" y1="40" x2="30" y2="42" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.4" />
      <Line x1="33" y1="40" x2="33" y2="42" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}

// ── Cake (L — sweet obsession) ────────────────────────────────────────────
export function CakeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="10" y="30" width="34" height="16" rx="2" stroke={color} strokeWidth="1.4" fill="none" />
      <Line x1="10" y1="38" x2="44" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.5" />
      <Path d="M12 30 Q14 26 16 28 Q18 24 20 28 Q22 24 24 28 Q26 24 28 28 Q30 24 32 28 Q34 24 36 28 Q38 26 42 30"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Line x1="20" y1="30" x2="20" y2="22" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="27" y1="30" x2="27" y2="20" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="34" y1="30" x2="34" y2="22" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Path d="M20 22 Q18 18 20 16 Q22 18 20 22" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
      <Path d="M27 20 Q25 16 27 13 Q29 16 27 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
      <Path d="M34 22 Q32 18 34 16 Q36 18 34 22" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
    </Svg>
  );
}

// ── Wings (Levi — Survey Corps Wings of Freedom) ──────────────────────────
export function WingsIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="30" rx="4" ry="9" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M23 26 Q16 16 8 18 Q10 24 16 26 Q9 25 12 32 Q18 30 23 33"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M31 26 Q38 16 46 18 Q44 24 38 26 Q45 25 42 32 Q36 30 31 33"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Titan (Eren — Attack Titan) ────────────────────────────────────────────
export function TitanIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M11 28 Q9 16 27 11 Q45 16 43 28 Q43 41 27 45 Q11 41 11 28 Z"
        stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M17 24 Q19 21 22 24" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M32 24 Q35 21 38 24" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M18 35 Q27 40 36 35" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <Line x1="20" y1="11" x2="18" y2="7"  stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <Line x1="27" y1="11" x2="27" y2="6"  stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <Line x1="34" y1="11" x2="36" y2="7"  stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
    </Svg>
  );
}

// ── Saiyan (Goku — power aura) ────────────────────────────────────────────
export function SaiyanIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="20" r="5"  stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="27" y1="25" x2="27" y2="36" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="17" y1="29" x2="37" y2="29" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="27" y1="36" x2="20" y2="46" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="27" y1="36" x2="34" y2="46" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="27" y1="6"  x2="27" y2="12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <Line x1="10" y1="10" x2="14" y2="14" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <Line x1="44" y1="10" x2="40" y2="14" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <Line x1="6"  y1="24" x2="12" y2="24" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <Line x1="48" y1="24" x2="42" y2="24" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <Line x1="8"  y1="38" x2="13" y2="35" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.35" />
      <Line x1="46" y1="38" x2="41" y2="35" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}

// ── StrawHat (Luffy — straw hat) ───────────────────────────────────────────
export function StrawHatIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="32" rx="22" ry="7"  stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M13 32 Q11 22 27 18 Q43 22 41 32"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M14 30 Q27 26 40 30"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55" />
      <Line x1="18" y1="29" x2="20" y2="22" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
      <Line x1="23" y1="27" x2="24" y2="20" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
      <Line x1="27" y1="25" x2="27" y2="18" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
      <Line x1="31" y1="27" x2="30" y2="20" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
      <Line x1="36" y1="29" x2="34" y2="22" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}

// ── BoxingGlove (Ali — fists of legend) ───────────────────────────────────
export function BoxingGloveIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M9 30 Q8 22 14 20 Q18 18 20 20 L22 16 Q24 12 27 14 Q28 18 24 22 L26 28 Q28 36 20 40 Q11 40 9 30 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Path d="M45 30 Q46 22 40 20 Q36 18 34 20 L32 16 Q30 12 27 14 Q26 18 30 22 L28 28 Q26 36 34 40 Q43 40 45 30 Z"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Line x1="12" y1="36" x2="18" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.45" />
      <Line x1="42" y1="36" x2="36" y2="38" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.45" />
    </Svg>
  );
}

// ── SoccerBall (Ronaldo — the beautiful game) ─────────────────────────────
export function SoccerBallIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M27 12 L32 16 L30 22 L24 22 L22 16 Z"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" />
      <Path d="M10 22 L16 20 L20 24 L18 30 L12 30 Z"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" opacity="0.75" />
      <Path d="M44 22 L38 20 L34 24 L36 30 L42 30 Z"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" opacity="0.75" />
      <Path d="M27 42 L32 38 L30 32 L24 32 L22 38 Z"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" opacity="0.6" />
    </Svg>
  );
}

// ── CigarIcon (Тони Монтана) ──────────────────────────────────────────────
export function CigarIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M10 40 L38 14" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.12" />
      <Path d="M10 40 L38 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="10" y1="40" x2="14" y2="36" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
      <Path d="M40 12 Q43 8 41 5 Q45 7 43 11 Q46 8 45 5 Q48 10 45 14" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <Path d="M24 24 Q20 18 22 12 Q24 8 22 4" stroke={color} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45" />
      <Path d="M20 26 Q16 20 18 14 Q20 10 18 6" stroke={color} strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.25" />
    </Svg>
  );
}

// ── RoseIcon (Майкл Корлеоне) ─────────────────────────────────────────────
export function RoseIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="28" x2="27" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M27 40 Q33 34 40 36" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Path d="M27 36 Q20 30 14 32" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Circle cx="27" cy="22" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M27 14 C22 15 19 19 20 23 C21 27 25 29 27 28 C29 29 33 27 34 23 C35 19 32 15 27 14Z" stroke={color} strokeWidth="1.2" fill="none" />
      <Path d="M22 20 C24 23 27 23 27 23 C27 23 30 23 32 20" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <Path d="M24 16 C24 14 27 12 27 12 C27 12 30 14 30 16" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
    </Svg>
  );
}

// ── FedoraIcon (Индиана Джонс) ────────────────────────────────────────────
export function FedoraIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M6 32 Q12 26 19 26 L35 26 Q42 26 48 32 Q42 38 27 38 Q12 38 6 32Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M19 26 L17 13 Q22 9 27 9 Q32 9 37 13 L35 26" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M22 12 Q24 8 27 7 Q30 8 32 12" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <Path d="M19 24 L35 24" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <Path d="M27 38 Q35 42 40 46 Q44 49 43 52" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" />
    </Svg>
  );
}

// ── PencilIcon (Джон Уик) ─────────────────────────────────────────────────
export function PencilIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M14 40 L36 12" stroke={color} strokeWidth="5" strokeLinecap="butt" opacity="0.12" />
      <Path d="M14 40 L36 12" stroke={color} strokeWidth="3" strokeLinecap="butt" />
      <Path d="M36 12 L40 8 L43 11 L39 14 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M11 43 L14 40 L10 46 Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <Line x1="12" y1="41" x2="10" y2="44" stroke={color} strokeWidth="1" opacity="0.4" />
    </Svg>
  );
}

// ── WandIcon (Гарри Поттер) ───────────────────────────────────────────────
export function WandIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M12 44 L40 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx="40" cy="12" r="3.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="40" y1="5" x2="40" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="47" y1="12" x2="49" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="45" y1="7" x2="47" y2="5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="45" y1="17" x2="47" y2="19" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="35" y1="7" x2="33" y2="5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Path d="M24 10 L21 16 L26 16 L23 22" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
    </Svg>
  );
}

// ── LightsaberIcon (Дарт Вейдер) ─────────────────────────────────────────
export function LightsaberIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 8 L27 34" stroke={color} strokeWidth="7" strokeLinecap="round" opacity="0.1" />
      <Path d="M27 8 L27 34" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <Rect x="23" y="34" width="8" height="11" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="23" y1="39" x2="31" y2="39" stroke={color} strokeWidth="1" opacity="0.5" />
      <Circle cx="27" cy="41" r="1.5" stroke={color} strokeWidth="1.2" fill="none" />
      <Path d="M23 45 L31 45 L31 47 L23 47 Z" stroke={color} strokeWidth="1.2" fill="none" />
    </Svg>
  );
}

// ── StaffIcon (Гендальф) ──────────────────────────────────────────────────
export function StaffIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 48 L26 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M26 12 L22 8 L26 5 L30 8 L26 12" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Circle cx="26" cy="8" r="5.5" stroke={color} strokeWidth="1" fill="none" opacity="0.35" />
      <Line x1="23" y1="28" x2="31" y2="30" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
      <Line x1="22" y1="34" x2="30" y2="36" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </Svg>
  );
}

// ── SharinganIcon (Итачи Учиха) ───────────────────────────────────────────
export function SharinganIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="18" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="27" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="16" r="2.5" stroke={color} strokeWidth="1.2" fill="none" />
      <Path d="M27 18.5 Q31 21 29.5 24.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Circle cx="36.6" cy="31.5" r="2.5" stroke={color} strokeWidth="1.2" fill="none" />
      <Path d="M34.4 33 Q31 35 29.5 31.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Circle cx="17.4" cy="31.5" r="2.5" stroke={color} strokeWidth="1.2" fill="none" />
      <Path d="M19.6 33 Q23 35 24.5 31.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

// ── FlameIcon (Тандзиро Камадо) ───────────────────────────────────────────
export function FlameIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 47 Q17 40 15 32 Q13 22 20 16 Q18 26 25 28 Q23 18 28 9 Q31 20 37 22 Q39 15 37 9 Q45 18 43 30 Q41 40 34 45 Q30 48 27 47Z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M27 43 Q21 37 21 30 Q23 34 27 34 Q27 26 32 22 Q33 30 37 32 Q37 39 32 43 Q29 45 27 43Z"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" opacity="0.5" />
    </Svg>
  );
}

// ── ThreeSwordsIcon (Зоро) ────────────────────────────────────────────────
export function ThreeSwordsIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="7" x2="27" y2="38" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M25 36 L27 42 L29 36" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Rect x="24.5" y="42" width="5" height="4" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <Line x1="13" y1="9" x2="34" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M32.5 40 L35 45 L37 40" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <Line x1="41" y1="9" x2="20" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M21.5 40 L19 45 L17 40" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

// ── LeafBandIcon (Какаши Хатаке) ──────────────────────────────────────────
export function LeafBandIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M6 24 L48 24 L48 34 L6 34 Z" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="16" y="22" width="22" height="16" rx="1.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M27 24.5 Q31 24 33 27 Q31 30 27 34.5 Q23 30 21 27 Q23 24 27 24.5Z" stroke={color} strokeWidth="1.2" fill="none" />
      <Line x1="27" y1="30" x2="27" y2="37" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <Path d="M6 24 L3 22 M6 34 L3 36" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <Path d="M48 24 L51 22 M48 34 L51 36" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

// ── AutomailIcon (Эдвард Элрик) ───────────────────────────────────────────
export function AutomailIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="21" y="10" width="12" height="9" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="21" y="21" width="12" height="12" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="21" y="35" width="12" height="7" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="23" y1="42" x2="23" y2="47" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="27" y1="42" x2="27" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="31" y1="42" x2="31" y2="47" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="22" y1="26" x2="32" y2="26" stroke={color} strokeWidth="0.9" opacity="0.45" />
      <Circle cx="27" cy="28" r="2" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <Line x1="23" y1="14" x2="31" y2="14" stroke={color} strokeWidth="0.9" opacity="0.4" />
    </Svg>
  );
}

// ── CowboyHatIcon (Артур Морган) ──────────────────────────────────────────
export function CowboyHatIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M6 33 Q12 27 19 27 L35 27 Q42 27 48 33 Q42 38 27 38 Q12 38 6 33Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M19 27 L18 14 Q22 9 27 9 Q32 9 36 14 L35 27" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M22 12 Q24 8 27 7 Q30 8 32 12" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <Line x1="19" y1="25" x2="35" y2="25" stroke={color} strokeWidth="1.5" opacity="0.45" />
    </Svg>
  );
}

// ── BarcodeIcon (Агент 47) ────────────────────────────────────────────────
export function BarcodeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="9"  y1="12" x2="9"  y2="40" stroke={color} strokeWidth="1.5" />
      <Line x1="12" y1="12" x2="12" y2="40" stroke={color} strokeWidth="3" />
      <Line x1="16" y1="12" x2="16" y2="40" stroke={color} strokeWidth="1" />
      <Line x1="18" y1="12" x2="18" y2="40" stroke={color} strokeWidth="2" />
      <Line x1="21" y1="12" x2="21" y2="40" stroke={color} strokeWidth="1.5" />
      <Line x1="24" y1="12" x2="24" y2="40" stroke={color} strokeWidth="1" />
      <Line x1="26" y1="12" x2="26" y2="40" stroke={color} strokeWidth="3" />
      <Line x1="30" y1="12" x2="30" y2="40" stroke={color} strokeWidth="1.5" />
      <Line x1="33" y1="12" x2="33" y2="40" stroke={color} strokeWidth="1" />
      <Line x1="35" y1="12" x2="35" y2="40" stroke={color} strokeWidth="2" />
      <Line x1="38" y1="12" x2="38" y2="40" stroke={color} strokeWidth="1.5" />
      <Line x1="41" y1="12" x2="41" y2="40" stroke={color} strokeWidth="1" />
      <Line x1="43" y1="12" x2="43" y2="40" stroke={color} strokeWidth="2.5" />
      <Line x1="45" y1="12" x2="45" y2="40" stroke={color} strokeWidth="1" />
      <Path d="M17 44 L15 47 L19 47 M19 44 L19 48" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <Path d="M23 44 L27 44 L25 48" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

// ── HiddenBladeIcon (Эцио Аудиторе) ──────────────────────────────────────
export function HiddenBladeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="12" y="34" width="30" height="11" rx="3" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="20" y1="34" x2="20" y2="45" stroke={color} strokeWidth="1" opacity="0.45" />
      <Line x1="34" y1="34" x2="34" y2="45" stroke={color} strokeWidth="1" opacity="0.45" />
      <Path d="M27 34 L27 11 L30 18 M27 11 L24 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M20 28 Q22 22 27 20 Q32 22 34 28 Q30 26 27 27 Q24 26 20 28Z" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
    </Svg>
  );
}

// ── VisorIcon (Мастер Чиф) ────────────────────────────────────────────────
export function VisorIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M10 30 Q10 11 27 9 Q44 11 44 30 L44 36 Q44 44 27 46 Q10 44 10 36 Z" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M16 23 Q16 18 27 17 Q38 18 38 23 L38 31 Q38 36 27 36 Q16 36 16 31 Z" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <Path d="M18 20 L24 18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      <Line x1="18" y1="40" x2="36" y2="40" stroke={color} strokeWidth="1" opacity="0.3" />
    </Svg>
  );
}

// ── BannerIcon (Жанна д'Арк) ──────────────────────────────────────────────
export function BannerIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="14" y1="5" x2="14" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M14 9 L40 13 L40 37 L14 41 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="25" y1="17" x2="25" y2="33" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <Line x1="19" y1="25" x2="31" y2="25" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <Path d="M11 5 L14 3 L17 5" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

// ── HordeIcon (Аттила) ────────────────────────────────────────────────────
export function HordeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M16 8 Q7 27 16 46" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <Line x1="16" y1="8" x2="16" y2="46" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M16 27 L32 23" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="32" y1="23" x2="45" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M45 17 L41 19 L42 22 Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <Path d="M32 23 L30 20 M32 23 L30 26" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

// ── SyringeIcon (Декстер Морган) ──────────────────────────────────────────
export function SyringeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M37 10 L44 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M34 13 L44 4 M40 7 L34 13" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.55" />
      <Path d="M10 44 L34 13" stroke={color} strokeWidth="5.5" strokeLinecap="round" opacity="0.1" />
      <Path d="M10 44 L34 13" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <Path d="M8 47 L10 44 L6 46 Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <Line x1="22" y1="36" x2="18" y2="40" stroke={color} strokeWidth="1.2" opacity="0.4" />
    </Svg>
  );
}

// ── CaneIcon (Доктор Хаус) ────────────────────────────────────────────────
export function CaneIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M22 49 L22 14 Q22 7 29 7 Q36 7 36 14" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <Ellipse cx="22" cy="49" rx="3" ry="2" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
    </Svg>
  );
}

// ── ChidoriIcon (Саске Учиха) ─────────────────────────────────────────────
export function ChidoriIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="19" y="26" width="16" height="12" rx="4" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M23 26 L23 22 Q23 20 25 20 L29 20 Q31 20 31 22 L31 26" stroke={color} strokeWidth="1.2" fill="none" />
      <Path d="M16 20 L20 24 M12 26 L18 28 M14 34 L19 31" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <Path d="M38 20 L34 24 M42 26 L36 28 M40 34 L35 31" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <Path d="M27 8 L24 16 L28 16 L25 24" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

// ── GauntletIcon (Изуку Мидория) ─────────────────────────────────────────
export function GauntletIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M18 42 L18 28 Q18 24 22 22 L32 22 Q36 22 36 26 L36 42 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M22 22 L22 14 Q22 12 24 12 L24 22" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M26 22 L26 11 Q26 9 28 9 L28 22" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M30 22 L30 12 Q30 10 32 10 L32 22" stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="18" y1="36" x2="36" y2="36" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <Path d="M24 30 L22 35 L27 35 L25 40" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
    </Svg>
  );
}

// ── MuscleIcon (Всемогущий) ───────────────────────────────────────────────
export function MuscleIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M12 42 Q10 36 14 30 Q18 24 24 22 Q30 20 34 16 Q38 12 36 8 Q42 10 42 18 Q42 24 36 28 Q30 32 28 38 Q26 44 20 44 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M20 30 Q16 24 22 20 Q28 18 30 24" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <Path d="M27 8 L27 14 M27 17 L27 18" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    </Svg>
  );
}

// ── MorningStarIcon (Рем) ─────────────────────────────────────────────────
export function MorningStarIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="10" y1="44" x2="22" y2="32" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M22 32 Q28 28 34 22" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <Circle cx="38" cy="18" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="38" y1="8"  x2="38" y2="6"  stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="38" y1="28" x2="38" y2="30" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="28" y1="18" x2="26" y2="18" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="48" y1="18" x2="50" y2="18" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="31" y1="11" x2="29" y2="9"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="45" y1="11" x2="47" y2="9"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="31" y1="25" x2="29" y2="27" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="45" y1="25" x2="47" y2="27" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

// ── PlugIcon (Асука Лэнгли) ───────────────────────────────────────────────
export function PlugIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="18" y="16" width="18" height="22" rx="4" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="23" y1="16" x2="23" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="31" y1="16" x2="31" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M27 38 L27 48" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="24" y1="48" x2="30" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="22" y1="24" x2="32" y2="24" stroke={color} strokeWidth="1" opacity="0.45" />
      <Line x1="22" y1="30" x2="32" y2="30" stroke={color} strokeWidth="1" opacity="0.45" />
      <Circle cx="27" cy="27" r="3" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
    </Svg>
  );
}

// ── SoapIcon (Тайлер Дёрден) ──────────────────────────────────────────────
export function SoapIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="11" y="20" width="32" height="20" rx="6" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="17" y1="28" x2="37" y2="28" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <Line x1="17" y1="33" x2="33" y2="33" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <Circle cx="15" cy="15" r="2.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <Circle cx="26" cy="12" r="1.5" stroke={color} strokeWidth="1"   fill="none" opacity="0.4" />
      <Circle cx="37" cy="15" r="2"   stroke={color} strokeWidth="1"   fill="none" opacity="0.45" />
      <Circle cx="44" cy="21" r="1.5" stroke={color} strokeWidth="1"   fill="none" opacity="0.3" />
    </Svg>
  );
}

// ── FeatherIcon (Форрест Гамп) ────────────────────────────────────────────
export function FeatherIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M12 46 L36 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M36 10 Q44 12 42 20 Q40 28 32 30 Q26 32 12 46 Q22 38 28 30 Q34 22 36 10Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M20 38 Q26 30 32 24" stroke={color} strokeWidth="0.9" opacity="0.45" strokeLinecap="round" />
      <Path d="M24 34 Q30 26 35 20" stroke={color} strokeWidth="0.9" opacity="0.35" strokeLinecap="round" />
    </Svg>
  );
}

// ── BowlerHatIcon (Алекс ДеЛарж) ─────────────────────────────────────────
export function BowlerHatIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="32" rx="19" ry="5" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M14 32 Q13 16 27 13 Q41 16 40 32" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M17 22 Q17 14 27 12 Q37 14 37 22" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
    </Svg>
  );
}

// ── CoinFlipIcon (Антон Чигур) ────────────────────────────────────────────
export function CoinFlipIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="24" rx="14" ry="16" stroke={color} strokeWidth="1.5" fill="none" />
      <Ellipse cx="27" cy="24" rx="10" ry="12" stroke={color} strokeWidth="1" fill="none" opacity="0.35" />
      <Path d="M23 18 Q20 22 22 28 Q24 32 27 32" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.65" />
      <Path d="M20 44 Q24 42 28 44 Q32 46 36 44" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
      <Path d="M22 48 Q26 46 30 48" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25" />
    </Svg>
  );
}

// ── ChessIcon (Макиавелли) ────────────────────────────────────────────────
export function ChessIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="14" r="4" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M21 36 L19 26 L23 28 L27 18 L31 28 L35 26 L33 36 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Line x1="19" y1="36" x2="35" y2="36" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Rect x="20" y="36" width="14" height="5" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <Circle cx="42" cy="40" r="4" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
      <Line x1="42" y1="44" x2="42" y2="48" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <Line x1="39" y1="48" x2="45" y2="48" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

// ── WarMapIcon (Сунь-цзы) ─────────────────────────────────────────────────
export function WarMapIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="10" y="14" width="34" height="26" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Ellipse cx="10" cy="27" rx="3" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
      <Ellipse cx="44" cy="27" rx="3" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
      <Path d="M14 30 L18 22 L22 28 L26 20 L30 26 L34 18 L38 28 L42 30" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
      <Line x1="28" y1="30" x2="28" y2="36" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M28 30 L34 32 L28 34" stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

// ── MandalaIcon (Карл Юнг) ────────────────────────────────────────────────
export function MandalaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.2" fill="none" />
      <Circle cx="27" cy="27" r="13" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      <Circle cx="27" cy="27" r="6"  stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
      <Line x1="27" y1="7"  x2="27" y2="47" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <Line x1="7"  y1="27" x2="47" y2="27" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <Line x1="13" y1="13" x2="41" y2="41" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <Line x1="41" y1="13" x2="13" y2="41" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <Circle cx="27" cy="14" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      <Circle cx="27" cy="40" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      <Circle cx="14" cy="27" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      <Circle cx="40" cy="27" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
    </Svg>
  );
}

// ── AnkhIcon (Тутанхамон) ─────────────────────────────────────────────────
export function AnkhIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="18" r="10" stroke={color} strokeWidth="2" fill="none" />
      <Line x1="27" y1="28" x2="27" y2="48" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="16" y1="34" x2="38" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// ── DualGunIcon (Лара Крофт) ──────────────────────────────────────────────
export function DualGunIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M10 14 L34 36" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.1" />
      <Path d="M10 14 L34 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M8 12 L12 10 L14 14" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M28 34 L32 38 L36 36" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M44 14 L20 36" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.1" />
      <Path d="M44 14 L20 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M46 12 L42 10 L40 14" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M26 34 L22 38 L18 36" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

// ── RingIcon (Соник) ──────────────────────────────────────────────────────
export function RingIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="16" stroke={color} strokeWidth="7"   fill="none" opacity="0.08" />
      <Circle cx="27" cy="27" r="16" stroke={color} strokeWidth="3.5" fill="none" />
      <Path d="M16 18 Q20 14 26 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    </Svg>
  );
}

// ── MushroomIcon (Марио) ──────────────────────────────────────────────────
export function MushroomIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M20 32 L20 44 Q20 46 22 46 L32 46 Q34 46 34 44 L34 32" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M18 32 Q17 30 18 28 L36 28 Q37 30 36 32" stroke={color} strokeWidth="1.2" fill="none" />
      <Path d="M18 28 Q14 20 16 14 Q20 8 27 8 Q34 8 38 14 Q40 20 36 28 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Circle cx="21" cy="18" r="2.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <Circle cx="33" cy="18" r="2.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <Circle cx="27" cy="13" r="2"   stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
    </Svg>
  );
}

// ── ElderBloodIcon (Цирилла) ──────────────────────────────────────────────
export function ElderBloodIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="18" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M27 10 L41 34 L13 34 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M27 44 L13 20 L41 20 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" opacity="0.55" />
      <Circle cx="27" cy="27" r="3.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
    </Svg>
  );
}

// ── SunflowerIcon (Джоэл Миллер) ─────────────────────────────────────────
export function SunflowerIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 34 L25 48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M25 42 Q20 38 22 34" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Circle cx="27" cy="24" r="7" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="24" r="3.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.45" />
      <Line x1="27" y1="14" x2="27" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="27" y1="34" x2="27" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="17" y1="24" x2="13" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="37" y1="24" x2="41" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="20" y1="17" x2="17" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="34" y1="17" x2="37" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="20" y1="31" x2="17" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="34" y1="31" x2="37" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── CarnationIcon (Дон Жуан) ──────────────────────────────────────────────
export function CarnationIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 32 L26 48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M26 40 Q20 36 22 32" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Path d="M26 44 Q32 40 30 36" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Path d="M27 32 Q22 28 20 22 Q24 24 26 20 Q27 16 27 14 Q27 16 28 20 Q30 24 34 22 Q32 28 27 32Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M22 28 Q24 30 27 30 Q30 30 32 28" stroke={color} strokeWidth="1.1" fill="none" opacity="0.5" />
    </Svg>
  );
}

// ── FangIcon (Дракула) ────────────────────────────────────────────────────
export function FangIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M12 16 Q20 12 27 14 Q34 12 42 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M16 16 L16 36 Q16 42 20 44 L22 36 L24 44 Q22 16 16 16Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M30 16 L30 36 Q30 42 34 44 L36 36 L38 44 Q36 16 30 16Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M20 44 Q20 48 22 48 Q24 48 24 44" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
      <Path d="M34 44 Q34 48 36 48 Q38 48 38 44" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
    </Svg>
  );
}

// ── KunaiIcon (Минато Намикадзе) ──────────────────────────────────────────
export function KunaiIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 6 L30 18 L27 16 L24 18 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Rect x="25" y="18" width="4" height="13" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="25" y1="21" x2="29" y2="21" stroke={color} strokeWidth="1" opacity="0.5" />
      <Line x1="25" y1="24" x2="29" y2="24" stroke={color} strokeWidth="1" opacity="0.5" />
      <Line x1="25" y1="27" x2="29" y2="27" stroke={color} strokeWidth="1" opacity="0.5" />
      <Circle cx="27" cy="34" r="2.5" stroke={color} strokeWidth="1.3" fill="none" />
      <Rect x="20" y="38" width="14" height="9" rx="1.5" stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="24" y1="42" x2="30" y2="42" stroke={color} strokeWidth="1" opacity="0.6" />
      <Line x1="27" y1="38" x2="27" y2="47" stroke={color} strokeWidth="1" opacity="0.6" />
    </Svg>
  );
}

// ── AtFieldIcon (Аянами Рэй) ──────────────────────────────────────────────
export function AtFieldIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 8 L40 15.5 L40 38.5 L27 46 L14 38.5 L14 15.5 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M27 14 L36 19 L36 35 L27 40 L18 35 L18 19 Z" stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" opacity="0.6" />
      <Path d="M27 20 L32 23 L32 31 L27 34 L22 31 L22 23 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.35" />
      <Circle cx="27" cy="27" r="3" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
    </Svg>
  );
}

// ── ThunderboltIcon (Пикачу) ──────────────────────────────────────────────
export function ThunderboltIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M32 6 L20 28 L28 28 L22 48 L38 22 L30 22 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="8"  y1="16" x2="14" y2="16" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <Line x1="10" y1="12" x2="14" y2="16" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <Line x1="10" y1="20" x2="14" y2="16" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <Line x1="44" y1="32" x2="48" y2="32" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <Line x1="44" y1="28" x2="48" y2="32" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <Line x1="44" y1="36" x2="48" y2="32" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}

// ── MoonSceptreIcon (Сейлор Мун) ──────────────────────────────────────────
export function MoonSceptreIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="48" x2="27" y2="24" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="27" cy="18" r="6" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M21 12 Q16 8 14 4 Q20 6 22 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <Path d="M33 12 Q38 8 40 4 Q34 6 32 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <Path d="M27 14 L28.2 16.4 L30.8 16.4 L28.8 18 L29.6 20.4 L27 18.8 L24.4 20.4 L25.2 18 L23.2 16.4 L25.8 16.4 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.65" />
    </Svg>
  );
}

// ── BusterIcon (Клауд Страйф) ─────────────────────────────────────────────
export function BusterIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M21 6 L33 6 L36 38 L27 44 L18 38 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Rect x="24" y="44" width="6" height="8" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M16 40 L38 40" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <Line x1="27" y1="8"  x2="27" y2="38" stroke={color} strokeWidth="0.9" opacity="0.35" />
      <Path d="M21 6 L27 4 L33 6" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

// ── TriforceIcon (Линк) ───────────────────────────────────────────────────
export function TriforceIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 10 L35 24 L19 24 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M19 24 L27 38 L11 38 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M35 24 L43 38 L27 38 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

// ── BandanaIcon (Солид Снейк) ─────────────────────────────────────────────
export function BandanaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M8 22 Q12 18 27 18 Q42 18 46 22 Q42 26 27 26 Q12 26 8 22Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M44 22 L50 20 Q52 24 50 28 L44 24" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.7" />
      <Path d="M50 20 Q52 14 48 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      <Path d="M50 28 Q52 34 48 38" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      <Path d="M25 33 Q25 30 27 30 Q29 30 29 32 Q29 34 27 35 M27 37 L27 38" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6" />
    </Svg>
  );
}

// ── MicrophoneIcon (Фредди Меркьюри) ─────────────────────────────────────
export function MicrophoneIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="22" y="14" width="10" height="24" rx="5" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="22" y1="22" x2="32" y2="22" stroke={color} strokeWidth="1" opacity="0.4" />
      <Line x1="22" y1="26" x2="32" y2="26" stroke={color} strokeWidth="1" opacity="0.4" />
      <Line x1="22" y1="30" x2="32" y2="30" stroke={color} strokeWidth="1" opacity="0.4" />
      <Path d="M18 30 Q18 40 27 40 Q36 40 36 30" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Line x1="27" y1="40" x2="27" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M21 48 L33 48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── ShadesIcon (Элвис Пресли) ─────────────────────────────────────────────
export function ShadesIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M6 26 Q8 20 16 20 Q24 20 24 26 Q24 32 16 32 Q8 32 6 26Z" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M30 26 Q30 20 38 20 Q46 20 48 26 Q46 32 38 32 Q30 32 30 26Z" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M24 24 Q27 22 30 24" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <Path d="M6 24 Q4 22 4 20" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <Path d="M48 24 Q50 22 50 20" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <Line x1="10" y1="22" x2="14" y2="22" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <Line x1="34" y1="22" x2="38" y2="22" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}

// ── WebIcon (Спайдермен) ──────────────────────────────────────────────────
export function WebIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="27" x2="27" y2="6"  stroke={color} strokeWidth="1.2" opacity="0.65" />
      <Line x1="27" y1="27" x2="44" y2="16" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <Line x1="27" y1="27" x2="48" y2="35" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <Line x1="27" y1="27" x2="38" y2="48" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <Line x1="27" y1="27" x2="16" y2="48" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <Line x1="27" y1="27" x2="6"  y2="35" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <Line x1="27" y1="27" x2="10" y2="16" stroke={color} strokeWidth="1.2" opacity="0.65" />
      <Path d="M20 14 Q27 10 34 14" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      <Path d="M14 22 Q27 16 40 22" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      <Path d="M10 32 Q27 24 44 32" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4" />
      <Path d="M12 42 Q27 34 42 42" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3" />
    </Svg>
  );
}

// ── BatSymbolIcon (Бэтмен) ────────────────────────────────────────────────
export function BatSymbolIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 22 Q20 20 14 24 Q8 28 6 36 Q12 32 18 34 Q22 36 24 30 Q26 26 27 28 Q28 26 30 30 Q32 36 36 34 Q42 32 48 36 Q46 28 40 24 Q34 20 27 22Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Path d="M20 22 L14 14 L22 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.7" />
      <Path d="M34 22 L40 14 L32 20" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.7" />
    </Svg>
  );
}

// ── ChampagneIcon (Джей Гэтсби) ───────────────────────────────────────────
export function ChampagneIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M20 8 L22 28 Q24 34 27 34 Q30 34 32 28 L34 8 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="27" y1="34" x2="27" y2="46" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M21 46 L33 46" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="24" cy="24" r="1"   stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <Circle cx="27" cy="20" r="1"   stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <Circle cx="30" cy="16" r="1"   stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <Circle cx="25" cy="14" r="0.8" stroke={color} strokeWidth="0.9" fill="none" opacity="0.4" />
      <Path d="M21 8 Q24 5 27 6 Q30 5 33 8" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
    </Svg>
  );
}

// ── HeaddressIcon (Нефертити) ─────────────────────────────────────────────
export function HeaddressIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="19" y="10" width="16" height="18" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="17" y="8"  width="20" height="4"  rx="1" stroke={color} strokeWidth="1.3" fill="none" opacity="0.7" />
      <Line x1="19" y1="20" x2="35" y2="20" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <Path d="M22 28 Q20 34 20 40 L34 40 Q34 34 32 28" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M20 32 Q17 34 18 38 Q20 36 20 34" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
      <Path d="M23 34 Q25 32 27 33 Q29 34 31 32" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
    </Svg>
  );
}

// ── LotusIcon (Будда) ─────────────────────────────────────────────────────
export function LotusIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 32 Q22 22 22 16 Q24 10 27 10 Q30 10 32 16 Q32 22 27 32Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M27 32 Q16 24 14 18 Q14 12 18 12 Q22 12 24 18 Q26 24 27 32Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.75" />
      <Path d="M27 32 Q38 24 40 18 Q40 12 36 12 Q32 12 30 18 Q28 24 27 32Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.75" />
      <Path d="M27 32 Q10 26 8 20 Q8 14 12 14 Q18 14 22 22" stroke={color} strokeWidth="1" fill="none" opacity="0.45" />
      <Path d="M27 32 Q44 26 46 20 Q46 14 42 14 Q36 14 32 22" stroke={color} strokeWidth="1" fill="none" opacity="0.45" />
      <Path d="M10 38 Q20 34 27 36 Q34 34 44 38" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5" />
    </Svg>
  );
}

// ── PipeSmokeIcon (Сталин) ────────────────────────────────────────────────
export function PipeSmokeIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M24 32 Q22 28 22 24 Q22 20 26 20 L32 20 Q36 20 36 24 Q36 28 34 32" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M24 32 L14 38 Q10 40 8 38" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M34 32 L36 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M29 20 Q26 14 28 8 Q30 12 28 16 Q30 10 32 6 Q32 12 30 16" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
      <Path d="M25 20 Q22 12 24 6 Q26 10 24 14" stroke={color} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.3" />
    </Svg>
  );
}

// ── InkwellIcon (Антон Чехов) ─────────────────────────────────────────────
export function InkwellIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M18 42 L16 28 Q16 22 27 22 Q38 22 38 28 L36 42 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Ellipse cx="27" cy="22" rx="7" ry="3" stroke={color} strokeWidth="1.3" fill="none" />
      <Ellipse cx="27" cy="20" rx="5" ry="2" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <Path d="M27 20 L38 6 Q42 4 44 8 Q44 12 40 14 Q36 16 32 16 L27 20" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M32 16 L38 10" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
    </Svg>
  );
}

// ── BatonIcon (Чайковский) ────────────────────────────────────────────────
export function BatonIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M10 44 L42 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M10 44 L16 38" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="42" cy="10" r="2" stroke={color} strokeWidth="1.3" fill="none" opacity="0.7" />
      <Path d="M32 26 Q36 22 38 26 Q36 28 34 26" stroke={color} strokeWidth="1.1" fill="none" opacity="0.5" />
      <Line x1="38" y1="22" x2="38" y2="32" stroke={color} strokeWidth="1" opacity="0.4" />
      <Path d="M20 38 Q22 34 26 36" stroke={color} strokeWidth="1.1" fill="none" opacity="0.35" />
    </Svg>
  );
}

// ── PastaIcon (Тони Сопрано) ──────────────────────────────────────────────
export function PastaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="38" rx="18" ry="8" stroke={color} strokeWidth="1.5" fill="none" />
      <Ellipse cx="27" cy="38" rx="14" ry="5" stroke={color} strokeWidth="1" fill="none" opacity="0.35" />
      <Path d="M16 38 Q18 28 22 24 Q26 20 28 26 Q30 32 26 36" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M20 38 Q22 30 26 26 Q30 22 32 28 Q34 34 30 38" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
      <Path d="M24 38 Q26 28 30 24 Q34 20 34 28 Q34 36 32 38" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      <Line x1="36" y1="14" x2="36" y2="20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <Line x1="38" y1="14" x2="38" y2="20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <Line x1="40" y1="14" x2="40" y2="20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <Path d="M38 20 L38 34" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
    </Svg>
  );
}

// ── JumpmanIcon (Майкл Джордан) ───────────────────────────────────────────
export function JumpmanIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="32" cy="10" r="4" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M32 14 Q30 20 26 22 Q22 24 18 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M30 17 Q36 12 40 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="42" cy="7" r="4" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M42 3 Q44 7 42 11" stroke={color} strokeWidth="0.9" fill="none" opacity="0.5" />
      <Path d="M28 20 Q22 18 18 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M26 22 Q22 30 18 36 Q16 40 18 42" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M26 22 Q30 30 32 36 Q34 42 30 46" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

// ── MouthguardIcon (Майк Тайсон) ──────────────────────────────────────────
export function MouthguardIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M12 26 Q12 18 27 18 Q42 18 42 26 L40 34 Q36 40 27 40 Q18 40 14 34 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M16 26 L16 30 M21 25 L21 31 M26 24 L26 32 M31 24 L31 32 M36 25 L36 31 M41 26 L41 30" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      <Path d="M16 26 Q20 22 27 22 Q34 22 38 26 L38 30 Q34 36 27 36 Q20 36 16 30 Z" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
    </Svg>
  );
}

// ── ScarfIcon (Микаса Аккерман) ───────────────────────────────────────────
export function ScarfIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M10 16 Q18 8 27 14 Q36 20 44 14" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M12 22 Q20 14 27 20 Q34 26 44 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <Path d="M10 28 Q18 22 27 26 Q34 30 42 22" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
      <Path d="M38 14 Q42 24 40 36 Q38 44 42 48" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <Path d="M44 14 Q46 22 44 34 Q42 42 46 48" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
    </Svg>
  );
}

// ── PowerupIcon (Гохан) ────────────────────────────────────────────────────
export function PowerupIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="6" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="27" y1="21" x2="27" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="27" y1="33" x2="27" y2="46" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="21" y1="27" x2="8" y2="27" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="33" y1="27" x2="46" y2="27" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="22.8" y1="22.8" x2="14" y2="14" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="31.2" y1="22.8" x2="40" y2="14" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="22.8" y1="31.2" x2="14" y2="40" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="31.2" y1="31.2" x2="40" y2="40" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Circle cx="27" cy="27" r="2.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
    </Svg>
  );
}

// ── DragonslayerIcon (Гатс) ───────────────────────────────────────────────
export function DragonslayerIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="20" y="6" width="14" height="34" rx="1" stroke={color} strokeWidth="1.6" fill="none" />
      <Path d="M20 8 L27 6 L34 8" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <Line x1="14" y1="38" x2="40" y2="38" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Rect x="24" y="40" width="6" height="12" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="20" y1="20" x2="34" y2="20" stroke={color} strokeWidth="0.8" opacity="0.35" />
      <Line x1="20" y1="26" x2="34" y2="26" stroke={color} strokeWidth="0.8" opacity="0.35" />
    </Svg>
  );
}

// ── EyePatchIcon (Канеки Кен) ─────────────────────────────────────────────
export function EyePatchIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="26" rx="14" ry="10" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="26" r="5" stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="27" cy="26" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.7" />
      <Path d="M27 16 L24 8 M27 16 L30 8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      <Path d="M20 20 L12 14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      <Path d="M34 20 L42 14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      <Path d="M15 30 L9 36" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <Path d="M39 30 L45 36" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}

// ── RebellionIcon (Данте) ─────────────────────────────────────────────────
export function RebellionIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 6 L29 8 L29 36 L27 44 L25 36 L25 8 Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Line x1="14" y1="34" x2="40" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M14 34 Q10 30 12 26" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <Path d="M40 34 Q44 30 42 26" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <Rect x="25" y="44" width="4" height="6" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="27" cy="50" r="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      <Path d="M25 14 L23 10 M29 14 L31 10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

// ── Compass2Icon (Натан Дрейк) ────────────────────────────────────────────
export function Compass2Icon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="20" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="27" cy="27" r="16" stroke={color} strokeWidth="0.8" fill="none" opacity="0.4" />
      <Path d="M27 7 L30 22 L27 25 L24 22 Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <Path d="M27 47 L24 32 L27 29 L30 32 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.6" />
      <Path d="M7 27 L22 24 L25 27 L22 30 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.6" />
      <Path d="M47 27 L32 30 L29 27 L32 24 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.6" />
      <Circle cx="27" cy="27" r="2" stroke={color} strokeWidth="1.2" fill="none" />
    </Svg>
  );
}

// ── SpearIcon (Алой) ──────────────────────────────────────────────────────
export function SpearIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="12" x2="27" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M21 24 L27 10 L33 24 Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Path d="M23 24 L27 14 L31 24" stroke={color} strokeWidth="0.9" fill="none" opacity="0.4" />
      <Line x1="23" y1="44" x2="31" y2="44" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Path d="M22 30 Q24 28 26 30" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
      <Path d="M28 34 Q30 32 32 34" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
    </Svg>
  );
}

// ── GloveIcon (Майкл Джексон) ─────────────────────────────────────────────
export function GloveIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M20 44 L20 26 Q20 22 24 22 Q26 22 26 26 Q26 22 28 20 Q30 18 32 20 Q34 18 36 20 Q38 22 36 26 Q38 22 40 24 Q42 28 38 30 L38 44 Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <Line x1="20" y1="38" x2="38" y2="38" stroke={color} strokeWidth="0.9" opacity="0.35" />
      <Circle cx="24" cy="16" r="1.2" stroke={color} strokeWidth="0.9" fill="none" opacity="0.6" />
      <Circle cx="30" cy="12" r="1.2" stroke={color} strokeWidth="0.9" fill="none" opacity="0.6" />
      <Circle cx="36" cy="14" r="1.2" stroke={color} strokeWidth="0.9" fill="none" opacity="0.6" />
      <Circle cx="42" cy="18" r="1" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" />
      <Circle cx="16" cy="20" r="1" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" />
    </Svg>
  );
}

// ── RastaIcon (Боб Марли) ─────────────────────────────────────────────────
export function RastaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="38" rx="10" ry="11" stroke={color} strokeWidth="1.5" fill="none" />
      <Ellipse cx="27" cy="24" rx="7" ry="8" stroke={color} strokeWidth="1.4" fill="none" />
      <Circle cx="27" cy="38" r="3.5" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <Line x1="27" y1="8" x2="27" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Rect x="24" y="5" width="6" height="4" rx="1" stroke={color} strokeWidth="1.2" fill="none" />
      <Line x1="27" y1="27" x2="27" y2="32" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

// ── LipsIcon (Мэрилин Монро) ──────────────────────────────────────────────
export function LipsIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M10 27 Q15 20 27 22 Q39 20 44 27" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M10 27 Q15 36 27 38 Q39 36 44 27" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M10 27 Q15 22 20 23 Q24 24 27 22 Q30 24 34 23 Q39 22 44 27" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
      <Path d="M20 27 Q24 30 27 30 Q30 30 34 27" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

// ── NunchakuIcon (Брюс Ли) ────────────────────────────────────────────────
export function NunchakuIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="10" y="12" width="6" height="18" rx="3" stroke={color} strokeWidth="1.4" fill="none" />
      <Rect x="38" y="24" width="6" height="18" rx="3" stroke={color} strokeWidth="1.4" fill="none" />
      <Path d="M16 20 Q22 16 28 18 Q34 20 38 24" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Ellipse cx="21" cy="18" rx="2.5" ry="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
      <Ellipse cx="27" cy="19" rx="2.5" ry="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
      <Ellipse cx="33" cy="21" rx="2.5" ry="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
    </Svg>
  );
}

// ── ZigzagIcon (Дэвид Боуи) ───────────────────────────────────────────────
export function ZigzagIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M24 6 L34 6 L22 28 L32 28 L18 48 L22 40 L14 40 L28 20 L18 20 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

// ── CartoucheIcon (Рамзес II) ─────────────────────────────────────────────
export function CartoucheIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Rect x="17" y="8" width="20" height="36" rx="10" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="12" y1="44" x2="42" y2="44" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="27" cy="18" r="3" stroke={color} strokeWidth="1.2" fill="none" opacity="0.8" />
      <Line x1="23" y1="25" x2="31" y2="25" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <Path d="M23 30 L27 28 L31 30" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <Line x1="25" y1="35" x2="29" y2="35" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

// ── SpartanIcon (Леонид I) ────────────────────────────────────────────────
export function SpartanIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M15 30 Q15 16 22 10 Q27 6 32 10 Q39 16 39 30 L37 34 Q33 38 27 38 Q21 38 17 34 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M21 30 L21 36" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <Path d="M33 30 L33 36" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <Rect x="24" y="26" width="6" height="14" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
      <Path d="M13 8 Q20 4 27 4 Q34 4 41 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M13 8 L10 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── CapIcon (Ленин) ───────────────────────────────────────────────────────
export function CapIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M12 32 Q12 22 27 20 Q42 22 42 32" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M10 34 Q10 36 27 36 Q44 36 44 34 L42 32 L12 32 Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <Path d="M8 36 Q8 40 14 40 L40 40 Q46 40 46 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Line x1="12" y1="32" x2="42" y2="32" stroke={color} strokeWidth="0.8" opacity="0.4" />
    </Svg>
  );
}

// ── PrismIcon (Ломоносов) ─────────────────────────────────────────────────
export function PrismIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M27 8 L44 40 L10 40 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="6" y1="20" x2="18" y2="24" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Path d="M44 40 L50 34" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
      <Path d="M44 40 L50 38" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <Path d="M44 40 L50 42" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <Path d="M44 40 L50 46" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <Path d="M44 40 L50 50" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}

// ── BeakerIcon (Джесси Пинкман) ───────────────────────────────────────────
export function BeakerIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M20 10 L20 28 L12 42 Q12 46 27 46 Q42 46 42 42 L34 28 L34 10 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="20" y1="10" x2="34" y2="10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Line x1="34" y1="6" x2="34" y2="10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Path d="M16 36 Q22 32 27 34 Q32 36 38 32" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.55" />
      <Circle cx="22" cy="40" r="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <Circle cx="30" cy="42" r="1.2" stroke={color} strokeWidth="0.9" fill="none" opacity="0.45" />
    </Svg>
  );
}

// ── QueenCrownIcon (Серсея Ланнистер) ─────────────────────────────────────
export function QueenCrownIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M10 38 L10 24 L16 14 L22 24 L27 12 L32 24 L38 14 L44 24 L44 38 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Rect x="10" y="38" width="34" height="6" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="20" cy="41" r="1.8" stroke={color} strokeWidth="1" fill="none" opacity="0.7" />
      <Circle cx="27" cy="41" r="2" stroke={color} strokeWidth="1.1" fill="none" opacity="0.8" />
      <Circle cx="34" cy="41" r="1.8" stroke={color} strokeWidth="1" fill="none" opacity="0.7" />
    </Svg>
  );
}

// ── RacketIcon (Роджер Федерер) ───────────────────────────────────────────
export function RacketIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Ellipse cx="27" cy="22" rx="14" ry="16" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="27" y1="38" x2="27" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="22" y1="8" x2="22" y2="36" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <Line x1="27" y1="6" x2="27" y2="38" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <Line x1="32" y1="8" x2="32" y2="36" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <Line x1="13" y1="18" x2="41" y2="18" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <Line x1="13" y1="24" x2="41" y2="24" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <Line x1="13" y1="30" x2="41" y2="30" stroke={color} strokeWidth="0.9" opacity="0.4" />
    </Svg>
  );
}

// ── WorldCupIcon (Лионель Месси) ──────────────────────────────────────────
export function WorldCupIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M20 10 L34 10 Q36 20 32 28 L30 34 L34 34 L34 40 L20 40 L20 34 L24 34 L22 28 Q18 20 20 10 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M20 16 Q14 14 12 20 Q14 28 20 26" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <Path d="M34 16 Q40 14 42 20 Q40 28 34 26" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <Ellipse cx="27" cy="41" rx="10" ry="3" stroke={color} strokeWidth="1.2" fill="none" />
      <Ellipse cx="27" cy="46" rx="12" ry="3" stroke={color} strokeWidth="1.2" fill="none" />
      <Path d="M27 4 L28.5 8 L32 8 L29.5 10 L30.5 14 L27 12 L23.5 14 L24.5 10 L22 8 L25.5 8 Z" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.75" />
    </Svg>
  );
}

// ── Manuscript (Bulgakov — burning manuscript) ─────────────────────────────
export function ManuscriptIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M15 42 Q15 14 27 11 Q39 14 39 42" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="11" y1="42" x2="43" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="20" y1="21" x2="34" y2="21" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <Line x1="20" y1="27" x2="34" y2="27" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <Line x1="20" y1="33" x2="34" y2="33" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <Path d="M13 47 Q11 43 13 40" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55" />
      <Path d="M41 47 Q43 43 41 40" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55" />
    </Svg>
  );
}

// ── Birch (Esenin — birch tree) ────────────────────────────────────────────
export function BirchIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="7" x2="27" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M27 17 Q18 15 13 21 Q18 25 27 23" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Path d="M27 26 Q37 24 42 30 Q37 34 27 32" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Path d="M27 35 Q19 34 15 39 Q19 43 27 41" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Line x1="22" y1="11" x2="22" y2="14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
      <Line x1="32" y1="15" x2="32" y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
    </Svg>
  );
}

// ── Megaphone (Mayakovsky) ─────────────────────────────────────────────────
export function MegaphoneIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M7 21 L7 33 L19 33 L37 45 L37 9 L19 21 Z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <Line x1="19" y1="21" x2="19" y2="33" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <Path d="M43 17 Q47 27 43 37" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.65" />
      <Path d="M40 20 Q43 27 40 34" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}

// ── Grand Piano (Rachmaninov) ──────────────────────────────────────────────
export function GrandPianoIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M7 36 L7 17 Q7 11 19 9 L45 9 Q49 9 49 15 L49 36 Q41 40 7 36 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M7 36 Q27 40 49 36" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.5" />
      <Line x1="17" y1="36" x2="17" y2="45" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="39" y1="36" x2="39" y2="45" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="19" y1="14" x2="19" y2="30" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <Line x1="24" y1="13" x2="24" y2="29" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <Line x1="31" y1="12" x2="31" y2="28" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
      <Line x1="36" y1="12" x2="36" y2="28" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
    </Svg>
  );
}

// ── Peace Atom (Sakharov) ──────────────────────────────────────────────────
export function PeaceAtomIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Circle cx="27" cy="27" r="3.5" fill={color} />
      <Ellipse cx="27" cy="27" rx="20" ry="7" stroke={color} strokeWidth="1.4" fill="none" />
      <Ellipse cx="27" cy="27" rx="20" ry="7" stroke={color} strokeWidth="1.4" fill="none" transform="rotate(60 27 27)" />
      <Ellipse cx="27" cy="27" rx="20" ry="7" stroke={color} strokeWidth="1.4" fill="none" transform="rotate(120 27 27)" />
      <Circle cx="27" cy="27" r="23" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
    </Svg>
  );
}

// ── Barbed Wire (Solzhenitsyn) ─────────────────────────────────────────────
export function BarbedWireIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="5" y1="19" x2="49" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="5" y1="35" x2="49" y2="35" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="14" cy="19" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="27" cy="19" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="40" cy="19" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="20" cy="35" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="34" cy="35" r="3" stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="14" y1="16" x2="11" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <Line x1="14" y1="16" x2="17" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <Line x1="27" y1="16" x2="24" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <Line x1="27" y1="16" x2="30" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <Line x1="40" y1="16" x2="37" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <Line x1="40" y1="16" x2="43" y2="13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    </Svg>
  );
}

// ── Feather Pen (Turgenev) ─────────────────────────────────────────────────
export function FeatherPenIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M11 46 Q16 37 22 31 Q31 20 46 8" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Path d="M46 8 Q39 13 35 19 Q30 27 22 31" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6" />
      <Path d="M11 46 L15 42" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Path d="M17 48 Q14 46 11 46 Q11 43 13 41" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
    </Svg>
  );
}

// ── Troika (Gogol — three horses) ──────────────────────────────────────────
export function TroikaIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path d="M6 40 Q7 30 13 26 Q17 22 19 26 L19 40" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18 40 Q19 27 27 23 Q31 19 34 23 L34 40" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M33 40 Q34 30 41 26 Q45 22 47 26 L47 40" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="5" y1="40" x2="49" y2="40" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="6" y1="34" x2="48" y2="34" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" strokeDasharray="3 3" />
    </Svg>
  );
}

// ── Autumn Leaf (Bunin) ────────────────────────────────────────────────────
export function AutumnLeafIcon({ size = 54, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Line x1="27" y1="47" x2="27" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M27 22 Q22 16 17 18 Q20 12 27 10 Q34 12 37 18 Q32 16 27 22" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M27 27 Q18 24 12 28 Q14 21 21 21 Q23 21 25 23" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" />
      <Path d="M27 27 Q36 24 42 28 Q40 21 33 21 Q31 21 29 23" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" />
      <Path d="M27 34 Q20 32 14 36 Q17 40 22 38 Q24 40 27 42" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" />
      <Path d="M27 34 Q34 32 40 36 Q37 40 32 38 Q30 40 27 42" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" />
    </Svg>
  );
}

// ── Black Hole Logo (large — splash) ──────────────────────────────────────
export function BlackHoleLogo({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <Circle cx="36" cy="36" r="34" stroke="white" strokeWidth="0.4" fill="none" opacity="0.05" />
      <Circle cx="36" cy="36" r="30" stroke="white" strokeWidth="0.5" fill="none" opacity="0.07" />
      <Circle cx="36" cy="36" r="26" stroke="white" strokeWidth="0.5" fill="none" opacity="0.1"  />
      {/* Accretion disk back arc */}
      <Path d="M10 36 A26 8 0 0 1 62 36" stroke="white" strokeWidth="1.2" fill="none" opacity="0.18" strokeLinecap="round" />
      {/* Event horizon */}
      <Circle cx="36" cy="36" r="14" fill="#000000" />
      {/* Photon ring */}
      <Circle cx="36" cy="36" r="18.5" stroke="white" strokeWidth="2.8" fill="none" opacity="0.88" />
      <Circle cx="36" cy="36" r="14.8" stroke="white" strokeWidth="0.6" fill="none" opacity="0.22" />
      {/* Accretion disk front arc */}
      <Path d="M10 36 A26 8 0 0 0 62 36" stroke="white" strokeWidth="3.2" fill="none" opacity="0.92" strokeLinecap="round" />
      {/* Relativistic jet */}
      <Line x1="36" y1="4"  x2="36" y2="16" stroke="white" strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />
      <Line x1="36" y1="56" x2="36" y2="68" stroke="white" strokeWidth="0.8" opacity="0.18" strokeLinecap="round" />
    </Svg>
  );
}

// ── Black Hole Logo (small — header) ──────────────────────────────────────
export function BlackHoleLogoSmall({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Circle cx="15" cy="15" r="13" stroke="white" strokeWidth="0.4" fill="none" opacity="0.08" />
      <Path d="M4 15 A11 3.5 0 0 1 26 15" stroke="white" strokeWidth="0.7" fill="none" opacity="0.2" strokeLinecap="round" />
      <Circle cx="15" cy="15" r="6"  fill="black" />
      <Circle cx="15" cy="15" r="8"  stroke="white" strokeWidth="1.8" fill="none" opacity="0.88" />
      <Path d="M4 15 A11 3.5 0 0 0 26 15" stroke="white" strokeWidth="2.2" fill="none" opacity="0.92" strokeLinecap="round" />
      <Line x1="15" y1="2" x2="15" y2="6" stroke="white" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── GitHub icon ────────────────────────────────────────────────────────────
export function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
        fill="white"
      />
    </Svg>
  );
}

// ── Navigation icons ───────────────────────────────────────────────────────
export function NavHomeIcon({ color = '#4A4A4A' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path d="M3 9.5L11 3L19 9.5V19C19 19.55 18.55 20 18 20H14V15H8V20H4C3.45 20 3 19.55 3 19V9.5Z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  );
}

export function NavCatalogIcon({ color = '#4A4A4A' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.5" />
      <Path d="M8 11h6M11 8v6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function NavMyIcon({ color = '#4A4A4A' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path d="M3 18V7L11 3L19 7V18" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Rect x="8" y="12" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

export function NavProfileIcon({ color = '#4A4A4A' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="7" r="4" stroke={color} strokeWidth="1.5" />
      <Path d="M3 19c0-4 3.58-6 8-6s8 2 8 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ color = '#4A4A4A', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M6 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SearchIcon({ color = '#606060', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx="6.5" cy="6.5" r="5.5" stroke={color} strokeWidth="1.5" />
      <Line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function FilterIcon({ color = '#606060', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M2 4h12M4 8h8M6 12h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function BackIcon({ color = '#888888', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M11 4L6 9L11 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function StarIcon({ color = '#888888', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M9 1l2 6h6L12 11l2 6-5-3.5L4 17l2-6L1 7h6z"
        stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </Svg>
  );
}

export function ClockIcon({ color = '#888888', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="1.4" />
      <Path d="M9 5v4l3 2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function MoreIcon({ color = '#888888', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9"  cy="9" r="1.5" fill={color} />
      <Circle cx="14" cy="9" r="1.5" fill={color} />
      <Circle cx="4"  cy="9" r="1.5" fill={color} />
    </Svg>
  );
}

export function MicIcon({ color = '#888888', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="8" y="2" width="8" height="13" rx="4" stroke={color} strokeWidth="1.5" />
      <Path d="M5 12a7 7 0 0014 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="9" y1="22" x2="15" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function SendIcon({ size = 16, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9L1.5 6L14.5 1.5Z"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PlusIcon({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M8 2v12M2 8h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function BulbIcon({ color = '#888888', size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M7 1C4 1 2 3 2 5.5c0 1.5.7 2.8 1.8 3.7V11h6.4V9.2C11.3 8.3 12 7 12 5.5 12 3 10 1 7 1Z"
        stroke={color} strokeWidth="1.2" />
      <Path d="M4.5 11v1.5h5V11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

export function UserIcon({ color = '#A0A0A0', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="6" r="3.5" stroke={color} strokeWidth="1.4" />
      <Path d="M2 16c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function SettingsIcon({ color = '#A0A0A0', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="3" stroke={color} strokeWidth="1.4" />
      <Path
        d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42"
        stroke={color} strokeWidth="1.4" strokeLinecap="round"
      />
    </Svg>
  );
}

export function BellIcon({ color = '#A0A0A0', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Rect x="2" y="3" width="14" height="12" rx="2.5" stroke={color} strokeWidth="1.4" />
      <Path d="M2 7h14" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Rect x="5" y="10" width="2" height="2" rx="0.5" fill={color} />
      <Rect x="8" y="10" width="2" height="2" rx="0.5" fill={color} />
    </Svg>
  );
}

export function ShieldIcon({ color = '#A0A0A0', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M9 2C5.13 2 2 5.13 2 9s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" stroke={color} strokeWidth="1.4" />
      <Path d="M9 6v4M9 12.5v.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function LogoutIcon({ color = '#EF4444', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M7 3H4C3.45 3 3 3.45 3 4V14C3 14.55 3.45 15 4 15H7"
        stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Path d="M12 6L15 9L12 12" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="7" y1="9" x2="15" y2="9" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function AddAvatarIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M14 4C10.13 4 7 7.13 7 11C7 14.87 10.13 18 14 18C17.87 18 21 14.87 21 11C21 7.13 17.87 4 14 4Z"
        stroke="#606060" strokeWidth="1.5" />
      <Path d="M3 24C3 20.13 8.37 17 14 17C19.63 17 25 20.13 25 24"
        stroke="#606060" strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="22" cy="22" r="5.5" fill="#FFFFFF" />
      <Path d="M22 19.5v5M19.5 22h5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Sparkle ────────────────────────────────────────────────────────────────
export function SparkleIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M9 1 L10.2 7.8 L17 9 L10.2 10.2 L9 17 L7.8 10.2 L1 9 L7.8 7.8 Z"
        stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

// ── Infinity ───────────────────────────────────────────────────────────────
export function InfinityIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M6.5 9C6.5 7.07 7.57 5.5 9 5.5C10.43 5.5 11.5 7.07 11.5 9C11.5 10.93 10.43 12.5 9 12.5C7.57 12.5 6.5 10.93 6.5 9Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <Path d="M2 9C2 7.07 3.07 5.5 5 5.5C6.43 5.5 7.57 6.7 8.5 9C7.57 11.3 6.43 12.5 5 12.5C3.07 12.5 2 10.93 2 9Z"
        stroke={color} strokeWidth="1.4" fill="none" />
      <Path d="M16 9C16 7.07 14.93 5.5 13 5.5C11.57 5.5 10.43 6.7 9.5 9C10.43 11.3 11.57 12.5 13 12.5C14.93 12.5 16 10.93 16 9Z"
        stroke={color} strokeWidth="1.4" fill="none" />
    </Svg>
  );
}

// ── Age Restricted (18+) ───────────────────────────────────────────────────
export function AgeRestrictedIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Rect x="1.5" y="1.5" width="15" height="15" rx="3" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M5 13V5M5 5L7.5 7.5M5 5L2.5 7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 13V5H12.5C13.88 5 15 6.12 15 7.5C15 8.88 13.88 10 12.5 10H10" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Palette ────────────────────────────────────────────────────────────────
export function PaletteIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M9 2C5.13 2 2 5.13 2 9C2 12.87 5.13 16 9 16C10.1 16 11 15.1 11 14C11 13.48 10.8 13.01 10.46 12.65C10.13 12.3 9.94 11.84 9.94 11.35C9.94 10.28 10.81 9.41 11.88 9.41H13.06C14.68 9.41 16 8.09 16 6.47C16 3.97 12.86 2 9 2Z"
        stroke={color} strokeWidth="1.3" fill="none" />
      <Circle cx="5.5" cy="9" r="1" fill={color} />
      <Circle cx="7" cy="5.5" r="1" fill={color} />
      <Circle cx="11" cy="5" r="1" fill={color} />
    </Svg>
  );
}

// ── Smile ──────────────────────────────────────────────────────────────────
export function SmileIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="1.4" fill="none" />
      <Path d="M6 10.5C6.5 12 7.5 13 9 13C10.5 13 11.5 12 12 10.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <Circle cx="6.5" cy="7.5" r="0.9" fill={color} />
      <Circle cx="11.5" cy="7.5" r="0.9" fill={color} />
    </Svg>
  );
}

// ── Moon ───────────────────────────────────────────────────────────────────
export function MoonIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M14 11.5C13 13 11.1 14 9 14C5.69 14 3 11.31 3 8C3 5.9 4 4 5.5 3C4.5 4.2 4 5.5 4 7C4 10.31 6.69 13 10 13C11.5 13 12.8 12.5 14 11.5Z"
        stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

// ── Flower ─────────────────────────────────────────────────────────────────
export function FlowerIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="2" stroke={color} strokeWidth="1.3" fill="none" />
      <Ellipse cx="9" cy="4.5" rx="1.5" ry="2.5" stroke={color} strokeWidth="1.2" fill="none" />
      <Ellipse cx="9" cy="13.5" rx="1.5" ry="2.5" stroke={color} strokeWidth="1.2" fill="none" />
      <Ellipse cx="4.5" cy="9" rx="2.5" ry="1.5" stroke={color} strokeWidth="1.2" fill="none" />
      <Ellipse cx="13.5" cy="9" rx="2.5" ry="1.5" stroke={color} strokeWidth="1.2" fill="none" />
    </Svg>
  );
}

// ── Message / Chat bubble ──────────────────────────────────────────────────
export function MessageIcon({ size = 18, color = 'white' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M2 3C2 2.45 2.45 2 3 2H15C15.55 2 16 2.45 16 3V12C16 12.55 15.55 13 15 13H6L2 16V3Z"
        stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
