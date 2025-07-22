import React, { Suspense } from 'react';
import Floating3DObjects from './Floating3DObjects';

interface HeroProps {
  onPageChange: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onPageChange }) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Real Concrete Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/concrete-background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Fallback concrete texture if image doesn't load */}
        <div className="absolute inset-0 bg-gray-400 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Cg fill=%22none%22 stroke=%22%23000%22 stroke-width=%220.5%22 stroke-opacity=%220.08%22%3E%3Cpath d=%22M10 10L20 20M30 10L40 20M50 10L60 20M70 10L80 20M90 10L100 20M110 10L120 20M130 10L140 20M150 10L160 20M170 10L180 20M190 10L200 20M10 30L20 40M30 30L40 40M50 30L60 40M70 30L80 40M90 30L100 40M110 30L120 40M130 30L140 40M150 30L160 40M170 30L180 40M190 30L200 40%22/%3E%3C/g%3E%3Cg fill=%22%23000%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2225%22 cy=%2225%22 r=%221%22/%3E%3Ccircle cx=%2275%22 cy=%2275%22 r=%221.5%22/%3E%3Ccircle cx=%22125%22 cy=%22125%22 r=%220.5%22/%3E%3Ccircle cx=%22175%22 cy=%22175%22 r=%221%22/%3E%3Ccircle cx=%2250%22 cy=%22150%22 r=%220.8%22/%3E%3Ccircle cx=%22150%22 cy=%2250%22 r=%221.2%22/%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
        
        {/* Smooth transition to white at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" 
             style={{
               background: `linear-gradient(to bottom, 
                 transparent 0%, 
                 transparent 45%, 
                 rgba(255,255,255,0.1) 55%, 
                 rgba(255,255,255,0.3) 65%, 
                 rgba(255,255,255,0.6) 75%, 
                 rgba(255,255,255,0.85) 85%, 
                 rgba(255,255,255,1) 90%)`
             }}>
        </div>
        
        {/* Subtle overlay for better contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-5"></div>
      </div>

      {/* 3D Ashtrays Only */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-12 h-12 border-3 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Floating3DObjects />
      </Suspense>
    </section>
  );
};

export default Hero;
