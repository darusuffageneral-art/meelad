import React from 'react';

interface ArtFestLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showGlow?: boolean;
  className?: string;
  variant?: 'badge' | 'light' | 'transparent_white';
}

export const ArtFestLogo: React.FC<ArtFestLogoProps> = ({
  size = 'md',
  showGlow = false,
  variant = 'badge',
  className = ''
}) => {
  const sizeMap = {
    xs: 'h-8 px-2 py-0.5',
    sm: 'h-11 px-3 py-1',
    md: 'h-16 px-4 py-1.5',
    lg: 'h-22 px-6 py-2',
    xl: 'h-28 px-8 py-2.5',
    '2xl': 'h-36 px-10 py-3'
  };

  const containerClasses = sizeMap[size] || sizeMap.md;

  // Exact authentic dark purple tone from original eff_2.jpg logo
  const LOGO_PURPLE = '#252048';

  if (variant === 'transparent_white') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        {showGlow && (
          <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md pointer-events-none" />
        )}
        <svg
          className="h-full w-auto max-w-full select-none"
          viewBox="0 0 520 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#FFFFFF">
            <path
              d="M 125 105 C 122 138 102 148 78 145 C 50 142 35 125 35 98 C 35 58 65 32 100 32 C 128 32 142 48 138 72 C 135 88 122 96 102 96 C 82 96 70 85 75 70 C 78 60 88 54 100 55 C 110 56 112 64 116 72 C 115 76 110 80 102 80 C 95 80 90 75 92 70 C 93 67 96 65 100 65 C 102 65 104 67 103 69"
              stroke="#FFFFFF"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="82" cy="52" r="3.5" fill="#001F3F" />
            <circle cx="94" cy="46" r="3.5" fill="#001F3F" />
            <circle cx="106" cy="49" r="3.5" fill="#001F3F" />
            <circle cx="115" cy="58" r="3.5" fill="#001F3F" />
            <path d="M 32 108 C 28 110 26 115 28 120 C 30 124 35 122 36 116 Z" fill="#FFFFFF" />
            <path
              d="M 142 62 L 138 152 C 138 152 165 130 180 115 C 195 100 198 78 182 66 C 168 56 145 60 142 62 Z M 160 76 C 172 74 178 84 172 96 C 166 106 156 110 146 110 L 148 78 C 152 76 156 76 160 76 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 188 45 C 205 28 238 28 252 48 C 262 62 258 84 242 94 L 265 142 C 265 142 248 145 238 128 L 222 96 L 210 96 L 208 142 L 188 142 Z M 210 52 L 210 80 L 228 80 C 238 80 244 72 242 64 C 240 56 228 52 210 52 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 278 72 L 278 142 L 298 142 L 298 96 C 298 84 308 76 320 78 C 330 80 335 90 335 102 L 335 142 L 355 142 L 355 96 C 355 74 338 60 318 62 C 302 64 290 72 282 82 L 278 72 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 372 72 C 358 72 346 84 346 102 C 346 122 360 135 376 135 C 388 135 398 126 404 115 L 404 125 C 404 150 388 162 362 160 C 345 158 335 148 332 140 L 315 146 C 322 164 340 178 368 178 C 405 178 425 156 425 118 L 425 72 L 405 72 L 405 85 C 398 76 386 72 372 72 Z M 378 88 C 390 88 398 96 398 105 C 398 116 390 122 378 122 C 366 122 358 114 358 105 C 358 94 366 88 378 88 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 425 80 C 440 60 470 30 500 42 C 510 46 505 58 488 62 C 460 68 435 78 425 80 Z"
              fill="#FFFFFF"
            />
          </g>

          <g transform="translate(130, 22) rotate(-35)" fill="#FFFFFF">
            <path d="M 0 0 L 35 -6 L 38 -2 L 3 4 Z" fill="#FFFFFF" />
            <rect x="35" y="-7" width="8" height="7" rx="1" fill="#FFFFFF" />
            <path d="M 43 -7 C 48 -7 55 -3 58 0 C 55 3 48 3 43 0 Z" fill="#FFFFFF" />
            <circle cx="62" cy="2" r="2.5" fill="#FFFFFF" />
            <circle cx="67" cy="-2" r="1.8" fill="#FFFFFF" />
          </g>

          <text
            x="260"
            y="205"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="23"
            fontWeight="500"
            fontFamily="'Courier New', Courier, monospace, sans-serif"
            letterSpacing="0.28em"
          >
            meelad art fest
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer Ambient Glow */}
      {showGlow && (
        <div className="absolute inset-0 rounded-2xl bg-white/25 blur-lg pointer-events-none" />
      )}

      {/* Crisp Authentic White Badge Container (Ensuring 100% fidelity to eff_2.jpg dark purple #252048 logo) */}
      <div className={`relative flex items-center justify-center bg-white rounded-2xl border border-slate-200/90 shadow-xl ${containerClasses}`}>
        <svg
          className="h-full w-auto max-w-full select-none"
          viewBox="0 0 520 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* --- MAIN WORD: SpRng in authentic dark purple (#252048) --- */}
          <g fill={LOGO_PURPLE}>
            {/* Letter S with artist palette in top loop */}
            <path
              d="M 125 105 C 122 138 102 148 78 145 C 50 142 35 125 35 98 C 35 58 65 32 100 32 C 128 32 142 48 138 72 C 135 88 122 96 102 96 C 82 96 70 85 75 70 C 78 60 88 54 100 55 C 110 56 112 64 116 72 C 115 76 110 80 102 80 C 95 80 90 75 92 70 C 93 67 96 65 100 65 C 102 65 104 67 103 69"
              stroke={LOGO_PURPLE}
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Palette Holes in S (white cutouts) */}
            <circle cx="82" cy="52" r="3.5" fill="#FFFFFF" />
            <circle cx="94" cy="46" r="3.5" fill="#FFFFFF" />
            <circle cx="106" cy="49" r="3.5" fill="#FFFFFF" />
            <circle cx="115" cy="58" r="3.5" fill="#FFFFFF" />

            {/* Drip under S */}
            <path d="M 32 108 C 28 110 26 115 28 120 C 30 124 35 122 36 116 Z" fill={LOGO_PURPLE} />

            {/* Letter p */}
            <path
              d="M 142 62 L 138 152 C 138 152 165 130 180 115 C 195 100 198 78 182 66 C 168 56 145 60 142 62 Z M 160 76 C 172 74 178 84 172 96 C 166 106 156 110 146 110 L 148 78 C 152 76 156 76 160 76 Z"
              fill={LOGO_PURPLE}
            />

            {/* Letter R with sweeping top */}
            <path
              d="M 188 45 C 205 28 238 28 252 48 C 262 62 258 84 242 94 L 265 142 C 265 142 248 145 238 128 L 222 96 L 210 96 L 208 142 L 188 142 Z M 210 52 L 210 80 L 228 80 C 238 80 244 72 242 64 C 240 56 228 52 210 52 Z"
              fill={LOGO_PURPLE}
            />

            {/* Letter n */}
            <path
              d="M 278 72 L 278 142 L 298 142 L 298 96 C 298 84 308 76 320 78 C 330 80 335 90 335 102 L 335 142 L 355 142 L 355 96 C 355 74 338 60 318 62 C 302 64 290 72 282 82 L 278 72 Z"
              fill={LOGO_PURPLE}
            />

            {/* Letter g with sweeping tail */}
            <path
              d="M 372 72 C 358 72 346 84 346 102 C 346 122 360 135 376 135 C 388 135 398 126 404 115 L 404 125 C 404 150 388 162 362 160 C 345 158 335 148 332 140 L 315 146 C 322 164 340 178 368 178 C 405 178 425 156 425 118 L 425 72 L 405 72 L 405 85 C 398 76 386 72 372 72 Z M 378 88 C 390 88 398 96 398 105 C 398 116 390 122 378 122 C 366 122 358 114 358 105 C 358 94 366 88 378 88 Z"
              fill={LOGO_PURPLE}
            />

            {/* Tail loop on g */}
            <path
              d="M 425 80 C 440 60 470 30 500 42 C 510 46 505 58 488 62 C 460 68 435 78 425 80 Z"
              fill={LOGO_PURPLE}
            />
          </g>

          {/* --- PAINTBRUSH ABOVE p & R (matching original dark purple) --- */}
          <g transform="translate(130, 22) rotate(-35)" fill={LOGO_PURPLE}>
            {/* Handle */}
            <path d="M 0 0 L 35 -6 L 38 -2 L 3 4 Z" fill={LOGO_PURPLE} />
            {/* Ferrule */}
            <rect x="35" y="-7" width="8" height="7" rx="1" fill={LOGO_PURPLE} />
            {/* Bristles / Tip */}
            <path d="M 43 -7 C 48 -7 55 -3 58 0 C 55 3 48 3 43 0 Z" fill={LOGO_PURPLE} />
            {/* Paint Splashes */}
            <circle cx="62" cy="2" r="2.5" fill={LOGO_PURPLE} />
            <circle cx="67" cy="-2" r="1.8" fill={LOGO_PURPLE} />
          </g>

          {/* --- SUBTITLE: meelad art fest in authentic original thin typewriter font --- */}
          <text
            x="260"
            y="205"
            textAnchor="middle"
            fill={LOGO_PURPLE}
            fontSize="23"
            fontWeight="400"
            fontFamily="'Courier New', Courier, monospace, sans-serif"
            letterSpacing="0.28em"
          >
            meelad art fest
          </text>
        </svg>
      </div>
    </div>
  );
};







