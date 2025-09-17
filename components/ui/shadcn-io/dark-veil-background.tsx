import React from 'react';

interface DarkVeilBackgroundProps {
  hueShift?: number;
  scanlineIntensity?: number;
  scanlineFrequency?: number;
  noiseIntensity?: number;
  warpAmount?: number;
  className?: string;
}

export const DarkVeilBackground: React.FC<DarkVeilBackgroundProps> = ({
  hueShift = 0,
  scanlineIntensity = 0.1,
  scanlineFrequency = 2.0,
  noiseIntensity = 0.05,
  warpAmount = 1.0,
  className = ""
}) => {
  const filterId = `dark-veil-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`absolute inset-0 ${className}`}>
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
            {/* Noise texture */}
            <feTurbulence
              baseFrequency={noiseIntensity}
              numOctaves="3"
              result="noise"
            />
            
            {/* Scanlines */}
            <feComponentTransfer result="scanlines">
              <feFuncA
                type="discrete"
                tableValues={Array.from({ length: Math.floor(scanlineFrequency * 10) }, (_, i) => 
                  i % 2 === 0 ? scanlineIntensity : 1
                ).join(' ')}
              />
            </feComponentTransfer>
            
            {/* Hue shift */}
            <feColorMatrix
              type="hueRotate"
              values={hueShift.toString()}
              result="hueShifted"
            />
            
            {/* Warp effect */}
            <feDisplacementMap
              in="hueShifted"
              in2="noise"
              scale={warpAmount}
              result="warped"
            />
            
            {/* Blend with original */}
            <feBlend
              in="warped"
              in2="SourceGraphic"
              mode="multiply"
            />
          </filter>
        </defs>
        
        <rect
          width="100%"
          height="100%"
          fill="url(#darkVeilGradient)"
          filter={`url(#${filterId})`}
        />
        
        <defs>
          <radialGradient id="darkVeilGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0.7)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.9)" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* CSS-based effects overlay */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            linear-gradient(
              ${hueShift}deg,
              hsla(${hueShift}, 20%, 5%, 0.8) 0%,
              hsla(${(hueShift + 60) % 360}, 15%, 8%, 0.6) 50%,
              hsla(${(hueShift + 120) % 360}, 10%, 3%, 0.9) 100%
            )
          `,
          filter: `
            contrast(${1 + warpAmount * 0.2})
            brightness(${0.8 - noiseIntensity})
          `
        }}
      />
      
      {/* Animated scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent ${100 / scanlineFrequency}px,
            rgba(255,255,255,${scanlineIntensity}) ${100 / scanlineFrequency + 1}px,
            rgba(255,255,255,${scanlineIntensity}) ${100 / scanlineFrequency + 2}px
          )`,
          animation: `scanlines ${3 / scanlineFrequency}s linear infinite`
        }}
      />
      
      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(${100 / scanlineFrequency}px); }
        }
      `}</style>
    </div>
  );
};