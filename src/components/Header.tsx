import React, { useState, useCallback, useMemo } from 'react';
import { Menu, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';

interface HeaderProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onPageChange, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems, isLoading } = useCart();

  // Memoize menu items to prevent unnecessary re-renders
  const menuItems = useMemo(() => [
    { label: 'Accueil', page: 'home' },
    { label: 'Catalogue', page: 'catalog' },
    { label: 'À propos', page: 'about' },
    { label: 'Contact', page: 'contact' },
    { label: 'Panier', page: 'cart' },
  ], []);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleMenuItemClick = useCallback((page: string) => {
    onPageChange(page);
    setIsMenuOpen(false);
  }, [onPageChange]);

  const handleLogoClick = useCallback(() => {
    onPageChange('home');
  }, [onPageChange]);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between pt-6" style={{ minHeight: '160px' }}>
          {/* MOBOUR Text - Left - Made bigger */}
          <div 
            className="text-3xl sm:text-4xl font-bold text-gray-900 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={handleLogoClick}
          >
            MOBOUR
          </div>

          {/* Centered Logo - Made bigger */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div 
              className="cursor-pointer hover:opacity-75 transition-opacity"
              onClick={handleLogoClick}
            >
              <img 
                src="/logo.svg" 
                alt="MOBOUR" 
                className="h-16 sm:h-20 w-auto"
                style={{ 
                  background: 'transparent',
                  mixBlendMode: 'multiply' 
                }}
                loading="eager"
              />
            </div>
          </div>

          {/* Burger Menu Button - Right - Made bigger */}
          <button
            onClick={handleMenuToggle}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-white border-t border-gray-100 shadow-lg">
          <nav className="px-4 py-2 space-y-1" role="navigation">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleMenuItemClick(item.page)}
                className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === item.page 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.label}</span>
                {item.page === 'cart' && !isLoading && totalItems > 0 && (
                  <span 
                    className="bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    aria-label={`${totalItems} article${totalItems > 1 ? 's' : ''} dans le panier`}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
