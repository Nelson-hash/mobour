import React, { Suspense } from 'react';
import Floating3DObjects from './Floating3DObjects';

interface HeroProps {
  onPageChange: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onPageChange }) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Concrete Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400">
        {/* Concrete texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Cg fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        {/* Additional concrete noise */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%221%22/%3E%3Ccircle cx=%2243%22 cy=%2243%22 r=%221%22/%3E%3Ccircle cx=%2221%22 cy=%2237%22 r=%221%22/%3E%3Ccircle cx=%2236%22 cy=%2214%22 r=%221%22/%3E%3Ccircle cx=%2214%22 cy=%2221%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-400 via-transparent to-gray-200 opacity-30"></div>
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
