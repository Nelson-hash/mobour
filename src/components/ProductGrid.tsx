import React, { useState, useMemo, useCallback } from 'react';
import { Filter, Grid, List } from 'lucide-react';
import { Product } from '../types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title: string;
  onViewProduct: (product: Product) => void;
  showFilters?: boolean;
}

// Component for "SOON" placeholder cards
const SoonCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full animate-shimmer"></div>
      <span className="text-2xl font-light text-gray-500 tracking-widest z-10">SOON</span>
    </div>
    <div className="p-6">
      <div className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
        MOBILIER
      </div>
      <h3 className="text-xl font-light text-gray-400">
        À venir
      </h3>
    </div>
  </div>
);

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  title, 
  onViewProduct, 
  showFilters = false 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Memoize categories to avoid recalculation
  const categories = useMemo(() => {
    return ['Tous', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // Memoize filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => selectedCategory === 'Tous' || product.category === selectedCategory)
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  }, [products, selectedCategory, sortBy]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  // Create the 2x2 grid with products + SOON placeholders
  const gridItems = useMemo(() => {
    const items = [...filteredProducts];
    
    // Fill remaining slots with SOON placeholders up to 4 total
    while (items.length < 4) {
      items.push(null);
    }
    
    return items.slice(0, 4); // Ensure exactly 4 items
  }, [filteredProducts]);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4">
          {title}
        </h2>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 bg-gray-50 p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Trier par nom</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Products Count */}
      {showFilters && (
        <div className="mb-6 text-sm text-gray-600">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
        </div>
      )}

      {/* 2x2 Products Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-8 sm:gap-12 md:gap-16">
          {gridItems.map((product, index) => (
            <div key={product?.id || `soon-${index}`} className="animate-fade-in-up">
              {product ? (
                <ProductCard 
                  product={product} 
                  onViewProduct={onViewProduct}
                />
              ) : (
                <SoonCard />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* No Products */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Filter className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </section>
  );
};

export default ProductGrid;
