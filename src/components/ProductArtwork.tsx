import React from 'react';

interface ProductArtworkProps {
  artType: 'tube' | 'clay' | 'cologne' | 'deodorant' | 'pump' | 'comb' | 'carabiner' | 'scrub_bar' | 'beard_serum';
  className?: string;
  badge?: string;
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({ artType, className = '', badge }) => {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none bg-gradient-to-b from-[#18181B] to-[#0D0D0E] p-6 border border-[#27272A] ${className}`}>
      {/* Background blueprint subtle grid lines & tactical corners */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Tactical Corner Markings */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#E31B23]/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#52525B] pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#52525B] pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#E31B23]/60 pointer-events-none" />

      {/* Technical Spec Code watermark in background */}
      <div className="absolute top-3 right-3 text-[9px] font-mono text-[#71717A] tracking-wider uppercase pointer-events-none">
        CAD.REF // {artType.toUpperCase()}
      </div>

      {badge && (
        <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-[#09090B]/90 border border-[#E31B23]/40 text-[#E31B23] text-[9px] font-mono font-bold tracking-widest uppercase">
          {badge}
        </div>
      )}

      {/* VECTOR ARTWORK BASED ON TYPE */}
      {artType === 'tube' && (
        <svg viewBox="0 0 200 240" className="w-44 h-48 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="tubeBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1C1C1E" />
              <stop offset="25%" stopColor="#2C2C2E" />
              <stop offset="55%" stopColor="#18181A" />
              <stop offset="100%" stopColor="#0F0F11" />
            </linearGradient>
            <linearGradient id="crimpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3A3A3C" />
              <stop offset="50%" stopColor="#242426" />
              <stop offset="100%" stopColor="#18181A" />
            </linearGradient>
          </defs>
          {/* Squeeze Tube Cap */}
          <rect x="75" y="200" width="50" height="24" rx="2" fill="#141416" stroke="#3F3F46" strokeWidth="1.5" />
          <line x1="75" y1="210" x2="125" y2="210" stroke="#E31B23" strokeWidth="1.5" />
          <rect x="85" y="224" width="30" height="6" rx="1" fill="#09090B" />
          
          {/* Main Tube Body */}
          <path d="M 50 35 L 150 35 L 138 200 L 62 200 Z" fill="url(#tubeBody)" stroke="#3F3F46" strokeWidth="1.5" />
          
          {/* Top Crimp */}
          <rect x="46" y="24" width="108" height="12" fill="url(#crimpGrad)" stroke="#52525B" strokeWidth="1.5" />
          <line x1="48" y1="28" x2="152" y2="28" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="3 2" />
          
          {/* Orange Hazard Accent Bar */}
          <rect x="58" y="55" width="84" height="4" fill="#E31B23" />
          
          {/* Brand Stencil Typography on Tube */}
          <text x="100" y="82" fill="#F4F4F5" fontSize="16" fontFamily="'Syne', sans-serif" fontWeight="800" textAnchor="middle" letterSpacing="2">
            HIM.
          </text>
          <text x="100" y="98" fill="#A1A1AA" fontSize="7.5" fontFamily="'JetBrains Mono', monospace" fontWeight="600" textAnchor="middle" letterSpacing="1.5">
            DAILY FACE WASH
          </text>
          <text x="100" y="112" fill="#E31B23" fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="700" textAnchor="middle">
            2% NIACINAMIDE // CHARCOAL
          </text>

          {/* Barcode & Spec lines */}
          <rect x="68" y="130" width="64" height="18" fill="#0A0A0C" stroke="#27272A" strokeWidth="0.5" />
          <line x1="72" y1="134" x2="72" y2="144" stroke="#D4D4D8" strokeWidth="1.5" />
          <line x1="76" y1="134" x2="76" y2="144" stroke="#D4D4D8" strokeWidth="0.8" />
          <line x1="80" y1="134" x2="80" y2="144" stroke="#D4D4D8" strokeWidth="2" />
          <line x1="84" y1="134" x2="84" y2="144" stroke="#D4D4D8" strokeWidth="1.2" />
          <line x1="88" y1="134" x2="88" y2="144" stroke="#D4D4D8" strokeWidth="0.8" />
          <line x1="93" y1="134" x2="93" y2="144" stroke="#D4D4D8" strokeWidth="2.2" />
          <line x1="98" y1="134" x2="98" y2="144" stroke="#D4D4D8" strokeWidth="1" />
          <line x1="102" y1="134" x2="102" y2="144" stroke="#D4D4D8" strokeWidth="1.8" />
          <line x1="108" y1="134" x2="108" y2="144" stroke="#D4D4D8" strokeWidth="0.8" />
          <line x1="112" y1="134" x2="112" y2="144" stroke="#D4D4D8" strokeWidth="1.4" />
          <line x1="118" y1="134" x2="118" y2="144" stroke="#D4D4D8" strokeWidth="1.8" />
          <line x1="124" y1="134" x2="124" y2="144" stroke="#D4D4D8" strokeWidth="1" />

          <text x="100" y="165" fill="#71717A" fontSize="7" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            SPEC 01 // 100ML
          </text>
        </svg>
      )}

      {artType === 'clay' && (
        <svg viewBox="0 0 200 240" className="w-48 h-48 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="tubLid" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2A2A2E" />
              <stop offset="35%" stopColor="#3F3F46" />
              <stop offset="70%" stopColor="#202024" />
              <stop offset="100%" stopColor="#141416" />
            </linearGradient>
            <linearGradient id="tubBase" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1A1A1C" />
              <stop offset="40%" stopColor="#2C2C30" />
              <stop offset="80%" stopColor="#161618" />
              <stop offset="100%" stopColor="#0B0B0D" />
            </linearGradient>
          </defs>
          {/* Jar Base */}
          <ellipse cx="100" cy="175" rx="72" ry="24" fill="#0A0A0C" />
          <path d="M 28 115 L 28 165 C 28 180, 172 180, 172 165 L 172 115 Z" fill="url(#tubBase)" stroke="#3F3F46" strokeWidth="1.5" />
          
          {/* Jar Rim highlight */}
          <ellipse cx="100" cy="115" rx="72" ry="16" fill="#1C1C20" stroke="#52525B" strokeWidth="1" />

          {/* Heavy Gunmetal Lid with knurled grip lines */}
          <path d="M 24 82 L 24 112 C 24 125, 176 125, 176 112 L 176 82 Z" fill="url(#tubLid)" stroke="#52525B" strokeWidth="1.5" />
          <ellipse cx="100" cy="82" rx="76" ry="18" fill="#2E2E33" stroke="#71717A" strokeWidth="1.5" />
          
          {/* Top Lid Stencil Decal */}
          <ellipse cx="100" cy="82" rx="55" ry="12" fill="#18181A" stroke="#E31B23" strokeWidth="1" />
          <text x="100" y="84" fill="#F4F4F5" fontSize="13" fontFamily="'Syne', sans-serif" fontWeight="800" textAnchor="middle" letterSpacing="2">
            HIM. CLAY
          </text>
          <text x="100" y="93" fill="#E31B23" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" textAnchor="middle">
            85G // ZERO SHINE
          </text>

          {/* Jar side label */}
          <rect x="52" y="132" width="96" height="22" rx="2" fill="#0E0E10" stroke="#E31B23" strokeWidth="1" />
          <text x="100" y="144" fill="#F4F4F5" fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight="800" textAnchor="middle">
            PRECISION MATTE
          </text>
          <text x="100" y="152" fill="#A1A1AA" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            SPEC 02 // BENTONITE
          </text>
        </svg>
      )}

      {artType === 'cologne' && (
        <svg viewBox="0 0 200 240" className="w-44 h-48 drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]">
          <defs>
            <linearGradient id="glassBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B0B0D" />
              <stop offset="30%" stopColor="#222226" />
              <stop offset="70%" stopColor="#121215" />
              <stop offset="100%" stopColor="#050507" />
            </linearGradient>
            <linearGradient id="atomizerCap" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#27272A" />
              <stop offset="50%" stopColor="#3F3F46" />
              <stop offset="100%" stopColor="#18181B" />
            </linearGradient>
          </defs>
          {/* Heavy Faceted Cap */}
          <rect x="78" y="24" width="44" height="42" rx="2" fill="url(#atomizerCap)" stroke="#52525B" strokeWidth="1.5" />
          <line x1="78" y1="44" x2="122" y2="44" stroke="#E31B23" strokeWidth="1.5" />
          <text x="100" y="38" fill="#A1A1AA" fontSize="6" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            MIST-01
          </text>
          
          {/* Atomizer Collar */}
          <rect x="86" y="66" width="28" height="10" fill="#E31B23" />

          {/* Heavy Black Glass Flacon */}
          <rect x="44" y="76" width="112" height="136" rx="4" fill="url(#glassBody)" stroke="#3F3F46" strokeWidth="2" />
          {/* Beveled Side Reflections */}
          <line x1="52" y1="80" x2="52" y2="208" stroke="#52525B" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="148" y1="80" x2="148" y2="208" stroke="#27272A" strokeWidth="1" />

          {/* Smoked Interior Essence Window */}
          <rect x="62" y="94" width="76" height="88" rx="2" fill="#070709" stroke="#E31B23" strokeWidth="1" strokeDasharray="6 3" />
          
          {/* Typography Plate */}
          <text x="100" y="122" fill="#FAFAFA" fontSize="17" fontFamily="'Syne', sans-serif" fontWeight="800" textAnchor="middle" letterSpacing="3">
            HIM.
          </text>
          <text x="100" y="136" fill="#E31B23" fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight="800" textAnchor="middle" letterSpacing="1">
            EAU DE PARFUM
          </text>
          <text x="100" y="149" fill="#A1A1AA" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            BERGAMOT / BLACK AMBER
          </text>
          <text x="100" y="162" fill="#71717A" fontSize="6" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            POUR HOMME // 100 ML
          </text>

          {/* Bottom Weight Marker */}
          <line x1="68" y1="192" x2="132" y2="192" stroke="#3F3F46" strokeWidth="1" />
          <text x="100" y="202" fill="#52525B" fontSize="6" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            HIM // POUR HOMME
          </text>
        </svg>
      )}

      {artType === 'deodorant' && (
        <svg viewBox="0 0 200 240" className="w-46 h-48 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="deodGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E1E22" />
              <stop offset="50%" stopColor="#2D2D33" />
              <stop offset="100%" stopColor="#151518" />
            </linearGradient>
            <linearGradient id="deodGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#25252A" />
              <stop offset="50%" stopColor="#35353C" />
              <stop offset="100%" stopColor="#1B1B1F" />
            </linearGradient>
          </defs>
          {/* Cylinder 1 (Back Left) */}
          <rect x="36" y="55" width="54" height="145" rx="10" fill="url(#deodGrad1)" stroke="#3F3F46" strokeWidth="1.5" />
          <rect x="42" y="186" width="42" height="14" rx="2" fill="#0D0D0F" stroke="#27272A" strokeWidth="1" />
          <line x1="36" y1="78" x2="90" y2="78" stroke="#E31B23" strokeWidth="1" />
          <text x="63" y="110" fill="#71717A" fontSize="7" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" transform="rotate(-90 63 110)">
            UNIT A // 75G
          </text>

          {/* Cylinder 2 (Front Right) */}
          <rect x="74" y="40" width="76" height="165" rx="12" fill="url(#deodGrad2)" stroke="#52525B" strokeWidth="2" />
          
          {/* Domed Top Cap */}
          <path d="M 74 65 Q 112 40 150 65 Z" fill="#18181B" stroke="#52525B" strokeWidth="1.5" />
          <line x1="74" y1="72" x2="150" y2="72" stroke="#E31B23" strokeWidth="2" />
          
          {/* Bottom Twist Dial */}
          <rect x="84" y="188" width="56" height="16" rx="3" fill="#0F0F12" stroke="#E31B23" strokeWidth="1" />
          <line x1="90" y1="192" x2="90" y2="200" stroke="#71717A" strokeWidth="1" />
          <line x1="102" y1="192" x2="102" y2="200" stroke="#71717A" strokeWidth="1" />
          <line x1="114" y1="192" x2="114" y2="200" stroke="#71717A" strokeWidth="1" />
          <line x1="126" y1="192" x2="126" y2="200" stroke="#71717A" strokeWidth="1" />
          <line x1="138" y1="192" x2="138" y2="200" stroke="#71717A" strokeWidth="1" />

          {/* Center Stencil */}
          <text x="112" y="104" fill="#F4F4F5" fontSize="16" fontFamily="'Syne', sans-serif" fontWeight="800" textAnchor="middle">
            HIM.
          </text>
          <text x="112" y="120" fill="#E31B23" fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight="800" textAnchor="middle">
            72H UTILITY
          </text>
          <text x="112" y="134" fill="#A1A1AA" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            ALUMINUM-VOID
          </text>
          <text x="112" y="146" fill="#71717A" fontSize="6" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            SPEC 04 // DUAL PACK
          </text>
          <rect x="88" y="156" width="48" height="3" fill="#E31B23" />
        </svg>
      )}

      {artType === 'pump' && (
        <svg viewBox="0 0 200 240" className="w-44 h-48 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="pumpBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#141416" />
              <stop offset="35%" stopColor="#252528" />
              <stop offset="70%" stopColor="#18181A" />
              <stop offset="100%" stopColor="#0B0B0C" />
            </linearGradient>
          </defs>
          {/* Airless Pump Actuator Nozzle */}
          <rect x="82" y="18" width="36" height="26" rx="2" fill="#27272A" stroke="#52525B" strokeWidth="1.5" />
          <path d="M 118 25 L 140 28 L 140 36 L 118 34 Z" fill="#E31B23" />
          <circle cx="136" cy="32" r="1.5" fill="#000" />
          
          {/* Collar */}
          <rect x="76" y="44" width="48" height="16" fill="#1C1C1F" stroke="#3F3F46" strokeWidth="1" />
          <line x1="76" y1="52" x2="124" y2="52" stroke="#E31B23" strokeWidth="1.5" />

          {/* Main Airless Cylindrical Body */}
          <rect x="62" y="60" width="76" height="150" rx="6" fill="url(#pumpBody)" stroke="#3F3F46" strokeWidth="2" />

          {/* Transparent Inspection Gauge Window on Left Edge */}
          <rect x="68" y="75" width="6" height="120" rx="2" fill="#09090B" stroke="#27272A" strokeWidth="0.5" />
          <rect x="69" y="105" width="4" height="88" fill="#E31B23" fillOpacity="0.4" />
          <line x1="75" y1="85" x2="78" y2="85" stroke="#71717A" strokeWidth="1" />
          <line x1="75" y1="115" x2="78" y2="115" stroke="#71717A" strokeWidth="1" />
          <line x1="75" y1="145" x2="78" y2="145" stroke="#71717A" strokeWidth="1" />
          <line x1="75" y1="175" x2="78" y2="175" stroke="#71717A" strokeWidth="1" />

          {/* Center Graphics & Stencil */}
          <text x="105" y="96" fill="#F4F4F5" fontSize="15" fontFamily="'Syne', sans-serif" fontWeight="800" textAnchor="middle">
            HIM.
          </text>
          <text x="105" y="112" fill="#E31B23" fontSize="7.5" fontFamily="'JetBrains Mono', monospace" fontWeight="800" textAnchor="middle">
            HYDRATION DEFENSE
          </text>
          <text x="105" y="125" fill="#A1A1AA" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            AIRLESS VACUUM
          </text>
          <text x="105" y="138" fill="#71717A" fontSize="6" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            MATTE FINISH // 60ML
          </text>
          <text x="105" y="152" fill="#52525B" fontSize="5.5" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            CERAMIDE + HA COMPLEX
          </text>
          
          {/* Base Cap */}
          <rect x="66" y="202" width="68" height="8" rx="2" fill="#0C0C0E" stroke="#27272A" strokeWidth="1" />
        </svg>
      )}

      {artType === 'comb' && (
        <svg viewBox="0 0 200 240" className="w-48 h-48 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="carbonGrain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E1E22" />
              <stop offset="50%" stopColor="#2A2A2E" />
              <stop offset="100%" stopColor="#121214" />
            </linearGradient>
          </defs>
          {/* Carbon Fiber Comb Spine (Rotated diagonal presentation) */}
          <g transform="translate(100, 120) rotate(-35) translate(-95, -50)">
            {/* Comb Main Spine Bar */}
            <rect x="10" y="20" width="170" height="24" rx="3" fill="url(#carbonGrain)" stroke="#52525B" strokeWidth="1.5" />
            
            {/* Lanyard Hole */}
            <circle cx="22" cy="32" r="5" fill="#09090B" stroke="#E31B23" strokeWidth="1.5" />
            
            {/* Laser Etched Metric Ruler */}
            <line x1="38" y1="20" x2="170" y2="20" stroke="#E31B23" strokeWidth="0.8" />
            {[...Array(14)].map((_, i) => (
              <line key={i} x1={42 + i * 9} y1="20" x2={42 + i * 9} y2={i % 2 === 0 ? 27 : 24} stroke="#D4D4D8" strokeWidth="0.7" />
            ))}
            <text x="105" y="38" fill="#F4F4F5" fontSize="7.5" fontFamily="'JetBrains Mono', monospace" fontWeight="800" letterSpacing="1">
              HIM. // TORAY CARBON SPEC 06
            </text>

            {/* Comb Teeth (Wide on left, fine on right) */}
            {/* Wide Teeth */}
            {[...Array(9)].map((_, i) => (
              <rect key={`w-${i}`} x={38 + i * 7} y="44" width="3.2" height="42" rx="1" fill="#242428" stroke="#3F3F46" strokeWidth="0.5" />
            ))}
            {/* Transition marker */}
            <rect x="103" y="44" width="2" height="42" fill="#E31B23" />
            {/* Fine Teeth */}
            {[...Array(20)].map((_, i) => (
              <rect key={`f-${i}`} x={108 + i * 3.1} y="44" width="1.6" height="42" rx="0.5" fill="#1C1C20" stroke="#27272A" strokeWidth="0.3" />
            ))}
          </g>
        </svg>
      )}

      {artType === 'carabiner' && (
        <svg viewBox="0 0 200 240" className="w-48 h-48 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="flaskBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#121214" />
              <stop offset="40%" stopColor="#222226" />
              <stop offset="70%" stopColor="#171719" />
              <stop offset="100%" stopColor="#0B0B0C" />
            </linearGradient>
            <linearGradient id="carabinerAlu" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A2A2E" />
              <stop offset="50%" stopColor="#3F3F46" />
              <stop offset="100%" stopColor="#18181A" />
            </linearGradient>
          </defs>
          {/* Tactical 304 Stainless Flask */}
          <path d="M 45 92 Q 45 80 60 78 L 115 78 Q 130 80 130 92 L 126 195 Q 126 205 112 205 L 62 205 Q 48 205 45 195 Z" fill="url(#flaskBody)" stroke="#3F3F46" strokeWidth="2" />
          {/* Flask Knurled Spout Cap */}
          <rect x="74" y="62" width="26" height="16" rx="2" fill="#27272A" stroke="#52525B" strokeWidth="1.5" />
          <line x1="74" y1="70" x2="100" y2="70" stroke="#E31B23" strokeWidth="1.5" />
          <rect x="82" y="56" width="10" height="6" fill="#18181B" />

          {/* Flask Stencil Graphics */}
          <circle cx="87" cy="130" r="24" fill="none" stroke="#E31B23" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="87" y1="102" x2="87" y2="158" stroke="#E31B23" strokeWidth="0.8" strokeOpacity="0.7" />
          <line x1="59" y1="130" x2="115" y2="130" stroke="#E31B23" strokeWidth="0.8" strokeOpacity="0.7" />
          <text x="87" y="126" fill="#F4F4F5" fontSize="11" fontFamily="'Syne', sans-serif" fontWeight="800" textAnchor="middle">
            HIM.
          </text>
          <text x="87" y="136" fill="#A1A1AA" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            6 OZ / 304 SS
          </text>
          <text x="87" y="175" fill="#71717A" fontSize="6" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            SPEC 07 // MATTE
          </text>

          {/* 35kN Carabiner (Right Forefront) */}
          <g transform="translate(112, 35) rotate(15)">
            <path d="M 12 18 C 12 6, 42 6, 46 22 L 48 85 C 48 100, 20 102, 14 88 L 12 18 Z" fill="none" stroke="url(#carabinerAlu)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            {/* Gate Section in Safety Orange */}
            <rect x="42" y="38" width="10" height="34" rx="2" fill="#E31B23" stroke="#000" strokeWidth="1" />
            <line x1="44" y1="46" x2="50" y2="46" stroke="#000" strokeWidth="1.5" />
            <line x1="44" y1="54" x2="50" y2="54" stroke="#000" strokeWidth="1.5" />
            <line x1="44" y1="62" x2="50" y2="62" stroke="#000" strokeWidth="1.5" />
            <text x="26" y="60" fill="#E4E4E7" fontSize="5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" transform="rotate(-90 26 60)">
              35kN HIM.
            </text>
          </g>
        </svg>
      )}

      {/* SPEC 08: MEN'S DEEP CLEANSE & MUSCLE RECOVERY SCRUB BAR (ON VOLCANIC BASALT ROCK) */}
      {artType === 'scrub_bar' && (
        <svg viewBox="0 0 200 240" className="w-48 h-52 drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]">
          <defs>
            <linearGradient id="volcanicRock" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1C1C1E" />
              <stop offset="50%" stopColor="#0F0F10" />
              <stop offset="100%" stopColor="#080809" />
            </linearGradient>
            <linearGradient id="boxFront" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#171719" />
              <stop offset="50%" stopColor="#1E1E22" />
              <stop offset="100%" stopColor="#111113" />
            </linearGradient>
            <linearGradient id="orangeSpine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C4141B" />
              <stop offset="70%" stopColor="#E31B23" />
              <stop offset="100%" stopColor="#D94400" />
            </linearGradient>
            <radialGradient id="steamMist" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E31B23" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#71717A" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Steaming Ambient Glow & Volcanic Heat Mist */}
          <ellipse cx="100" cy="195" rx="85" ry="30" fill="url(#steamMist)" />

          {/* Volcanic Basalt Rock Base */}
          <path d="M 15 195 Q 35 180 70 188 Q 110 178 145 185 Q 185 182 190 205 Q 170 225 120 228 Q 60 230 18 215 Z" fill="url(#volcanicRock)" stroke="#27272A" strokeWidth="1.5" />
          <path d="M 30 198 Q 75 190 120 196 Q 160 192 175 204" stroke="#E31B23" strokeWidth="0.75" strokeOpacity="0.5" fill="none" strokeDasharray="3 3" />
          {/* Rock surface texture speckles */}
          <circle cx="50" cy="202" r="1.5" fill="#3F3F46" />
          <circle cx="85" cy="210" r="1" fill="#E31B23" fillOpacity="0.8" />
          <circle cx="140" cy="208" r="1.8" fill="#3F3F46" />
          <circle cx="160" cy="202" r="1.2" fill="#52525B" />

          {/* Isometric Scrub Bar Box (3D Angle) */}
          {/* Left Orange Spine */}
          <path d="M 45 65 L 75 52 L 75 178 L 45 190 Z" fill="url(#orangeSpine)" stroke="#E31B23" strokeWidth="1" />
          {/* Top Flap */}
          <polygon points="45,65 75,52 155,62 125,75" fill="#2A2A2E" stroke="#3F3F46" strokeWidth="1" />
          {/* Top Flap Orange Accent Edge */}
          <line x1="45" y1="65" x2="75" y2="52" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />

          {/* Main Front Face (Matte Black Box) */}
          <polygon points="75,52 155,62 155,188 75,178" fill="url(#boxFront)" stroke="#27272A" strokeWidth="1.2" />

          {/* Orange Spine Stencil Text */}
          <g transform="translate(48, 72)">
            <text x="0" y="0" fill="#FFFFFF" fontSize="4.2" fontFamily="'Syne', sans-serif" fontWeight="800" letterSpacing="0.3">
              REVITALIZING
            </text>
            <text x="0" y="5.5" fill="#FFFFFF" fontSize="4" fontFamily="'Syne', sans-serif" fontWeight="800">
              EXFOLIANT BAR
            </text>
            <text x="0" y="10.5" fill="#000000" fontSize="3.2" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
              CONCENTRATED FORMULA
            </text>

            {/* him lowercase logo */}
            <text x="0" y="28" fill="#FFFFFF" fontSize="9" fontFamily="'Syne', sans-serif" fontWeight="900" letterSpacing="-0.5">
              him
            </text>
            <text x="0" y="34.5" fill="#000000" fontSize="3.4" fontFamily="'JetBrains Mono', monospace" fontWeight="800">
              DEFINE YOUR
            </text>
            <text x="0" y="38.5" fill="#000000" fontSize="3.4" fontFamily="'JetBrains Mono', monospace" fontWeight="800">
              RECOVERY.
            </text>

            <text x="0" y="68" fill="#FFFFFF" fontSize="3.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
              MASTER
            </text>
            <text x="0" y="72.5" fill="#FFFFFF" fontSize="3.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
              FORMULATION
            </text>
            <text x="0" y="77" fill="#000000" fontSize="3" fontFamily="'JetBrains Mono', monospace" fontWeight="800">
              CONCENTRATED FORMULA
            </text>
          </g>

          {/* Main Box Front: Massive Vertical Orange Stencil "HIM." */}
          <g transform="translate(136, 172) rotate(-90)">
            <text x="0" y="0" fill="#E31B23" fontSize="28" fontFamily="'Syne', sans-serif" fontWeight="900" letterSpacing="2">
              HIM.
            </text>
          </g>

          {/* Front Face Stencil: MEN'S DEEP CLEANSE & MUSCLE RECOVERY SCRUB BAR */}
          <g transform="translate(82, 130)">
            <text x="0" y="0" fill="#FFFFFF" fontSize="5.2" fontFamily="'JetBrains Mono', monospace" fontWeight="800" letterSpacing="0.4">
              MEN'S
            </text>
            <text x="0" y="7" fill="#FFFFFF" fontSize="5.2" fontFamily="'JetBrains Mono', monospace" fontWeight="800" letterSpacing="0.4">
              DEEP CLEANSE
            </text>
            <text x="0" y="14" fill="#FFFFFF" fontSize="5.2" fontFamily="'JetBrains Mono', monospace" fontWeight="800" letterSpacing="0.4">
              & MUSCLE
            </text>
            <text x="0" y="21" fill="#FFFFFF" fontSize="5.2" fontFamily="'JetBrains Mono', monospace" fontWeight="800" letterSpacing="0.4">
              RECOVERY
            </text>
            <text x="0" y="28" fill="#E31B23" fontSize="5.5" fontFamily="'JetBrains Mono', monospace" fontWeight="900" letterSpacing="0.5">
              SCRUB BAR
            </text>
          </g>

          {/* Water Droplets on Packaging (Hyper-realistic details) */}
          <circle cx="82" cy="78" r="2" fill="#FFFFFF" fillOpacity="0.8" />
          <ellipse cx="140" cy="95" rx="1.8" ry="2.5" fill="#FFFFFF" fillOpacity="0.75" />
          <circle cx="120" cy="165" r="1.5" fill="#FFFFFF" fillOpacity="0.7" />
          <circle cx="58" cy="115" r="1.8" fill="#FFFFFF" fillOpacity="0.85" />
        </svg>
      )}

      {/* SPEC 09: STRENGTH & GROWTH BEARD SERUM (PRECISION DROPPER + HEAVY FLACON) */}
      {artType === 'beard_serum' && (
        <svg viewBox="0 0 200 240" className="w-48 h-52 drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]">
          <defs>
            <linearGradient id="amberGlass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2D1807" />
              <stop offset="30%" stopColor="#663300" />
              <stop offset="60%" stopColor="#442200" />
              <stop offset="100%" stopColor="#1A0D03" />
            </linearGradient>
            <linearGradient id="outerBoxGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1F1F22" />
              <stop offset="50%" stopColor="#28282D" />
              <stop offset="100%" stopColor="#141416" />
            </linearGradient>
            <linearGradient id="dropperPipette" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#A1A1AA" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Background Outer Carton (Slanted Behind Bottle) */}
          <polygon points="110,40 160,35 168,190 118,198" fill="url(#outerBoxGrad)" stroke="#3F3F46" strokeWidth="1" />
          {/* Outer Carton Orange Stripe */}
          <polygon points="152,36 160,35 168,190 160,192" fill="#E31B23" />
          {/* Carton Vertical Stencil */}
          <g transform="translate(138, 175) rotate(-90)">
            <text x="0" y="0" fill="#F4F4F5" fontSize="12" fontFamily="'Syne', sans-serif" fontWeight="900" letterSpacing="1">
              HIM. BEARD
            </text>
            <text x="0" y="9" fill="#E31B23" fontSize="5.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
              STRENGTH & GROWTH // 50ML
            </text>
          </g>

          {/* Heavy Amber Glass Bottle (Foreground) */}
          {/* Rubber Suction Bulb */}
          <path d="M 68 28 Q 68 12 78 12 Q 88 12 88 28 Z" fill="#141416" stroke="#27272A" strokeWidth="1" />
          
          {/* Knurled Collar Ring */}
          <rect x="64" y="28" width="28" height="18" rx="2" fill="#242428" stroke="#3F3F46" strokeWidth="1.2" />
          <line x1="64" y1="34" x2="92" y2="34" stroke="#E31B23" strokeWidth="1" />
          <line x1="64" y1="40" x2="92" y2="40" stroke="#18181A" strokeWidth="1" />
          {/* Grip Ribs on Cap */}
          <line x1="70" y1="28" x2="70" y2="46" stroke="#18181A" strokeWidth="1" />
          <line x1="76" y1="28" x2="76" y2="46" stroke="#18181A" strokeWidth="1" />
          <line x1="82" y1="28" x2="82" y2="46" stroke="#18181A" strokeWidth="1" />
          <line x1="86" y1="28" x2="86" y2="46" stroke="#18181A" strokeWidth="1" />

          {/* Bottle Neck */}
          <rect x="69" y="46" width="18" height="8" fill="#1A0D03" />

          {/* Bottle Shoulders and Cylindrical Body */}
          <path d="M 48 72 Q 48 54 69 54 L 87 54 Q 108 54 108 72 L 108 190 Q 108 196 100 196 L 56 196 Q 48 196 48 190 Z" fill="url(#amberGlass)" stroke="#442200" strokeWidth="1.5" />

          {/* Glass Gloss Reflection */}
          <path d="M 52 74 L 52 188 Q 52 192 56 192 L 58 192 L 58 74 Q 58 64 68 60 L 65 57 Q 52 62 52 74 Z" fill="#FFFFFF" fillOpacity="0.25" />

          {/* Safety Orange Tech Spec Label */}
          <rect x="52" y="85" width="52" height="88" fill="#101012" stroke="#E31B23" strokeWidth="1" />
          {/* Top Label Orange Bar */}
          <rect x="52" y="85" width="52" height="14" fill="#E31B23" />
          <text x="78" y="95" fill="#000000" fontSize="7.5" fontFamily="'Syne', sans-serif" fontWeight="900" textAnchor="middle">
            HIM.
          </text>
          
          {/* Label Body Text */}
          <text x="78" y="108" fill="#F4F4F5" fontSize="5" fontFamily="'JetBrains Mono', monospace" fontWeight="800" textAnchor="middle">
            STRENGTH & GROWTH
          </text>
          <text x="78" y="116" fill="#E31B23" fontSize="5.5" fontFamily="'JetBrains Mono', monospace" fontWeight="800" textAnchor="middle">
            BEARD SERUM
          </text>
          
          <line x1="58" y1="122" x2="98" y2="122" stroke="#27272A" strokeWidth="1" />
          
          <text x="78" y="130" fill="#A1A1AA" fontSize="4.5" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            BIOTIN + CASTOR OIL
          </text>
          <text x="78" y="138" fill="#71717A" fontSize="4" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            FOLLICLE DENSITY 50ML
          </text>

          {/* Tactical Barcode Stencil */}
          <g transform="translate(62, 146)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#E31B23" strokeWidth="1" />
            <line x1="3" y1="0" x2="3" y2="12" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="7" y1="0" x2="7" y2="12" stroke="#E31B23" strokeWidth="0.8" />
            <line x1="11" y1="0" x2="11" y2="12" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="16" y1="0" x2="16" y2="12" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="22" y1="0" x2="22" y2="12" stroke="#E31B23" strokeWidth="1" />
            <line x1="27" y1="0" x2="27" y2="12" stroke="#FFFFFF" strokeWidth="1.2" />
            <line x1="31" y1="0" x2="31" y2="12" stroke="#E31B23" strokeWidth="1" />
          </g>

          <text x="78" y="166" fill="#52525B" fontSize="4" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            SPEC 09 // MIL-BRD
          </text>
        </svg>
      )}
    </div>
  );
};
