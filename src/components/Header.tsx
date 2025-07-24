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

          {/* Centered Logo - Made bigger and higher */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-4">
            <img
              src="/logo.svg"
              alt="MOBOUR"
              className="h-16 sm:h-20 w-auto cursor-pointer hover:opacity-75 transition-opacity bg-transparent"
              style={{ mixBlendMode: 'multiply' }}
              onClick={handleLogoClick}
              loading="eager"
            />
          </div>

          {/* Burger menu with proper dropdown positioning */}
          <div className="relative">
            <button
              onClick={handleMenuToggle}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Dropdown positioned relative to burger button */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <nav className="p-2 space-y-1" role="navigation">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
