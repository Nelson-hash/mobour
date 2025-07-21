import React from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  onPageChange: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onPageChange }) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23f5f5f5%22 fill-opacity=%220.4%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gray-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-gray-300/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-blue-100/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 mb-6">
          Mobilier
          <br />
          <span className="font-bold">Industriel</span>
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Des pièces uniques au design épuré pour sublimer votre intérieur avec authenticité
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={() => onPageChange('catalog')}
            className="bg-gray-900 text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Découvrir la Collection
          </button>
          <button
            onClick={() => onPageChange('about')}
            className="border-2 border-gray-900 text-gray-900 px-8 py-4 text-lg font-medium hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            Notre Histoire
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <ArrowDown className="w-6 h-6 text-gray-400" />
      </div>

      {/* Parallax Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-gray-400 rounded-full opacity-60 animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-gray-500 rounded-full opacity-40 animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-gray-600 rounded-full opacity-80 animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </section>
  );
};

export default Hero;
