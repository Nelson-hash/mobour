import React, { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { useCart } from '../hooks/useCart';

interface HeaderProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onPageChange, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems } = useCart();

  const menuItems = [
    { label: 'Accueil', page: 'home' },
    { label: 'Catalogue', page: 'catalog' },
    { label: 'À propos', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  const totalItems = getTotalItems();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors"
            onClick={() => onPageChange('home')}
          >
            MOBOUR
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onPageChange(item.page)}
                className={`text-sm font-medium transition-colors hover:text-gray-900 ${
                  currentPage === item.page ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={() => onPageChange('cart')}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 8.32a1 1 0 001 1.18h9.36a1 1 0 001-1.18L15 13M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"
                  />
                </svg>
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-2 space-y-1">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onPageChange(item.page);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === item.page 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Mobile Cart */}
            <button
              onClick={() => {
                onPageChange('cart');
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <span>Panier</span>
              {totalItems > 0 && (
                <span className="bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
