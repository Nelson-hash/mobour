import React, { Suspense, useState, useEffect } from 'react';

// Lazy load the 3D component
const Floating3DObjects = React.lazy(() => import('./Floating3DObjects'));

interface HeroProps {
  onPageChange: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onPageChange }) => {
  const [shouldLoad3D, setShouldLoad3D] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Only load 3D after a delay and check for basic device capabilities
    const timer = setTimeout(() => {
      // More permissive loading - allow on most devices
      if (navigator.hardwareConcurrency > 1 || window.innerWidth >= 768) {
        setShouldLoad3D(true);
      }
    }, 500); // Delay 3D loading

    return () => clearTimeout(timer);
  }, []);

  // Preload the background image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true); // Still set to true to show fallback
    img.src = '/concrete-background.jpg';
  }, []);

  return (
    <>
      {/* CRITICAL: 3D Objects rendered OUTSIDE of Hero section to avoid stacking context */}
      {shouldLoad3D && (
        <Suspense fallback={null}>
          <Floating3DObjects />
        </Suspense>
      )}
      
      {/* Hero section with NO positioning that could affect 3D canvas */}
      <section 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          // CRITICAL: Remove any transforms that create stacking contexts
          transform: 'none',
          willChange: 'auto',
          perspective: 'none',
          transformStyle: 'flat'
        }}
      >
        {/* White background as base */}
        <div className="absolute inset-0 bg-white"></div>
        
        {/* Background with better loading */}
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: imageLoaded ? "url('/concrete-background.jpg')" : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            // CRITICAL: Remove mask transforms that could affect stacking
            WebkitMask: `linear-gradient(to bottom, 
              black 0%, 
              black 20%, 
              rgba(0,0,0,0.8) 30%, 
              rgba(0,0,0,0.6) 40%, 
              rgba(0,0,0,0.4) 50%, 
              rgba(0,0,0,0.2) 60%, 
              rgba(0,0,0,0.1) 70%, 
              transparent 80%)`,
            mask: `linear-gradient(to bottom, 
              black 0%, 
              black 20%, 
              rgba(0,0,0,0.8) 30%, 
              rgba(0,0,0,0.6) 40%, 
              rgba(0,0,0,0.4) 50%, 
              rgba(0,0,0,0.2) 60%, 
              rgba(0,0,0,0.1) 70%, 
              transparent 80%)`,
            // CRITICAL: Ensure no transforms
            transform: 'none',
            willChange: 'auto'
          }}
        >
          {/* Simplified fallback texture */}
          <div 
            className="absolute inset-0 bg-gray-300 opacity-30"
            style={{
              transform: 'none',
              willChange: 'auto'
            }}
          ></div>
          
          {/* Minimal overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-5"
            style={{
              transform: 'none',
              willChange: 'auto'
            }}
          ></div>
        </div>
      </section>
    </>
  );
};

export default Hero;
