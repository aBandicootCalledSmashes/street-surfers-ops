const MapBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Subtle grid pattern to simulate city map */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground"
            />
          </pattern>
          <pattern
            id="roads"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* Main roads */}
            <line x1="0" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="2" className="text-foreground" />
            <line x1="60" y1="0" x2="60" y2="120" stroke="currentColor" strokeWidth="2" className="text-foreground" />
            {/* Secondary roads */}
            <line x1="0" y1="30" x2="120" y2="30" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
            <line x1="0" y1="90" x2="120" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
            <line x1="30" y1="0" x2="30" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
            <line x1="90" y1="0" x2="90" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#roads)" />
      </svg>

      {/* Abstract route lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* Curved route paths */}
        <path
          d="M 10 90 Q 30 70 50 50 T 90 10"
          fill="none"
          stroke="hsl(7, 100%, 41%)"
          strokeWidth="0.3"
        />
        <path
          d="M 0 60 Q 25 45 45 35 T 100 20"
          fill="none"
          stroke="hsl(7, 100%, 41%)"
          strokeWidth="0.2"
        />
        <path
          d="M 20 100 Q 40 75 60 60 T 100 40"
          fill="none"
          stroke="hsl(7, 100%, 41%)"
          strokeWidth="0.25"
        />
        
        {/* Intersection dots */}
        <circle cx="50" cy="50" r="0.5" fill="hsl(7, 100%, 41%)" opacity="0.6" />
        <circle cx="30" cy="70" r="0.3" fill="hsl(7, 100%, 41%)" opacity="0.4" />
        <circle cx="70" cy="30" r="0.4" fill="hsl(7, 100%, 41%)" opacity="0.5" />
        <circle cx="45" cy="35" r="0.3" fill="hsl(7, 100%, 41%)" opacity="0.3" />
        <circle cx="60" cy="60" r="0.35" fill="hsl(7, 100%, 41%)" opacity="0.4" />
      </svg>

      {/* Radial gradient overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(0, 0%, 0%) 70%)',
        }}
      />
      
      {/* Subtle vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(0, 0%, 0%) 100%)',
        }}
      />
    </div>
  );
};

export default MapBackground;
