import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';

interface HeaderProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onPageChange, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();

  const menuItems = [
    { label: 'Accueil', page: 'home' },
    { label: 'Catalogue', page: 'catalog' },
    { label: 'À propos', page: 'about' },
    { label: 'Contact', page: 'contact' },
    { label: 'Panier', page: 'cart' },
  ];

  const totalItems = getTotalItems();

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-32">
          {/* MOBOUR Text - Left */}
          <div 
            className="text-2xl font-bold text-gray-900 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => onPageChange('home')}
          >
            MOBOUR
          </div>

          {/* Centered Logo - Your SVG Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div 
              className="cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => onPageChange('home')}
            >
              <img 
                src="/logo.svg" 
                alt="MOBOUR" 
                className="h-12 w-auto"
                style={{ 
                  background: 'transparent',
                  mixBlendMode: 'multiply' 
                }}
              />
            </div>
          </div>

          {/* Burger Menu Button - Right */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onPageChange(item.page);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === item.page 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.label}</span>
                {item.page === 'cart' && totalItems > 0 && (
                  <span className="bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
